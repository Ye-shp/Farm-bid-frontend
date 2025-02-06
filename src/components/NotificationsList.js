import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  Box,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

const NotificationsList = ({
  showNotifications,
  setShowNotifications,
  notifications,
  unreadCount,
  handleMarkAsRead,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={showNotifications}
      onClose={() => setShowNotifications(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <NotificationsIcon sx={{ mr: 1 }} />
          Notifications
          <Chip label={unreadCount} color="error" size="small" sx={{ ml: 2 }} />
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          {notifications? ( // Conditionally render the list items
            notifications.map((notification) => (
              <ListItem
                key={notification._id}
                sx={{
                  backgroundColor: notification.read
                  ? "transparent"
                  : theme.palette.action.selected,
                  borderRadius: 2,
                  mb: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <NotificationsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.createdAt).toLocaleString()}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                <IconButton onClick={() => handleMarkAsRead(notification._id)}>
                  <CheckIcon color="action" />
                </IconButton>
              </ListItem>
            ))
          ): (
            <Typography variant="body2" color="textSecondary" align="center">
              No notifications yet.
            </Typography>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowNotifications(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationsList;