import {MeasureGpuBufferState, MeasureRamBufferState} from '@src/store/state';
import {GLError} from '@src/structures/GLError';
import {getMeasureVertices} from './ram-buffer';

let vertexBuffer: WebGLBuffer | null = null;

export const bindAndUploadMeasures = (
  ramBufferState: MeasureRamBufferState,
  gpuBufferState: MeasureGpuBufferState,
  gl: WebGL2RenderingContext
): MeasureGpuBufferState => {
  if (vertexBuffer !== null && !ramBufferState.isDirty) {
    return gpuBufferState;
  }

  if (vertexBuffer !== null) {
    deleteMeasureBuffer(gl);
  }

  vertexBuffer = gl.createBuffer();

  if (vertexBuffer === null) {
    throw new GLError('Failed to create vertex buffer');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  const vertices = getMeasureVertices();

  gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

  return gpuBufferState;
};

export const deleteMeasureBuffer = (gl: WebGL2RenderingContext): void => {
  if (vertexBuffer === null) {
    return;
  }
  if (!gl.isBuffer(vertexBuffer)) {
    return;
  }
  gl.deleteBuffer(vertexBuffer);
};
