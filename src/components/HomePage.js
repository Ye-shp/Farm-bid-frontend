// HomePage.js

import React, { useState, useEffect } from 'react';
import '../Styles/HomePage.css';
import FeaturedFarms from './FeaturedFarms'; // Use the already defined component

const HomePage = () => {
  return (
    <div className="container text-center my-5">
      <header className="py-5 bg-primary text-white rounded shadow">
        <h1 className="display-4 fw-bold">Welcome to Elipae Marketplace</h1>
        <p className="lead">Bid on fresh produce directly from local farmers.</p>
      </header>

      <section className="my-5 p-5 bg-light rounded shadow">
        <h2 className="mb-4">Elipae</h2>
        <p className="lead">At Elipae, we empower farmers by transforming surplus into opportunity. Our platform connects local farmers with buyers, ensuring fair pricing and reducing waste. We’re building a sustainable future where communities thrive through transparent, accessible, and efficient agricultural commerce.</p>
      </section>

      {/* Use the FeaturedFarms Component Here */}
      <section className="my-5">
        <FeaturedFarms />
      </section>
    </div>
  );
};

export default HomePage;
