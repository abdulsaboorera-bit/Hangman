import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const logic = await import('file://' + path.join(root, 'src', 'utils', 'gameLogic.js').replace(/\\/g, '/'));
const data = await import('file://' + path.join(root, 'src', 'data', 'words.js').replace(/\\/g, '/'));

const {
  createGameState,
  guessLetter,
  applyHint,
  reviveAttempt,
  pickRandomWord,
  calculateCoinsEarned,
  getDisplayWord,
  MAX_WRONG,
  SCORE_CORRECT_LETTER,
  SCORE_WORD_COMPLETE,
  SCORE_PERFECT_WIN,
} = logic;

const { WORDS, CATEGORIES, DIFFICULTIES } = data;

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log('  PASS:', msg);
  } else {
    failed++;
    console.error('  FAIL:', msg);
  }
}

console.log('--- Word pools ---');
assert(CATEGORIES.length === 8, '8 categories');
assert(DIFFICULTIES.length === 3, '3 difficulties');
for (const cat of CATEGORIES) {
  for (const diff of DIFFICULTIES) {
    const pool = WORDS[cat.id][diff.id];
    assert(Array.isArray(pool) && pool.length >= 20, `${cat.id}/${diff.id} has >= 20 words (got ${pool ? pool.length : 0})`);
    assert(pool.every((w) => /^[A-Z]+$/.test(w)), `${cat.id}/${diff.id} all uppercase A-Z`);
  }
}

console.log('--- pickRandomWord ---');
const w1 = pickRandomWord('animals', 'easy');
assert(typeof w1 === 'string' && w1.length > 0, 'picks a word');
const w2 = pickRandomWord('animals', 'easy', [w1]);
assert(typeof w2 === 'string', 'exclude path works');

console.log('--- createGameState ---');
let s = createGameState('TIGER', 'animals', 'easy');
assert(s.status === 'playing', 'starts playing');
assert(s.guessedLetters.length === 0, 'no guesses');
assert(s.score === 0, 'score 0');
assert(s.hintsLeft === 2, '2 hints');

console.log('--- correct guess ---');
s = guessLetter(s, 'T');
assert(s.correctLetters.includes('T'), 'T is correct');
assert(s.score === SCORE_CORRECT_LETTER, `score +10 (got ${s.score})`);

console.log('--- case-insensitive ---');
let s2 = createGameState('TIGER', 'animals', 'easy');
s2 = guessLetter(s2, 'i');
assert(s2.correctLetters.includes('I'), 'lowercase i accepted');

console.log('--- duplicate guess ignored ---');
let s3 = createGameState('TIGER', 'animals', 'easy');
s3 = guessLetter(s3, 'T');
const scoreAfter = s3.score;
s3 = guessLetter(s3, 'T');
assert(s3.guessedLetters.filter((l) => l === 'T').length === 1, 'T guessed once');
assert(s3.score === scoreAfter, 'score unchanged on duplicate');

console.log('--- wrong guess ---');
let s4 = createGameState('TIGER', 'animals', 'easy');
s4 = guessLetter(s4, 'Z');
assert(s4.wrongLetters.includes('Z'), 'Z wrong');
assert(s4.status === 'playing', 'still playing after 1 wrong');

console.log('--- lose condition ---');
let s5 = createGameState('TIGER', 'animals', 'easy');
for (const l of ['A', 'B', 'C', 'D', 'F', 'H']) s5 = guessLetter(s5, l);
assert(s5.wrongLetters.length === MAX_WRONG, '6 wrong');
assert(s5.status === 'lost', 'lost after 6 wrong');

console.log('--- win condition ---');
let s6 = createGameState('GO', 'animals', 'easy');
s6 = guessLetter(s6, 'G');
assert(s6.status === 'playing', 'not won yet');
s6 = guessLetter(s6, 'O');
assert(s6.status === 'won', 'won when all letters found');
assert(s6.score === SCORE_CORRECT_LETTER * 2 + SCORE_WORD_COMPLETE + SCORE_PERFECT_WIN, `win score perfect (got ${s6.score})`);

console.log('--- perfect win bonus ---');
let s7 = createGameState('CAT', 'animals', 'easy');
s7 = guessLetter(s7, 'C');
s7 = guessLetter(s7, 'A');
s7 = guessLetter(s7, 'T');
assert(s7.status === 'won', 'won');
assert(s7.score === SCORE_CORRECT_LETTER * 3 + SCORE_WORD_COMPLETE + SCORE_PERFECT_WIN, `perfect score (got ${s7.score})`);

console.log('--- repeated letters in word ---');
let s8 = createGameState('LLAMA', 'animals', 'easy');
s8 = guessLetter(s8, 'L');
assert(s8.status === 'playing', 'L reveals both Ls but not win');
assert(getDisplayWord('LLAMA', s8.guessedLetters).filter((d) => d.revealed).length === 2, 'both Ls revealed');

console.log('--- hint system ---');
let s9 = createGameState('TIGER', 'animals', 'easy');
s9 = applyHint(s9);
assert(s9.hintsLeft === 1, 'hint consumed');
assert(s9.guessedLetters.length === 1, 'one letter revealed');
assert(s9.score >= 0, 'score not negative');
s9 = applyHint(s9);
assert(s9.hintsLeft === 0, 'second hint used');
s9 = applyHint(s9);
assert(s9.hintsLeft === 0, 'no hint when exhausted');

console.log('--- revive ---');
let s10 = createGameState('TIGER', 'animals', 'easy');
for (const l of ['A', 'B', 'C', 'D', 'F', 'H']) s10 = guessLetter(s10, l);
assert(s10.status === 'lost', 'lost');
s10 = reviveAttempt(s10);
assert(s10.status === 'playing', 'revived to playing');
assert(s10.wrongLetters.length === MAX_WRONG - 1, 'one wrong removed');
s10 = reviveAttempt(s10);
assert(s10.revived === true && s10.wrongLetters.length === MAX_WRONG - 1, 'cannot revive twice');

console.log('--- coins ---');
let s11 = createGameState('TIGER', 'animals', 'easy');
for (const l of ['T', 'I', 'G', 'E', 'R']) s11 = guessLetter(s11, l);
assert(calculateCoinsEarned(s11) > 0, 'win gives coins');
let s12 = createGameState('TIGER', 'animals', 'easy');
assert(calculateCoinsEarned(s12) === 0, 'no win no coins');

console.log('--- invalid input ---');
let s13 = createGameState('TIGER', 'animals', 'easy');
s13 = guessLetter(s13, '1');
s13 = guessLetter(s13, '');
s13 = guessLetter(s13, null);
assert(s13.guessedLetters.length === 0, 'invalid guesses ignored');

console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
