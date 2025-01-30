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
  useTheme,
  Slide,
  Grow,
  Fade,
  Zoom
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(8),
  position: 'relative',
  background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 100%)`,
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.dark} 0%,
    ${theme.palette.primary.main} 50%,
    ${theme.palette.primary.light} 100%)`,
  padding: theme.spacing(10, 0),
  marginBottom: theme.spacing(8),
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.common.white, 0.1)} 20%, transparent 80%)`,
    animation: 'pulse 6s infinite',
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' },
    }
  },
}));

const BlogCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.1),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 16px 32px -8px ${alpha(theme.palette.primary.main, 0.2)}`,
    borderColor: theme.palette.primary.main,
    '&::after': {
      transform: 'translateX(0)',
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 4,
    background: theme.palette.primary.main,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease',
  }
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2, 2, 0, 2),
  transition: 'all 0.3s ease',
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
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
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
  boxShadow: theme.shadows[8],
  transition: 'all 0.3s ease',
  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[16],
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
              <Skeleton 
                variant="circular" 
                width={40} 
                height={40} 
                sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} 
              />
              <Skeleton 
                variant="text" 
                sx={{ 
                  mt: 2, 
                  bgcolor: 'rgba(255,255,255,0.1)' 
                }} 
              />
              <Skeleton 
                variant="rectangular" 
                height={120} 
                sx={{ 
                  mt: 2, 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2 
                }} 
              />
              <Skeleton 
                variant="text" 
                sx={{ 
                  mt: 2, 
                  width: '60%', 
                  bgcolor: 'rgba(255,255,255,0.1)' 
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      <Fade in timeout={1000}>
        <div>
          <HeroSection>
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
              <Slide in direction="down" timeout={800}>
                <Typography 
                  variant="h2" 
                  align="center" 
                  gutterBottom
                  sx={{ 
                    color: 'common.white',
                    fontWeight: 800,
                    textShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Field Notes
                </Typography>
              </Slide>
              
              <Zoom in timeout={800} style={{ transitionDelay: '300ms' }}>
                <Typography 
                  variant="h5" 
                  align="center" 
                  sx={{ 
                    color: alpha('#fff', 0.9),
                    maxWidth: '800px',
                    margin: '0 auto',
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                >
                  Discover stories, thinking, and expertise from your fellow farmers and experts.
                </Typography>
              </Zoom>
            </Container>
          </HeroSection>

          <StyledContainer maxWidth="lg">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <Grid container spacing={4}>
                {blogs.map((blog, index) => (
                  <Grid item xs={12} sm={6} md={4} key={blog._id}>
                    <Grow in timeout={800} style={{ transitionDelay: `${index * 150}ms` }}>
                      <BlogCard>
                        <CardActionArea component={Link} to={`/blog/${blog._id}`}>
                          <CardHeader>
                            <Box 
                              component={Link} 
                              to={`/users/${blog.user._id}`}
                              sx={{
                                textDecoration: 'none', 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 'inherit',
                                '&:hover': {
                                  transform: 'translateX(4px)'
                                }
                              }}
                            >
                              <Avatar 
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog.user.username}`}
                                sx={{ 
                                  width: 48, 
                                  height: 48,
                                  border: `2px solid ${theme.palette.primary.main}`,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
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
                              icon={<ChatBubbleOutlineIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />}
                              label={`${blog.comments?.length || 0}`}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: '16px', borderColor: alpha(theme.palette.primary.main, 0.2) }}
                            />
                            <Chip
                              icon={<TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />}
                              label={`${blog.views || 0} views`}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: '16px', borderColor: alpha(theme.palette.primary.main, 0.2) }}
                            />
                          </Box>
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                              }
                            }}
                          >
                            <BookmarkBorderIcon />
                          </IconButton>
                        </CardFooter>
                      </BlogCard>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            )}

            {isLoggedIn && (
              <Zoom in timeout={800}>
                <CreateButton
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon sx={{ transition: 'transform 0.2s' }} />}
                  onClick={() => navigate('/create-blog')}
                >
                  New Field Note
                </CreateButton>
              </Zoom>
            )}
          </StyledContainer>
        </div>
      </Fade>
    </>
  );
};

export default BlogList;