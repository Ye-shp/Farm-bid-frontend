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
  LinearProgress,
  Badge,
  IconButton,
  useTheme,
  AppBar,
  Toolbar,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Checkbox,
  FormControlLabel,
  Autocomplete
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
  const [activeStep, setActiveStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productCategories, setProductCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [newProduct, setNewProduct] = useState({
    // Basic Info
    category: '',
    title: '',
    customProduct: '',
    totalQuantity: '',
    description: '',
    image: null,
    previewUrl: null,

    // Quality Assurance
    certifications: {
      organic: {
        isCertified: false,
        certifyingBody: '',
        certificationNumber: '',
        validFrom: '',
        validUntil: ''
      },
      foodSafety: [],
      otherCertifications: []
    },
    productSpecs: {
      varieties: [],
      gradeStandard: '',
      size: {
        min: '',
        max: '',
        unit: 'cm',
        packSize: {
          quantity: '',
          unit: 'kg'
        }
      },
      seasonalAvailability: [],
      shelfLife: {
        duration: '',
        unit: 'days'
      },
      storageRequirements: {
        temperature: {
          min: '',
          max: '',
          unit: '°C'
        },
        humidity: {
          min: '',
          max: ''
        }
      }
    },
    productionPractices: {
      growingMethod: 'Conventional',
      pestManagement: '',
      postHarvestHandling: '',
      waterTesting: [],
      fieldLocation: {
        type: 'Point',
        coordinates: [0, 0] // [longitude, latitude]
      },
      growingConditions: ''
    },
    liabilityAccepted: false
  });

  const [showAuctionDialog, setShowAuctionDialog] = useState(false);
  const [newAuction, setNewAuction] = useState({
    product: '',
    startingPrice: '',
    endTime: '',
    auctionQuantity: '',
    delivery: false
  });

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

    socket.on('notificationUpdate', handleNewNotification);

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/notifications`, {
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

  // edit this to show picture and more data
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
        const fetchProductDetails = async () => {
          try {
            const { data } = await axios.get(`/api/products/${productId}`);
            setProductDetails(data);
          } catch (err) {
            console.error('Error fetching product details:', err);
          }
        };
        const fetchAnalytics = async () => {
          try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`/api/products/${productId}/analytics`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(data);
          } catch (err) {
            console.error('Error fetching analytics:', err);
          }
        };

        setProducts(productsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, API_URL]);

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!newProduct.category || !newProduct.description ||
          !newProduct.image || !newProduct.totalQuantity) {
          showSnackbar('Please fill all required fields', 'error');
          return false;
        }
        return true;
      case 1:
        return true;
      case 2:
        if (!newProduct.liabilityAccepted) {
          showSnackbar('You must accept the liability agreement', 'error');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => prev - 1);
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
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Basic product info
      formData.append('category', newProduct.category);
      formData.append('totalQuantity', newProduct.totalQuantity);
      formData.append('description', newProduct.description);

      // Handle title/custom product
      if (newProduct.subcategory === 'custom') {
        formData.append('customProduct', newProduct.customSubcategory);
      } else {
        formData.append('title', newProduct.subcategory);
      }
      // Handle image
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }

      // Stringify complex objects
      formData.append('certifications', JSON.stringify(newProduct.certifications));
      formData.append('productSpecs', JSON.stringify(newProduct.productSpecs));
      formData.append('productionPractices', JSON.stringify({
        ...newProduct.productionPractices,
        fieldLocation: {
          type: 'Point',
          coordinates: newProduct.productionPractices.fieldLocation.coordinates
        }
      }));

      const response = await axios.post(`${API_URL}/api/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset state and handle success
      setNewProduct({ /* ...initial state */ });
      setActiveStep(0);
      showSnackbar('Product created successfully!', 'success');

    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err =>
          showSnackbar(err.msg, 'error')
        );
      } else {
        showSnackbar('Failed to create product', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = async () => {
    try {
      const token = localStorage.getItem('token');
      const delivery = document.getElementById('delivery-checkbox').checked;
      const response = await axios.post(
        `${API_URL}/api/auctions/create`,
        {
          productId: newAuction.product,
          startingPrice: parseFloat(newAuction.startingPrice),
          endTime: new Date(newAuction.endTime).toISOString(),
          auctionQuantity: parseFloat(newAuction.auctionQuantity),
          delivery: delivery,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setShowAuctionDialog(false);
      setNewAuction({ product: '', startingPrice: '', endTime: '', auctionQuantity: '', delivery: false });
      showSnackbar('Auction created successfully!', 'success');
    } catch (error) {
      showSnackbar('Failed to create auction. Please try again.', 'error');
      console.error('Error creating auction:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/notifications/${notificationId}/read`, null, {
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
            Farmer Dashboard
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
      {/* Product Creation Form */}
      <Box maxWidth="1200px" margin="auto" p={4}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
          List new Product
        </Typography>

        <Paper elevation={0} sx={{ p: 4, mb: 6, borderRadius: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
            <Step><StepLabel>Product Details</StepLabel></Step>
            <Step><StepLabel>Quality Assurance</StepLabel></Step>
            <Step><StepLabel>Confirmation</StepLabel></Step>
          </Stepper>

          <form onSubmit={handleCreateProduct}>
            {activeStep === 0 && (
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
              </Grid>
            )}

            {activeStep === 1 && (
              <Grid container spacing={4}>
                {/* Organic Certification */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newProduct.certifications.organic.isCertified}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            certifications: {
                              ...newProduct.certifications,
                              organic: {
                                ...newProduct.certifications.organic,
                                isCertified: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                    }
                    label="Organic Certified"
                  />
                </Grid>

                {newProduct.certifications.organic.isCertified && (
                  <Grid item xs={12} container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Certifying Body"
                        value={newProduct.certifications.organic.certifyingBody}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            certifications: {
                              ...newProduct.certifications,
                              organic: {
                                ...newProduct.certifications.organic,
                                certifyingBody: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Certification Number"
                        value={newProduct.certifications.organic.certificationNumber}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            certifications: {
                              ...newProduct.certifications,
                              organic: {
                                ...newProduct.certifications.organic,
                                certificationNumber: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </Grid>
                  </Grid>
                )}

                {/* Food Safety Certifications */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Food Safety Certifications
                  </Typography>
                  {newProduct.certifications.foodSafety.map((cert, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                      <Grid item xs={4}>
                        <FormControl fullWidth>
                          <InputLabel>Certification Type</InputLabel>
                          <Select
                            value={cert.certificationType}
                            onChange={(e) => {
                              const updated = [...newProduct.certifications.foodSafety];
                              updated[index].certificationType = e.target.value;
                              setNewProduct({
                                ...newProduct,
                                certifications: {
                                  ...newProduct.certifications,
                                  foodSafety: updated,
                                },
                              });
                            }}
                          >
                            <MenuItem value="GAP">GAP</MenuItem>
                            <MenuItem value="HACCP">HACCP</MenuItem>
                            <MenuItem value="FSMA">FSMA</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      {cert.certificationType === 'Other' && (
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            label="Other Certification"
                            value={cert.otherCertification}
                            onChange={(e) => {
                              const updated = [...newProduct.certifications.foodSafety];
                              updated[index].otherCertification = e.target.value;
                              setNewProduct({
                                ...newProduct,
                                certifications: {
                                  ...newProduct.certifications,
                                  foodSafety: updated,
                                },
                              });
                            }}
                          />
                        </Grid>
                      )}
                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          label="Audit Score"
                          type="number"
                          value={cert.auditScore}
                          onChange={(e) => {
                            const updated = [...newProduct.certifications.foodSafety];
                            updated[index].auditScore = e.target.value;
                            setNewProduct({
                              ...newProduct,
                              certifications: {
                                ...newProduct.certifications,
                                foodSafety: updated,
                              },
                            });
                          }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          onClick={() =>
                            setNewProduct({
                              ...newProduct,
                              certifications: {
                                ...newProduct.certifications,
                                foodSafety: newProduct.certifications.foodSafety.filter(
                                  (_, i) => i !== index
                                ),
                              },
                            })
                          }
                        >
                          <CloseIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setNewProduct({
                        ...newProduct,
                        certifications: {
                          ...newProduct.certifications,
                          foodSafety: [
                            ...newProduct.certifications.foodSafety,
                            {
                              certificationType: 'GAP',
                              otherCertification: '',
                              auditScore: '',
                              auditDate: '',
                              certifyingBody: '',
                            },
                          ],
                        },
                      })
                    }
                  >
                    Add Food Safety Certification
                  </Button>
                </Grid>

                {/* Product Specifications */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Product Specifications
                  </Typography>
                </Grid>

                {/* Varieties */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Varieties</InputLabel>
                    <Select
                      multiple
                      value={newProduct.productSpecs.varieties}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          productSpecs: {
                            ...newProduct.productSpecs,
                            varieties: e.target.value,
                          },
                        })
                      }
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {['Standard', 'Heirloom', 'Hybrid', 'Organic'].map((variety) => (
                        <MenuItem key={variety} value={variety}>
                          <Checkbox
                            checked={newProduct.productSpecs.varieties.includes(variety)}
                          />
                          <ListItemText primary={variety} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Size Specifications */}
                <Grid item xs={12} container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Min Size"
                      type="number"
                      value={newProduct.productSpecs.size.min}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          productSpecs: {
                            ...newProduct.productSpecs,
                            size: {
                              ...newProduct.productSpecs.size,
                              min: Number(e.target.value),
                            },
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Max Size"
                      type="number"
                      value={newProduct.productSpecs.size.max}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          productSpecs: {
                            ...newProduct.productSpecs,
                            size: {
                              ...newProduct.productSpecs.size,
                              max: Number(e.target.value),
                            },
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <InputLabel>Size Unit</InputLabel>
                      <Select
                        value={newProduct.productSpecs.size.unit}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            productSpecs: {
                              ...newProduct.productSpecs,
                              size: {
                                ...newProduct.productSpecs.size,
                                unit: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        {['cm', 'mm', 'g', 'kg', 'oz', 'lb'].map((unit) => (
                          <MenuItem key={unit} value={unit}>
                            {unit}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Shelf Life */}
                <Grid item xs={12} container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Shelf Life Duration"
                      type="number"
                      value={newProduct.productSpecs.shelfLife.duration}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          productSpecs: {
                            ...newProduct.productSpecs,
                            shelfLife: {
                              ...newProduct.productSpecs.shelfLife,
                              duration: Number(e.target.value),
                            },
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Shelf Life Unit</InputLabel>
                      <Select
                        value={newProduct.productSpecs.shelfLife.unit}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            productSpecs: {
                              ...newProduct.productSpecs,
                              shelfLife: {
                                ...newProduct.productSpecs.shelfLife,
                                unit: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        {['days', 'weeks', 'months'].map((unit) => (
                          <MenuItem key={unit} value={unit}>
                            {unit}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Seasonal Availability */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Seasonal Availability
                  </Typography>
                  <Grid container spacing={1}>
                    {[
                      'Jan',
                      'Feb',
                      'Mar',
                      'Apr',
                      'May',
                      'Jun',
                      'Jul',
                      'Aug',
                      'Sep',
                      'Oct',
                      'Nov',
                      'Dec',
                    ].map((month) => (
                      <Grid item xs={3} key={month}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={newProduct.productSpecs.seasonalAvailability.some(
                                (m) => m.month === month && m.available
                              )}
                              onChange={(e) => {
                                const updatedAvailability = [
                                  ...newProduct.productSpecs.seasonalAvailability,
                                ];
                                const index = updatedAvailability.findIndex(
                                  (m) => m.month === month
                                );
                                if (index === -1) {
                                  updatedAvailability.push({
                                    month,
                                    available: e.target.checked,
                                  });
                                } else {
                                  updatedAvailability[index].available = e.target.checked;
                                }
                                setNewProduct({
                                  ...newProduct,
                                  productSpecs: {
                                    ...newProduct.productSpecs,
                                    seasonalAvailability: updatedAvailability,
                                  },
                                });
                              }}
                            />
                          }
                          label={month}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            )}
            {activeStep === 2 && (
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Final Confirmation
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Paper elevation={0} sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: 'error.main',
                    borderRadius: 2,
                    backgroundColor: 'error.light'
                  }}>
                    <Typography variant="body2" component="div" sx={{
                      fontFamily: 'monospace',
                      maxHeight: 200,
                      overflowY: 'auto',
                      mb: 2
                    }}>
                      <strong>Agricultural Product Liability Acknowledgement</strong>
                      <br /><br />
                      By checking this box, I hereby affirm that:
                      <ul>
                        <li>All product information provided is accurate to the best of my knowledge</li>
                        <li>I possess valid documentation for all claimed certifications</li>
                        <li>Production practices disclosed meet current agricultural safety standards</li>
                        <li>I bear full responsibility for any misrepresentation of product quality</li>
                        <li>The platform holds no liability for product claims or buyer disputes</li>
                      </ul>
                      Violations may result in account suspension and legal action.
                    </Typography>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={newProduct.liabilityAccepted}
                          onChange={(e) => setNewProduct({
                            ...newProduct,
                            liabilityAccepted: e.target.checked
                          })}
                          color="error"
                        />
                      }
                      label={
                        <Typography variant="body2" color="error">
                          I accept full liability for the accuracy of this product listing
                        </Typography>
                      }
                      sx={{ mt: 2 }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handlePrevStep}
              >
                Back
              </Button>

              {activeStep < 2 ? (
                <Button
                  variant="contained"
                  onClick={handleNextStep}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Publish Product'}
                </Button>
              )}
            </Box>
          </form>
        </Paper>

        {/* Products list */}
        <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 4 }}>
          Your Products
        </Typography>

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
                          backgroundColor: 'primary.main'
                        }}
                      />
                      <Chip
                        label={`${product.totalQuantity} lbs`}
                        size="small"
                        color="secondary"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          backgroundColor: 'secondary.main'
                        }}
                      />
                    </Box>
                  )}

                  <Typography variant="h6" gutterBottom>
                    {product.title || product.customProduct}
                    {product.isOwner && (
                      <Chip
                        label="Your Product"
                        size="small"
                        color="primary"
                        sx={{ ml: 1, verticalAlign: 'middle' }}
                      />
                    )}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((product.totalQuantity / 100) * 100, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: (theme) => theme.palette.grey[300],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: (theme) =>
                            product.totalQuantity > 20
                              ? theme.palette.success.main
                              : theme.palette.error.main
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption">
                        {product.totalQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </Typography>
                      <Typography variant="caption">
                        Updated: {new Date(product.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

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
                      Inventory Details
                    </Button>
                    {product.isOwner && (
                      <Button
                        variant="contained"
                        color="info"
                        fullWidth
                        onClick={() => navigate(`/products/${product._id}/analytics`)}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Analytics
                      </Button>
                    )}
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

          <FormControlLabel // delivery Checkbox
            control={
              <Checkbox
                id="delivery-checkbox"
                checked={newAuction.delivery}
                onChange={(e) => setNewAuction({ ...newAuction, delivery: e.target.checked })}
              />
            }
            label="Check for Delivery Available"
            sx={{ mt: 3 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setShowAuctionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAuction}
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