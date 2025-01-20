import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const PostContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}));

const PostHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
}));

const AuthorSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const AuthorInfo = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

const PostContent = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  lineHeight: 1.8,
  color: alpha(theme.palette.text.primary, 0.87),
  marginBottom: theme.spacing(4),
}));

const MetricsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(2, 0),
  borderTop: `1px solid ${theme.palette.divider}`,
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(4),
}));

const CommentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.03),
  },
}));

const CommentForm = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.shape.borderRadius,
}));

const BlogPost = () => {
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
        <Typography variant="h3" gutterBottom>
          {blogPost.title}
        </Typography>
        
        <AuthorSection>
          <Avatar
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${blogPost.user?.username}`}
            sx={{ width: 56, height: 56 }}
          />
          <AuthorInfo>
            <Typography variant="subtitle1" fontWeight="bold">
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
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleLike} color={hasLiked ? 'primary' : 'default'}>
              {hasLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body2">{likes}</Typography>
          </Box>
          
          <Box display="flex" alignItems="center">
            <IconButton>
              <VisibilityIcon />
            </IconButton>
            <Typography variant="body2">{blogPost.views || 0}</Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <IconButton onClick={handleShare}>
              <ShareIcon />
            </IconButton>
            <Typography variant="body2">Share</Typography>
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
        <Typography variant="h5" gutterBottom>
          Responses ({comments.length})
        </Typography>
        
        {comments.map((comment) => (
          <CommentCard key={comment._id} variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user?.username}`}
                  sx={{ width: 32, height: 32, marginRight: 1 }}
                />
                <Typography variant="subtitle2">
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
          <Typography variant="h6" gutterBottom>
            Add a response
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What are your thoughts?"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!comment.trim()}
          >
            Publish
          </Button>
        </CommentForm>
      </Box>
    </PostContainer>
  );
};

export default BlogPost;