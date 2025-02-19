import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, CssBaseline, Paper, Typography } from '@mui/material';
import axios from 'axios';
import UserForm from './components/UserForm';
import MatchResult from './components/MatchResult';
import WaitingMatch from './components/WaitingMatch';

// Logger utility
const logger = {
  debug: (...args) => console.log('%c[DEBUG]', 'color: blue', ...args),
  info: (...args) => console.log('%c[INFO]', 'color: green', ...args),
  warn: (...args) => console.log('%c[WARN]', 'color: orange', ...args),
  error: (...args) => console.log('%c[ERROR]', 'color: red', ...args)
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
logger.info('Using API URL:', API_BASE_URL);

function App() {
  const [matchData, setMatchData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let pollInterval;
    
    if (userId && isWaiting) {
      logger.info('Starting polling for match with userId:', userId);
      pollInterval = setInterval(async () => {
        try {
          logger.debug('Polling for match...');
          const response = await axios.get(`${API_BASE_URL}/users/${userId}/match`);
          logger.debug('Poll response:', response.data);
          
          if (response.data.matched) {
            logger.info('Match found during polling:', response.data.match);
            setMatchData({
              ...matchData,
              match: response.data.match
            });
            setIsWaiting(false);
          }
          // Clear any previous errors on successful request
          setError(null);
        } catch (error) {
          logger.error('Error polling for match:', error);
          logger.debug('Error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
          setError('Unable to check for matches. Please try again later.');
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (pollInterval) {
        logger.debug('Cleaning up poll interval');
        clearInterval(pollInterval);
      }
    };
  }, [userId, isWaiting, matchData]);

  const handleFormSubmit = async (formData) => {
    logger.info('Submitting form data');
    logger.debug('Form data:', formData);
    
    try {
      setError(null);
      logger.debug('Making POST request to:', `${API_BASE_URL}/users`);
      const response = await axios.post(`${API_BASE_URL}/users`, formData);
      logger.debug('Server response:', response.data);
      
      if (response.data.matched) {
        logger.info('Immediate match found');
        setMatchData({
          ...response.data.user,
          match: response.data.match
        });
      } else {
        logger.info('No immediate match, entering waiting state');
        setUserId(response.data.user._id);
        setMatchData(response.data.user);
        setIsWaiting(true);
      }
    } catch (error) {
      logger.error('Error submitting form:', error);
      logger.debug('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });
      setError('Unable to submit your information. Please try again.');
    }
  };

  const renderContent = () => {
    if (error) {
      logger.warn('Rendering error state:', error);
      return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography color="error" align="center" variant="h6">
            {error}
          </Typography>
        </Paper>
      );
    }
    
    if (!matchData) {
      logger.debug('Rendering initial form state');
      return <UserForm onSubmit={handleFormSubmit} />;
    }
    if (isWaiting) {
      logger.debug('Rendering waiting state');
      return <WaitingMatch />;
    }
    logger.debug('Rendering match result state');
    return <MatchResult userData={matchData} />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="sm" sx={{ pt: 8 }}>
        {renderContent()}
      </Container>
    </ThemeProvider>
  );
}

export default App; 