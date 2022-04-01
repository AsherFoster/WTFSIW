import type {Dispatch, Reducer} from 'react';
import type {
  ErrorResponse,
  ScoredMovieResponse,
} from '../../shared/clientapi/Response';
import type {ScoringPreference} from '../../shared/clientapi/Scoring';
import {assertNever} from '../../shared/util';

export interface State {
  loading: boolean;
  movieResp: ScoredMovieResponse | ErrorResponse | null;
  preferences: ScoringPreference[];
}

interface AddPreferenceAction {
  type: 'add_preference';
  payload: ScoringPreference;
}
interface StartLoadingAction {
  type: 'start_loading';
}
interface MovieLoadedAction {
  type: 'movie_loaded';
  payload: ScoredMovieResponse | ErrorResponse;
}

export type Action =
  | AddPreferenceAction
  | StartLoadingAction
  | MovieLoadedAction;
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
          ...state.preferences.filter((p: ScoringPreference) => {
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
    case 'start_loading': {
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
