import {ReducerAction} from '.';

export const AddSignalActionType = 'signal/add';
export interface AddSignalPayload {
  id: string;
  containerId: string;
  channelId: string;
  color: string | number[];
  visible: boolean;
  amplitude: number;
  pitch: number;
  chartHeight: number;
  yPosition: number;
}
type AddSignalAction = ReducerAction<
  typeof AddSignalActionType,
  AddSignalPayload
>;

export const DrawSignalsActionType = 'signal/drawAll';
export interface DrawSignalsPayload {
  containerId: string;
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

export type SignalActions =
  | AddSignalAction
  | DrawSignalsAction
  | ZoomSignalsAction
  | PositionSignalAction;
