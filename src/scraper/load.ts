import {
  getGenres,
  Genre as TMDBGenre,
  MovieResult as TMDBMovie,
  Crew,
  Cast,
  getMovies,
  getMovieCredits,
} from './tmdb';
import {MOVIE_DATASET_SIZE} from '../shared/config';
import type {Credit, Genre, Movie, Person} from '../shared/database';
import type {CreditWithPerson} from '../shared/clientapi/Response';

interface AllTheThings {
  genres: Genre[];
  movies: Movie[];
  persons: Person[];
}

function toGenre({id, name}: TMDBGenre): Genre {
  if (!name || typeof id !== 'number') throw new Error('Bad genre');
  return {id, name};
}

function castToCredit(cast: Cast): CreditWithPerson {
  if (
    typeof cast.id !== 'number' ||
    !cast.name ||
    !cast.character ||
    typeof cast.order !== 'number'
  ) {
    throw new Error('bad cast');
  }

  return {
    person: {
      id: cast.id,
      name: cast.name,
    },
    creditType: 'cast',
    job: cast.character,
    creditNumber: cast.order,
  };
}
function crewToCredit(crew: Crew): CreditWithPerson {
  if (typeof crew.id !== 'number' || !crew.name || !crew.job) {
    throw new Error('bad crew');
  }
  return {
    person: {
      id: crew.id,
      name: crew.name,
    },
    creditType: 'crew',
    job: crew.job,
  };
}
function toCredits(cast: Cast[], crew: Crew[]): CreditWithPerson[] {
  return cast.map(castToCredit).concat(crew.map(crewToCredit));
}

function toMovie(movie: TMDBMovie, credits: Credit[]): Movie {
  if (
    !movie.id ||
    !movie.title ||
    !movie.overview ||
    !movie.poster_path ||
    !movie.release_date ||
    !movie.vote_average ||
    !movie.popularity ||
    !movie.genre_ids
  ) {
    throw new Error('bad movie'); // TODO some of these will be optional
  }

  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.poster_path, // TODO expand poster path
    releaseDate: movie.release_date,
    averageRating: movie.vote_average || movie.popularity,

    genres: movie.genre_ids,
    credits,
  };
}

export async function getAllTheThings(): Promise<AllTheThings> {
  const genres = await getGenres();
  const tmdbMovies = await getMovies(MOVIE_DATASET_SIZE);

  const movies: Movie[] = [];
  const persons = new Map<number, string>();

  for (const movie of tmdbMovies) {
    const {cast, crew} = await getMovieCredits(movie.id!);
    const credits = toCredits(cast, crew).map((c) => {
      // I wonder if it's faster to check or not
      if (!persons.has(c.person.id)) persons.set(c.person.id, c.person.name);
      return {
        personId: c.person.id,
        creditType: c.creditType,
        job: c.job,
        creditNumber: c.creditNumber,
      } as Credit;
    });
    movies.push(toMovie(movie, credits));
  }

  return {
    movies,
    // Hack to turn Set<a, b>() into {a, b}[]
    persons: Array.from(persons.entries()).map(([id, name]) => ({id, name})),
    genres: genres.map(toGenre),
  };
}
