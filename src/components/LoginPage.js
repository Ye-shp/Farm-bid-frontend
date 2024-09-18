import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../Services/api';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const navigate = useNavigate();

  // Fetch location (optional) if you want to update user location at login
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ipinfo.io/json?token=<YOUR_API_KEY>');
        const loc = response.data.loc.split(','); // loc is returned as "latitude,longitude"
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
    try {
      const response = await login({ email, password, location });
      if (response.status === 200) {
        alert("Login successful!");
        navigate('/farmer-dashboard'); // Adjust according to the role
      }
    } catch (error) {
      setError("Login failed. Please check your email and password.");
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {location.latitude && location.longitude && (
          <p>Detected location: {location.latitude}, {location.longitude}</p>
        )}
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
