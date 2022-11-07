import {ReadonlyMat4} from 'gl-matrix';
import {GLError} from '@src/structures/GLError';

export interface Shader {
  use: (
    gl: WebGL2RenderingContext,
    translationMatrix: ReadonlyMat4,
    scaleMatrix: ReadonlyMat4,
    mvMatrix: ReadonlyMat4,
    pMatrix: ReadonlyMat4,
    color: number[]
  ) => void;
  delete: (gl: WebGL2RenderingContext) => void;
}

interface ShaderProps {
  program: WebGLProgram;
  vertexPositionAttribute: number;
  scaleMatrixPosition: WebGLUniformLocation;
  translationMatrixPosition: WebGLUniformLocation;
  projectionMatrixPosition: WebGLUniformLocation;
  modelMatrixPosition: WebGLUniformLocation;
  uFragColor: WebGLUniformLocation;
  shaders: WebGLShader[];
}

export const shader = (
  fragmentShader: string,
  vertexShader: string
): Shader => {
  let shaderProps: ShaderProps | null = null;

  return {
    use: (
      gl: WebGL2RenderingContext,
      translationMatrix: ReadonlyMat4,
      scaleMatrix: ReadonlyMat4,
      mvMatrix: ReadonlyMat4,
      pMatrix: ReadonlyMat4,
      color: number[]
    ): void => {
      if (shaderProps === null) {
        shaderProps = initGl(gl, fragmentShader, vertexShader);
      }

      gl.useProgram(shaderProps.program);

      gl.enableVertexAttribArray(shaderProps.vertexPositionAttribute);

      gl.vertexAttribPointer(
        shaderProps.vertexPositionAttribute,
        3,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.uniformMatrix4fv(shaderProps.scaleMatrixPosition, false, scaleMatrix);
      gl.uniformMatrix4fv(
        shaderProps.translationMatrixPosition,
        false,
        translationMatrix
      );
      gl.uniformMatrix4fv(shaderProps.projectionMatrixPosition, false, pMatrix);
      gl.uniformMatrix4fv(shaderProps.modelMatrixPosition, false, mvMatrix);

      gl.uniform4fv(shaderProps.uFragColor, color);
    },

    delete: (gl: WebGL2RenderingContext): void => {
      if (shaderProps === null) {
        return;
      }
      const {shaders} = shaderProps;
      shaders.forEach(
        (shader) => gl.isShader(shader) && gl.deleteShader(shader)
      );
      shaderProps = null;
    },
  };
};

const createShader = (
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader => {
  const shader = gl.createShader(type);

  if (shader === null) {
    throw new GLError('Failed to create gl shader');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }

  return shader;
};

const initGl = (
  gl: WebGL2RenderingContext,
  fragmentShader: string,
  vertexShader: string
): ShaderProps => {
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

  const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShader);

  const program = gl.createProgram();

  if (program === null) {
    throw new GLError('Failed to create gl program');
  }

  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getShaderInfoLog(program));
  }

  const vertexPositionAttribute = gl.getAttribLocation(program, 'a_position');

  const scaleMatrixPosition = gl.getUniformLocation(program, 'u_scaleMatrix');
  const translationMatrixPosition = gl.getUniformLocation(
    program,
    'u_translationMatrix'
  );
  const projectionMatrixPosition = gl.getUniformLocation(
    program,
    'u_projectionMatrix'
  );
  const modelMatrixPosition = gl.getUniformLocation(program, 'u_modelMatrix');
  const uFragColor = gl.getUniformLocation(program, 'u_fragColor');

  if (
    scaleMatrixPosition === null ||
    translationMatrixPosition === null ||
    projectionMatrixPosition === null ||
    modelMatrixPosition === null ||
    uFragColor === null
  ) {
    throw new GLError('Failed to assign gl locations');
  }

  return {
    program,
    vertexPositionAttribute,
    scaleMatrixPosition,
    translationMatrixPosition,
    projectionMatrixPosition,
    modelMatrixPosition,
    uFragColor,
    shaders: [fShader, vShader],
  };
};
