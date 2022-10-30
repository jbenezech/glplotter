import {createGlContext} from './gl-context';
import {createStore} from './store/store';
import {DataFrame} from './structures/DataFrame';
import {DrawingMode, Signal} from './store/state';

interface GLPlotterOptions {
  referenceContainer: HTMLElement;
  displayRate: number;
}

interface GLPlotter {
  bufferData: (data: DataFrame) => void;
  addSignal: (signal: Signal) => void;
  stop: () => void;
  displayRate: (displayRate: number) => void;
  zoom: (signalIds: string[], ratio: number) => void;
  positionSignal: (signalId: string, yPosition: number) => void;
  switchMode: (mode: DrawingMode) => void;
  move: (translation: number) => void;
}

export function glplotter({
  referenceContainer,
  displayRate,
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
  let pendingAnimationRequest = requestAnimationFrame(() => draw());

  const draw = (): void => {
    store.dispatch({
      type: 'signal/drawAll',
      payload: {
        containerId: 'c1',
        gl: contextProps.drawingContext,
      },
    });

    const hasBufferOverflown = store
      .getState()
      .gpuBuffers.find((buffer) => !!buffer.gpuBufferOverflow);

    if (hasBufferOverflown) {
      //@TODO call callback in options
      return;
    }
    pendingAnimationRequest = requestAnimationFrame(draw);
  };

  return {
    bufferData: (data: DataFrame): void => {
      store.dispatch({type: 'data/buffer', payload: data});
    },

    addSignal: (signal: Signal): void => {
      store.dispatch({type: 'signal/add', payload: signal});
    },

    stop: (): void => {
      if (pendingAnimationRequest) {
        cancelAnimationFrame(pendingAnimationRequest);
      }
    },

    displayRate: (displayRate: number): void => {
      store.dispatch({
        type: 'screen/displayRate',
        payload: {displayRate, container: referenceContainer},
      });
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
  };
}
