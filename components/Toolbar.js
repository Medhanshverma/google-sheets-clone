import React from 'react';
import { AppBar, Toolbar as MuiToolbar, Typography, Button } from '@mui/material';

const Toolbar = () => {
  return (
    <AppBar position="static">
      <MuiToolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Google Sheets Clone
        </Typography>
        <Button color="inherit">Save</Button>
        <Button color="inherit">Load</Button>
      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar;
