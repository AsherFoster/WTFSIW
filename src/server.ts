/*
Talk about monoliths. Collapsing everything would help,
and I'm not putting in the effort of moving stuff out of here
* */
const RANKING = {
  AGE_WEIGHT_FACTOR: 0.1,
  CAST_WEIGHT: 3,
  CREW_WEIGHT: 3,
  GENRE_WEIGHT: 4,
  SAMPLE_SIZE: 15,
};

const PRODUCTION = process.env.NODE_ENV === 'production';
import * as path from 'path';
import * as Sentry from '@sentry/node';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import db from './database';
import Movie from './movie';
import {GENRE_NAMES} from './database';


const app = express();

const ROOT = path.resolve(__dirname, '..');

type FilterType = 'crew' | 'cast' | 'genre';
type Filter = {
  type: FilterType,
  id: number,
  name: string,
  direction: -1 | 1,
  job: string | null
};
type UserPref = {
  added: string, // ISO Formatted Date
  type: FilterType,
  id: number,
  direction: -1 | 1
};
type Pref = UserPref & {
  added: Date
};

type RankedMovie = {
  score: number,
  scores: Ranking[],
  movie: Movie
};
type Ranking = {
  weight: number,
  pref: UserPref
};

function validateBody(body: any) {
  if (
    typeof body !== 'object' ||
    typeof body.preferences !== 'object' ||
    !Array.isArray(body.preferences)
  ) {
    return false;
  }
  return body.preferences.every((pref: any) => {
    // For some reason typescript thinks that `any` has a added type that's simultaneously a string and a number
    return typeof pref.added === 'string' &&
      // @ts-ignore
      !isNaN(new Date(pref.added)) &&
      ['crew', 'cast', 'genre'].includes(pref.type) &&
      typeof pref.id === 'number' &&
      [-1, 1].includes(pref.direction);
  });
}

async function getRandomMovies(n = 1) {
  let ids = await db.all(`SELECT movie_id FROM movies ORDER BY RANDOM() LIMIT ?`, n) as { movie_id: number }[];
  // Cast is safe, because we're retrieving by ids which we just fetched
  return Promise.all(ids.map((m) => Movie._load(m.movie_id) as Promise<Movie>));
}

