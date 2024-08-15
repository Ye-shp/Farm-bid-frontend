// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const userEmail = localStorage.getItem('userEmail'); // Get the user's email from localStorage

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
                <li><Link to="/" onClick={() => localStorage.clear()}>Logout</Link></li>
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
