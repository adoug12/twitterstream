const express = require('express');
const twitter = require('twitter');
const config = require('./config/twitter');
const mongoose = require('mongoose');
const db = require('./config/mlab').mongoURI;
const analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;
const Tweet = require('./models/tweet');

const client = new twitter(config);
const analyze = new analyzer('English', stemmer, 'afinn');

const app = express();

mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('Connected to mLab'))
  .catch(err => console.log(err));

const params = {
  language: 'en',
  track: 'trump'
};

let stream = client.stream('statuses/filter', params);

stream.on('data', tweet => {
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
    let sentiment = analyze.getSentiment(text.trim().split(' '));
    const newTweet = new Tweet({
      text,
      sentiment
    });

    newTweet.save();
  }
});

stream.on('error', err => {
  console.log(err);
});

app.get('/stop', (req, res) => {
  stream.destroy();
  console.log('Stopped');
  res.sendStatus(200);
});

app.get('/start', (req, res) => {
  stream = client.stream('statuses/filter', params);
  console.log('Started');
  res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running on port 3000'));
