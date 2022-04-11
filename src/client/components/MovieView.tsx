import React, {useEffect} from 'react';
import {useDispatch, useStore} from '../store/Store';
import {getMovie} from '../api';
import './MovieView.css';
import Movie from './Movie';
import ErrorMessage from './ErrorMessage';

// const filters = {
//   positive: {
//     generic: [
//       'I fucking love $ movies',
//       '$ movies are the fucking best!',
//       "I can't get enough of $ movies",
//     ],
//     genre: ['$ is the best fucking type of movie!'],
//     cast: ['$ is hot as fuck!'],
//     crew: ['$ makes the best movies!'],
//   },
//   negative: {
//     generic: ['Ew, fuck $', 'Honestly, fuck $'],
//     genre: ['$ movies are fucking boring'],
//     cast: ['$ killed my fucking dog'],
//     crew: ['$ killed my fucking dog'],
//   },
// };

const MovieView = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const {loading, movieResp, preferences} = store;
  const cls = ['MovieView-content', loading && 'MovieView-content--loading']
    .filter((i) => !!i)
    .join(' ');

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

  if (!movieResp) {
    return (
      <div className={cls}>
        <h2>Finding something good...</h2>
      </div>
    );
  }

  return (
    <div className={cls}>
      {'error' in movieResp ? (
        <ErrorMessage resp={movieResp} />
      ) : (
        <Movie movie={movieResp.movie} actions={movieResp.actions} />
      )}
    </div>
  );
};

export default MovieView;
