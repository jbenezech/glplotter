import {shader} from '@src/gl/shader';

//eslint-disable-next-line
const vertexShader = require('./vertex.glsl');
//eslint-disable-next-line
const fragmentShader = require('./fragment.glsl');

export const measureShader = shader(fragmentShader, vertexShader);
