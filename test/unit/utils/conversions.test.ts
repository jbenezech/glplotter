import {
  pixelSizeToClipspaceSize,
  pixelSizeToPointSize,
  pixelSizeToVerticeSize,
  pointSizeToCoordonateSize,
  pointSizeToPixelSize,
  screenSizeToPointSize,
} from '@src/utils/conversions';
import {expect} from 'chai';
import {describe} from 'mocha';

describe('Conversion', () => {
  it('Converts points to coordonates', () => {
    //each point is 3 coordonates and integer
    const point = 1203.67;
    const coordonate = pointSizeToCoordonateSize(point);
    expect(coordonate).to.equal(3609);
  });

  it('Converts point size to pixel size', () => {
    //for 6350 points
    //with sampling rate at 1000 points/seconds
    //this represents 6.35 seconds
    //At a display rate of 50 mm /s
    //That represents 317.50 mm
    //Which equals to 1200.00000001425 pixels
    //we expect 9 floating points precision
    const screenState = {
      pxToMm: 1 / 3.7795275591,
      containerWidth: 1200,
      displayRate: 50,
    };
    const pixels = pointSizeToPixelSize(screenState, 6350);
    const expected = 1200.00000001425;
    expect(pixels.toFixed(9)).to.equal(expected.toFixed(9));
  });

  it('Converts pixel size to point size', () => {
    //pixel value is 1200px
    //= 317.499999996 mm
    //display rate is 50 mm/s
    //so value represents 6.349999999924593750001 seconds
    //sampling rate is 1000 points/seconds
    //so value represents 6349.999999924593750001 points
    //we expect 9 floating points precision
    const screenState = {
      pxToMm: 1 / 3.7795275591,
      displayRate: 50,
    };
    const points = pixelSizeToPointSize(screenState, 1200);
    const expected = 6349.999999924593750001;
    expect(points.toFixed(9)).to.equal(expected.toFixed(9));
  });

  it('Converts screen size to point size', () => {
    const screenState = {
      pxToMm: 1 / 3.7795275591,
      containerWidth: 1200,
      displayRate: 50,
    };
    const points = screenSizeToPointSize(screenState);
    const expected = 6349.999999924593750001;
    expect(points.toFixed(9)).to.equal(expected.toFixed(9));
  });

  it('Converts pixel size to clipspace size', () => {
    //pixel value is 500px
    //clipspace is 2
    //screen size is 2 clipspace units and 1200px
    //So one pixel = 2/1200 clipspace units
    //= 0.001666666666666666666667
    //so the value represents 0.8333333333333333333333 clipspace units
    //we expect 9 floating points precision
    const screenState = {
      containerWidth: 1200,
    };
    const clipspace = pixelSizeToClipspaceSize(screenState, 500);
    const expected = 0.8333333333333333333333;
    expect(clipspace.toFixed(9)).to.equal(expected.toFixed(9));
  });

  it('Converts pixel size to vertice size', () => {
    //vertice is equivalent to point when we draw a line
    //but is an integer
    const screenState = {
      pxToMm: 1 / 3.7795275591,
      containerWidth: 1200,
      displayRate: 50,
    };
    const vertices = pixelSizeToVerticeSize(screenState, 1200);
    const expected = 6350;
    expect(vertices).to.equal(expected);
  });
});
