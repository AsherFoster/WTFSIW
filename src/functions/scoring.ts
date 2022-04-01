import {assertNever, sample, weightedSample} from '../shared/util';
import type {
  GenrePreference,
  PersonPreference,
  ScoringPreference,
} from '../shared/clientapi/Scoring';
import type {Credit, Movie} from '../shared/database';
import {INITIAL_SAMPLE_SIZE, SUGGESTED_ACTION_COUNT} from '../shared/config';
import {Storage} from './storage';

/** Do you matter in the grand scheme of things? This function knows. */
function isMeaningfulPerson(credit: Credit): boolean {
  if (credit.creditType === 'crew' && credit.job) {
    // Director -> Yup
    // Caterer -> Probably not
    return ['director'].includes(credit.job.toLowerCase());
  } else if (credit.creditType === 'cast') {
    // Thanos -> Yup
    // Frightened inmate #2 -> Probably not

    // arbitrarily say only the first 5 actors matter
    return typeof credit.creditNumber === 'number' && credit.creditNumber < 5;
  }
  return false;
}

export async function generateActions(
  storage: Storage,
  movie: Movie,
  prefs: ScoringPreference[]
): Promise<(ScoringPreference & {name: string})[]> {
  const actions: ScoringPreference[] = [
    ...movie.genres
      .filter((g) => !prefs.find((p) => p.type === 'genre' && p.genreId === g))
      .map(
        (g) =>
          ({
            type: 'genre',
            genreId: g,
            name: 'TODO genre names', // TODO genre names
            weight: Math.random() > 0.5 ? -1 : 1, // TODO tune weights
          } as GenrePreference)
      ),
    ...movie.credits
      .filter(
        (c) =>
          !prefs.find((p) => p.type === 'person' && p.personId === c.personId)
      )
      .filter((c) => isMeaningfulPerson(c))
      .map(
        (c) =>
          ({
            type: 'person',
            personId: c.personId,
            name: c.name + (c.job ? ` (as ${c.job})` : ''),
            weight: Math.random() > 0.5 ? -1 : 1, // TODO tune weights
          } as PersonPreference)
      ),
  ];

  return sample(actions, SUGGESTED_ACTION_COUNT);
}

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
