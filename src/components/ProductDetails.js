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
  Chip,
  Stack,
  Paper,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

// Add these helper functions at the top of the file
const formatSeasonalAvailability = (seasons) => {
  if (!Array.isArray(seasons)) return 'Not specified';
  const availableMonths = seasons
    .filter(s => s.available)
    .map(s => s.month)
    .sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a) - months.indexOf(b);
    });
  return availableMonths.join(', ') || 'Not available';
};

const formatStorageRequirements = (storage) => {
  if (!storage) return 'Not specified';
  const temp = storage.temperature;
  const humidity = storage.humidity;
  const requirements = [];

  if (temp && (temp.min || temp.max)) {
    const tempRange = `Temperature: ${temp.min || '?'}°C to ${temp.max || '?'}°C`;
    requirements.push(tempRange);
  }

  if (humidity && (humidity.min || humidity.max)) {
    const humidityRange = `Humidity: ${humidity.min || '?'}% to ${humidity.max || '?'}%`;
    requirements.push(humidityRange);
  }

  return requirements.length ? requirements.join(' | ') : 'Not specified';
};

const formatShelfLife = (shelfLife) => {
  if (!shelfLife || !shelfLife.duration) return 'Not specified';
  return `${shelfLife.duration} ${shelfLife.unit}`;
};

const formatCertifications = (certifications) => {
  if (!certifications) return [];
  
  const certs = [];
  if (certifications.organic?.isCertified) {
    certs.push({
      label: 'Organic Certified',
      details: `by ${certifications.organic.certifyingBody || 'Unknown Body'}`
    });
  }
  
  if (certifications.foodSafety?.length > 0) {
    certifications.foodSafety.forEach(cert => {
      certs.push({
        label: cert.certificationType,
        details: `Score: ${cert.auditScore || 'N/A'}`
      });
    });
  }

  return certs;
};

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

  const renderSpecifications = (specs) => {
    if (!specs) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="primary" gutterBottom>
          Product Specifications
        </Typography>
        <Grid container spacing={2}>
          {/* Varieties */}
          {specs.varieties?.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Varieties</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {specs.varieties.map((variety, index) => (
                    <Chip
                      key={index}
                      label={variety}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            </Grid>
          )}

          {/* Grade Standard */}
          {specs.gradeStandard && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Grade Standard</Typography>
                <Typography variant="body2">{specs.gradeStandard}</Typography>
              </Box>
            </Grid>
          )}

          {/* Seasonal Availability */}
          <Grid item xs={12}>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Seasonal Availability</Typography>
              <Typography variant="body2">
                {formatSeasonalAvailability(specs.seasonalAvailability)}
              </Typography>
            </Box>
          </Grid>

          {/* Shelf Life */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Shelf Life</Typography>
              <Typography variant="body2">
                {formatShelfLife(specs.shelfLife)}
              </Typography>
            </Box>
          </Grid>

          {/* Storage Requirements */}
          <Grid item xs={12}>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Storage Requirements</Typography>
              <Typography variant="body2">
                {formatStorageRequirements(specs.storageRequirements)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderCertifications = (certifications) => {
    const formattedCerts = formatCertifications(certifications);
    
    return formattedCerts.length > 0 ? (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="primary" gutterBottom>
          Certifications
        </Typography>
        <Stack spacing={2}>
          {formattedCerts.map((cert, index) => (
            <Box key={index} sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2">{cert.label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {cert.details}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    ) : null;
  };

  const renderProductionPractices = (practices) => {
    if (!practices) return null;

    const practiceItems = [
      { label: 'Growing Method', value: practices.growingMethod },
      { label: 'Pest Management', value: practices.pestManagement },
      { label: 'Post-Harvest Handling', value: practices.postHarvestHandling },
      { label: 'Growing Conditions', value: practices.growingConditions }
    ].filter(item => item.value);

    return practiceItems.length > 0 ? (
      <Box>
        <Typography variant="subtitle1" color="primary" gutterBottom>
          Production Practices
        </Typography>
        <Grid container spacing={2}>
          {practiceItems.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>{item.label}</Typography>
                <Typography variant="body2">{item.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    ) : null;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* Header Section */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Product Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Chip
                  icon={<CategoryIcon />}
                  label={product.category}
                  color="primary"
                  sx={{ mr: 1 }}
                />
              </Grid>
              <Grid item>
                <Chip
                  label={product.stockStatus}
                  color={product.totalQuantity > 0 ? "success" : "error"}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={4}>
            {/* Left Column - Image and Basic Details */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardMedia
                  component="img"
                  height="400"
                  image={product.imageUrl || '/placeholder-product.jpg'}
                  alt={product.displayName}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {product.displayName}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(product.totalQuantity / 1000) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {`${product.totalQuantity} lbs available`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Updated: {new Date(product.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {product.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Technical Details */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Technical Specifications
                  </Typography>
                  
                  {renderSpecifications(product.technicalDetails?.specs)}
                  <Divider sx={{ my: 3 }} />
                  {renderCertifications(product.technicalDetails?.certifications)}
                  <Divider sx={{ my: 3 }} />
                  {renderProductionPractices(product.technicalDetails?.production)}

                  {/* Owner Actions */}
                  {product.isOwner && (
                    <Box sx={{ mt: 4 }}>
                      <Divider sx={{ mb: 3 }} />
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => navigate(`/products/${id}/inventory`)}
                        startIcon={<InventoryIcon />}
                        sx={{ height: 48 }}
                      >
                        Manage Inventory
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default ProductDetails;
