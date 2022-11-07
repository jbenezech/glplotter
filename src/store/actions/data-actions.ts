import {Point} from 'glplotter';
import {ReducerAction} from '.';

export const BufferDataActionType = 'data/buffer';
export interface BufferDataPayload {
  channelId: string;
  points: Point[];
  gl: WebGL2RenderingContext;
}
type BufferDataAction = ReducerAction<
  typeof BufferDataActionType,
  BufferDataPayload
>;

export type DataActions = BufferDataAction;
