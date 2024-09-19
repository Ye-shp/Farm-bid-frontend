import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [newProduct, setNewProduct] = useState({ title: '', description: '', image: null });
  const [auctionProductId, setAuctionProductId] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [newAuctionError, setNewAuctionError] = useState(null);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const token = localStorage.getItem('token');

  // Fetch farmer's products and auctions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get('http://localhost:5000/api/products/farmer-products', {
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

  // Fetch location for farmer
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ipinfo.io/json?token=80139ee7708eb3'); // Replace with your actual token
        const loc = response.data.loc.split(',');
        setLocation({
          latitude: loc[0],
          longitude: loc[1]
        });
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, []);

  // Handle product creation with image upload
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    // Form data to handle image upload
    const formData = new FormData();
    formData.append('title', newProduct.title);
    formData.append('description', newProduct.description);
    if (newProduct.image) {
      formData.append('image', newProduct.image); // Append image to the form
    }

    try {
      const response = await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setProducts([...products, response.data]); // Update product list
      setNewProduct({ title: '', description: '', image: null }); // Reset form
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product. Please try again.');
    }
  };

  // Handle auction creation
  const handleCreateAuction = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://localhost:5000/api/auctions/create', {
        productId: auctionProductId,
        startingBid,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAuctions([...auctions, response.data]); // Update auction list
      setAuctionProductId(''); // Reset form fields
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
          <li key={product._id}>
            {product.imageUrl && <img src={product.imageUrl} alt={product.title} width="100" />}
            {product.title}
          </li>
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
        <input
          type="file"
          name="image"
          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
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

      <h2>My Auctions</h2>
      <ul>
        {auctions.map(auction => (
          <li key={auction._id}>
            Product: {auction.product.title} | Starting Bid: {auction.startingBid}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FarmerDashboard;
