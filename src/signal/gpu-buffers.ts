import {GLError} from '@src/structures/GLError';
import {GPUBufferState, RAMBufferState, State} from '@src/store/state';
import {getRamBuffer} from './ram-buffers';

const dataConsumptionBuffers = new Map<string, Float32Array>();
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
  lastPointXAddedToScreen: number | null;
  totalCoordonatesAdded: number;
  lastCoordonatesCountAddedToScreen: number;
  ramDataConsumed: number;
}

//holds entire sequence of data in GPU
//1 point is 3 elements
//1 point is 1ms (depending on pitch)
//1h = 60 * 60 * 1000 = 3600000 points = 10800000 elements = 43200000 bytes
const VERTEX_BUFFER_SIZE = 50 * 1024 * 1024; // 50Mb

//Batch vertices to be updated in the vertex buffer
//so that we add the same number of points on each draw
//this will help make the translation smoother
//Note: This value is closely related to ChannelOrchestrator's OUTPUT_FRAME_SIZE
export const VERTICES_BATCH_SIZE = 51; //51 = just a bit more than 60Hz si that we don't fall back too much behing and cause a drain

//If system doesn't upload data to GPU for a while
//(missed draw calls because of busy cpu, or no draw call because window is not visible)
//data will start to accumulate in the ramBufferssignal and points being drawn start
//to be too much behing "realtime" simulator data
//if the amount of data is above that threshold, drain the whole data buffer
//this will cause a "fastforward" of the signal, but will catchup with realtime
const VERTICES_DRAIN_THRESHOLD = VERTICES_BATCH_SIZE * 18;

const initialState = {
  vertexBufferSize: VERTEX_BUFFER_SIZE,
  vertexBufferNeedsInitializing: true,
  nextVerticeIndexInVertexBuffer: 0,
  gpuBufferOverflow: false,
  dataConsumptionBufferStartIndex: 0,
  pendingDrain: false,
};

//What we want:
// - Always upload the same amount of data
// - Never upload more than available for any channel
export const prepareDataUpload = (
  state: State,
  channelId: string,
  gl: WebGL2RenderingContext
): UploadOperationResult | null => {
  //find the gpu buffer and create it if necessary
  let bufferState = state.gpuBuffers.find(
    (buffer) => buffer.channelId === channelId
  );
  if (bufferState === undefined) {
    //create new state
    bufferState = {
      ...initialState,
      channelId: channelId,
    };
  }

  //find the ram buffer state for that channel
  const ramBufferState = state.ramBuffers.find(
    (buffer) => buffer.channelId === channelId
  );

  if (ramBufferState === undefined) {
    //no data to draw
    return null;
  }

  //get the corresponding ram buffer
  const ramBuffer = getRamBuffer(channelId);

  if (bufferState.gpuBufferOverflow) {
    return null;
  }

  if (
    bufferState.dataConsumptionBufferStartIndex === 0 &&
    ramBufferState.numberOfCoordonatesPendingBuffering === 0
  ) {
    //we don't want to be here, except at the start
    return null;
  }

  //Consume RAM data into dataConsumptionBuffer
  const {
    dataConsumptionBuffer,
    dataConsumptionBufferStartIndex,
    ramDataConsumed,
    pendingDrain,
  } = consumeRamBuffer(channelId, ramBuffer, ramBufferState, bufferState);

  //Upload vertices to gpu and calculate next state
  return {
    ...prepareUploadDataToGpu(
      {
        ...bufferState,
        dataConsumptionBufferStartIndex,
        pendingDrain,
      },
      dataConsumptionBuffer,
      gl
    ),
    ramDataConsumed,
  };
};

//returns number of vertices uploaded
const prepareUploadDataToGpu = (
  gpuBufferState: GPUBufferState,
  dataConsumptionBuffer: Float32Array,
  gl: WebGL2RenderingContext
): Omit<UploadOperationResult, 'ramDataConsumed'> => {
  const nextGpuBufferState = {
    ...gpuBufferState,
    ...initializeIfNeeded(gpuBufferState, gl),
  };

  const batchSize = gpuBufferState.pendingDrain
    ? dataConsumptionBuffer.length
    : Math.min(VERTICES_BATCH_SIZE, dataConsumptionBuffer.length);

  if (
    gpuBufferState.nextVerticeIndexInVertexBuffer *
      Float32Array.BYTES_PER_ELEMENT +
      batchSize * Float32Array.BYTES_PER_ELEMENT >=
    gpuBufferState.vertexBufferSize
  ) {
    nextGpuBufferState.gpuBufferOverflow = true;
    return {
      gpuBufferState: nextGpuBufferState,
      dataToUpload: null,
      lastPointXAddedToScreen: null,
      totalCoordonatesAdded: 0,
      lastCoordonatesCountAddedToScreen: 0,
    };
  }

  const elementCount = Math.min(
    dataConsumptionBuffer.length -
      gpuBufferState.dataConsumptionBufferStartIndex,
    batchSize
  );

  const newData = dataConsumptionBuffer.subarray(
    gpuBufferState.dataConsumptionBufferStartIndex,
    elementCount + gpuBufferState.dataConsumptionBufferStartIndex
  );

  nextGpuBufferState.dataConsumptionBufferStartIndex += elementCount;

  const lastPointXAdded = newData.subarray(newData.length - 3)[0];

  //we've consumed the whole buffer, restart at 0 with new data
  if (
    nextGpuBufferState.dataConsumptionBufferStartIndex >=
    dataConsumptionBuffer.length
  ) {
    nextGpuBufferState.dataConsumptionBufferStartIndex = 0;
    nextGpuBufferState.pendingDrain = false;
  }

  return {
    gpuBufferState: nextGpuBufferState,
    dataToUpload: newData,
    lastPointXAddedToScreen: lastPointXAdded,
    totalCoordonatesAdded: elementCount,
    lastCoordonatesCountAddedToScreen: elementCount,
  };
};

