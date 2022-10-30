import {ScreenState, Signal} from 'src/store/state';

export const calculateYTranslation = (
  signal: Signal,
  screenState: ScreenState
): number => {
  //with no translation, domain is 0 to bottom, 1 to top
  //We want the 0 of the signal to be positionned at yPosition pixels
  // Translate up 1 container
  // Translate down by yPosition
  // Transform pixels to domain space
  const pixelToDomain = 2 / screenState.containerHeight;
  const translation =
    pixelToDomain * (screenState.containerHeight - signal.yPosition);
  return translation;
};

export const calculateYScale = (
  signal: Signal,
  screenState: ScreenState
): number => {
  //The container has a size of 2 in the domain
  //With no scaling, 0 will be at the bottom, 1 at the top
  //We should fit the signal, considering its amplitude
  //In chartHeight

  //First we scale down to chartHeight
  //Then we divide by amplitude
  //Finally we apply zoom ratio
  const signalHeightToContainerRatio =
    signal.chartHeight / screenState.containerHeight;
  const scale =
    (signalHeightToContainerRatio / signal.amplitude) * signal.zoomRatio;
  return scale;
};
