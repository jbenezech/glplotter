import {drawer} from '@src/signal/drawers/drawer';
import {
  bindAndUploadDataToGpu,
  prepareDataUpload,
  UploadOperationResult,
} from '@src/signal/gpu-buffers';
import {consumeDataBuffers} from '@src/signal/ram-buffers';
import {
  applyPostDrawScreenTransition,
  applyPreDrawScreenTransition,
} from '@src/screen/screen-transitions';
import {DrawSignalsPayload} from '@src/store/actions/signal-actions';
import {Signal, State} from 'src/store/state';

export const drawSignals = (
  state: State,
  {containerId, gl}: DrawSignalsPayload
): State => {
  return drawAllSignalsForContainer(state, containerId, gl) || state;
};

const drawAllSignalsForContainer = (
  state: State,
  containerId: string,
  gl: WebGL2RenderingContext
): State | null => {
  const channels = gatherChannelsToDraw(state);

  const operationResults: UploadOperationResult[] = [];

  let nextState = {...state};

  //For each channel, prepare the state it will
  //be in once the data is actaully uploaded
  for (const channelId of channels) {
    const uploadResult = prepareDataUpload(state, channelId, gl);
    if (uploadResult === null) {
      continue;
    }

    //update state
    nextState = {
      ...nextState,
      gpuBuffers: [
        ...state.gpuBuffers.filter((buffer) => buffer.channelId !== channelId),
        uploadResult.gpuBufferState,
      ],
    };

    //register result
    operationResults.push(uploadResult);
  }

  //Find the maximum amount of data
  //Added and use that to update the screen state
  const {totalCoordonatesAdded, lastCoordonatesCountAddedToScreen} =
    operationResults.reduce(
      (acc, current) => {
        return current.totalCoordonatesAdded > acc.totalCoordonatesAdded
          ? current
          : acc;
      },
      {totalCoordonatesAdded: 0, lastCoordonatesCountAddedToScreen: 0}
    );

  //Apply screen transition
  const preDrawSceenState = applyPreDrawScreenTransition(
    nextState.screenState,
    {
      totalCoordonatesAdded,
      lastCoordonatesCountAddedToScreen,
    }
  );

  nextState = {
    ...nextState,
    screenState: preDrawSceenState,
  };

  channels.forEach((channelId) => {
    //for all signals of that channel
    //draw the buffer with the corresponding shader configuration
    //Do that here so that we do not have to rebing the buffer

    const uploadResultForChannel = operationResults.find(
      (result) => result.gpuBufferState.channelId === channelId
    );

    if (uploadResultForChannel === undefined) {
      return;
    }

    //Bind buffer and upload data
    nextState = {
      ...nextState,
      gpuBuffers: [
        ...state.gpuBuffers.filter((buffer) => buffer.channelId !== channelId),
        bindAndUploadDataToGpu(
          uploadResultForChannel.gpuBufferState,
          uploadResultForChannel.dataToUpload,
          gl
        ),
      ],
    };

    const channelSignals = gatherChannelSignalsToDraw(
      nextState,
      containerId,
      channelId
    );

    channelSignals.forEach((signal) => {
      drawSignal(nextState, signal, gl);
    });
  });

  //update RAM buffers to reflect data consumed
  const ramBuffers = consumeDataBuffers(
    nextState,
    operationResults.map((result) => ({
      channelId: result.gpuBufferState.channelId,
      ramDataConsumed: result.ramDataConsumed,
    }))
  );

  const screenState = applyPostDrawScreenTransition(nextState.screenState);

  return {
    ...nextState,
    ramBuffers,
    screenState,
  };
};

const gatherChannelsToDraw = (state: State): string[] => {
  //get All signals for that container
  const signals = state.signals;

  //get the list of unique channel ids for these signals
  const uniqueChannelRecords = signals.reduce((acc, current) => {
    if (!acc[current.channelId]) {
      acc[current.channelId] = current.channelId;
    }
    return acc;
  }, {} as Record<string, string>);

  return Object.keys(uniqueChannelRecords).map(
    (key) => uniqueChannelRecords[key]
  );
};

const gatherChannelSignalsToDraw = (
  state: State,
  containerId: string,
  channelId: string
): Signal[] => {
  //draw buffer if the signal is for the given container
  return state.signals
    .filter((signal) => signal.channelId === channelId)
    .filter((signal) => signal.containerId === containerId)
    .filter((signal) => !!signal.visible);
};

const drawSignal = (
  state: State,
  signal: Signal,
  gl: WebGL2RenderingContext
): void => {
  const drawerToUse = drawer(state);
  drawerToUse.draw(state, signal, gl);
};
