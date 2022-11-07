import {
  calculateYScale,
  calculateYTranslation,
} from '@src/signal/signal-matrix';
import {expect} from 'chai';
import {describe} from 'mocha';

describe('Signal matrixes', () => {
  it('Calculates y translation correctly', () => {
    //domain is 2 clipspace units
    //container height is 2 clipspace units
    //400px is 2 clipspace units
    //1px is 0.005 clipspace units
    //clipspace position starts at the bottom
    //but input is pixels from the top
    //reverse input is 400 - 70 = 330
    //330px is 1.65 clipspace units
    //we expect 9 floating points precision

    const signal = {
      yPosition: 70,
    };
    const screenState = {
      containerHeight: 400,
    };

    const translation = calculateYTranslation(signal, screenState);
    const expected = 1.65;

    expect(translation.toFixed(9)).to.equal(expected.toFixed(9));
  });

  it('Calculates y scale correctly', () => {
    //signal has an amplitude of 8 (-4 / +4)
    //domain size is 0-1
    //to fit signal in clipspace, we need to
    //scale it down by 8
    //we want it to fit in chartheight, not in container height
    //so we need to further scale it down by 70/400 = 0.175
    //if we zoom by 2, we need to apply the multiplier
    //we expect 9 floating points precision

    const signal = {
      amplitude: 8,
      zoomRatio: 2,
      chartHeight: 70,
    };
    const screenState = {
      containerHeight: 400,
    };

    const scale = calculateYScale(signal, screenState);
    const expected = 0.04375;

    expect(scale.toFixed(9)).to.equal(expected.toFixed(9));
  });
});
