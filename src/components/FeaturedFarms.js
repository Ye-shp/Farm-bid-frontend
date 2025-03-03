import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  Skeleton, 
  Alert,
  Button,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp as TrendingUpIcon, Star } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../Services/blogs';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: '16px',
  overflow: 'hidden',
  position: 'relative',
  background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #2196f3, #4caf50)',
  }
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  '& .MuiTypography-h6': {
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  '& .MuiTypography-body2': {
    color: theme.palette.text.secondary,
    lineHeight: 1.6,
  }
}));

const FeaturedBadge = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(0.5, 1.5),
  background: 'linear-gradient(45deg, #ff9800, #ff5722)',
  color: 'white',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  zIndex: 1,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: 'auto',
  background: 'linear-gradient(45deg, #1976d2, #2196f3)',
  color: 'white',
  borderRadius: '8px',
  padding: theme.spacing(1, 2),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #1565c0, #1976d2)',
    transform: 'translateY(-2px)',
  }
}));

const FeaturedFarms = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        setLoading(true);
        const response = await getBlogPosts();
        const featuredBlogs = response.data.slice(0, 3);
        setArticles(featuredBlogs);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured articles:', err);
        setError('Unable to load featured articles');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, []);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <StyledCard>
              <StyledCardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="40%" height={20} />
              </StyledCardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {articles.map((article) => (
        <Grid item xs={12} sm={6} md={4} key={article._id}>
          <StyledCard>
            <FeaturedBadge elevation={0}>
              <Star sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Featured
              </Typography>
            </FeaturedBadge>
            <StyledCardContent>
              <Typography variant="h6" component="h2">
                {article.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {article.content.substring(0, 150)}...
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  By {article.user?.username || 'Unknown Author'}
                </Typography>
                <StyledButton
                  component={Link}
                  to={`/blog/${article._id}`}
                  size="small"
                  endIcon={<TrendingUpIcon />}
                >
                  Read More
                </StyledButton>
              </Box>
            </StyledCardContent>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default FeaturedFarms;