import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { getNearbyBuyers } from '../Services/api'; // New API to fetch nearby buyers
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const [buyers, setBuyers] = useState([]);
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

    const fetchNearbyBuyers = async () => {
      try {
        const response = await getNearbyBuyers(location); // Fetch nearby buyers
        setBuyers(response.data);
      } catch (error) {
        console.error('Error fetching buyers:', error);
        setError('Unable to fetch nearby buyers');
      }
    };

    fetchLocation().then(fetchNearbyBuyers);
  }, [location]);

  return (
    <div className="farmer-dashboard">
      <h2>Buyers Near You</h2>
      {error && <p className="error">{error}</p>}
      {buyers.length > 0 ? (
        <ul>
          {buyers.map((buyer) => (
            <li key={buyer.id}>
              {buyer.name} - {buyer.location.latitude}, {buyer.location.longitude}
            </li>
          ))}
        </ul>
      ) : (
        <p>No buyers found near your location.</p>
      )}
    </div>
  );
};

export default FarmerDashboard;
