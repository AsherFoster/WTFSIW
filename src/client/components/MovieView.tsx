import React, {useEffect} from 'react';
import {useDispatch, useStore} from '../store/Store';
import {getMovie} from '../api';
import './MovieView.css';

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
  const dispatch = useDispatch();
  const store = useStore();
  const {loading, movieResp, preferences} = store;

  useEffect(() => {
    dispatch({type: 'load_preferences'});
  }, []);

  useEffect(() => {
    getMovie(preferences).then((r) =>
      dispatch({type: 'movie_loaded', payload: r})
    );
  }, [preferences]);

  function reloadMovie() {
    // IDK how async reducers are supposed to work. This'll do for now :shrug:
    dispatch({type: 'start_loading'});
    getMovie(preferences).then((r) =>
      dispatch({type: 'movie_loaded', payload: r})
    );
  }

  if (loading) {
    return (
      <>
        <div className="MovieView-placeholder" />
      </>
    );
  }

  if (!movieResp || 'error' in movieResp) {
    return (
      <>
        <h2>Fuck. Something went wrong.</h2>
        <button onClick={() => fetchMovie(store, dispatch)}>Try again</button>
        {movieResp && (
          <p>
            {movieResp.message} ({movieResp.error})
          </p>
        )}
      </>
    );
  }

  const {movie, actions} = movieResp;

  return (
    <>
      <h2>{movie.title}</h2>
      <p>
        {movie.overview} -&nbsp;
        <a href={SOURCE_PAGE_BASE + movie.id}>View on TMDb</a>
      </p>
      <ul className="MovieView-actions">
        {actions.map((action, i) => (
          <li key={i}>
            <button
              className="MovieView-action"
              onClick={() =>
                dispatch({type: 'add_preference', payload: action})
              }
            >
              {action.name}
            </button>
          </li>
        ))}
        <li>
          <button className="MovieView-action" onClick={reloadMovie}>
            Give me another fucking movie
          </button>
        </li>
      </ul>
    </>
  );
};

export default MovieView;
