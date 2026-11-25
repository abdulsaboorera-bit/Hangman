const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

function osc(type, phase) {
  switch (type) {
    case 'square': return Math.sin(phase) >= 0 ? 1 : -1;
    case 'saw': return 2 * ((phase / (2 * Math.PI)) % 1) - 1;
    case 'triangle': return (2 / Math.PI) * Math.asin(Math.sin(phase));
    case 'pulse25': return ((phase / (2 * Math.PI)) % 1) < 0.25 ? 1 : -1;
    default: return Math.sin(phase);
  }
}

function env(t, dur, attack, decayCurve) {
  const atk = Math.max(0.001, attack);
  if (t < atk) return t / atk;
  const k = (t - atk) / Math.max(0.001, dur - atk);
  if (k >= 1) return 0;
  if (decayCurve === 'exp') return Math.exp(-4.5 * k);
  if (decayCurve === 'bell') return Math.exp(-3.2 * k) * (1 - k * 0.3);
  return 1 - k * k;
}

function render(duration, voiceFn) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = voiceFn(t, i);
  }
  return out;
}

function note({ freq, start, dur, vol = 0.3, type = 'sine', attack = 0.005, curve = 'exp', slideTo = null, detune = 0, harmonics = null }) {
  const offset = Math.floor(start * SAMPLE_RATE);
  const n = Math.floor(dur * SAMPLE_RATE);
  return { offset, samples: render(dur, (t) => {
    let f = freq;
    if (slideTo) f = freq + (slideTo - freq) * Math.min(1, t / dur);
    const ph = 2 * Math.PI * (freq * t + (slideTo ? (slideTo - freq) * t * t / (2 * dur) : 0)) + detune * t;
    let s = osc(type, ph) * 0.6;
    if (harmonics) {
      for (const [mul, amp] of harmonics) s += Math.sin(ph * mul) * amp;
    } else {
      s += Math.sin(ph * 2) * 0.18;
      s += Math.sin(ph * 3) * 0.08;
    }
    return s * vol * env(t, dur, attack, curve);
  }) };
}

function silence(dur) {
  return { offset: 0, samples: new Float64Array(Math.floor(SAMPLE_RATE * dur)) };
}

function mix(duration, ...voices) {
  const total = Math.floor(SAMPLE_RATE * duration);
  const out = new Float64Array(total);
  for (const v of voices) {
    for (let i = 0; i < v.samples.length; i++) {
      const idx = v.offset + i;
      if (idx >= 0 && idx < total) out[idx] += v.samples[i];
    }
  }
  for (let i = 0; i < total; i++) {
    out[i] = Math.tanh(out[i] * 1.15) * 0.92;
  }
  return out;
}

function concat(...parts) {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Float64Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

const N = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98,
  G3: 196.0, A3: 220.0, B3: 246.94, C3: 130.81, E3: 164.81, F3: 174.61, D3: 146.83,
  A2: 110.0, C2: 65.41, G2: 98.0, F2: 87.31, D2: 73.42, E2: 82.41,
};

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

const files = {};

files['click.wav'] = mix(0.09,
  note({ freq: 720, start: 0, dur: 0.05, vol: 0.32, type: 'triangle', curve: 'exp', slideTo: 560 }),
  note({ freq: 1440, start: 0, dur: 0.03, vol: 0.1, type: 'sine', curve: 'exp' })
);

files['type.wav'] = mix(0.05,
  note({ freq: 980, start: 0, dur: 0.03, vol: 0.2, type: 'pulse25', curve: 'exp', slideTo: 780 })
);

files['correct.wav'] = mix(0.32,
  note({ freq: N.C5, start: 0, dur: 0.1, vol: 0.34, type: 'triangle', curve: 'exp', harmonics: [[2, 0.12]] }),
  note({ freq: N.E5, start: 0.07, dur: 0.12, vol: 0.34, type: 'triangle', curve: 'exp', harmonics: [[2, 0.12]] }),
  note({ freq: N.G5, start: 0.14, dur: 0.18, vol: 0.3, type: 'triangle', curve: 'bell', harmonics: [[2, 0.15], [3, 0.06]] })
);

files['wrong.wav'] = mix(0.42,
  note({ freq: 196, start: 0, dur: 0.16, vol: 0.36, type: 'square', curve: 'exp', slideTo: 160 }),
  note({ freq: 98, start: 0.02, dur: 0.3, vol: 0.3, type: 'saw', curve: 'exp', slideTo: 72 }),
  note({ freq: 392, start: 0, dur: 0.1, vol: 0.1, type: 'square', curve: 'exp', detune: 8 })
);

files['win.wav'] = mix(0.95,
  note({ freq: N.C5, start: 0.0, dur: 0.13, vol: 0.34, type: 'triangle', curve: 'exp' }),
  note({ freq: N.E5, start: 0.11, dur: 0.13, vol: 0.34, type: 'triangle', curve: 'exp' }),
  note({ freq: N.G5, start: 0.22, dur: 0.13, vol: 0.34, type: 'triangle', curve: 'exp' }),
  note({ freq: N.C6, start: 0.33, dur: 0.4, vol: 0.36, type: 'triangle', curve: 'bell', harmonics: [[2, 0.2], [3, 0.1]] }),
  note({ freq: N.G5, start: 0.33, dur: 0.4, vol: 0.18, type: 'sine', curve: 'bell' }),
  note({ freq: N.E5, start: 0.5, dur: 0.35, vol: 0.2, type: 'sine', curve: 'bell' }),
  note({ freq: N.C4, start: 0.33, dur: 0.5, vol: 0.22, type: 'triangle', curve: 'bell' })
);

