import {z} from 'zod';
import {rankingPreferenceSchema} from './Scoring';

export const preferenceListSchema = z.array(rankingPreferenceSchema);
