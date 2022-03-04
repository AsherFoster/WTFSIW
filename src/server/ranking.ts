import {Credit, Movie} from '../data/model';
import {assertNever} from './util';
import {getRandomMovies} from './data';

const INITIAL_SAMPLE_SIZE = 100;
const SUGGESTED_ACTION_COUNT = 3;

/** Randomly pick a item from `src`, biased towards the start */
function weightedSample<T>(src: T[]): T {
  // TODO confirm this curve
  const weightedRandom = Math.floor(src.length - Math.sqrt(Math.random() * (src.length ** 2)));

  return src[weightedRandom];
}

/** Randomly pick `n` items from `src` */
function sample<T>(src: T[], n: number): T[] {
  const arr = [...src];
  const sampled = [];

  for (let i = 0; i < n && arr.length; i++) {
    const random = Math.floor(Math.random() * arr.length);
    sampled.push(arr[random]);
    arr.splice(random, 1);
  }

  return sampled;
}

export interface PersonPreference {
  type: 'person';
  personId: number;
  weight: number;
}
export interface GenrePreference {
  type: 'genre';
  genreId: number;
  weight: number;
}
export type RankingPreference = GenrePreference | PersonPreference;

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

export async function generateActions(movie: Movie, prefs: RankingPreference[]): Promise<RankingPreference[]> {
  const actions: RankingPreference[] = [
    ...movie.genres
      .filter(g => !prefs.find(p => p.type === 'genre' && p.genreId === g))
      .map(g => ({
        type: 'genre',
        genreId: g,
        weight: Math.random() > 0.5 ? -1 : 1 // TODO tune weights
      } as GenrePreference)),
    ...movie.credits
      .filter(c => !prefs.find(p => p.type === 'person' && p.personId === c.personId))
      .filter(c => isMeaningfulPerson(c))
      .map(c => ({
        type: 'person',
        personId: c.personId,
        weight: Math.random() > 0.5 ? -1 : 1 // TODO tune weights
      } as PersonPreference))
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
    if (movie.credits.find(c => c.personId === pref.personId)) return pref.weight;
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
    score
  };
}

export async function getRankedMovie(prefs: RankingPreference[]): Promise<ScoredMovie> {
  const sampledMovies = await getRandomMovies(INITIAL_SAMPLE_SIZE);
  const scoredMovies = sampledMovies.map(m => scoreMovie(m, prefs)).sort((a, b) => b.score - a.score);

  // Return a random movie from the set, biased towards high scores
  return weightedSample(scoredMovies);
}
