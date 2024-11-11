// src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Skeleton,
  Alert,
  IconButton,
  Link,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://farm-bid-3998c30f5108.herokuapp.com/api/products/farmer-products');
      setProducts(response.data);
    } catch (error) {
      setError('Failed to fetch products. Please try again later.');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Loading skeletons
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Products
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={118} />
                  <Box sx={{ pt: 2 }}>
                    <Skeleton width="60%" />
                    <Skeleton />
                    <Skeleton width="80%" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={fetchProducts}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{
            fontWeight: 'bold',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: 0,
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
              borderRadius: '2px',
            }
          }}
        >
          Products
        </Typography>
      </Box>

      {products.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No products available at the moment.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {products.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="h3"
                    sx={{ 
                      fontWeight: 'medium',
                      minHeight: '64px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {product.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      minHeight: '60px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {product.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={RouterLink} 
                    to={`/product/${product.id}`}
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                    sx={{ ml: 'auto' }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProductList;