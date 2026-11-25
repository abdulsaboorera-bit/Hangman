import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const SOURCES = {
  click: require('../../assets/sounds/click.wav'),
  type: require('../../assets/sounds/type.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  win: require('../../assets/sounds/win.wav'),
  lose: require('../../assets/sounds/lose.wav'),
  coin: require('../../assets/sounds/coin.wav'),
  hint: require('../../assets/sounds/hint.wav'),
  pause: require('../../assets/sounds/pause.wav'),
  revive: require('../../assets/sounds/revive.wav'),
  gameover: require('../../assets/sounds/gameover.wav'),
  music: require('../../assets/sounds/music.wav'),
};

const players = {};
let soundEnabled = true;
let musicEnabled = false;
let musicWanted = false;
let initPromise = null;

function ensureInitialized() {
  if (!initPromise) initPromise = init();
  return initPromise;
}

async function init() {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    });
  } catch {
    // best-effort
  }
  for (const [key, source] of Object.entries(SOURCES)) {
    try {
      const player = createAudioPlayer(source);
      if (key === 'music') {
        player.loop = true;
        player.volume = 0.45;
      }
      players[key] = player;
    } catch (e) {
      if (__DEV__) console.warn(`[sound] failed to create player "${key}"`, e);
    }
  }
}

export function setSoundEnabled(enabled) {
  soundEnabled = !!enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setMusicEnabled(enabled) {
  musicEnabled = !!enabled;
  if (!enabled) {
    stopMusic();
  } else if (musicWanted) {
    startMusic();
  }
}

export async function preloadSounds() {
  await ensureInitialized();
}

export async function playSound(name) {
  if (!soundEnabled || name === 'music') return;
  await ensureInitialized();
  const player = players[name];
  if (!player) return;
  try {
    player.pause();
    await player.seekTo(0);
    player.play();
  } catch {
    // race conditions ignored
  }
}

export async function startMusic() {
  musicWanted = true;
  if (!musicEnabled) return;
  await ensureInitialized();
  const player = players.music;
  if (!player) return;
  try {
    if (!player.playing) player.play();
  } catch {
    // ignored
  }
}

export function stopMusic() {
  const player = players.music;
  if (!player) return;
  try {
    player.pause();
    player.seekTo(0);
  } catch {
    // ignored
  }
}

export function stopAllSounds() {
  for (const [key, player] of Object.entries(players)) {
    if (key === 'music') continue;
    try {
      player.pause();
      player.seekTo(0);
    } catch {
      // ignored
    }
  }
}
