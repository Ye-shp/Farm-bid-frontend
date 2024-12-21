import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlogPost } from '../Services/blogs';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stack
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';

const CreateBlogPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You need to be logged in to create a field note');
      return;
    }

    try {
      const postData = { title, content, createdAt: new Date() };
      await createBlogPost(postData, token);
      setSuccess(true);
      setTimeout(() => {
        navigate('/blog');
      }, 1500); // Show success message for 1.5 seconds before redirecting
    } catch (err) {
      setError('Failed to create field note');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          backgroundColor: 'background.paper',
          borderRadius: 2
        }}
      >
        <Stack spacing={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <CreateIcon color="primary" />
            <Typography variant="h4" component="h1">
              Create Field Note
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Field note created successfully! Redirecting...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
                required
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />

              <TextField
                fullWidth
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                variant="outlined"
                required
                multiline
                rows={8}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<CreateIcon />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1
                }}
              >
                Create Field Note
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default CreateBlogPost;