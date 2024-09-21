// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css'; // Assuming you have some styles

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Get user role from localStorage

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Farm-Bid
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/blogs" className="nav-link">Blogs</Link> {/* Accessible to everyone */}
            </li>
            <li className="nav-item">
              <Link to="/products" className="nav-link">Products</Link> {/* Accessible to everyone */}
            </li>

            {/* Show these options for logged-in farmers */}
            {token && userRole === 'farmer' && (
              <>
                <li className="nav-item">
                  <Link to="/farmer-dashboard" className="nav-link">Farmer Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link to="/auctions" className="nav-link">Auctions</Link>
                </li>
              </>
            )}

            {/* Show these options for logged-in buyers */}
            {token && userRole === 'buyer' && (
              <>
                <li className="nav-item">
                  <Link to="/buyer-dashboard" className="nav-link">Buyer Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link to="/auctions" className="nav-link">Auctions</Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ml-auto">
            {/* Show login and register for not logged-in users */}
            {!token ? (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">Register</Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link btn btn-link text-white">
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
