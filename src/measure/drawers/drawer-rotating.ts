import {
  getNbrCoordonatesAfterRotations,
  getNbrVerticesPerScreen,
  getTotalRotations,
} from '@src/screen/screen-utils';
import {State} from '@src/store/state';
import {coordonateSizeToVerticeSize} from '@src/utils/conversions';
import {mat4} from 'gl-matrix';
import {measureVerticeSize} from '../measure-conversions';
import {calculateMatrixes, setVertexAttributes} from './drawer';
import {drawText} from './text-drawer';

const drawLeft = (
  state: State,
  gl: WebGL2RenderingContext,
  textContext: CanvasRenderingContext2D
): void => {
  const {screenState} = state;

  const totalRotations = getTotalRotations(screenState);
  const nbrCoordonatesToStartOfScreen = getNbrCoordonatesAfterRotations(
    screenState,
    totalRotations
  );

  const leftMeasures = state.measures.filter(
    (measure) =>
      measure.pointX <
        coordonateSizeToVerticeSize(screenState.totalCoordonatesDrawn) &&
      measure.pointX >
        coordonateSizeToVerticeSize(nbrCoordonatesToStartOfScreen)
  );
  const {translationMatrix, scaleMatrix} = calculateMatrixes(state);

  //apply a X translation for newer points
  //of 2 times the screen rotation
  const newPointsTranslation = mat4.create();
  mat4.translate(newPointsTranslation, translationMatrix, [
    -totalRotations * 2,
    0,
    0,
  ]);

  leftMeasures.forEach((measure) => {
    const measureIndex = state.measureRamBuffer.measureIndexes.find(
      (measureIndex) => measureIndex.measureId === measure.id
    );

    if (measureIndex === undefined) {
      return;
    }

    setVertexAttributes(state, measure, newPointsTranslation, scaleMatrix, gl);

    gl.drawArrays(
      gl.TRIANGLES,
      coordonateSizeToVerticeSize(measureIndex.index),
      measureVerticeSize()
    );
  });

  drawText(
    state,
    leftMeasures,
    newPointsTranslation,
    scaleMatrix,
    gl,
    textContext
  );
};

const drawRight = (
  state: State,
  gl: WebGL2RenderingContext,
  textContext: CanvasRenderingContext2D
): void => {
  const {screenState} = state;

  const totalRotations = getTotalRotations(screenState);
  const nbrCoordonatesToStartOfScreen = getNbrCoordonatesAfterRotations(
    screenState,
    totalRotations
  );

  const lastPointXAddedToScreen = coordonateSizeToVerticeSize(
    screenState.totalCoordonatesDrawn
  );

  const eraserOnPreviousScreen =
    lastPointXAddedToScreen - getNbrVerticesPerScreen(screenState);

  const rightMeasures = state.measures.filter((measure) => {
    const maxXOnPreviousScreen = coordonateSizeToVerticeSize(
      nbrCoordonatesToStartOfScreen
    );
    if (
      measure.pointX > eraserOnPreviousScreen &&
      measure.pointX < maxXOnPreviousScreen
    ) {
      return true;
    }
    return false;
  });

  const {translationMatrix, scaleMatrix} = calculateMatrixes(state);

  //apply a X translation for older points
  //of 1 screen rotation
  const oldPointsTranslation = mat4.create();
  mat4.translate(oldPointsTranslation, translationMatrix, [
    -(totalRotations - 1) * 2,
    0,
    0,
  ]);

  rightMeasures.forEach((measure) => {
    const measureIndex = state.measureRamBuffer.measureIndexes.find(
      (measureIndex) => measureIndex.measureId === measure.id
    );

    if (measureIndex === undefined) {
      return;
    }

    setVertexAttributes(state, measure, oldPointsTranslation, scaleMatrix, gl);

    gl.drawArrays(
      gl.TRIANGLES,
      coordonateSizeToVerticeSize(measureIndex.index),
      measureVerticeSize()
    );
  });

  drawText(
    state,
    rightMeasures,
    oldPointsTranslation,
    scaleMatrix,
    gl,
    textContext
  );
};

export const drawRotatingMeasures = (
  state: State,
  gl: WebGL2RenderingContext,
  textContext: CanvasRenderingContext2D
): void => {
  drawLeft(state, gl, textContext);
  drawRight(state, gl, textContext);
};
