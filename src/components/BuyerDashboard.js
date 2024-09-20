import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [bidAmount, setBidAmount] = useState({}); // State to track bid amounts for each auction
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const token = localStorage.getItem('token'); // Get the token from local storage

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auctions', {
          headers: { Authorization: `Bearer ${token}` }, // Include token in the request header
        });
        setAuctions(response.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };

    fetchAuctions();
  }, [token]);

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

  // Handle bid input changes
  const handleBidChange = (auctionId, value) => {
    setBidAmount({
      ...bidAmount,
      [auctionId]: value,
    });
  };

  // Handle bid submission
  const handleBidSubmit = async (auctionId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auctions/${auctionId}/bid`,
        { bidAmount: bidAmount[auctionId] },
        { headers: { Authorization: `Bearer ${token}` } } // Include the token for authentication
      );
      console.log('Bid submitted:', response.data);
      alert('Bid successfully submitted!');
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Error submitting bid.');
    }
  };

  return (
    <div className="buyer-dashboard">
      <h2>Available Auctions</h2>
      <ul>
        {auctions.map(auction => (
          <li key={auction._id}>
            <p>Product: {auction.product.title}</p> {/* Display product title */}
            <p>Starting Bid: {auction.startingPrice}</p> {/* Display starting price */}
            <p>End Time: {new Date(auction.endTime).toLocaleString()}</p> {/* Display auction end time */}
            {auction.product.imageUrl && (
              <img src={auction.product.imageUrl} alt={auction.product.title} width="100" />
            )}

            {/* Bid input */}
            <input
              type="number"
              value={bidAmount[auction._id] || ''} // Display current bid amount or empty string
              onChange={(e) => handleBidChange(auction._id, e.target.value)}
              placeholder="Enter your bid"
            />
            <button onClick={() => handleBidSubmit(auction._id)}>Submit Bid</button>
          </li>
        ))}
      </ul>

      {/* Existing functionality */}
      <h2>My Favorite Products</h2>
      {/* Assume there is some logic here for showing the buyer's favorite products */}
      <ul>
        {/* Favorite product list logic */}
      </ul>
    </div>
  );
};

export default BuyerDashboard;
