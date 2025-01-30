import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlogPost } from '../Services/blogs';
import {
  Container,
  alpha,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stack,
  useTheme,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import SpaIcon from '@mui/icons-material/Spa';
import GrainIcon from '@mui/icons-material/Grain';
import { keyframes } from '@emotion/react';

const floating = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const CreateBlogPost = () => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Join our growing community to share your wisdom');
      return;
    }

    try {
      const postData = { title, content, createdAt: new Date() };
      await createBlogPost(postData, token);
      setSuccess(true);
      setTimeout(() => navigate('/blog'), 1500);
    } catch (err) {
      setError('Your seeds of knowledge need a different soil - try again soon');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
      pt: 8,
      pb: 8,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.1,
      }
    }}>
      <Fade in timeout={800}>
        <Container maxWidth="md">
          <Grow in timeout={1000}>
            <Paper sx={{
              p: 6,
              backdropFilter: 'blur(12px)',
              background: alpha(theme.palette.background.paper, 0.9),
              borderRadius: 4,
              boxShadow: `0 32px 64px ${alpha(theme.palette.primary.dark, 0.2)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
              }
            }}>
              <Stack spacing={4}>
                <Box textAlign="center">
                  <Zoom in timeout={800}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      '& svg': {
                        animation: `${floating} 6s ease-in-out infinite`,
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                      }
                    }}>
                      <SpaIcon sx={{ fontSize: 64, color: 'primary.main', mr: 2 }} />
                      <GrainIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                    </Box>
                  </Zoom>
                  
                  <Typography variant="h3" sx={{
                    fontWeight: 800,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}>
                    Cultivate Knowledge
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Your insights could blossom into tomorrow's solutions
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ border: `1px solid ${theme.palette.error.main}` }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ border: `1px solid ${theme.palette.success.main}` }}>
                    Your wisdom has been planted! Redirecting to the community garden...
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                    <TextField
                      fullWidth
                      label="Title of Your Discovery"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      variant="filled"
                      required
                      InputProps={{
                        sx: {
                          fontSize: '1.5rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.light, 0.1)
                        }
                      }}
                      InputLabelProps={{
                        sx: { color: 'text.secondary' }
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Share Your Growth Journey"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      variant="filled"
                      required
                      multiline
                      rows={12}
                      InputProps={{
                        sx: {
                          fontSize: '1.1rem',
                          lineHeight: 1.8,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.light, 0.1)
                        }
                      }}
                      InputLabelProps={{
                        sx: { color: 'text.secondary' }
                      }}
                    />

                    <Zoom in timeout={800}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<CreateIcon sx={{ transform: 'scale(1.2)' }} />}
                        sx={{
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Share Your Field Note
                      </Button>
                    </Zoom>
                  </Stack>
                </Box>

                <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
                  "The best time to plant a seed of knowledge was 20 years ago. The second best time is now."
                </Typography>
              </Stack>
            </Paper>
          </Grow>
        </Container>
      </Fade>
    </Box>
  );
};

export default CreateBlogPost;