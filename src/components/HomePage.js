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
  Handshake,
  Article
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FeaturedFarms from './FeaturedFarms';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

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
                mb: 3
              }}
            >
              Welcome to Elipae Marketplace
            </Typography>
            <Typography 
              variant="h5" 
              align="center"
              sx={{ 
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
                letterSpacing: '0.5px',
                mb: 4
              }}
            >
              The First Agricultural Exchange Platform That Turns Every Local Farm Into a Qualified Retail Supplier Within 24 Hours
            </Typography>
            <Typography 
              variant="body1" 
              align="center"
              sx={{ 
                maxWidth: '800px',
                mx: 'auto',
                mb: 4,
                color: 'rgba(255,255,255,0.9)'
              }}
            >
              We're creating the largest network of retail-ready local farms in America, transforming a $350B fragmented market into an efficient digital exchange
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="text"
                size="large"
                onClick={() => navigate('/blog')}
                endIcon={<Article />}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Read Our Latest Articles
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
              At Elipae, we empower farmers by transforming surplus into opportunity and simplifying their journey to major retail markets. Our platform streamlines the vendor intake process, eliminating the hassle of multiple forms and applications that farmers typically face. We connect local farmers directly with retail buyers, ensuring fair pricing and reducing waste, while handling all the paperwork complexity. We're building a sustainable future where communities thrive through transparent, accessible, and efficient agricultural commerce that bridges the gap between local farms and large retail stores.
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

          {/* Featured Articles Section */}
          <Box 
            id="featured-articles"
            sx={{ 
              mt: 8,
              position: 'relative',
              scrollMarginTop: '2rem',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 100,
                height: 4,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                borderRadius: 2,
              }
            }}
          >
            <Typography 
              variant="h3" 
              component="h2" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                position: 'relative',
                display: 'inline-block',
                left: '50%',
                transform: 'translateX(-50%)',
                px: 2,
              }}
            >
              Featured Articles
            </Typography>
            <Typography 
              variant="h6" 
              align="center" 
              sx={{ 
                mb: 6,
                color: 'text.secondary',
                maxWidth: '600px',
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.6
              }}
            >
              Discover the latest insights and stories from our thriving agricultural community
            </Typography>
            <Box sx={{ 
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                zIndex: -1
              }
            }}>
              <FeaturedFarms />
            </Box>
          </Box>
        </Container>
      </Fade>
    </Box>
  );
};

export default HomePage;