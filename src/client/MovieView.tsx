import React from 'react';
import {useStore} from './store/Store';

const SOURCE_PAGE_BASE = 'https://www.themoviedb.org/movie/';

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

const MovieView = () => {
  const [state, dispatch] = useStore();
  return <p>Hi, I'm a movie!</p>;
};

export default MovieView;
