//Buyer Dashboard
import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import { getNearbyFarmers } from '../Services/api'; // New API to fetch nearby farmers
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const [farmers, setFarmers] = useState([]);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ipinfo.io/json?token=80139ee7708eb3');
        const loc = response.data.loc.split(',');
        setLocation({
          latitude: loc[0],
          longitude: loc[1]
        });
      } catch (error) {
        console.error('Error fetching location:', error);
        setError('Unable to fetch location');
      }
    };

    const fetchNearbyFarmers = async () => {
      try {
        const response = await getNearbyFarmers(location); // Fetch nearby farmers
        setFarmers(response.data);
      } catch (error) {
        console.error('Error fetching farmers:', error);
        setError('Unable to fetch nearby farmers');
      }
    };

    fetchLocation().then(fetchNearbyFarmers);
  }, [location]);

  return (
    <div className="buyer-dashboard">
      <h2>Farmers Near You</h2>
      {error && <p className="error">{error}</p>}
      {farmers.length > 0 ? (
        <ul>
          {farmers.map((farmer) => (
            <li key={farmer.id}>
              {farmer.name} - {farmer.location.latitude}, {farmer.location.longitude}
            </li>
          ))}
        </ul>
      ) : (
        <p>No farmers found near your location.</p>
      )}
    </div>
  );
};

export default BuyerDashboard;
