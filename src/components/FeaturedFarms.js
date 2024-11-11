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
import api from '../Services/api';

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
        const response = await api.getFeaturedFarms();
        
        let articlesData = Array.isArray(response) ? response : [];
        const processedArticles = articlesData.map(article => ({
          _id: article._id?._id || article._id || 'unknown',
          username: article._id?.username || 'Unknown Author',
          description: article._id?.description || 'No description available',
          totalEngagement: article.totalEngagement || 0,
        }));

        setArticles(processedArticles.slice(0, 3));
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
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Featured Articles</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Featured Articles
      </Typography>

      <Grid container spacing={3}>
        {articles.map((article, index) => {
          const articleId = typeof article._id === 'object' ? article._id._id : article._id;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={articleId || index}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {article.description}
                  </Typography>
                  
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ mb: 2 }}
                  >
                    By {article.username}
                  </Typography>

                  <Box 
                    sx={{ 
                      mt: 'auto', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon fontSize="small" color="primary" />
                      <Typography variant="body2" color="primary">
                        {article.totalEngagement.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Button 
                      component={Link}
                      to={`/user/${articleId}`}
                      variant="text"
                      sx={{ textTransform: 'none' }}
                    >
                      Read More
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default FeaturedFarms;