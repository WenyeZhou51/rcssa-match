require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

// Logger utility
const logger = {
  debug: (...args) => console.log('\x1b[36m[DEBUG]\x1b[0m', ...args),
  info: (...args) => console.log('\x1b[32m[INFO]\x1b[0m', ...args),
  warn: (...args) => console.log('\x1b[33m[WARN]\x1b[0m', ...args),
  error: (...args) => console.log('\x1b[31m[ERROR]\x1b[0m', ...args)
};

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

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`);
  logger.debug('Request headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    logger.debug('Request body:', req.body);
  }
  next();
});

// CORS error handler
app.use((err, req, res, next) => {
  if (err.name === 'CORSError') {
    logger.error('CORS Error:', err.message);
    res.status(403).json({ error: 'CORS error: ' + err.message });
  } else {
    next(err);
  }
});

// MongoDB Connection with retry logic
const connectDB = async () => {
  logger.info('Attempting to connect to MongoDB...');
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
      family: 4 // Use IPv4, skip trying IPv6
    });
    
    logger.debug('MongoDB connection options:', {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    // Create indexes after successful connection
    logger.info('Creating indexes...');
    await User.createIndexes();
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.debug('Connection details:', {
      host: conn.connection.host,
      port: conn.connection.port,
      name: conn.connection.name
    });
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    logger.debug('Connection error details:', {
      name: error.name,
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected successfully');
});

// Health check endpoint
app.get('/', (req, res) => {
  logger.debug('Health check requested');
  res.json({ status: 'ok', message: 'RCSSA Match API is running' });
});

// Routes
app.post('/api/users', async (req, res) => {
  logger.info('Received new user registration request');
  logger.debug('User registration data:', req.body);
  
  try {
    logger.debug('Creating new user instance');
    const newUser = new User(req.body);
    
    // Validate the user data
    logger.debug('Validating user data');
    const validationError = newUser.validateSync();
    if (validationError) {
      logger.warn('Validation error:', validationError);
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationError.errors 
      });
    }
    
    logger.debug('Attempting to save user to database');
    const savedUser = await newUser.save();
    logger.info('User saved successfully:', savedUser._id);
    
    // Try to find a match immediately
    logger.debug('Searching for potential match');
    const match = await findMatch(newUser);
    
    if (match) {
      logger.info('Match found for user:', {
        userId: newUser._id,
        matchId: match._id
      });
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
    
    logger.info('No immediate match found for user:', newUser._id);
    res.json({
      matched: false,
      user: newUser
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    logger.debug('Error details:', {
      name: error.name,
      code: error.code,
      message: error.message,
      stack: error.stack
    });
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
  logger.debug('Starting match search for user:', user._id);
  try {
    // First try to find an unmatched user with the same major
    logger.debug('Searching for match with same major:', user.major);
    let match = await User.findOne({
      _id: { $ne: user._id },
      major: user.major,
      isMatched: false
    });

    // If no match found with same major, find any unmatched user
    if (!match) {
      logger.debug('No match found with same major, searching for any unmatched user');
      match = await User.findOne({
        _id: { $ne: user._id },
        isMatched: false
      });
    }

    if (match) {
      logger.info('Match found:', {
        userId: user._id,
        matchId: match._id,
        sameMajor: user.major === match.major
      });
      
      logger.debug('Updating match status for both users');
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

    logger.info('No match found for user:', user._id);
    return null;
  } catch (error) {
    logger.error('Error finding match:', error);
    logger.debug('Error details:', {
      name: error.name,
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}

// Add error handling middleware after your routes
app.use((error, req, res, next) => {
  logger.error('Server error:', error);
  logger.debug('Error details:', {
    name: error.name,
    code: error.code,
    message: error.message,
    stack: error.stack
  });
  
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
  logger.info(`Server running on port ${PORT}`);
}); 