import {Point} from '@src/structures/Point';

export interface GlState {
  containerId: string;
  dimensions: {
    width: number;
    height: number;
  };
  textCanvas: HTMLCanvasElement;
  drawingCanvas: HTMLCanvasElement;
  textContext: CanvasRenderingContext2D;
  drawingContext: WebGL2RenderingContext;
}

export interface State {
  ramBuffers: RAMBufferState[];
  gpuBuffers: GPUBufferState[];
  signals: Signal[];
  screenState: ScreenState;
  samplingFrequency: number; //used to determine how many points we upload to gpu per run
}

export interface RAMBufferState {
  channelId: string;
  numberOfCoordonatesPendingBuffering: number;
  previousCoordinates?: Point;
  zeroCoordinates?: Point;
}

export interface GPUBufferState {
  channelId: string;
  vertexBufferSize: number;
  vertexBufferNeedsInitializing: boolean;
  nextVerticeIndexInVertexBuffer: number;
  gpuBufferOverflow: boolean;
  dataConsumptionBufferStartIndex: number;
  pendingDrain: boolean;
}

export interface Signal {
  id: string;
  containerId: string;
  channelId: string;
  color: number[];
  visible: boolean;
  amplitude: number;
  pitch: number;
  chartHeight: number;
  yPosition: number;

  zoomRatio: number;
}

export type DrawingMode = 'MANUAL' | 'AUTOMOVE' | 'ROTATE';

export interface ScreenState {
  totalRotations: number;
  totalCoordonatesAdded: number;
  lastPointXAddedToScreen: number;
  totalCoordonatesAddedToScreen: number;
  lastCoordonatesCountAddedToScreen: number;

  drawingMode: DrawingMode;

  mmToPx: number;
  displayRate: number;
  containerHeight: number;
  containerWidth: number;
  pitch: number;

  matrixes: ScreenMatrixes;
}

export interface ScreenMatrixes {
  xTranslation: number;

  totalXTranslation: number;

  modelMatrix: number[];
  projectionMatrix: number[];
}
