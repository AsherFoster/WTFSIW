import React, {useContext, useReducer} from 'react';
import {State, stateReducer, StoreDispatch} from './storeReducer';

export const initialState: State = {
  loading: true,
  movieResp: null,
  preferences: null,
};

type StoreContextValue = [State, StoreDispatch];
const StoreContext = React.createContext<StoreContextValue>([
  initialState,
  () => {},
]);

export const Store = ({children}: React.PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext)[0];
export const useDispatch = () => useContext(StoreContext)[1];
