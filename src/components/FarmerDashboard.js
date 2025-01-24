import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, CloudUpload as UploadIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productCategories, setProductCategories] = useState([]);
  const navigate = useNavigate();
  const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com';

  // Product state
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    customCategory: '',
    customSubcategory: '',
    image: null,
    previewUrl: null
  });

  // Auction state
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);
  const [newAuction, setNewAuction] = useState({
    product: '',
    startingPrice: '',
    endTime: ''
  });

  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    if (!socket) {
      console.log('Socket not available for notifications');
      return;
    }

    console.log('Setting up notification listener');
    const handleNewNotification = (notification) => {
      console.log('Received new notification:', notification);
      setNotifications(prev => {
        // Check if notification already exists
        const exists = prev.some(n => n._id === notification._id);
        if (exists) {
          return prev.map(n => n._id === notification._id ? notification : n);
        }
        // Add new notification and update unread count
        setUnreadCount(count => count + 1);
        showSnackbar(notification.message, 'info');
        return [notification, ...prev];
      });
    };

    socket.on('newNotification', handleNewNotification);

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        console.log('Fetching initial notifications');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Initial notifications:', response.data);
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        showSnackbar('Error fetching notifications', 'error');
      }
    };

    fetchNotifications();

    return () => {
      console.log('Cleaning up notification listener');
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, API_URL]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch product categories
        const categoriesResponse = await axios.get(
          `${API_URL}/api/products/categories`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProductCategories(categoriesResponse.data);

        // Fetch farmer's products
        const productsResponse = await axios.get(
          `${API_URL}/api/products/farmer-products`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(productsResponse.data);

        // Fetch farmer's auctions
        const auctionsResponse = await axios.get(
          `${API_URL}/api/auctions/farmer-auctions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAuctions(auctionsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [socket, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({
        ...newProduct,
        image: file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('description', newProduct.description);

      // Handle category
      const categoryToSend = newProduct.category === 'custom' 
        ? newProduct.customCategory 
        : newProduct.category;
      formData.append('category', categoryToSend);

      // Handle title/subcategory
      if (newProduct.subcategory === 'custom') {
        formData.append('customProduct', newProduct.customSubcategory);
      } else {
        formData.append('title', newProduct.subcategory);
      }

      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }

      const response = await axios.post(
        `${API_URL}/api/products`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setProducts([...products, response.data]);
      setNewProduct({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        customCategory: '',
        customSubcategory: '',
        image: null,
        previewUrl: null,
      });
      setError(null);
    } catch (err) {
      setError('Failed to create product. Please try again.');
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/api/auctions/create`,
        {
          productId: newAuction.product,
          startingPrice: parseFloat(newAuction.startingPrice),
          endTime: new Date(newAuction.endTime).toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setAuctions([...auctions, response.data]);
      setShowAuctionDialog(false);
      setNewAuction({
        product: '',
        startingPrice: '',
        endTime: ''
      });
    } catch (error) {
      setError('Failed to create auction. Please try again.');
      console.error('Error creating auction:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(count => count - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Products Section */}
      <Typography variant="h4" gutterBottom>
        My Products
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Card sx={{ p: 3 }}>
          <form onSubmit={handleCreateProduct}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      category: e.target.value,
                      subcategory: '',
                      customCategory: '',
                      customSubcategory: ''
                    })}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {Object.keys(productCategories).map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom">Other (Custom Category)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {newProduct.category === 'custom' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Custom Category"
                    value={newProduct.customCategory}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      customCategory: e.target.value
                    })}
                    required
                  />
                </Grid>
              )}

              {newProduct.category && newProduct.category !== 'custom' && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Subcategory</InputLabel>
                    <Select
                      value={newProduct.subcategory}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        subcategory: e.target.value,
                        customSubcategory: ''
                      })}
                    >
                      <MenuItem value="">Select Subcategory</MenuItem>
                      {productCategories[newProduct.category]?.map((subcategory) => (
                        <MenuItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </MenuItem>
                      ))}
                      <MenuItem value="custom">Other (Custom Subcategory)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {newProduct.subcategory === 'custom' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Custom Subcategory"
                    value={newProduct.customSubcategory}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      customSubcategory: e.target.value
                    })}
                    required
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({
                    ...newProduct,
                    description: e.target.value
                  })}
                  required
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    hidden
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  {newProduct.previewUrl ? (
                    <Box>
                      <img
                        src={newProduct.previewUrl}
                        alt="Preview"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Click to change image
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <UploadIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                      <Typography>Drop an image or click to upload</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {loading ? 'Creating Product...' : 'Create Product'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {product.title || product.customProduct}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {product.category}
                  </Typography>
                  <Typography variant="body2">
                    {product.description}
                  </Typography>
                  {product.imageUrl && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Auctions Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            My Auctions
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowAuctionDialog(true)}
          >
            Create Auction
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<NotificationsIcon />}
            onClick={() => setShowNotifications(true)}
          >
            Notifications ({unreadCount})
          </Button>
        </Box>

        <Grid container spacing={3}>
          {auctions.map((auction) => (
            <Grid item xs={12} sm={6} md={4} key={auction._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {auction.product.title || auction.product.customProduct}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Quantity: {auction.quantity} units
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Starting Price: ${auction.startingPrice}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Current Bid: ${auction.currentPrice || auction.startingPrice}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Status: {auction.status}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/auctions/${auction._id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Create Auction Dialog */}
      <Dialog open={showAuctionDialog} onClose={() => setShowAuctionDialog(false)}>
        <DialogTitle>Create New Auction</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Product</InputLabel>
            <Select
              value={newAuction.product}
              onChange={(e) => setNewAuction({ ...newAuction, product: e.target.value })}
            >
              {products.map((product) => (
                <MenuItem key={product._id} value={product._id}>
                  {product.title || product.customProduct}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Starting Price"
            type="number"
            fullWidth
            value={newAuction.startingPrice}
            onChange={(e) => setNewAuction({ ...newAuction, startingPrice: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
          <TextField
            margin="dense"
            label="End Time"
            type="datetime-local"
            fullWidth
            value={newAuction.endTime}
            onChange={(e) => setNewAuction({ ...newAuction, endTime: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
              max: new Date(Date.now() + 7 * 24 * 3600000).toISOString().slice(0, 16)
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAuctionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateAuction}
            disabled={!newAuction.product || !newAuction.startingPrice || !newAuction.endTime}
          >
            Create Auction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onClose={() => setShowNotifications(false)}>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent>
          {notifications.map((notification) => (
            <Box key={notification._id} sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                {notification.message}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {notification.createdAt}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleMarkAsRead(notification._id)}
              >
                Mark as Read
              </Button>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotifications(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Box>
  );
};

export default FarmerDashboard;