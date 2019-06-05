import {Database} from './types';
import * as sqlite from 'sqlite';

export type BasicCredit = {
  credit_id: string,
  person_id: number,
  credit_type: Database.CreditType,
};
export type FullCredit = Database.Credit & Database.Person;

export type BasicMovie = {
  movie_id: number;
  genres: number[];
  credits: BasicCredit[];
};
export type RenderableMovie = Database.Movie & {
  genres?: Database.Genre[]
  credits?: FullCredit[]
};

export default class Movie {
  public movie_id: number;
  public genres: number[];
  public credits: BasicCredit[];
  public static async _load(db: sqlite.Database, genreNames: Map<number, string>, id: number) {
    return new this(db, genreNames, {
      credits: (await db.all('SELECT credit_id, person_id, credit_type FROM credits WHERE movie_id = ?', id)),
      genres: (await db.all('SELECT genre_id FROM genre_links WHERE movie_id = ?', id) as Database.GenreLink[])
        .map(({genre_id}) => genre_id),
      movie_id: id
    });
  }

  constructor(private db: sqlite.Database,
              private genreNames: Map<number, string>,
              movie: BasicMovie) {
    this.movie_id = movie.movie_id;
    this.genres = movie.genres;
    this.credits = movie.credits;
  }

  public async getRenderableData( /// ... yeah, I'm pretty sure this next line is needed...
    {genres = true, credits = true}: { genres?: boolean, credits?: boolean } = {genres: true, credits: true}
  ): Promise<RenderableMovie> {
    let data: RenderableMovie = await this.db.get('SELECT * FROM movies WHERE movie_id = ?', this.movie_id) as Database.Movie;
    if (genres) {
      data.genres = this.genres.map(id => ({genre_id: id, name: this.genreNames.get(id) as string}));
    }
    if (credits) {
      data.credits = await this.db.all(`
SELECT credit_id, credits.person_id, job, credit_type, people.name FROM credits
INNER JOIN people ON credits.person_id = people.person_id
WHERE credits.movie_id = ?;
      `, this.movie_id);
    }

    return data;
  }
}
