import {Measure, MeasureRamBufferState} from '@src/store/state';

const measureVertices: number[] = [];

export const getMeasureVertices = (): number[] => {
  return measureVertices;
};

export const resetMeasureVertices = (): void => {
  measureVertices.length = 0;
};

export const addMeasureVertices = (
  bufferState: MeasureRamBufferState,
  {id, pointX, width, middleLineWidth, middleLinePosition}: Measure
): MeasureRamBufferState => {
  const leftTriangles = [
    pointX,
    2,
    0,
    pointX,
    0,
    0,
    pointX,
    2,
    1, //cheat with a z value of 1 which will be interpreted in the shader to add width
    pointX,
    0,
    0,
    pointX,
    2,
    1,
    pointX,
    0,
    1,
  ];

  const rightTriangles = [
    pointX + width,
    2,
    0,
    pointX + width,
    0,
    0,
    pointX + width,
    2,
    1,
    pointX + width,
    0,
    0,
    pointX + width,
    2,
    1,
    pointX + width,
    0,
    1,
  ];

  const middleTriangles = [
    pointX,
    middleLinePosition,
    0,
    pointX,
    middleLinePosition + middleLineWidth,
    0,
    pointX + width,
    middleLinePosition,
    0,
    pointX,
    middleLinePosition + middleLineWidth,
    0,
    pointX + width,
    middleLinePosition,
    0,
    pointX + width,
    middleLinePosition + middleLineWidth,
    0,
  ];

  const vertices = [...leftTriangles, ...rightTriangles, ...middleTriangles];

  const nextIndex = measureVertices.length;

  measureVertices.push(...vertices);

  return {
    ...bufferState,
    measureIndexes: [
      ...bufferState.measureIndexes,
      {
        measureId: id,
        index: nextIndex,
      },
    ],
    isDirty: true,
  };
};

export const replaceMeasureVertices = (
  bufferState: MeasureRamBufferState,
  measures: Measure[]
): MeasureRamBufferState => {
  resetMeasureVertices();
  let nextState: MeasureRamBufferState = {
    ...bufferState,
    isDirty: true,
    measureIndexes: [],
  };

  measures.forEach(
    (measure) => (nextState = addMeasureVertices(nextState, measure))
  );

  return nextState;
};
