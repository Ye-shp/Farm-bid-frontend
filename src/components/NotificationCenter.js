import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Tooltip,
  useTheme,
  alpha
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
  Refresh as RefreshIcon,
  NotificationsOff as NotificationsOffIcon
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

const NotificationCenter = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const socket = useSocket();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  
  const open = Boolean(anchorEl);
  
  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const API_URL = process.env.REACT_APP_API_URL || '';
      
      // Add a timeout to the request to prevent long-hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await axios.get(`${API_URL}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check if response.data exists and has the expected structure
        if (response.data && typeof response.data.total === 'number') {
          setUnreadCount(response.data.total);
        } else {
          // Default to 0 if the response doesn't have the expected structure
          setUnreadCount(0);
        }
      } catch (axiosError) {
        clearTimeout(timeoutId);
        
        // Handle specific axios errors
        if (axiosError.code === 'ERR_CANCELED') {
          console.log('Request was canceled due to timeout');
        } else if (axiosError.response?.status === 401) {
          // Handle unauthorized - might need to refresh token or redirect to login
          console.log('Unauthorized request - user might need to log in again');
        } else {
          console.error('Error fetching unread count:', axiosError);
        }
        
        // Set unread count to 0 on error
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error in fetchUnreadCount:', error);
      // Set unread count to 0 on error
      setUnreadCount(0);
    }
  }, [user]);
  
  // Fetch notifications
  const fetchNotifications = useCallback(async (reset = true) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const status = tabValue === 0 ? 'all' : tabValue === 1 ? 'unread' : 'read';
      const category = categoryFilter !== 'all' ? categoryFilter : undefined;
      
      const API_URL = process.env.REACT_APP_API_URL || '';
      let url = `${API_URL}/api/notifications/batch?status=${status}&limit=10`;
      
      if (category) {
        url += `&category=${category}`;
      }
      
      if (!reset && nextCursor) {
        url += `&before=${nextCursor}`;
      }
      
      // Add a timeout to the request to prevent long-hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check if response.data exists and has the expected structure
        if (response.data && Array.isArray(response.data.notifications)) {
          if (reset) {
            setNotifications(response.data.notifications);
          } else {
            setNotifications(prevNotifications => {
              const prevArray = Array.isArray(prevNotifications) ? prevNotifications : [];
              return [...prevArray, ...response.data.notifications];
            });
          }
          
          // Check if pagination data exists
          if (response.data.pagination) {
            setHasMore(!!response.data.pagination.hasMore);
            setNextCursor(response.data.pagination.nextCursor || null);
          } else {
            setHasMore(false);
            setNextCursor(null);
          }
        } else {
          // Default to empty array if the response doesn't have the expected structure
          if (reset) {
            setNotifications([]);
          }
          setHasMore(false);
          setNextCursor(null);
        }
      } catch (axiosError) {
        clearTimeout(timeoutId);
        
        // Handle specific axios errors
        if (axiosError.code === 'ERR_CANCELED') {
          console.log('Request was canceled due to timeout');
        } else if (axiosError.response?.status === 401) {
          // Handle unauthorized - might need to refresh token or redirect to login
          console.log('Unauthorized request - user might need to log in again');
        } else {
          console.error('Error fetching notifications:', axiosError);
          showSnackbar('Failed to load notifications', 'error');
        }
        
        // Set notifications to empty array on error if resetting
        if (reset) {
          setNotifications([]);
        }
        setHasMore(false);
        setNextCursor(null);
      }
      
      // Also update unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      showSnackbar('Failed to load notifications', 'error');
      // Set notifications to empty array on error if resetting
      if (reset) {
        setNotifications([]);
      }
      setHasMore(false);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }, [user, tabValue, categoryFilter, nextCursor, fetchUnreadCount, showSnackbar]);
  
  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user, fetchUnreadCount]);
  
  // Fetch when menu opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);
  
  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
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
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const API_URL = process.env.REACT_APP_API_URL || '';
      await axios.put(`${API_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prevNotifications => {
        // Ensure prevNotifications is an array
        const prevArray = Array.isArray(prevNotifications) ? prevNotifications : [];
        return prevArray.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        );
      });
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showSnackbar('Failed to mark notification as read', 'error');
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const API_URL = process.env.REACT_APP_API_URL || '';
      await axios.put(`${API_URL}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prevNotifications => {
        // Ensure prevNotifications is an array
        const prevArray = Array.isArray(prevNotifications) ? prevNotifications : [];
        return prevArray.map(notification => ({ ...notification, read: true }));
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
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const API_URL = process.env.REACT_APP_API_URL || '';
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prevNotifications => {
        // Ensure prevNotifications is an array
        const prevArray = Array.isArray(prevNotifications) ? prevNotifications : [];
        return prevArray.filter(notification => notification._id !== notificationId);
      });
      
      showSnackbar('Notification deleted', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showSnackbar('Failed to delete notification', 'error');
    }
  };
  
  // Handle delete all notifications
  const handleDeleteAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const API_URL = process.env.REACT_APP_API_URL || '';
      await axios.delete(`${API_URL}/api/notifications/delete-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
    if (!notification || !notification._id) return;
    
    // Mark as read if not already
    const isRead = notification.read || (notification.status && notification.status.read);
    if (!isRead) {
      handleMarkAsRead(notification._id);
    }
    
    // Navigate to the action URL if available
    if (notification.action?.url) {
      navigate(notification.action.url);
      handleMenuClose();
    }
  };
  
  // Handle load more
  const handleLoadMore = () => {
    fetchNotifications(false);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchNotifications(true);
  };
  
  // Render notification item
  const renderNotificationItem = (notification) => {
    // Ensure notification has all required fields
    if (!notification || !notification._id) {
      return null;
    }
    
    // Handle different schema structures for read status
    const isRead = notification.read || (notification.status && notification.status.read);
    
    return (
      <ListItem
        key={notification._id}
        alignItems="flex-start"
        sx={{
          borderRadius: 1,
          mb: 1,
          backgroundColor: isRead ? 'transparent' : alpha(theme.palette.primary.light, 0.1),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.light, 0.05),
          },
          cursor: 'pointer',
        }}
        onClick={() => handleNotificationClick(notification)}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: theme.palette[getPriorityColor(notification.priority || 'low')].main }}>
            {getNotificationIcon(notification.type)}
          </Avatar>
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: isRead ? 400 : 600 }}>
                {notification.title || 'Notification'}
              </Typography>
              <Chip 
                size="small" 
                label={notification.category || 'system'} 
                color={getPriorityColor(notification.priority || 'low')}
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
          }
          secondary={
            <>
              <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                {notification.message || 'No message content'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {formatRelativeTime(notification.createdAt || new Date())}
              </Typography>
            </>
          }
        />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
          {!isRead && (
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
      </ListItem>
    );
  };
  
  // Setup socket listeners
  useEffect(() => {
    if (!socket || !user) return;
    
    const handleNotification = (notification) => {
      console.log('Received notification in NotificationCenter:', notification);
      
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
            setUnreadCount(count => count + 1);
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
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleMenuOpen}
          size="large"
          aria-label="show notifications"
          color="inherit"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 360,
            maxWidth: '100%',
            maxHeight: '80vh',
            borderRadius: 2,
            overflow: 'hidden',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Notifications</Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete all">
              <IconButton size="small" onClick={handleDeleteAllNotifications} disabled={notifications.length === 0}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider />
        
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
        
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label="All"
            size="small"
            color={categoryFilter === 'all' ? 'primary' : 'default'}
            onClick={() => handleCategoryChange('all')}
            sx={{ m: 0.5 }}
          />
          <Chip
            label="Payment"
            size="small"
            color={categoryFilter === 'payment' ? 'primary' : 'default'}
            onClick={() => handleCategoryChange('payment')}
            sx={{ m: 0.5 }}
          />
          <Chip
            label="Auction"
            size="small"
            color={categoryFilter === 'auction' ? 'primary' : 'default'}
            onClick={() => handleCategoryChange('auction')}
            sx={{ m: 0.5 }}
          />
          <Chip
            label="Contract"
            size="small"
            color={categoryFilter === 'contract' ? 'primary' : 'default'}
            onClick={() => handleCategoryChange('contract')}
            sx={{ m: 0.5 }}
          />
          <Chip
            label="System"
            size="small"
            color={categoryFilter === 'system' ? 'primary' : 'default'}
            onClick={() => handleCategoryChange('system')}
            sx={{ m: 0.5 }}
          />
        </Box>
        
        <List sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="textSecondary">No notifications</Typography>
            </Box>
          ) : (
            <>
              {Array.isArray(notifications) && notifications.map(renderNotificationItem)}
              {hasMore && (
                <Box sx={{ p: 1, textAlign: 'center' }}>
                  <Button size="small" onClick={handleLoadMore} disabled={loading}>
                    {loading ? <CircularProgress size={16} /> : 'Load More'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </List>
        
        <Divider />
        
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Button 
            variant="text" 
            size="small" 
            onClick={() => {
              navigate('/notifications');
              handleMenuClose();
            }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationCenter; 