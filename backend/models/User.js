const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  netId: {
    type: String,
    required: true,
    unique: true
  },
  major: {
    type: String,
    required: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  isMatched: {
    type: Boolean,
    default: false
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 