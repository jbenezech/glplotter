import {SignalConfig} from 'glplotter';
import {ReducerAction} from '.';

export const AddSignalActionType = 'signal/add';
export type AddSignalPayload = SignalConfig;
type AddSignalAction = ReducerAction<
  typeof AddSignalActionType,
  AddSignalPayload
>;

export const RemoveSignalActionType = 'signal/remove';
export interface RemoveSignalPayload {
  id: string;
}
type RemoveSignalAction = ReducerAction<
  typeof RemoveSignalActionType,
  RemoveSignalPayload
>;

export const ReplaceSignalsActionType = 'signal/replaceAll';
export interface ReplaceSignalsPayload {
  signals: SignalConfig[];
}
type ReplaceSignalsAction = ReducerAction<
  typeof ReplaceSignalsActionType,
  ReplaceSignalsPayload
>;

export const DrawSignalsActionType = 'signal/drawAll';
export interface DrawSignalsPayload {
  gl: WebGL2RenderingContext;
}
type DrawSignalsAction = ReducerAction<
  typeof DrawSignalsActionType,
  DrawSignalsPayload
>;

export const ZoomSignalsActionType = 'signal/zoom';
export interface ZoomSignalsPayload {
  signalIds: string[];
  ratio: number;
}
type ZoomSignalsAction = ReducerAction<
  typeof ZoomSignalsActionType,
  ZoomSignalsPayload
>;

export const PositionSignalActionType = 'signal/position';
export interface PositionSignalPayload {
  signalId: string;
  yPosition: number;
}
type PositionSignalAction = ReducerAction<
  typeof PositionSignalActionType,
  PositionSignalPayload
>;

export const DestroyAllSignalActionType = 'signal/destroyAll';
type DestroyAllSignalPayload = Record<string, never>;
type DestroyAllSignalAction = ReducerAction<
  typeof DestroyAllSignalActionType,
  DestroyAllSignalPayload
>;

export type SignalActions =
  | AddSignalAction
  | RemoveSignalAction
  | ReplaceSignalsAction
  | DrawSignalsAction
  | ZoomSignalsAction
  | PositionSignalAction
  | DestroyAllSignalAction;
