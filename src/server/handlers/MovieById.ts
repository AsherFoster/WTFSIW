import {createMovieResponse} from '../MovieResponse';
import {getMovie} from '../data';

export const MovieById = async (request: Request) => {
  const movie = await getMovie(request.params.id);
  const resp = {
    movie: await createMovieResponse(movie)
  };

  const headers = {'Content-Type': 'application/json'};
  return new Response(JSON.stringify(resp), {headers});
};
