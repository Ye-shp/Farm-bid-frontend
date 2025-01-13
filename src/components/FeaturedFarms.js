import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  Skeleton, 
  Alert,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../Services/blogs';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
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
        
        // Get the first 3 blogs
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
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="40%" height={20} />
              </CardContent>
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
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {article.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {article.content.substring(0, 150)}...
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                <Typography variant="caption" color="text.secondary">
                  By {article.user?.username || 'Unknown Author'}
                </Typography>
                <Button
                  component={Link}
                  to={`/blog/${article._id}`}
                  size="small"
                  color="primary"
                  endIcon={<TrendingUpIcon />}
                >
                  Read More
                </Button>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default FeaturedFarms;