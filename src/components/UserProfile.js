import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  Tabs,
  Tab,
  Grid,
  TextField,
  Switch,
  Typography,
  LinearProgress,
  Avatar,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import {
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  VideoCall as TiktokIcon,
  LocationOn as LocationOnIcon,
  Group as GroupIcon,
  Share as ShareIcon,
  LocalShipping as TruckIcon,
  Store as StoreIcon,
  Agriculture as FarmerIcon,
  Business as PartnersIcon,
} from '@mui/icons-material';
import { useParams, useLocation } from 'react-router-dom';
import Reviews from './Reviews';

const UserProfile = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL // Remove /api from base URL
  const [user, setUser] = useState({
    username: '',
    socialMedia: { instagram: '', facebook: '', tiktok: '' },
    description: '',
    wholesaleAvailable: false,
    deliveryAvailable: false,
    address: { 
      street: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        lat: 0,
        lng: 0
      }
    },
    partners: [],
    followers: [],
    following: [],
    isFarmer: true,
  });
  const [products, setProducts] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [tabValue, setTabValue] = useState('0');
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  useEffect(() => {
    const userIdFromToken = localStorage.getItem('userId');
    setLoggedInUserId(userIdFromToken);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const isProfilePage = location.pathname === '/profile';
        const endpoint = isProfilePage ? 'users/profile' : `users/${userId}`;
        
        console.log('Fetching from:', `${API_URL}/api/${endpoint}`); // Debug log
        
        const response = await fetch(
          `${API_URL}/api/${endpoint}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('User data fetched:', userData);
        setUser({
          ...userData,
          socialMedia: userData.socialMedia || { instagram: '', facebook: '', tiktok: '' },
          address: userData.address || { street: '', city: '', state: '', zipCode: '', coordinates: { lat: 0, lng: 0 } },
          partners: userData.partners || [],
          followers: userData.followers || [],
          following: userData.following || [],
          deliveryAvailable: userData.deliveryAvailable || false,
          wholesaleAvailable: userData.wholesaleAvailable || false,
          isFarmer: userData.role === 'farmer',
        });
        
        // Check if logged in user is following this user
        if (!isProfilePage && userId) {
          setIsFollowing(userData.followers.some(follower => follower._id === loggedInUserId));
        }

        // Fetch blogs
        const targetUserId = isProfilePage ? loggedInUserId : userId;
        const blogResponse = await fetch(
          `${API_URL}/api/blogs/user/${targetUserId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (!blogResponse.ok) {
          throw new Error('Failed to fetch user blogs');
        }
        const blogData = await blogResponse.json();
        setUserBlogs(blogData);

        // Fetch products if user is a farmer
        if (userData.role === 'farmer') {
          console.log('Fetching products for farmer:', targetUserId);
          const productsResponse = await fetch(
            `${API_URL}/api/products/farmer-products?farmerId=${targetUserId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          if (!productsResponse.ok) {
            console.error('Products response:', await productsResponse.text());
            throw new Error('Failed to fetch user products');
          }
          const productsData = await productsResponse.json();
          console.log('Products data:', productsData);
          setProducts(productsData);
        } else {
          console.log('User is not a farmer, skipping products fetch');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
      }
    };

    if (loggedInUserId) {
      fetchUserData();
    }
  }, [userId, loggedInUserId, location.pathname, API_URL]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/users/${user._id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setIsFollowing(true);
      setUser(prev => ({
        ...prev,
        followers: [...prev.followers, loggedInUserId]
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/users/${user._id}/unfollow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setIsFollowing(false);
      setUser(prev => ({
        ...prev,
        followers: prev.followers.filter(id => id !== loggedInUserId)
      }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const getTabs = () => {
    const commonTabs = [
      <Tab label="Posts" value="0" key="posts" />,
      <Tab label="About" value="1" key="about" />,    
      <Tab label="Partners" value="2" key="partners" />, 
      <Tab label="Services" value="3" key="services" />,
      <Tab label="Social Media" value="4" key="social" />,
      <Tab label="Products" value = "5" key = "products"/>,
      <Tab label="Reviews" value="6" key="reviews" />
      ];
    

    return commonTabs;
  };

  const formatLocation = (location) => {
    const parts = [];
    if (location.street) parts.push(location.street);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.zipCode) parts.push(location.zipCode);
    return parts.join(', ') || 'Location not available';
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to perform this action.');
      return;
    }
    try {
      await fetch(
        `${API_URL}/api/users/${user._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            wholesaleAvailable: user.wholesaleAvailable,
            deliveryAvailable: user.deliveryAvailable,
            description: user.description,
            socialMedia: user.socialMedia,
            partners: user.partners,
            address: user.address,
          })
        }
      );
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/user/${user._id}`;
    const shareData = {
      title: `${user.username}'s Farm Profile`,
      text: `Check out ${user.username}'s farm profile on FarmBid!`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setSnackbar({ open: true, message: 'Shared successfully!' });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setSnackbar({ open: true, message: 'Profile link copied to clipboard!' });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setSnackbar({ open: true, message: 'Failed to share profile' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderProductsList = () => (
    <Card>
      <CardHeader
        title="Available Products"
        subheader="Products offered by this farmer"
      />
      <CardContent>
        {products.length > 0 ? (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {product.imageUrl && (
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <img
                          src={product.imageUrl}
                          alt={product.title || product.customProduct}
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
                            backgroundColor: 'primary.main',
                            color: 'white'
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
                            backgroundColor: 'secondary.main',
                            color: 'white'
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
  
                    <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
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
                        >
                          Analytics
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">No products listed yet.</Typography>
        )}
      </CardContent>
    </Card>
  );
  const renderPartnersList = () => (
    <Card>
      <CardHeader 
        title="Partners" 
        subheader="Companies and farms we work with"
        avatar={<PartnersIcon />}
      />
      <CardContent>
        {user.partners && user.partners.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {user.partners.map((partner, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>{partner.name}</Typography>
                {isEditing && isOwner && (
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => {
                      setUser({
                        ...user,
                        partners: user.partners.filter((_, i) => i !== index)
                      });
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No partners listed yet.</Typography>
        )}
        {isEditing && isOwner && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Add new partner"
              placeholder="Partner name"
              fullWidth
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  setUser({
                    ...user,
                    partners: [...user.partners, { name: e.target.value }]
                  });
                  e.target.value = '';
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderSocialMediaLinks = () => (
    <Card>
      <CardHeader title="Social Media Links" />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InstagramIcon color="action" />
            {isEditing && isOwner ? (
              <TextField
                label="Instagram"
                value={user.socialMedia.instagram || ''}
                onChange={(e) => setUser({
                  ...user,
                  socialMedia: { ...user.socialMedia, instagram: e.target.value }
                })}
                fullWidth
              />
            ) : (
              <Typography>
                {user.socialMedia.instagram || 'Not provided'}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FacebookIcon color="action" />
            {isEditing && isOwner ? (
              <TextField
                label="Facebook"
                value={user.socialMedia.facebook || ''}
                onChange={(e) => setUser({
                  ...user,
                  socialMedia: { ...user.socialMedia, facebook: e.target.value }
                })}
                fullWidth
              />
            ) : (
              <Typography>
                {user.socialMedia.facebook || 'Not provided'}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TiktokIcon color="action" />
            {isEditing && isOwner ? (
              <TextField
                label="TikTok"
                value={user.socialMedia.tiktok || ''}
                onChange={(e) => setUser({
                  ...user,
                  socialMedia: { ...user.socialMedia, tiktok: e.target.value }
                })}
                fullWidth
              />
            ) : (
              <Typography>
                {user.socialMedia.tiktok || 'Not provided'}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const isOwner = loggedInUserId === user._id;

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {/* Profile Header Section */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ 
          position: 'relative',
          height: '200px',
          bgcolor: 'primary.main',
          borderRadius: '4px 4px 0 0'
        }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              position: 'absolute',
              bottom: '-60px',
              left: '32px',
              border: '4px solid white',
              boxShadow: 1
            }}
            src={user.avatar}
            alt={user.username}
          >
            {user.username?.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
        
        <CardContent sx={{ pt: 8, pb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {user.username}
                {user.isFarmer && (
                  <FarmerIcon sx={{ ml: 1, color: 'success.main', verticalAlign: 'middle' }} />
                )}
              </Typography>
              {isEditing && isOwner ? (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={user.description || ''}
                  onChange={(e) => setUser({ ...user, description: e.target.value })}
                  sx={{ mb: 2 }}
                />
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {user.description || 'No description provided'}
                </Typography>
              )}
              
              {/* Location and Stats */}
              <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {[user.address.street, user.address.city, user.address.state, user.address.zipCode].filter(Boolean).join(', ')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <GroupIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {user.followers?.length || 0} followers
                  </Typography>
                </Box>
              </Box>
              
              {/* Features Badges */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {(user.wholesaleAvailable || (isEditing && isOwner)) && (
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: isEditing ? 'background.paper' : 'success.light',
                    color: isEditing ? 'text.primary' : 'success.contrastText',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1
                  }}>
                    <StoreIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                    <Typography variant="body2">Wholesale</Typography>
                    {isEditing && isOwner && (
                      <Switch
                        size="small"
                        checked={user.wholesaleAvailable}
                        onChange={(e) => setUser({ ...user, wholesaleAvailable: e.target.checked })}
                      />
                    )}
                  </Box>
                )}
                {(user.deliveryAvailable || (isEditing && isOwner)) && (
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: isEditing ? 'background.paper' : 'info.light',
                    color: isEditing ? 'text.primary' : 'info.contrastText',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1
                  }}>
                    <TruckIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                    <Typography variant="body2">Delivery</Typography>
                    {isEditing && isOwner && (
                      <Switch
                        size="small"
                        checked={user.deliveryAvailable}
                        onChange={(e) => setUser({ ...user, deliveryAvailable: e.target.checked })}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Box>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {userId !== loggedInUserId && (
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  startIcon={<GroupIcon />}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (isEditing) {
                      handleSave();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
              >
                Share
              </Button>
            </Box>
          </Box>
          
          {/* Social Media Links */}
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            mt: 3,
            pt: 3,
            borderTop: 1,
            borderColor: 'divider'
          }}>
            {isEditing && isOwner ? (
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <TextField
                  size="small"
                  label="Instagram"
                  value={user.socialMedia?.instagram || ''}
                  onChange={(e) => setUser({
                    ...user,
                    socialMedia: { ...user.socialMedia, instagram: e.target.value }
                  })}
                />
                <TextField
                  size="small"
                  label="Facebook"
                  value={user.socialMedia?.facebook || ''}
                  onChange={(e) => setUser({
                    ...user,
                    socialMedia: { ...user.socialMedia, facebook: e.target.value }
                  })}
                />
                <TextField
                  size="small"
                  label="TikTok"
                  value={user.socialMedia?.tiktok || ''}
                  onChange={(e) => setUser({
                    ...user,
                    socialMedia: { ...user.socialMedia, tiktok: e.target.value }
                  })}
                />
              </Box>
            ) : (
              <>
                {user.socialMedia?.instagram && (
                  <Button
                    href={user.socialMedia.instagram}
                    target="_blank"
                    startIcon={<InstagramIcon />}
                    size="small"
                    sx={{ borderRadius: 4 }}
                  >
                    Instagram
                  </Button>
                )}
                {user.socialMedia?.facebook && (
                  <Button
                    href={user.socialMedia.facebook}
                    target="_blank"
                    startIcon={<FacebookIcon />}
                    size="small"
                    sx={{ borderRadius: 4 }}
                  >
                    Facebook
                  </Button>
                )}
                {user.socialMedia?.tiktok && (
                  <Button
                    href={user.socialMedia.tiktok}
                    target="_blank"
                    startIcon={<TiktokIcon />}
                    size="small"
                    sx={{ borderRadius: 4 }}
                  >
                    TikTok
                  </Button>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none'
              }
            }}
          >
            {getTabs()}
          </Tabs>
        </Box>

        {/* Posts Tab */}
        <TabPanel value="0">
          {userBlogs.length > 0 ? (
            userBlogs.map((blog) => (
              <Card key={blog._id} sx={{ marginBottom: 2 }}>
                <CardHeader
                  title={blog.title}
                  subheader={new Date(blog.createdAt).toLocaleString()}
                />
                <CardContent>
                  <Typography>{blog.content}</Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>No posts available.</Typography>
          )}
        </TabPanel>
  
        {/* About Tab */}
        <TabPanel value="1">
          <Card>
            <CardContent>
              <Typography variant="h6">About</Typography>
              {isEditing && isOwner ? (
                <TextField
                  label="Description"
                  multiline
                  rows={4}
                  value={user.description}
                  onChange={(e) =>
                    setUser({ ...user, description: e.target.value })
                  }
                  fullWidth
                  sx={{ marginBottom: 2 }}
                />
              ) : (
                <Typography sx={{ marginBottom: 2 }}>
                  {user.description || 'No description provided.'}
                </Typography>
              )}
              <Typography variant="h6">Location</Typography>
              {isEditing && isOwner ? (
                <>
                  <TextField
                    label="Street"
                    value={user.address.street}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        address: { ...user.address, street: e.target.value },
                      })
                    }
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                  <TextField
                    label="City"
                    value={user.address.city}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        address: { ...user.address, city: e.target.value },
                      })
                    }
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                  <TextField
                    label="State"
                    value={user.address.state}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        address: { ...user.address, state: e.target.value },
                      })
                    }
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                  <TextField
                    label="Zip Code"
                    value={user.address.zipCode}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        address: { ...user.address, zipCode: e.target.value },
                      })
                    }
                    fullWidth
                  />
                </>
              ) : (
                <Typography>
                  {formatLocation(user.address) || 'No location provided.'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
  
        {/* Partners Tab */}
        <TabPanel value="2">{renderPartnersList()}</TabPanel>
  
        {/* Services Tab */}
        <TabPanel value="3">
          <Card>
            <CardContent>
              <Typography variant="h6">Services</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <TruckIcon sx={{ marginRight: 1 }} />
                <Typography sx={{ marginRight: 2 }}>
                  Delivery Available
                </Typography>
                {isEditing && isOwner && (
                  <Switch
                    checked={user.deliveryAvailable}
                    onChange={(e) =>
                      setUser({ ...user, deliveryAvailable: e.target.checked })
                    }
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <StoreIcon sx={{ marginRight: 1 }} />
                <Typography sx={{ marginRight: 2 }}>
                  Wholesale Available
                </Typography>
                {isEditing && isOwner && (
                  <Switch
                    checked={user.wholesaleAvailable}
                    onChange={(e) =>
                      setUser({ ...user, wholesaleAvailable: e.target.checked })
                    }
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
  
        {/* Social Media Tab */}
        <TabPanel value="4">{renderSocialMediaLinks()}</TabPanel>

        {/* Products Tab */}
        <TabPanel value="5">
          {renderProductsList()}
        </TabPanel>

        {/* Reviews Tab */}
        <TabPanel value="6">
          <Reviews userId={userId || user._id} />
        </TabPanel>
      </TabContext>      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
};

export default UserProfile;
