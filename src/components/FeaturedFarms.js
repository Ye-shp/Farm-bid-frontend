// FeaturedFarms.js

import React, { useEffect, useState } from 'react';
import { getFeaturedFarms } from '../Services/api'; // Use named import
import '../Styles/FeaturedFarms.css'; // Add any necessary styles

const FeaturedFarms = () => {
  const [farms, setFarms] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const featuredFarms = await getFeaturedFarms();
        setFarms(featuredFarms);
      } catch (error) {
        setError('Unable to fetch featured farms. Please try again later.');
      }
    };

    fetchFarms();
  }, []);

  return (
    <div className="featured-farms">
      <h2>Featured Farms of the Week</h2>
      {error && <p className="text-danger">{error}</p>}
      <div className="farms-list">
        {farms.map(farm => (
          <div key={farm._id} className="farm-card">
            <h3>{farm.username}</h3>
            <p>{farm.description}</p>
            <p>Location: {farm.location?.latitude}, {farm.location?.longitude}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedFarms;
