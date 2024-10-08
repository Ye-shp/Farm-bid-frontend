import React, { useState } from 'react';
import axios from 'axios';

const CreateAuction = ({ products }) => {
  const [auctionProductId, setAuctionProductId] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [endTime, setEndTime] = useState(''); // New state for auction end time
  const [newAuctionError, setNewAuctionError] = useState(null);
  const token = localStorage.getItem('token');  // Ensure we get the token

  // Handle auction creation
  const handleCreateAuction = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'https://farm-bid-3998c30f5108.herokuapp.com/api/auctions/create',
        {
          productId: auctionProductId,
          startingBid,
          endTime,  // Pass the end time to the back-end
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Ensure the token is passed in the header
          },
        }
      );

      // Reset form fields and error
      setAuctionProductId('');
      setStartingBid('');
      setEndTime('');  // Reset end time
      setNewAuctionError(null);
      alert('Auction created successfully!');
    } catch (error) {
      console.error('Error creating auction:', error);
      setNewAuctionError('Error creating auction. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Create New Auction</h2>
      <form onSubmit={handleCreateAuction} className="form-group">
        <select
          className="form-control mb-3"
          value={auctionProductId}
          onChange={(e) => setAuctionProductId(e.target.value)}
          required
        >
          <option value="">Select a Product</option>
          {products.map(product => (
            <option key={product._id} value={product._id}>
              {product.title}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="form-control mb-3"
          value={startingBid}
          onChange={(e) => setStartingBid(e.target.value)}
          placeholder="Starting Bid"
          required
        />
        <input
          type="datetime-local"
          className="form-control mb-3"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">Create Auction</button>
        {newAuctionError && <p className="text-danger mt-3">{newAuctionError}</p>}
      </form>
    </div>
  );
  
};

export default CreateAuction;
