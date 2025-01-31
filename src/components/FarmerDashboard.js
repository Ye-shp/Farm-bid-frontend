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
  Snackbar,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  IconButton,
  useTheme,
  AppBar,
  Toolbar,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Notifications as NotificationsIcon,
  LocalFlorist as ProductIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  PhotoCamera
} from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';
import { styled } from '@mui/material/styles';

const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  minHeight: '100vh',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const ImageUploadArea = styled('label')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: 16,
  padding: theme.spacing(4),
  cursor: 'pointer',
  backgroundColor: theme.palette.action.hover,
  transition: 'background-color 0.2s',
  minHeight: 200,
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const FarmerDashboard = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productCategories, setProductCategories] = useState([]);
  const navigate = useNavigate();
  const API_URL = 'https://farm-bid.onrender.com';

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

  // Auction dialog state
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);
  const [newAuction, setNewAuction] = useState({
    product: '',
    startingPrice: '',
    endTime: ''
  });

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const socket = useSocket();

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => {
        const exists = prev.some(n => n._id === notification._id);
        if (exists) return prev.map(n => n._id === notification._id ? notification : n);
        setUnreadCount(count => count + 1);
        showSnackbar(notification.message, 'info');
        return [notification, ...prev];
      });
    };

    socket.on('newNotification', handleNewNotification);

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        showSnackbar('Error fetching notifications', 'error');
      }
    };

    fetchNotifications();

    return () => {
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

        const categoriesResponse = await axios.get(
          `${API_URL}/api/products/categories`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProductCategories(categoriesResponse.data);

        const productsResponse = await axios.get(
          `${API_URL}/api/products/farmer-products`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(productsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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

      const categoryToSend = newProduct.category === 'custom' 
        ? newProduct.customCategory 
        : newProduct.category;
      formData.append('category', categoryToSend);

      if (newProduct.subcategory === 'custom') {
        formData.append('customProduct', newProduct.customSubcategory);
      } else {
        formData.append('title', newProduct.subcategory);
      }

      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }

      if (!newProduct.totalQuantity || isNaN(newProduct.totalQuantity)){
        showSnackbar('Please enter total amount available in pounds', 'error');
        setLoading(false);
        return ;
      }
      formData.append('totalQuantity', newProduct.totalQuantity);

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
        totalQuantity:'', 
        image: null,
        previewUrl: null,
      });
      showSnackbar('Product created successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to create product. Please try again.', 'error');
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
          endTime: new Date(newAuction.endTime).toISOString(), 
          auctionQuantity: parseFloat(newAuction.auctionQuantity)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setShowAuctionDialog(false);
      setNewAuction({ product: '', startingPrice: '', endTime: '',  auctionQuantity: ''});
      showSnackbar('Auction created successfully!', 'success');
    } catch (error) {
      showSnackbar('Failed to create auction. Please try again.', 'error');
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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress size={60} />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 4 }}>
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    </Box>
  );

  return (
    <DashboardContainer>
      <StyledAppBar position="static" color="inherit">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Notifications
          </Typography>
          <IconButton onClick={() => setShowNotifications(true)}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </StyledAppBar>

      <SectionHeader>
        <Box maxWidth="1200px" margin="auto">
          <Typography variant="h4" gutterBottom>
            <ProductIcon sx={{ verticalAlign: 'middle', mr: 2 }} />
            Agricultural Management Hub
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAuctionDialog(true)}
            sx={{ borderRadius: 2 }}
          >
            New Auction
          </Button>
        </Box>
      </SectionHeader>

      <Box maxWidth="1200px" margin="auto" p={4}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
          Product Inventory
        </Typography>

        {/* Product Creation Form */}
        <Paper elevation={0} sx={{ p: 4, mb: 6, borderRadius: 4 }}>
          <Stepper activeStep={0} alternativeLabel sx={{ mb: 6 }}>
            <Step><StepLabel>Product Details</StepLabel></Step>
            <Step><StepLabel>Quality Assurance</StepLabel></Step>
            <Step><StepLabel>Confirmation</StepLabel></Step>
          </Stepper>

          <form onSubmit={handleCreateProduct}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Product Category</InputLabel>
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
                    <MenuItem value="custom">Custom Category</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Quantity (lbs)"
                type="number"
                value={newProduct.totalQuantity}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  totalQuantity: e.target.value,
                })}
                required
              />
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
                      <MenuItem value="custom">Custom Subcategory</MenuItem>
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
                  label="Product Description"
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
                <ImageUploadArea>
                  <input
                    type="file"
                    hidden
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  {newProduct.previewUrl ? (
                    <Box textAlign="center">
                      <img
                        src={newProduct.previewUrl}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                      <Button
                        variant="text"
                        color="primary"
                        startIcon={<PhotoCamera />}
                        sx={{ mt: 2 }}
                      >
                        Change Image
                      </Button>
                    </Box>
                  ) : (
                    <Box textAlign="center">
                      <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Upload high-quality product photos
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Recommended size: 1200x800px
                      </Typography>
                    </Box>
                  )}
                </ImageUploadArea>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ height: 56, borderRadius: 2 }}
                  startIcon={loading ? <CircularProgress size={24} /> : <CheckIcon />}
                >
                  {loading ? 'Processing...' : 'Publish Product'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Product Grid */}
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <ProductCard>
                <CardContent>
                  {product.imageUrl && (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                      <Chip
                        label={product.category}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          backgroundColor: 'background.paper'
                        }}
                      />
                    </Box>
                  )}
                  <Typography variant="h6" gutterBottom>
                    {product.title || product.customProduct}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {product.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      Details
                    </Button>
                  </Box>
                </CardContent>
              </ProductCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Auction Creation Dialog */}
      <Dialog
        open={showAuctionDialog}
        onClose={() => setShowAuctionDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          Create New Auction
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Product</InputLabel>
            <Select
              value={newAuction.product}
              onChange={(e) => setNewAuction({ ...newAuction, product: e.target.value })}
            >
              {products.map((product) => (
                <MenuItem key={product._id} value={product._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        style={{ width: 40, height: 40, borderRadius: 4 }}
                      />
                    )}
                    {product.title || product.customProduct}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Starting Price"
            type="number"
            value={newAuction.startingPrice}
            onChange={(e) => setNewAuction({ ...newAuction, startingPrice: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start">$/Lbs</InputAdornment>,
            }}
            sx={{ mt: 3 }}
          />
          <TextField
            fullWidth
            label="Auction Quantity"
            type="number"
            value={newAuction.auctionQuantity}
            onChange={(e) => setNewAuction({ ...newAuction, auctionQuantity: e.target.value })}
            InputProps={{
              endAdornment: <InputAdornment position="end">Lbs</InputAdornment>,
            }}
            sx={{ mt: 3 }}
          />

          <TextField
            fullWidth
            label="Auction End Time"
            type="datetime-local"
            value={newAuction.endTime}
            onChange={(e) => setNewAuction({ ...newAuction, endTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
            }}
            sx={{ mt: 3 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setShowAuctionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAuction}
            disabled={!newAuction.product || !newAuction.startingPrice || !newAuction.endTime}
          >
            Launch Auction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog 
        open={showNotifications} 
        onClose={() => setShowNotifications(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 1 }} />
            Notifications
            <Chip 
              label={unreadCount} 
              color="error" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : theme.palette.action.selected,
                  borderRadius: 2,
                  mb: 1
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <NotificationsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.createdAt).toLocaleString()}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                <IconButton onClick={() => handleMarkAsRead(notification._id)}>
                  <CheckIcon color="action" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotifications(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: 2, boxShadow: theme.shadows[3] }}
          iconMapping={{
            success: <CheckIcon fontSize="inherit" />,
            error: <CloseIcon fontSize="inherit" />
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

export default FarmerDashboard;