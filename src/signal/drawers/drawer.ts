import {
  calculateXScale,
  calculateXTranslation,
} from '@src/screen/screen-matrix';
import {Signal, State} from '@src/store/state';
import {mat4, ReadonlyMat4} from 'gl-matrix';
import {shader} from '../gl/signal-shader';
import {calculateYScale, calculateYTranslation} from '../signal-matrix';
import {SignalDrawerAutomove} from './drawer-automove';
import {SignalDrawerManual} from './drawer-manual';
import {SignalDrawerRotating} from './drawer-rotating';

interface Drawer {
  draw: (state: State, signal: Signal, gl: WebGL2RenderingContext) => void;
}

export const drawer = (state: State): Drawer => {
  switch (state.screenState.drawingMode) {
    case 'AUTOMOVE':
      return SignalDrawerAutomove;
    case 'MANUAL':
      return SignalDrawerManual;
      break;
    default:
      return SignalDrawerRotating;
  }
};

export const calculateMatrixes = (
  state: State,
  signal: Signal
): {
  translationMatrix: ReadonlyMat4;
  scaleMatrix: ReadonlyMat4;
} => {
  //combine screen and signal matrixes
  const translationMatrix = mat4.create();
  mat4.fromTranslation(translationMatrix, [
    calculateXTranslation(state.screenState),
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
  shader().use(
    gl,
    translationMatrix,
    scaleMatrix,
    Float32Array.from(state.screenState.matrixes.modelMatrix),
    Float32Array.from(state.screenState.matrixes.projectionMatrix),
    signal.color
  );
};