// Ranking
function rankMovies(movies: Movie[], prefs: UserPref[]): RankedMovie[] {
  let rankedMovies = movies.map(m => rankMovie(m, prefs));
  rankedMovies.sort((a, b) => b.score - a.score); // Shortcuts!
  return rankedMovies;
}
function rankMovie(movie: Movie, prefs: UserPref[]): RankedMovie {
  prefs.sort((a, b) => +b.added - +a.added);
  let scores = prefs.map((pref, i) => {
    let rank = matchPref(movie, pref);
    rank.weight *= weightAge(i + 1, prefs.length);
    return rank;
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
      if (movie.genres.includes(pref.id)) {
        weight = pref.direction * RANKING.GENRE_WEIGHT;
      }
      break;
    case 'cast':
      if (movie.credits.find(c => pref.id === c.person_id)) {
        weight = pref.direction * RANKING.CAST_WEIGHT;
      }
      break;
    case 'crew':
      if (movie.credits.find(c => pref.id === c.person_id)) {
        weight = pref.direction * RANKING.CREW_WEIGHT;
      }
      break;
    default:
      weight = Math.random();
  }
  return {weight, pref};
} // Todo improve?
function weightAge(nthBack: number, length: number): number {
  return 1.5 - (nthBack ** RANKING.AGE_WEIGHT_FACTOR) / 2;
}

// Filters, reasons
async function generateFilters(movie: Movie, prefs: UserPref[]): Promise<Filter[]> {
  let allOptions: Filter[] = [];
  movie.genres.forEach(g => {
    allOptions.push({
      direction: Math.random() > 0.5 ? -1 : 1,
      id: g,
      job: null,
      name: GENRE_NAMES.get(g) as string,
      type: 'genre'
    });
  });
  (await movie.getMeaningfulCrewMembers()).forEach(crew => {
    allOptions.push({
      direction: Math.random() > 0.5 ? -1 : 1,
      id: crew.person_id,
      job: crew.job,
      name: crew.name,
      type: 'crew'
    });
  });
  (await movie.getMeaningfulCastMembers()).forEach(cast => {
    allOptions.push({
      direction: Math.random() > 0.5 ? -1 : 1,
      id: cast.person_id,
      job: cast.job,
      name: cast.name,
      type: 'cast'
    });
  });

  allOptions.filter(filter => {
    return !(prefs.find(p => p.id === filter.id && p.type === filter.type) // TODO Maybe compare direction?
      // TODO think of more interesting things to put here
    );
  });

  let filters = [];
  let count = Math.min(3, allOptions.length); // Make between 1 and 3 filters
  for(let i = 0; i < count; i++) {
    let opt = Math.floor(Math.random() * allOptions.length);
    filters.push(allOptions[opt]);
    allOptions.splice(opt, 1);
  }
  return filters;
}
async function generateReasons(scores: Ranking[]): Promise<Filter[]> {
  return Promise.all(scores
    .filter(s => s.weight > 0) // Only show things that count this toward it
    .sort((a, b) => b.weight - a.weight)
    .map(async ({weight, pref}) => {
      return {
        direction: pref.direction,
        id: pref.id,
        job: null,
        name: pref.type === 'genre' ?
          GENRE_NAMES.get(pref.id) as string :
          await db.get('SELECT name FROM people WHERE person_id = ?', pref.id),
        type: pref.type,
      };
    }));
}

type PostData = {
  preferences: UserPref[]
};
type Response = {
  movie_id: number,
  title: string,
  overview: string,
  poster_url: string | null,
  actions: Filter[],
  reasons: Filter[],
  _debug?: any
};
type ExpressResponse = express.Response & {
  sentry?: string
};

app.use(Sentry.Handlers.requestHandler());
app.options('/movie', cors());
app.get('/movie', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  let movie = (await getRandomMovies(1))[0];
  res.send(await movie.getRenderableData());
});
app.post('/movie', cors(), bodyParser.json(), async (req, res) => {
  const DEBUG = !!req.query.debug;
  const body = req.body || {preferences: []};
  if (!validateBody(body)) {
    return res.status(400).send({
      error: 'malformed',
      message: 'The body provided must be a JSON object in the correct format'
    });
  }

  // Skip the sorting logic if no prefs are set, just spit out a random movie
  if (!body.preferences.length) {
    let movie = (await getRandomMovies(1))[0];
    const renderableData = await movie.getRenderableData({credits: false});
    const actions = await generateFilters(movie, []);
    return res.send({
      ...renderableData,
      actions,
      reasons: [],
    } as Response);
  }

  const prefs: Pref[] = body.preferences.map((pref: UserPref) => {
    return {
      added: new Date(pref.added),
      direction: pref.direction,
      id: pref.id,
      type: pref.type
    };
  });

  let randomSet = await getRandomMovies(RANKING.SAMPLE_SIZE);
  let rankedMovies = rankMovies(randomSet, prefs);
  // The following algorithm generates a random index weighted towards the start
  let weightedRandom = Math.floor(randomSet.length - Math.sqrt(Math.random() * (randomSet.length ** 2)));

  let rankedMovie = rankedMovies[weightedRandom];

  const response = {
    ...(await rankedMovie.movie.getRenderableData({credits: false})),
    actions: await generateFilters(rankedMovie.movie, prefs),
    reasons: await generateReasons(rankedMovie.scores)
  } as Response;
  if(DEBUG) {
    response._debug = {
      weightedRandom,
      rankedMovies: rankedMovies.map(rm => ({
        movie: {
          genres: rm.movie.genres,
          movie_id: rm.movie.movie_id
        },
        score: rm.score,
        scores: rm.scores
      }))
    };
  }
  res.send(response);
});
app.get('/movie/:id', async (req, res: ExpressResponse) => {
  const movie = await Movie._load(+req.params.id);
  if (!movie) {
    return res.status(404).json({
      error: 'not-found',
      message: 'The movie you requested couldn\'t be found'
    });
  } else {
    res.send({
      ...await movie.getRenderableData(),
      actions: await generateFilters(movie, [])
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(ROOT +  '/static/index.html');
});
app.get('/app.js', (req, res) => res.sendFile(ROOT + (PRODUCTION ? '/static/app.min.js' : '/static/app.js')));
app.get('/favicon.ico', (r, res) => res.redirect('/static/icon_tiny.png'));
app.use('/static', express.static(ROOT + '/static'));

app.use(Sentry.Handlers.errorHandler());
// @ts-ignore really not sure why it's complaining
app.use((err: Error, req: express.Request, res: ExpressResponse, next: express.NextFunction) => {
  console.error(err);
  res.status(500);
  res.json({
    error: {
      message: 'Unknown error. This has been reported',
      id: res.sentry
    }
  });
});

export default app;
