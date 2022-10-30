import {Point} from '@src/structures/Point';
import {ReducerAction} from '.';

export const BufferDataActionType = 'data/buffer';
export interface BufferDataPayload {
  channelId: string;
  points: Point[];
}
type BufferDataAction = ReducerAction<
  typeof BufferDataActionType,
  BufferDataPayload
>;

export type DataActions = BufferDataAction;
