// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirect
import './Header.css';

const Header = () => {
  const userEmail = localStorage.getItem('userEmail'); // Get the user's email from localStorage
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  const handleLogout = () => {
    localStorage.clear(); // Clear all stored user data
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="header-container">
      <div className="logo">
        <Link to="/">Farm Bid</Link>
      </div>
      <div className="navigation">
        <nav>
          <ul>
            {userEmail ? (
              <>
                <li>Welcome, {userEmail}</li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li> {/* Use a button for logout */}
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
            <li><Link to="/products">Products</Link></li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Header;
