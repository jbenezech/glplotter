import {State} from '@src/store/state';
import {drawManualMeasures} from './drawer-manual';

export const drawAutomoveMeasures = (
  state: State,
  gl: WebGL2RenderingContext,
  textContext: CanvasRenderingContext2D
): void => {
  drawManualMeasures(state, gl, textContext);
};
