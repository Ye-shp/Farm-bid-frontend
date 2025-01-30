import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Card, CardContent, Button, Grid, Badge, IconButton, Paper, Tooltip, Chip, CardMedia, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableRow, Snackbar, Alert } from '@mui/material';
import { CheckCircle, Cancel, AttachMoney, TrendingUp, ExpandMore, ExpandLess, MarkEmailRead, AccessTime, Person } from '@mui/icons-material';
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
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const API_URL = 'https://farm-bid.onrender.com/api';
  const [acceptBidLoading, setAcceptBidLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return 'Auction ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const handleViewDetails = (auction) => {
    setSelectedAuction(auction);
    setDetailsOpen(true);
  };

  const handleAcceptBid = async (auction) => {
    setAcceptBidLoading(true);
    try {
      if (!auction.bids || auction.bids.length === 0) {
        throw new Error('No bids to accept');
      }

      // Find the highest bid
      const highestBid = auction.bids.reduce((prev, current) => 
        (prev.amount > current.amount) ? prev : current
      );

      console.log('Accepting bid:', { auctionId: auction._id, bidId: highestBid._id });
      
      const response = await axios.post(
        `${API_URL}/auctions/${auction._id}/accept`,
        { bidId: highestBid._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove the auction from the active auctions list
        setAuctions(prevAuctions => 
          prevAuctions.filter(a => a._id !== auction._id)
        );
        
        setSnackbarMessage('Bid accepted successfully! The auction has been moved to completed auctions.');
        setSnackbarSeverity('success');
      } else {
        throw new Error(response.data.message || 'Failed to accept bid');
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      setSnackbarMessage(error.response?.data?.message || error.message || 'Failed to accept bid');
      setSnackbarSeverity('error');
    } finally {
      setAcceptBidLoading(false);
      setSnackbarOpen(true);
      setDetailsOpen(false); // Close the details dialog
    }
  };

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        console.log('Fetching auctions with token:', token);
        const response = await axios.get(`${API_URL}/auctions/farmer-auctions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Raw auctions response:', response);
        if (response.data && Array.isArray(response.data)) {
          console.log('Setting auctions:', response.data);
          setAuctions(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching auctions:', error.response || error);
      }
    };

    if (token) {
      fetchAuctions();
    } else {
      console.error('No token available for fetching auctions');
    }
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
                      <strong>Starting Price:</strong>
                    </Typography>
                    <Chip label={`$${auction.startingPrice.toFixed(2)}`} color="success" size="medium" className={classes.badge} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body1">
                      <strong>Current Price:</strong>
                    </Typography>
                    <Chip 
                      label={auction.bids.length > 0 
                        ? `$${Math.max(...auction.bids.map(bid => bid.amount)).toFixed(2)}` 
                        : `$${auction.startingPrice.toFixed(2)}`} 
                      color="primary" 
                      size="medium" 
                      className={classes.badge} 
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body1">
                      <strong>Time Remaining:</strong>
                    </Typography>
                    <Chip 
                      label={getTimeRemaining(auction.endTime)}
                      color={new Date(auction.endTime) > new Date() ? "warning" : "default"}
                      size="medium" 
                      className={classes.badge}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body1">
                      <strong>Status:</strong>
                    </Typography>
                    <Chip
                      label={auction.status}
                      color={auction.status === 'active' ? 'info' : auction.status === 'ended' ? 'error' : 'default'}
                      size="medium"
                      className={classes.badge}
                    />
                  </Box>
                  {auction.status === 'active' && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleViewDetails(auction)}
                    >
                      View Details
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              No auctions found. Create your first auction to get started!
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Auction Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAuction && (
          <>
            <DialogTitle>
              <Typography variant="h5" gutterBottom>
                Auction Details: {selectedAuction.product.title}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Product</strong></TableCell>
                      <TableCell>{selectedAuction.product.title}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Starting Price</strong></TableCell>
                      <TableCell>${selectedAuction.startingPrice.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Current Price</strong></TableCell>
                      <TableCell>
                        ${selectedAuction.bids.length > 0 
                          ? Math.max(...selectedAuction.bids.map(bid => bid.amount)).toFixed(2)
                          : selectedAuction.startingPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Start Time</strong></TableCell>
                      <TableCell>{formatDateTime(selectedAuction.createdAt)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>End Time</strong></TableCell>
                      <TableCell>{formatDateTime(selectedAuction.endTime)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={selectedAuction.status}
                          color={selectedAuction.status === 'active' ? 'success' : selectedAuction.status === 'ended' ? 'error' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Total Bids</strong></TableCell>
                      <TableCell>{selectedAuction.bids.length}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedAuction.bids.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                    Bid History
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableBody>
                        {[...selectedAuction.bids].reverse().map((bid, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Person sx={{ mr: 1 }} />
                                Bidder {index + 1}
                              </Box>
                            </TableCell>
                            <TableCell>${bid.amount.toFixed(2)}</TableCell>
                            <TableCell>{formatDateTime(bid.timestamp)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </DialogContent>
            <DialogActions>
              {selectedAuction.status === 'active' && (
                <Button 
                  onClick={() => handleAcceptBid(selectedAuction)}
                  color="success"
                  variant="contained"
                  disabled={acceptBidLoading || !selectedAuction.bids.length}
                >
                  {acceptBidLoading ? 'Accepting...' : 'Accept Highest Bid'}
                </Button>
              )}
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FarmerAuctions;
