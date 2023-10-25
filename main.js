import "./style.css";
import {
  lightningChart,
  AxisScrollStrategies,
  AutoCursorModes,
  emptyLine,
  AxisTickStrategies,
} from "@arction/lcjs";

let isPlaying = false;
let playInterval;

let sliderValueGlobal = 1;

const response = await fetch("/message.json");
const message = await response.json();
console.log(message);

const buffer = message[0].samples;
// split the buffer into chunks of size 2200
const chunkSize = 2200;
const chunkedBuffer = [];
for (let i = 0; i < buffer.length; i += chunkSize) {
  chunkedBuffer.push(buffer.slice(i, i + chunkSize));
}


const slider = document.getElementById("slider");
const sliderValueDisplay = document.getElementById("sliderValue");
sliderValueDisplay.textContent = sliderValueGlobal;

const CONFIG = {
  timeDomain: 5_000,
  channels: 1,
  sampleRate: 44_000,
  maxSeriesCount: 20,
  dataFetchDelay: 20,
};

const initializeCharts = () => {
  const chartIds = ["chart1", "chart2", "chart3", "chart4", "chart5"];
  const charts = {};

  chartIds.forEach((id, i) => {
    const chart = lightningChart().ChartXY({
      container: document.getElementById(id),
      interactable: false,
    });

    chart.setTitle(``).setPadding(3);
    chart
      .getDefaultAxisX()
      .setScrollStrategy(undefined)
      //.setAutoCursorMode(AutoCursorModes.disabled)
      .setVisible(true);

    chart
      .getDefaultAxisY()
      .setScrollStrategy(AxisScrollStrategies.expansion)
      .setVisible(true);
    chart.forEachAxis((axis) =>
      axis.setTickStrategy(AxisTickStrategies.Empty).setStrokeStyle(emptyLine)
    );

    const axisX = chart
      .getDefaultAxisX()
      .setScrollStrategy(undefined)
      .setInterval({ start: 0, end: CONFIG.timeDomain })
      .setVisible(false);
    const axisY = chart
      .getDefaultAxisY()
      .setScrollStrategy(AxisScrollStrategies.expansion)
      .setVisible(false);

    // Series for displaying "old" data.
    const seriesRight = chart.addLineSeries({
      dataPattern: { pattern: "ProgressiveX" },
      automaticColorIndex: 0,
    });

    // Rectangle for hiding "old" data under incoming "new" data.
    const seriesOverlayRight = chart.addRectangleSeries();
    const figureOverlayRight = seriesOverlayRight
      .add({ x1: 0, y1: 0, x2: 0, y2: 0 })
      .setStrokeStyle(emptyLine);

    // Series for displaying new data.
    const seriesLeft = chart.addLineSeries({
      dataPattern: { pattern: "ProgressiveX" },
      automaticColorIndex: 0,
    });
    seriesLeft.setStrokeStyle((stroke) => stroke.setThickness(-1));
    seriesRight.setStrokeStyle((stroke) => stroke.setThickness(-1));
    let newDataCache = [];
    charts[id] = {
      chart,
      axisX,
      axisY,
      seriesRight,
      seriesOverlayRight,
      figureOverlayRight,
      seriesLeft,
      prevPosX: 0,
      newDataCache,
    };
  });

  return charts;
};

const charts = initializeCharts();
const lineSeriesArray = Object.values(charts).map((chart) =>
  chart.chart.addLineSeries()
);

const updateChartData = () => {
  const displayedBuffer = buffer
    .slice(0, sliderValueGlobal)
    .map((value, index) => ({ x: index, y: value }));
  lineSeriesArray.forEach((series) => {
    series.clear();
    series.add(displayedBuffer);
  });
};

slider.addEventListener("input", (event) => {
  const value = event.target.value;
  sliderValueDisplay.textContent = value;

  sliderValueGlobal = parseInt(value, 10);
  updateChartData();
});

const playData = () => {
  if (sliderValueGlobal < buffer.length) {
    sliderValueGlobal += 2_000;
    slider.value = sliderValueGlobal;
    sliderValueDisplay.textContent = sliderValueGlobal;
    updateChartData();
  } else {
    stopData();
  }
};

const stopData = () => {
  clearInterval(playInterval);
  playStopButton.textContent = "Play";
  isPlaying = false;
};

playStopButton.addEventListener("click", () => {
  if (isPlaying) {
    stopData();
  } else {
    if (sliderValueGlobal >= buffer.length) {
      // Check if at the end
      sliderValueGlobal = 1; // Reset to the beginning
    }
    isPlaying = true;
    playStopButton.textContent = "Stop";
    playInterval = setInterval(playData, 20);
  }
});
// Initialize chart1 data with default slider value
updateChartData();
