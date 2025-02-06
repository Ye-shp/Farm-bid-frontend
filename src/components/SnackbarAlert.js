import React from 'react';
import { Snackbar, Alert, useTheme } from '@mui/material';
import { CheckCircle as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

const SnackbarAlert = ({ snackbarOpen, setSnackbarOpen, snackbarMessage, snackbarSeverity }) => {
  const theme = useTheme();

  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={() => setSnackbarOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={() => setSnackbarOpen(false)}
        severity={snackbarSeverity}
        sx={{ width: '100%', borderRadius: 2, boxShadow: theme.shadows }}
        iconMapping={{
          success: <CheckIcon fontSize="inherit" />,
          error: <CloseIcon fontSize="inherit" />
        }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarAlert;