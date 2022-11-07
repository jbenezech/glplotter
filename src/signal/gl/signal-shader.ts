import {shader} from '@src/gl/shader';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export const signalShader = shader(fragmentShader, vertexShader);
