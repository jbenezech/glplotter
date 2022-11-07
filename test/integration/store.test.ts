import {createStore, Store} from '@src/store/store';
import {expect} from 'chai';
import sinon from 'sinon';
import {generateDataFrame} from 'test-utils.ts/data-helper';
import {resetGpuBuffers, VERTICES_BATCH_SIZE} from '@src/signal/gpu-buffers';
import {SignalConfig} from 'glplotter';
import {initialState} from '@src/store/values';
import {verticeSizeToCoordonateSize} from '@src/utils/conversions';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('webgl-mock');

const signalPayload: SignalConfig = {
  id: 'sig1',
  channelId: 'ch1',
  color: [0, 0, 0, 1],
  visible: true,
  amplitude: 1,
  pitch: 1,
  chartHeight: 20,
  yPosition: 0,
  zoomRatio: 1,
};

describe('Stores', () => {
  let store: Store;

  beforeEach(() => {
    const state = {
      ...initialState,
      screenState: {
        ...initialState.screenState,
        containerWidth: 1200,
        pxToMm: 1 / 3.7795275591,
        displayRate: 50,
      },
    };
    store = createStore(state);
    resetGpuBuffers();
  });

  describe('Data Reducers', () => {
    let gl: WebGL2RenderingContext;
    let glStub: sinon.SinonStub;

    beforeEach(() => {
      const canvas = new HTMLCanvasElement();
      gl = canvas.getContext('webgl') as WebGL2RenderingContext;
      glStub = sinon.stub(gl, 'bufferSubData');
    });

    it('It uploads and mutates the state correctly after bufferData', () => {
      const dataFrame = [
        {x: 0, y: 1},
        {x: 1, y: 2},
      ];
      const vertices = [0, 1, 0, 1, 2, 0];

      store.dispatch({
        type: 'data/buffer',
        payload: {
          channelId: 'ch1',
          points: dataFrame,
          gl,
        },
      });

      const newState = store.getState();

      //check data is uploaded to gpu
      expect(glStub.called).to.be.true;
      expect(glStub.getCall(1)).to.be.null;

      const call = glStub.getCall(0);
      const args = call.args as unknown[];
      const startIndex = args[1];
      const data = args[2];

      expect(startIndex).to.equal(0);
      expect(data).to.deep.equal(Float32Array.from(vertices));

      //check state is updated
      const {gpuBuffers} = newState;

      expect(gpuBuffers).to.have.length(1);
      expect(gpuBuffers[0].nextVerticeIndexInVertexBuffer).to.equal(
        vertices.length
      );
    });
  });

  describe('Signal Reducers', () => {
    let gl: WebGL2RenderingContext;
    let glStub: sinon.SinonStub;
    const nbrPoints = 100;

    beforeEach(() => {
      const canvas = new HTMLCanvasElement();
      gl = canvas.getContext('webgl') as WebGL2RenderingContext;
      glStub = sinon.stub(gl, 'drawArrays');

      store.dispatch({
        type: 'signal/add',
        payload: signalPayload,
      });

      store.dispatch({
        type: 'data/buffer',
        payload: {
          channelId: 'ch1',
          points: generateDataFrame(nbrPoints),
          gl,
        },
      });
    });

    it('It draws and mutates the state correctly after drawSignals', () => {
      store.dispatch({
        type: 'signal/drawAll',
        payload: {
          gl,
        },
      });

      const newState = store.getState();

      //exect drawArray to have been called with correct vertices
      expect(glStub.called).to.be.true;
      expect(glStub.getCall(1)).to.be.null;

      //expect screen state
      const {screenState} = newState;
      expect(screenState.totalCoordonatesDrawn).to.equal(VERTICES_BATCH_SIZE);

      //expect gpu state
      const {gpuBuffers} = newState;

      expect(gpuBuffers).to.have.length(1);
      expect(gpuBuffers[0].nextVerticeIndexInVertexBuffer).to.equal(
        verticeSizeToCoordonateSize(nbrPoints)
      );
    });
  });
});
