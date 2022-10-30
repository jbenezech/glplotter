import {ScreenState, Signal, State} from '@src/store/state';
import {
  screenSizeToPointSize,
  clipspaceSizeToVerticeSize,
  coordonateSizeToVerticeSize,
  getNbrVerticesPerScreen,
  pixelSizeToClipspaceSize,
} from '@src/utils/conversions';
import {calculateMatrixes, setVertexAttributes} from './drawer';

export const SignalDrawerManual = {
  draw(state: State, signal: Signal, gl: WebGL2RenderingContext): void {
    const {translationMatrix, scaleMatrix} = calculateMatrixes(state, signal);
    setVertexAttributes(state, signal, translationMatrix, scaleMatrix, gl);

    const nbrVerticeInBuffer = coordonateSizeToVerticeSize(
      state.screenState.totalCoordonatesAdded
    );

    //shift position
    //@TODO double conversion unecessary
    const appliedTranslation = pixelSizeToClipspaceSize(
      state.screenState,
      state.screenState.matrixes.xTranslation
    );
    const appliedTranslationInVerticeUnit = -clipspaceSizeToVerticeSize(
      state.screenState,
      appliedTranslation
    );

    const firstVerticeOnScreen = Math.max(0, appliedTranslationInVerticeUnit);
    const lastVerticeOnScreen = Math.min(
      nbrVerticeInBuffer,
      firstVerticeOnScreen + getNbrVerticesPerScreen(state.screenState)
    );
    const verticeCount = Math.max(
      0,
      lastVerticeOnScreen - firstVerticeOnScreen
    );

    gl.drawArrays(gl.LINE_STRIP, firstVerticeOnScreen, verticeCount);
  },

  getSignalPointIndexFromWindowX(
    screenState: ScreenState,
    positionX: number
  ): number {
    const clipspaceToPixel = screenState.containerWidth / 2;

    const pointsPerWindow = screenSizeToPointSize(screenState);
    const xToPoints = pointsPerWindow / screenState.containerWidth;

    const translatedPosition =
      positionX - clipspaceToPixel * screenState.matrixes.totalXTranslation;
    const currentX = xToPoints * translatedPosition;

    return currentX;
  },
};
