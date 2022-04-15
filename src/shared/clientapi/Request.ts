import {z} from 'zod';
import {scoringPreferenceSchema} from './Scoring';

export const preferenceListSchema = z.array(scoringPreferenceSchema);

export interface ScoredMovieRequest {
  preferences: z.infer<typeof preferenceListSchema>;
}
