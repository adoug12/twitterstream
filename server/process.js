const analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;
const Tweet = require('./models/tweet');
const Query = require('./models/query');
const mongoose = require('mongoose');
const db = require('./config/mlab').mongoURI;

const analyze = new analyzer('English', stemmer, 'afinn');

process.on('message', tweet => {
  mongoose
    .connect(
      db,
      { useNewUrlParser: true }
    )
    .then(() => {
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

        let sentiment = analyze.getSentiment(text.trim().split(' '));
        Query.findById(tweet.queryId)
          .then(query => {
            query.sentiments.push(sentiment);
            query.save().then(() => {
              const newTweet = new Tweet({
                text,
                sentiment
              });

              newTweet
                .save()
                .then(() => {
                  process.exit();
                })
                .catch(err => {
                  console.log('error saving');
                  process.exit();
                });
            });
          })
          .catch(err => {
            console.log(err);
            process.exit();
          });
      } else {
        process.exit();
      }
    })
    .catch(err => {
      process.exit();
      console.log(err);
    });
});
