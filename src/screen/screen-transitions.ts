import {ScreenState} from '@src/store/state';
import {pointSizeToPixelSize} from '@src/utils/conversions';

interface ScreenTransition {
  lastCoordonatesCountAddedToScreen: number;
}

export const applyPreDrawScreenTransition = (
  state: ScreenState,
  {lastCoordonatesCountAddedToScreen}: ScreenTransition
): ScreenState => {
  //update screen with new positions
  const screenState = {
    ...state,
    totalCoordonatesAdded:
      state.totalCoordonatesDrawn + lastCoordonatesCountAddedToScreen,
  };

  return screenState;
};

export const applyPostDrawScreenTransition = (
  state: ScreenState,
  totalCoordonatesDrawn: number
): ScreenState => {
  const nextState = {
    ...state,
    totalCoordonatesDrawn: totalCoordonatesDrawn,
  };

  if (state.drawingMode !== 'AUTOMOVE') {
    return nextState;
  }

  const nbrPoints = nextState.totalCoordonatesDrawn / 3;

  const newMatrixes = {
    ...state.matrixes,
    xTranslation:
      state.matrixes.xTranslation + pointSizeToPixelSize(state, nbrPoints),
  };

  return {
    ...nextState,
    matrixes: newMatrixes,
  };
};
