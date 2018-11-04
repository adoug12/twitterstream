const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cp = require('child_process');
const mongoose = require('mongoose');
const db = require('./config/mlab').mongoURI;
const Query = require('./models/query');
const Tweet = require('./models/tweet');

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

app.get('/', (req, res) => {
  Query.find()
    .sort('-createdAt')
    .then(queries => {
      Tweet.find()
        .sort('sentiment')
        .then(tweets => {
          res.render('index', {
            latestQuery: queries[0],
            unhappyTweet: tweets[0]
          });
        })
        .catch(err => res.render('index'));
    })
    .catch(err => res.render('index'));
});

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
      .post('http://104.210.65.232:3000/start', req.body)
      .then(data => {
        res.json(query._id);
      })
      .catch(err => {
        res.sendStatus(404);
        console.log(err);
      });
  });
});

app.post('/tweet', (req, res) => {
  processTweets(req.body);
  res.sendStatus(200);
});

const processTweets = tweets => {
  tweets.map(tweet => {
    if (count <= 15) {
      let child = cp.fork('./process');
      count++;
      child.send(tweet);
      child.on('exit', () => {
        count--;
      });
    }
  });
};

app.get('/stop', (req, res) => {
  axios
    .get('http://104.210.65.232:3000/stop')
    .then(data => {
      res.sendStatus(200);
    })
    .catch(err => {
      res.sendStatus(404);
    });
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

app.listen(3000, () => console.log('Server running on port 3000'));
