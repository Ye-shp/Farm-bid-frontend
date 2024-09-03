// src/components/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../Services/api';
import './RegisterPage.css';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // Default role
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register({ email, password, role });
      if (response.status === 201) {
        alert("Registration successful!");
        setEmail('');  // Clear the email field
        setPassword('');  // Clear the password field
        setRole('buyer');  // Reset role to default
        setError(null);  // Clear any error messages
        navigate('/login'); // Redirect to login page
      }
    } catch (error) {
      console.error('Registration error:', error);  // Log any errors
      if (error.response && error.response.status === 409) {
        setError("User already registered. Please log in.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
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
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="buyer">Buyer</option>
          <option value="farmer">Farmer</option>
        </select>
        <button type="submit">Register</button>
        {error && <p className="error">{error}</p>} {/* Display error message */}
      </form>
    </div>
  );
};

export default RegisterPage;
