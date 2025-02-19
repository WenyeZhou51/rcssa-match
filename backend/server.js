require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

const app = express();

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // Disable credentials since we don't need them
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// CORS error handler
app.use((err, req, res, next) => {
  if (err.name === 'CORSError') {
    console.error('CORS Error:', err.message);
    res.status(403).json({ error: 'CORS error: ' + err.message });
  } else {
    next(err);
  }
});

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
      family: 4 // Use IPv4, skip trying IPv6
    });
    
    // Create indexes after successful connection
    await User.createIndexes();
    
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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'RCSSA Match API is running' });
});

// Routes
app.post('/api/users', async (req, res) => {
  try {
    console.log('Received user data:', req.body); // Log received data
    const newUser = new User(req.body);
    
    // Validate the user data
    const validationError = newUser.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationError.errors 
      });
    }
    
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

// Add error handling middleware after your routes
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error.name === 'MongoServerError' && error.code === 11000) {
    // Handle duplicate key errors
    return res.status(400).json({
      error: 'A user with this email or netId already exists.'
    });
  }
  
  if (error.name === 'ValidationError') {
    // Handle mongoose validation errors
    return res.status(400).json({
      error: 'Validation error',
      details: Object.values(error.errors).map(err => err.message)
    });
  }
  
  // Handle other errors
  res.status(500).json({
    error: 'An unexpected error occurred. Please try again.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 