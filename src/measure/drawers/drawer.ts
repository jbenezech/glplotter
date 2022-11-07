import {
  calculateXScale,
  calculateXTranslation,
} from '@src/screen/screen-matrix';
import {Measure, State} from '@src/store/state';
import {mat4, ReadonlyMat4} from 'gl-matrix';
import {measureShader} from '../gl/measure-shader';

export const calculateMatrixes = (
  state: State
): {
  translationMatrix: ReadonlyMat4;
  scaleMatrix: ReadonlyMat4;
} => {
  const {screenState} = state;
  const {containerWidth, matrixes: screenMatrixes} = screenState;

  const translationMatrix = mat4.create();
  mat4.fromTranslation(translationMatrix, [
    calculateXTranslation({containerWidth, ...screenMatrixes}),
    0,
    0,
  ]);

  const scaleMatrix = mat4.create();
  mat4.fromScaling(scaleMatrix, [calculateXScale(state.screenState), 1, 1]);

  return {translationMatrix, scaleMatrix};
};

//Sets the vertex attribute array and pointer
//Applies the translation matrixes
//This needs to be called before each draw call
export const setVertexAttributes = (
  state: State,
  measure: Measure,
  translationMatrix: ReadonlyMat4,
  scaleMatrix: ReadonlyMat4,
  gl: WebGL2RenderingContext
): void => {
  measureShader.use(
    gl,
    translationMatrix,
    scaleMatrix,
    Float32Array.from(state.screenState.matrixes.modelMatrix),
    Float32Array.from(state.screenState.matrixes.projectionMatrix),
    measure.color
  );
};
