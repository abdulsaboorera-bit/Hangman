const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = Buffer.alloc(w * h * 4);
  }
  blend(x, y, r, g, b, a) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || a <= 0) return;
    const i = (y * this.w + x) * 4;
    const na = a / 255;
    const da = this.data[i + 3] / 255;
    const oa = na + da * (1 - na);
    if (oa <= 0) return;
    this.data[i] = Math.round((r * na + this.data[i] * da * (1 - na)) / oa);
    this.data[i + 1] = Math.round((g * na + this.data[i + 1] * da * (1 - na)) / oa);
    this.data[i + 2] = Math.round((b * na + this.data[i + 2] * da * (1 - na)) / oa);
    this.data[i + 3] = Math.round(oa * 255);
  }
  roundedRect(x0, y0, x1, y1, radius, [r, g, b, a = 255]) {
    for (let y = Math.floor(y0); y < y1; y++) {
      for (let x = Math.floor(x0); x < x1; x++) {
        let inside = true;
        const rx = radius;
        if (x < x0 + rx && y < y0 + rx) inside = (x - (x0 + rx)) ** 2 + (y - (y0 + rx)) ** 2 <= rx * rx;
        else if (x >= x1 - rx && y < y0 + rx) inside = (x - (x1 - rx - 1)) ** 2 + (y - (y0 + rx)) ** 2 <= rx * rx;
        else if (x < x0 + rx && y >= y1 - rx) inside = (x - (x0 + rx)) ** 2 + (y - (y1 - rx - 1)) ** 2 <= rx * rx;
        else if (x >= x1 - rx && y >= y1 - rx) inside = (x - (x1 - rx - 1)) ** 2 + (y - (y1 - rx - 1)) ** 2 <= rx * rx;
        if (inside) this.blend(x, y, r, g, b, a);
      }
    }
  }
  circle(cx, cy, radius, [r, g, b, a = 255]) {
    const r2 = radius * radius;
    for (let y = Math.floor(cy - radius); y <= cy + radius; y++) {
      for (let x = Math.floor(cx - radius); x <= cx + radius; x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) this.blend(x, y, r, g, b, a);
      }
    }
  }
  line(x0, y0, x1, y1, width, [r, g, b, a = 255]) {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0)) * 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.circle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, width / 2, [r, g, b, a]);
    }
  }
  save(file) {
    fs.writeFileSync(file, encodePNG(this.w, this.h, this.data));
  }
}

function gradientBG(c, w, h, radius, top, bottom) {
  for (let y = 0; y < h; y++) {
    const t = y / h;
    const r = Math.round(top[0] + (bottom[0] - top[0]) * t);
    const g = Math.round(top[1] + (bottom[1] - top[1]) * t);
    const b = Math.round(top[2] + (bottom[2] - top[2]) * t);
    for (let x = 0; x < w; x++) {
      let inside = true;
      if (radius > 0) {
        const rx = radius;
        if (x < rx && y < rx) inside = (x - rx) ** 2 + (y - rx) ** 2 <= rx * rx;
        else if (x >= w - rx && y < rx) inside = (x - (w - rx - 1)) ** 2 + (y - rx) ** 2 <= rx * rx;
        else if (x < rx && y >= h - rx) inside = (x - rx) ** 2 + (y - (h - rx - 1)) ** 2 <= rx * rx;
        else if (x >= w - rx && y >= h - rx) inside = (x - (w - rx - 1)) ** 2 + (y - (h - rx - 1)) ** 2 <= rx * rx;
      }
      if (inside) c.blend(x, y, r, g, b, 255);
    }
  }
}

function drawHangmanArt(c, ox, oy, s) {
  const grey = [170, 182, 205, 255];
  const yellow = [255, 214, 90, 255];
  const dark = [35, 42, 60, 255];
  const blue = [116, 185, 255, 255];
  c.line(ox + 8 * s, oy + 96 * s, ox + 72 * s, oy + 96 * s, 7 * s, grey);
  c.line(ox + 22 * s, oy + 96 * s, ox + 22 * s, oy + 14 * s, 7 * s, grey);
  c.line(ox + 22 * s, oy + 14 * s, ox + 64 * s, oy + 14 * s, 7 * s, grey);
  c.line(ox + 64 * s, oy + 14 * s, ox + 64 * s, oy + 28 * s, 7 * s, grey);
  c.line(ox + 22 * s, oy + 30 * s, ox + 40 * s, oy + 14 * s, 5 * s, grey);
  c.circle(ox + 64 * s, oy + 44 * s, 15 * s, yellow);
  c.circle(ox + 59 * s, oy + 41 * s, 2.4 * s, dark);
  c.circle(ox + 69 * s, oy + 41 * s, 2.4 * s, dark);
  c.line(ox + 58 * s, oy + 49 * s, ox + 64 * s, oy + 53 * s, 2.5 * s, dark);
  c.line(ox + 64 * s, oy + 53 * s, ox + 70 * s, oy + 49 * s, 2.5 * s, dark);
  c.line(ox + 64 * s, oy + 59 * s, ox + 64 * s, oy + 78 * s, 6 * s, blue);
  c.line(ox + 64 * s, oy + 65 * s, ox + 50 * s, oy + 76 * s, 5 * s, blue);
  c.line(ox + 64 * s, oy + 65 * s, ox + 78 * s, oy + 76 * s, 5 * s, blue);
  c.line(ox + 64 * s, oy + 78 * s, ox + 53 * s, oy + 94 * s, 5 * s, [162, 155, 254, 255]);
  c.line(ox + 64 * s, oy + 78 * s, ox + 75 * s, oy + 94 * s, 5 * s, [162, 155, 254, 255]);
}

