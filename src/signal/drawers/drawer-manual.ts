import {getNbrVerticesPerScreen} from '@src/screen/screen-utils';
import {Signal, State} from '@src/store/state';
import {
  coordonateSizeToVerticeSize,
  pixelSizeToVerticeSize,
} from '@src/utils/conversions';
import {calculateMatrixes, setVertexAttributes} from './drawer';

export const drawManualSignal = (
  state: State,
  signal: Signal,
  totalCoordonatesAvailable: number,
  gl: WebGL2RenderingContext
): void => {
  const {translationMatrix, scaleMatrix} = calculateMatrixes(state, signal);
  setVertexAttributes(state, signal, translationMatrix, scaleMatrix, gl);

  const nbrVerticeInBuffer = coordonateSizeToVerticeSize(
    totalCoordonatesAvailable
  );

  //shift position
  const appliedTranslationInVerticeUnit = pixelSizeToVerticeSize(
    state.screenState,
    state.screenState.matrixes.xTranslation
  );

  const firstVerticeOnScreen = Math.max(0, appliedTranslationInVerticeUnit);
  const lastVerticeOnScreen = Math.min(
    nbrVerticeInBuffer,
    firstVerticeOnScreen + getNbrVerticesPerScreen(state.screenState)
  );
  const verticeCount = Math.max(0, lastVerticeOnScreen - firstVerticeOnScreen);

  gl.drawArrays(gl.LINE_STRIP, firstVerticeOnScreen, verticeCount);
};
