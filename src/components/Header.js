// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => (
  <div className="header-container">
    <div className="logo">
      <Link to="/">Farm Bid</Link>
    </div>
    <div className="navigation">
      <nav>
        <ul>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
        </ul>
      </nav>
    </div>
  </div>
);

export default Header;
