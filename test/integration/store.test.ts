import {createStore} from '@src/store/store';
import {expect} from 'chai';
import {RAMBufferState, State} from '@src/store/state';
import {
  getRamBuffer,
  RAM_BUFFER_SIZE,
  resetRamBuffers,
} from '@src/signal/ram-buffers';
import {Point} from '@src/structures/Point';
import sinon from 'sinon';
import {initialState} from '@src/store/values';
require('webgl-mock');

const generateDataFrame = (size: number = 100): Point[] => {
  const dataFrame = [];
  for (let i = 0; i < size; i++) {
    dataFrame.push({x: i, y: i + 1});
  }
  return dataFrame;
};

const signalPayload = {
  containerId: 'c1',
  channelId: 'ch1',
  color: [0, 0, 0, 1],
  visible: true,
  amplitude: 1,
  pitch: 1,
  chartHeight: 20,
  yPosition: 0,
};

describe('Stores', () => {
  let store;
  beforeEach(() => {
    store = createStore();
  });

  describe('RAM Reducers', () => {
    it('It mutates the state correctly after bufferData', () => {
      const dataFrame = [
        {x: 0, y: 1},
        {x: 1, y: 2},
      ];
      const vertices = [0, 1, 0, 1, 2, 0];

      store.dispatch({
        type: 'ram/bufferData',
        payload: {
          channelId: 'ch1',
          points: dataFrame,
        },
      });

      const newState = store.getState();
      const ramBufferState: RAMBufferState = newState.ramBuffers[0];
      const ramBuffer = getRamBuffer('ch1');

      const expectation = new Float32Array(RAM_BUFFER_SIZE);
      expectation.set(vertices);

      expect(ramBuffer).to.deep.equal(expectation);
      expect(ramBufferState.numberOfCoordonatesPendingBuffering).to.equal(6);

      expect(ramBufferState.zeroCoordinates).to.deep.equal({x: 0, y: 1});
      expect(ramBufferState.previousCoordinates).to.deep.equal({x: 1, y: 2});
    });
  });

  describe('GPU Reducers', () => {
    let state;
    let gl;
    let glStub;

    beforeEach(() => {
      store = createStore();
      resetRamBuffers();
      store.dispatch({type: 'signal/add', payload: signalPayload});
      store.dispatch({
        type: 'ram/bufferData',
        payload: {
          channelId: 'ch1',
          points: generateDataFrame(),
        },
      });
      const canvas = new HTMLCanvasElement();
      gl = canvas.getContext('webgl');
      glStub = sinon.stub(gl, 'drawArrays');
    });

    it('It mutates the state correctly after drawSignals', () => {
      const vertices = [0, 1, 0, 1, 2, 0];

      store.dispatch({
        type: 'gpu/drawSignals',
        payload: {
          containerId: 'c1',
          gl: gl,
        },
      });

      const newState = store.getState();

      //exect drawArray to have been called with correct vertices
      expect(glStub.called).to.be.true;
      expect(glStub.getCall(1)).to.be.null;

      //expect gpu buffer state to have moved

      //expect screen state to be updated

      //expect ram buffers to be consumed
    });
  });
});
