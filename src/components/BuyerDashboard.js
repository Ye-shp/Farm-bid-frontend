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
    <div className="container mt-5">
      <h2 className="text-center mb-4">Available Auctions</h2>
      <div className="row">
        {auctions.map(auction => (
          <div className="col-md-6 mb-4" key={auction._id}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{auction.product.title}</h5>
                <p className="card-text">Starting Bid: {auction.startingPrice}</p>
                <p className="card-text">End Time: {new Date(auction.endTime).toLocaleString()}</p>
                {auction.product.imageUrl && <img src={auction.product.imageUrl} alt={auction.product.title} className="card-img-top mb-3" />}
                <input
                  type="number"
                  className="form-control mb-3"
                  value={bidAmount[auction._id] || ''}
                  onChange={(e) => handleBidChange(auction._id, e.target.value)}
                  placeholder="Enter your bid"
                />
                <button onClick={() => handleBidSubmit(auction._id)} className="btn btn-primary">Submit Bid</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default BuyerDashboard;
