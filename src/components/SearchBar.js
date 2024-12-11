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
  TextField,
  Typography,
} from '@mui/material';

const SearchBar = () => {
  const [allowedProducts, setAllowedProducts] = useState([]);
  const [allowedCategories, setAllowedCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [wholesale, setWholesale] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');   
  const [radius, setRadius] = useState(50);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllowedData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get('/api/products/allowed-products'),
          axios.get('/api/products/allowed-categories'),
        ]);

        setAllowedProducts(productsRes.data);
        setAllowedCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching allowed products or categories:', err);
        setError('Failed to load products or categories.');
      }
    };

    fetchAllowedData();
  }, []);

  const handleSearch = async () => {
    try {
      setError('');
      const queryParams = new URLSearchParams({
        product: selectedProduct,
        category: selectedCategory,
        delivery: delivery.toString(),
        wholesale: wholesale.toString(),
        latitude,
        longitude,
        radius,
      });

      const response = await axios.get(`/api/search/farms?${queryParams}`);
      setResults(response.data);
    } catch (err) {
      console.error('Error during search:', err);
      setError('Failed to fetch results. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Search Farms
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
        <FormControl fullWidth>
          <InputLabel id="product-select-label">Product</InputLabel>
          <Select
            labelId="product-select-label"
            id="product-select"
            value={selectedProduct}
            label="Product"
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {allowedProducts.map((product) => (
              <MenuItem key={product} value={product}>
                {product}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {allowedCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

        {/* Latitude */}
        <TextField
          label="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          fullWidth
        />

        {/* Longitude */}
        <TextField
          label="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          fullWidth
        />

        {/* Radius */}
        <TextField
          label="Radius (km)"
          type="number"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          fullWidth
        />

        {/* Search Button */}
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {error && (
        <Typography variant="body1" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Results:
        </Typography>
        {results.length === 0 && <Typography>No results found.</Typography>}
        {results.map((result) => (
          <Box key={result._id} sx={{ mb: 2, p: 2, border: '1px solid #ccc' }}>
            <Typography variant="h6">{result.title || result.customProduct}</Typography>
            <Typography>{result.user.name}</Typography>
            <Typography>
              Location: {result.user.location.latitude}, {result.user.location.longitude}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SearchBar;
