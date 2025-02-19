const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  netId: {
    type: String,
    required: [true, 'Net ID is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  major: {
    type: String,
    required: [true, 'Major is required'],
    trim: true
  },
  graduationYear: {
    type: Number,
    required: [true, 'Graduation year is required'],
    min: [2024, 'Graduation year must be 2024 or later'],
    max: [2030, 'Graduation year must be 2030 or earlier'],
    set: v => parseInt(v, 10)
  },
  isMatched: {
    type: Boolean,
    default: false,
    index: true
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Create compound index for matching
userSchema.index({ major: 1, isMatched: 1 });

// Ensure indexes are created
userSchema.set('autoIndex', true);

module.exports = mongoose.model('User', userSchema); 