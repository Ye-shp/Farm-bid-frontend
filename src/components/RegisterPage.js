// src/components/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../Services/api';
import axios from 'axios';
import '../Styles/RegisterPage.css';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // Default role
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Use ipinfo.io API to get user's location based on their IP
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ipinfo.io/json?token=80139ee7708eb3');
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

  const handleRegister = async (e) => {
    e.preventDefault();
  
    // Validate that username is not empty
    if (!username || username.trim() === "") {
      setError("Username is required and cannot be empty.");
      return;
    }
  
    try {
      const response = await register({ username, email, password, role, location });
      if (response.status === 201) {
        alert("Registration successful!");
        setUsername('');
        setEmail(''); 
        setPassword(''); 
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
    <div className="container mt-5">
      <h2 className="text-center mb-4">Register</h2>
      <form onSubmit={handleRegister} className="mb-5">
        <div className=" mb-3">
          <input 
          type = "text"
          className="form-control"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a Username"
          required/> 
        </div>
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
        <div className="mb-3">
          <select 
            className="form-select"
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            required>
            <option value="buyer">Buyer</option>
            <option value="farmer">Farmer</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
        {error && <p className="text-danger mt-3">{error}</p>}
      </form>
    </div>
  );
  
};

export default RegisterPage;
