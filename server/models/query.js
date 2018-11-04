const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuerySchema = new Schema({
  hashtags: {
    type: String,
    required: true
  },
  sentiments: {
    type: [Number],
    required: true,
    default: []
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = Query = mongoose.model('queries', QuerySchema);
