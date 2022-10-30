import {ReducerActions} from './actions';
import {drawSignals} from './reducers/signal/draw-signals';
import {State} from './state';
import {BufferDataActionType} from './actions/data-actions';
import {
  InitializeScreenActionType,
  MoveScreenActionType,
  SwitchModeActionType,
  UpdateDisplayRateActionType,
  UpdateScreenContainerActionType,
} from './actions/screen-actions';
import {bufferData} from './reducers/data/data-reducer';
import {
  applyContainerChanges,
  initializeScreen,
  moveScreen,
  switchDrawingMode,
} from './reducers/screen/screen-reducer';
import {
  AddSignalActionType,
  DrawSignalsActionType,
  PositionSignalActionType,
  ZoomSignalsActionType,
} from './actions/signal-actions';
import {
  addSignal,
  positionSignal,
  zoomSignals,
} from './reducers/signal/signal-reducer';

export const reducer = (state: State, action: ReducerActions): State => {
  switch (action.type) {
    case BufferDataActionType:
      return bufferData(state, action.payload);

    case InitializeScreenActionType:
      return initializeScreen(state, action.payload);

    case UpdateScreenContainerActionType:
      return applyContainerChanges(state, action.payload);

    case AddSignalActionType:
      return addSignal(state, action.payload);

    case DrawSignalsActionType:
      return drawSignals(state, action.payload);

    case UpdateDisplayRateActionType:
      return initializeScreen(state, action.payload);

    case ZoomSignalsActionType:
      return zoomSignals(state, action.payload);

    case PositionSignalActionType:
      return positionSignal(state, action.payload);

    case SwitchModeActionType:
      return switchDrawingMode(state, action.payload);

    case MoveScreenActionType:
      return moveScreen(state, action.payload);

    default:
      return state;
  }
};
