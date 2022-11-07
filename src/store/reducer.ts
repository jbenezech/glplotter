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
  DestroyAllSignalActionType,
  DrawSignalsActionType,
  PositionSignalActionType,
  RemoveSignalActionType,
  ReplaceSignalsActionType,
  ZoomSignalsActionType,
} from './actions/signal-actions';
import {
  addSignal,
  destroySignalBuffers,
  positionSignal,
  removeSignal,
  replaceSignals,
  zoomSignals,
} from './reducers/signal/signal-reducer';
import {
  AddMeasureActionType,
  DestroyAllMeasureActionType,
  DrawMeasuresActionType,
  RemoveMeasureActionType,
  ReplaceMeasuresActionType,
} from './actions/measure-actions';
import {
  addMeasure,
  destroyMeasures,
  drawMeasures,
  removeMeasure,
  replaceMeasures,
} from './reducers/measure/measure-reducer';

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

    case RemoveSignalActionType:
      return removeSignal(state, action.payload);

    case ReplaceSignalsActionType:
      return replaceSignals(state, action.payload);

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

    case DestroyAllSignalActionType:
      return destroySignalBuffers(state);

    case AddMeasureActionType:
      return addMeasure(state, action.payload);

    case RemoveMeasureActionType:
      return removeMeasure(state, action.payload);

    case ReplaceMeasuresActionType:
      return replaceMeasures(state, action.payload);

    case DestroyAllMeasureActionType:
      return destroyMeasures(state);

    case DrawMeasuresActionType:
      return drawMeasures(state, action.payload);

    default:
      return state;
  }
};
