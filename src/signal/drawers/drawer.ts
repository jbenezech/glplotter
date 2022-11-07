import {
  calculateXScale,
  calculateXTranslation,
} from '@src/screen/screen-matrix';
import {Signal, State} from '@src/store/state';
import {mat4, ReadonlyMat4} from 'gl-matrix';
import {signalShader} from '../gl/signal-shader';
import {calculateYScale, calculateYTranslation} from '../signal-matrix';

export const calculateMatrixes = (
  state: State,
  signal: Signal
): {
  translationMatrix: ReadonlyMat4;
  scaleMatrix: ReadonlyMat4;
} => {
  const {screenState} = state;
  const {containerWidth, matrixes: screenMatrixes} = screenState;

  //combine screen and signal matrixes
  const translationMatrix = mat4.create();
  mat4.fromTranslation(translationMatrix, [
    calculateXTranslation({containerWidth, ...screenMatrixes}),
    calculateYTranslation(signal, state.screenState),
    0,
  ]);

  const scaleMatrix = mat4.create();
  mat4.fromScaling(scaleMatrix, [
    calculateXScale(state.screenState),
    calculateYScale(signal, state.screenState),
    1,
  ]);

  return {translationMatrix, scaleMatrix};
};

//Sets the vertex attribute array and pointer
//Applies the translation matrixes
//This needs to be called before each draw call
export const setVertexAttributes = (
  state: State,
  signal: Signal,
  translationMatrix: ReadonlyMat4,
  scaleMatrix: ReadonlyMat4,
  gl: WebGL2RenderingContext
): void => {
  signalShader.use(
    gl,
    translationMatrix,
    scaleMatrix,
    Float32Array.from(state.screenState.matrixes.modelMatrix),
    Float32Array.from(state.screenState.matrixes.projectionMatrix),
    signal.color
  );
};
