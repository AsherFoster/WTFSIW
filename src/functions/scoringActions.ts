import type {Credit, Movie} from '../shared/database';
import type {ScoringPreference} from '../shared/clientapi/Scoring';
import type {ScoringAction} from '../shared/clientapi/Response';
import {assertNever, pick, sample} from '../shared/util';
import {SUGGESTED_ACTION_COUNT} from '../shared/config';
import {Storage} from './storage';

type Templates = Record<ScoringPreference['type'] | 'generic', string[]>;
interface AllTemplates {
  positive: Templates;
  negative: Templates;
}
const allTemplates: AllTemplates = {
  positive: {
    generic: [
      'I fucking love $ movies',
      '$ movies are the fucking best!',
      "I can't get enough of $ movies",
    ],
    genre: ['$ is the best fucking type of movie!'],
    person: ['$ is hot as fuck!', '$ makes the best movies!'],
  },
  negative: {
    generic: ['Ew, fuck $', 'Honestly, fuck $'],
    genre: ['$ movies are fucking boring'],
    person: ['$ killed my fucking dog'],
  },
};

/** Do you matter in the grand scheme of things? This function knows. */
function isMeaningfulPerson(credit: Credit): boolean {
  if (credit.creditType === 'crew' && credit.job) {
    // Director -> Yup
    // Caterer -> Probably not
    return ['director'].includes(credit.job.toLowerCase());
  } else if (credit.creditType === 'cast') {
    // Thanos -> Yup
    // Frightened inmate #2 -> Probably not

    // arbitrarily say only the first 5 actors matter
    return typeof credit.creditNumber === 'number' && credit.creditNumber < 5;
  }
  return false;
}

async function generatePreferences(
  movie: Movie,
  existingPrefs: ScoringPreference[]
): Promise<ScoringPreference[]> {
  const genrePrefs = movie.genres
    .filter(
      (g) => !existingPrefs.find((p) => p.type === 'genre' && p.genreId === g)
    )
    .map(
      (g) =>
        ({
          type: 'genre',
          genreId: g,
          weight: Math.random() > 0.5 ? -1 : 1, // TODO tune weights
        } as ScoringAction)
    );
  const creditPrefs = movie.credits
    .filter(
      (c) =>
        !existingPrefs.find(
          (p) => p.type === 'person' && p.personId === c.personId
        )
    )
    .filter((c) => isMeaningfulPerson(c))
    .map(
      (c) =>
        ({
          type: 'person',
          personId: c.personId,
          weight: Math.random() > 0.5 ? -1 : 1, // TODO tune weights
        } as ScoringPreference)
    );

  return sample([...genrePrefs, ...creditPrefs], SUGGESTED_ACTION_COUNT);
}

export async function generateActions(
  storage: Storage,
  movie: Movie,
  existingPrefs: ScoringPreference[]
): Promise<ScoringAction[]> {
  const prefs = await generatePreferences(movie, existingPrefs);

  return Promise.all(
    prefs.map(async (p) => {
      const templates =
        p.weight > 0 ? allTemplates.positive : allTemplates.negative;

      if (p.type === 'genre') {
        const template = pick(templates.generic.concat(templates.genre));
        const genreName = await storage.getGenre(p.genreId);

        return {...p, label: template.replaceAll('$', genreName!.name)};
      } else if (p.type === 'person') {
        const template = pick(templates.generic.concat(templates.person));
        const credit = movie.credits.find((m) => m.personId === p.personId)!;
        return {
          ...p,
          label: template.replaceAll('$', `${credit.name} (${credit.job})`),
        };
      } else assertNever(p);
    })
  );
}
