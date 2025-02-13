// src/components/ProductDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  CardMedia,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import {
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Store as StoreIcon
} from '@mui/icons-material';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/products/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, navigate]);

  if (loading) return (
    <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Container>
  );

  if (error) return (
    <Container sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  if (!product) return (
    <Container sx={{ py: 4 }}>
      <Alert severity="info">Product not found</Alert>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {product.image ? (
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={product.image}
                alt={product.title}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          ) : (
            <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No image available
              </Typography>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.title}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Chip
                icon={<CategoryIcon />}
                label={`Category: ${product.category}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<StoreIcon />}
                label={`By: ${product.farmer?.name || 'Unknown Farmer'}`}
                color="secondary"
                variant="outlined"
              />
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon sx={{ mr: 1 }} />
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {product.description}
              </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/auctions')}
                fullWidth
              >
                View Available Auctions
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetails;
