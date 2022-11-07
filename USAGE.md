# Usage

1. Create the plotter object

```
const plotter = glplotter({
    referenceContainer: document.body,
    displayRate: 50,
});
```

Options:

- `referenceContainer`
  The HTML element that will contain the signals being drawn. _glplotter_ will append canvas elements to it
- `displayRate`
  The default display rate to start with. It is measured in millimeters per seconds.  
  For a container of 200mm and a display rate of 50mm/s, 4 seconds of data will be displayed on each visible screen.
- `stateObserver`
  An optional callback that will be called when some information are updated.
  The following information will be passed to it:
  - `pointsPerWindow`: the number of points from the data frame that are drawn on each window
  - `gpuOverflow`: a boolean stating if the gpu buffer has overflown. When this happens, signals will not be drawn anymore.

2. Send data to it

```
plotter.bufferData({
    channelId: 'ch1',
    points: dataFrame,
});
```

A channel is a unique source of data that can be drawn several times.  
Data points from that channel come in packets and should be sent to _glplotter_ for buffering.

3. Adding, removing and replacing signals to display that data

```
plotter.addSignal({
    id: 'sig1',
    channelId: 'ch1',
    color: '#fff',
    visible: true,
    amplitude: 8,
    pitch: 1,
    chartHeight: 70,
    yPosition: 95,
});
```

```
plotter.removeSignal('sig1');
```

```
plotter.replaceSignals([{
    id: 'sig1',
    channelId: 'ch1',
    color: '#fff',
    visible: true,
    amplitude: 8,
    pitch: 1,
    chartHeight: 70,
    yPosition: 95,
}]);
```

A signal is a representation of a channel on the canvas.  
You can create several signals for the same channel.

- `amplitude`
  The expected amplitude of the incoming data.  
  For a channel emitting data between -4 and +4 for example, the amplitude of 8 is expected.

- `chartHeight`
  The height in pixels of the signal. The signal will be constraint to that height for its expected amplitude.
  For a channel emitting data between -4 and +4 for example,
  the distance in pixel between the highest and the lowest point fo the signal of _chartHeight_ 70, will be 70px.

4. Manipulate the signal

- zoom signals

```
plotter.zoom(['sig1'], 2);
```

Zooming increased or decreases the height of the signal, stretching over its normal height.

- change the display rate of all signals

```
zoom.displayRate(100);
```

Display rate is common to all signals. Changing this value will display more or less data on the visible window.

- reposition

```
plotter.positionSignal('sig1', 200);
```

Reposition vertically the signal, passing a position in pixel _relative_ to the reference container.

- switch drawing mode

```
plotter.switchMode('MANUAL');
```

- `ROTATING`
  Signal will rotate on the visible screen, displaying newer data on the left and older data on the right.

- `MANUAL`
  Signal will not be visible outside the reference container. It can then be moved manually.

The default drawing mode is `'ROTATING`.

- move in time

```
plotter.move(300);
```

Moves the signal to the right or left of the screen (going back in time when going on the left, further in time when going on the right).  
Value is in pixel _relative_ to the reference container.

5. Retrieve position information

```
const timestampAtPixel = plotter.timestamp(300);
```

Retrieves the time in milliseconds corresonding to the pixel position on the screen.  
The value is in pixel, _relative_ to the reference container.

```
const timeDistanceFromPixel = plotter.pixelToTimestamp(100);
```

Retrieves the time in milliseconds for a given distance in pixels.

6. Destroying the plotter

```
plotter.destroy();
```

This will destroy all elements, ram and gpu buffers and remove the canvas. The _plotter_ cannot be reused after this operation.

# Examples

Basic: https://demos.khlix.com/glplotter/basic.html  
Display rate: https://demos.khlix.com/glplotter/display-rate.html  
Zoom: https://demos.khlix.com/glplotter/zoom.html  
Reposition: https://demos.khlix.com/glplotter/position.html  
Drawing mode and move: https://demos.khlix.com/glplotter/drawing-mode.html

## Using with React

Check this demo project: https://github.com/jbenezech/glplotter-app  
And its online demo: https://demos.khlix.com/glplotter/react
