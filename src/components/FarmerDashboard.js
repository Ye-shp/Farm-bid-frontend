// src/components/FarmerDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [newProduct, setNewProduct] = useState({ title: '', description: '' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get('/api/products/farmer-products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(productResponse.data);
        const auctionResponse = await axios.get('/api/auctions/farmer-auctions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuctions(auctionResponse.data);
      } catch (error) {
        console.error('Error fetching farmer data:', error);
      }
    };

    fetchData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/products', newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts([...products, response.data]);
      setNewProduct({ title: '', description: '' });
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <div className="farmer-dashboard">
      <h2>My Products</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.title}</li>
        ))}
      </ul>
      <h2>My Auctions</h2>
      <ul>
        {auctions.map(auction => (
          <li key={auction.id}>{auction.title}</li>
        ))}
      </ul>
      <h2>Create New Product</h2>
      <form onSubmit={handleCreateProduct}>
        <input
          type="text"
          name="title"
          value={newProduct.title}
          onChange={handleInputChange}
          placeholder="Title"
          required
        />
        <textarea
          name="description"
          value={newProduct.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
        />
        <button type="submit">Create Product</button>
      </form>
    </div>
  );
};

export default FarmerDashboard;
