/**
 * Units:
 * - Point : 1 unit of signal data as sent by the simulator. This is a decimal
 * representation. The width of the screen for instance if expressed in points,
 * which is not an integer
 *
 * - Vertice: 1 unit of signal data in the javascript buffer. This is an integer
 *
 * - Coordonate:  1 unit of signal data in the vertex buffer
 *
 * - Clipspace: unit of screen in webgl canvas. 0-2
 *
 */

import {ScreenState} from 'src/store/state';

export function verticeSizeToCoordonateSize(size: number): number {
  return size * 3;
}

export function coordonateSizeToVerticeSize(size: number): number {
  return size / 3;
}

export function getNbrVerticesPerScreen(screenState: ScreenState): number {
  return Math.round(screenSizeToPointSize(screenState));
}

export function getNbrCoordonatesAfterRotations(
  screenState: ScreenState,
  rotations: number
): number {
  const nbrPoints = verticeSizeToCoordonateSize(
    rotations * screenSizeToPointSize(screenState)
  );

  const nbrCoordonates = 3 * Math.floor(Math.abs(nbrPoints) / 3);

  return rotations > 0 ? nbrCoordonates : -nbrCoordonates;
}

export function getNbrVerticesAfterRotations(
  screenState: ScreenState,
  rotations: number
): number {
  return coordonateSizeToVerticeSize(
    getNbrCoordonatesAfterRotations(screenState, rotations)
  );
}

export function getNbrCoordonatesPerScreen(screenState: ScreenState): number {
  return verticeSizeToCoordonateSize(getNbrVerticesPerScreen(screenState));
}

export function coordonateSizeToClipspaceSize(
  screenState: ScreenState,
  coordonateSize: number
): number {
  const ratio =
    coordonateSize /
    verticeSizeToCoordonateSize(screenSizeToPointSize(screenState));
  return 2 * ratio;
}

export function clipspaceSizeToVerticeSize(
  screenState: ScreenState,
  clipspaceSize: number
): number {
  const nbrVertices = (clipspaceSize * screenSizeToPointSize(screenState)) / 2;
  return Math.round(nbrVertices);
}

export function verticeSizeToClipspaceSize(
  screenState: ScreenState,
  verticeSize: number
): number {
  const clipspace = (2 * verticeSize) / screenSizeToPointSize(screenState);
  return clipspace;
}

export function pointSizeToPixelSize(
  screenState: ScreenState,
  pointSize: number
): number {
  const pointsPerWindow = screenSizeToPointSize(screenState);

  const ratio = screenState.containerWidth / pointsPerWindow;
  return pointSize * ratio;
}

export function pixelSizeToPointSize(
  screenState: ScreenState,
  pixelSize: number
): number {
  const pointsPerWindow = screenSizeToPointSize(screenState);

  const ratio = pointsPerWindow / screenState.containerWidth;
  return pixelSize * ratio;
}

export function pixelSizeToClipspaceSize(
  screenState: ScreenState,
  pixelSize: number
): number {
  const pixelToClipspace = 2 / screenState.containerWidth;
  return pixelSize * pixelToClipspace;
}

export const screenSizeToPointSize = ({
  mmToPx,
  containerWidth,
  displayRate,
  pitch,
}: ScreenState): number => {
  const windowWidthInMm = mmToPx * containerWidth;

  const pointsPerSecond = windowWidthInMm / displayRate;

  return (pointsPerSecond * 1000) / pitch;
};
