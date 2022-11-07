import {Point} from 'glplotter';

export const pointsToLineVertices = (points: Point[]): number[] => {
  const vertices: number[] = [];
  points.forEach((point) => {
    if (isNaN(point.x) || isNaN(point.y)) {
      throw 'invalid coordonates';
    }
    vertices.push(...[point.x, point.y, 0]);
  });

  return vertices;
};
