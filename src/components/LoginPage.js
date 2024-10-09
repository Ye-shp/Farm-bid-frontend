// src/components/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../Services/api';  // Assuming you have the login function in Services/api
import axios from 'axios';
import './LoginPage.css';

const LoginPage = ({ setIsLoggedIn, setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const navigate = useNavigate();

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
        console.log('Location fetched:', loc);  // Log the location for debugging
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
    console.log('Login button clicked');  // Debugging log to check button responsiveness

    try {
      // Log the login details
      console.log('Attempting login with:', { email, password });

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

        console.log('Login successful:', { userRole, token, location });  // Debugging log

        // Set the logged-in state in App.js
        setIsLoggedIn(true);
        setUserRole(userRole);

        // Redirect based on userRole
        if (userRole === 'farmer') {
          console.log('Redirecting to farmer dashboard...');
          navigate('/farmer-dashboard');
        } else if (userRole === 'buyer') {
          console.log('Redirecting to buyer dashboard...');
          navigate('/buyer-dashboard');
        } else {
          console.error('Invalid userRole detected, no redirection');
        }
      }
    } catch (error) {
      setError("Login failed. Please check your email and password.");
      console.error('Login error:', error.response?.data || error);  // Log the error response or message
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleLogin} className="mb-5">
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
        {error && <p className="text-danger mt-3">{error}</p>}
      </form>
    </div>
  );
  
};

export default LoginPage;
