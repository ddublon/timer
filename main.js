import "./style.css";
import { lightningChart, AxisScrollStrategies } from "@arction/lcjs";

let isPlaying = false;
let playInterval;

let sliderValueGlobal = 1;

const response = await fetch("/message.json");
const message = await response.json();
console.log(message);

const buffer = message[0].samples;
const slider = document.getElementById("slider");
const sliderValueDisplay = document.getElementById("sliderValue");
sliderValueDisplay.textContent = sliderValueGlobal;

const CONFIG = {
  timeDomain: 96,
  channels: 1,
  sampleRate: 44_000,
  maxSeriesCount: 20,
  dataFetchDelay: 20,
};

const initializeCharts = () => {
  const chartIds = ["chart1", "chart2"];
  const charts = {};

  chartIds.forEach((id) => {
    const chart = lightningChart().ChartXY({
      container: document.getElementById(id),
    });

    chart.setTitle(``);
    chart
      .getDefaultAxisX()
      .setScrollStrategy(AxisScrollStrategies.expansion)
      .setInterval({ start: 0, end: CONFIG.sampleRate * 5 })
      .setVisible(true);

    chart
      .getDefaultAxisY()
      .setScrollStrategy(AxisScrollStrategies.expansion)
      .setVisible(true);

    charts[id] = chart;
  });

  return charts;
};

const charts = initializeCharts();
const lineSeriesArray = Object.values(charts).map((chart) =>
  chart.addLineSeries()
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
    sliderValueGlobal++;
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
