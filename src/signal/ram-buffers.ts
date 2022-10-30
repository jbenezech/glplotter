import {GLError} from '@src/structures/GLError';
import {RAMBufferState, State} from 'src/store/state';
import {Point} from '@src/structures/Point';

//holds data in RAM between 2 draw calls
//reusing the same Float32Array
//start small but take into account slow startup.
//buffer will autoscale

//data is 32-bit floating point numbers -> 4 bytes per point
export const RAM_BUFFER_SIZE = (1024 * 40) / Float32Array.BYTES_PER_ELEMENT; //1Mb

const ramBuffers = new Map<string, Float32Array>();

export const getRamBuffer = (channelId: string): Float32Array => {
  const buffer = ramBuffers.get(channelId);
  if (buffer === undefined) {
    throw new GLError(
      `Trying to get non existant RAM buffer for channel ${channelId}`
    );
  }
  return buffer;
};

export const resetRamBuffers = (): void => {
  ramBuffers.clear();
};

export const initialState = {
  numberOfCoordonatesPendingBuffering: 0,
  previousCoordinates: undefined,
  zeroCoordinates: undefined,
};

export const bufferDataInRam = (
  state: State,
  channelId: string,
  points: Point[]
): RAMBufferState => {
  //find the buffer and add the data to it
  let bufferState = state.ramBuffers.find(
    (buffer) => buffer.channelId === channelId
  );
  if (bufferState === undefined) {
    //create new state
    bufferState = {
      ...initialState,
      channelId: channelId,
    };
    ramBuffers.set(channelId, new Float32Array(RAM_BUFFER_SIZE));
  }

  //calculate next state
  const nextState = feedAll(bufferState, points);

  return nextState;
};

export const consumeDataBuffers = (
  state: State,
  dataConsumers: {channelId: string; ramDataConsumed: number}[]
): RAMBufferState[] => {
  return state.ramBuffers.map((buffer) => {
    const channelResult = dataConsumers.find(
      (dataConsumer) => dataConsumer.channelId === buffer.channelId
    );

    if (channelResult === undefined) {
      return buffer;
    }

    const {ramDataConsumed} = channelResult;

    return {
      ...buffer,
      numberOfCoordonatesPendingBuffering:
        buffer.numberOfCoordonatesPendingBuffering - ramDataConsumed,
    };
  });
};

function feedAll(bufferState: RAMBufferState, points: Point[]): RAMBufferState {
  let nextState = bufferState;

  //Ensure continuous data points
  if (bufferState.zeroCoordinates === undefined) {
    for (let pointX = 0; pointX < points[0].x; pointX++) {
      nextState = feedOne(nextState, {x: pointX, y: 0});
    }
  }
  points.forEach((point) => {
    try {
      nextState = feedOne(nextState, point);
    } catch (err) {
      console.error(`RAM error adding coordonates ${point.x},${point.y}`, err);
    }
  });

  return nextState;
}

function feedOne(
  bufferState: RAMBufferState,
  coordonates: Point
): RAMBufferState {
  if (isNaN(coordonates.x) || isNaN(coordonates.y)) {
    throw 'invalid coordonates';
  }

  const {lineVertices, zeroCoordinates, previousCoordinates} =
    coordonatesToLineVertices(bufferState, coordonates);

  resizeBufferIfNeeded(bufferState, lineVertices);
  const newBuffer = getRamBuffer(bufferState.channelId);

  newBuffer.set(lineVertices, bufferState.numberOfCoordonatesPendingBuffering);
  const newNumberOfCoordonatesPendingBuffering =
    bufferState.numberOfCoordonatesPendingBuffering + lineVertices.length;

  return {
    ...bufferState,
    numberOfCoordonatesPendingBuffering: newNumberOfCoordonatesPendingBuffering,
    previousCoordinates: previousCoordinates,
    zeroCoordinates: zeroCoordinates,
  };
}

function coordonatesToLineVertices(
  buffer: RAMBufferState,
  coordonates: Point
): {
  lineVertices: number[];
  zeroCoordinates: Point;
  previousCoordinates: Point;
} {
  const pointX = coordonates.x;
  const pointY = coordonates.y;

  const nextState: {
    lineVertices: number[];
    zeroCoordinates: Point;
    previousCoordinates: Point;
  } = {
    lineVertices: [pointX, pointY, 0],
    zeroCoordinates: buffer.zeroCoordinates || coordonates,
    previousCoordinates: buffer.previousCoordinates || coordonates,
  };

  //transform point coordinates to line vertices
  //ensure continous points
  //If there is a gap, feill it with same Y
  let nextX = nextState.previousCoordinates.x + 1;
  let index = 0;

  while (nextX <= pointX) {
    nextState.lineVertices[index] = nextX;
    nextState.lineVertices[index + 1] = pointY;
    nextState.lineVertices[index + 2] = 0;

    nextState.previousCoordinates = {
      x: nextX,
      y: pointY,
    };

    nextX++;
    index += 3;
  }

  return nextState;
}

/**
 * Calculates a buffer that will best fit the data
 * taking into account the new vertices we want to add
 * Bigger or smaller size buffer depending
 */
function resizeBufferIfNeeded(
  bufferState: RAMBufferState,
  lineVertices: number[]
): void {
  const buffer = getRamBuffer(bufferState.channelId);

  if (
    bufferState.numberOfCoordonatesPendingBuffering >=
    buffer.length - lineVertices.length
  ) {
    console.warn(
      'Increased vertices cache size',
      bufferState.numberOfCoordonatesPendingBuffering,
      buffer.length
    );
    const oldCache = buffer;

    //double its size
    const newSize = buffer.length * 2;

    //extend and fill with existing data
    const resizedBuffer = new Float32Array(newSize);
    resizedBuffer.set(oldCache);
    ramBuffers.set(bufferState.channelId, resizedBuffer);
  } else if (
    bufferState.numberOfCoordonatesPendingBuffering < RAM_BUFFER_SIZE &&
    buffer.length > RAM_BUFFER_SIZE * 4
  ) {
    //decrease buffer size
    const oldCache = buffer.slice(
      0,
      bufferState.numberOfCoordonatesPendingBuffering
    );
    const resizedBuffer = new Float32Array(buffer.length / 2);
    resizedBuffer.set(oldCache);
    ramBuffers.set(bufferState.channelId, resizedBuffer);
  }
}
