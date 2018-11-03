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
  params.track = req.body.words;
  console.log(params.track);
  stream = client.stream('statuses/filter', params);

  stream.on('data', tweet => {
    axios.post('http://localhost:3001/tweet', tweet);
  });

  stream.on('error', err => {
    console.log(err);
  });

  res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running on port 3000'));
