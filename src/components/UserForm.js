import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
} from '@mui/material';

const majors = [
  'Computer Science',
  'Engineering',
  'Business',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Psychology',
  'Economics',
  'Other'
];

const graduationYears = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i);

function UserForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    major: '',
    graduationYear: '',
    netId: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.major) newErrors.major = 'Major is required';
    if (!formData.graduationYear) newErrors.graduationYear = 'Graduation year is required';
    if (!formData.netId.trim()) newErrors.netId = 'Net ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Find Your Study Buddy
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Connect with fellow students in your major
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Full Name"
          name="name"
          autoComplete="name"
          autoFocus
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          sx={{ mb: 2 }}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="netId"
          label="Net ID"
          name="netId"
          value={formData.netId}
          onChange={handleChange}
          error={!!errors.netId}
          helperText={errors.netId}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          margin="normal"
          required
          fullWidth
          id="major"
          label="Major"
          name="major"
          value={formData.major}
          onChange={handleChange}
          error={!!errors.major}
          helperText={errors.major}
          sx={{ mb: 2 }}
        >
          {majors.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          margin="normal"
          required
          fullWidth
          id="graduationYear"
          label="Graduation Year"
          name="graduationYear"
          value={formData.graduationYear}
          onChange={handleChange}
          error={!!errors.graduationYear}
          helperText={errors.graduationYear}
          sx={{ mb: 3 }}
        >
          {graduationYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ 
            mt: 2,
            mb: 2,
            py: 1.5,
            textTransform: 'none',
            fontSize: '1.1rem'
          }}
        >
          Find My Match
        </Button>
      </Box>
    </Paper>
  );
}

export default UserForm; 