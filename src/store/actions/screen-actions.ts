import {ReducerAction} from '.';
import {DrawingMode} from '../state';

export const InitializeScreenActionType = 'screen/init';
export interface InitializeScreenPayload {
  container: HTMLElement;
  displayRate: number;
}
type InitializeScreenAction = ReducerAction<
  typeof InitializeScreenActionType,
  InitializeScreenPayload
>;

export const UpdateScreenContainerActionType = 'screen/new-container';
export interface UpdateScreenContainerPayload {
  container: HTMLElement;
}
type UpdateScreenContainerAction = ReducerAction<
  typeof UpdateScreenContainerActionType,
  UpdateScreenContainerPayload
>;

export const UpdateDisplayRateActionType = 'screen/displayRate';
export interface UpdateDisplayRatePayload {
  displayRate: number;
  container: HTMLElement;
}
type UpdateDisplayRateAction = ReducerAction<
  typeof UpdateDisplayRateActionType,
  UpdateDisplayRatePayload
>;

export const SwitchModeActionType = 'screen/switchMode';
export interface SwitchModePayload {
  mode: DrawingMode;
}
type SwitchModeAction = ReducerAction<
  typeof SwitchModeActionType,
  SwitchModePayload
>;

export const MoveScreenActionType = 'screen/move';
export interface MoveScreenPayload {
  translation: number;
}
type MoveScreenAction = ReducerAction<
  typeof MoveScreenActionType,
  MoveScreenPayload
>;

export type ScreenActions =
  | InitializeScreenAction
  | UpdateScreenContainerAction
  | UpdateDisplayRateAction
  | SwitchModeAction
  | MoveScreenAction;
