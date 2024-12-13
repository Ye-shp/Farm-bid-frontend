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
} from '@mui/material';
import { Add as AddIcon, CloudUpload as UploadIcon } from '@mui/icons-material';

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
    quantity: '',
    startingPrice: '',
    minIncrement: '',
    duration: 24,
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

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
        `${API_URL}/api/products/my-products`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(productsResponse.data);

      // Fetch farmer's auctions
      const auctionsResponse = await axios.get(
        `${API_URL}/api/auctions/my-auctions`,
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
        `${API_URL}/api/auctions`,
        newAuction,
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
        quantity: '',
        startingPrice: '',
        minIncrement: '',
        duration: 24,
        description: ''
      });
    } catch (error) {
      setError('Failed to create auction. Please try again.');
      console.error('Error creating auction:', error);
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
            label="Quantity"
            type="number"
            fullWidth
            value={newAuction.quantity}
            onChange={(e) => setNewAuction({ ...newAuction, quantity: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Starting Price"
            type="number"
            fullWidth
            value={newAuction.startingPrice}
            onChange={(e) => setNewAuction({ ...newAuction, startingPrice: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Minimum Bid Increment"
            type="number"
            fullWidth
            value={newAuction.minIncrement}
            onChange={(e) => setNewAuction({ ...newAuction, minIncrement: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Duration (hours)"
            type="number"
            fullWidth
            value={newAuction.duration}
            onChange={(e) => setNewAuction({ ...newAuction, duration: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={newAuction.description}
            onChange={(e) => setNewAuction({ ...newAuction, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAuctionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateAuction}
            disabled={!newAuction.product || !newAuction.quantity || !newAuction.startingPrice}
          >
            Create Auction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FarmerDashboard;