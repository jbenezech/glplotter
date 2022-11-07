import {resetGpuBuffers} from '@src/signal/gpu-buffers';
import {
  AddSignalPayload,
  PositionSignalPayload,
  RemoveSignalPayload,
  ReplaceSignalsPayload,
  ZoomSignalsPayload,
} from '@src/store/actions/signal-actions';
import {initialSignalState} from '@src/store/values';
import {colorToGlColor} from '@src/utils/color';
import {State} from '../../state';

export const addSignal = (
  state: State,
  {
    id,
    channelId,
    color,
    visible,
    amplitude,
    pitch,
    chartHeight,
    yPosition,
  }: AddSignalPayload
): State => {
  //if we already have the same id, do not add it again
  if (state.signals.find((signal) => signal.id === id) !== undefined) {
    return state;
  }

  const initialState = {
    ...initialSignalState,
    id,
    channelId,
    visible,
    amplitude,
    pitch,
    chartHeight,
    yPosition,
    color: colorToGlColor(color),
  };

  return {
    ...state,
    signals: [...state.signals, initialState],
  };
};

export const removeSignal = (
  state: State,
  {id}: RemoveSignalPayload
): State => {
  return {
    ...state,
    signals: state.signals.filter((signal) => signal.id !== id),
  };
};

export const replaceSignals = (
  state: State,
  {signals}: ReplaceSignalsPayload
): State => {
  return {
    ...state,
    signals: signals.map((signal) => {
      const existingSignal =
        state.signals.find((sig) => sig.id === signal.id) || {};
      return {
        ...initialSignalState,
        ...existingSignal,
        ...signal,
        color: colorToGlColor(signal.color),
      };
    }),
  };
};

export const zoomSignals = (
  state: State,
  {signalIds, ratio}: ZoomSignalsPayload
): State => {
  const signals = state.signals.map((signal) => {
    if (!signalIds.includes(signal.id)) {
      return signal;
    }
    return {
      ...signal,
      zoomRatio: ratio,
    };
  });

  return {
    ...state,
    signals,
  };
};

export const positionSignal = (
  state: State,
  {signalId, yPosition}: PositionSignalPayload
): State => {
  const signals = state.signals.map((signal) => {
    if (signalId !== signal.id) {
      return signal;
    }
    return {
      ...signal,
      yPosition: yPosition,
    };
  });

  return {
    ...state,
    signals,
  };
};

export const destroySignalBuffers = (state: State): State => {
  resetGpuBuffers();
  return {
    ...state,
    signals: [],
    gpuBuffers: state.gpuBuffers.map((buffer) => ({
      ...buffer,
      scheduledForDeletion: true,
    })),
  };
};
