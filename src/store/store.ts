import {ReducerActions} from './actions';
import {reducer} from './reducer';
import {State} from './state';
import {initialState} from './values';

const deepFreeze = (item: State): State => {
  const complex = Object(item) === item;
  if (Object.isFrozen(item) || !complex) return item;
  Object.values(item).forEach(deepFreeze);
  return Object.freeze(item);
};

export interface Store {
  getState: () => State;
  dispatch: (action: ReducerActions) => State;
}

export const createStore = (initState = initialState): Store => {
  let state = deepFreeze(initState);
  return {
    getState: (): State => state,
    dispatch: (action: ReducerActions): State =>
      (state = deepFreeze(reducer(state, action))),
  };
};
