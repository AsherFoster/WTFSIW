import {z} from 'zod';
import {scoringPreferenceSchema} from './Scoring';

export const preferenceListSchema = z.array(scoringPreferenceSchema);
