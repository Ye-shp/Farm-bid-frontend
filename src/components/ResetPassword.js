import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Paper, Alert } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { resetPassword } from '../Services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, password);
      navigate('/login', { state: { message: 'Password reset successful. Please login with your new password.' } });
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Reset Password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
            InputProps={{
              startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            margin="normal"
            InputProps={{
              startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
