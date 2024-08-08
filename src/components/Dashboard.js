// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const productResponse = await axios.get('/user/products');
      const bidResponse = await axios.get('/user/bids');
      setProducts(productResponse.data);
      setBids(bidResponse.data);
    };
    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1>My Dashboard</h1>
      <h2>My Products</h2>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
        </div>
      ))}
      <h2>My Bids</h2>
      {bids.map(bid => (
        <div key={bid.id}>
          <h3>Bid on {bid.product.title}: ${bid.amount}</h3>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
