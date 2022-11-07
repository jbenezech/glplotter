import {MeasureConfig} from 'glplotter';
import {ReducerAction} from '.';

export const AddMeasureActionType = 'measure/add';
export type AddMeasurePayload = MeasureConfig;
type AddMeasureAction = ReducerAction<
  typeof AddMeasureActionType,
  AddMeasurePayload
>;

export const RemoveMeasureActionType = 'measure/remove';
export interface RemoveMeasurePayload {
  id: string;
}
type RemoveMeasureAction = ReducerAction<
  typeof RemoveMeasureActionType,
  RemoveMeasurePayload
>;

export const ReplaceMeasuresActionType = 'measure/replaceAll';
export interface ReplaceMeasuresPayload {
  measures: MeasureConfig[];
}
type ReplaceMeasuresAction = ReducerAction<
  typeof ReplaceMeasuresActionType,
  ReplaceMeasuresPayload
>;

export const DrawMeasuresActionType = 'measure/drawAll';
export interface DrawMeasuresPayload {
  gl: WebGL2RenderingContext;
  textContext: CanvasRenderingContext2D;
}
type DrawMeasuresAction = ReducerAction<
  typeof DrawMeasuresActionType,
  DrawMeasuresPayload
>;

export const DestroyAllMeasureActionType = 'measure/destroyAll';
type DestroyAllMeasurePayload = Record<string, never>;
type DestroyAllMeasureAction = ReducerAction<
  typeof DestroyAllMeasureActionType,
  DestroyAllMeasurePayload
>;

export type MeasureActions =
  | AddMeasureAction
  | RemoveMeasureAction
  | ReplaceMeasuresAction
  | DrawMeasuresAction
  | DestroyAllMeasureAction;
