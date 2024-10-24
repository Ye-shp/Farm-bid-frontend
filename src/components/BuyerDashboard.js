import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/BuyerDashboard.css';

const BuyerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [bidAmount, setBidAmount] = useState({}); // State to track bid amounts for each auction
  const [notifications, setNotifications] =useState ([]); 
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const token = localStorage.getItem('token'); // Get the token from local storage

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('https://farm-bid-3998c30f5108.herokuapp.com/api/auctions', {
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
        `https://farm-bid-3998c30f5108.herokuapp.com/api/auctions/${auctionId}/bid`,
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
//NOtifications 

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('https://farm-bid-3998c30f5108.herokuapp.com/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [token]);

  return (
    <div className="container-fluid mt-5">
      <h2 className="text-center mb-4">Available Auctions</h2>
        <div className="notifications-bell">
        <h4>Notifications</h4>
        <ul>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <li key={notification._id}>{notification.message}</li>
            ))
          ) : (
            <li>No new notifications</li>
          )}
        </ul>
      </div>
      <div className="row g-4">
        {auctions.map((auction) => (
          <div className="col-lg-4 col-md-6 col-sm-12" key={auction._id}>
            <div className="card auction-card h-100 shadow-lg">
              {auction.product.imageUrl && (
                <img
                  src={auction.product.imageUrl}
                  alt={auction.product.title}
                  className="card-img-top auction-image"
                />
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-center auction-title">
                  {auction.product.title}
                </h5>
                <p className="card-text text-muted text-center">
                  {auction.product.description}
                </p>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="card-text mb-0">
                    <strong>Starting Bid:</strong>
                    <span className="badge bg-success ms-2">${auction.startingPrice}</span>
                  </p>
                  <i className="bi bi-cash-stack text-success"></i>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="card-text mb-0">
                    <strong>Highest Bid:</strong>
                    <span className="badge bg-primary ms-2">${auction.highestBid}</span>
                  </p>
                  <i className="bi bi-graph-up-arrow text-primary"></i>
                </div>
                <div className="mt-auto">
                  <input
                    type="number"
                    className="form-control mb-2"
                    value={bidAmount[auction._id] || ''}
                    onChange={(e) => handleBidChange(auction._id, e.target.value)}
                    placeholder="Enter your bid"
                  />
                  <button
                    onClick={() => handleBidSubmit(auction._id)}
                    className="btn btn-primary w-100"
                  >
                    Submit Bid
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerDashboard;