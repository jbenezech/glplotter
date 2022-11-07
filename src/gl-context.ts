import {glMatrix} from 'gl-matrix';
import {GLError} from './structures/GLError';

interface Dimension {
  width: number;
  height: number;
}

export interface GLContextProps {
  textCanvas: HTMLCanvasElement;
  drawingCanvas: HTMLCanvasElement;
  textContext: CanvasRenderingContext2D;
  drawingContext: WebGL2RenderingContext;
}

export const createGlContext = (domElement: HTMLElement): GLContextProps => {
  const dimensions = {
    width: domElement.getBoundingClientRect().width,
    height: domElement.getBoundingClientRect().height,
  };

  // Create a container holding two canvas
  // - one for the 2d drawing
  // - one for the text
  const textCanvas = document.createElement('canvas');
  domElement.appendChild(textCanvas);

  const drawingCanvas = document.createElement('canvas');
  domElement.appendChild(drawingCanvas);

  positionCanvas(textCanvas, dimensions);
  positionCanvas(drawingCanvas, dimensions);

  glMatrix.setMatrixArrayType(Array);

  const {textContext, drawingContext} = initializeContexts(
    textCanvas,
    drawingCanvas
  );

  return {
    textCanvas,
    drawingCanvas,
    textContext,
    drawingContext,
  };
};

const positionCanvas = (
  canvas: HTMLCanvasElement,
  dimensions: Dimension
): void => {
  const scale = +window.devicePixelRatio || 1;

  canvas.width = Math.floor(dimensions.width * scale) | 0;
  canvas.height = Math.floor(dimensions.height * scale) | 0;

  canvas.style.position = 'absolute';
  canvas.style.top = '0px';
  canvas.style.left = '0px';
  canvas.style.width = `${Math.floor(dimensions.width)}px`;
  canvas.style.height = `${Math.floor(dimensions.height)}px`;
};

const initializeContexts = (
  textCanvas: HTMLCanvasElement,
  drawingCanvas: HTMLCanvasElement
): {
  textContext: CanvasRenderingContext2D;
  drawingContext: WebGL2RenderingContext;
} => {
  const textContext = textCanvas.getContext('2d');

  if (textContext === null) {
    throw new GLError('Could not create text context');
  }

  const drawingContext = drawingCanvas.getContext('webgl2', {
    preserveDrawingBuffer: false,
    antialias: false,
  });

  if (drawingContext === null) {
    throw new GLError('Could not create drawing context');
  }

  drawingContext.disable(drawingContext.SCISSOR_TEST);
  drawingContext.clearColor(0, 0, 0, 0);
  drawingContext.clear(drawingContext.COLOR_BUFFER_BIT);
  drawingContext.clearDepth(1.0);
  drawingContext.enable(drawingContext.BLEND);
  drawingContext.blendFunc(
    drawingContext.SRC_ALPHA,
    drawingContext.ONE_MINUS_SRC_ALPHA
  );
  drawingContext.disable(drawingContext.DEPTH_TEST);
  drawingContext.lineWidth(2);

  drawingContext.viewport(
    0,
    0,
    drawingContext.drawingBufferWidth,
    drawingContext.drawingBufferHeight
  );

  return {textContext, drawingContext};
};

export const resizeGlContext = (
  domElement: HTMLElement,
  {textContext, drawingContext}: GLContextProps
): void => {
  const dimensions = {
    width: domElement.getBoundingClientRect().width,
    height: domElement.getBoundingClientRect().height,
  };
  positionCanvas(textContext.canvas, dimensions);
  positionCanvas(drawingContext.canvas, dimensions);

  drawingContext.viewport(
    0,
    0,
    drawingContext.drawingBufferWidth,
    drawingContext.drawingBufferHeight
  );
};

export const clearContext = ({
  textContext,
  drawingContext,
}: GLContextProps): void => {
  drawingContext.disable(drawingContext.SCISSOR_TEST);
  drawingContext.clearColor(0, 0, 0, 0);
  drawingContext.clear(
    drawingContext.COLOR_BUFFER_BIT | drawingContext.DEPTH_BUFFER_BIT
  );

  // Clear the 2D canvas
  textContext.clearRect(
    0,
    0,
    textContext.canvas.width,
    textContext.canvas.height
  );
};

export const destroyGlContext = ({
  textContext,
  drawingContext,
}: GLContextProps): void => {
  textContext.clearRect(
    0,
    0,
    textContext.canvas.width,
    textContext.canvas.height
  );
  drawingContext.disable(drawingContext.SCISSOR_TEST);
  drawingContext.clearColor(0, 0, 0, 0);
  drawingContext.clear(
    drawingContext.COLOR_BUFFER_BIT | drawingContext.DEPTH_BUFFER_BIT
  );

  textContext.canvas.parentNode?.removeChild(textContext.canvas);
  drawingContext.canvas.parentNode?.removeChild(drawingContext.canvas);
};

export const GLContext = {
  create(domElement: HTMLElement): GLContextProps {
    const dimensions = {
      width: domElement.getBoundingClientRect().width,
      height: domElement.getBoundingClientRect().height,
    };

    // Create a container holding two canvas
    // - one for the 2d drawing
    // - one for the text
    const textCanvas = document.createElement('canvas');
    domElement.appendChild(textCanvas);

    const drawingCanvas = document.createElement('canvas');
    domElement.appendChild(drawingCanvas);

    this.positionCanvas(textCanvas, dimensions);
    this.positionCanvas(drawingCanvas, dimensions);

    const {textContext, drawingContext} = this.initializeContexts(
      textCanvas,
      drawingCanvas
    );

    return {
      textCanvas,
      drawingCanvas,
      textContext,
      drawingContext,
    };
  },

  positionCanvas(canvas: HTMLCanvasElement, dimensions: Dimension): void {
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.width = `${Math.floor(dimensions.width)} px`;
    canvas.style.height = `${Math.floor(dimensions.height)} px`;
  },

  initializeContexts(
    textCanvas: HTMLCanvasElement,
    drawingCanvas: HTMLCanvasElement
  ): {
    textContext: CanvasRenderingContext2D;
    drawingContext: WebGL2RenderingContext;
  } {
    const textContext = textCanvas.getContext('2d');

    if (textContext === null) {
      throw new GLError('Could not create text context');
    }

    const drawingContext = drawingCanvas.getContext('webgl2', {
      preserveDrawingBuffer: false,
      antialias: false,
    });

    if (drawingContext === null) {
      throw new GLError('Could not create drawing context');
    }

    drawingContext.disable(drawingContext.SCISSOR_TEST);
    drawingContext.clearColor(0, 0, 0, 0);
    drawingContext.clear(drawingContext.COLOR_BUFFER_BIT);
    drawingContext.clearDepth(1.0);
    drawingContext.enable(drawingContext.BLEND);
    drawingContext.blendFunc(
      drawingContext.SRC_ALPHA,
      drawingContext.ONE_MINUS_SRC_ALPHA
    );
    drawingContext.disable(drawingContext.DEPTH_TEST);
    drawingContext.lineWidth(2);

    drawingContext.viewport(
      0,
      0,
      drawingContext.drawingBufferWidth,
      drawingContext.drawingBufferHeight
    );

    return {textContext, drawingContext};
  },

  // getCanvasDimensions() {
  //   let scale = +window.devicePixelRatio || 1;
  //   var width  = Math.floor(this.dimensions.width  * scale) | 0;
  //   var height = Math.floor(this.dimensions.height * scale) | 0;
  // },

  // //   return {width: width, height: height}
  // // },

  // // resize() {
  // //   this.setContainerSize();
  // //   this.fit();
  // // },

  // initGl() {

  //   this.gl = this.canvas.getContext('webgl2', {
  //     preserveDrawingBuffer: false,
  //     antialias: false
  //   });

  //   this.gl.disable(this.gl.SCISSOR_TEST);
  //   this.gl.clearColor(0, 0, 0, 0);
  //   this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  //   this.gl.clearDepth(1.0);
  //   this.gl.enable(this.gl.BLEND);
  //   this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  //   this.gl.disable(this.gl.DEPTH_TEST)
  //   this.gl.lineWidth(2);

  //   this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

  //   this.textContext = this.textCanvas.getContext("2d");
  // },

  // resetGl() {

  //   let canvasDimensions = this.getCanvasDimensions();

  //   if (this.canvas.width !== canvasDimensions.width ||
  //     this.canvas.height !== canvasDimensions.height) {

  //     this.canvas.width = canvasDimensions.width;
  //     this.canvas.height = canvasDimensions.height;

  //     this.textCanvas.width = canvasDimensions.width;
  //     this.textCanvas.height = canvasDimensions.height;

  //     this.initGl();
  //   },

  // //   try {
  // //     if (!this.gl || this.gl.isContextLost()) {
  // //       this.initGl();
  // //     }
  // //   } catch (err) {} // catch chrome developer tool causing crash
  // // },

  // // setCurrentTab(tabId) {
  // //   this.currentTabToDraw = tabId;
  // // },

  // purge(context: GLContextProps): void {
  //   context.textContext.clearRect(
  //     0,
  //     0,
  //     context.textContext.canvas.width,
  //     context.textContext.canvas.height
  //   );
  //   context.drawingContext.disable(context.drawingContext.SCISSOR_TEST);
  //   context.drawingContext.clearColor(0, 0, 0, 0);
  //   context.drawingContext.clear(
  //     context.drawingContext.COLOR_BUFFER_BIT |
  //       context.drawingContext.DEPTH_BUFFER_BIT
  //   );
  // },

  // destroy(context: GLContextProps): void {
  //   this.purge(context);
  //   context.textCanvas.parentNode?.removeChild(context.textCanvas);
  //   context.drawingCanvas.parentNode?.removeChild(context.drawingCanvas);
  // },
};
