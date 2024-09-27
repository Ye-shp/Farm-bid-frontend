// src/components/FarmerAuctions.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FarmerAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auctions/farmer-auctions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuctions(response.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };

    fetchAuctions();
  }, [token]);

  return (
    <div>
      <h2>My Auctions</h2>
      <ul>
        {auctions.map(auction => (
          <li key={auction._id}>
            <p>{auction.product.title}</p>
            <p>Starting Bid: {auction.startingBid}</p>
            <p>Status: {auction.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FarmerAuctions;
