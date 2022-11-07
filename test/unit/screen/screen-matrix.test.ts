import {
  calculateXScale,
  calculateXTranslation,
} from '@src/screen/screen-matrix';
import {expect} from 'chai';
import {describe} from 'mocha';

describe('Screen matrixes', () => {
  it('Calculates x translation correctly', () => {
    //translation is the amount in clipspace units
    //of the given pixel value

    const translation = calculateXTranslation({
      containerWidth: 1200,
      xTranslation: 600,
    });
    const expected = 1;

    expect(translation.toFixed(9)).to.equal(expected.toFixed(9));
  });

  it('Calculates x scale correctly', () => {
    //we want 50 mm to represent 1 second
    //sampling rate is 1000 points/second
    //so we want 50mm to represent 1000 points

    //screen width value is 1200px
    //= 317.499999996 mm
    //we want that to represent
    //(317.499999996/50) * 1000 = 6349.99999992 points
    //A scale of 1 clipspace unit will show 1 point in that space
    //So we need to scale down by that amount

    //we expect 9 floating points precision

    const scale = calculateXScale({
      pxToMm: 1 / 3.7795275591,
      containerWidth: 1200,
      displayRate: 50,
    });
    const expected = 1.574803149626139252279e-4;

    expect(scale.toFixed(9)).to.equal(expected.toFixed(9));
  });
});
