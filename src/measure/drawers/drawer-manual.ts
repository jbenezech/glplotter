import {State} from '@src/store/state';
import {coordonateSizeToVerticeSize} from '@src/utils/conversions';
import {measureVerticeSize} from '../measure-conversions';
import {calculateMatrixes, setVertexAttributes} from './drawer';
import {drawText} from './text-drawer';

export const drawManualMeasures = (
  state: State,
  gl: WebGL2RenderingContext,
  textContext: CanvasRenderingContext2D
): void => {
  const {translationMatrix, scaleMatrix} = calculateMatrixes(state);

  state.measures.forEach((measure) => {
    const measureIndex = state.measureRamBuffer.measureIndexes.find(
      (measureIndex) => measureIndex.measureId === measure.id
    );

    if (measureIndex === undefined) {
      return;
    }

    setVertexAttributes(state, measure, translationMatrix, scaleMatrix, gl);
    gl.drawArrays(
      gl.TRIANGLES,
      coordonateSizeToVerticeSize(measureIndex.index),
      measureVerticeSize()
    );
  });

  drawText(
    state,
    state.measures,
    translationMatrix,
    scaleMatrix,
    gl,
    textContext
  );
};
