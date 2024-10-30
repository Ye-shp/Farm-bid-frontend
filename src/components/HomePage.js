import React, { useState, useEffect } from 'react';
import '../Styles/HomePage.css';
import api from '../Services/api';  // Import your API service
import FeaturedFarms from '../components/FeaturedFarms';

const HomePage = () => {
  const [featuredFarms, setFeaturedFarms] = useState([]);

  useEffect(() => {
    const fetchFeaturedFarms = async () => {
      try {
        const response = await api.getFeaturedFarms(); // Correct usage of the default import
        setFeaturedFarms(response.data); // Set the farms data from response
      } catch (error) {
        console.error('Error fetching featured farms:', error);
      }
    };
  
    fetchFeaturedFarms();
  }, []);
  

  return (
    <div className="container text-center my-5">
      <header className="py-5 bg-primary text-white rounded shadow">
        <h1 className="display-4 fw-bold">Welcome to Elipae Marketplace</h1>
        <p className="lead">Bid on fresh produce directly from local farmers.</p>
      </header>

      <section className="my-5 p-5 bg-light rounded shadow">
        <h2 className="mb-4">Elipae</h2>
        <p className="lead">At Elipae, we empower farmers by transforming surplus into opportunity. Our platform connects local farmers with buyers, ensuring fair pricing and reducing waste. We’re building a sustainable future where communities thrive through transparent, accessible, and efficient agricultural commerce. <br /><br /> 
        Looking for more? Check out this week’s featured farms in the USA and discover their stories, innovations, and produce. Stay connected with the heart of America’s agriculture!</p>
      </section>

      {/* Featured Farms Section */}
      <section className="my-5">
        <h2 className="mb-4">This Week's Farms</h2>
        <div className="row">
          {/* Dynamically render the featured farms */}
          {featuredFarms.length > 0 ? (
            featuredFarms.map(farm => (
              <div key={farm._id} className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{farm.name}</h5>
                    <p className="card-text">{farm.description}</p>
                    {/* Add other farm-specific info here */}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Loading featured farms...</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
