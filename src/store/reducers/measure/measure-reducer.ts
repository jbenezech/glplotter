import {drawAutomoveMeasures} from '@src/measure/drawers/drawer-automove';
import {drawManualMeasures} from '@src/measure/drawers/drawer-manual';
import {drawRotatingMeasures} from '@src/measure/drawers/drawer-rotating';
import {measureShader} from '@src/measure/gl/measure-shader';
import {
  bindAndUploadMeasures,
  deleteMeasureBuffer,
} from '@src/measure/gpu-buffer';
import {
  addMeasureVertices,
  replaceMeasureVertices,
  resetMeasureVertices,
} from '@src/measure/ram-buffer';
import {
  AddMeasurePayload,
  DrawMeasuresPayload,
  RemoveMeasurePayload,
  ReplaceMeasuresPayload,
} from '@src/store/actions/measure-actions';
import {colorToGlColor} from '@src/utils/color';
import {pixelSizeToPointSize} from '@src/utils/conversions';
import {Measure, State} from '../../state';

const mapMeasureConfig = (
  state: State,
  {id, pixelTop, timestamp, pixelWidth, color}: AddMeasurePayload
): Measure => {
  const {screenState} = state;
  const {containerHeight} = screenState;

  const width = pixelSizeToPointSize(screenState, pixelWidth);
  const middleLineWidth = 1 / containerHeight;
  const middleLinePosition =
    1 - (pixelTop * 1) / containerHeight + middleLineWidth / 2;

  return {
    id,
    pointX: timestamp,
    middleLinePosition,
    width: width,
    middleLineWidth: middleLineWidth,
    text: `${Math.abs(Math.round(width))}ms`,
    color: colorToGlColor(color),
  };
};

export const addMeasure = (state: State, payload: AddMeasurePayload): State => {
  const measure = mapMeasureConfig(state, payload);

  return {
    ...state,
    measureRamBuffer: addMeasureVertices(state.measureRamBuffer, measure),
    measures: [...state.measures, measure],
  };
};

export const removeMeasure = (
  state: State,
  {id}: RemoveMeasurePayload
): State => {
  const newMeasures = state.measures.filter((measure) => measure.id !== id);
  return {
    ...state,
    measureRamBuffer: replaceMeasureVertices(
      state.measureRamBuffer,
      newMeasures
    ),
    measures: newMeasures,
  };
};

export const replaceMeasures = (
  state: State,
  {measures}: ReplaceMeasuresPayload
): State => {
  const newMeasures = measures.map((measure) =>
    mapMeasureConfig(state, measure)
  );

  return {
    ...state,
    measureRamBuffer: replaceMeasureVertices(
      state.measureRamBuffer,
      newMeasures
    ),
    measures: newMeasures,
  };
};

export const destroyMeasures = (state: State): State => {
  resetMeasureVertices();
  return {
    ...state,
    measures: [],
    measureGpuBuffer: {
      ...state.measureGpuBuffer,
      scheduledForDeletion: true,
    },
  };
};

export const drawMeasures = (
  state: State,
  {gl, textContext}: DrawMeasuresPayload
): State => {
  let nextState = executeScheduledDestroy(state, gl);

  const newGpuState = bindAndUploadMeasures(
    nextState.measureRamBuffer,
    nextState.measureGpuBuffer,
    gl
  );

  nextState = {
    ...nextState,
    measureGpuBuffer: newGpuState,
  };

  switch (state.screenState.drawingMode) {
    case 'AUTOMOVE':
      drawAutomoveMeasures(state, gl, textContext);
      break;
    case 'MANUAL':
      drawManualMeasures(state, gl, textContext);
      break;
    default:
      drawRotatingMeasures(state, gl, textContext);
      break;
  }

  return nextState;
};

const executeScheduledDestroy = (
  state: State,
  gl: WebGL2RenderingContext
): State => {
  const {measureGpuBuffer} = state;
  if (measureGpuBuffer.scheduledForDeletion) {
    deleteMeasureBuffer(gl);
    measureShader.delete(gl);
  }
  return {
    ...state,
    measureGpuBuffer: {
      ...state.measureGpuBuffer,
      scheduledForDeletion: false,
    },
  };
};
