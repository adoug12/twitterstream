const express = require('express');
const cp = require('child_process');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/', (req, res) => {
  axios
    .post('http://13.75.209.231:3000/start', req.body)
    .then(data => {
      res.sendStatus(200);
    })
    .catch(err => console.log(err));
});

let count = 0;

app.post('/tweet', (req, res) => {
  const tweet = req.body;
  if (count < 15) {
    const child = cp.fork('./process');
    count++;
    child.send(tweet);
    child.on('exit', () => {
      count--;
      console.log(count);
    });
    res.sendStatus(200);
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
