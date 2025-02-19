import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, CssBaseline } from '@mui/material';
import axios from 'axios';
import UserForm from './components/UserForm';
import MatchResult from './components/MatchResult';
import WaitingMatch from './components/WaitingMatch';

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

function App() {
  const [matchData, setMatchData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let pollInterval;
    
    if (userId && isWaiting) {
      pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/users/${userId}/match`);
          if (response.data.matched) {
            setMatchData({
              ...matchData,
              match: response.data.match
            });
            setIsWaiting(false);
          }
          // Clear any previous errors on successful request
          setError(null);
        } catch (error) {
          console.error('Error polling for match:', error);
          setError('Unable to check for matches. Please try again later.');
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [userId, isWaiting, matchData]);

  const handleFormSubmit = async (formData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/users`, formData);
      
      if (response.data.matched) {
        setMatchData({
          ...response.data.user,
          match: response.data.match
        });
      } else {
        setUserId(response.data.user._id);
        setMatchData(response.data.user);
        setIsWaiting(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Unable to submit your information. Please try again.');
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography color="error" align="center" variant="h6">
            {error}
          </Typography>
        </Paper>
      );
    }
    
    if (!matchData) {
      return <UserForm onSubmit={handleFormSubmit} />;
    }
    if (isWaiting) {
      return <WaitingMatch />;
    }
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