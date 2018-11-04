const express = require('express');
const cp = require('child_process');
const Query = require('./models/query');
const mongoose = require('mongoose');
const db = require('./config/mlab').mongoURI;
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('mLab Connected.'))
  .catch(err => console.log(err));

let count = 0;

app.get('/', (req, res) => res.render('index'));

app.get('/status', (req, res) => {
  Query.findById(req.query.id)
    .then(query => res.json(query))
    .catch(err => res.sendStatus(404));
});

app.post('/', (req, res) => {
  const newQuery = new Query({
    hashtags: req.body.words
  });
  newQuery.save().then(query => {
    req.body.queryId = query._id;
    axios
      .post('http://localhost:3000/start', req.body)
      .then(data => {
        res.json(query._id);
      })
      .catch(err => console.log(err));
  });
});

app.post('/tweet', (req, res) => {
  const tweets = req.body;
  tweets.map(tweet => {
    if (count < 15) {
      const child = cp.fork('./process');
      count++;
      child.send(tweet);
      child.on('exit', () => {
        count--;
        console.log(count);
      });
    }
  });
  res.sendStatus(200);
});

app.get('/healthcheck', (req, res) => {
  if (count > 10) {
    console.log('Failed health check');
    res.sendStatus(404);
  } else {
    console.log('Passed health check');
    res.sendStatus(200);
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
