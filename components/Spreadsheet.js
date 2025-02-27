import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const Spreadsheet = () => {
  const [data, setData] = useState([]);
  const rows = 20;
  const cols = 10;

  useEffect(() => {
    const initialData = Array(rows).fill().map(() => Array(cols).fill(''));
    setData(initialData);
  }, []);

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {Array(cols).fill().map((_, index) => (
              <TableCell key={index}>{String.fromCharCode(65 + index)}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, colIndex) => (
                <TableCell key={colIndex}>
                  <input
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Spreadsheet;
