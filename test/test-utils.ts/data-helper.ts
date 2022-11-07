import {Point} from 'glplotter';

export const generateDataFrame = (size = 100): Point[] => {
  const dataFrame = [];
  for (let index = 0; index < size; index++) {
    dataFrame.push({x: index, y: index + 1});
  }
  return dataFrame;
};
