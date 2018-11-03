const express = require('express');
const twitter = require('twitter');
const axios = require('axios');
const config = require('./config/twitter');
const client = new twitter(config);
const bodyParser = require('body-parser');

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
    axios
      .post('http://13.75.193.101:3000/tweet', tweet)
      .then(res => console.log(res.status))
      .catch(err => console.log('Failed to post tweet.'));
  });

  stream.on('error', err => console.log(err));

  res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running on port 3000'));