function drawTiles(c, ox, oy, s) {
  const tile = [255, 255, 255, 30];
  const stroke = [255, 255, 255, 90];
  const green = [46, 213, 115, 255];
  for (let i = 0; i < 3; i++) {
    const x = ox + i * 26 * s;
    c.roundedRect(x, oy, x + 22 * s, oy + 26 * s, 5 * s, i === 1 ? green : tile);
    if (i !== 1) {
      c.line(x, oy + 24 * s, x + 22 * s, oy + 24 * s, 2.5 * s, stroke);
    } else {
      c.circle(x + 11 * s, oy + 13 * s, 3.2 * s, [10, 46, 26, 255]);
    }
  }
}

function makeIcon(size, withBG) {
  const c = new Canvas(size, size);
  if (withBG) {
    gradientBG(c, size, size, size * 0.22, [36, 26, 74], [18, 24, 52]);
    c.circle(size * 0.85, size * 0.15, size * 0.28, [255, 107, 107, 18]);
    c.circle(size * 0.1, size * 0.9, size * 0.25, [74, 108, 247, 22]);
    const s = size / 256;
    drawHangmanArt(c, 70 * s, 48 * s, 1.55 * s);
    drawTiles(c, 82 * s, 178 * s, 1.15 * s);
  } else {
    const s = size / 256;
    drawHangmanArt(c, 70 * s, 48 * s, 1.55 * s);
    drawTiles(c, 82 * s, 178 * s, 1.15 * s);
  }
  return c;
}

const assets = path.join(__dirname, '..', 'assets');

const icon = makeIcon(512, true);
icon.save(path.join(assets, 'icon.png'));

const adaptiveFg = new Canvas(512, 512);
const s = 512 / 256;
drawHangmanArt(adaptiveFg, 70 * s, 48 * s, 1.55 * s);
drawTiles(adaptiveFg, 82 * s, 178 * s, 1.15 * s);
adaptiveFg.save(path.join(assets, 'android-icon-foreground.png'));

const adaptiveBg = new Canvas(512, 512);
gradientBG(adaptiveBg, 512, 512, 0, [36, 26, 74], [18, 24, 52]);
adaptiveBg.save(path.join(assets, 'android-icon-background.png'));

const mono = new Canvas(512, 512);
const white = [255, 255, 255, 255];
mono.line(70 * s + 8 * s, 48 * s + 96 * s, 70 * s + 72 * s, 48 * s + 96 * s, 7 * s, white);
mono.line(70 * s + 22 * s, 48 * s + 96 * s, 70 * s + 22 * s, 48 * s + 14 * s, 7 * s, white);
mono.line(70 * s + 22 * s, 48 * s + 14 * s, 70 * s + 64 * s, 48 * s + 14 * s, 7 * s, white);
mono.line(70 * s + 64 * s, 48 * s + 14 * s, 70 * s + 64 * s, 48 * s + 28 * s, 7 * s, white);
mono.circle(70 * s + 64 * s, 48 * s + 44 * s, 15 * s, white);
mono.line(70 * s + 64 * s, 48 * s + 59 * s, 70 * s + 64 * s, 48 * s + 78 * s, 6 * s, white);
mono.line(70 * s + 64 * s, 48 * s + 65 * s, 70 * s + 50 * s, 48 * s + 76 * s, 5 * s, white);
mono.line(70 * s + 64 * s, 48 * s + 65 * s, 70 * s + 78 * s, 48 * s + 76 * s, 5 * s, white);
mono.line(70 * s + 64 * s, 48 * s + 78 * s, 70 * s + 53 * s, 48 * s + 94 * s, 5 * s, white);
mono.line(70 * s + 64 * s, 48 * s + 78 * s, 70 * s + 75 * s, 48 * s + 94 * s, 5 * s, white);
mono.save(path.join(assets, 'android-icon-monochrome.png'));

const favicon = makeIcon(48, true);
favicon.save(path.join(assets, 'favicon.png'));

const splash = new Canvas(512, 512);
const s2 = 512 / 256;
drawHangmanArt(splash, 70 * s2, 48 * s2, 1.55 * s2);
drawTiles(splash, 82 * s2, 178 * s2, 1.15 * s2);
splash.save(path.join(assets, 'splash-icon.png'));

for (const f of ['icon.png', 'android-icon-foreground.png', 'android-icon-background.png', 'android-icon-monochrome.png', 'favicon.png', 'splash-icon.png']) {
  console.log(f, fs.statSync(path.join(assets, f)).size, 'bytes');
}
