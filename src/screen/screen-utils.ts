import {ScreenState} from '@src/store/state';
import {
  coordonateSizeToVerticeSize,
  pixelSizeToPointSize,
  pointSizeToCoordonateSize,
  pointSizeToPixelSize,
  screenSizeToPointSize,
} from '@src/utils/conversions';

export function getNbrVerticesPerScreen(screenState: ScreenState): number {
  return Math.round(screenSizeToPointSize(screenState));
}

export function getNbrCoordonatesAfterRotations(
  screenState: ScreenState,
  rotations: number
): number {
  const nbrPoints = rotations * screenSizeToPointSize(screenState);
  const nbrCoordonates = pointSizeToCoordonateSize(nbrPoints);

  return rotations > 0 ? nbrCoordonates : -nbrCoordonates;
}

export function getTotalRotations(state: ScreenState): number {
  const pointsPerWindow = screenSizeToPointSize(state);
  const coordonatesPerWindow = pointSizeToCoordonateSize(pointsPerWindow);

  const {totalCoordonatesDrawn} = state;
  return Math.floor(totalCoordonatesDrawn / coordonatesPerWindow);
}

export function getTimestampAtPixelPosition(
  screenState: ScreenState,
  pixelX: number
): number {
  switch (screenState.drawingMode) {
    case 'ROTATE':
      return getTimestampAtPositionInRotateMode(screenState, pixelX);
    case 'MANUAL':
      return getTimestampAtPositionInManualMode(screenState, pixelX);
    default:
      //@TODO
      return 0;
  }
}

function getTimestampAtPositionInRotateMode(
  screenState: ScreenState,
  pixelX: number
): number {
  let positionPixelShiftingFactor = 0;
  const totalRotations = getTotalRotations(screenState);

  if (totalRotations === 0) {
    return getTimestampAtPositionInManualMode(screenState, pixelX);
  }

  const totalRotationsInPixel = totalRotations * screenState.containerWidth;
  const totalPointsAdded = coordonateSizeToVerticeSize(
    screenState.totalCoordonatesDrawn
  );
  const totalPixelsAdded = pointSizeToPixelSize(screenState, totalPointsAdded);

  const currentWindowXOfEraser = totalPixelsAdded - totalRotationsInPixel;

  if (pixelX < currentWindowXOfEraser) {
    //we are on the left side of the eraser, all rotations have already
    //been applied
    positionPixelShiftingFactor = totalRotationsInPixel;
  } else {
    //we are on the right side of the eraser, 1 rotation has not yet been applied
    positionPixelShiftingFactor =
      totalRotationsInPixel - screenState.containerWidth;
  }

  const xToPoints =
    screenSizeToPointSize(screenState) / screenState.containerWidth;

  const rotatedPositionX = pixelX + positionPixelShiftingFactor;

  const currentX = xToPoints * rotatedPositionX;

  return currentX;
}

function getTimestampAtPositionInManualMode(
  screenState: ScreenState,
  pixelX: number
): number {
  const translatedPixelPosition = pixelX - screenState.matrixes.xTranslation;
  const currentX = pixelSizeToPointSize(screenState, translatedPixelPosition);
  return currentX;
}
