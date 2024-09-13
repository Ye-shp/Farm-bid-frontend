import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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
                  <li><Link to="/farmer-dashboard">My Products</Link></li>  // Change to correct farmer route
                ) : (
                  <li><Link to="/products">Products</Link></li>
                )}
                <li><Link to="/blogs">Blog</Link></li>
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
