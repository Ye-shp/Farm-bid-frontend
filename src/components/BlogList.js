import React, { useEffect, useState } from 'react';
import { getBlogPosts } from '../Services/blogs';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  styled
} from '@mui/material';

// Replacing makeStyles with styled
const Container = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(5),
}));

const CreatePostButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
}));

const CardText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const AuthorLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const BlogList = ({ isLoggedIn }) => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getBlogPosts();
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Field Notes
      </Typography>

      {isLoggedIn && (
        <CreatePostButton
          variant="contained"
          color="primary"
          onClick={() => navigate('/create-blog')}
        >
          Create New Field Note
        </CreatePostButton>
      )}

      <Grid container spacing={4}>
        {blogs.map((blog) => (
          <Grid item xs={12} md={6} key={blog._id}>
            <StyledCard>
              <CardActionArea component={Link} to={`/blog/${blog._id}`}>
                <CardContent>
                  <CardTitle variant="h5">
                    {blog.title}
                  </CardTitle>
                  <CardText variant="body2">
                    Posted by{' '}
                    <AuthorLink to={`/user/${blog.user._id}`}>
                      {blog.user.username}
                    </AuthorLink>
                  </CardText>
                  <CardText variant="body2" color="textSecondary">
                    {blog.content.slice(0, 100)}...
                  </CardText>
                </CardContent>
              </CardActionArea>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BlogList;
