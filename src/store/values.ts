import {ScreenMatrixes, ScreenState, Signal, State} from './state';

//TODO, reuse
export const BASE_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export const DOMAIN_HEIGHT = 2; //Gl domain: -1 to 1

const initialScreenMatrixes: ScreenMatrixes = {
  projectionMatrix: [
    //Initial matrix with camera at 0,0,1,1
    2, 0, 0, 0, 0, 2, 0, 0, 0, 0, -2, 0, -1, -1, -1, 1,
  ],
  modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  totalXTranslation: 0,
  xTranslation: 0,
};

const initialScreenState: ScreenState = {
  totalRotations: 0,
  totalCoordonatesAdded: 0,
  lastPointXAddedToScreen: 0,
  totalCoordonatesAddedToScreen: 0,
  lastCoordonatesCountAddedToScreen: 0,

  drawingMode: 'ROTATE',

  mmToPx: 0,
  displayRate: 50,
  containerHeight: 0,
  containerWidth: 0,
  pitch: 1,

  matrixes: initialScreenMatrixes,
};

export const initialState: State = {
  ramBuffers: [],
  gpuBuffers: [],
  signals: [],
  screenState: initialScreenState,
  samplingFrequency: 1000,
};

export const initialSignalState: Signal = {
  id: '',
  containerId: '',
  channelId: '',
  color: [0, 0, 0, 1],
  visible: true,
  amplitude: 1,
  pitch: 1,
  chartHeight: 20,
  yPosition: 0,
  zoomRatio: 1,
};
