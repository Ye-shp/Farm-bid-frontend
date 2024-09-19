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
        'http://localhost:5000/api/auctions/create',
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
    <div>
      <h2>Create New Auction</h2>
      <form onSubmit={handleCreateAuction}>
        <select
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
          value={startingBid}
          onChange={(e) => setStartingBid(e.target.value)}
          placeholder="Starting Bid"
          required
        />
        <input
          type="datetime-local"  // New input for end time
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="End Time"
          required
        />
        <button type="submit">Create Auction</button>
        {newAuctionError && <p className="error">{newAuctionError}</p>}
      </form>
    </div>
  );
};

export default CreateAuction;
