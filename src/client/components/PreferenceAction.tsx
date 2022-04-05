import React from 'react';
import type {ScoringAction} from '../../shared/clientapi/Response';

const filters = {
  positive: {
    generic: [
      'I fucking love $ movies',
      '$ movies are the fucking best!',
      "I can't get enough of $ movies",
    ],
    genre: ['$ is the best fucking type of movie!'],
    cast: ['$ is hot as fuck!'],
    crew: ['$ makes the best movies!'],
  },
  negative: {
    generic: ['Ew, fuck $', 'Honestly, fuck $'],
    genre: ['$ movies are fucking boring'],
    cast: ['$ killed my fucking dog'],
    crew: ['$ killed my fucking dog'],
  },
};

const PreferenceAction = ({preference}: {preference: ScoringAction}) => {
  return (
    <button style={{padding: 0, background: 'none'}}>
      {preference.name}
    </button>
  );
};

export default PreferenceAction;
