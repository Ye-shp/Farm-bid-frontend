import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../Services/api';
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
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const navigate = useNavigate();
  const theme = useTheme();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ipinfo.io/json?token=80139ee7708eb3', {
          withCredentials: false
        });
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await login({ email, password });

      if (response.status === 200) {
        const { token, user } = response.data;
        const userRole = user.role;

        // Store location data
        localStorage.setItem('latitude', location.latitude);
        localStorage.setItem('longitude', location.longitude);

        // Use AuthContext login
        authLogin({
          token,
          userId: user.id,
          role: userRole
        });

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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
            }}
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2">
                Don't have an account? <Link to="/register" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>Register</Link>
              </Typography>
              <Link to="/forgot-password" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
                <Typography variant="body2">Forgot Password?</Typography>
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
