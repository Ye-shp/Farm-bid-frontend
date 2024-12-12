// HomePage.js
import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import { 
  ArrowForward, 
  LocalFlorist, 
  EmojiNature, 
  Handshake // Changed from Eco to Handshake
} from '@mui/icons-material';
import FeaturedFarms from './FeaturedFarms';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const FeatureCard = ({ icon: Icon, title, description }) => (
    <Paper 
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Icon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Fade in timeout={1000}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
          {/* Hero Section */}
          <Paper 
            elevation={0}
            sx={{
              py: { xs: 6, md: 10 },
              px: { xs: 3, md: 6 },
              mb: 6,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              color: 'white',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                backgroundImage: 'url("/path-to-pattern.png")', // Add a subtle pattern image
                backgroundSize: 'cover',
              }}
            />
            <Typography 
              variant={isMobile ? "h3" : "h2"} 
              component="h1" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Welcome to Elipae Marketplace
            </Typography>
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ mb: 4 }}
            >
              Bid on fresh produce directly from local farmers.
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                Login
              </Button>
            </Box>
          </Paper>

          {/* Mission Statement */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, md: 6 }, 
              mb: 6, 
              bgcolor: 'background.paper', 
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: 'primary.main',
              }}
            >
              Our Mission
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 1.8,
                color: 'text.secondary',
                fontSize: '1.1rem',
              }}
            >
              At Elipae, we empower farmers by transforming surplus into opportunity. Our platform connects local farmers with buyers, ensuring fair pricing and reducing waste. We're building a sustainable future where communities thrive through transparent, accessible, and efficient agricultural commerce.
            </Typography>
          </Paper>

          {/* Features Grid */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={LocalFlorist}
                title="Fresh Produce"
                description="Direct access to locally grown, seasonal produce from trusted farmers"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={EmojiNature}
                title="Sustainable Practices"
                description="Supporting environmentally conscious farming methods"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={Handshake} // Changed icon here
                title="Community Impact"
                description="Strengthening local economies through fair agricultural trade"
              />
            </Grid>
          </Grid>

          {/* Featured Farms Section */}
          <Box sx={{ mt: 8 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                mb: 4,
              }}
            >
              Featured Farms
            </Typography>
            <FeaturedFarms />
          </Box>
        </Container>
      </Fade>
    </Box>
  );
};

export default HomePage;