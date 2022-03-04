import {createMovieResponse} from '../MovieResponse';
import {generateActions, GenrePreference, getRankedMovie, PersonPreference, RankingPreference} from '../ranking';
import {getRandomMovies} from '../data';
import Ajv, {JTDSchemaType} from 'ajv/dist/jtd';

const ajv = new Ajv();

const personPreferenceSchema: JTDSchemaType<PersonPreference> = {
  properties: {
    type: {
      enum: ['person']
    },
    personId: {
      type: 'int32'
    },
    weight: {
      type: 'int32'
    }
  }
};
const genrePreferenceSchema: JTDSchemaType<GenrePreference> = {
  properties: {
    type: {
      enum: ['genre']
    },
    genreId: {
      type: 'int32'
    },
    weight: {
      type: 'int32'
    }
  }
};
const preferenceListSchema: JTDSchemaType<RankingPreference[]> = {
  elements: {
    discriminator: 'type',
    mapping: {
      person: personPreferenceSchema,
      genre: genrePreferenceSchema
    }
  }
};

const validate = ajv.compileParser(preferenceListSchema);

export const WeightedMovie = async (request: Request) => {
  const rawPrefs = request.url
  const prefs = request.blah;

  let movie;
  let rankingInfo;

  if (prefs) {
    const scoredMovie = await getRankedMovie(prefs);
    movie = scoredMovie.movie;
    rankingInfo = scoredMovie.factors;
  } else {
    movie = (await getRandomMovies(1))[0];
  }

  const resp = {
    movie: await createMovieResponse(movie),
    actions: await generateActions(movie, prefs),
    rankingInfo
  };

  const headers = {'Content-Type': 'application/json'};
  return new Response(JSON.stringify(resp), {headers});
};
