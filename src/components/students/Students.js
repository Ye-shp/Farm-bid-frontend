import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Box, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import '../../Styles/Students.css';
const Students = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3
      }}>
        <SchoolIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        <Typography variant="h4">Student Portal</Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            component={Link}
            to="/student/register"
            size="large"
          >
            Student Sign Up
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/student/login"
            size="large"
          >
            Student Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Students;