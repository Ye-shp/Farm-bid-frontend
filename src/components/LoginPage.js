// src/components/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../Services/api';  // Assuming you have the login function in Services/api
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  useTheme,
  CircularProgress
} from '@mui/material';

const LoginPage = ({ setIsLoggedIn, setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const navigate = useNavigate();
  const theme = useTheme();

  // Fetch user location (for matchmaking)
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ipinfo.io/json?token=80139ee7708eb3');
        const loc = response.data.loc.split(',');
        setLocation({
          latitude: loc[0],
          longitude: loc[1]
        });
      } catch (error) {
        console.error("Error fetching location:", error);
        setError("Unable to fetch location from IP address.");
      }
    };

    fetchLocation();
  }, []);

  // Handle the login submission
  const handleLogin = async (e) => {
    e.preventDefault();  // Prevent default form submission
    setLoading(true);
    setError(null);
    try {
      // Perform the login request with just email and password
      const response = await login({ email, password });

      if (response.status === 200) {
        const { token, user } = response.data;  // Get token and user from response
        const userRole = user.role;  // Extract the role from the user object

        // Store the token, role (from userRole), and location in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('role', userRole);
        localStorage.setItem('latitude', location.latitude);
        localStorage.setItem('longitude', location.longitude);
        localStorage.setItem('userId', user.id);

        // Set the logged-in state in App.js
        setIsLoggedIn(true);
        setUserRole(userRole);

        // Redirect based on userRole
        if (userRole === 'farmer') {
          navigate('/farmer-dashboard');
        } else if (userRole === 'buyer') {
          navigate('/buyer-dashboard');
        }
      }
    } catch (error) {
      setError("Login failed. Please check your email and password.");
      console.error('Login error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: theme.shape.borderRadius * 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            inputProps={{ 'aria-label': 'Email' }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            inputProps={{ 'aria-label': 'Password' }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 4, position: 'relative' }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: theme.palette.grey[200] }} /> : 'Login'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
