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
  Badge
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

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
    handleMenuClose();
  };

  const isCurrentPath = (path) => location.pathname === path;

  const getVisibleNavItems = () => {
    if (!token) {
      return [
        { label: 'Field Notes', path: '/blogs', icon: <ArticleIcon sx={{ mr: 0.5 }} /> }
      ];
    }

    if (userRole === 'farmer') {
      return [
        { label: 'Dashboard', path: '/farmer-dashboard', icon: <DashboardIcon sx={{ mr: 0.5 }} /> },
        { label: 'Field Notes', path: '/blogs', icon: <ArticleIcon sx={{ mr: 0.5 }} /> },
        { label: 'Auctions', path: '/farmer-auctions', icon: <GavelIcon sx={{ mr: 0.5 }} /> },
        { label: 'Contracts', path: '/OpenContractList', icon: <DescriptionIcon sx={{ mr: 0.5 }} /> }
      ];
    }

    if (userRole === 'buyer') {
      return [
        { label: 'Dashboard', path: '/buyer-dashboard', icon: <DashboardIcon sx={{ mr: 0.5 }} /> },
        { label: 'Field Notes', path: '/blogs', icon: <ArticleIcon sx={{ mr: 0.5 }} /> },
        { label: 'Contracts', path: '/createContract', icon: <DescriptionIcon sx={{ mr: 0.5 }} /> }
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

  return (
    <AppBar 
      position="fixed" 
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters 
          sx={{ 
            justifyContent: 'space-between',
            minHeight: 64,
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
            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              sx={{ display: { xs: 'flex', md: 'none' } }}
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>

            {/* User Avatar & Menu */}
            <Box>
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
              
              {/* Desktop Menu */}
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
                {menuItems.map((item) => (
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
                ))}

                {token && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem
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
                  </>
                )}
              </Menu>

              {/* Mobile Menu */}
              <Menu
                anchorEl={mobileMenuAnchorEl}
                open={Boolean(mobileMenuAnchorEl)}
                onClose={handleMenuClose}
                TransitionComponent={Fade}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                  }
                }}
              >
                {getVisibleNavItems().map((item) => (
                  <MenuItem
                    key={item.path}
                    component={Link}
                    to={item.path}
                    onClick={handleMenuClose}
                    selected={isCurrentPath(item.path)}
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;