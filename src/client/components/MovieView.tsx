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
  const loadingCls = loading ? 'MovieView-content--loading' : '';

  function reloadMovie() {
    // IDK how async reducers are supposed to work. This'll do for now :shrug:
    dispatch({type: 'start_loading'});
    getMovie(preferences ?? []).then((r) =>
      dispatch({type: 'movie_loaded', payload: r})
    );
  }

  useEffect(() => {
    dispatch({type: 'load_preferences'});
  }, []);

  useEffect(() => {
    if (preferences) reloadMovie();
  }, [preferences]);

  if (loading && !movieResp) {
    return (
      <div className={'MovieView-placeholder ' + loadingCls}>
        <h2>Browsing the archives...</h2>
      </div>
    );
  }

  if (!movieResp || 'error' in movieResp) {
    return (
      <div className={loadingCls}>
        <h2>Fuck. Something went wrong.</h2>
        <button onClick={reloadMovie}>Try again</button>
        {movieResp && (
          <p>
            {movieResp.message} ({movieResp.error})
          </p>
        )}
      </div>
    );
  }

  const {movie, actions} = movieResp;

  return (
    <div className={loadingCls}>
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
    </div>
  );
};

export default MovieView;
