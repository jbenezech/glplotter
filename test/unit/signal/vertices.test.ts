import {pointsToLineVertices} from '@src/signal/vertices';
import {expect} from 'chai';
import {describe} from 'mocha';

describe('Signal vertices', () => {
  it('Produces correct vertices', () => {
    const dataFrame = [
      {x: 0, y: 1},
      {x: 1, y: 2},
    ];

    const vertices = pointsToLineVertices(dataFrame);
    const expected = [0, 1, 0, 1, 2, 0];

    expect(vertices).to.deep.equal(expected);
  });
});
