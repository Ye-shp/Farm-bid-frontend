import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  MarkEmailRead as MarkEmailReadIcon,
  DeleteSweep as DeleteSweepIcon,
  NotificationsOff as NotificationsOffIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useSocket } from '../context/SocketContext';

// Map notification types to icons
const getNotificationIcon = (type) => {
  const typePrefix = type?.split('_')[0];
  
  switch (typePrefix) {
    case 'payment':
      return <PaymentIcon />;
    case 'auction':
      return <GavelIcon />;
    case 'contract':
      return <DescriptionIcon />;
    case 'system':
      return <InfoIcon />;
    case 'user':
      return <PersonIcon />;
    default:
      return <NotificationsIcon />;
  }
};

// Format relative time (e.g., "2 hours ago")
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  return date.toLocaleDateString();
};

// Get priority color
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'error';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

const NotificationsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const socket = useSocket();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  
  // Get API URL and auth token
  const API_URL = process.env.REACT_APP_API_URL || '';
  
  // Helper function to get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, []);
  
  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/unread-count`, getAuthHeaders());
      setUnreadCount(response.data.total);
      setCategoryCounts(response.data.byCategory || {});
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [API_URL, getAuthHeaders]);
  
  // Fetch notifications
  const fetchNotifications = useCallback(async (reset = true) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const status = tabValue === 0 ? 'all' : tabValue === 1 ? 'unread' : 'read';
      const category = categoryFilter !== 'all' ? categoryFilter : undefined;
      
      let url = `${API_URL}/api/notifications/batch?status=${status}&limit=20`;
      
      if (category) {
        url += `&category=${category}`;
      }
      
      if (!reset && nextCursor) {
        url += `&before=${nextCursor}`;
      }
      
      const response = await axios.get(url, getAuthHeaders());
      
      if (reset) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications(prevNotifications => {
          // Ensure prevNotifications is an array
          const prevArray = Array.isArray(prevNotifications) ? prevNotifications : [];
          return [...prevArray, ...response.data.notifications];
        });
      }
      
      setHasMore(response.data.pagination.hasMore);
      setNextCursor(response.data.pagination.nextCursor);
      
      // Also update unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showSnackbar('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, tabValue, categoryFilter, nextCursor, fetchUnreadCount, showSnackbar, API_URL, getAuthHeaders]);
  
  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [user, fetchUnreadCount, fetchNotifications]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    fetchNotifications(true);
  };
  
  // Handle category filter change
  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    fetchNotifications(true);
  };
  
  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${notificationId}/read`, {}, getAuthHeaders());
      
      // Update local state
      setNotifications(prevNotifications => {
        // Ensure prevNotifications is an array
        const prevArray = Array.isArray(prevNotifications) ? prevNotifications : [];
        return prevArray.map(notification => 
          notification._id === notificationId 
            ? { ...notification, status: { ...notification.status, read: true, readAt: new Date() } } 
            : notification
        );
      });
      
      // Update unread count
      fetchUnreadCount();
      
      showSnackbar('Notification marked as read', 'success');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showSnackbar('Failed to mark notification as read', 'error');
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/api/notifications/mark-all-read`, {}, getAuthHeaders());
      
      // Update local state
      setNotifications(prevNotifications => {
        // Ensure prevNotifications is an array
        const prevArray = Array.isArray(prevNotifications) ? prevNotifications : [];
        return prevArray.map(notification => ({
          ...notification,
          status: { ...notification.status, read: true, readAt: new Date() }
        }));
      });
      
      // Update unread count
      setUnreadCount(0);
      
      showSnackbar('All notifications marked as read', 'success');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showSnackbar('Failed to mark all notifications as read', 'error');
    }
  };
  
  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, getAuthHeaders());
      
      // Update local state
      setNotifications(prevNotifications => {
        // Ensure prevNotifications is an array
        const prevArray = Array.isArray(prevNotifications) ? prevNotifications : [];
        return prevArray.filter(notification => notification._id !== notificationId);
      });
      
      // Update unread count if needed
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.status?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      showSnackbar('Notification deleted', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showSnackbar('Failed to delete notification', 'error');
    }
  };
  
  // Handle delete all notifications
  const handleDeleteAllNotifications = async () => {
    try {
      await axios.delete(`${API_URL}/api/notifications/delete-all`, getAuthHeaders());
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      
      showSnackbar('All notifications deleted', 'success');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      showSnackbar('Failed to delete all notifications', 'error');
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification) return;
    
    // Mark as read if not already
    if (notification.status && !notification.status.read) {
      handleMarkAsRead(notification._id);
    }
  };
  
  // Handle load more
  const handleLoadMore = () => {
    fetchNotifications(false);
  };
  
  // Setup socket listeners
  useEffect(() => {
    if (!socket || !user) return;
    
    const handleNotification = (notification) => {
      console.log('Received notification in NotificationsPage:', notification);
      
      // Update notifications list if it's for the current user
      if (notification.user === user.id || notification.user === user._id) {
        // Add to notifications list if not already present
        setNotifications(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          const exists = prevArray.some(n => n._id === notification._id);
          
          if (exists) {
            return prevArray.map(n => n._id === notification._id ? notification : n);
          } else {
            // Increment unread count for new notifications
            if (!notification.status?.read) {
              setUnreadCount(count => count + 1);
            }
            return [notification, ...prevArray];
          }
        });
        
        // Show snackbar for new notifications
        if (notification.message) {
          showSnackbar(notification.message, 'info');
        }
      }
    };
    
    // Listen for both event types to ensure we catch all notifications
    socket.on('notification', handleNotification);
    socket.on('notificationUpdate', handleNotification);
    
    return () => {
      socket.off('notification', handleNotification);
      socket.off('notificationUpdate', handleNotification);
    };
  }, [socket, user, showSnackbar]);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Notifications
      </Typography>
      
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              
              <List disablePadding>
                <ListItem 
                  button 
                  selected={categoryFilter === 'all'}
                  onClick={() => handleCategoryChange('all')}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <NotificationsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="All Notifications" 
                    secondary={`${notifications.length} total`}
                  />
                </ListItem>
                
                <ListItem 
                  button 
                  selected={categoryFilter === 'payment'}
                  onClick={() => handleCategoryChange('payment')}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                      <PaymentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Payments" 
                    secondary={`${categoryCounts.PAYMENT || 0} unread`}
                  />
                </ListItem>
                
                <ListItem 
                  button 
                  selected={categoryFilter === 'auction'}
                  onClick={() => handleCategoryChange('auction')}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                      <GavelIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Auctions" 
                    secondary={`${categoryCounts.AUCTION || 0} unread`}
                  />
                </ListItem>
                
                <ListItem 
                  button 
                  selected={categoryFilter === 'contract'}
                  onClick={() => handleCategoryChange('contract')}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                      <DescriptionIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Contracts" 
                    secondary={`${categoryCounts.CONTRACT || 0} unread`}
                  />
                </ListItem>
                
                <ListItem 
                  button 
                  selected={categoryFilter === 'system'}
                  onClick={() => handleCategoryChange('system')}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                      <InfoIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="System" 
                    secondary={`${categoryCounts.SYSTEM || 0} unread`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<MarkEmailReadIcon />}
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                sx={{ mb: 2 }}
              >
                Mark All as Read
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={handleDeleteAllNotifications}
                disabled={notifications.length === 0}
              >
                Delete All
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="All" />
              <Tab label={`Unread (${unreadCount})`} />
              <Tab label="Read" />
            </Tabs>
            
            <Box sx={{ p: 2 }}>
              {loading && notifications.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : notifications.length > 0 ? (
                <>
                  <List>
                    {notifications.map((notification) => (
                      <React.Fragment key={notification._id}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            borderRadius: 1,
                            py: 2,
                            backgroundColor: notification.status.read ? 'transparent' : alpha(theme.palette.primary.light, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.light, 0.05),
                            },
                            cursor: 'pointer',
                          }}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette[getPriorityColor(notification.priority)].main }}>
                              {getNotificationIcon(notification.type)}
                            </Avatar>
                          </ListItemAvatar>
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: notification.status.read ? 400 : 600 }}>
                                  {notification.title}
                                </Typography>
                                <Box>
                                  <Chip 
                                    size="small" 
                                    label={notification.category} 
                                    color={getPriorityColor(notification.priority)}
                                    sx={{ mr: 1 }}
                                  />
                                  <Chip 
                                    size="small" 
                                    label={notification.priority} 
                                    color={getPriorityColor(notification.priority)}
                                  />
                                </Box>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
                                  {notification.message}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatRelativeTime(notification.createdAt)}
                                  </Typography>
                                  
                                  <Box>
                                    {!notification.status.read && (
                                      <Tooltip title="Mark as read">
                                        <IconButton size="small" onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkAsRead(notification._id);
                                        }}>
                                          <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    
                                    <Tooltip title="Delete">
                                      <IconButton size="small" onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNotification(notification._id);
                                      }}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                  
                  {hasMore && (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Button 
                        variant="outlined" 
                        onClick={handleLoadMore}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                        Load More
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 6
                }}>
                  <NotificationsOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No notifications found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {tabValue === 0 
                      ? "You don't have any notifications yet" 
                      : tabValue === 1 
                        ? "You don't have any unread notifications" 
                        : "You don't have any read notifications"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default NotificationsPage; 