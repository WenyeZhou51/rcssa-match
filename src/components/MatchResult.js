import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';

function MatchResult({ userData }) {
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        You've Been Matched!
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        We found someone in your major who's looking to connect
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Your Information
        </Typography>
        <Typography variant="body1">Name: {userData.name}</Typography>
        <Typography variant="body1">Major: {userData.major}</Typography>
        <Typography variant="body1">Graduation Year: {userData.graduationYear}</Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Your Match
        </Typography>
        <Typography variant="body1">Name: {userData.match.name}</Typography>
        <Typography variant="body1">Major: {userData.match.major}</Typography>
        <Typography variant="body1" color="primary" sx={{ mt: 2, fontWeight: 'medium' }}>
          Contact: {userData.match.email}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ 
            textTransform: 'none',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem'
          }}
        >
          Back to Form
        </Button>
      </Box>
    </Paper>
  );
}

export default MatchResult; 