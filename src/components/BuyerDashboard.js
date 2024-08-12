// src/components/BuyerDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const [auctions, setAuctions] = useState([]);

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
