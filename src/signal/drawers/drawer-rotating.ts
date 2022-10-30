import {mat4} from 'gl-matrix';
import {ScreenState, Signal, State} from '@src/store/state';
import {
  screenSizeToPointSize,
  getNbrCoordonatesAfterRotations,
} from '@src/utils/conversions';
import {calculateMatrixes, setVertexAttributes} from './drawer';

export const SignalDrawerRotating = {
  draw(state: State, signal: Signal, gl: WebGL2RenderingContext): void {
    this.drawLeft(state, signal, gl);

    this.drawRight(state, signal, gl);
  },

  drawLeft(state: State, signal: Signal, gl: WebGL2RenderingContext): void {
    //draw the points on the left side with total rotations
    const elementIndex =
      getNbrCoordonatesAfterRotations(
        state.screenState,
        state.screenState.totalRotations
      ) / 3;

    const maxAvailable = state.screenState.totalCoordonatesAdded / 3;

    const nbrElements = maxAvailable - elementIndex - 3; //-3 to account for rotation fudge

    if (nbrElements > 0) {
      const {translationMatrix, scaleMatrix} = calculateMatrixes(state, signal);

      //apply a X translation for newer points
      //of 2 times the screen rotation
      const newPointsTranslation = mat4.create();
      mat4.translate(newPointsTranslation, translationMatrix, [
        -state.screenState.totalRotations * 2,
        0,
        0,
      ]);

      setVertexAttributes(state, signal, newPointsTranslation, scaleMatrix, gl);

      gl.drawArrays(gl.LINE_STRIP, elementIndex, nbrElements);
    }
  },

  drawRight(state: State, signal: Signal, gl: WebGL2RenderingContext): void {
    if (state.screenState.totalRotations === 0) {
      return;
    }

    //draw the points on the right side with one less rotation
    const elementIndex =
      getNbrCoordonatesAfterRotations(
        state.screenState,
        state.screenState.totalRotations - 1
      ) /
        3 +
      state.screenState.totalCoordonatesAddedToScreen / 3;

    const maxAvailable = state.screenState.totalCoordonatesAdded / 3;

    const mmToPoints =
      (screenSizeToPointSize(state.screenState) / state.screenState.mmToPx) *
      state.screenState.containerWidth;

    const rightPadding = 3 * Math.floor(parseInt(`${2 * 10 * mmToPoints}`) / 3); // 2 cm

    const nbrElements = maxAvailable - elementIndex - rightPadding;

    if (nbrElements > 0) {
      const {translationMatrix, scaleMatrix} = calculateMatrixes(state, signal);

      //apply a X translation for older points
      //of 1 screen rotation
      const oldPointsTranslation = mat4.create();
      mat4.translate(oldPointsTranslation, translationMatrix, [
        -(state.screenState.totalRotations - 1) * 2,
        0,
        0,
      ]);

      setVertexAttributes(state, signal, oldPointsTranslation, scaleMatrix, gl);
      // console.log(elementIndex, nbrElements);
      //19671 1614
      //19687 1614

      gl.drawArrays(gl.LINE_STRIP, elementIndex + rightPadding, nbrElements);
    }
  },

  getSignalPointIndexFromWindowX(
    screenState: ScreenState,
    signal: Signal,
    positionX: number
  ): number {
    let positionPixelShiftingFactor = 0;

    const totalRotationsInPixel =
      screenState.totalRotations * screenState.containerWidth;

    const pointsToX =
      screenState.containerWidth / screenSizeToPointSize(screenState);
    const currentWindowXOfEraser =
      screenState.lastPointXAddedToScreen * pointsToX - totalRotationsInPixel;

    if (positionX < currentWindowXOfEraser) {
      //we are on the left side of the eraser, all rotations have already
      //been applied
      positionPixelShiftingFactor = totalRotationsInPixel;
    } else {
      //we are on the right side of the eraser, 1 rotation has not yet been applied
      positionPixelShiftingFactor =
        totalRotationsInPixel - screenState.containerWidth;
    }

    const xToPoints =
      screenSizeToPointSize(screenState) / screenState.containerWidth;

    const rotatedPositionX = positionX + positionPixelShiftingFactor;

    const currentX = xToPoints * rotatedPositionX;

    return currentX;
  },
};
