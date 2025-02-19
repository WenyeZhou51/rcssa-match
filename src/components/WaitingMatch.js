import React from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';

function WaitingMatch() {
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Finding Your Match
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        We're looking for the perfect study buddy for you. This might take a moment...
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress size={60} />
      </Box>

      <Typography variant="body2" align="center" color="text.secondary">
        We'll notify you as soon as we find a match!
      </Typography>
    </Paper>
  );
}

export default WaitingMatch; 