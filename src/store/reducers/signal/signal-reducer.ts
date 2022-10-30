import {
  AddSignalPayload,
  PositionSignalPayload,
  ZoomSignalsPayload,
} from '@src/store/actions/signal-actions';
import {initialSignalState} from '@src/store/values';
import {colorToGlColor} from '@src/utils/color';
import {State} from '../../state';

export const addSignal = (
  state: State,
  {
    id,
    containerId,
    channelId,
    color,
    visible,
    amplitude,
    pitch,
    chartHeight,
    yPosition,
  }: AddSignalPayload
): State => {
  const initialState = {
    ...initialSignalState,
    id,
    containerId,
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
