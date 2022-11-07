import {
  clearContext,
  createGlContext,
  destroyGlContext,
  resizeGlContext,
} from './gl-context';
import {createStore} from './store/store';
import {getTimestampAtPixelPosition} from './screen/screen-utils';
import {pixelSizeToPointSize, screenSizeToPointSize} from './utils/conversions';
import {
  DataFrame,
  DrawingMode,
  GLPlotter,
  GLPlotterOptions,
  MeasureConfig,
  SignalConfig,
} from 'glplotter';

export function glplotter({
  referenceContainer,
  displayRate,
  stateObserver,
}: GLPlotterOptions): GLPlotter {
  const store = createStore();
  store.dispatch({
    type: 'screen/init',
    payload: {
      container: referenceContainer,
      displayRate,
    },
  });

  const contextProps = createGlContext(referenceContainer);

  const emitStateChanged = (): void => {
    const {screenState, gpuBuffers} = store.getState();
    const pointsPerWindow = screenSizeToPointSize(screenState);
    const gpuOverflow =
      gpuBuffers.find((buffer) => !!buffer.gpuBufferOverflow) !== undefined;
    stateObserver?.({pointsPerWindow, gpuOverflow});
  };

  const resizeListener = (): void => {
    resizeGlContext(referenceContainer, contextProps);

    store.dispatch({
      type: 'screen/new-container',
      payload: {
        container: referenceContainer,
      },
    });

    emitStateChanged();
  };

  //attach resize listener
  window.addEventListener('resize', resizeListener);

  let pendingAnimationRequest = requestAnimationFrame(() => draw());

  const draw = (): void => {
    const {gpuBuffers} = store.getState();

    clearContext(contextProps);

    store.dispatch({
      type: 'signal/drawAll',
      payload: {
        gl: contextProps.drawingContext,
      },
    });
    store.dispatch({
      type: 'measure/drawAll',
      payload: {
        gl: contextProps.drawingContext,
        textContext: contextProps.textContext,
      },
    });

    const hasBufferOverflown = gpuBuffers.find(
      (buffer) => !!buffer.gpuBufferOverflow
    );

    if (hasBufferOverflown) {
      emitStateChanged();
      return;
    }
    pendingAnimationRequest = requestAnimationFrame(draw);
  };

  return {
    bufferData: (data: DataFrame): void => {
      store.dispatch({
        type: 'data/buffer',
        payload: {
          ...data,
          gl: contextProps.drawingContext,
        },
      });
    },

    addSignal: (signal: SignalConfig): void => {
      store.dispatch({type: 'signal/add', payload: signal});
    },

    removeSignal: (id: string): void => {
      store.dispatch({type: 'signal/remove', payload: {id}});
    },

    replaceSignals: (signals: SignalConfig[]): void => {
      store.dispatch({type: 'signal/replaceAll', payload: {signals}});
    },

    stop: (): void => {
      if (pendingAnimationRequest) {
        cancelAnimationFrame(pendingAnimationRequest);
      }
      clearContext(contextProps);

      store.dispatch({
        type: 'signal/drawAll',
        payload: {
          gl: contextProps.drawingContext,
        },
      });
    },

    destroy: (): void => {
      stop();
      window.removeEventListener('resize', resizeListener);
      store.dispatch({
        type: 'signal/destroyAll',
        payload: {},
      });
      store.dispatch({
        type: 'measure/destroyAll',
        payload: {},
      });
      destroyGlContext(contextProps);
    },

    displayRate: (displayRate: number): void => {
      store.dispatch({
        type: 'screen/displayRate',
        payload: {displayRate, container: referenceContainer},
      });
      emitStateChanged();
    },

    zoom: (signalIds: string[], ratio: number): void => {
      store.dispatch({type: 'signal/zoom', payload: {signalIds, ratio}});
    },

    positionSignal: (signalId: string, yPosition: number): void => {
      store.dispatch({type: 'signal/position', payload: {signalId, yPosition}});
    },

    switchMode: (mode: DrawingMode): void => {
      store.dispatch({type: 'screen/switchMode', payload: {mode}});
    },

    move: (translation: number): void => {
      store.dispatch({type: 'screen/move', payload: {translation}});
    },

    timestamp: (pixelX: number): number => {
      const {screenState} = store.getState();
      return getTimestampAtPixelPosition(screenState, pixelX);
    },

    pixelToTimestamp: (pixel: number): number => {
      const {screenState} = store.getState();
      return pixelSizeToPointSize(screenState, pixel);
    },

    addMeasure: (measure: MeasureConfig): void => {
      store.dispatch({type: 'measure/add', payload: measure});
    },

    removeMeasure: (id: string): void => {
      store.dispatch({type: 'measure/remove', payload: {id}});
    },

    replaceMeasures: (measures: MeasureConfig[]): void => {
      store.dispatch({type: 'measure/replaceAll', payload: {measures}});
    },
  };
}
