import React from 'react';
import {useStore} from '../store/Store';
import {getMovie} from '../api';
import PreferenceAction from './PreferenceAction';

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
  const resp = state.movieResp;

  function fetchMovie() {
    // IDK how async reducers are supposed to work. This'll do for now :shrug:
    dispatch({type: 'start_loading'});
    getMovie(state.preferences).then((r) =>
      dispatch({type: 'movie_loaded', payload: r})
    );
  }

  if (!resp || 'error' in resp) {
    return (
      <>
        <h2>Fuck. Something went wrong.</h2>
        <button onClick={fetchMovie}>Try again</button>
        {resp && (
          <p>
            {resp.message} ({resp.error})
          </p>
        )}
      </>
    );
  }

  const {movie, actions} = resp;

  return (
    <>
      <h2>{movie.title}</h2>
      <p>{movie.overview}</p>
      <div>
        {actions.map((a, i) => (
          <PreferenceAction key={i} preference={a} />
        ))}
      </div>
    </>
  );
};

export default MovieView;
