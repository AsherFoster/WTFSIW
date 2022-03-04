import {Genre, Movie, Person} from '../data/model';

export async function getRandomMovies(count: number): Promise<Movie[]> {
  throw new Error('not implemented');
}

export async function getMovie(id: number): Promise<Movie> {
  throw new Error('Not implemented');
}

export async function getGenre(id: number): Promise<Genre> {
  throw new Error('Not implemented');
}

export async function getPerson(id: number): Promise<Person> {
  throw new Error('Not implemented');
}