export const bindAndUploadDataToGpu = (
  gpuBufferState: GPUBufferState,
  dataToUpload: Float32Array | null,
  gl: WebGL2RenderingContext
): GPUBufferState => {
  const {channelId} = gpuBufferState;

  const nextGpuBufferState = {
    ...gpuBufferState,
    ...initializeIfNeeded(gpuBufferState, gl),
  };

  if (dataToUpload === null) {
    return nextGpuBufferState;
  }

  const dataConsumptionBuffer = dataConsumptionBuffers.get(channelId);

  if (dataConsumptionBuffer === undefined) {
    return nextGpuBufferState;
  }

  gl.bufferSubData(
    gl.ARRAY_BUFFER,
    gpuBufferState.nextVerticeIndexInVertexBuffer *
      Float32Array.BYTES_PER_ELEMENT,
    dataToUpload
  );

  nextGpuBufferState.nextVerticeIndexInVertexBuffer += dataToUpload.length;

  return nextGpuBufferState;
};

const initializeIfNeeded = (
  gpuBufferState: GPUBufferState,
  gl: WebGL2RenderingContext
): Pick<GPUBufferState, 'vertexBufferNeedsInitializing'> => {
  const nextState = {
    vertexBufferNeedsInitializing: gpuBufferState.vertexBufferNeedsInitializing,
  };

  if (!gpuBufferState.vertexBufferNeedsInitializing) {
    const buffer = getGpuBuffer(gpuBufferState.channelId);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    return nextState;
  }

  const buffer = gpuBuffers.get(gpuBufferState.channelId);

  //if buffer was already created, delete the previous one and recreate it
  if (buffer !== undefined) {
    gl.deleteBuffer(buffer);
  }

  const glBuffer = gl.createBuffer();

  if (glBuffer === null) {
    throw new GLError('Failed to create vertex buffer');
  }

  gpuBuffers.set(gpuBufferState.channelId, glBuffer);

  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    gpuBufferState.vertexBufferSize,
    gl.DYNAMIC_DRAW
  );

  nextState.vertexBufferNeedsInitializing = false;

  return nextState;
};

const consumeRamBuffer = (
  channelId: string,
  ramBuffer: Float32Array,
  ramBufferState: RAMBufferState,
  gpuBufferState: GPUBufferState
): {
  dataConsumptionBuffer: Float32Array;
  dataConsumptionBufferStartIndex: number;
  ramDataConsumed: number;
  pendingDrain: boolean;
} => {
  let dataConsumptionBuffer = dataConsumptionBuffers.get(channelId);

  //We don't have pending data to consume
  //We use just what's in the RAM buffer
  if (
    dataConsumptionBuffer === undefined ||
    gpuBufferState.dataConsumptionBufferStartIndex === 0
  ) {
    dataConsumptionBuffer = Float32Array.from(
      ramBuffer.subarray(0, ramBufferState.numberOfCoordonatesPendingBuffering)
    );
    dataConsumptionBuffers.set(channelId, dataConsumptionBuffer);
    return {
      dataConsumptionBuffer,
      dataConsumptionBufferStartIndex: 0,
      ramDataConsumed: ramBufferState.numberOfCoordonatesPendingBuffering,
      pendingDrain: false,
    };
  }

  //catchup if too much behind (no draw calls for too long)
  //upload all remaining data in app memory, ie: local consumption buffer
  //and what is in RAMBuffer
  if (dataConsumptionBuffer.length > VERTICES_DRAIN_THRESHOLD) {
    const remainingBufferCount =
      dataConsumptionBuffer.length -
      gpuBufferState.dataConsumptionBufferStartIndex;

    const remainingBufferData = dataConsumptionBuffer.subarray(
      gpuBufferState.dataConsumptionBufferStartIndex,
      dataConsumptionBuffer.length
    );

    //concatenate the current consumption buffer with all remaining data that needs to be uploaded
    dataConsumptionBuffer = new Float32Array(
      remainingBufferCount + ramBufferState.numberOfCoordonatesPendingBuffering
    );

    dataConsumptionBuffer.set(remainingBufferData, 0);
    dataConsumptionBuffer.set(
      ramBuffer.subarray(0, ramBufferState.numberOfCoordonatesPendingBuffering),
      remainingBufferCount
    );

    return {
      dataConsumptionBuffer,
      dataConsumptionBufferStartIndex: 0,
      ramDataConsumed: ramBufferState.numberOfCoordonatesPendingBuffering,
      pendingDrain: true,
    };
  }

  //Consume what we have left, do not consume RAM data
  return {
    dataConsumptionBuffer,
    dataConsumptionBufferStartIndex:
      gpuBufferState.dataConsumptionBufferStartIndex,
    ramDataConsumed: 0,
    pendingDrain: false,
  };
};
