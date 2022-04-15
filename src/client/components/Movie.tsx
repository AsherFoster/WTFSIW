import React from 'react';
import type {ClientMovie, ScoringAction} from '../../shared/clientapi/Response';
import {useDispatch, useStore} from '../store/Store';
import {getMovie} from '../api';

const SOURCE_PAGE_BASE = 'https://www.themoviedb.org/movie/';

const Movie = ({
  movie,
  actions,
}: {
  movie: ClientMovie;
  actions: ScoringAction[];
}) => {
  const {preferences} = useStore();
  const dispatch = useDispatch();

  function reloadMovie() {
    // IDK how async reducers are supposed to work. This'll do for now :shrug:
    dispatch({type: 'start_loading'});
    getMovie(preferences ?? []).then((r) =>
      dispatch({type: 'movie_loaded', payload: r})
    );
  }

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
              {action.label}
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

export default Movie;
