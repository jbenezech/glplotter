import {expect} from 'chai';
import {bufferData, resetRamBuffers} from '@src/signal/ram-buffers';
import {Point} from '@src/structures/Point';
import {
  getGpuBuffer,
  uploadData,
  VERTICES_BATCH_SIZE,
} from '@src/signal/gpu-buffers';
import {initialState} from '@src/store/values';
import sinon from 'sinon';
require('webgl-mock');

const generateDataFrame = (size: number = 100): Point[] => {
  const dataFrame = [];
  for (let i = 0; i < size; i++) {
    dataFrame.push({x: i, y: i + 1});
  }
  return dataFrame;
};

describe('GPU Buffer', () => {
  let state;
  let gl;
  let glStub;

  describe('When uploading simple frame', () => {
    beforeEach(() => {
      resetRamBuffers();
      state = initialState;
      state = {
        ...state,
        ramBuffers: [bufferData(state, 'ch1', generateDataFrame())],
      };
      const canvas = new HTMLCanvasElement();
      gl = canvas.getContext('webgl');
      glStub = sinon.stub(gl, 'bufferSubData');
    });

    it('Creates Gl buffer', () => {
      const {gpuBufferState} = uploadData(state, 'ch1', gl);

      let glBuffer = null;
      try {
        glBuffer = getGpuBuffer('ch1');
      } catch {}

      expect(glBuffer).to.be.not.null;
    });

    it('Updates state correctly', () => {
      const {gpuBufferState} = uploadData(state, 'ch1', gl);

      expect(gpuBufferState.vertexBufferNeedsInitializing).to.equal(false);
      expect(gpuBufferState.nextVerticeIndexInVertexBuffer).to.equal(
        VERTICES_BATCH_SIZE
      );
      expect(gpuBufferState.gpuBufferOverflow).to.equal(false);
      expect(gpuBufferState.dataConsumptionBufferStartIndex).to.equal(
        VERTICES_BATCH_SIZE
      );
      expect(gpuBufferState.pendingDrain).to.equal(false);
    });

    it('Returns correct indexes', () => {
      const {
        lastPointXAddedToScreen,
        totalCoordonatesAdded,
        lastCoordonatesCountAddedToScreen,
      } = uploadData(state, 'ch1', gl);

      expect(lastPointXAddedToScreen).to.equal(16);
      expect(totalCoordonatesAdded).to.equal(VERTICES_BATCH_SIZE);
      expect(lastCoordonatesCountAddedToScreen).to.equal(VERTICES_BATCH_SIZE);
    });

    it('Uploads correct vertices to vertex buffer', () => {
      uploadData(state, 'ch1', gl);

      //check it's called only once
      expect(glStub.called).to.be.true;
      expect(glStub.getCall(1)).to.be.null;

      const startIndex = glStub.getCall(0).args[1];
      const data = glStub.getCall(0).args[2];

      const expectation = Float32Array.from([
        0, 1, 0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 7, 0, 7, 8, 0,
        8, 9, 0, 9, 10, 0, 10, 11, 0, 11, 12, 0, 12, 13, 0, 13, 14, 0, 14, 15,
        0, 15, 16, 0, 16, 17, 0,
      ]);

      expect(startIndex).to.equal(0);
      expect(data).to.deep.equal(expectation);
    });
  });

  describe('When uploading multiple frames', () => {
    beforeEach(() => {
      resetRamBuffers();
      state = initialState;
      state = {
        ...state,
        ramBuffers: [bufferData(state, 'ch1', generateDataFrame())],
      };
      const canvas = new HTMLCanvasElement();
      gl = canvas.getContext('webgl');
      glStub = sinon.stub(gl, 'bufferSubData');
      const result = uploadData(state, 'ch1', gl);
      state = {...state, gpuBuffers: [result.gpuBufferState]};
    });

    it('Updates state correctly', () => {
      const {gpuBufferState} = uploadData(state, 'ch1', gl);

      expect(gpuBufferState.nextVerticeIndexInVertexBuffer).to.equal(
        VERTICES_BATCH_SIZE * 2
      );
      expect(gpuBufferState.dataConsumptionBufferStartIndex).to.equal(
        VERTICES_BATCH_SIZE * 2
      );
    });

    it('Returns correct indexes', () => {
      const {
        lastPointXAddedToScreen,
        totalCoordonatesAdded,
        lastCoordonatesCountAddedToScreen,
      } = uploadData(state, 'ch1', gl);

      expect(lastPointXAddedToScreen).to.equal(33);
      expect(totalCoordonatesAdded).to.equal(VERTICES_BATCH_SIZE * 2);
      expect(lastCoordonatesCountAddedToScreen).to.equal(VERTICES_BATCH_SIZE);
    });

    it('Uploads correct vertices to vertex buffer', () => {
      uploadData(state, 'ch1', gl);

      //First call
      let startIndex = glStub.getCall(0).args[1];
      let data = glStub.getCall(0).args[2];

      let expectation = Float32Array.from([
        0, 1, 0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 7, 0, 7, 8, 0,
        8, 9, 0, 9, 10, 0, 10, 11, 0, 11, 12, 0, 12, 13, 0, 13, 14, 0, 14, 15,
        0, 15, 16, 0, 16, 17, 0,
      ]);

      expect(startIndex).to.equal(0);
      expect(data).to.deep.equal(expectation);

      //Second call
      startIndex = glStub.getCall(1).args[1];
      data = glStub.getCall(1).args[2];

      expectation = Float32Array.from([
        17, 18, 0, 18, 19, 0, 19, 20, 0, 20, 21, 0, 21, 22, 0, 22, 23, 0, 23,
        24, 0, 24, 25, 0, 25, 26, 0, 26, 27, 0, 27, 28, 0, 28, 29, 0, 29, 30, 0,
        30, 31, 0, 31, 32, 0, 32, 33, 0, 33, 34, 0,
      ]);

      expect(startIndex).to.equal(
        VERTICES_BATCH_SIZE * Float32Array.BYTES_PER_ELEMENT
      );
      expect(data).to.deep.equal(expectation);
    });
  });
});
