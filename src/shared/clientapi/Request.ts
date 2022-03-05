import {RankingPreference, rankingPreferenceSchema} from './Scoring';
import type {JTDSchemaType} from 'ajv/dist/jtd';

export const preferenceListSchema: JTDSchemaType<RankingPreference[]> = {
  elements: rankingPreferenceSchema,
};
