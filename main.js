import "./style.css";
import { lightningChart, AxisScrollStrategies } from "@arction/lcjs";

let sliderValueGlobal = 5;
const buffer = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const slider = document.getElementById("slider");
const sliderValueDisplay = document.getElementById("sliderValue");

const CONFIG = {
  timeDomain: 96,
  channels: 1,
  sampleRate: 44_000,
  maxSeriesCount: 20,
  dataFetchDelay: 20,
};

const initializeChart = () => {
  const chart = lightningChart().ChartXY({
    container: document.getElementById("chart"),
  });

  chart.setTitle(``);
  chart
    .getDefaultAxisX()
    .setScrollStrategy(AxisScrollStrategies.expansion)
    .setInterval({ start: 0, end: CONFIG.timeDomain })
    .setVisible(true);

  chart
    .getDefaultAxisY()
    .setScrollStrategy(AxisScrollStrategies.expansion)
    .setVisible(true);

  return chart;
};

const chart = initializeChart();
const lineSeries = chart.addLineSeries();

const updateChartData = () => {
  const displayedBuffer = buffer
    .slice(0, sliderValueGlobal)
    .map((value, index) => ({ x: index, y: value }));
  lineSeries.clear();
  lineSeries.add(displayedBuffer);
};

slider.addEventListener("input", (event) => {
  const value = event.target.value;
  sliderValueDisplay.textContent = value;

  sliderValueGlobal = parseInt(value, 10);
  updateChartData();
});

// Initialize chart data with default slider value
updateChartData();
