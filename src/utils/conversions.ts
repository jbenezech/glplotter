/**
 * Units:
 * - Point : 1 unit of signal data as sent by the simulator. This is a decimal
 * representation. The width of the screen for instance if expressed in points,
 * which is not an integer
 *
 * - Vertice: 1 unit of signal data in the javascript buffer. This is an integer
 *
 * - Coordonate:  1 unit of signal data in the vertex buffer.
 *   Each vertex is represented by three floating-point numbers that correspond to the x, y, and z coordinates
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

// A point is represented by 3 coordonates (x,y,z)
// A point is a decimal value
// A coordonate is the nearest integer multiple of 3
export function pointSizeToCoordonateSize(size: number): number {
  const decimalValue = 3 * size;
  return 3 * Math.floor(Math.abs(decimalValue) / 3);
}

export function pointSizeToPixelSize(
  {
    pxToMm,
    containerWidth,
    displayRate,
  }: Pick<ScreenState, 'pxToMm' | 'containerWidth' | 'displayRate'>,
  pointSize: number
): number {
  const pointsPerWindow = screenSizeToPointSize({
    pxToMm,
    containerWidth,
    displayRate,
  });

  const ratio = containerWidth / pointsPerWindow;
  return pointSize * ratio;
}

export function pixelSizeToPointSize(
  {pxToMm, displayRate}: Pick<ScreenState, 'pxToMm' | 'displayRate'>,
  pixelSize: number
): number {
  const windowWidthInMm = pxToMm * pixelSize;
  const pointsPerSecond = windowWidthInMm / displayRate;

  return pointsPerSecond * 1000;
}

export function pixelSizeToClipspaceSize(
  {containerWidth}: Pick<ScreenState, 'containerWidth'>,
  pixelSize: number
): number {
  const pixelToClipspace = 2 / containerWidth;
  return pixelSize * pixelToClipspace;
}

export function pixelSizeToVerticeSize(
  {pxToMm, displayRate}: Pick<ScreenState, 'pxToMm' | 'displayRate'>,
  pixelSize: number
): number {
  const nbrVertices = pixelSizeToPointSize(
    {
      pxToMm,
      displayRate,
    },
    pixelSize
  );

  return Math.round(nbrVertices);
}

export const screenSizeToPointSize = ({
  pxToMm,
  containerWidth,
  displayRate,
}: Pick<ScreenState, 'pxToMm' | 'containerWidth' | 'displayRate'>): number => {
  return pixelSizeToPointSize({pxToMm, displayRate}, containerWidth);
};
