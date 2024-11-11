import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Grid,
  Badge,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Chip,
  Container,
  Paper,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  GavelRounded,
  LocalOfferRounded,
  TimelapseRounded,
  ArrowUpward
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const AuctionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const NotificationDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 340,
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  [theme.breakpoints.up('sm')]: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const BuyerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [bidAmount, setBidAmount] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem('token');
  const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com/api';

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get(`${API_URL}/auctions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const activeAuctions = response.data.filter((auction) => auction.status === 'active');
        setAuctions(activeAuctions);
      } catch (error) {
        showSnackbar('Error fetching auctions', 'error');
      }
    };

    fetchAuctions();
  }, [token]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ipinfo.io/json?token=80139ee7708eb3');
        const loc = response.data.loc.split(',');
        setLocation({
          latitude: loc[0],
          longitude: loc[1],
        });
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        showSnackbar('Error fetching notifications', 'error');
      }
    };

    fetchNotifications();
  }, [token]);

  const handleBidChange = (auctionId, value) => {
    setBidAmount({
      ...bidAmount,
      [auctionId]: value,
    });
  };

  const handleBidSubmit = async (auctionId) => {
    try {
      await axios.post(
        `${API_URL}/auctions/${auctionId}/bid`,
        { bidAmount: bidAmount[auctionId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSnackbar('Bid submitted successfully!', 'success');
      setBidAmount(prev => ({ ...prev, [auctionId]: '' }));
    } catch (error) {
      showSnackbar('Error submitting bid', 'error');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      showSnackbar('Error marking notification as read', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <PageContainer maxWidth="xl">
      <HeaderBox>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            fontWeight="bold"
            sx={{
              background: theme.palette.primary.main,
              color: 'white',
              padding: theme.spacing(2, 3),
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[3],
            }}
          >
            Available Auctions
          </Typography>
        </Box>
        <IconButton 
          color="primary" 
          onClick={() => setDrawerOpen(true)}
          sx={{ 
            backgroundColor: theme.palette.grey[100],
            '&:hover': {
              backgroundColor: theme.palette.grey[200],
            },
          }}
        >
          <StyledBadge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </StyledBadge>
        </IconButton>
      </HeaderBox>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {auctions.map((auction) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={auction._id}>
            <AuctionCard>
              <CardMedia
                component="img"
                height="240"
                image={auction.product?.imageUrl || '/placeholder-image.jpg'}
                alt={auction.product?.title || 'Product Image'}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, p: theme.spacing(3) }}>
                <Typography 
                  gutterBottom 
                  variant="h6" 
                  component="h2"
                  sx={{ 
                    fontWeight: 600,
                    mb: 2,
                    height: '2.4em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {auction.product?.title || 'Untitled Product'}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3,
                    height: '3.6em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {auction.product?.description || 'No description available'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GavelRounded sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">
                    Starting Bid: 
                    <Chip 
                      label={`$${auction.startingPrice.toLocaleString()}`}
                      size="small"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ArrowUpward sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">
                    Highest Bid:
                    <Chip 
                      label={`$${auction.highestBid.toLocaleString()}`}
                      size="small"
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Your Bid Amount"
                    value={bidAmount[auction._id] || ''}
                    onChange={(e) => handleBidChange(auction._id, e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleBidSubmit(auction._id)}
                    startIcon={<LocalOfferRounded />}
                    sx={{ 
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Place Bid
                  </Button>
                </Box>
              </CardContent>
            </AuctionCard>
          </Grid>
        ))}
      </Grid>

      <NotificationDrawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Notifications
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Paper
                key={notification._id}
                elevation={notification.read ? 0 : 2}
                sx={{ mb: 2 }}
              >
                <ListItem
                  onClick={() => markAsRead(notification._id)}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: theme.palette.action.selected,
                    },
                  }}
                >
                  <ListItemText
                    primary={notification.message}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {notification.read ? 'Read' : 'Unread'}
                      </Typography>
                    }
                  />
                </ListItem>
              </Paper>
            ))
          ) : (
            <Typography color="text.secondary" align="center">
              No notifications
            </Typography>
          )}
        </List>
      </NotificationDrawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default BuyerDashboard;