// index.js

const PRICE_DATA_URL = 'data/json_output/spy.json'; // Your OHLC JSON
const TWEET_COUNT = 3; // Maximum number of tweets to display

/**
 * Transform raw CSV->JSON price data into { time, open, high, low, close } in seconds.
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
 * Return only tweets whose timestamps fall within [minTimeSec, maxTimeSec].
 */
function filterTweetsByTimeRange(allTweets, minTimeSec, maxTimeSec) {
  return allTweets.filter(t => {
    const tweetTimeSec = Math.floor(new Date(t.timestamp).getTime() / 1000);
    return tweetTimeSec >= minTimeSec && tweetTimeSec <= maxTimeSec;
  });
}

/**
 * Group tweets by YYYY-MM-DD, then randomly pick ONE tweet from each day.
 * Finally, shuffle all picks and return up to `maxCount`.
 */
function getOneRandomTweetPerDay(tweetsArray, maxCount) {
  // Group tweets by day
  const groupedByDay = {};
  for (const t of tweetsArray) {
    const dayKey = new Date(t.timestamp).toISOString().split('T')[0]; // e.g. "2025-01-15"
    if (!groupedByDay[dayKey]) {
      groupedByDay[dayKey] = [];
    }
    groupedByDay[dayKey].push(t);
  }
  // Pick one at random from each day
  const dailyPicks = [];
  for (const day in groupedByDay) {
    const tweetsThisDay = groupedByDay[day];
    const randomIndex = Math.floor(Math.random() * tweetsThisDay.length);
    dailyPicks.push(tweetsThisDay[randomIndex]);
  }
  // Shuffle the final picks
  dailyPicks.sort(() => 0.5 - Math.random());
  // Return up to `maxCount`
  return dailyPicks.slice(0, maxCount);
}

/**
 * Convert tweets into Lightweight Charts marker objects.
 * - We truncate tweet text to 150 chars
 * - We show "@Author\nTruncatedText" in the marker tooltip.
 * - The built-in tooltip doesn’t fully support styling or multiline HTML,
 *   but '\n' can sometimes hint a line break.
 */
function transformTweetsToMarkers(tweetArr) {
  return tweetArr.map(t => {
    // Truncate to 150 chars
    const truncatedText = t.content.length > 150
      ? t.content.slice(0, 45) + '…'
      : t.content;

    // Attempt a multi-line format using '\n'
    // Note: The built-in marker tooltip may or may not show new lines well.
    const markerText = `@${t.author}\n${truncatedText}`;

    return {
      time:  Math.floor(new Date(t.timestamp).getTime() / 1000),
      position: 'aboveBar',
      color: 'blue',
      shape: 'circle',
      text: markerText
    };
  });
}

async function loadChart() {
  try {
    // 1. Fetch and transform OHLC price data
    const response = await fetch(PRICE_DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch price data: ${response.status}`);
    }
    const rawPriceData = await response.json();
    const priceData = transformPriceData(rawPriceData).sort((a, b) => a.time - b.time);

    // Determine the chart’s earliest and latest timestamps
    const minTimeSec = priceData[0].time;
    const maxTimeSec = priceData[priceData.length - 1].time;

    // 2. Filter tweets in range
    const allTweets = tweets.result; // from smart_money.js (global var)
    const tweetsInRange = filterTweetsByTimeRange(allTweets, minTimeSec, maxTimeSec);

    // 3. Pick at most one tweet per day, up to TWEET_COUNT total
    const selectedTweets = getOneRandomTweetPerDay(tweetsInRange, TWEET_COUNT);

    // 4. Convert them to markers
    const tweetMarkers = transformTweetsToMarkers(selectedTweets);

    // 5. Create chart
    const chartContainer = document.getElementById('chart');
    const chart = LightweightCharts.createChart(chartContainer, {
      width:  800,
      height: 600,
      layout: {
        background: { type: 'Solid', color: '#ffffff' },
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

    // 6. Add candlestick series & set the OHLC data
    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(priceData);

    // 7. Set markers for tweets
    candleSeries.setMarkers(tweetMarkers);

  } catch (err) {
    console.error('Error loading or rendering chart:', err);
  }
}

// Initialize chart on DOM load
window.addEventListener('DOMContentLoaded', loadChart);
