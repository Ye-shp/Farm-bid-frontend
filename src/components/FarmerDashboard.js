import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  TextField,
  Button,
  Divider,
  Grid,
  Box,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Fade,
  Container,
} from '@mui/material';

import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  LocationOn as LocationIcon,
  Image as ImageIcon,
  category
} from '@mui/icons-material';
import axios from 'axios';
import CreateAuction from './CreateAuction';

const FarmerDashboard = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const token = localStorage.getItem('token');
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

  // Fetch farmer's products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch product categories
        const categoriesResponse = await axios.get(
          'https://farm-bid-3998c30f5108.herokuapp.com/api/products/categories',
          {
            headers:{
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProductCategories(categoriesResponse.data);

        // Fetch farmer's products
        const productResponse = await axios.get(
          'https://farm-bid-3998c30f5108.herokuapp.com/api/products/farmer-products',
          {
            headers: {
               Authorization: `Bearer ${token}`,
               },
          }
        );
        setProducts(productResponse.data);

        setError(null);
      } catch (err) {
        setError('Failed to load products or categories. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Fetch location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ipinfo.io/json?token=80139ee7708eb3');
        const [lat, lng] = response.data.loc.split(',');
        setLocation({
          latitude: lat,
          longitude: lng,
          city: response.data.city,
          region: response.data.region
        });
      } catch (err) {
        console.error('Error fetching location:', err);
      }
    };

    fetchLocation();
  }, []);

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
    setUploadProgress(true);
  
    const formData = new FormData();
    formData.append('description', newProduct.description);
  
    // Determine the category to send
    const categoryToSend =
      newProduct.category === 'custom' ? newProduct.customCategory : newProduct.category;
    formData.append('category', categoryToSend);
  
    // Determine the title or customProduct to send
    if (newProduct.subcategory === 'custom') {
      formData.append('customProduct', newProduct.customSubcategory);
    } else {
      formData.append('title', newProduct.subcategory);
    }
  
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }
  
    try {
      const response = await axios.post(
        'https://farm-bid-3998c30f5108.herokuapp.com/api/products',
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
      setUploadProgress(false);
    }
  };


  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={1000}>
        <Box>
          {/* Header Section */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Farmer Dashboard
            </Typography>
            {location && (
              <Box display="flex" alignItems="center" gap={1}>
                <LocationIcon />
                <Typography variant="subtitle1">
                  {location.city}, {location.region}
                </Typography>
              </Box>
            )}
          </Paper>
  
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 4 }}
              action={
                <Button color="inherit" size="small" onClick={() => setError(null)}>
                  DISMISS
                </Button>
              }
            >
              {error}
            </Alert>
          )}
  
          {/* Create Product Section */}
          <Paper
            elevation={0}
            sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'grey.200' }}
          >
            <Typography variant="h5" gutterBottom>
              Add New Product
            </Typography>
            <Divider sx={{ mb: 3 }} />
  
            <form onSubmit={handleCreateProduct}>
              <Grid container spacing={3}>
                {/* Category Selector */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                          subcategory: '',
                          customCategory: '',
                          customSubcategory: '',
                        })
                      }
                    >
                      <MenuItem value="">
                        <em>Select Category</em>
                      </MenuItem>
                      {Object.keys(productCategories).map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                      <MenuItem value="custom">Other (Enter Custom Category)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
  
                {/* Custom Category Input */}
                {newProduct.category === 'custom' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Custom Category"
                      value={newProduct.customCategory}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, customCategory: e.target.value })
                      }
                      required
                      variant="outlined"
                    />
                  </Grid>
                )}
  
                {/* Subcategory Selector */}
                {newProduct.category && newProduct.category !== 'custom' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined" required>
                      <InputLabel>Subcategory</InputLabel>
                      <Select
                        label="Subcategory"
                        value={newProduct.subcategory}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            subcategory: e.target.value,
                            customSubcategory: '',
                          })
                        }
                      >
                        <MenuItem value="">
                          <em>Select Subcategory</em>
                        </MenuItem>
                        {productCategories[newProduct.category]?.map((subcategory) => (
                          <MenuItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </MenuItem>
                        ))}
                        <MenuItem value="custom">Other (Enter Custom Subcategory)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
  
                {/* Custom Subcategory Input */}
                {newProduct.subcategory === 'custom' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Custom Subcategory"
                      value={newProduct.customSubcategory}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, customSubcategory: e.target.value })
                      }
                      required
                      variant="outlined"
                    />
                  </Grid>
                )}
  
                {/* Description Input */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, description: e.target.value })
                    }
                    required
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                </Grid>
  
                {/* Image Upload */}
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
  
                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={uploadProgress}
                    startIcon={
                      uploadProgress ? <CircularProgress size={20} /> : <AddIcon />
                    }
                  >
                    {uploadProgress ? 'Creating Product...' : 'Create Product'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
  
          {/* Products Grid */}
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            My Products ({products.length})
          </Typography>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  {product.imageUrl ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.imageUrl}
                      alt={product.title || product.customProduct}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {product.title || product.customProduct}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
  
          {/* Auctions Section */}
          <Box sx={{ mt: 6 }}>
            <CreateAuction products={products} />
          </Box>
        </Box>
      </Fade>
    </Container>
  );  
};

export default FarmerDashboard;