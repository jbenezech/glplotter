import {BufferDataPayload} from '@src/store/actions/data-actions';
import {State} from '@src/store/state';
import {bufferDataInRam} from '@src/signal/ram-buffers';

export const bufferData = (state: State, payload: BufferDataPayload): State => {
  return {
    ...state,
    ramBuffers: [
      ...state.ramBuffers.filter(
        (buffer) => buffer.channelId !== payload.channelId
      ),
      bufferDataInRam(state, payload.channelId, payload.points),
    ],
  };
};
