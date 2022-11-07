import {
  calculateDrawBatchSize,
  getGpuBuffer,
  uploadVerticesToGpu,
  VERTICES_BATCH_SIZE,
} from '@src/signal/gpu-buffers';
import {pointsToLineVertices} from '@src/signal/vertices';
import {GPUBufferState} from '@src/store/state';
import {expect} from 'chai';
import {describe} from 'mocha';
import sinon from 'sinon';
import {generateDataFrame} from 'test-utils.ts/data-helper';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('webgl-mock');

describe('Signal GPU buffers', () => {
  it('Calculates default draw batch when available', () => {
    //If we have enough to draw default size, do it

    const gpuBuffers = [
      {
        nextVerticeIndexInVertexBuffer: 400,
      },
      {
        nextVerticeIndexInVertexBuffer: 300,
      },
    ];

    const nbrCoordonatesToDraw = calculateDrawBatchSize({
      totalCoordonatesDrawn: 200,
      gpuBuffers,
    });

    expect(nbrCoordonatesToDraw).to.equal(VERTICES_BATCH_SIZE);
  });

  it('Calculates minimum draw batch when default is not possible', () => {
    //If we don't have enough to draw default size,
    //draw minimum available

    const gpuBuffers = [
      {
        nextVerticeIndexInVertexBuffer: 240,
      },
      {
        nextVerticeIndexInVertexBuffer: 220,
      },
    ];

    const nbrCoordonatesToDraw = calculateDrawBatchSize({
      totalCoordonatesDrawn: 200,
      gpuBuffers,
    });

    expect(nbrCoordonatesToDraw).to.equal(20);
  });

  it('Calculates maximum draw batch when drain is needed', () => {
    //If we don't have enough to draw default size,
    //draw minimum available

    const gpuBuffers = [
      {
        nextVerticeIndexInVertexBuffer: 2400,
      },
      {
        nextVerticeIndexInVertexBuffer: 2200,
      },
    ];

    const nbrCoordonatesToDraw = calculateDrawBatchSize({
      totalCoordonatesDrawn: 200,
      gpuBuffers,
    });

    expect(nbrCoordonatesToDraw).to.equal(2000);
  });

  describe('When uploading simple frame', () => {
    let gl: WebGL2RenderingContext | null;
    let glStub: sinon.SinonStub;
    let gpuBuffers: GPUBufferState[] = [];
    const vertices = pointsToLineVertices(generateDataFrame());

    beforeEach(() => {
      const canvas = new HTMLCanvasElement();
      gl = canvas.getContext('webgl') as WebGL2RenderingContext;
      glStub = sinon.stub(gl, 'bufferSubData');
      gpuBuffers = [
        {
          channelId: 'ch1',
          vertexBufferNeedsInitializing: true,
          vertexBufferSize: 10000,
          nextVerticeIndexInVertexBuffer: 0,
          gpuBufferOverflow: false,
          scheduledForDeletion: false,
        },
      ];
    });

    it('Creates Gl buffer', () => {
      uploadVerticesToGpu(
        gpuBuffers,
        'ch1',
        vertices,
        gl as WebGL2RenderingContext
      );

      let glBuffer = null;
      try {
        glBuffer = getGpuBuffer('ch1');
      } catch {
        console.error('Failed to get gpu buffer');
      }

      expect(glBuffer).to.be.not.null;
    });

    it('Updates state correctly', () => {
      const gpuBufferState = uploadVerticesToGpu(
        gpuBuffers,
        'ch1',
        vertices,
        gl as WebGL2RenderingContext
      );

      expect(gpuBufferState.vertexBufferNeedsInitializing).to.equal(false);
      expect(gpuBufferState.nextVerticeIndexInVertexBuffer).to.equal(
        vertices.length
      );
      expect(gpuBufferState.gpuBufferOverflow).to.equal(false);
    });

    it('Uploads correct vertices to vertex buffer', () => {
      uploadVerticesToGpu(
        gpuBuffers,
        'ch1',
        vertices,
        gl as WebGL2RenderingContext
      );

      //check it's called only once
      expect(glStub.called).to.be.true;
      expect(glStub.getCall(1)).to.be.null;

      const call = glStub.getCall(0);
      const args = call.args as unknown[];
      const startIndex = args[1];
      const data = args[2];

      expect(startIndex).to.equal(0);
      expect(data).to.deep.equal(Float32Array.from(vertices));
    });
  });
});
