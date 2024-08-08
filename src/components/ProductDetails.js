// src/components/ProductDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductDetails = ({ match }) => {
  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await axios.get(`/api/products/${match.params.id}`);
      setProduct(response.data);
    };
    fetchProduct();
  }, [match.params.id]);

  const handleBid = async () => {
    await axios.post(`/api/products/${match.params.id}/bids`, { amount: bidAmount });
    // Handle bid success
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <input
        type="number"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Enter your bid"
      />
      <button onClick={handleBid}>Place Bid</button>
    </div>
  );
};

export default ProductDetails;
