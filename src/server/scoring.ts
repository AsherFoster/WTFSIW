import {assertNever, sample, weightedSample} from '../shared/util';
import {getRandomMovies} from './data';
import type {
  GenrePreference,
  PersonPreference,
  RankingPreference,
} from '../shared/clientapi/Scoring';
import type {Credit, Movie} from '../shared/database';
import {INITIAL_SAMPLE_SIZE, SUGGESTED_ACTION_COUNT} from '../shared/config';

/** Do you matter in the grand scheme of things? This function knows. */
function isMeaningfulPerson(credit: Credit): boolean {
  if (credit.creditType === 'crew') {
    // Director -> Yup
    // Caterer -> Probably not
    return ['director'].includes(credit.job.toLowerCase());
  } else {
    // Thanos -> Yup
    // Frightened inmate #2 -> Probably not

    // arbitrarily say only the first 10 actors matter
    return typeof credit.creditNumber === 'number' && credit.creditNumber < 10;
  }
}

export async function generateActions(
  movie: Movie,
  prefs: RankingPreference[]
): Promise<RankingPreference[]> {
  const actions: RankingPreference[] = [
    ...movie.genres
      .filter((g) => !prefs.find((p) => p.type === 'genre' && p.genreId === g))
      .map(
        (g) =>
          ({
            type: 'genre',
            genreId: g,
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
            weight: Math.random() > 0.5 ? -1 : 1, // TODO tune weights
          } as PersonPreference)
      ),
  ];

  return sample(actions, SUGGESTED_ACTION_COUNT);
}

interface ScoredMovie {
  movie: Movie;
  score: number;
  factors: RankingPreference[];
}
function applyPreference(movie: Movie, pref: RankingPreference): number {
  if (pref.type === 'genre') {
    if (movie.genres.includes(pref.genreId)) return pref.weight;
  } else if (pref.type === 'person') {
    if (movie.credits.find((c) => c.personId === pref.personId)) {
      return pref.weight;
    }
  } else assertNever(pref);

  return 0;
}
function scoreMovie(movie: Movie, prefs: RankingPreference[]): ScoredMovie {
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
  prefs: RankingPreference[]
): Promise<ScoredMovie> {
  const sampledMovies = await getRandomMovies(INITIAL_SAMPLE_SIZE);
  const scoredMovies = sampledMovies
    .map((m) => scoreMovie(m, prefs))
    .sort((a, b) => b.score - a.score);

  // Return a random movie from the set, biased towards high scores
  return weightedSample(scoredMovies);
}
