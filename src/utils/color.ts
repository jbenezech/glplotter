import hexRgb from 'hex-rgb';

const hexRegexp = new RegExp(/^#/);

export const colorToGlColor = (color: number[] | string): number[] => {
  let rgba = {
    red: 255,
    green: 255,
    blue: 255,
    alpha: 1,
  };

  //defined as rgba array
  if (Array.isArray(color) && color.length === 4) {
    rgba = {
      red: color[0],
      green: color[1],
      blue: color[2],
      alpha: color[3],
    };
  }

  const hexColor = color as string;
  if (color && hexRegexp.test(hexColor)) {
    rgba = hexRgb(hexColor);
  }

  return [rgba.red / 255, rgba.green / 255, rgba.blue / 255, rgba.alpha];
};
