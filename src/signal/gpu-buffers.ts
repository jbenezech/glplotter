import {GLError} from '@src/structures/GLError';
import {GPUBufferState, ScreenState} from '@src/store/state';

const gpuBuffers = new Map<string, WebGLBuffer>();

export const getGpuBuffer = (channelId: string): WebGLBuffer => {
  const buffer = gpuBuffers.get(channelId);
  if (buffer === undefined) {
    throw new GLError(
      `Trying to get non existant GPU buffer for channel ${channelId}`
    );
  }
  return buffer;
};

export const resetGpuBuffers = (): void => {
  gpuBuffers.clear();
};

export interface UploadOperationResult {
  gpuBufferState: GPUBufferState;
  dataToUpload: Float32Array | null;
}

//holds entire sequence of data in GPU
//1 point is 3 elements
//1 point is 1ms (depending on samplingRate)
//1h = 60 * 60 * 1000 = 3600000 points = 10800000 elements = 43200000 bytes
const VERTEX_BUFFER_SIZE = 50 * 1024 * 1024; // 50Mb

//Batch vertices to be updated in the vertex buffer
//so that we add the same number of points on each draw
//this will help make the translation smoother
export const VERTICES_BATCH_SIZE = 51; //51 = just a bit more than 60Hz so that we don't fall back too much behing and cause a drain

//If system doesn't upload data to GPU for a while
//(missed draw calls because of busy cpu, or no draw call because window is not visible)
//data will start to accumulate in the ramBufferssignal and points being drawn start
//to be too much behing "realtime" data
//if the amount of data is above that threshold, drain the whole data buffer
//this will cause a "fastforward" of the signal, but will catchup with realtime
const VERTICES_DRAIN_THRESHOLD = VERTICES_BATCH_SIZE * 18;

const initialState: Omit<GPUBufferState, 'channelId'> = {
  vertexBufferSize: VERTEX_BUFFER_SIZE,
  vertexBufferNeedsInitializing: true,
  nextVerticeIndexInVertexBuffer: 0,
  gpuBufferOverflow: false,
  scheduledForDeletion: false,
};

export const calculateDrawBatchSize = ({
  totalCoordonatesDrawn,
  gpuBuffers,
}: Pick<ScreenState, 'totalCoordonatesDrawn'> & {
  gpuBuffers: Pick<GPUBufferState, 'nextVerticeIndexInVertexBuffer'>[];
}): number => {
  let batchSize = VERTICES_BATCH_SIZE;
  if (
    shouldSignalsBeDrained({
      totalCoordonatesDrawn,
      gpuBuffers,
    })
  ) {
    batchSize = Infinity;
  }
  //get the maximum data available
  const nbrCoordonatesToDraw = gpuBuffers.reduce(
    (min, buffer) =>
      Math.min(
        min,
        buffer.nextVerticeIndexInVertexBuffer - totalCoordonatesDrawn
      ),
    batchSize
  );

  return nbrCoordonatesToDraw;
};

const shouldSignalsBeDrained = ({
  totalCoordonatesDrawn,
  gpuBuffers,
}: Pick<ScreenState, 'totalCoordonatesDrawn'> & {
  gpuBuffers: Pick<GPUBufferState, 'nextVerticeIndexInVertexBuffer'>[];
}): boolean => {
  return gpuBuffers.reduce((willDrain, gpuBufferState) => {
    if (willDrain) {
      return true;
    }
    return (
      gpuBufferState.nextVerticeIndexInVertexBuffer - totalCoordonatesDrawn >
      VERTICES_DRAIN_THRESHOLD
    );
  }, false);
};

export const uploadVerticesToGpu = (
  gpuBuffers: GPUBufferState[],
  channelId: string,
  vertices: number[],
  gl: WebGL2RenderingContext
): GPUBufferState => {
  //find the gpu buffer and create it if necessary
  let gpuBufferState = gpuBuffers.find(
    (buffer) => buffer.channelId === channelId
  );

  let backFillCount = 0;
  if (gpuBufferState === undefined) {
    //create new state
    gpuBufferState = {
      ...initialState,
      channelId: channelId,
    };

    //When uploading the first vertices,
    //Backfill with what other buffers already filled
    //So that we always have buffers with the same indices
    backFillCount = gpuBuffers.reduce(
      (maxVertices, buffer) =>
        Math.max(maxVertices, buffer.nextVerticeIndexInVertexBuffer),
      0
    );
    backFillCount = Math.max(0, backFillCount - vertices.length);
  }

  const backfillVertices = Array(backFillCount).fill(undefined) as number[];

  const nextGpuBufferState = {
    ...gpuBufferState,
    ...initializeIfNeeded(gpuBufferState, gl),
  };

  const dataUpload = [...backfillVertices, ...vertices];

  if (
    nextGpuBufferState.nextVerticeIndexInVertexBuffer *
      Float32Array.BYTES_PER_ELEMENT +
      dataUpload.length * Float32Array.BYTES_PER_ELEMENT >=
    gpuBufferState.vertexBufferSize
  ) {
    return {
      ...nextGpuBufferState,
      gpuBufferOverflow: true,
    };
  }

  gl.bufferSubData(
    gl.ARRAY_BUFFER,
    nextGpuBufferState.nextVerticeIndexInVertexBuffer *
      Float32Array.BYTES_PER_ELEMENT,
    Float32Array.from(dataUpload)
  );

  nextGpuBufferState.nextVerticeIndexInVertexBuffer += dataUpload.length;

  return {
    ...nextGpuBufferState,
    gpuBufferOverflow: false,
  };
};

export const initializeIfNeeded = (
  {
    vertexBufferNeedsInitializing,
    channelId,
    vertexBufferSize,
    nextVerticeIndexInVertexBuffer,
  }: Pick<
    GPUBufferState,
    | 'vertexBufferNeedsInitializing'
    | 'channelId'
    | 'vertexBufferSize'
    | 'nextVerticeIndexInVertexBuffer'
  >,
  gl: WebGL2RenderingContext
): Pick<GPUBufferState, 'vertexBufferNeedsInitializing'> => {
  const nextState = {
    vertexBufferNeedsInitializing: vertexBufferNeedsInitializing,
  };

  if (!vertexBufferNeedsInitializing) {
    const buffer = getGpuBuffer(channelId);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    return nextState;
  }

  const buffer = gpuBuffers.get(channelId);

  //if buffer was already created, delete the previous one and recreate it
  if (buffer !== undefined) {
    gl.deleteBuffer(buffer);
  }

  const glBuffer = gl.createBuffer();

  if (glBuffer === null) {
    throw new GLError('Failed to create vertex buffer');
  }

  gpuBuffers.set(channelId, glBuffer);

  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertexBufferSize, gl.DYNAMIC_DRAW);

  //If the newly created buffer does not start its
  //indices at zero, backfill it with empty vertices
  if (nextVerticeIndexInVertexBuffer > 0) {
    const emptyVertice = Array(nextVerticeIndexInVertexBuffer).fill(undefined);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from(emptyVertice));
  }

  nextState.vertexBufferNeedsInitializing = false;

  return nextState;
};

export const deleteGpuBuffer = (
  gpuBufferState: GPUBufferState,
  gl: WebGL2RenderingContext
): void => {
  const buffer = gpuBuffers.get(gpuBufferState.channelId);
  if (buffer === undefined) {
    return;
  }
  if (!gl.isBuffer(buffer)) {
    return;
  }
  gl.deleteBuffer(buffer);
};
