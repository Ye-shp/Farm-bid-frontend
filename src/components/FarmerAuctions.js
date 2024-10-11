import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/FarmerAuction.css'

const FarmerAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('https://farm-bid-3998c30f5108.herokuapp.com/api/auctions/farmer-auctions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response); // Log the full response to debug
        setAuctions(response.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };

    fetchAuctions();
  }, [token]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">My Auctions</h2>
      <div className="row">
        {auctions.length > 0 ? (
          auctions.map((auction) => (
            <div className="col-md-6 mb-4" key={auction._id}>
              <div className="card auction-card h-100 shadow-lg">
                <div className="card-body">
                  <h5 className="card-title text-center auction-title">
                    {auction.product.title}
                  </h5>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="card-text">
                      <strong>Starting Bid:</strong>
                      <span className="badge bg-success ms-2">${auction.startingBid}</span>
                    </p>
                    <i className="bi bi-cash-stack text-success"></i>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="card-text">
                      <strong>Highest Bid:</strong>
                      <span className="badge bg-primary ms-2">${auction.highestBid}</span>
                    </p>
                    <i className="bi bi-graph-up-arrow text-primary"></i>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="card-text">
                      <strong>Status:</strong>
                      <span
                        className={`badge ${
                          auction.status === 'active' ? 'bg-info' : 'bg-secondary'
                        } ms-2`}
                      >
                        {auction.status}
                      </span>
                    </p>
                    <i
                      className={`bi ${
                        auction.status === 'active' ? 'bi-check-circle-fill text-info' : 'bi-x-circle-fill text-secondary'
                      }`}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No auctions found.</p>
        )}
      </div>
    </div>
  );
};

export default FarmerAuctions;