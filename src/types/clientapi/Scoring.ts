import type {JTDSchemaType} from 'ajv/dist/jtd';

export interface PersonPreference {
  type: 'person';
  personId: number;
  weight: number;
}
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

export interface GenrePreference {
  type: 'genre';
  genreId: number;
  weight: number;
}
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

export type RankingPreference = GenrePreference | PersonPreference;
export const rankingPreferenceSchema: JTDSchemaType<RankingPreference> = {
  discriminator: 'type',
  mapping: {
    person: personPreferenceSchema,
    genre: genrePreferenceSchema
  }
};
