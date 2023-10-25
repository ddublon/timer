export const handleIncomingData = (
  newDataForAllChannels,
  channels,
  CONFIG,
  index
) => {
  console.log(index);
  channels.forEach((channel) => {
    // Keep track of the latest X (time position), clamped to the sweeping axis range.
    const newDataPointsTimestamped = newDataForAllChannels;
    if (newDataPointsTimestamped.length === 0) {
      return;
    }
    const prevPosX = channel.prevPosX;

    // NOTE: Incoming data points are timestamped, meaning their X coordinates can go outside sweeping axis interval.
    // Clamp timestamps onto the sweeping axis range.
    const newDataPointsSweeping = newDataPointsTimestamped.map((dp) => ({
      x: dp.x % CONFIG.timeDomain,
      y: dp.y,
    }));
    const posX = newDataPointsSweeping[newDataPointsSweeping.length - 1].x;

    // Check if the channel completes a full sweep (or even more than 1 sweep even though it can't be displayed).
    let fullSweepsCount = 0;
    let signPrev = false;
    for (const dp of newDataPointsSweeping) {
      const sign = dp.x < prevPosX;
      if (sign === true && sign !== signPrev) {
        fullSweepsCount += 1;
      }
      signPrev = sign;
    }

    if (fullSweepsCount > 1) {
      // The below algorithm is incapable of handling data input that spans over several full sweeps worth of data.
      // To prevent visual errors, reset sweeping graph and do not process the data.
      // This scenario is triggered when switching tabs or minimizing the example for extended periods of time.
      channel.seriesRight.clear();
      channel.seriesLeft.clear();
    } else if (fullSweepsCount === 1) {
      // Sweeping cycle is completed.
      // Categorize new data points into those belonging to current sweep and the next.
      const newDataPointsCurSweep = [];
      const newDataPointsNextSweep = [];
      for (const dp of newDataPointsSweeping) {
        if (dp.x > prevPosX) {
          newDataPointsCurSweep.push(dp);
        } else {
          newDataPointsNextSweep.push(dp);
        }
      }
      // Finish current sweep.
      channel.seriesLeft.add(newDataPointsCurSweep);
      // Swap left and right series.
      const nextLeft = channel.seriesRight;
      const nextRight = channel.seriesLeft;
      channel.seriesLeft = nextLeft;
      channel.seriesRight = nextRight;
      channel.seriesRight.setDrawOrder({ seriesDrawOrderIndex: 0 });
      channel.seriesOverlayRight.setDrawOrder({
        seriesDrawOrderIndex: 1,
      });
      channel.seriesLeft.setDrawOrder({ seriesDrawOrderIndex: 2 });
      // Start sweeping from left again.
      channel.seriesLeft.clear().add(newDataPointsNextSweep);
    } else {
      // Append data to left.
      channel.seriesLeft.add(newDataPointsSweeping);
    }

    // Move overlay of old data to right locations.
    const overlayXStart = 0;
    const overlayXEnd = posX + CONFIG.timeDomain * 0.03;
    channel.figureOverlayRight.setDimensions({
      x1: overlayXStart,
      x2: overlayXEnd,
      y1: channel.axisY.getInterval().start,
      y2: channel.axisY.getInterval().end,
    });

    channel.prevPosX = posX;
  });
};
