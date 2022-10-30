import hexRgb from 'hex-rgb';

const hexRegexp = new RegExp(/^#/);

export const colorToGlColor = (color: number[] | string): number[] => {
  //already defined as webgl color array
  if (Array.isArray(color)) {
    return color;
  }

  if (!color || hexRegexp.test(color)) {
    return [255 / 255, 255 / 255, 255 / 255, 1.0];
  }

  const rgb = hexRgb(color);
  return [rgb.red / 255, rgb.green / 255, rgb.blue / 255, rgb.alpha];
};
