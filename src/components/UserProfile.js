import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Tabs,
  Tab,
  TextField,
  Switch,
  Typography,
  Avatar,
  Divider,
  Alert,
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

const UserProfile = () => {
  const { userId } = useParams();
  const location = useLocation();
  const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com'; // Remove /api from base URL
  const [user, setUser] = useState({
    username: '',
    socialMedia: { instagram: '', facebook: '', tiktok: '' },
    description: '',
    wholesaleAvailable: false,
    deliveryAvailable: false,
    location: { address: '', city: '', state: '', country: '' },
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
          location: userData.location || { address: '', city: '', state: '', country: '' },
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
            `${API_URL}/api/products/farmer-products`,
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
      <Tab label="Products" value = "5" key = "products"/>
      ];
    

    return commonTabs;
  };

  const formatLocation = (location) => {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
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
            location: user.location,
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

  const renderProductsList = () => (
    <Card>
      <CardHeader
        title="Available Products"
        subheader="Products offered by this farmer"
      />
      <CardContent>
        {products.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {products.map((product) => (
              <Card key={product._id} sx={{ marginBottom: 2 }}>
                <CardContent>
                  <Typography variant="h6">
                    {product.title || product.customProduct}
                  </Typography>
                  <Typography variant="body2">{product.description}</Typography>
                  <Typography variant="body1">Price: ${product.price}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
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
                {isEditing && (
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
        {isEditing && (
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
            {isEditing ? (
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
            {isEditing ? (
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
            {isEditing ? (
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
    <Box sx={{ padding: 2 }}>
      {/* User Profile Header */}
      <Card sx={{ marginBottom: 2 }}>
        <CardHeader
          avatar={
            <Avatar>
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          }
          title={user.username || 'Username'}
          subheader={formatLocation(user.location)}
          action={
            isOwner ? (
              isEditing ? (
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )
            ) : isFollowing ? (
              <Button variant="contained" color="secondary" onClick={handleUnfollow}>
                Unfollow
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleFollow}>
                Follow
              </Button>
            )
          }
        />
        {user.description && (
          <CardContent>
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
              />
            ) : (
              <Typography variant="body2">{user.description}</Typography>
            )}
          </CardContent>
        )}
      </Card>
  
      {/* Tabs */}
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
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
                    label="Address"
                    value={user.location.address}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        location: { ...user.location, address: e.target.value },
                      })
                    }
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                  <TextField
                    label="City"
                    value={user.location.city}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        location: { ...user.location, city: e.target.value },
                      })
                    }
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                  <TextField
                    label="State"
                    value={user.location.state}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        location: { ...user.location, state: e.target.value },
                      })
                    }
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                  <TextField
                    label="Country"
                    value={user.location.country}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        location: { ...user.location, country: e.target.value },
                      })
                    }
                    fullWidth
                  />
                </>
              ) : (
                <Typography>
                  {formatLocation(user.location) || 'No location provided.'}
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
                {isEditing && isOwner ? (
                  <Switch
                    checked={user.deliveryAvailable}
                    onChange={(e) =>
                      setUser({ ...user, deliveryAvailable: e.target.checked })
                    }
                  />
                ) : (
                  <Typography>
                    {user.deliveryAvailable ? 'Yes' : 'No'}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <StoreIcon sx={{ marginRight: 1 }} />
                <Typography sx={{ marginRight: 2 }}>
                  Wholesale Available
                </Typography>
                {isEditing && isOwner ? (
                  <Switch
                    checked={user.wholesaleAvailable}
                    onChange={(e) =>
                      setUser({ ...user, wholesaleAvailable: e.target.checked })
                    }
                  />
                ) : (
                  <Typography>
                    {user.wholesaleAvailable ? 'Yes' : 'No'}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
  
        {/* Social Media Tab */}
        <TabPanel value="4">{renderSocialMediaLinks()}</TabPanel>

        {/* Products Tab */}
        <TabPanel value="5">{renderProductsList()}</TabPanel>
      </TabContext>      
    </Box>
  );
};

export default UserProfile;
