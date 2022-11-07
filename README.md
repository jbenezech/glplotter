**_This is work in progress_**

A modern javascript library, written in typescript, to draw and manipulate signal streams (such as ECG signals) on canvas using WebGL.

# Install

## As plain javascript

`<script src="https://unpkg.com/glplotter"></script>`

## As a module

`yarn add glplotter`

# Usage

[here](./USAGE.md)

## Expectation on the incoming data

All data frames are expected to correspond to the same real time.  
Example: if a channel has been buffered for 4 seconds and another channel starts buffering then, the data of that second channel is expected to start at 4 seconds in time.

## Caveats

- Fast forwarding signals
  Sometimes the browser will not honor the requested animation frame. This is the case in particular, in a web context, when the browser tab is not active.  
  When the next draw call is issued, all data is drawn at once to the GPU to avoid falling back too much in time.  
  This will cause the signals to fast-forward.

- GPU buffer overflow
  In order to allow moving in time smoothly, the entire buffered data is uploaded to the GPU. Because the GPU buffers have a fixed size, this will cause a buffer overflow when their limit is reached.
