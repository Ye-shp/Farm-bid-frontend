import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateAuction from './CreateAuction'; // Import the dedicated auction component
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [newProduct, setNewProduct] = useState({ title: '', description: '', image: null });
  const token = localStorage.getItem('token');

  // Fetch farmer's products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get('http://localhost:5000/api/products/farmer-products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(productResponse.data);
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

  return (
    <div className="farmer-dashboard">
      <h2>My Products</h2>
      <ul>
        {products.map(product => (
          <li key={product._id}>
            {product.imageUrl && <img src={product.imageUrl} width="100" />}    
            {product.title}    
            {product.description}
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

      {/* Include the dedicated auction creation component */}
      <CreateAuction products={products} />
    </div>
  );
};

export default FarmerDashboard;
