import {uploadVerticesToGpu} from '@src/signal/gpu-buffers';
import {pointsToLineVertices} from '@src/signal/vertices';
import {State} from '@src/store/state';
import {initialSignalState, initialState} from '@src/store/values';
import {expect} from 'chai';
import {describe} from 'mocha';
import sinon from 'sinon';
import {
  coordonateSizeToVerticeSize,
  pointSizeToCoordonateSize,
  screenSizeToPointSize,
} from '@src/utils/conversions';
import {drawRotatingSignal} from '@src/signal/drawers/drawer-rotating';
import {generateDataFrame} from 'test-utils.ts/data-helper';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('webgl-mock');

const buildStateAndUpload = (gl: WebGL2RenderingContext): State => {
  const state = initialState;

  const vertices = pointsToLineVertices(generateDataFrame(10000));

  const bufferState = uploadVerticesToGpu(
    state.gpuBuffers,
    'ch1',
    vertices,
    gl
  );

  const signal = {
    ...initialSignalState,
    id: 'sig1',
    channelId: 'ch1',
  };

  return {
    ...state,
    signals: [signal],
    gpuBuffers: [bufferState],
    screenState: {
      ...state.screenState,
      containerWidth: 1200,
      pxToMm: 1 / 3.7795275591,
      displayRate: 50,
    },
  };
};

describe('Drawer rotating', () => {
  let gl: WebGL2RenderingContext | null;
  let glStub: sinon.SinonStub;

  beforeEach(() => {
    const canvas = new HTMLCanvasElement();
    gl = canvas.getContext('webgl') as WebGL2RenderingContext;
    glStub = sinon.stub(gl, 'drawArrays');
  });

  it('Draws correct portion of the screen before rotation', () => {
    const state = buildStateAndUpload(gl as WebGL2RenderingContext);

    const nbrCoordonatesBeforeEndOfScreen = 1500;
    const totalCoordonatesPerWindow = pointSizeToCoordonateSize(
      screenSizeToPointSize(state.screenState)
    );
    const totalCoordonatesAvailable =
      totalCoordonatesPerWindow - nbrCoordonatesBeforeEndOfScreen;

    drawRotatingSignal(
      state,
      state.signals[0],
      totalCoordonatesAvailable,
      gl as WebGL2RenderingContext
    );

    const expectedStartOfDraw = 0;
    const nbrElements = coordonateSizeToVerticeSize(totalCoordonatesAvailable);

    expect(glStub.called).to.be.true;
    expect(glStub.getCall(1)).to.be.null;

    const leftCall = glStub.getCall(0);
    const leftArgs = leftCall.args as unknown[];
    const leftStartIndex = leftArgs[1];
    const leftNbrVertices = leftArgs[2];

    expect(leftStartIndex).to.equal(expectedStartOfDraw);
    expect(leftNbrVertices).to.equal(nbrElements);
  });

  it('Draws correct portion of the screen after 1 rotation', () => {
    const state = buildStateAndUpload(gl as WebGL2RenderingContext);

    const nbrCoordonatesOnSecondScreen = 2100;

    const totalCoordonatesPerWindow = pointSizeToCoordonateSize(
      screenSizeToPointSize(state.screenState)
    );
    const totalCoordonatesAvailable =
      totalCoordonatesPerWindow + nbrCoordonatesOnSecondScreen;

    state.screenState.totalCoordonatesDrawn = totalCoordonatesPerWindow;

    drawRotatingSignal(
      state,
      state.signals[0],
      totalCoordonatesAvailable,
      gl as WebGL2RenderingContext
    );

    expect(glStub.called).to.be.true;
    expect(glStub.getCall(1)).to.be.not.null;

    const expectedStartOfLeftDraw = coordonateSizeToVerticeSize(
      totalCoordonatesPerWindow
    );
    const nbrLeftElements = coordonateSizeToVerticeSize(
      nbrCoordonatesOnSecondScreen
    );

    const leftCall = glStub.getCall(0);
    const leftArgs = leftCall.args as unknown[];
    const leftStartIndex = leftArgs[1];
    const leftNbrVertices = leftArgs[2];

    expect(leftStartIndex).to.equal(expectedStartOfLeftDraw);
    expect(leftNbrVertices).to.equal(nbrLeftElements);

    const expectedStartOfRightDraw = coordonateSizeToVerticeSize(
      nbrCoordonatesOnSecondScreen + 1200
    ); //1200 = padding
    const nbrRightElements = coordonateSizeToVerticeSize(
      totalCoordonatesPerWindow - nbrCoordonatesOnSecondScreen - 1200
    );

    const rightCall = glStub.getCall(1);
    const rightArgs = rightCall.args as unknown[];
    const rightStartIndex = rightArgs[1];
    const rightNbrVertices = rightArgs[2];

    expect(rightStartIndex).to.equal(expectedStartOfRightDraw);
    expect(rightNbrVertices).to.equal(nbrRightElements);
  });
});
