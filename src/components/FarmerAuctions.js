import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Badge, 
  IconButton, 
  Paper, 
  Tooltip, 
  Chip, 
  CardMedia, 
  Collapse, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableRow, 
  Snackbar, 
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel,
  ExpandMore, 
  ExpandLess, 
  MarkEmailRead, 
  Person,
  Notifications as NotificationsIcon,
  MonetizationOn,
  Schedule
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  minHeight: '100vh',
}));

const StyledAppBar = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
}));

const AuctionCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const NotificationItem = styled(ListItem)(({ theme, unread }) => ({
  backgroundColor: unread ? theme.palette.action.selected : theme.palette.background.paper,
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  borderRadius: 8,
  backgroundColor: 
    status === 'active' ? theme.palette.success.light :
    status === 'ended' ? theme.palette.error.light :
    theme.palette.grey[300],
  color: 
    status === 'active' ? theme.palette.success.dark :
    status === 'ended' ? theme.palette.error.dark :
    theme.palette.text.primary,
}));

const FarmerAuctions = () => {
  const theme = useTheme();
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
      month: 'short', 
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

      const highestBid = auction.bids.reduce((prev, current) => 
        (prev.amount > current.amount) ? prev : current
      );

      const response = await axios.post(
        `${API_URL}/auctions/${auction._id}/accept`,
        { bidId: highestBid._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAuctions(prevAuctions => 
          prevAuctions.filter(a => a._id !== auction._id)
        );
        
        setSnackbarMessage('Bid accepted successfully! Auction moved to completed.');
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
      setDetailsOpen(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionsRes, notificationsRes] = await Promise.all([
          axios.get(`${API_URL}/auctions/farmer-auctions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setAuctions(auctionsRes.data);
        setNotifications(notificationsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (token) fetchData();
  }, [token]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <DashboardContainer>
      <StyledAppBar>
        <Box maxWidth="1200px" margin="auto">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" fontWeight={700}>
              Auction Dashboard
            </Typography>
            <IconButton onClick={() => setNotificationsOpen(!notificationsOpen)}>
              <Badge 
                badgeContent={notifications.filter(n => !n.read).length} 
                color="error"
              >
                <NotificationsIcon fontSize="large" />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </StyledAppBar>

      <Box maxWidth="1200px" margin="auto" p={4}>
        {/* Notifications Section */}
        <Paper elevation={0} sx={{ mb: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
            <Typography variant="h5" fontWeight={600}>
              Recent Activity
            </Typography>
            <IconButton onClick={() => setNotificationsOpen(!notificationsOpen)}>
              {notificationsOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={notificationsOpen}>
            <List sx={{ p: 2 }}>
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification._id}
                  unread={!notification.read}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <MonetizationOn />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.message}
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondary={formatDateTime(notification.createdAt)}
                  />
                  {!notification.read && (
                    <Tooltip title="Mark as Read">
                      <IconButton onClick={() => markAsRead(notification._id)}>
                        <MarkEmailRead color="primary" />
                      </IconButton>
                    </Tooltip>
                  )}
                </NotificationItem>
              ))}
            </List>
          </Collapse>
        </Paper>

        {/* Auctions Grid */}
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 4 }}>
          Active Auctions
        </Typography>
        
        <Grid container spacing={3}>
          {auctions.map((auction) => (
            <Grid item xs={12} sm={6} md={4} key={auction._id}>
              <AuctionCard>
                <CardMedia
                  component="img"
                  height="240"
                  image={auction.product.imageUrl || 'https://via.placeholder.com/400'}
                  alt={auction.product.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={600}>
                      {auction.product.title}
                    </Typography>
                    <StatusChip 
                      label={auction.status} 
                      status={auction.status.toLowerCase()}
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      <Schedule fontSize="small" sx={{ mr: 1 }} />
                      Ends {formatDateTime(auction.endTime)}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">Starting Price</Typography>
                    <Chip 
                      label={`$${auction.startingPrice.toFixed(2)}`} 
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="body2">Current Bid</Typography>
                    <Chip
                      label={auction.bids.length > 0 
                        ? `$${Math.max(...auction.bids.map(bid => bid.amount)).toFixed(2)}` 
                        : 'No bids'}
                      color="success"
                      variant="filled"
                    />
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleViewDetails(auction)}
                    disabled={auction.status !== 'active'}
                    sx={{ borderRadius: 2 }}
                  >
                    {auction.status === 'active' ? 'Manage Auction' : 'View Results'}
                  </Button>
                </CardContent>
              </AuctionCard>
            </Grid>
          ))}
        </Grid>

        {/* Auction Details Dialog */}
        <Dialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          {selectedAuction && (
            <>
              <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700}>
                  {selectedAuction.product.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Auction ID: {selectedAuction._id}
                </Typography>
              </DialogTitle>
              
              <DialogContent>
                <TableContainer>
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
                        <TableCell><strong>End Time</strong></TableCell>
                        <TableCell>{formatDateTime(selectedAuction.endTime)}</TableCell>
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
              
              <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
                {selectedAuction.status === 'active' && (
                  <Button 
                    onClick={() => handleAcceptBid(selectedAuction)}
                    color="success"
                    variant="contained"
                    disabled={acceptBidLoading || !selectedAuction.bids.length}
                    sx={{ borderRadius: 2 }}
                  >
                    {acceptBidLoading ? 'Processing...' : 'Accept Highest Bid'}
                  </Button>
                )}
                <Button 
                  onClick={() => setDetailsOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
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
            sx={{ 
              borderRadius: 2, 
              boxShadow: theme.shadows[3],
              alignItems: 'center',
              fontSize: '0.875rem'
            }}
            iconMapping={{
              success: <CheckCircle fontSize="inherit" />,
              error: <Cancel fontSize="inherit" />
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardContainer>
  );
};

export default FarmerAuctions;