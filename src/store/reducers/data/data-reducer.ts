import {BufferDataPayload} from '@src/store/actions/data-actions';
import {State} from '@src/store/state';
import {uploadVerticesToGpu} from '@src/signal/gpu-buffers';
import {pointsToLineVertices} from '@src/signal/vertices';

export const bufferData = (state: State, payload: BufferDataPayload): State => {
  const {channelId, gl} = payload;

  const vertices = pointsToLineVertices(payload.points);

  const {gpuBuffers} = state;
  const gpuBufferState = uploadVerticesToGpu(
    gpuBuffers,
    channelId,
    vertices,
    gl
  );

  return {
    ...state,
    gpuBuffers: [
      ...gpuBuffers.filter((buffer) => buffer.channelId !== channelId),
      gpuBufferState,
    ],
  };
};
