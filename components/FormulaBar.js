import React from 'react';
import { TextField, Box } from '@mui/material';

const FormulaBar = () => {
  return (
    <Box sx={{ padding: 1 }}>
      <TextField fullWidth label="Formula" variant="outlined" />
    </Box>
  );
};

export default FormulaBar;
