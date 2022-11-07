import {ScreenState, Signal} from 'src/store/state';

export const calculateYTranslation = (
  {yPosition}: Pick<Signal, 'yPosition'>,
  {containerHeight}: Pick<ScreenState, 'containerHeight'>
): number => {
  //with no translation, domain is 0 to bottom, 1 to top
  //We want the 0 of the signal to be positionned at yPosition pixels
  // Translate up 1 container
  // Translate down by yPosition
  // Transform pixels to domain space
  const pixelToDomain = 2 / containerHeight;
  const translation = pixelToDomain * (containerHeight - yPosition);
  return translation;
};

export const calculateYScale = (
  {
    amplitude,
    zoomRatio,
    chartHeight,
  }: Pick<Signal, 'amplitude' | 'zoomRatio' | 'chartHeight'>,
  {containerHeight}: Pick<ScreenState, 'containerHeight'>
): number => {
  //The container has a size of 2 in the domain
  //With no scaling, 0 will be at the bottom, 1 at the top
  //We should fit the signal, considering its amplitude
  //In chartHeight

  //First we scale down to chartHeight
  //Then we divide by amplitude
  //Finally we apply zoom ratio
  const signalHeightToContainerRatio = chartHeight / containerHeight;
  const scale = (signalHeightToContainerRatio / amplitude) * zoomRatio;
  return scale;
};
