import animals from './clues/animals';
import countries from './clues/countries';
import food from './clues/food';
import technology from './clues/technology';
import sports from './clues/sports';
import movies from './clues/movies';
import programming from './clues/programming';
import general from './clues/general';

export const CLUES = {
  animals,
  countries,
  food,
  technology,
  sports,
  movies,
  programming,
  general,
};

const FALLBACK = {
  animals: 'Think of a living creature from the animal kingdom.',
  countries: 'Think of a nation on the world map.',
  food: 'Think of something delicious people eat or drink.',
  technology: 'Think of a gadget or a computer-related term.',
  sports: 'Think of a game, sport, or athletic activity.',
  movies: 'Think of something from the world of films.',
  programming: 'Think of a term used when writing code.',
  general: 'Think of a common general-knowledge word.',
};

export function getClue(word, category) {
  const w = (word || '').toUpperCase();
  const byCategory = CLUES[category];
  if (byCategory && byCategory[w]) return byCategory[w];
  return FALLBACK[category] || null;
}
