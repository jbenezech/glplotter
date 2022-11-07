import {Measure, State} from '@src/store/state';
import {mat4, ReadonlyMat4, vec4} from 'gl-matrix';

export const drawText = (
  state: State,
  measures: Measure[],
  translationMatrix: ReadonlyMat4,
  scaleMatrix: ReadonlyMat4,
  gl: WebGL2RenderingContext,
  textContext: CanvasRenderingContext2D
): void => {
  const matrix = mat4.create();
  mat4.mul(
    matrix,
    translationMatrix,
    Float32Array.from(state.screenState.matrixes.modelMatrix)
  );
  mat4.mul(
    matrix,
    matrix,
    Float32Array.from(state.screenState.matrixes.projectionMatrix)
  );
  mat4.mul(matrix, matrix, scaleMatrix);

  measures.forEach((measure) => {
    const vec = vec4.fromValues(
      measure.pointX + measure.width / 2,
      measure.middleLinePosition,
      0,
      1
    );
    const clipspace = vec4.transformMat4(vec, vec, matrix);

    // divide X and Y by W just like the GPU does.
    clipspace[0] /= clipspace[3];
    clipspace[1] /= clipspace[3];

    // convert from clipspace to pixels
    const pixelX = (clipspace[0] * 0.5 + 0.5) * gl.canvas.width;
    const pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;

    textContext.font = '20px Arial';
    textContext.fillStyle = 'rgba(255, 255, 255, 0.3)';
    textContext.textAlign = 'center';
    -textContext.fillRect(pixelX - 40, pixelY, 80, 30);

    textContext.fillStyle = 'white';
    textContext.fillText(measure.text, pixelX, pixelY + 20);
  });
};
