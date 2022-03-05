import type {Genre, Movie, Person} from '../shared/database';
import {sample} from '../shared/util';

interface KV {
  movies: number[];
  'movie/:id': Movie;
  genres: number[];
  'genre/:id': Genre;
  persons: number[];
  'person/:id': Person;
}

export class Storage {
  constructor(private storage: KVNamespace) {}

  private async getMovies(): Promise<Movie[]> {
    const movies = await this.storage.get<Movie[]>('movies', {type: 'json'});
    if (!movies) throw new Error("Couldn't fetch movies");
    return movies;
  }

  async getRandomMovies(count: number): Promise<Movie[]> {
    const movies = await this.getMovies();
    return sample(movies, count);
  }

  async getMovie(id: number): Promise<Movie | null> {
    return this.storage.get('movie/' + id, {type: 'json'});
  }

  async getGenre(id: number): Promise<Genre | null> {
    return this.storage.get('genre/' + id, {type: 'json'});
  }

  async getPerson(id: number): Promise<Person | null> {
    return this.storage.get('person/' + id, {type: 'json'});
  }
}
