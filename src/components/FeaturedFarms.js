import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../Services/api';
import '../Styles/FeaturedFarms.css';

const FeaturedFarms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoading(true);
        const response = await api.getFeaturedFarms();

        // Log the entire response to verify structure
        console.log('API response:', response);

        // Handle the array of featured farms properly
        let farmsData = Array.isArray(response) ? response : [];

        // Assuming the user details are populated in the response
        const processedFarms = farmsData.map(farm => ({
          _id: farm._id?._id || farm._id || 'unknown', // Access nested _id or fallback to farm._id if it's a string
          username: farm._id?.username || 'Unknown Farm',
          description: farm._id?.description || 'No description available',
          email: farm._id?.email || 'No email available',
          totalEngagement: farm.totalEngagement || 0,
        }));

        // Set only the first 3 farms to be displayed
        setFarms(processedFarms.slice(0, 3));
        setError(null);
      } catch (err) {
        console.error('Error fetching farms:', err);
        setError(err.message || 'Failed to load featured farms');
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  return (
    <div className="featured-farms-container">
      <div className="featured-farms-header">
        <h2>Featured Farms</h2>
        <p>Discover our highlighted local farms of the week</p>
      </div>

      {loading ? (
        <p>Loading featured farms...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <div className="farms-grid">
          {farms.map((farm, index) => {
            const farmId = typeof farm._id === 'object' ? farm._id._id : farm._id;
            return (
              <div key={farmId || index} className="farm-card">
                <div className="farm-card-header">
                  <h3>{farm.username}</h3>
                  <span className="featured-badge">Featured</span>
                </div>
                
                <div className="farm-card-content">
                  <p className="farm-description">
                    {farm.description}
                  </p>
                  
                  <div className="farm-engagement">
                    <span>👥 Engagement: {farm.totalEngagement.toLocaleString()}</span>
                  </div>
                </div>

                <div className="farm-card-footer">
                  {farm.email && farm.email !== 'No email available' && (
                    <div className="farm-email">
                      ✉️ {farm.email}
                    </div>
                  )}
                  <Link to={`/farm/${farmId}`} className="view-profile-button">
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeaturedFarms;
