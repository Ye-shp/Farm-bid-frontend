// src/components/BuyerDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });

  // Fetch available auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('/api/auctions');
        setAuctions(response.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };

    fetchAuctions();
  }, []);

  // Fetch buyer's location (using ipinfo.io)
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ipinfo.io/json?token=80139ee7708eb3'); // Replace with your actual token
        const loc = response.data.loc.split(',');
        setLocation({
          latitude: loc[0],
          longitude: loc[1]
        });
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, []);

  return (
    <div className="buyer-dashboard">
      <h2>Available Auctions</h2>
      <ul>
        {auctions.map(auction => (
          <li key={auction.id}>{auction.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default BuyerDashboard;
