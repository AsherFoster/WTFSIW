import db, {GENRE_NAMES} from './database';
import {Database} from './types';

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
  public static async _load(id: number): Promise<Movie | null> {
    if (!await db.get('SELECT 1 FROM movies WHERE movie_id = ?', id)) return null; // Check if the movie exists

    const [credits, genres] = await Promise.all([
      db.all('SELECT credit_id, person_id, credit_type FROM credits WHERE movie_id = ?', id),
      db.all('SELECT genre_id FROM genre_links WHERE movie_id = ?', id)
    ]);
    return new this({
      credits,
      genres: genres.map(({genre_id}) => genre_id),
      movie_id: id
    });
  }

  constructor(movie: BasicMovie) {
    this.movie_id = movie.movie_id;
    this.genres = movie.genres;
    this.credits = movie.credits;
  }

  public async getRenderableData( // ... yeah, I'm pretty sure this next line is needed...
    {genres = true, credits = true}: { genres?: boolean, credits?: boolean } = {genres: true, credits: true}
  ): Promise<RenderableMovie> {
    let data: RenderableMovie = await db.get('SELECT * FROM movies WHERE movie_id = ?', this.movie_id) as Database.Movie;
    if (genres) {
      data.genres = this.genres.map(id => ({genre_id: id, name: GENRE_NAMES.get(id) as string}));
    }
    if (credits) {
      data.credits = await db.all(`
SELECT credit_id, credits.person_id, job, credit_type, people.name FROM credits
INNER JOIN people ON credits.person_id = people.person_id
WHERE credits.movie_id = ?;
      `, this.movie_id);
    }

    return data;
  }

  public async getMeaningfulCrewMembers(): Promise<FullCredit[]> {
    return db.all(`
  SELECT * FROM credits
  INNER JOIN people ON people.person_id = credits.person_id
  WHERE credit_type = "crew" AND LOWER(job) = "director" AND movie_id = ?
  `, this.movie_id);
  }
  public async getMeaningfulCastMembers(): Promise<FullCredit[]> {
    // TODO trial sort and limit, rather than count and cap
    let credit_count = (await db.get(`SELECT COUNT(*) FROM credits
  WHERE credit_type = 'cast' AND movie_id = ?
  `, this.movie_id))['COUNT(*)'];
    let orderMax = 5 + Math.floor(Math.log(credit_count)); // Get the most interesting credits only
    return  await db.all(`
  SELECT * FROM credits
  INNER JOIN people ON people.person_id = credits.person_id
  WHERE credit_type = 'cast' AND credit_order < ? AND movie_id = ?
  `, orderMax, this.movie_id);
  }
}
