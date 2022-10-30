import {Signal, State} from '@src/store/state';
import {SignalDrawerManual} from './drawer-manual';

export const SignalDrawerAutomove = {
  draw(state: State, signal: Signal, gl: WebGL2RenderingContext): void {
    if (state.screenState.totalCoordonatesAddedToScreen === 0) {
      return;
    }

    SignalDrawerManual.draw(state, signal, gl);
  },
};
