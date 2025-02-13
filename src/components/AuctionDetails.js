import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Timer, LocalOffer, Description, AttachMoney } from '@mui/icons-material';

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidDialog, setShowBidDialog] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchAuctionDetails();
  }, [id]);

  const fetchAuctionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/auctions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAuction(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching auction details:', error);
      setError('Failed to load auction details');
      setLoading(false);
    }
  };

  const handleBid = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/auctions/${id}/bid`,
        { amount: parseFloat(bidAmount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Refresh auction details after bid
      await fetchAuctionDetails();
      setShowBidDialog(false);
      setBidAmount('');
    } catch (error) {
      setError('Failed to place bid. Please try again.');
      console.error('Error placing bid:', error);
    }
  };

  const getTimeRemaining = () => {
    if (!auction) return '';
    const endTime = new Date(auction.endTime);
    const now = new Date();
    const diff = endTime - now;

    if (diff <= 0) return 'Auction ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m remaining`;
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!auction) return <Alert severity="info">Auction not found</Alert>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                {auction.product.title}
              </Typography>
              <Chip
                icon={<Timer />}
                label={getTimeRemaining()}
                color={auction.status === 'active' ? 'primary' : 'default'}
                sx={{ mb: 2 }}
              />
            </Grid>

            {auction.product.image && (
              <Grid item xs={12}>
                <Box
                  component="img"
                  src={auction.product.image}
                  alt={auction.product.title}
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalOffer sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Current Bid: ${auction.currentPrice.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ mr: 1 }} />
                <Typography>
                  Minimum Increment: ${auction.minIncrement.toFixed(2)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Description sx={{ mr: 1 }} />
                <Typography>
                  Quantity: {auction.quantity} {auction.product.unit || 'units'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {auction.description || auction.product.description}
              </Typography>
            </Grid>

            {auction.status === 'active' && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setShowBidDialog(true)}
                >
                  Place Bid
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={showBidDialog} onClose={() => setShowBidDialog(false)}>
        <DialogTitle>Place a Bid</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Bid Amount ($)"
            type="number"
            fullWidth
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            inputProps={{
              min: auction.currentPrice + auction.minIncrement,
              step: 0.01
            }}
          />
          <Typography variant="caption" color="textSecondary">
            Minimum bid: ${(auction.currentPrice + auction.minIncrement).toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBidDialog(false)}>Cancel</Button>
          <Button
            onClick={handleBid}
            disabled={!bidAmount || parseFloat(bidAmount) < (auction.currentPrice + auction.minIncrement)}
          >
            Place Bid
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AuctionDetails;
