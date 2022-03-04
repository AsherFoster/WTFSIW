import {RankingPreference} from '../types/clientapi/Scoring';

export function assertNever(n: never): never {
  return n;
}
function arePreferencesEqual(
  a: RankingPreference,
  b: RankingPreference
): boolean {
  if (a.type === 'person') {
    return b.type === 'person' && a.personId === b.personId;
  }
  return b.type === 'genre' && a.genreId === b.genreId;
}
