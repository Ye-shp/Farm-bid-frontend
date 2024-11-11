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
    isFarmer: false,
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

        const blogResponse = await fetch(
          `https://farm-bid-3998c30f5108.herokuapp.com/api/blogs/user/${userId}`
        );
        const blogData = await blogResponse.json();
        setUserBlogs(blogData);
        setIsFollowing(fetchedUser.followers.includes(userIdFromToken));
      } catch (error) {
        console.error('Error fetching user data:', error);
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
      <Tab label="About" value="1" key="about" />
    ];

    if (user.isFarmer) {
      return [
        ...commonTabs,
        <Tab label="Partners" value="2" key="partners" />, 
        <Tab label="Services" value="3" key="services" />,
        <Tab label="Social Media" value="4" key="social" />
      ];
    }

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

  const renderPartnersList = () => (
    <Card>
      <CardHeader 
        title="Business Partners" 
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
    <Box sx={{ maxWidth: '800px', margin: 'auto', padding: 4 }}>
      {/* Profile Header */}
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
                    {user.isFarmer && (
                      <FarmerIcon sx={{ ml: 1, color: 'green' }} titleAccess="Verified Farmer" />
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOnIcon sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatLocation(user.location)}
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

      {/* Location Edit Form - Only for Farmers */}
      {isEditing && isOwner && user.isFarmer && (
        <Card sx={{ mt: 2 }}>
          <CardHeader title="Edit Location" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Address"
                value={user.location.address}
                onChange={(e) => setUser({
                  ...user,
                  location: { ...user.location, address: e.target.value }
                })}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="City"
                  value={user.location.city}
                  onChange={(e) => setUser({
                    ...user,
                    location: { ...user.location, city: e.target.value }
                  })}
                  fullWidth
                />
                <TextField
                  label="State"
                  value={user.location.state}
                  onChange={(e) => setUser({
                    ...user,
                    location: { ...user.location, state: e.target.value }
                  })}
                  fullWidth
                />
              </Box>
              <TextField
                label="Country"
                value={user.location.country}
                onChange={(e) => setUser({
                  ...user,
                  location: { ...user.location, country: e.target.value }
                })}
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)} 
            aria-label="user profile tabs"
          >
            {getTabs()}
          </Tabs>
        </Box>

        {/* Posts Tab */}
        <TabPanel value="0">
          {userBlogs.length > 0 ? (
            userBlogs.map((blog) => (
              <Card key={blog._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{blog.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {blog.content}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert severity="info">No posts available.</Alert>
          )}
        </TabPanel>

        {/* About Tab */}
        <TabPanel value="1">
          <Card>
            <CardHeader title="About" />
            <CardContent>
              {isEditing && isOwner ? (
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
            </CardContent>
          </Card>
        </TabPanel>

        {/* Partners Tab - Only for Farmers */}
        <TabPanel value="2">
          {user.isFarmer ? (
            renderPartnersList()
          ) : (
            <Alert severity="info">Partners tab is only available for farmer profiles.</Alert>
          )}
        </TabPanel>

        {/* Services Tab - Only for Farmers */}
        <TabPanel value="3">
          {user.isFarmer ? (
            <Card>
              <CardHeader title="Farmer Services" subheader="Available services and options" />
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
                  {isEditing && isOwner ? (
                    <Switch
                      checked={user.deliveryAvailable}
                      onChange={(e) => setUser({ ...user, deliveryAvailable: e.target.checked })}
                    />
                  ) : (
                    <Typography color={user.deliveryAvailable ? 'success.main' : 'error.main'}>
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
                  {isEditing && isOwner ? (
                    <Switch
                      checked={user.wholesaleAvailable}
                      onChange={(e) => setUser({ ...user, wholesaleAvailable: e.target.checked })}
                    />
                  ) : (
                    <Typography color={user.wholesaleAvailable ? 'success.main' : 'error.main'}>
                      {user.wholesaleAvailable ? 'Available' : 'Unavailable'}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">Services tab is only available for farmer profiles.</Alert>
          )}
        </TabPanel>

        {/* Social Media Tab - Only for Farmers */}
        <TabPanel value="4">
          {user.isFarmer ? (
            renderSocialMediaLinks()
          ) : (
            <Alert severity="info">Social media tab is only available for farmer profiles.</Alert>
          )}
        </TabPanel>
      </TabContext>

      {/* Edit Controls */}
      {isOwner && (
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button 
            variant={isEditing ? 'outlined' : 'contained'} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
          {isEditing && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;
