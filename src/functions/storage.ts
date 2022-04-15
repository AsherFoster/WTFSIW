import type {Genre, Movie} from '../shared/database';
import {sample} from '../shared/util';

// KV structure
// version - number representing the schema version
// movie/:id - details of a single movie
// movies - list of all movie IDs
// genres - list of all genres (name & id dicts)

type StorageKey =
  | 'movies'
  | 'movie'
  | 'genre'
  | 'genres'
  | 'person'
  | 'persons';

export class Storage {
  private readonly version: Promise<number>;

  private genres: Genre[] | null = null;

  constructor(private storage: KVNamespace) {
    this.version = this.storage
      .get<number>('version', {type: 'json'})
      .then((v) => {
        if (!v) throw new Error('`version` key is missing from KV');
        return v;
      });
  }

  private async key(...path: (StorageKey | number)[]): Promise<string> {
    return [await this.version, ...path].join('/');
  }

  private async getMovieIds(): Promise<number[]> {
    return this.storage.get(await this.key('movies'), {
      type: 'json',
    }) as Promise<number[]>; // casting, because if version is set, the database should be ready
  }

  async getMovie(id: number): Promise<Movie | null> {
    return this.storage.get(await this.key('movie', id), {
      type: 'json',
    });
  }

  async getGenre(id: number): Promise<Genre | null> {
    if (!this.genres) {
      this.genres = await this.storage.get(await this.key('genres'), {
        type: 'json',
      });
    }
    return this.genres!.find((g) => g.id === id) ?? null;
  }

  async getRandomMovies(count: number): Promise<Movie[]> {
    const movies = await this.getMovieIds();
    const sampled = sample(movies, count);
    return Promise.all(sampled.map((m) => this.getMovie(m) as Promise<Movie>));
  }
}
