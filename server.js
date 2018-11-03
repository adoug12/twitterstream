const express = require('express');
const bodyParser = require('body-parser');
const twitter = require('twitter');
const axios = require('axios');
const config = require('./config/twitter');

const client = new twitter(config);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const params = {
  language: 'en',
  track: ''
};

let stream;

app.get('/stop', (req, res) => {
  stream.destroy();
  console.log('Stopped');
  res.sendStatus(200);
});

app.post('/start', (req, res) => {
  if (stream) stream.destroy();
  params.track = req.body.words;
  stream = client.stream('statuses/filter', params);
  console.log('Started streaming:', params.track);
  stream.on('data', tweet => {
    tweet.queryId = req.body.queryId;
    axios
      .post('http://20.40.124.179/tweet', tweet)
      .then(res => console.log(res.status))
      .catch(err => console.log('Failed to post tweet.'));
  });

  stream.on('error', err => console.log(err));

  res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running on port 3000'));
