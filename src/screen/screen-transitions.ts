import {ScreenState} from '@src/store/state';
import {
  getNbrCoordonatesPerScreen,
  pointSizeToPixelSize,
} from '@src/utils/conversions';

interface ScreenTransition {
  totalCoordonatesAdded: number;
  lastCoordonatesCountAddedToScreen: number;
}

export const applyPreDrawScreenTransition = (
  state: ScreenState,
  {lastCoordonatesCountAddedToScreen}: ScreenTransition
): ScreenState => {
  //update screen with new positions
  let screenState = {
    ...state,
    totalCoordonatesAdded:
      state.totalCoordonatesAdded + lastCoordonatesCountAddedToScreen,
    lastCoordonatesCountAddedToScreen,
    totalCoordonatesAddedToScreen:
      state.totalCoordonatesAddedToScreen + lastCoordonatesCountAddedToScreen,
  };
  // console.log(screenState.pointsPerWindow);
  if (
    screenState.totalCoordonatesAddedToScreen >=
    getNbrCoordonatesPerScreen(screenState)
  ) {
    screenState = {
      ...screenState,
      totalRotations: screenState.totalRotations + 1,
      totalCoordonatesAddedToScreen:
        screenState.totalCoordonatesAddedToScreen -
        getNbrCoordonatesPerScreen(screenState),
    };
  }

  return screenState;
};

export const applyPostDrawScreenTransition = (
  state: ScreenState
): ScreenState => {
  if (state.drawingMode !== 'AUTOMOVE') {
    return state;
  }

  const nbrPoints = state.lastCoordonatesCountAddedToScreen / 3;

  const newMatrixes = {
    ...state.matrixes,
    xTranslation:
      state.matrixes.xTranslation + pointSizeToPixelSize(state, nbrPoints),
  };

  return {
    ...state,
    matrixes: newMatrixes,
  };
};
