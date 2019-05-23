/*
Talk about monoliths. Collapsing everything would help,
and I'm not putting in the effort of moving stuff out of here
* */
const RANKING = {
  SAMPLE_SIZE: 10,

  GENRE_WEIGHT: 2,
  CAST_WEIGHT: 2,
  CREW_WEIGHT: 2,
  AGE_WEIGHT_FACTOR: 0.1
};
const MEANINGFUL_JOBS = ['director', 'producer', 'writer'];
const MARK_MODE = false;
const PORT = process.env.PORT || 8080;

import * as path from 'path';
import * as sqlite from 'sqlite';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

import {Database} from './types';

const app = express();
const dbPromise = sqlite.open(path.resolve(__dirname, '../data/db.sqlite'));
let db: sqlite.Database;
let GENRE_NAMES = new Map<number, string>();

type BasicCredit = {
  credit_id: string,
  person_id: number,
  credit_type: Database.CreditType,
}
type FullCredit = Database.Credit & Database.Person;
type BasicMovie = {
  movie_id: number;
  genres: number[];
  credits: BasicCredit[];
}
type RenderableMovie = Database.Movie & {
  genres?: Database.Genre[]
  credits?: FullCredit[]
}

type FilterType = 'crew'|'cast'|'genre';
type Filter = {
  type: FilterType,
  id: number,
  name: string,
  direction: -1|1,
  role: string|null
}
type UserPref = {
  added: string, // ISO Formatted Date
  type: FilterType,
  id: number,
  direction: -1|1
}
type Pref = UserPref & {
  added: Date
}

class Movie {
  public static async _load(id: number) {
    return new this({
      movie_id: id,
      genres: (await db.all('SELECT genre_id FROM genre_links WHERE movie_id = ?', id) as Database.GenreLink[])
        .map(({genre_id}) => genre_id),
      credits: (await db.all('SELECT credit_id, person_id, credit_type FROM credits WHERE movie_id = ?', id))
    });
  }

  public movie_id: number;
  public genres: number[];
  public credits: BasicCredit[];

  constructor(movie: BasicMovie) {
    this.movie_id = movie.movie_id;
    this.genres = movie.genres;
    this.credits = movie.credits;
  }

  public async getRenderableData( /// ... yeah, I'm pretty sure this next line is needed...
    {genres = true, credits = true}: {genres?: boolean, credits?: boolean} = {genres: true, credits: true}
    ): Promise<RenderableMovie> {
    let data: RenderableMovie = await db.get('SELECT * FROM movies WHERE movie_id = ?', this.movie_id) as Database.Movie;
    if(genres)
      data.genres = this.genres.map(id => ({genre_id: id, name: GENRE_NAMES.get(id) as string}));
    if(credits)
      data.credits = await db.all(`
SELECT credit_id, credits.person_id, job, credit_type, people.name FROM credits
INNER JOIN people ON credits.person_id = people.person_id
WHERE credits.movie_id = ?;
      `, this.movie_id);

    return data;
  }
}

