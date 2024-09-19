import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';

const Header = () => {
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole'); // To differentiate between farmer and buyer
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear localStorage on logout
    navigate('/login');   // Redirect to login page
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Farm Bid</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {userEmail ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">Welcome, {userEmail}</span>
                </li>

                {/* Dashboard link based on user role */}
                {userRole === 'farmer' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/farmer-dashboard">Farmer Dashboard</Link>
                  </li>
                )}
                {userRole === 'buyer' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/buyer-dashboard">Buyer Dashboard</Link>
                  </li>
                )}

                <li className="nav-item">
                  <Link className="nav-link" to="/blogs">Blog</Link>
                </li>

                {/* More dropdown menu */}
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="/" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    More
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><Link className="dropdown-item" to="/AboutUs">About Us</Link></li>
                    <li><Link className="dropdown-item" to="/FeatureRequest">Feature Request</Link></li>
                    <li><Link className="dropdown-item" to="/" onClick={handleLogout}>Logout</Link></li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
