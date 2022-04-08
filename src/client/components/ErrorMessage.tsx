import React from 'react';
import {useDispatch, useStore} from '../store/Store';
import {getMovie} from '../api';
import type {ErrorResponse} from '../../shared/clientapi/Response';

const ErrorMessage = ({resp}: {resp: ErrorResponse}) => {
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
      <h2>Fuck. Something went wrong.</h2>
      <button onClick={reloadMovie}>Try again</button>
      {resp && (
        <p>
          {resp.message} ({resp.error})
        </p>
      )}
    </>
  );
};

export default ErrorMessage;
