import {mat4} from 'gl-matrix';
import {ScreenState, Signal, State} from '@src/store/state';
import {
  screenSizeToPointSize,
  coordonateSizeToVerticeSize,
  pointSizeToCoordonateSize,
} from '@src/utils/conversions';
import {calculateMatrixes, setVertexAttributes} from './drawer';
import {
  getNbrCoordonatesAfterRotations,
  getTotalRotations,
} from '@src/screen/screen-utils';

const calculateCoordonatesOnLeft = (
  state: ScreenState,
  totalCoordonatesAvailable: number
): {
  coordonateStartIndex: number;
  nbrCoordonates: number;
} => {
  const totalRotations = getTotalRotations(state);

  //Get the number of coordonates that have been added
  //until the start of the screen
  //ie:
  //First rotation => 0
  //Second rotation => nbr of coordonates in 1 screen
  //...
  const nbrCoordonatesToStartOfScreen = getNbrCoordonatesAfterRotations(
    state,
    totalRotations
  );

  //Make sure we don't take more than there has been added
  const nbrCoordonatesToDraw =
    totalCoordonatesAvailable - nbrCoordonatesToStartOfScreen;

  //We'll draw from the first on the left of the screen
  //To the last we have
  return {
    coordonateStartIndex: nbrCoordonatesToStartOfScreen,
    nbrCoordonates: nbrCoordonatesToDraw,
  };
};

const calculateCoordonatesOnRight = (
  state: ScreenState,
  totalCoordonatesAvailable: number
): {
  coordonateStartIndex: number;
  nbrCoordonates: number;
} => {
  const totalRotations = getTotalRotations(state);

  const {nbrCoordonates: nbrCoordonatesOnLeft} = calculateCoordonatesOnLeft(
    state,
    totalCoordonatesAvailable
  );

  //Get the number of coordonates that have been added
  //until the start of the previous screen
  //ie:
  //First rotation => nothing
  //Second rotation => 0
  //Third rotation => nbr of coordonates in 1 screen
  //...

  const nbrCoordonatesToStartOfPreviousScreen = getNbrCoordonatesAfterRotations(
    state,
    totalRotations - 1
  );

  const nbrCoordonatesToEndOfLeft =
    nbrCoordonatesToStartOfPreviousScreen + nbrCoordonatesOnLeft;

  const pointsPerWindow = screenSizeToPointSize(state);

  const mmToPoints = pointsPerWindow / (state.pxToMm * state.containerWidth);

  const rightPadding = pointSizeToCoordonateSize(
    parseInt(`${2 * 10 * mmToPoints}`)
  ); // 2 cm

  const nbrCoordonatesToDraw =
    pointSizeToCoordonateSize(pointsPerWindow) -
    nbrCoordonatesOnLeft -
    rightPadding;

  //We want to draw the previous screen
  //except what is already drawn on the left

  return {
    coordonateStartIndex: nbrCoordonatesToEndOfLeft + rightPadding,
    nbrCoordonates: nbrCoordonatesToDraw,
  };
};

const drawLeft = (
  state: State,
  signal: Signal,
  totalCoordonatesAvailable: number,
  gl: WebGL2RenderingContext
): void => {
  const totalRotations = getTotalRotations(state.screenState);

  const {coordonateStartIndex, nbrCoordonates} = calculateCoordonatesOnLeft(
    state.screenState,
    totalCoordonatesAvailable
  );
  if (nbrCoordonates > 0) {
    const {translationMatrix, scaleMatrix} = calculateMatrixes(state, signal);

    //apply a X translation for newer points
    //of 2 times the screen rotation
    const newPointsTranslation = mat4.create();
    mat4.translate(newPointsTranslation, translationMatrix, [
      -totalRotations * 2,
      0,
      0,
    ]);

    setVertexAttributes(state, signal, newPointsTranslation, scaleMatrix, gl);

    gl.drawArrays(
      gl.LINE_STRIP,
      coordonateSizeToVerticeSize(coordonateStartIndex),
      coordonateSizeToVerticeSize(nbrCoordonates)
    );
  }
};

const drawRight = (
  state: State,
  signal: Signal,
  totalCoordonatesAvailable: number,
  gl: WebGL2RenderingContext
): void => {
  const totalRotations = getTotalRotations(state.screenState);

  if (totalRotations === 0) {
    return;
  }

  const {coordonateStartIndex, nbrCoordonates} = calculateCoordonatesOnRight(
    state.screenState,
    totalCoordonatesAvailable
  );

  if (nbrCoordonates > 0) {
    const {translationMatrix, scaleMatrix} = calculateMatrixes(state, signal);

    //apply a X translation for older points
    //of 1 screen rotation
    const oldPointsTranslation = mat4.create();
    mat4.translate(oldPointsTranslation, translationMatrix, [
      -(totalRotations - 1) * 2,
      0,
      0,
    ]);

    setVertexAttributes(state, signal, oldPointsTranslation, scaleMatrix, gl);

    gl.drawArrays(
      gl.LINE_STRIP,
      coordonateSizeToVerticeSize(coordonateStartIndex),
      coordonateSizeToVerticeSize(nbrCoordonates)
    );
  }
};

export const drawRotatingSignal = (
  state: State,
  signal: Signal,
  totalCoordonatesAvailable: number,
  gl: WebGL2RenderingContext
): void => {
  drawLeft(state, signal, totalCoordonatesAvailable, gl);
  drawRight(state, signal, totalCoordonatesAvailable, gl);
};
