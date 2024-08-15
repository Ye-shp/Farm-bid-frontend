// src/components/CreateAuction.js
import React, { useState } from 'react';
import { createAuction } from '../Services/api';

const CreateAuction = () => {
  const [productId, setProductId] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    try {
      const response = await createAuction({ productId, startingPrice, endTime });
      setMessage('Auction created successfully!');
    } catch (error) {
      setMessage('Error creating auction');
    }
  };

  return (
    <div>
      <h2>Create Auction</h2>
      <form onSubmit={handleCreateAuction}>
        <input
          type="text"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Starting Price"
          value={startingPrice}
          onChange={(e) => setStartingPrice(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          placeholder="End Time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <button type="submit">Create Auction</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateAuction;
