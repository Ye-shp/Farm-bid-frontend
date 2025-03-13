// BuyerDashboard.js

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  useMediaQuery,
  ListItemSecondaryAction,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  GavelRounded,
  LocalOfferRounded,
  TimelapseRounded,
  ArrowUpward,
  AddCircleOutline,
  ListAlt,
  Payment as PaymentIcon,
  Close as CloseIcon,
  ShoppingBasket,
  Handshake,
} from "@mui/icons-material";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import SearchBar from "./SearchBar";
import PaymentForm from "./payment/PaymentForm";
import TransactionStatus from "./payment/TransactionStatus";
import { useSocket } from "../context/SocketContext";
import paymentService from "../Services/paymentService";
import { alpha } from "@mui/material/styles";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const AuctionCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const NotificationDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: 340,
    padding: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(2),
  },
}));

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  [theme.breakpoints.up("sm")]: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
}));

const TimeDisplay = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  color: theme.palette.warning.main,
}));

const SearchBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
}));

const NotificationItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  cursor: "pointer",
}));

const StatsContainer = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [bidAmount, setBidAmount] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [timeRemaining, setTimeRemaining] = useState({});
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    auctionId: null,
    bidId: null,
    sourceId: null,
    sourceType: null,
    amount: 0,
    sellerId: 0,
    title: "",
    clientSecret: "",
  });

  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;

  // Configure axios defaults
  axios.defaults.baseURL = `${API_URL}/api`;
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.withCredentials = true;

  const isAuctionExpired = useCallback((endTime) => {
    return new Date() > new Date(endTime);
  }, []);

  const updateAuctionTimes = useCallback(() => {
    setAuctions((currentAuctions) => {
      const updatedAuctions = currentAuctions.filter(
        (auction) => !isAuctionExpired(auction.endTime)
      );

      const newTimeRemaining = {};
      updatedAuctions.forEach((auction) => {
        const remaining = new Date(auction.endTime) - new Date();
        newTimeRemaining[auction._id] = remaining > 0 ? remaining : 0;
      });
      setTimeRemaining(newTimeRemaining);

      return updatedAuctions;
    });
  }, [isAuctionExpired]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get("/auctions");

        const activeAuctions = response.data.filter(
          (auction) =>
            auction.status === "active" && !isAuctionExpired(auction.endTime)
        );

        setAuctions(activeAuctions);

        const initialTimeRemaining = {};
        activeAuctions.forEach((auction) => {
          const remaining = new Date(auction.endTime) - new Date();
          initialTimeRemaining[auction._id] = remaining > 0 ? remaining : 0;
        });
        setTimeRemaining(initialTimeRemaining);
      } catch (error) {
        console.error("Error fetching auctions:", error);
        showSnackbar("Error fetching auctions", "error");
      }
    };

    fetchAuctions();

    const timeInterval = setInterval(updateAuctionTimes, 1000);
    return () => clearInterval(timeInterval);
  }, [token, isAuctionExpired, updateAuctionTimes]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(
          "https://ipinfo.io/json?token=80139ee7708eb3",
          {
            withCredentials: false,
          }
        );
        const loc = response.data.loc.split(",");
        setLocation({
          latitude: loc[0],
          longitude: loc[1],
        });
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    if (!socket) {
      console.log("Socket not available for notifications");
      return;
    }

    console.log("Setting up notification listener");
    const handleNewNotification = (notification) => {
      console.log("Received new notification:", notification);
      setNotifications((prev) => {
        // Ensure prev is an array
        const prevArray = Array.isArray(prev) ? prev : [];
        
        // Check if notification already exists
        const exists = prevArray.some((n) => n._id === notification._id);
        if (exists) {
          return prevArray.map((n) =>
            n._id === notification._id ? notification : n
          );
        }
        // Add new notification and update unread count
        setUnreadCount((count) => count + 1);
        showSnackbar(notification.message, "info");
        return [notification, ...prevArray];
      });
    };

    // Listen for both event types to ensure we catch all notifications
    socket.on("notificationUpdate", handleNewNotification);
    socket.on("notification", handleNewNotification);

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        console.log("Fetching initial notifications");
        const response = await axios.get("/notifications");
        console.log("Initial notifications:", response.data);
        // Ensure notifications is an array
        const notificationsArray = Array.isArray(response.data) ? response.data : [];
        setNotifications(notificationsArray);
        setUnreadCount(notificationsArray.filter((n) => !n.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        showSnackbar("Error fetching notifications", "error");
        // Set notifications to empty array on error
        setNotifications([]);
      }
    };

    fetchNotifications();

    return () => {
      console.log("Cleaning up notification listener");
      socket.off("notificationUpdate", handleNewNotification);
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return "Auction ended";

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    if (minutes > 0) return `${minutes}m ${seconds}s remaining`;
    return `${seconds}s remaining`;
  };

  const handleBidChange = (auctionId, value) => {
    setBidAmount({
      ...bidAmount,
      [auctionId]: value,
    });
  };

  const handleBidSubmit = async (auctionId) => {
    try {
      const auction = auctions.find((a) => a._id === auctionId);
      const bidValue = parseFloat(bidAmount[auctionId]);

      if (!bidValue || isNaN(bidValue)) {
        showSnackbar("Please enter a valid bid amount", "error");
        return;
      }

      if (bidValue <= auction.highestBid) {
        showSnackbar(
          "Bid must be higher than the current highest bid",
          "error"
        );
        return;
      }

      if (timeRemaining[auctionId] <= 0) {
        showSnackbar("This auction has ended", "error");
        return;
      }

      await axios.post(`/auctions/${auctionId}/bid`, { bidAmount: bidValue });

      showSnackbar("Bid submitted successfully!", "success");
      setBidAmount((prev) => ({ ...prev, [auctionId]: "" }));

      const response = await axios.get("/auctions");

      const activeAuctions = response.data.filter(
        (auction) =>
          auction.status === "active" && !isAuctionExpired(auction.endTime)
      );
      setAuctions(activeAuctions);
    } catch (error) {
      console.error("Error submitting bid:", error);
      showSnackbar(
        error.response?.data?.message || "Error submitting bid",
        "error"
      );
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`);
      setNotifications((prev) => {
        // Ensure prev is an array
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        );
      });
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showSnackbar("Error marking notification as read", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleViewFarmerProfile = (farmerId) => {
    navigate(`/users/${farmerId}`);
  };

  const handlePaymentClick = async (auctionId, amount, bidId) => {
    try {
      const response = await paymentService.createPaymentIntent({
        amount,
        sourceType: "auction",
        sourceId: auctionId,
        sellerId: auctions.find((a) => a._id === auctionId)?.sellerId,
        bidId: bidId, // Add bidId to the payment intent creation
      });

      setPaymentModal({
        open: true,
        auctionId,
        bidId,
        sourceId,
        sourceType,
        amount,
        sellerId,
        title:
          auctions.find((a) => a._id === auctionId)?.title || "Auction Payment",
        clientSecret: response.clientSecret,
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      showSnackbar(
        error.response?.data?.message || "Error initiating payment",
        "error"
      );
    }
  };

  const handlePaymentSuccess = async (auctionId) => {
    setPaymentModal((prev) => ({ ...prev, open: false }));
    showSnackbar("Payment successful!", "success");
    // Refresh notifications after successful payment
    try {
      const response = await axios.get("/notifications");
      // Ensure notifications is an array
      const notificationsArray = Array.isArray(response.data) ? response.data : [];
      setNotifications(notificationsArray);
      setUnreadCount(notificationsArray.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications after payment:", error);
      // Don't update notifications on error
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark notification as read
    await markAsRead(notification._id);

    if (notification.type === "auction_won" && notification.metadata) {
      const auctionId = notification.reference?.id;
      const amount = notification.metadata?.amount;
      const title = notification.title;

      if (!auctionId || !bidId) {
        console.error("Missing required payment data:", notification.metadata);
        showSnackbar("Error: Missing payment information", "error");
        return;
      }

      try {
        const response = await paymentService.createPaymentIntent({
          amount,
          sourceType: "auction",
          sourceId: auctionId,
          bidId: bidId,
          sellerId: auctions.find((a) => a._id === auctionId)?.sellerId,
        });

        setPaymentModal({
          open: true,
          auctionId,
          bidId,
          sourceId,
          sourceType,
          amount,
          sellerId,
          title,
          clientSecret: response.clientSecret,
        });

        setDrawerOpen(false);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        showSnackbar(
          error.response?.data?.message || "Error initiating payment",
          "error"
        );
      }
    }
  };

  const handlePaymentClickFromNotification = async (notification) => {
    try {
      // Get auction details first
      const auctionResponse = await axios.get(
        `/auctions/${notification.metadata.auctionId}`
      );
      const auction = auctionResponse.data;

      // Create payment intent
      const response = await axios.post(
        `/auctions/${notification.metadata.auctionId}/payment-intent`,
        { amount: auction.winningBid.amount }
      );

      setPaymentModal({
        open: true,
        auctionId: notification.metadata.auctionId,
        bidId: notification.metadata.bidId,
        sourceId: response.data.sourceId,
        sourceType: response.data.sourceType,
        amount: auction.winningBid.amount,
        sellerId: response.data.sellerId,
        title: auction.product.title,
        clientSecret: response.data.clientSecret,
      });
    } catch (error) {
      console.error("Payment error:", error);
      showSnackbar(
        error.response?.data?.message || "Error initiating payment",
        "error"
      );
    }
  };

  return (
    <PageContainer maxWidth="xl">
      {/* Header Section */}
      <HeaderBox>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            component="h1"
            fontWeight="bold"
            sx={{
              background: theme.palette.primary.main,
              color: "white",
              padding: theme.spacing(2, 3),
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[3],
            }}
          >
            Buyer Dashboard
          </Typography>
        </Box>
        <IconButton
          color="primary"
          onClick={() => setDrawerOpen(true)}
          sx={{
            backgroundColor: theme.palette.grey[100],
            "&:hover": {
              backgroundColor: theme.palette.grey[200],
            },
          }}
        >
          <StyledBadge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </StyledBadge>
        </IconButton>
      </HeaderBox>

      {/* Quick Stats Section */}
      <StatsContainer container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={2}>
            <ShoppingBasket color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h4" color="primary">
              {auctions.length}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Active Auctions
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={2}>
            <GavelRounded color="secondary" sx={{ fontSize: 40 }} />
            <Typography variant="h4" color="secondary">
              {Array.isArray(notifications) ? notifications.filter(n => n.type === 'bid_placed').length : 0}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Your Active Bids
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={2}>
            <Handshake color="success" sx={{ fontSize: 40 }} />
            <Typography variant="h4" color="success.main">
              {Array.isArray(notifications) ? notifications.filter(n => n.type === 'auction_won').length : 0}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Auctions Won
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={2}>
            <PaymentIcon color="info" sx={{ fontSize: 40 }} />
            <Typography variant="h4" color="info.main">
              {Array.isArray(notifications) ? notifications.filter(n => n.type === 'transaction_completed').length : 0}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Completed Purchases
            </Typography>
          </StatCard>
        </Grid>
      </StatsContainer>

      {/* Recent Transactions Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Recent Transactions
        </Typography>
        <Grid container spacing={3}>
          {notifications
            .filter(n => n.type === 'transaction_completed')
            .slice(0, 3)
            .map((transaction, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {transaction.message}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Search Section */}
      <SearchBox>
        <SearchBar onSearchResults={handleSearchResults} />
      </SearchBox>

      {/* Display search results if available */}
      {searchResults.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Search Results ({searchResults.length} farms found)
          </Typography>
          <Grid container spacing={3}>
            {searchResults.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[4],
                    },
                    cursor: "pointer",
                  }}
                  onClick={() => handleViewFarmerProfile(product.user._id)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {product.user.username || "Farm Name Not Set"}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {product.user.firstName} {product.user.lastName}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body1"
                        color="textPrimary"
                        sx={{ mb: 0.5 }}
                      >
                        Product: {product.title || product.customProduct}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Category: {product.category}
                      </Typography>
                      {product.description && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mt: 1 }}
                        >
                          {product.description}
                        </Typography>
                      )}
                    </Box>
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                    >
                      {product.user.deliveryAvailable && (
                        <Chip
                          label="Delivery Available"
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {product.user.wholesaleAvailable && (
                        <Chip
                          label="Wholesale Available"
                          color="secondary"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {product.user.location && (
                        <Chip
                          label={`${
                            product.user.location.city || "Location Available"
                          }`}
                          color="info"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontStyle: "italic", mb: 2 }}
                    >
                      Click to view full profile
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Show message when no results */}
      {searchResults.length === 0 && (
        <Box sx={{ mb: 4, textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="textSecondary">
            Use the search filters above to find farms
          </Typography>
        </Box>
      )}

      {/* Auctions Section Header */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 600,
          mt: 4,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        Active Auctions
      </Typography>

      {/* Existing Auctions Section */}
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {auctions.map((auction) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={auction._id}>
            <AuctionCard>
              <CardMedia
                component="img"
                height="240"
                image={auction.product?.imageUrl || "/placeholder-image.jpg"}
                alt={auction.product?.title || "Product Image"}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1, p: theme.spacing(3) }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    height: "2.4em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {auction.product?.title || "Untitled Product"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 3,
                    height: "3.6em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {auction.product?.description || "No description available"}
                </Typography>

                <TimeDisplay>
                  <TimelapseRounded sx={{ mr: 1 }} />
                  <Typography
                    variant="body2"
                    color="inherit"
                    fontWeight="medium"
                  >
                    {formatTimeRemaining(timeRemaining[auction._id])}
                  </Typography>
                </TimeDisplay>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <GavelRounded sx={{ mr: 1, color: "primary.main" }} />
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

                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <ArrowUpward sx={{ mr: 1, color: "success.main" }} />
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

                <Box sx={{ mt: "auto" }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Your Bid Amount"
                    value={bidAmount[auction._id] || ""}
                    onChange={(e) =>
                      handleBidChange(auction._id, e.target.value)
                    }
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                    disabled={timeRemaining[auction._id] <= 0}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleBidSubmit(auction._id)}
                    startIcon={<LocalOfferRounded />}
                    disabled={timeRemaining[auction._id] <= 0}
                    sx={{
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    {timeRemaining[auction._id] <= 0
                      ? "Auction Ended"
                      : "Place Bid"}
                  </Button>
                </Box>
              </CardContent>
            </AuctionCard>
          </Grid>
        ))}
      </Grid>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 400 } },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Notifications</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ width: "100%" }}>
            {Array.isArray(notifications) && notifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read
                      ? "transparent"
                      : alpha(theme.palette.primary.light, 0.1),
                    "&:hover": {
                      backgroundColor: alpha(
                        theme.palette.primary.light,
                        0.05
                      ),
                    },
                  }}
                >
                  <ListItemText
                    primary={notification.message}
                    secondary={formatDistanceToNow(
                      new Date(notification.createdAt),
                      { addSuffix: true }
                    )}
                  />
                  {notification.type === "auction_won" &&
                    notification.metadata?.auctionId && (
                      <ListItemSecondaryAction>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<PaymentIcon />}
                          onClick={() =>
                            handlePaymentClickFromNotification(notification)
                          }
                        >
                          Pay Now
                        </Button>
                      </ListItemSecondaryAction>
                    )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {(!Array.isArray(notifications) || notifications.length === 0) && (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  secondary="You don't have any notifications yet"
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Payment Dialog */}
      <Dialog
        open={paymentModal.open}
        onClose={() => setPaymentModal((prev) => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Purchase</DialogTitle>
        <DialogContent>
          <PaymentForm
            amount={paymentModal.amount}
            sourceType="auction"
            sourceId={paymentModal.auctionId}
            sellerId={paymentModal.sellerId}
            bidId={paymentModal.bidId}
            onSuccess={handlePaymentSuccess}
            onError={(error) => console.error("Payment error:", error)}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar for Alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default BuyerDashboard;
