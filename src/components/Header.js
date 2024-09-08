// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const userEmail = localStorage.getItem('userEmail'); // Get the user's email from localStorage
  const userRole = localStorage.getItem('userRole'); // Get the user's role from localStorage
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); // Redirect to login after logout
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
                {userRole === 'farmer' ? (
                  <li><Link to="/farmer-products">Products</Link></li>  
                ) : (
                  <li><Link to="/products">Products</Link></li>         
                )}
                <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Header;
