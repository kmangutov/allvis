// index.js

// Replace "spy.json" with the symbol/file you want to display.
// You can replicate/extend this logic for multiple files.
const DATA_URL = 'data/json_output/spy.json';

/**
 * Transforms the raw JSON records into the format expected by the Lightweight Charts library:
 *   [
 *     { time: 1673942400, open: 588.11, high: 588.29, low: 587.37, close: 587.79 },
 *     ...
 *   ]
 *
 * If you have other files (e.g., ethusdt.json) that have different column names (e.g., "Open time"),
 * create a similar transform function or a single unified approach that handles both columns.
 */
function transformData(rawData) {
  return rawData.map(item => {
    // For 'spy.json', columns are:
    //   item.timestamp, item.Open, item.High, item.Low, item.Close
    // Convert timestamp into a Unix timestamp (seconds).
    const timeInSeconds = Math.floor(new Date(item.timestamp).getTime() / 1000);

    return {
      time:  timeInSeconds,
      open:  item.Open,
      high:  item.High,
      low:   item.Low,
      close: item.Close
    };
  });
}

// Main function to load data and render the chart.
async function loadChartData() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    const data = await response.json();
    const chartData = transformData(data);

    // Create the chart
    const chartContainer = document.getElementById('chart');
    const chart = LightweightCharts.createChart(chartContainer, {
      layout: {
        background: { type: 'Solid', color: '#FFFFFF' },
        textColor: '#333'
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' }
      },
      localization: {
        dateFormat: 'yyyy-MM-dd'
      }
    });

    const candlestickSeries = chart.addCandlestickSeries();
    candlestickSeries.setData(chartData);

  } catch (err) {
    console.error("Error loading or rendering chart data:", err);
  }
}

// Initialize when the page loads
window.addEventListener('DOMContentLoaded', loadChartData);
