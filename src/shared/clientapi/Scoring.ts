import {z} from 'zod';

const personPreferenceSchema = z.object({
  type: z.literal('person'),
  personId: z.number().int(),
  weight: z.number(),
});
export type PersonPreference = z.infer<typeof personPreferenceSchema>;

const genrePreferenceSchema = z.object({
  type: z.literal('genre'),
  genreId: z.number().int(),
  weight: z.number(),
});
export type GenrePreference = z.infer<typeof genrePreferenceSchema>;

export const scoringPreferenceSchema = z.discriminatedUnion('type', [
  personPreferenceSchema,
  genrePreferenceSchema,
]);
export type ScoringPreference = z.infer<typeof scoringPreferenceSchema>;
