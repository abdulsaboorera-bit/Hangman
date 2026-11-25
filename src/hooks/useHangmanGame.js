import { useCallback, useRef, useState } from 'react';
import {
  createGameState,
  guessLetter as guessLogic,
  applyHint as hintLogic,
  reviveAttempt as reviveLogic,
  pickRandomWord,
  calculateCoinsEarned,
} from '../utils/gameLogic';

export default function useHangmanGame() {
  const [game, setGame] = useState(null);
  const recentWordsRef = useRef([]);

  const startGame = useCallback((category, difficulty) => {
    const word = pickRandomWord(category, difficulty, recentWordsRef.current.slice(-10));
    if (!word) {
      setGame(null);
      return null;
    }
    recentWordsRef.current = [...recentWordsRef.current, word].slice(-20);
    const state = createGameState(word, category, difficulty);
    setGame(state);
    return state;
  }, []);

  const guess = useCallback((letter) => {
    setGame((prev) => (prev ? guessLogic(prev, letter) : prev));
  }, []);

  const applyHint = useCallback(() => {
    setGame((prev) => (prev ? hintLogic(prev) : prev));
  }, []);

  const revive = useCallback(() => {
    setGame((prev) => (prev ? reviveLogic(prev) : prev));
  }, []);

  const coinsEarned = game ? calculateCoinsEarned(game) : 0;

  return {
    game,
    startGame,
    guess,
    applyHint,
    revive,
    coinsEarned,
  };
}
