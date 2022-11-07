import {DataActions} from './data-actions';
import {MeasureActions} from './measure-actions';
import {ScreenActions} from './screen-actions';
import {SignalActions} from './signal-actions';

export interface ReducerAction<T, P> {
  type: T;
  payload: P;
}

export type ReducerActions =
  | DataActions
  | ScreenActions
  | SignalActions
  | MeasureActions;