files['lose.wav'] = mix(0.9,
  note({ freq: N.G4, start: 0.0, dur: 0.18, vol: 0.3, type: 'triangle', curve: 'exp' }),
  note({ freq: N.F4, start: 0.15, dur: 0.18, vol: 0.3, type: 'triangle', curve: 'exp' }),
  note({ freq: N.D4, start: 0.3, dur: 0.2, vol: 0.3, type: 'triangle', curve: 'exp' }),
  note({ freq: N.C4, start: 0.48, dur: 0.4, vol: 0.32, type: 'triangle', curve: 'bell', slideTo: N.C4 * 0.75 }),
  note({ freq: N.C3, start: 0.48, dur: 0.4, vol: 0.2, type: 'sine', curve: 'bell' })
);

files['coin.wav'] = mix(0.4,
  note({ freq: N.B5, start: 0, dur: 0.07, vol: 0.32, type: 'square', curve: 'exp' }),
  note({ freq: N.E6, start: 0.06, dur: 0.26, vol: 0.32, type: 'square', curve: 'bell', harmonics: [[2, 0.1]] }),
  note({ freq: N.E5, start: 0.06, dur: 0.26, vol: 0.14, type: 'sine', curve: 'bell' })
);

files['hint.wav'] = mix(0.5,
  note({ freq: N.G5, start: 0, dur: 0.12, vol: 0.28, type: 'sine', curve: 'exp' }),
  note({ freq: N.C6, start: 0.1, dur: 0.12, vol: 0.28, type: 'sine', curve: 'exp' }),
  note({ freq: N.E6, start: 0.2, dur: 0.24, vol: 0.26, type: 'sine', curve: 'bell', harmonics: [[2, 0.12]] })
);

files['pause.wav'] = mix(0.25,
  note({ freq: N.A4, start: 0, dur: 0.1, vol: 0.28, type: 'triangle', curve: 'exp' }),
  note({ freq: N.E4, start: 0.08, dur: 0.15, vol: 0.26, type: 'triangle', curve: 'exp' })
);

files['revive.wav'] = mix(0.7,
  note({ freq: N.C4, start: 0, dur: 0.1, vol: 0.3, type: 'triangle', curve: 'exp' }),
  note({ freq: N.E4, start: 0.09, dur: 0.1, vol: 0.3, type: 'triangle', curve: 'exp' }),
  note({ freq: N.G4, start: 0.18, dur: 0.1, vol: 0.3, type: 'triangle', curve: 'exp' }),
  note({ freq: N.C5, start: 0.27, dur: 0.1, vol: 0.3, type: 'triangle', curve: 'exp' }),
  note({ freq: N.E5, start: 0.36, dur: 0.3, vol: 0.32, type: 'triangle', curve: 'bell', harmonics: [[2, 0.15]] })
);

files['gameover.wav'] = mix(0.8,
  note({ freq: N.E4, start: 0, dur: 0.22, vol: 0.3, type: 'square', curve: 'exp' }),
  note({ freq: N.C4, start: 0.2, dur: 0.22, vol: 0.3, type: 'square', curve: 'exp' }),
  note({ freq: N.A3, start: 0.4, dur: 0.4, vol: 0.3, type: 'square', curve: 'bell' }),
  note({ freq: N.A2, start: 0.4, dur: 0.4, vol: 0.2, type: 'sine', curve: 'bell' })
);

(function buildMusic() {
  const bpm = 96;
  const beat = 60 / bpm;
  const bars = 4;
  const totalDur = bars * 4 * beat + 1.2;
  const melody = [
    [N.E5, 0], [N.G5, 1], [N.C6, 2], [N.G5, 3],
    [N.A5, 4], [N.G5, 5], [N.E5, 6], [N.D5, 7],
    [N.C5, 8], [N.E5, 9], [N.G5, 10], [N.E5, 11],
    [N.D5, 12], [N.C5, 13], [N.B4, 14], [N.C5, 15],
  ];
  const bassLine = [
    [N.C3, 0], [N.C3, 2], [N.A2, 4], [N.A2, 6],
    [N.F2, 8], [N.F2, 10], [N.G2, 12], [N.G2, 14],
  ];
  const voices = [];
  for (const [f, step] of melody) {
    voices.push(note({ freq: f, start: step * beat, dur: beat * 0.85, vol: 0.11, type: 'triangle', curve: 'exp' }));
    voices.push(note({ freq: f * 2, start: step * beat, dur: beat * 0.4, vol: 0.03, type: 'sine', curve: 'exp' }));
  }
  for (const [f, step] of bassLine) {
    voices.push(note({ freq: f, start: step * beat, dur: beat * 1.7, vol: 0.1, type: 'sine', curve: 'exp' }));
  }
  for (let bar = 0; bar < bars; bar++) {
    for (let b = 0; b < 4; b++) {
      const t = (bar * 4 + b) * beat;
      voices.push(note({ freq: b === 0 ? 60 : 52, start: t, dur: 0.05, vol: b === 0 ? 0.14 : 0.07, type: 'square', curve: 'exp' }));
    }
  }
  files['music.wav'] = mix(totalDur, ...voices);
})();

for (const [name, samples] of Object.entries(files)) {
  const fp = path.join(outDir, name);
  writeWav(fp, samples);
  console.log(`wrote ${name} (${fs.statSync(fp).size} bytes)`);
}
console.log('done');
