import {uploadVerticesToGpu} from '@src/signal/gpu-buffers';
import {pointsToLineVertices} from '@src/signal/vertices';
import {State} from '@src/store/state';
import {initialSignalState, initialState} from '@src/store/values';
import {expect} from 'chai';
import {describe} from 'mocha';
import sinon from 'sinon';
import {drawManualSignal} from '@src/signal/drawers/drawer-manual';
import {
  coordonateSizeToVerticeSize,
  pointSizeToCoordonateSize,
  pixelSizeToVerticeSize,
  screenSizeToPointSize,
} from '@src/utils/conversions';
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
      containerWidth: 100,
      pxToMm: 1 / 3.7795275591,
      displayRate: 50,
    },
  };
};

describe('Drawer manual', () => {
  let gl: WebGL2RenderingContext | null;
  let glStub: sinon.SinonStub;

  beforeEach(() => {
    const canvas = new HTMLCanvasElement();
    gl = canvas.getContext('webgl') as WebGL2RenderingContext;
    glStub = sinon.stub(gl, 'drawArrays');
  });

  it('Draws correct portion of the screen when no translation', () => {
    const state = buildStateAndUpload(gl as WebGL2RenderingContext);

    const totalCoordonatesAvailable = 30000;

    drawManualSignal(
      state,
      state.signals[0],
      totalCoordonatesAvailable,
      gl as WebGL2RenderingContext
    );

    const points = screenSizeToPointSize(state.screenState);
    const nbrCoordonatesOnScreen = pointSizeToCoordonateSize(points);

    const expectedStartOfDraw = 0;
    const nbrElements = coordonateSizeToVerticeSize(nbrCoordonatesOnScreen);

    expect(glStub.called).to.be.true;
    expect(glStub.getCall(1)).to.be.null;

    const call = glStub.getCall(0);
    const args = call.args as unknown[];
    const startIndex = args[1];
    const nbrVertices = args[2];

    expect(startIndex).to.equal(expectedStartOfDraw);
    expect(nbrVertices).to.equal(nbrElements);
  });

  it('Draws correct portion of the screen when there is a translation', () => {
    const state = buildStateAndUpload(gl as WebGL2RenderingContext);

    state.screenState.matrixes = {
      ...state.screenState.matrixes,
      xTranslation: 100,
    };

    const totalCoordonatesAvailable = 30000;

    drawManualSignal(
      state,
      state.signals[0],
      totalCoordonatesAvailable,
      gl as WebGL2RenderingContext
    );

    const points = screenSizeToPointSize(state.screenState);
    const nbrCoordonatesOnScreen = pointSizeToCoordonateSize(points);

    const expectedStartOfDraw = pixelSizeToVerticeSize(state.screenState, 100);
    const nbrElements = coordonateSizeToVerticeSize(nbrCoordonatesOnScreen);

    expect(glStub.called).to.be.true;
    expect(glStub.getCall(1)).to.be.null;

    const call = glStub.getCall(0);
    const args = call.args as unknown[];
    const startIndex = args[1];
    const nbrVertices = args[2];

    expect(startIndex).to.equal(expectedStartOfDraw);
    expect(nbrVertices).to.equal(nbrElements);
  });
});
