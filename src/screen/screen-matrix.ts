import {pixelSizeToClipspaceSize} from '@src/utils/conversions';
import {ScreenMatrixes, ScreenState} from 'src/store/state';

export const calculateXTranslation = ({
  containerWidth,
  xTranslation,
}: Pick<ScreenState, 'containerWidth'> &
  Pick<ScreenMatrixes, 'xTranslation'>): number => {
  return pixelSizeToClipspaceSize({containerWidth}, xTranslation);
};

export const calculateXScale = ({
  pxToMm,
  containerWidth,
  displayRate,
}: Pick<ScreenState, 'pxToMm' | 'containerWidth' | 'displayRate'>): number => {
  const pointsPerSecond = (pxToMm * containerWidth) / displayRate;
  const displayRateScaleFactor = 1 / (pointsPerSecond * 1000);
  return displayRateScaleFactor;
};
