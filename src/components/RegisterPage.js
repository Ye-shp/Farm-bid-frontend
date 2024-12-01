import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../Services/api';
import axios from 'axios';
import { Box, Button, Container, Grid, Select, MenuItem, TextField, Typography, Alert, InputAdornment } from '@mui/material';
import { Person, Email, Lock, Store, ShoppingCart, Phone } from '@mui/icons-material';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('buyer');
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || username.trim() === "") {
      setError("Username is required and cannot be empty.");
      return;
    }
    try {
      const response = await register({ username, email, password, phone, role, location });
      if (response.status === 201) {
        alert("Registration successful!");
        setUsername('');
        setEmail('');
        setPassword('');
        setPhone('');
        setRole('buyer');
        setError(null);
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.status === 409) {
        setError("User already registered. Please log in.");
      } else if (error.response && error.response.status === 400) {
        setError("Username already taken. Please choose another username.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleRegister}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>           
            <Grid item xs={12}>
              <Select
                fullWidth
                value={role}
                onChange={(e) => setRole(e.target.value)}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    {role === 'buyer' ? <ShoppingCart /> : <Store />}
                  </InputAdornment>
                }
              >
                <MenuItem value="buyer">Buyer</MenuItem>
                <MenuItem value="farmer">Farmer</MenuItem>
              </Select>
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Register
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default RegisterPage;
