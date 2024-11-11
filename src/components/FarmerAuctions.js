import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Card, CardContent, Button, Grid, Badge, IconButton, Paper, Tooltip, Chip, CardMedia, Collapse } from '@mui/material';
import { CheckCircle, Cancel, AttachMoney, TrendingUp, ExpandMore, ExpandLess, MarkEmailRead } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  card: {
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
    },
  },
  notificationBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    marginBottom: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    transition: 'background-color 0.3s ease',
    '&.unread': {
      backgroundColor: '#e3f2fd',
    },
  },
  badge: {
    fontSize: '1.2rem',
  },
  auctionTitle: {
    fontWeight: 'bold',
    color: '#3f51b5',
  },
  statusIcon: {
    fontSize: '2rem',
  },
  notificationButton: {
    marginLeft: '16px',
  },
});

const FarmerAuctions = () => {
  const classes = useStyles();
  const [auctions, setAuctions] = useState([]);
  const token = localStorage.getItem('token');
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(true);
  const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com/api';

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get(`${API_URL}/auctions/farmer-auctions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuctions(response.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };

    fetchAuctions();
  }, [token]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [token]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Container sx={{ mt: 4 }} maxWidth="lg">
      <Typography variant="h3" align="center" gutterBottom color="primary">
        My Auctions
      </Typography>

      {/* Notifications Section */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">
            Notifications
          </Typography>
          <IconButton onClick={() => setNotificationsOpen(!notificationsOpen)}>
            {notificationsOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Collapse in={notificationsOpen} timeout="auto" unmountOnExit>
          {notifications.length > 0 ? (
            <Box>
              {notifications.map((notification) => (
                <Paper
                  key={notification._id}
                  elevation={3}
                  className={`${classes.notificationBox} ${notification.read ? '' : 'unread'}`}
                  sx={{
                    bgcolor: notification.read ? 'background.paper' : 'grey.100',
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%">
                    <Typography flexGrow={1}>{notification.message}</Typography>
                    {!notification.read && (
                      <Tooltip title="Mark as Read">
                        <IconButton
                          color="primary"
                          className={classes.notificationButton}
                          onClick={() => markAsRead(notification._id)}
                        >
                          <MarkEmailRead />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography>No notifications found.</Typography>
          )}
        </Collapse>
      </Box>

      {/* Auctions Section */}
      <Grid container spacing={4}>
        {auctions.length > 0 ? (
          auctions.map((auction) => (
            <Grid item xs={12} md={6} key={auction._id}>
              <Card className={classes.card} sx={{ height: '100%', boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={auction.product.imageUrl || 'https://via.placeholder.com/200'}
                  alt={auction.product.title}
                />
                <CardContent>
                  <Typography variant="h5" align="center" gutterBottom className={classes.auctionTitle}>
                    {auction.product.title}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body1">
                      <strong>Starting Bid:</strong>
                    </Typography>
                    <Chip label={`$${auction.startingBid || 'N/A'}`} color="success" size="medium" className={classes.badge} />
                    <Tooltip title="Starting Bid">
                      <IconButton color="success">
                        <AttachMoney className={classes.statusIcon} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body1">
                      <strong>Highest Bid:</strong>
                    </Typography>
                    <Chip label={`$${auction.highestBid || 'N/A'}`} color="primary" size="medium" className={classes.badge} />
                    <Tooltip title="Highest Bid">
                      <IconButton color="primary">
                        <TrendingUp className={classes.statusIcon} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">
                      <strong>Status:</strong>
                    </Typography>
                    <Chip
                      label={auction.status}
                      color={auction.status === 'active' ? 'info' : 'secondary'}
                      size="medium"
                      className={classes.badge}
                    />
                    <Tooltip title={auction.status === 'active' ? 'Active' : 'Inactive'}>
                      <IconButton color={auction.status === 'active' ? 'info' : 'secondary'}>
                        {auction.status === 'active' ? <CheckCircle className={classes.statusIcon} /> : <Cancel className={classes.statusIcon} />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography align="center">No auctions found.</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default FarmerAuctions;
