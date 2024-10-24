import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateAuction from './CreateAuction'; // dedicated auction component
import '../Styles/FarmerDashboard.css';

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [newProduct, setNewProduct] = useState({ title: '', description: '', image: null });
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');

  // Fetch farmer's products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get('https://farm-bid-3998c30f5108.herokuapp.com/api/products/farmer-products', {
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
      const response = await axios.post('https://farm-bid-3998c30f5108.herokuapp.com/api/products', formData, {
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

    // Notifications
    useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get('https://farm-bid-3998c30f5108.herokuapp.com/api/notifications', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNotifications(response.data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
  
      fetchNotifications();
    }, [token]);

    return (
      <div className="container mt-5">
        <h2 className="text-center mb-4">My Products</h2>
        {/* Notifications Bell */}
        <div className="notifications-bell">
          <h4>Notifications</h4>
          <ul>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <li key={notification._id}>{notification.message}</li>
              ))
            ) : (
              <li>No new notifications</li>
            )}
          </ul>
        </div>
        
        {/* Products Section */}
        <div className="row mt-5">
          {products.map((product) => (
            <div className="col-md-6 mb-4" key={product._id}>
              <div className="card">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    className="card-img-top"
                    alt={product.title}
                  />
                )}
                <div className="card-body">
                  <h4 className="card-title">{product.title}</h4>
                  <p className="card-text">{product.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
    
        {/* Create Product Section */}
        <h2 className="text-center mb-4">Create New Product</h2>
        <form onSubmit={handleCreateProduct} className="mb-5">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="title"
              value={newProduct.title}
              onChange={(e) =>
                setNewProduct({ ...newProduct, title: e.target.value })
              }
              placeholder="Title"
              required
            />
          </div>
          <div className="mb-3">
            <textarea
              className="form-control"
              name="description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              placeholder="Description"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              name="image"
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.files[0] })
              }
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Create Product
          </button>
        </form>
    
        <CreateAuction products={products} />
      </div>
    );
  
};

export default FarmerDashboard;
