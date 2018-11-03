const express = require('express');
const twitter = require('twitter');
const config = require('./config/twitter');
const cp = require('child_process');
const client = new twitter(config);

const app = express();
let count = 0;

const params = {
  language: 'en',
  track: 'javascript,node,express,python'
};

let stream = client.stream('statuses/filter', params);

stream.on('data', tweet => {
  const child = cp.fork('./process');
  count++;
  child.send(tweet);
  child.on('exit', () => {
    count--;
    console.log(count);
  });
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
