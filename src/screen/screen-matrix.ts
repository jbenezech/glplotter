import {pixelSizeToClipspaceSize} from '@src/utils/conversions';
import {ScreenState} from 'src/store/state';

export const calculateXTranslation = (screenState: ScreenState): number => {
  return pixelSizeToClipspaceSize(
    screenState,
    screenState.matrixes.xTranslation
  );
};

export const calculateXScale = (screenState: ScreenState): number => {
  const pointsPerSecond =
    (screenState.mmToPx * screenState.containerWidth) / screenState.displayRate;
  const displayRateScaleFactor = 1 / (pointsPerSecond * 1000);
  return displayRateScaleFactor;
};
