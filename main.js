import { handleIncomingData } from "./handleIncomingData";
import { initializeCharts } from "./initCharts";
import "./style.css";
import {
  lightningChart,
  AxisScrollStrategies,
  emptyLine,
  AxisTickStrategies,
  emptyTick,
} from "@arction/lcjs";

// --- Global Variables ---
let isPlaying = false;
let playInterval;
let sliderValueGlobal = 1;
const CONFIG = {
  timeDomain: 5,
  channels: 1,
  sampleRate: 44_000,
};
let backwardsIndex = 0;

const slider = document.getElementById("slider");
const sliderValueDisplay = document.getElementById("sliderValue");
sliderValueDisplay.textContent = sliderValueGlobal;

// --- Fetch Data ---
const fetchData = async () => {
  const response = await fetch("/message.json");
  const message = await response.json();
  return message[0].samples;
};

// --- Process Data ---
const processData = (samples) => {
  const BitResolution = 1.9073;
  const updatedYData = samples.map((item) => item * BitResolution);
  const buffer = updatedYData.map((value, index) => ({ x: index, y: value }));

  for (let i = 0; i < buffer.length; i++) {
    const element = buffer[i];
    element.x = i / CONFIG.sampleRate;
  }

  const chunkSize = 2_200;
  const chunkedBuffer = [];
  for (let i = 0; i < buffer.length; i += chunkSize) {
    chunkedBuffer.push(buffer.slice(i, i + chunkSize));
  }
  return chunkedBuffer;
};

// --- Update Chart Data ---
const updateChartData = (charts, backwards = false) => {
  if (!backwards) {
    handleIncomingData(chunkedBuffer[sliderValueGlobal], charts, CONFIG);
    return;
  }
  // need to run handleIncomingData from backwardsIndex to sliderValueGlobal
  const backwardsData = [];
  for (let i = backwardsIndex; i < sliderValueGlobal; i++) {
    backwardsData.push(chunkedBuffer[i]);
  }

  for (let i = 0; i < backwardsData.length; i++) {
    handleIncomingData(backwardsData[i], charts, CONFIG);
  }

  return;
};

slider.addEventListener("input", (event) => {
  const value = event.target.value;
  if (value > sliderValueGlobal) {
    sliderValueDisplay.textContent = value;
    sliderValueGlobal = parseInt(value, 10);
    updateChartData(Charts);
  } else {
    // slider draged backwards
    sliderValueDisplay.textContent = value;
    sliderValueGlobal = parseInt(value, 10);
    const backwards = true;
    // calcukate the hundreds of sliderValueGlobal
    const hundreds = Math.floor(sliderValueGlobal / 100);
    backwardsIndex = hundreds * 100;
    updateChartData(Charts, backwards);
  }
});

const playData = () => {
  if (sliderValueGlobal < chunkedBuffer.length - 1) {
    sliderValueGlobal += 1;
    slider.value = sliderValueGlobal;
    sliderValueDisplay.textContent = sliderValueGlobal;
    updateChartData(Charts);
  } else {
    stopData();
  }
};

const stopData = () => {
  clearInterval(playInterval);
  playStopButton.textContent = "Play";
  isPlaying = false;
};

// --- Event Listeners ---

playStopButton.addEventListener("click", () => {
  if (isPlaying) {
    stopData();
  } else {
    if (sliderValueGlobal >= chunkedBuffer.length - 1) {
      // Check if at the end
      sliderValueGlobal = 1; // Reset to the beginning
    }
    isPlaying = true;
    playStopButton.textContent = "Stop";
    playInterval = setInterval(playData, 20);
  }
});

// --- Main Execution ---
const chunkedBuffer = processData(await fetchData());
slider.max = chunkedBuffer.length - 1;
const Charts = initializeCharts(
  lightningChart,
  AxisScrollStrategies,
  emptyLine,
  AxisTickStrategies,
  CONFIG
);
updateChartData(Charts);