type RankedMovie = {
  score: number,
  scores: Ranking[],
  movie: Movie
}
type Ranking = {
  weight: number,
  pref: UserPref
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function validateBody(body: any) {
  if(
    typeof body !== 'object' ||
    typeof body.preferences !== 'object' ||
    !Array.isArray(body.preferences)
  ) return false;
  return body.preferences.every((pref: any) => {
    // For some reason typescript things that `any` has a added type that's simultaneously a string and a number
    // noinspection SuspiciousTypeOfGuard
    return typeof pref.added === 'string' && // TODO Validate as date
      // @ts-ignore
      !isNaN(new Date(pref.added)) &&
      ['crew', 'cast', 'genre'].includes(pref.type) &&
      typeof pref.id === 'number' &&
      [-1, 1].includes(pref.direction)
  });
}
async function loadGenres() {
  let dbGenres = await db.all('SELECT * FROM genres') as Database.Genre[]; // It's pretty small, no big deal
  dbGenres.forEach(({genre_id, name}) => GENRE_NAMES.set(genre_id, name));
}
async function getRandomMovies(n = 1) {
  let ids = await db.all(`SELECT movie_id FROM movies ORDER BY RANDOM() LIMIT ?`, n) as {movie_id: number}[];
  return Promise.all(ids.map(({movie_id}) => Movie._load(movie_id)));
}

// Ranking
function rankMovies(movies: Movie[], prefs: UserPref[]): RankedMovie[] {
  let rankedMovies = movies.map(m => rankMovie(m, prefs));
  rankedMovies.sort((a, b) => b.score - a.score); // Shortcuts!
  return rankedMovies;
}
function rankMovie(movie: Movie, prefs: UserPref[]): RankedMovie {
  prefs.sort((a, b) => +b.added - +a.added);
  let scores = prefs.map((pref, i) =>{
    let score = matchPref(movie, pref);
    score.weight *= weightAge(i + 1, prefs.length);
    return score;
  });
  let score = scores.reduce((a, b) => a + b.weight, 0);

  return {
    movie, score, scores
  };
}
function matchPref(movie: Movie, pref: UserPref): Ranking {
  let weight = 0;
  switch (pref.type) {
    case 'genre':
      if(movie.genres.includes(pref.id)) {
        weight = pref.direction * RANKING.GENRE_WEIGHT;
      }
      break;
    case 'cast':
      if(movie.credits.find(c => pref.id === c.person_id)) {
        weight = pref.direction * RANKING.CAST_WEIGHT;
      }
      break;
    case 'crew':
      if(movie.credits.find(c => pref.id === c.person_id)) {
        weight = pref.direction * RANKING.CREW_WEIGHT;
      }
      break;
    default:
      weight = Math.random()
  }
  return {weight, pref}
} // Todo improve?
function weightAge(nthBack: number, length: number): number {
  return 1.5 - (nthBack ** RANKING.AGE_WEIGHT_FACTOR) / 2
}

// Filters, reasons
async function getFullCredit(basicCredit: BasicCredit): Promise<FullCredit> {
  return {
    ...basicCredit,
    ...await db.get(`
SELECT people.name, credits.job FROM credits
INNER JOIN people ON people.person_id = credits.person_id
WHERE credit_id = ?
    `, basicCredit.credit_id)
  }
}
async function pickMeaningfulCrewMember(movie: Movie): Promise<FullCredit> {
  let allCrew = movie.credits.filter(c => c.credit_type === 'crew');
  let fullCredits = await Promise.all(allCrew.map(getFullCredit));
  fullCredits = fullCredits.filter(c => MEANINGFUL_JOBS.includes(c.job.toLowerCase()));
  return pickRandom(fullCredits);
}
async function generateFilters(movie: Movie, prefs: UserPref[]): Promise<Filter[]> {
  let types: FilterType[] = ['genre', 'genre', 'genre', 'cast', 'crew', 'crew']; // It works, ok
  let chosenTypes = [pickRandom(types), pickRandom(types)];
  return Promise.all(chosenTypes.map(async type => {
    switch(type) {
      case 'genre':
        let genre = pickRandom(movie.genres);
        return {
          type,
          id: genre,
          name: GENRE_NAMES.get(genre),
          direction: Math.random() > 0.5 ? -1 : 1,
          role: null
        } as Filter;
      case 'crew':
        let crew = await pickMeaningfulCrewMember(movie);
        return {
          type,
          id: crew.person_id,
          name: crew.name,
          direction: Math.random() > 0.5 ? -1 : 1,
          role: crew.job
        } as Filter;
      case 'cast':
        let cast = pickRandom(movie.credits.filter(c => c.credit_type === 'cast'));
        let {name, job} = await getFullCredit(cast);
        return {
          type,
          id: cast.person_id,
          name,
          direction: Math.random() > 0.5 ? -1 : 1,
          role: job
        } as Filter

    }
  }));
}
async function generateReasons(scores: Ranking[]): Promise<Filter[]> {
  return Promise.all(scores
    .filter(s => s.weight > 0) // Only show things that count this toward it
    .sort((a, b) => b.weight - a.weight)
    .map(async ({weight, pref}) => {
      return {
        type: pref.type,
        id: pref.id,
        name: pref.type === 'genre' ?
          GENRE_NAMES.get(pref.id) as string :
          await db.get('SELECT name FROM people WHERE person_id = ?', pref.id),
        direction: pref.direction,
        role: null
      }
    }))
}

app.get('/movie', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  let movie = (await getRandomMovies(1))[0];
  res.send(await movie.getRenderableData());
});

type PostData = {
  preferences: UserPref[]
}
type Response = {
  movie_id: number,
  title: string,
  overview: string,
  poster_url: string|null,
  actions: Filter[],
  reasons: Filter[]
}
app.options('/movie', cors());
app.post('/movie', cors(), bodyParser.json(), async (req, res) => {
  const DEBUG = !!req.query.debug;
  if(!validateBody(req.body)) {
    return res.status(400).send({
      error: 'malformed',
      message: 'The body provided must be a JSON object in the correct format'
    });
  }

  // Skip the sorting logic if no prefs are set, just spit out a random movie
  if(!req.body.preferences.length) {
    let movie = (await getRandomMovies(1))[0];
    return res.send({
      ...(await movie.getRenderableData({credits: false})),
      actions: await generateFilters(movie, []),
      reasons: []
    } as Response);
  }

  const prefs: Pref[] = req.body.preferences.map((pref: UserPref) => {
    return {
      added: new Date(pref.added),
      type: pref.type,
      id: pref.id,
      direction: pref.direction,
    };
  });

  let randomSet = await getRandomMovies(RANKING.SAMPLE_SIZE);
  let rankedMovies = rankMovies(randomSet, prefs);
  // The following algorithm generates a random index weighted towards the start
  let weightedRandom = Math.floor(randomSet.length - Math.sqrt(Math.random() * (randomSet.length ** 2)));
  // @ts-ignore, screw you typescript
  let rankedMovie = rankedMovies[weightedRandom];

  res.send({
    ...(await rankedMovie.movie.getRenderableData({credits: false})),
    actions: await generateFilters(rankedMovie.movie, prefs),
    reasons: await generateReasons(rankedMovie.scores),
    _debug: DEBUG ? {
      weightedRandom,
      rankedMovies: rankedMovies.map(rm => ({
        movie: {
          movie_id: rm.movie.movie_id,
          genres: rm.movie.genres
        },
        score: rm.score,
        scores: rm.scores
      }))
    } : undefined
  } as Response)
});

app.get('/', (req, res) => {
  if(MARK_MODE && !req.query.safe) {
    return res.redirect('/?safe=true?debug=true');
  }
  res.sendFile(path.resolve(__dirname, '../static/index.html'));
});

async function main() {
  db = await dbPromise;
  await loadGenres();
  app.listen(PORT);
  console.log('Listening on port', PORT);
}

main();
