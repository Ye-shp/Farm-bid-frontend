import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
} from '@mui/material';

const SearchBar = ({ onSearchResults }) => {
  const [productCategories, setProductCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [wholesale, setWholesale] = useState(false);
  const [searchRadius, setSearchRadius] = useState(25);
  const [searchAnywhere, setSearchAnywhere] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}api/products/categories`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && typeof response.data === 'object') {
          setProductCategories(response.data);
        } else {
          console.error('Invalid data format received:', response.data);
          setError('Received invalid data format from server');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.response?.data?.error || 'Failed to load categories and products. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    setSelectedProduct(''); // Reset product when category changes
  };

  const handleSearch = async () => {
    try {
      setError('');
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        ...(selectedProduct && { product: selectedProduct }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(delivery !== null && { delivery: delivery.toString() }),
        ...(wholesale !== null && { wholesale: wholesale.toString() }),
        ...(searchAnywhere ? { searchAnywhere: 'true' } : { searchRadius: searchRadius.toString() }),
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}api/search/farms?${queryParams}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      onSearchResults(response.data);
    } catch (err) {
      console.error('Error during search:', err);
      setError(err.response?.data?.error || 'Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedCategory('');
    setSelectedProduct('');
    setDelivery(false);
    setWholesale(false);
    setSearchRadius(25);
    setSearchAnywhere(true);
    onSearchResults([]);
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search Farms
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {Object.keys(productCategories).map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="product-select-label">Product</InputLabel>
            <Select
              labelId="product-select-label"
              id="product-select"
              value={selectedProduct}
              label="Product"
              onChange={(e) => setSelectedProduct(e.target.value)}
              disabled={!selectedCategory} // Disable if no category is selected
            >
              <MenuItem value="">
                <em>All Products</em>
              </MenuItem>
              {selectedCategory && productCategories[selectedCategory]?.map((product) => (
                <MenuItem key={product} value={product}>
                  {product}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={delivery}
                  onChange={(e) => setDelivery(e.target.checked)}
                />
              }
              label="Delivery Available"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={wholesale}
                  onChange={(e) => setWholesale(e.target.checked)}
                />
              }
              label="Wholesale Available"
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={searchAnywhere}
                  onChange={(e) => setSearchAnywhere(e.target.checked)}
                />
              }
              label="Search Anywhere"
            />
            {!searchAnywhere && (
              <Typography variant="body2">
                (or select a search radius below)
              </Typography>
            )}
          </Box>
          {!searchAnywhere && (
            <Box sx={{ px: 2, maxWidth: 300 }}>
              <Typography variant="subtitle1" gutterBottom>
                Search Radius
              </Typography>
              <Slider
                value={searchRadius}
                onChange={(_, newValue) => setSearchRadius(newValue)}
                min={5}
                max={100}
                step={5}
                marks={[
                  { value: 5, label: '5mi' },
                  { value: 25, label: '25mi' },
                  { value: 50, label: '50mi' },
                  { value: 100, label: '100mi' },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value} miles`}
                disabled={searchAnywhere}
              />
            </Box>
          )}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Search'
              )}
            </Button>
            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </Button>
          </Box>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default SearchBar;