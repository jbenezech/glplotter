import {expect} from 'chai';
import {
  bufferData,
  getRamBuffer,
  RAM_BUFFER_SIZE,
  resetRamBuffers,
} from '@src/signal/ram-buffers';
import {initialState} from '@src/store/values';

describe('RAM Buffer', () => {
  let state;
  const initialBufferSize = RAM_BUFFER_SIZE;

  beforeEach(() => {
    state = initialState;
    resetRamBuffers();
  });

  afterEach(() => {
    const ramObject = require('../../../src/signal/ramBuffers');
    ramObject.RAM_BUFFER_SIZE = initialBufferSize;
  });

  it('Creates buffer if it does not exist', () => {
    const dataFrame = [
      {x: 0, y: 1},
      {x: 1, y: 2},
    ];

    bufferData(state, 'ch1', dataFrame);
    const newBuffer = getRamBuffer('ch1');

    expect(newBuffer).to.be.a('float32array');
  });

  it('Fills buffer correctly', () => {
    const dataFrame = [
      {x: 0, y: 1},
      {x: 1, y: 2},
    ];
    const vertices = [0, 1, 0, 1, 2, 0];

    bufferData(state, 'ch1', dataFrame);
    const newBuffer = getRamBuffer('ch1');

    const expectation = new Float32Array(RAM_BUFFER_SIZE);
    expectation.set(vertices);

    expect(newBuffer).to.deep.equal(expectation);
  });

  it('Fills initial zeros correctly', () => {
    const dataFrame = [
      {x: 2, y: 3},
      {x: 3, y: 4},
    ];
    const vertices = [0, 0, 0, 1, 0, 0, 2, 3, 0, 3, 4, 0];

    bufferData(state, 'ch1', dataFrame);
    const newBuffer = getRamBuffer('ch1');

    const expectation = new Float32Array(RAM_BUFFER_SIZE);
    expectation.set(vertices);

    expect(newBuffer).to.deep.equal(expectation);
  });

  it('Fills fills gaps correctly', () => {
    const dataFrame = [
      {x: 0, y: 1},
      {x: 1, y: 2},
      {x: 3, y: 4},
    ];
    const vertices = [0, 1, 0, 1, 2, 0, 2, 4, 0, 3, 4, 0];

    bufferData(state, 'ch1', dataFrame);
    const newBuffer = getRamBuffer('ch1');

    const expectation = new Float32Array(RAM_BUFFER_SIZE);
    expectation.set(vertices);

    expect(newBuffer).to.deep.equal(expectation);
  });

  it('Updates state correctly', () => {
    const dataFrame = [
      {x: 0, y: 1},
      {x: 1, y: 2},
    ];

    const newBufferState = bufferData(state, 'ch1', dataFrame);

    expect(newBufferState.numberOfCoordonatesPendingBuffering).to.equal(6);

    expect(newBufferState.zeroCoordinates).to.deep.equal({x: 0, y: 1});
    expect(newBufferState.previousCoordinates).to.deep.equal({x: 1, y: 2});
  });

  it('Handles multiple frames correctly', () => {
    let dataFrame = [
      {x: 0, y: 1},
      {x: 1, y: 2},
    ];
    let newBufferState = bufferData(state, 'ch1', dataFrame);

    dataFrame = [
      {x: 2, y: 3},
      {x: 3, y: 4},
    ];
    newBufferState = bufferData(
      {
        ...state,
        ramBuffers: [newBufferState],
      },
      'ch1',
      dataFrame
    );

    const vertices = [0, 1, 0, 1, 2, 0, 2, 3, 0, 3, 4, 0];

    const newBuffer = getRamBuffer('ch1');

    const expectation = new Float32Array(RAM_BUFFER_SIZE);
    expectation.set(vertices);

    expect(newBuffer).to.deep.equal(expectation);
    expect(newBufferState.numberOfCoordonatesPendingBuffering).to.equal(12);
    expect(newBufferState.previousCoordinates).to.deep.equal({x: 3, y: 4});
  });

  it('Increases buffer size if needed', () => {
    const ramObject = require('../../../src/signal/ramBuffers');
    ramObject.RAM_BUFFER_SIZE = 1 * Float32Array.BYTES_PER_ELEMENT;
    let dataFrame = [
      {x: 0, y: 1},
      {x: 1, y: 2},
    ];

    bufferData(state, 'ch1', dataFrame);
    const newBuffer = getRamBuffer('ch1');

    expect(newBuffer).to.have.lengthOf(8);
  });

  it('Decreases buffer size if needed', () => {
    const ramObject = require('../../../src/signal/ramBuffers');
    let dataFrame = [
      {x: 0, y: 1},
      {x: 1, y: 2},
    ];
    let newBufferState = bufferData(state, 'ch1', dataFrame);

    //buffer was created with original (big) size
    //if wanted a smaller size, fake it here
    ramObject.RAM_BUFFER_SIZE = 8 * Float32Array.BYTES_PER_ELEMENT;
    dataFrame = [{x: 2, y: 3}];

    bufferData(
      {
        ...state,
        ramBuffers: [newBufferState],
      },
      'ch1',
      dataFrame
    );
    const newBuffer = getRamBuffer('ch1');

    expect(newBuffer).to.have.lengthOf(5120);
  });

  it('Keeps feeding on partial errors', () => {
    const dataFrame = [
      {x: 0, y: 1},
      {x: 'abc', y: 'z'},
      {x: 1, y: 2},
    ];
    const vertices = [0, 1, 0, 1, 2, 0];

    bufferData(state, 'ch1', dataFrame);
    const newBuffer = getRamBuffer('ch1');

    const expectation = new Float32Array(RAM_BUFFER_SIZE);
    expectation.set(vertices);

    expect(newBuffer).to.deep.equal(expectation);
  });
});
