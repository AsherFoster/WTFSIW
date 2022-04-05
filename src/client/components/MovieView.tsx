import React from 'react';
import {useStore} from '../store/Store';
import {getMovie} from '../api';
import PreferenceAction from './PreferenceAction';

const SOURCE_PAGE_BASE = 'https://www.themoviedb.org/movie/';

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
      <ul>
        {actions.map((a, i) => (
          <li>
            <PreferenceAction key={i} preference={a} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default MovieView;
