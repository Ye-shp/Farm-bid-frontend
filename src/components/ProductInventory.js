import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  BarChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';

const ProductInventory = () => {
  const { id } = useParams();
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  // Component state
  const [product, setProduct] = useState(null);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // "add" or "remove"
  const [inventoryChange, setInventoryChange] = useState({
    quantity: '',
    reason: '',
    notes: ''
  });

  // Fetch product details
  const fetchProductDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProduct(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch product details');
      setLoading(false);
    }
  }, [API_URL, id, token]);

  // Fetch inventory history
  const fetchInventoryHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}/inventory-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventoryHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch inventory history:', err);
    }
  }, [API_URL, id, token]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data.data);
      setAnalyticsLoading(false);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setAnalyticsLoading(false);
    }
  }, [API_URL, id, token]);

  // Load all required data on mount or when id changes
  useEffect(() => {
    fetchProductDetails();
    fetchInventoryHistory();
    fetchAnalytics();
  }, [fetchProductDetails, fetchInventoryHistory, fetchAnalytics]);

  // Handle stock addition or removal
  const handleInventoryChange = async () => {
    try {
      // For removals, the quantity is negative
      const adjustedQuantity =
        dialogType === 'remove' ? -Number(inventoryChange.quantity) : Number(inventoryChange.quantity);

      const payload = {
        quantity: adjustedQuantity,
        reason: inventoryChange.reason,
        notes: inventoryChange.notes || ''
      };

      const response = await axios.post(`${API_URL}/api/products/${id}/inventory`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setOpenDialog(false);
        // Refresh product details and history after successful change
        fetchProductDetails();
        fetchInventoryHistory();
        // Reset the inventory change form
        setInventoryChange({ quantity: '', reason: '', notes: '' });
      }
    } catch (err) {
      console.error('Failed to update inventory:', err);
    }
  };

  // Open dialog with type "add" or "remove"
  const handleDialogOpen = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  // Handle loading and error states
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!product) return <Alert severity="info">Product not found</Alert>;

  // Determine if current stock is low
  const lowStockThreshold = product.lowStockThreshold || 100;
  const isLowStock = product.totalQuantity <= lowStockThreshold;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Overview Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {product.title || product.customProduct} - Inventory Management
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Current Stock
                    </Typography>
                    <Typography variant="h3">
                      {product.totalQuantity} lbs
                    </Typography>
                    {isLowStock && (
                      <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
                        Low stock alert! Below {lowStockThreshold} lbs
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleDialogOpen('add')}
                  >
                    Add Stock
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<RemoveIcon />}
                    onClick={() => handleDialogOpen('remove')}
                  >
                    Remove Stock
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Analytics Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ChartIcon sx={{ mr: 1 }} />
              Analytics Overview
            </Typography>
            {analyticsLoading ? (
              <LinearProgress />
            ) : analytics ? (
              <Grid container spacing={3}>
                {/* Overview Cards */}
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Revenue
                      </Typography>
                      <Typography variant="h4">
                        ${(analytics.overview.totalRevenue || 0).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Average Price
                      </Typography>
                      <Typography variant="h4">
                        ${(analytics.overview.averagePrice || 0).toFixed(2)}/lb
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Active Auctions
                      </Typography>
                      <Typography variant="h4">
                        {analytics.overview.activeAuctions || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Auction Metrics */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Auction Performance
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="textSecondary">
                            Success Rate
                          </Typography>
                          <Typography variant="h6">
                            {analytics.auctions?.successRate || '0%'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="textSecondary">
                            Total Auctions
                          </Typography>
                          <Typography variant="h6">
                            {analytics.auctions?.totalAuctions || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="textSecondary">
                            Avg. Bids per Auction
                          </Typography>
                          <Typography variant="h6">
                            {analytics.auctions?.averageBidsPerAuction || '0'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">No analytics data available</Alert>
            )}
          </Paper>
        </Grid>

        {/* Inventory History Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <HistoryIcon sx={{ mr: 1 }} />
              Inventory History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryHistory.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{new Date(record.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {record.quantity > 0 ? (
                          <Typography color="success.main">Addition</Typography>
                        ) : (
                          <Typography color="error.main">Removal</Typography>
                        )}
                      </TableCell>
                      <TableCell>{Math.abs(record.quantity)} lbs</TableCell>
                      <TableCell>{record.reason}</TableCell>
                      <TableCell>{record.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Inventory Change Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogType === 'add' ? 'Add Stock' : 'Remove Stock'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Quantity (lbs)"
              type="number"
              value={inventoryChange.quantity}
              onChange={(e) =>
                setInventoryChange((prev) => ({ ...prev, quantity: e.target.value }))
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="reason-select-label">Reason</InputLabel>
              <Select
                labelId="reason-select-label"
                id="reason-select"
                value={inventoryChange.reason}
                label="Reason"
                onChange={(e) => {
                  console.log('New reason selected:', e.target.value);
                  setInventoryChange((prev) => ({ ...prev, reason: e.target.value }));
                }}
                MenuProps={{
                  disablePortal: false,
                  container: document.body,
                  PaperProps: {
                    style: { zIndex: 2000, pointerEvents: 'auto' }
                  }
                }}
              >
                {dialogType === 'add' ? (
                  <>
                    <MenuItem value="harvest">New Harvest</MenuItem>
                    <MenuItem value="purchase">Purchase</MenuItem>
                    <MenuItem value="return">Return</MenuItem>
                    <MenuItem value="adjustment">Inventory Adjustment</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem value="sale">Sale</MenuItem>
                    <MenuItem value="damage">Damage/Spoilage</MenuItem>
                    <MenuItem value="transfer">Transfer</MenuItem>
                    <MenuItem value="adjustment">Inventory Adjustment</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
            <TextField
              label="Notes"
              value={inventoryChange.notes}
              onChange={(e) =>
                setInventoryChange((prev) => ({ ...prev, notes: e.target.value }))
              }
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInventoryChange}
            disabled={!inventoryChange.quantity || !inventoryChange.reason}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductInventory;
