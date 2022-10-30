import {
  InitializeScreenPayload,
  MoveScreenPayload,
  SwitchModePayload,
  UpdateScreenContainerPayload,
} from '@src/store/actions/screen-actions';
import {
  screenSizeToPointSize,
  getNbrCoordonatesAfterRotations,
  getNbrCoordonatesPerScreen,
} from '@src/utils/conversions';
import {ScreenState, State} from '../../state';

export const initializeScreen = (
  state: State,
  {container, displayRate}: InitializeScreenPayload
): State => {
  const newScreenState = setStateFromContainer(
    {
      ...state.screenState,
      displayRate,
    },
    container
  );

  return {
    ...state,
    screenState: newScreenState,
  };
};

export const applyContainerChanges = (
  state: State,
  {container}: UpdateScreenContainerPayload
): State => {
  const newScreenState = setStateFromContainer(
    {
      ...state.screenState,
    },
    container
  );

  return {
    ...state,
    screenState: newScreenState,
  };
};

export const switchDrawingMode = (
  state: State,
  {mode}: SwitchModePayload
): State => {
  return {
    ...state,
    screenState: {
      ...state.screenState,
      drawingMode: mode,
    },
  };
};

export const moveScreen = (
  state: State,
  {translation}: MoveScreenPayload
): State => {
  const newMatrix = {
    ...state.screenState.matrixes,
    xTranslation: state.screenState.matrixes.xTranslation + translation,
  };

  return {
    ...state,
    screenState: {
      ...state.screenState,
      matrixes: newMatrix,
    },
  };
};

const setStateFromContainer = (
  state: ScreenState,
  newContainer: HTMLElement
): ScreenState => {
  let mmToPx = state.mmToPx;
  if (mmToPx === 0) {
    //Get the reference mmToPx
    const element = document.createElement('div');
    element.id = 'mmToPx';
    element.style.width = '1mm';
    document.body.appendChild(element);
    mmToPx = 1 / element.getBoundingClientRect().width;
    document.body.removeChild(element);
  }

  let newState = {
    ...state,
    mmToPx,
    containerWidth: newContainer.getBoundingClientRect().width,
    containerHeight: newContainer.getBoundingClientRect().height,
  };

  const pointsPerWindow = screenSizeToPointSize(newState);
  if (pointsPerWindow !== 0) {
    newState = {
      ...newState,
      totalRotations: Math.floor(
        state.totalCoordonatesAdded / getNbrCoordonatesPerScreen(newState)
      ),
      totalCoordonatesAddedToScreen:
        state.totalCoordonatesAdded -
        getNbrCoordonatesAfterRotations(newState, newState.totalRotations),
    };
  }

  return newState;
};
