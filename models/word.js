const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordSchema = new Schema({
  incorrectWord: {
    type: String,
    required: true
  },
  correctWord: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  }
});

module.exports = Word = mongoose.model('words', WordSchema);
