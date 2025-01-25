const PRICE_DATA_URL = '../data/price_json/spy.json';
const TWEET_COUNT = 3;
const INITIAL_IMPACT_THRESHOLD = 0.5;

let candleSeries; // Declare this at the top to maintain reference across functions

async function loadChart() {
  try {
    const response = await fetch(PRICE_DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch price data: ${response.status}`);
    }
    const rawPriceData = await response.json();
    const priceData = transformPriceData(rawPriceData).sort((a, b) => a.time - b.time);

    const minTimeSec = priceData[0].time;
    const maxTimeSec = priceData[priceData.length - 1].time;

    let filteredTweets = filterTweetsByTimeRange(tweets.result, minTimeSec, maxTimeSec);
    filteredTweets = filterTweetsByRelevanceAndImpact(filteredTweets, 0.8, INITIAL_IMPACT_THRESHOLD);

    const selectedTweets = getOneRandomTweetPerDay(filteredTweets, TWEET_COUNT);
    const tweetMarkers = transformTweetsToMarkers(selectedTweets);

    const chartContainer = document.getElementById('chart');
    const chart = LightweightCharts.createChart(chartContainer, {
      width: 800,
      height: 600,
      layout: { background: { type: 'Solid', color: '#ffffff' }, textColor: '#333' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      localization: { dateFormat: 'yyyy-MM-dd' },
    });

    // Initialize the candlestick series and keep a reference
    candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(priceData);
    candleSeries.setMarkers(tweetMarkers);

    setupImpactSlider(minTimeSec, maxTimeSec);
  } catch (err) {
    console.error('Error loading or rendering chart:', err);
  }
}

function setupImpactSlider(minTimeSec, maxTimeSec) {
  const slider = document.getElementById('impact-slider');
  const impactValueDisplay = document.getElementById('impact-value');

  slider.addEventListener('input', () => {
    const impactThreshold = parseFloat(slider.value);
    impactValueDisplay.textContent = impactThreshold;

    const filteredTweets = filterTweetsByTimeRange(tweets.result, minTimeSec, maxTimeSec);
    const relevantTweets = filterTweetsByRelevanceAndImpact(filteredTweets, 0.8, impactThreshold);

    const selectedTweets = getOneRandomTweetPerDay(relevantTweets, TWEET_COUNT);
    const tweetMarkers = transformTweetsToMarkers(selectedTweets);

    // Use the existing `candleSeries` reference to update markers
    candleSeries.setMarkers(tweetMarkers);
  });
}

window.addEventListener('DOMContentLoaded', loadChart);
