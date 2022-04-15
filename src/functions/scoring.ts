import {assertNever, weightedSample} from '../shared/util';
import {INITIAL_SAMPLE_SIZE} from '../shared/config';
import {Storage} from './storage';
import type {ScoringPreference} from '../shared/clientapi/Scoring';
import type {Movie} from '../shared/database';

interface ScoredMovie {
  movie: Movie;
  score: number;
  factors: ScoringPreference[];
}
function applyPreference(movie: Movie, pref: ScoringPreference): number {
  if (pref.type === 'genre') {
    if (movie.genres.includes(pref.genreId)) return pref.weight;
  } else if (pref.type === 'person') {
    if (movie.credits.find((c) => c.personId === pref.personId)) {
      return pref.weight;
    }
  } else assertNever(pref);

  return 0;
}
function scoreMovie(movie: Movie, prefs: ScoringPreference[]): ScoredMovie {
  let score = 0;
  return {
    movie,
    factors: prefs.map((pref) => {
      const weight = applyPreference(movie, pref);
      score += weight;
      return pref;
    }),
    score,
  };
}

export async function getScoredMovie(
  storage: Storage,
  prefs: ScoringPreference[]
): Promise<ScoredMovie> {
  const sampledMovies = await storage.getRandomMovies(INITIAL_SAMPLE_SIZE);
  const scoredMovies = sampledMovies
    .map((m) => scoreMovie(m, prefs))
    .sort((a, b) => b.score - a.score);

  // Return a random movie from the set, biased towards high scores
  return weightedSample(scoredMovies);
}
