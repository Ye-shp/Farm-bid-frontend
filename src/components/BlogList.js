import React, { useEffect, useState } from 'react';
import { getBlogPosts } from '../Services/blogs';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Chip,
  IconButton,
  styled,
  alpha,
  Skeleton,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(8),
  position: 'relative',
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.95)} 0%,
    ${alpha(theme.palette.primary.dark, 0.95)} 100%)`,
  padding: theme.spacing(10, 0),
  marginBottom: theme.spacing(8),
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/pattern.svg")',
    opacity: 0.1,
    zIndex: 1,
  },
}));

const BlogCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.1),
  background: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2, 2, 0, 2),
}));

const BlogContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const BlogTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1.5),
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  color: theme.palette.text.primary,
}));

const BlogExcerpt = styled(Typography)(({ theme }) => ({
  color: alpha(theme.palette.text.primary, 0.7),
  marginBottom: theme.spacing(2),
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: 1.6,
}));

const CardFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const CreateButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  right: theme.spacing(4),
  bottom: theme.spacing(4),
  borderRadius: '28px',
  padding: theme.spacing(1.5, 3),
  boxShadow: theme.shadows[4],
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const BlogList = ({ isLoggedIn }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getBlogPosts();
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const LoadingSkeleton = () => (
    <Grid container spacing={4}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Card>
            <CardContent>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" sx={{ mt: 2 }} />
              <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
              <Skeleton variant="text" sx={{ mt: 2 }} width="60%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      <HeroSection>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              color: 'common.white',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Field Notes
          </Typography>
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ 
              color: alpha('#fff', 0.9),
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Discover stories, thinking, and expertise from writers on any topic.
          </Typography>
        </Container>
      </HeroSection>

      <StyledContainer maxWidth="lg">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <Grid container spacing={4}>
            {blogs.map((blog) => (
              <Grid item xs={12} sm={6} md={4} key={blog._id}>
                <BlogCard>
                  <CardActionArea component={Link} to={`/blog/${blog._id}`}>
                    <CardHeader>
                      <Avatar 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog.user.username}`}
                        sx={{ 
                          width: 48, 
                          height: 48,
                          border: `2px solid ${theme.palette.primary.main}`,
                        }}
                      />
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {blog.user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </CardHeader>
                    <BlogContent>
                      <BlogTitle variant="h6">
                        {blog.title}
                      </BlogTitle>
                      <BlogExcerpt variant="body2">
                        {blog.content.slice(0, 150)}...
                      </BlogExcerpt>
                    </BlogContent>
                  </CardActionArea>
                  <CardFooter>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        icon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                        label={`${blog.comments?.length || 0}`}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '16px' }}
                      />
                      <Chip
                        icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                        label={`${blog.views || 0} views`}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '16px' }}
                      />
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                      <BookmarkBorderIcon />
                    </IconButton>
                  </CardFooter>
                </BlogCard>
              </Grid>
            ))}
          </Grid>
        )}

        {isLoggedIn && (
          <CreateButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-blog')}
          >
            New Field Note
          </CreateButton>
        )}
      </StyledContainer>
    </>
  );
};

export default BlogList;