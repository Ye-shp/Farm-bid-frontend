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
  Paper,
  CircularProgress,
  Fade,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { makeStyles } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: theme.shadows[6],
  },
  border: '1px solid',
  borderColor: theme.palette.grey[300],
}));

const ProductList = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://farm-bid-3998c30f5108.herokuapp.com/api/products/farmer-products');
        setProducts(response.data);
      } catch (error) {
        setError('Failed to fetch products. Please check your connection and try again.');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
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
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={150} />
                  <Box sx={{ pt: 2 }}>
                    <Skeleton width="70%" />
                    <Skeleton width="50%" />
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
              onClick={() => window.location.reload()}
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
    <Fade in timeout={1000}>
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
                backgroundColor: theme.palette.primary.main,
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
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <StyledCard>
                  {product.imageUrl ? (
                    <Box
                      component="img"
                      src={product.imageUrl}
                      alt={product.title}
                      sx={{
                        height: 200,
                        objectFit: 'cover',
                        width: '100%',
                      }}
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
                      to={`/product/${product._id}`}
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
    </Fade>
  );
};

export default ProductList;
