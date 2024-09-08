import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [newProduct, setNewProduct] = useState({ title: '', description: '' });
  const [auctionProductId, setAuctionProductId] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [newAuctionError, setNewAuctionError] = useState(null);
  const token = localStorage.getItem('token');

  // Fetch farmer's products and auctions
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

  // Handle product creation with added logging
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    // Log when the button is clicked
    console.log('Create Product button clicked');

    // Log the product details
    console.log('New Product Details:', newProduct);

    try {
      const response = await axios.post('/api/products', newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Log the response from the server
      console.log('Product created successfully:', response.data);

      setProducts([...products, response.data]); // Update product list
      setNewProduct({ title: '', description: '' }); // Clear form fields
    } catch (error) {
      // Log any errors that occur
      console.error('Error creating product:', error);
      alert('Error creating product. Please try again.'); // Show alert for error
    }
  };

  // Handle auction creation
  const handleCreateAuction = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auctions/create', {
        productId: auctionProductId,
        startingBid,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAuctions([...auctions, response.data]);
      setAuctionProductId('');
      setStartingBid('');
      setNewAuctionError(null);
    } catch (error) {
      console.error('Error creating auction:', error);
      setNewAuctionError('Error creating auction. Please try again.');
    }
  };

  return (
    <div className="farmer-dashboard">
      <h2>My Products</h2>
      <ul>
        {products.map(product => (
          <li key={product._id}>{product.title}</li>
        ))}
      </ul>

      <h2>Create New Product</h2>
      <form onSubmit={handleCreateProduct}>
        <input
          type="text"
          name="title"
          value={newProduct.title}
          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
          placeholder="Title"
          required
        />
        <textarea
          name="description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          placeholder="Description"
          required
        />
        <button type="submit">Create Product</button>
      </form>

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
        <button type="submit">Create Auction</button>
        {newAuctionError && <p className="error">{newAuctionError}</p>}
      </form>
    </div>
  );
};

export default FarmerDashboard;
