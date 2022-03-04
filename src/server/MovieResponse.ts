import {Credit, Genre, Movie, Person} from '../data/model';
import {getGenre, getPerson} from './data';


async function getCreditWithPerson(credit: Credit): Promise<CreditWithPerson> {
  return {
    job: credit.job,
    creditType: credit.creditType,
    creditNumber: credit.creditNumber,
    person: await getPerson(credit.personId)
  };
}

export async function createMovieResponse(movie: Movie): Promise<MovieResponse> {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.posterUrl,
    releaseDate: movie.releaseDate,
    averageRating: movie.averageRating,

    genres: await Promise.all(movie.genres.map(g => getGenre(g))),
    credits: await Promise.all(movie.credits.map(c => getCreditWithPerson(c)))
  };
}
