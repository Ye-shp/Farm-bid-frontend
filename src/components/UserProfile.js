import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
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
  IconButton,
  Divider,
} from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import {
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  LocationOn as LocationOnIcon,
  Group as GroupIcon,
  Share as ShareIcon,
  LocalShipping as TruckIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState({
    socialMedia: { instagram: '', facebook: '', tiktok: '' },
    description: '',
    wholesaleAvailable: false,
    deliveryAvailable: false,
    location: { latitude: '', longitude: '' },
    partners: [],
    followers: [],
    following: [],
  });
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
        const response = await axios.get(
          `https://farm-bid-3998c30f5108.herokuapp.com/api/users/${userId}`
        );
        const fetchedUser = response.data;

        setUser({
          ...fetchedUser,
          socialMedia: fetchedUser.socialMedia || { instagram: '', facebook: '', tiktok: '' },
          location: fetchedUser.location || { latitude: '', longitude: '' },
          partners: fetchedUser.partners || [],
          followers: fetchedUser.followers || [],
          following: fetchedUser.following || [],
          deliveryAvailable: fetchedUser.deliveryAvailable || false,
          wholesaleAvailable: fetchedUser.wholesaleAvailable || false,
        });

        // Fetch user's blog posts
        const blogResponse = await axios.get(
          `https://farm-bid-3998c30f5108.herokuapp.com/api/blogs/user/${userId}`
        );
        setUserBlogs(blogResponse.data);

        // Check if the logged-in user is already following this user
        setIsFollowing(fetchedUser.followers.includes(userIdFromToken));
      } catch (error) {
        if (error.response) {
          console.error('Server responded with an error:', error.response.data);
        } else if (error.request) {
          console.error('No response received from server:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
      }
    };

    fetchUser();

    return () => {
      // Cleanup function to prevent memory leaks
      setUser({
        socialMedia: { instagram: '', facebook: '', tiktok: '' },
        description: '',
        wholesaleAvailable: false,
        deliveryAvailable: false,
        location: { latitude: '', longitude: '' },
        partners: [],
        followers: [],
        following: [],
      });
      setIsFollowing(false);
    };
  }, [userId]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to perform this action.');
      return;
    }
    try {
      await axios.put(
        `https://farm-bid-3998c30f5108.herokuapp.com/api/users/${userId}`,
        {
          wholesaleAvailable: user.wholesaleAvailable,
          deliveryAvailable: user.deliveryAvailable,
          description: user.description,
          socialMedia: user.socialMedia,
          partners: user.partners,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
      } else {
        console.error('Error updating profile:', error.response?.data || error.message);
      }
    }
  };

  const handleFollow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to perform this action.');
      return;
    }
    try {
      await axios.post(
        `https://farm-bid-3998c30f5108.herokuapp.com/api/users/follow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(true);
      setUser((prevUser) => ({
        ...prevUser,
        followers: [...prevUser.followers, loggedInUserId],
      }));
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
      } else {
        console.error('Error following user:', error.response?.data || error.message);
      }
    }
  };

  const handleUnfollow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to perform this action.');
      return;
    }
    try {
      await axios.post(
        `https://farm-bid-3998c30f5108.herokuapp.com/api/users/unfollow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(false);
      setUser((prevUser) => ({
        ...prevUser,
        followers: prevUser.followers.filter((id) => id !== loggedInUserId),
      }));
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
      } else {
        console.error('Error unfollowing user:', error.response?.data || error.message);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const isOwner = loggedInUserId === userId;

  return (
    <Box sx={{ maxWidth: '800px', margin: 'auto', padding: 4 }}>
      {/* Header Card */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar sx={{ width: 96, height: 96 }}>
              {user.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {user.username}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOnIcon sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Location not available
                    </Typography>
                  </Box>
                </Box>
                {!isOwner && (
                  <Button
                    variant={isFollowing ? 'contained' : 'outlined'}
                    color={isFollowing ? 'error' : 'primary'}
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon />
                  <Typography variant="body2">
                    <strong>{user.followers.length}</strong> followers
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShareIcon />
                  <Typography variant="body2">
                    <strong>{user.following.length}</strong> following
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <TabContext value={tabValue}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user profile tabs" sx={{ mt: 4 }}>
          <Tab label="Posts" value="0" />
          <Tab label="About" value="1" />
          <Tab label="Partners" value="2" />
          <Tab label="Services" value="3" />
          <Tab label="Social Media" value="4" />
        </Tabs>

        {/* Posts Tab */}
        <TabPanel value="0">
          <Card>
            <CardHeader title="Field Notes" />
            <CardContent>
              {userBlogs.length > 0 ? (
                userBlogs.map((blog) => (
                  <Box key={blog._id} sx={{ mb: 2 }}>
                    <Link to={`/blog/${blog._id}`} style={{ textDecoration: 'none' }}>
                      <Typography variant="h6" color="primary">
                        {blog.title}
                      </Typography>
                    </Link>
                    <Typography variant="body2" color="text.secondary">
                      {blog.content.slice(0, 100)}...
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No Field Notes posted yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* About Tab */}
        <TabPanel value="1">
          <Card>
            <CardHeader title="About" />
            <CardContent>
              {isEditing ? (
                <TextField
                  value={user.description || ''}
                  onChange={(e) => setUser({ ...user, description: e.target.value })}
                  placeholder="Tell us about yourself..."
                  fullWidth
                  multiline
                  rows={4}
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  {user.description || 'No description provided yet.'}
                </Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Location</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.location.latitude && user.location.longitude
                  ? `Latitude: ${user.location.latitude}, Longitude: ${user.location.longitude}`
                  : 'Location not available'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Social Media</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Instagram: {user.socialMedia.instagram || 'Not provided'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Facebook: {user.socialMedia.facebook || 'Not provided'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  TikTok: {user.socialMedia.tiktok || 'Not provided'}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Services</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TruckIcon />
                    <Typography variant="body1">Delivery Service</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {user.deliveryAvailable ? 'Available' : 'Unavailable'}
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <StoreIcon />
                    <Typography variant="body1">Wholesale</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {user.wholesaleAvailable ? 'Available' : 'Unavailable'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Partners</Typography>
              {user.partners.length > 0 ? (
                user.partners.map((partner, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="h6">{partner.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {partner.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {partner.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No partners listed yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Partners Tab */}
        <TabPanel value="2">
          <Card>
            <CardHeader title="Partners" subheader="Organizations we work with" />
            <CardContent>
              {isEditing ? (
                <Box>
                  {user.partners.map((partner, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <TextField
                        label="Partner Name"
                        value={partner.name || ''}
                        onChange={(e) => {
                          const updatedPartners = [...user.partners];
                          updatedPartners[index].name = e.target.value;
                          setUser({ ...user, partners: updatedPartners });
                        }}
                        fullWidth
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        label="Location"
                        value={partner.location || ''}
                        onChange={(e) => {
                          const updatedPartners = [...user.partners];
                          updatedPartners[index].location = e.target.value;
                          setUser({ ...user, partners: updatedPartners });
                        }}
                        fullWidth
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        label="Description"
                        value={partner.description || ''}
                        onChange={(e) => {
                          const updatedPartners = [...user.partners];
                          updatedPartners[index].description = e.target.value;
                          setUser({ ...user, partners: updatedPartners });
                        }}
                        fullWidth
                        multiline
                        rows={2}
                      />
                      <Divider sx={{ my: 2 }} />
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setUser({
                        ...user,
                        partners: [...user.partners, { name: '', location: '', description: '' }],
                      })
                    }
                  >
                    Add Partner
                  </Button>
                </Box>
              ) : (
                <Box>
                  {user.partners.length > 0 ? (
                    user.partners.map((partner, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="h6">{partner.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {partner.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {partner.description}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No partners listed yet.
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Services Tab */}
        <TabPanel value="3">
          <Card>
            <CardHeader title="Services" subheader="Available services and options" />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TruckIcon />
                    <Typography variant="body1">Delivery Service</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Offer delivery to customers
                  </Typography>
                </Box>
                {isEditing ? (
                  <Switch
                    checked={user.deliveryAvailable}
                    onChange={(e) => setUser({ ...user, deliveryAvailable: e.target.checked })}
                  />
                ) : (
                  <Typography color={user.deliveryAvailable ? 'green' : 'red'}>
                    {user.deliveryAvailable ? 'Available' : 'Unavailable'}
                  </Typography>
                )}
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StoreIcon />
                    <Typography variant="body1">Wholesale</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Bulk orders for businesses
                  </Typography>
                </Box>
                {isEditing ? (
                  <Switch
                    checked={user.wholesaleAvailable}
                    onChange={(e) => setUser({ ...user, wholesaleAvailable: e.target.checked })}
                  />
                ) : (
                  <Typography color={user.wholesaleAvailable ? 'green' : 'red'}>
                    {user.wholesaleAvailable ? 'Available' : 'Unavailable'}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Social Media Tab */}
        <TabPanel value="4">
          <Card>
            <CardHeader title="Social Media Links" />
            <CardContent>
              {isEditing ? (
                <Box>
                  <TextField
                    label="Instagram"
                    value={user.socialMedia.instagram || ''}
                    onChange={(e) => setUser({ ...user, socialMedia: { ...user.socialMedia, instagram: e.target.value } })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Facebook"
                    value={user.socialMedia.facebook || ''}
                    onChange={(e) => setUser({ ...user, socialMedia: { ...user.socialMedia, facebook: e.target.value } })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="TikTok"
                    value={user.socialMedia.tiktok || ''}
                    onChange={(e) => setUser({ ...user, socialMedia: { ...user.socialMedia, tiktok: e.target.value } })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Instagram: {user.socialMedia.instagram || 'Not provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Facebook: {user.socialMedia.facebook || 'Not provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    TikTok: {user.socialMedia.tiktok || 'Not provided'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </TabContext>

      {/* Edit Controls */}
      {isOwner && (
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button variant={isEditing ? 'outlined' : 'contained'} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
          {isEditing && (
            <Button variant="contained" onClick={handleSave}>
              Save Changes
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;
