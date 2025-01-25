function transformPriceData(rawData) {
    return rawData.map(item => ({
      time: Math.floor(new Date(item.timestamp).getTime() / 1000),
      open: item.Open,
      high: item.High,
      low: item.Low,
      close: item.Close,
    }));
  }
  
  function filterTweetsByTimeRange(allTweets, minTimeSec, maxTimeSec) {
    return allTweets.filter(t => {
      const tweetTimeSec = Math.floor(new Date(t.timestamp).getTime() / 1000);
      return tweetTimeSec >= minTimeSec && tweetTimeSec <= maxTimeSec;
    });
  }
  
  function filterTweetsByRelevanceAndImpact(tweetsArray, relevanceThreshold, impactThreshold) {
    return tweetsArray.filter(t => t.relevance >= relevanceThreshold && t.impact >= impactThreshold);
  }
  
  function getOneRandomTweetPerDay(tweetsArray, maxCount) {
    const groupedByDay = {};
    tweetsArray.forEach(t => {
      const dayKey = new Date(t.timestamp).toISOString().split('T')[0];
      groupedByDay[dayKey] = groupedByDay[dayKey] || [];
      groupedByDay[dayKey].push(t);
    });
  
    const dailyPicks = Object.values(groupedByDay).map(tweets =>
      tweets[Math.floor(Math.random() * tweets.length)]
    );
  
    return dailyPicks.sort(() => 0.5 - Math.random()).slice(0, maxCount);
  }
  
  function transformTweetsToMarkers(tweetArr) {
    return tweetArr.map(t => ({
      time: Math.floor(new Date(t.timestamp).getTime() / 1000),
      position: 'aboveBar',
      color: 'blue',
      shape: 'circle',
      text: `@${t.author}\n${t.content.slice(0, 150)}`,
    }));
  }
  