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
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    coordinates: {
      lat: '',
      lng: ''
    }
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        // First get IP-based location
        const ipResponse = await axios.get('https://ipinfo.io/json?token=80139ee7708eb3', {
          withCredentials: false
        });
        const [lat, lng] = ipResponse.data.loc.split(',');
        
        // Use Google's Geocoding API to get detailed address
        const geocodeResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyA2GLTPo0Qykokes3JkPzN8bmGGlR9HYxA`
        );

        if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
          const addressComponents = geocodeResponse.data.results[0].address_components;
          let newAddress = {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            coordinates: {
              lat: parseFloat(lat),
              lng: parseFloat(lng)
            }
          };

          // Parse address components
          addressComponents.forEach(component => {
            if (component.types.includes('street_number') || component.types.includes('route')) {
              newAddress.street += component.long_name + ' ';
            }
            if (component.types.includes('locality')) {
              newAddress.city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              newAddress.state = component.short_name;
            }
            if (component.types.includes('postal_code')) {
              newAddress.zipCode = component.long_name;
            }
          });

          newAddress.street = newAddress.street.trim();
          setAddress(newAddress);
        }
      } catch (error) {
        console.error("Error fetching location details:", error);
        setError("Unable to fetch location details. Please fill in the address manually.");
      }
    };

    fetchLocationDetails();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || username.trim() === "") {
      setError("Username is required and cannot be empty.");
      return;
    }

    // Validate coordinates
    const lat = parseFloat(address.coordinates.lat);
    const lng = parseFloat(address.coordinates.lng);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError("Invalid latitude value. Must be between -90 and 90.");
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError("Invalid longitude value. Must be between -180 and 180.");
      return;
    }

    try {
      const userData = {
        username,
        email,
        password,
        phone,
        role,
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          coordinates: {
            lat,
            lng
          }
        }
      };

      const response = await register(userData);
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
              <TextField
                fullWidth
                label="Street Address"
                variant="outlined"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                variant="outlined"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                variant="outlined"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                variant="outlined"
                value={address.zipCode}
                onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                required
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
