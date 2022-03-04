import {RankingPreference, rankingPreferenceSchema} from './Scoring';
import type {JTDSchemaType} from 'ajv/dist/jtd';

export type RankingPreferenceList = RankingPreference[];
export const preferenceListSchema: JTDSchemaType<RankingPreferenceList> = {
  elements: rankingPreferenceSchema,
};
