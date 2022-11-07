declare module 'glplotter' {
  export interface GLPlotterInfo {
    pointsPerWindow: number;
    gpuOverflow: boolean;
  }

  export interface GLPlotterOptions {
    referenceContainer: HTMLElement;
    displayRate: number;
    stateObserver?: (state: GLPlotterInfo) => void;
  }

  type DrawingMode = 'MANUAL' | 'AUTOMOVE' | 'ROTATE';

  interface Point {
    x: number;
    y: number;
  }

  interface DataFrame {
    channelId: string;
    points: Point[];
  }

  interface SignalConfig {
    id: string;
    channelId: string;
    color: string | number[];
    visible: boolean;
    amplitude: number;
    pitch: number;
    chartHeight: number;
    yPosition: number;
    zoomRatio: number;
  }

  interface MeasureConfig {
    id: string;
    pixelTop: number;
    timestamp: number;
    pixelWidth: number;
    color: string | number[];
  }

  interface GLPlotter {
    bufferData: (data: DataFrame) => void;
    addSignal: (signal: SignalConfig) => void;
    removeSignal: (id: string) => void;
    replaceSignals: (signals: SignalConfig[]) => void;
    stop: () => void;
    destroy: () => void;
    displayRate: (displayRate: number) => void;
    zoom: (signalIds: string[], ratio: number) => void;
    positionSignal: (signalId: string, yPosition: number) => void;
    switchMode: (mode: DrawingMode) => void;
    move: (translation: number) => void;
    timestamp: (pixelX: number) => number;
    pixelToTimestamp: (pixel: number) => number;
    addMeasure: (signal: MeasureConfig) => void;
    removeMeasure: (id: string) => void;
    replaceMeasures: (signals: MeasureConfig[]) => void;
  }

  export function glplotter(options: GLPlotterOptions): GLPlotter;
}
