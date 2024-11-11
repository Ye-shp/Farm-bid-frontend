import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Menu, 
  MenuItem, 
  IconButton, 
  Container, 
  Box,
  Button,
  Avatar,
  Fade,
  Divider,
  ListItemIcon,
  useTheme,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import GavelIcon from '@mui/icons-material/Gavel';
import PaymentsIcon from '@mui/icons-material/Payments';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
    handleMenuClose();
    setDrawerOpen(false);
  };

  const isCurrentPath = (path) => location.pathname === path;

  const getVisibleNavItems = () => {
    if (!token) {
      return [
        { label: 'Field Notes', path: '/blogs', icon: <ArticleIcon /> }
      ];
    }

    if (userRole === 'farmer') {
      return [
        { label: 'Dashboard', path: '/farmer-dashboard', icon: <DashboardIcon /> },
        { label: 'Field Notes', path: '/blogs', icon: <ArticleIcon /> },
        { label: 'Auctions', path: '/farmer-auctions', icon: <GavelIcon /> },
        { label: 'Contracts', path: '/OpenContractList', icon: <DescriptionIcon /> }
      ];
    }

    if (userRole === 'buyer') {
      return [
        { label: 'Dashboard', path: '/buyer-dashboard', icon: <DashboardIcon /> },
        { label: 'Field Notes', path: '/blogs', icon: <ArticleIcon /> },
        { label: 'Contracts', path: '/createContract', icon: <DescriptionIcon /> }
      ];
    }

    return [];
  };

  const menuItems = !token ? [
    { label: 'Login', path: '/login', icon: <LoginIcon /> },
    { label: 'Register', path: '/register', icon: <HowToRegIcon /> }
  ] : userRole === 'farmer' ? [
    { label: 'Create Field Notes', path: '/create-blog', icon: <ArticleIcon /> },
    { label: 'My Profile', path: `/user/${userId}`, icon: <PersonIcon /> },
    { label: 'Payout', path: '/Payout', icon: <PaymentsIcon /> }
  ] : userRole === 'buyer' ? [
    { label: 'Create Field Notes', path: '/create-blog', icon: <ArticleIcon /> },
    { label: 'My Profile', path: `/user/${userId}`, icon: <PersonIcon /> },
    { label: 'Checkout', path: '/CheckoutForm', icon: <PaymentsIcon /> }
  ] : [];

  const allMenuItems = [...getVisibleNavItems(), ...menuItems];
  if (token) {
    allMenuItems.push({ label: 'Logout', path: null, icon: <LogoutIcon />, onClick: handleLogout });
  }

  const desktopMenuItems = menuItems.map((item) => (
    <MenuItem
      key={item.path}
      component={Link}
      to={item.path}
      onClick={handleMenuClose}
      selected={isCurrentPath(item.path)}
      sx={{
        color: isCurrentPath(item.path) ? 'primary.main' : 'text.primary',
        '&:hover': { backgroundColor: 'action.hover' }
      }}
    >
      <ListItemIcon sx={{ color: 'inherit' }}>
        {item.icon}
      </ListItemIcon>
      {item.label}
    </MenuItem>
  ));

  return (
    <Box sx={{ mb: { xs: 7, sm: 8 } }}>
      <AppBar 
        position="fixed" 
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar 
            disableGutters 
            sx={{ 
              justifyContent: 'space-between',
              minHeight: { xs: 56, sm: 64 },
            }}
          >
            {/* Logo Section */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  fontWeight: 700,
                  letterSpacing: 1,
                  mr: 4,
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: 'primary.dark',
                  }
                }}
              >
                Elipae
              </Typography>

              {/* Desktop Navigation Items */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {getVisibleNavItems().map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    sx={{
                      minWidth: 100,
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      textTransform: 'none',
                      backgroundColor: isCurrentPath(item.path) ? 'action.selected' : 'transparent',
                      color: isCurrentPath(item.path) ? 'primary.main' : 'text.primary',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Right Side - User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Mobile Menu Button with Label */}
              <Button
                onClick={handleDrawerToggle}
                startIcon={<MenuIcon />}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Menu
              </Button>

              {/* Desktop User Menu */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <IconButton onClick={handleMenuOpen}>
                  <Avatar 
                    sx={{ 
                      bgcolor: token ? 'primary.main' : 'grey.300',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {token ? userRole?.[0]?.toUpperCase() : <PersonIcon />}
                  </Avatar>
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  TransitionComponent={Fade}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 2,
                      '& .MuiMenuItem-root': {
                        py: 1.5,
                        px: 2,
                      }
                    }
                  }}
                >
                  {desktopMenuItems}
                  {token && [
                    <Divider key="divider" sx={{ my: 1 }} />,
                    <MenuItem
                      key="logout"
                      onClick={handleLogout}
                      sx={{ 
                        color: 'error.main',
                        '&:hover': { backgroundColor: 'error.lighter' }
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit' }}>
                        <LogoutIcon />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  ]}
                </Menu>
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" color="primary">
            Menu
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ pt: 1 }}>
          {allMenuItems.map((item) => (
            <ListItem 
              key={item.label} 
              disablePadding
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  navigate(item.path);
                  handleDrawerToggle();
                }
              }}
            >
              <ListItemButton
                selected={item.path && isCurrentPath(item.path)}
                sx={{
                  py: 1.5,
                  px: 3,
                  color: item.label === 'Logout' ? 'error.main' : 
                         (item.path && isCurrentPath(item.path)) ? 'primary.main' : 'text.primary',
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                  },
                  '&:hover': {
                    backgroundColor: item.label === 'Logout' ? 'error.lighter' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit',
                  minWidth: 40,
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default Header;