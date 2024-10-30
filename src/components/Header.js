// src/components/Header.js
import React, { useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Header.css';
const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 
  const userId = localStorage.getItem('userId');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/'); // Redirect to home page after logout
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeDropdown);
    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, []);

  const handleItemClick = () => {
    setIsDropdownOpen(false); // Close the dropdown after an item is clicked
  };

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        {/* Left side - Elipae */}
        <Link to="/" className="navbar-brand">
          Elipae
        </Link>

        {/* Right side - Dropdown */}
        <div className="dropdown ms-auto">
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
          >
            Menu
          </button>
          <ul
            className={`dropdown-menu dropdown-menu-end ${isDropdownOpen ? 'show' : ''}`}
            aria-labelledby="dropdownMenuButton"
          >
            {/* Accessible to everyone */}
            <li onClick={handleItemClick}>
              <Link to="/blogs" className="dropdown-item hover-item">Field Notes</Link>
            </li>

            {/* Show these options for logged-in farmers */}
            {token && userRole === 'farmer' && (
              <>
                <li onClick={handleItemClick}>
                  <Link to="/farmer-dashboard" className="dropdown-item hover-item">Dashboard</Link>
                </li>
                <li onClick={handleItemClick}>
                  <Link to={`/user/${userId}`} className="dropdown-item hover-item">My Profile</Link> {/* Dynamic Profile Link */}
                </li>
                <li onClick={handleItemClick}>
                  <Link to="/create-blog" className="dropdown-item hover-item">Create Field Notes</Link>
                </li>
                <li onClick={handleItemClick}>
                  <Link to= "/farmer-auctions" className="dropdown-item hover-item">My Auctions</Link>
                </li>
              </>
            )}

            {/* Show these options for logged-in buyers */}
            {token && userRole === 'buyer' && (
              <>
                <li onClick={handleItemClick}>
                  <Link to="/buyer-dashboard" className="dropdown-item hover-item">Buyer Dashboard</Link>
                </li>
                <li onClick={handleItemClick}>
                  <Link to="/create-blog" className="dropdown-item hover-item">Create field note</Link>
                </li>
                <li onClick={handleItemClick}>
                  <Link to = {`/user/${userId}`} className="dropdown-item hover-item">My profile</Link>
                </li>
              </>
            )}

            {/* Show login and register for not logged-in users */}
            {!token ? (
              <>
                <li onClick={handleItemClick}>
                  <Link to="/login" className="dropdown-item hover-item">Login</Link>
                </li>
                <li onClick={handleItemClick}>
                  <Link to="/register" className="dropdown-item hover-item">Register</Link>
                </li>
              </>
            ) : (
              <li onClick={handleItemClick}>
                <button
                  onClick={() => {
                    handleLogout();
                    handleItemClick();
                  }}
                  className="dropdown-item btn btn-link hover-item"
                >
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