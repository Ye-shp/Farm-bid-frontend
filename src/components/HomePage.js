import React from 'react';
import './HomePage.css';

const HomePage = () => (
  <div className="container text-center my-5">
    {/* Header Section */}
    <header className="py-5 bg-primary text-white rounded shadow">
      <h1 className="display-4 fw-bold">Welcome to Farm Bid Marketplace</h1>
      <p className="lead">Bid on fresh produce directly from local farmers.</p>
    </header>

    {/* Why Farm Bid Section */}
    <section className="my-5 p-5 bg-light rounded shadow">
      <h2 className="mb-4">Why Farm Bid?</h2>
      <p className="lead">Get the freshest produce at competitive prices while supporting local farmers.</p>
    </section>

    {/* Map Section */}
    <section className="my-5">
      <h2 className="mb-4">Find Local Farms</h2>
      <div className="embed-responsive embed-responsive-16by9">
        <iframe
          className="embed-responsive-item"
          src="https://www.google.com/maps/d/embed?mid=1sEtufBsicCwZVucez3fAHTdsGumzAy4&ehbc=2E312F"
          width="640"
          height="480"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  </div>
);

export default HomePage;
