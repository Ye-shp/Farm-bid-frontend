import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { getBlogPost, addCommentToBlogPost, likeBlogPost } from '../Services/blogs';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Card,
  CardContent,
  Divider,
  IconButton,
  styled,
  alpha
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const PostContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  background: `linear-gradient(175deg, 
    ${alpha(theme.palette.background.default, 1)} 0%,
    ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    background: `radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 70%)`,
    zIndex: -1,
  },
}));

const PostHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  padding: theme.spacing(4),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(12px)',
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.dark, 0.05)}`,
  animation: `${pulse} 6s infinite`,
}));

const AuthorSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const AuthorInfo = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

const PostContent = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  lineHeight: 1.8,
  color: alpha(theme.palette.text.primary, 0.87),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(4),
  background: alpha(theme.palette.primary.light, 0.05),
  borderRadius: theme.shape.borderRadius * 2,
  borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const MetricsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(145deg, 
    ${alpha(theme.palette.primary.light, 0.1)} 0%,
    ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const CommentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
    '&::after': {
      opacity: 0.1,
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
}));

const CommentForm = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4),
  background: `linear-gradient(145deg, 
    ${alpha(theme.palette.primary.light, 0.1)} 0%,
    ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const BlogPost = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [blogPost, setBlogPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await getBlogPost(id);
        setBlogPost(response.data);
        setComments(response.data.comments || []);
        setLikes(response.data.likes?.length || 0);
        const userId = localStorage.getItem('userId');
        setHasLiked(response.data.likes?.includes(userId));
      } catch (err) {
        console.error('Error fetching field note:', err);
      }
    };
    fetchBlog();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await addCommentToBlogPost(id, { content: comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments([...comments, response.data]);
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    try {
      const updatedBlog = await likeBlogPost(id, token);
      setLikes(updatedBlog.likes.length);
      const userId = localStorage.getItem('userId');
      setHasLiked(updatedBlog.likes.includes(userId));
    } catch (err) {
      console.error('Error liking the post:', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: blogPost.title,
      text: `Check out this field note: ${blogPost.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (!blogPost) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <PostContainer maxWidth="md">
      <PostHeader>
        <Typography variant="h3" gutterBottom sx={{
          fontWeight: 800,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {blogPost.title}
        </Typography>

        <AuthorSection>
          <Avatar
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${blogPost.user?.username}`}
            sx={{ 
              width: 56, 
              height: 56,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          />
          <AuthorInfo>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              {blogPost.user?.username || 'Anonymous'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {new Date(blogPost.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </AuthorInfo>
        </AuthorSection>

        <PostContent variant="body1">
          {blogPost.content}
        </PostContent>

        <MetricsBar>
          <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
            <IconButton 
              onClick={handleLike} 
              sx={{
                color: hasLiked ? theme.palette.primary.main : 'inherit',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)'
                }
              }}
            >
              {hasLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body2" color="primary">{likes}</Typography>
          </Box>
          
          <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
            <VisibilityIcon color="primary" />
            <Typography variant="body2" color="primary">
              {blogPost.views || 0}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
            <IconButton 
              onClick={handleShare}
              sx={{
                '&:hover': {
                  color: theme.palette.primary.main,
                  transform: 'rotate(-15deg)'
                }
              }}
            >
              <ShareIcon />
            </IconButton>
            <Typography variant="body2" color="primary">Share</Typography>
          </Box>
        </MetricsBar>
      </PostHeader>

      {showShareToast && (
        <Box
          position="fixed"
          bottom={20}
          left="50%"
          sx={{
            transform: 'translateX(-50%)',
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography>Link copied to clipboard!</Typography>
        </Box>
      )}

      <Box mb={6}>
        <Typography variant="h5" gutterBottom sx={{
          fontWeight: 700,
          color: alpha(theme.palette.primary.main, 0.8),
          mb: 4,
        }}>
          Responses ({comments.length})
        </Typography>
        
        {comments.map((comment) => (
          <CommentCard key={comment._id}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1} gap={1}>
                <Avatar
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user?.username}`}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                />
                <Typography variant="subtitle2" color="primary">
                  {comment.user?.username || 'Anonymous'}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="body2">
                {comment.content}
              </Typography>
            </CardContent>
          </CommentCard>
        ))}

        <CommentForm component="form" onSubmit={handleCommentSubmit}>
          <Typography variant="h6" gutterBottom color="primary">
            Add a response
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your insights..."
            variant="outlined"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                },
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              }
            }}
            disabled={!comment.trim()}
          >
            Publish Response
          </Button>
        </CommentForm>
      </Box>
    </PostContainer>
  );
};

export default BlogPost;