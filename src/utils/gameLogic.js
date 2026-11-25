import { WORDS } from '../data/words.js';

export const MAX_WRONG = 6;
export const HINT_COST = 20;
export const BASE_HINTS = 2;
export const SCORE_CORRECT_LETTER = 10;
export const SCORE_WORD_COMPLETE = 50;
export const SCORE_PERFECT_WIN = 100;

export function getWordPool(category, difficulty) {
  const cat = WORDS[category];
  if (!cat) return [];
  return cat[difficulty] || [];
}

export function pickRandomWord(category, difficulty, exclude = []) {
  const pool = getWordPool(category, difficulty);
  if (pool.length === 0) return null;
  const excluded = new Set(exclude);
  const fresh = pool.filter((w) => !excluded.has(w));
  const source = fresh.length > 0 ? fresh : pool;
  const index = Math.floor(Math.random() * source.length);
  return source[index];
}

export function createGameState(word, category, difficulty) {
  const normalized = (word || '').toUpperCase();
  return {
    word: normalized,
    category,
    difficulty,
    guessedLetters: [],
    correctLetters: [],
    wrongLetters: [],
    status: 'playing',
    score: 0,
    hintsLeft: BASE_HINTS,
    hintsUsed: 0,
    revived: false,
  };
}

export function isLetterRevealed(word, guessedLetters, letter) {
  return word.includes(letter) && guessedLetters.includes(letter);
}

export function getDisplayWord(word, guessedLetters) {
  return word.split('').map((ch) => ({
    char: ch,
    revealed: guessedLetters.includes(ch) || ch === ' ' || ch === '-',
  }));
}

export function guessLetter(state, rawLetter) {
  if (state.status !== 'playing') return state;
  const letter = (rawLetter || '').toUpperCase();
  if (!/^[A-Z]$/.test(letter)) return state;
  if (state.guessedLetters.includes(letter)) return state;

  const guessedLetters = [...state.guessedLetters, letter];
  const isCorrect = state.word.includes(letter);

  let correctLetters = state.correctLetters;
  let wrongLetters = state.wrongLetters;
  let score = state.score;

  if (isCorrect) {
    correctLetters = [...state.correctLetters, letter];
    score += SCORE_CORRECT_LETTER;
  } else {
    wrongLetters = [...state.wrongLetters, letter];
  }

  const uniqueWordChars = [...new Set(state.word.split('').filter((c) => /[A-Z]/.test(c)))];
  const allRevealed = uniqueWordChars.every((c) => guessedLetters.includes(c));
  const wrongCount = wrongLetters.length;

  let status = 'playing';
  if (allRevealed) {
    status = 'won';
    score += SCORE_WORD_COMPLETE;
    if (wrongCount === 0) score += SCORE_PERFECT_WIN;
  } else if (wrongCount >= MAX_WRONG) {
    status = 'lost';
  }

  return {
    ...state,
    guessedLetters,
    correctLetters,
    wrongLetters,
    score,
    status,
  };
}

export function applyHint(state) {
  if (state.status !== 'playing' || state.hintsLeft <= 0) return state;

  const uniqueWordChars = [...new Set(state.word.split('').filter((c) => /[A-Z]/.test(c)))];
  const hidden = uniqueWordChars.filter((c) => !state.guessedLetters.includes(c));
  if (hidden.length === 0) return state;

  const letter = hidden[Math.floor(Math.random() * hidden.length)];
  const next = guessLetter(state, letter);
  return {
    ...next,
    hintsLeft: state.hintsLeft - 1,
    hintsUsed: state.hintsUsed + 1,
    score: Math.max(0, next.score - HINT_COST),
  };
}

export function reviveAttempt(state) {
  if (state.status !== 'lost' || state.revived) return state;
  const wrongLetters = state.wrongLetters.slice(0, -1);
  return {
    ...state,
    wrongLetters,
    status: 'playing',
    revived: true,
  };
}

export function calculateCoinsEarned(state) {
  if (state.status !== 'won') return 0;
  const base = 10;
  const noMistakesBonus = state.wrongLetters.length === 0 ? 15 : 0;
  const hintPenalty = state.hintsUsed * 5;
  return Math.max(5, base + noMistakesBonus - hintPenalty);
}
