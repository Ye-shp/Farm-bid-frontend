// src/components/HomePage.js
import React from 'react';
import './HomePage.css';

const HomePage = () => (
  <div className="homepage">
    <header className="homepage-header">
      <h1>Welcome to Farm Bid Marketplace</h1>
      <p>Bid on fresh produce directly from local farmers.</p>
    </header>
    <section className="homepage-info">
      <h2>Why Farm Bid?</h2>
      <p>Get the freshest produce at competitive prices while supporting local farmers.</p>
    </section>
  </div>
);

export default HomePage;
