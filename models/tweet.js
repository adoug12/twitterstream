const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  sentiment: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = Tweet = mongoose.model('tweets', TweetSchema);
