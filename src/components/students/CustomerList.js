import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const CustomerList = () => {
  const [prospects, setProspects] = useState([]);
  const [error, setError] = useState('');
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [contactNote, setContactNote] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [myProspects, setMyProspects] = useState(false);

  useEffect(() => {
    fetchProspects();
    fetchLeaderboard();
  }, []);

  const fetchProspects = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await axios.get(`${API_URL}/api/students/prospects`, {
        headers: {
          'x-student-token': token
        }
      });
      console.log('Prospects data:', response.data);
      console.log('Types present:', [...new Set(response.data.map(p => p.type))]);
      setProspects(response.data);
    } catch (err) {
      setError('Failed to fetch prospects');
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await axios.get(`${API_URL}/api/students/leaderboard`, {
        headers: {
          'x-student-token': token
        }
      });
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  const handleClaim = async (prospectId) => {
    try {
      const token = localStorage.getItem('studentToken');
      await axios.post(`${API_URL}/api/students/prospects/${prospectId}/claim`, {}, {
        headers: {
          'x-student-token': token
        }
      });
      fetchProspects();
    } catch (err) {
      setError('Failed to claim prospect');
    }
  };

  const handleContactLog = async () => {
    try {
      if (!selectedProspect?._id) {
        setError('No prospect selected');
        return;
      }

      const token = localStorage.getItem('studentToken');
      await axios.post(`${API_URL}/api/students/prospects/${selectedProspect._id}/contact`, {
        notes: contactNote,
        contactMethod
      }, {
        headers: {
          'x-student-token': token
        }
      });
      
      setDialogOpen(false);
      setContactNote('');
      setContactMethod('');
      await fetchProspects(); // Refresh the prospects list
    } catch (err) {
      console.error('Contact log error:', err);
      setError(err.response?.data?.message || 'Failed to log contact');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      unclaimed: 'default',
      in_progress: 'primary',
      converted: 'success',
      declined: 'error'
    };
    return colors[status] || 'default';
  };

  const filterProspects = (prospects, type) => {
    console.log('Filtering prospects:', {
      type,
      myProspects,
      studentId: localStorage.getItem('studentId'),
      prospects: prospects.map(p => ({
        id: p._id,
        type: p.type,
        assignedStudent: p.assignedStudent
      }))
    });

    let filtered = prospects.filter(prospect => 
      prospect.type?.toLowerCase() === type || 
      prospect.type?.toLowerCase() === `${type}er` ||
      prospect.category?.toLowerCase().includes(type)
    );

    if (myProspects) {
      filtered = filtered.filter(prospect => {
        const isAssigned = prospect.assignedStudent?._id 
          ? prospect.assignedStudent.studentId === localStorage.getItem('studentId')
          : false;
        console.log('Checking assignment:', {
          prospectId: prospect._id,
          assignedStudent: prospect.assignedStudent,
          localStudentId: localStorage.getItem('studentId'),
          isAssigned
        });
        return isAssigned;
      });
    }

    return filtered;
  };

  const farmProspects = filterProspects(prospects, 'farm');
  const buyerProspects = filterProspects(prospects, 'buyer');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const ProspectList = ({ prospects }) => (
    <List>
      {prospects.map((prospect) => (
        <ListItem 
          key={prospect._id} 
          divider
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: 2,
            backgroundColor: prospect.assignedStudent?.studentId === localStorage.getItem('studentId') 
              ? 'rgba(0, 255, 0, 0.05)' 
              : 'inherit'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">{prospect.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {prospect.category} • {prospect.state} • {prospect.type}
              </Typography>
              {prospect.phone && (
                <Typography variant="body2">Phone: {prospect.phone}</Typography>
              )}
              {prospect.email && (
                <Typography variant="body2">Email: {prospect.email}</Typography>
              )}
              <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={prospect.status}
                  color={getStatusColor(prospect.status)}
                />
                {prospect.assignedStudent && (
                  <Typography variant="caption" color="textSecondary">
                    Claimed by: {prospect.assignedStudent.studentId}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
              {prospect.status === 'unclaimed' && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleClaim(prospect._id)}
                >
                  Claim Prospect
                </Button>
              )}
              {prospect.status === 'in_progress' && 
               prospect.assignedStudent?.studentId === localStorage.getItem('studentId') && (
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => {
                    setSelectedProspect(prospect);
                    setDialogOpen(true);
                  }}
                >
                  Log Contact
                </Button>
              )}
            </Grid>
          </Grid>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Leaderboard Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Top Performers
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell align="right">Onboards</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((student, index) => (
                    <TableRow key={student.studentId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell align="right">{student.successfulOnboards}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Prospects List Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ mb: 3 }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Prospect List</Typography>
              <Button
                variant="outlined"
                onClick={() => setMyProspects(!myProspects)}
                color={myProspects ? "primary" : "inherit"}
              >
                {myProspects ? "Show All" : "Show My Prospects"}
              </Button>
            </Box>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`Farms (${farmProspects.length})`} />
              <Tab label={`Buyers (${buyerProspects.length})`} />
            </Tabs>
            {error && (
              <Typography color="error" sx={{ p: 2 }}>
                {error}
              </Typography>
            )}
            <Box sx={{ p: 0 }}>
              {tabValue === 0 ? (
                <ProspectList prospects={farmProspects} />
              ) : (
                <ProspectList prospects={buyerProspects} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Contact Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Log Contact with {selectedProspect?.name}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Contact Method"
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value)}
            fullWidth
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select a method</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="in_person">In Person</option>
            <option value="other">Other</option>
          </TextField>
          <TextField
            multiline
            rows={4}
            label="Contact Notes"
            value={contactNote}
            onChange={(e) => setContactNote(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleContactLog} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomerList;
