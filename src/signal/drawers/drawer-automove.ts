import {Signal, State} from '@src/store/state';
import {drawManualSignal} from './drawer-manual';

export const drawAutomoveSignal = (
  state: State,
  signal: Signal,
  totalCoordonatesAvailable: number,
  gl: WebGL2RenderingContext
): void => {
  if (state.screenState.totalCoordonatesDrawn === 0) {
    return;
  }

  drawManualSignal(state, signal, totalCoordonatesAvailable, gl);
};
