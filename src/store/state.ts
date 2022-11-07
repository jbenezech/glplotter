import {DrawingMode, SignalConfig} from 'glplotter';

export interface GlState {
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
  gpuBuffers: GPUBufferState[];
  signals: Signal[];
  measures: Measure[];
  measureRamBuffer: MeasureRamBufferState;
  measureGpuBuffer: MeasureGpuBufferState;
  screenState: ScreenState;
  samplingFrequency: number; //used to determine how many points we upload to gpu per run
}

export interface GPUBufferState {
  channelId: string;
  vertexBufferSize: number;
  vertexBufferNeedsInitializing: boolean;
  gpuBufferOverflow: boolean;
  nextVerticeIndexInVertexBuffer: number;
  scheduledForDeletion: boolean;
}

export interface Signal extends SignalConfig {
  color: number[];
}

export interface Measure {
  id: string;
  pointX: number;
  middleLinePosition: number;
  width: number;
  middleLineWidth: number;
  text: string;
  color: number[];
}

export interface MeasureRamBufferState {
  measureIndexes: MeasureRamBufferIndex[];
  isDirty: boolean;
}

export interface MeasureRamBufferIndex {
  measureId: string;
  index: number;
}

export interface MeasureGpuBufferState {
  scheduledForDeletion: boolean;
}

export interface ScreenState {
  totalCoordonatesDrawn: number;

  drawingMode: DrawingMode;

  pxToMm: number;
  displayRate: number;
  containerHeight: number;
  containerWidth: number;
  pitch: number;

  matrixes: ScreenMatrixes;
}

export interface ScreenMatrixes {
  xTranslation: number;
  modelMatrix: number[];
  projectionMatrix: number[];
}
