const analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;
const Tweet = require('./models/tweet');

const analyze = new analyzer('English', stemmer, 'afinn');

process.on('message', tweet => {
  let text;
  if (tweet.text || tweet.extended_tweet || tweet.retweeted_status) {
    if (tweet.extended_tweet) {
      text = tweet.extended_tweet.full_text;
    } else {
      if (tweet.retweeted_status) {
        text = tweet.retweeted_status.text;
      } else {
        text = tweet.text;
      }
    }
    console.log('got here', text);
    let sentiment = analyze.getSentiment(text.trim().split(' '));
    const newTweet = new Tweet({
      text,
      sentiment
    });

    newTweet.save();
    process.exit();
  } else {
    process.exit();
  }
});
