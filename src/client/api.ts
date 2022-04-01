import type {
  ErrorResponse,
  ScoredMovieResponse,
} from '../shared/clientapi/Response';
import type {ScoringPreference} from '../shared/clientapi/Scoring';

export async function getMovie(
  prefs: ScoringPreference[] = []
): Promise<ScoredMovieResponse | ErrorResponse> {
  const query = new URLSearchParams();
  if (prefs) {
    query.append('preferences', JSON.stringify(prefs));
  }

  // TODO sentry perf tracking
  const resp = await fetch('/api/movie?' + query);

  return resp.json();
}
