// index.js

const PRICE_DATA_URL = 'data/json_output/spy.json'; // Your OHLC JSON
const TWEET_COUNT = 5; // Number of tweets to display

/**
 * Convert raw JSON price data into the format required by the Lightweight Charts library:
 * [
 *   { time: 1673942400, open: 588.11, high: 588.29, low: 587.37, close: 587.79 },
 *   ...
 * ]
 */
function transformPriceData(rawData) {
  return rawData.map(item => ({
    time:  Math.floor(new Date(item.timestamp).getTime() / 1000),
    open:  item.Open,
    high:  item.High,
    low:   item.Low,
    close: item.Close
  }));
}

/**
 * Filter tweets so we only get those within the OHLC data range.
 * @param {Array} allTweets - The array of all tweet objects from `tweets.result`.
 * @param {number} minTimeSec - Earliest Unix timestamp (in seconds) of OHLC data.
 * @param {number} maxTimeSec - Latest Unix timestamp (in seconds) of OHLC data.
 * @returns {Array} - Tweets in [minTimeSec, maxTimeSec] range.
 */
function filterTweetsByTimeRange(allTweets, minTimeSec, maxTimeSec) {
  return allTweets.filter(t => {
    const tweetTimeSec = Math.floor(new Date(t.timestamp).getTime() / 1000);
    return tweetTimeSec >= minTimeSec && tweetTimeSec <= maxTimeSec;
  });
}

/**
 * Randomly selects up to `count` tweets from an array of tweets.
 * If the array is smaller than `count`, returns all tweets.
 */
function getRandomTweets(tweetsArray, count) {
  // Shuffle the tweet array
  const shuffled = tweetsArray.sort(() => 0.5 - Math.random());
  // Return up to 'count' tweets
  return shuffled.slice(0, count);
}

/**
 * Convert tweets into chart marker objects.
 * Lightweight Charts will display these markers on the candlestick series,
 * and the `text` property appears in a tooltip on hover.
 */
function transformTweetsToMarkers(tweetArr) {
  return tweetArr.map(t => ({
    time:  Math.floor(new Date(t.timestamp).getTime() / 1000),
    position: 'aboveBar',     // or 'belowBar'
    color: 'blue',            // marker color
    shape: 'circle',          // 'circle', 'square', 'arrowUp', etc.
    text: `${t.author}: ${t.content}` // shown on hover
  }));
}

// Main function to load chart data and render
async function loadChart() {
  try {
    // 1. Fetch the OHLC price data
    const response = await fetch(PRICE_DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch price data: ${response.status}`);
    }

    const rawPriceData = await response.json();
    // Transform the data
    const priceData = transformPriceData(rawPriceData);

    // (Optional) Ensure the price data is sorted by time
    priceData.sort((a, b) => a.time - b.time);

    // 2. Find min and max timestamps from the loaded price data
    const minTimeSec = priceData[0].time;
    const maxTimeSec = priceData[priceData.length - 1].time;

    // 3. Filter tweets within the time range
    const allTweets = tweets.result; // from smart_money.js (global var)
    const tweetsInRange = filterTweetsByTimeRange(allTweets, minTimeSec, maxTimeSec);

    // 4. Randomly select up to TWEET_COUNT tweets
    const selectedTweets = getRandomTweets(tweetsInRange, TWEET_COUNT);

    // 5. Transform them into chart markers
    const tweetMarkers = transformTweetsToMarkers(selectedTweets);

    // 6. Create the chart
    const chartContainer = document.getElementById('chart');
    const chart = LightweightCharts.createChart(chartContainer, {
      layout: {
        background: { type: 'Solid', color: '#FFFFFF' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' },
      },
      localization: {
        dateFormat: 'yyyy-MM-dd',
      },
    });

    // 7. Add candlestick series & set data
    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(priceData);

    // 8. Overlay tweet markers on the series
    candleSeries.setMarkers(tweetMarkers);

  } catch (err) {
    console.error('Error loading or rendering chart:', err);
  }
}

// Initialize when the page loads
window.addEventListener('DOMContentLoaded', loadChart);
