import type {
  ErrorResponse,
  ScoredMovieResponse,
} from '../shared/clientapi/Response';
import type {ScoringPreference} from '../shared/clientapi/Scoring';
import type {ScoredMovieRequest} from '../shared/clientapi/Request';

export async function getMovie(
  prefs: ScoringPreference[] = []
): Promise<ScoredMovieResponse | ErrorResponse> {
  // TODO sentry perf tracking
  const resp = await fetch('/api/movie', {
    method: 'POST',
    body: JSON.stringify({preferences: prefs} as ScoredMovieRequest),
  });

  return resp.json();
}
