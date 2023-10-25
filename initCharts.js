import {
  AutoCursorModes,
  AxisScrollStrategies,
  ColorHEX,
  SolidFill,
  Themes,
  disableThemeEffects,
  emptyLine,
} from "@arction/lcjs";

export const initializeCharts = (
  lightningChart,
  AxisScrollStrategies,
  emptyLine,
  AxisTickStrategies,
  CONFIG
) => {
  const theme = Themes.darkGold;
  const ecgBackgroundFill = new SolidFill({
    color: theme.isDark ? ColorHEX("#000000") : ColorHEX("#ffffff"),
  });
  const chartIds = ["chart1", "chart2", "chart3", "chart4", "chart5"];
  const charts = [];

  chartIds.forEach((id, i) => {
    const chart = lightningChart()
      .ChartXY({
        container: document.getElementById(id),
        interactable: false,
      })
      .setSeriesBackgroundStrokeStyle(emptyLine)
      .setSeriesBackgroundFillStyle(ecgBackgroundFill);
    chart.setTitle(``).setPadding(3);
    chart
      .getDefaultAxisX()
      .setScrollStrategy(undefined)
      // .setAutoCursorMode(AutoCursorModes.disabled)
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
      // .setVisible(false)
      // .setTickStrategy(AxisTickStrategies.Empty)
      // .setStrokeStyle(emptyLine);
    const axisY = chart
      .getDefaultAxisY()
      .setScrollStrategy(AxisScrollStrategies.expansion)
      // .setVisible(false)
      // .setTickStrategy(AxisTickStrategies.Empty)
      // .setStrokeStyle(emptyLine);

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
    chart.axisX = axisX;
    chart.axisY = axisY;
    chart.seriesRight = seriesRight;
    chart.seriesOverlayRight = seriesOverlayRight;
    chart.figureOverlayRight = figureOverlayRight;
    chart.seriesLeft = seriesLeft;
    chart.newDataCache = newDataCache;
    chart.prevPosX = 0;

    charts.push({
      chart,
      axisX,
      axisY,
      seriesRight,
      seriesOverlayRight,
      figureOverlayRight,
      seriesLeft,
      prevPosX: 0,
      newDataCache,
    });
  });

  return charts;
};
