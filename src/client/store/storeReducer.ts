import type {Dispatch, Reducer} from 'react';
import type {
  ErrorResponse,
  RankedMovieResponse,
} from '../../types/clientapi/Response';
import type {RankingPreference} from '../../types/clientapi/Scoring';
import {assertNever} from '../util';
import {getMovie} from '../api';

export interface State {
  loading: boolean;
  movieResp: RankedMovieResponse | ErrorResponse | null;
  preferences: RankingPreference[];
}

interface AddPreferenceAction {
  type: 'add_preference';
  payload: RankingPreference;
}
interface FetchMovieAction {
  type: 'fetch_movie';
  payload: void;
}
interface MovieLoadedAction {
  type: 'movie_loaded';
  payload: RankedMovieResponse | ErrorResponse;
}

export type Action = AddPreferenceAction | FetchMovieAction | MovieLoadedAction;
export type StoreDispatch = Dispatch<Action>;

export const stateReducer: Reducer<State, Action> = (
  state: State,
  action: Action | Record<string, never> = {}
) => {
  switch (action.type) {
    case 'add_preference': {
      return {
        ...state,
        preferences: [
          ...state.preferences.filter((p: RankingPreference) => {
            if (p.type === 'person') {
              return (
                action.payload.type === 'person' &&
                p.personId === action.payload.personId
              );
            }
            return (
              action.payload.type === 'genre' &&
              p.genreId === action.payload.genreId
            );
          }),
          action.payload,
        ],
      };
    }
    case 'fetch_movie': {
      // TODO how do async actions work again?
      getMovie(state.preferences).then((r) => dispatch());
      return {
        ...state,
        loading: true,
      };
    }
    case 'movie_loaded': {
      return {
        ...state,
        loading: false,
        movieResp: action.payload,
      };
    }
    default:
      assertNever(action);
  }

  return state;
};
