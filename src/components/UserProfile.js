import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

const UserProfile = () => {
  const { userId } = useParams();
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
  
  useEffect(() => {
    const userIdFromToken = localStorage.getItem('userId');
    setLoggedInUserId(userIdFromToken);
  
    const fetchUser = async () => {
      try {
        // Fetch user data
        const response = await fetch(
          `https://farm-bid-3998c30f5108.herokuapp.com/api/users/${userId}`
        );
        const fetchedUser = await response.json();
  
        setUser({
          ...fetchedUser,
          socialMedia: fetchedUser.socialMedia || { instagram: '', facebook: '', tiktok: '' },
          location: fetchedUser.location || { address: '', city: '', state: '', country: '' },
          partners: fetchedUser.partners || [],
          followers: fetchedUser.followers || [],
          following: fetchedUser.following || [],
          deliveryAvailable: fetchedUser.deliveryAvailable || false,
          wholesaleAvailable: fetchedUser.wholesaleAvailable || false,
          isFarmer: fetchedUser.isFarmer || false,
        });
  
        // Fetch blogs
        const blogResponse = await fetch(
          `https://farm-bid-3998c30f5108.herokuapp.com/api/blogs/user/${userId}`
        );
        const blogData = await blogResponse.json();
        setUserBlogs(blogData);
        setIsFollowing(fetchedUser.followers.includes(userIdFromToken));
  
        // Fetch products 
        const token = localStorage.getItem('token');

        const productsResponse = await fetch(
          `https://farm-bid-3998c30f5108.herokuapp.com/api/products/farmer-products`, 
          {
            headers :{Authorization : `Bearer ${token}`}
          }
        );
        const productsData = await productsResponse.json();
        console.log('Fetched products:', productsData); 
        setProducts(productsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchUser();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://farm-bid-3998c30f5108.herokuapp.com/api/users/${userId}/follow`, {
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
      await fetch(`https://farm-bid-3998c30f5108.herokuapp.com/api/users/${userId}/unfollow`, {
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
        `https://farm-bid-3998c30f5108.herokuapp.com/api/users/${userId}`,
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

  const isOwner = loggedInUserId === userId;

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
