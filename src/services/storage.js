import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  STATS: '@hangman_stats_v1',
  SETTINGS: '@hangman_settings_v1',
  RECENT_WORDS: '@hangman_recent_words_v1',
};

export const DEFAULT_STATS = {
  highScore: 0,
  totalScore: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  totalCoins: 0,
};

export const DEFAULT_SETTINGS = {
  sound: true,
  vibration: true,
  music: false,
};

export async function loadStats() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.STATS);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export async function saveStats(stats) {
  try {
    await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  } catch {
    // ignore write errors silently — game stays playable
  }
}

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export async function loadRecentWords() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.RECENT_WORDS);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function saveRecentWords(words) {
  try {
    const trimmed = (words || []).slice(-20);
    await AsyncStorage.setItem(KEYS.RECENT_WORDS, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export async function resetAllProgress() {
  try {
    await AsyncStorage.multiRemove([KEYS.STATS, KEYS.RECENT_WORDS]);
    await saveStats({ ...DEFAULT_STATS });
    await saveRecentWords([]);
  } catch {
    // ignore
  }
}
