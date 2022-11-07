import {getTotalRotations} from '@src/screen/screen-utils';
import {
  InitializeScreenPayload,
  MoveScreenPayload,
  SwitchModePayload,
  UpdateScreenContainerPayload,
} from '@src/store/actions/screen-actions';
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
  const {screenState} = state;

  const translationReset =
    //No translation in rotating mode
    mode === 'ROTATE'
      ? 0
      : //Switching to manual, go to the end minus 1 screen
      //(last point is on the right of the screen)
      mode === 'MANUAL'
      ? -(screenState.containerWidth - 1) * getTotalRotations(screenState)
      : 0;

  const newMatrix = {
    ...screenState.matrixes,
    xTranslation: translationReset,
  };

  return {
    ...state,
    screenState: {
      ...screenState,
      drawingMode: mode,
      matrixes: newMatrix,
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
  let pxToMm = state.pxToMm;
  if (pxToMm === 0) {
    //Get the reference pxToMm
    const element = document.createElement('div');
    element.id = 'pxToMm';
    element.style.width = '1mm';
    document.body.appendChild(element);
    pxToMm = 1 / element.getBoundingClientRect().width;
    document.body.removeChild(element);
  }

  const newState = {
    ...state,
    pxToMm,
    containerWidth: newContainer.getBoundingClientRect().width,
    containerHeight: newContainer.getBoundingClientRect().height,
  };

  return newState;
};
