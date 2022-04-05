import type {Dispatch, Reducer} from 'react';
import type {
  ErrorResponse,
  ScoredMovieResponse,
} from '../../shared/clientapi/Response';
import type {ScoringPreference} from '../../shared/clientapi/Scoring';
import {assertNever} from '../../shared/util';

const PREFERENCES_STORAGE_KEY = 'wtfsiw_preferences';

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
interface LoadPreferencesAction {
  type: 'load_preferences';
}

export type Action =
  | AddPreferenceAction
  | StartLoadingAction
  | MovieLoadedAction
  | LoadPreferencesAction;
export type StoreDispatch = Dispatch<Action>;

export const stateReducer: Reducer<State, Action> = (
  state: State,
  action: Action | Record<string, never> = {}
) => {
  switch (action.type) {
    case 'load_preferences':
      try {
        const prefs = localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (prefs) {
          return {
            ...state,
            preferences: JSON.parse(prefs),
          };
        }
      } catch (e) {
        // Failed to parse or something, remove it
        localStorage.removeItem(PREFERENCES_STORAGE_KEY);
        // TODO sentry report
      }
      return {...state};
    case 'add_preference': {
      const newPrefs = [
        ...state.preferences.filter((p: ScoringPreference) => {
          // Remove preferences for the same person
          if (p.type === 'person') {
            return (
              action.payload.type !== 'person' ||
              p.personId !== action.payload.personId
            );
          }
          return (
            action.payload.type !== 'genre' ||
            p.genreId !== action.payload.genreId
          );
        }),
        {
          type: action.payload.type,
          weight: action.payload.weight,
          personId: (action.payload as any).personId,
          genreId: (action.payload as any).genreId,
        },
      ];

      try {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newPrefs));
      } catch (e) {
        // TODO sentry report
      }

      return {
        ...state,
        preferences: newPrefs,
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
