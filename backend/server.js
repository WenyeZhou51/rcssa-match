require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in newer versions of mongoose
      // but included for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

// Routes
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    
    // Try to find a match immediately
    const match = await findMatch(newUser);
    
    if (match) {
      return res.json({
        matched: true,
        user: newUser,
        match: {
          name: match.name,
          email: match.email,
          major: match.major,
          graduationYear: match.graduationYear
        }
      });
    }
    
    res.json({
      matched: false,
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:id/match', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isMatched) {
      const match = await User.findById(user.matchedWith);
      if (!match) {
        // Handle case where matched user was deleted
        user.isMatched = false;
        user.matchedWith = null;
        await user.save();
        return res.json({ matched: false });
      }
      return res.json({
        matched: true,
        match: {
          name: match.name,
          email: match.email,
          major: match.major,
          graduationYear: match.graduationYear
        }
      });
    }

    res.json({ matched: false });
  } catch (error) {
    console.error('Error checking match:', error);
    res.status(500).json({ error: error.message });
  }
});

// Matching Logic
async function findMatch(user) {
  try {
    // First try to find an unmatched user with the same major
    let match = await User.findOne({
      _id: { $ne: user._id },
      major: user.major,
      isMatched: false
    });

    // If no match found with same major, find any unmatched user
    if (!match) {
      match = await User.findOne({
        _id: { $ne: user._id },
        isMatched: false
      });
    }

    if (match) {
      // Update both users as matched
      await User.findByIdAndUpdate(user._id, {
        isMatched: true,
        matchedWith: match._id
      });
      await User.findByIdAndUpdate(match._id, {
        isMatched: true,
        matchedWith: user._id
      });
      return match;
    }

    return null;
  } catch (error) {
    console.error('Error finding match:', error);
    return null;
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 