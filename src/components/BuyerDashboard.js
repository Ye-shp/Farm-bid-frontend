// src/components/BuyerDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auctions');
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
        const response = await axios.get('https://ipinfo.io/json?token=80139ee7708eb3');
        const loc = response.data.loc.split(',');
        setLocation({
          latitude: loc[0],
          longitude: loc[1],
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
          <li key={auction._id}>
            <p>Product: {auction.product.title}</p> {/* Fixed rendering of product title */}
            <p>Starting Bid: {auction.startingBid}</p> {/* Fixed starting bid rendering */}
            <p>End Time: {new Date(auction.endTime).toLocaleString()}</p> {/* Display the auction end time */}
            {auction.product.imageUrl && (
              <img src={auction.product.imageUrl} alt={auction.product.title} width="100" />
            )}
          </li>
        ))}
      </ul>

      {/* Existing functionality of your buyer dashboard */}
      <h2>My Favorite Products</h2>
      {/* Assume there is some logic here for showing the buyer's favorite products */}
      <ul>
        {/* Favorite product list logic */}
      </ul>
    </div>
  );
};

export default BuyerDashboard;
