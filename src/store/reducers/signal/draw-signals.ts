import {
  calculateDrawBatchSize,
  deleteGpuBuffer,
  getGpuBuffer,
} from '@src/signal/gpu-buffers';
import {applyPostDrawScreenTransition} from '@src/screen/screen-transitions';
import {DrawSignalsPayload} from '@src/store/actions/signal-actions';
import {Signal, State} from 'src/store/state';
import {signalShader} from '@src/signal/gl/signal-shader';
import {drawRotatingSignal} from '@src/signal/drawers/drawer-rotating';
import {drawManualSignal} from '@src/signal/drawers/drawer-manual';
import {drawAutomoveSignal} from '@src/signal/drawers/drawer-automove';

export const drawSignals = (state: State, {gl}: DrawSignalsPayload): State => {
  const nextState = executeScheduledDestroy(state, gl);

  if (state.gpuBuffers.length === 0) {
    //if no more buffers, also delete the shader
    signalShader.delete(gl);
  }

  return drawVisibleSignals(nextState, gl) || state;
};

const executeScheduledDestroy = (
  state: State,
  gl: WebGL2RenderingContext
): State => {
  state.gpuBuffers
    .filter((buffer) => !!buffer.scheduledForDeletion)
    .forEach((buffer) => {
      deleteGpuBuffer(buffer, gl);
    });

  return {
    ...state,
    gpuBuffers: state.gpuBuffers.filter(
      (buffer) => !buffer.scheduledForDeletion
    ),
  };
};

const drawVisibleSignals = (
  state: State,
  gl: WebGL2RenderingContext
): State | null => {
  //We want to keep all signals in sync
  //so we start by checking how many points
  //each buffer is able to draw

  let {screenState} = state;
  const {gpuBuffers} = state;

  const nbrCoordonatesToDraw = calculateDrawBatchSize({
    ...screenState,
    gpuBuffers,
  });

  const totalCoordonatesAvailable =
    screenState.totalCoordonatesDrawn + nbrCoordonatesToDraw;

  gpuBuffers.forEach((gpuBufferState) => {
    //for all signals of that channel
    //draw the buffer with the corresponding shader configuration
    //Do that here so that we do not have to rebing the buffer

    const {channelId} = gpuBufferState;

    const buffer = getGpuBuffer(channelId);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const channelSignals = gatherChannelSignalsToDraw(state, channelId);
    channelSignals.forEach((signal) => {
      drawSignal(state, signal, totalCoordonatesAvailable, gl);
    });
  });

  screenState = applyPostDrawScreenTransition(
    screenState,
    totalCoordonatesAvailable
  );

  return {
    ...state,
    screenState,
  };
};

const gatherChannelSignalsToDraw = (
  state: State,
  channelId: string
): Signal[] => {
  return state.signals
    .filter((signal) => signal.channelId === channelId)
    .filter((signal) => !!signal.visible);
};

const drawSignal = (
  state: State,
  signal: Signal,
  totalCoordonatesAvailable: number,
  gl: WebGL2RenderingContext
): void => {
  switch (state.screenState.drawingMode) {
    case 'AUTOMOVE':
      return drawAutomoveSignal(state, signal, totalCoordonatesAvailable, gl);
    case 'MANUAL':
      return drawManualSignal(state, signal, totalCoordonatesAvailable, gl);
      break;
    default:
      return drawRotatingSignal(state, signal, totalCoordonatesAvailable, gl);
  }
};
