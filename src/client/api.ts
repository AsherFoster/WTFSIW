import type {
  ErrorResponse,
  RankedMovieResponse,
} from '../types/clientapi/Response';
import type {RankingPreference} from '../types/clientapi/Scoring';

export async function getMovie(
  prefs: RankingPreference[] = []
): Promise<RankedMovieResponse | ErrorResponse> {
  const query = new URLSearchParams();
  if (prefs) {
    query.append('preferences', JSON.stringify(prefs));
  }

  // TODO sentry perf tracking
  const resp = await fetch('/api/movie?' + query);

  return resp.json();
}
