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

  const processFormula = async (formula) => {
    if (formula.startsWith('=')) {
      try {
        const [func, rangePart] = formula.substring(1).split('(');
        const range = rangePart.replace(')', '');
        const [startCell, endCell] = range.split(':');
  
        // Convert cell notations to indexes (A1 -> [0,0])
        const parseCell = (cell) => ({
          col: cell.charCodeAt(0) - 65,
          row: parseInt(cell.substring(1)) - 1
        });
  
        const start = parseCell(startCell);
        const end = parseCell(endCell);
  
        // Get all cells in range
        const values = [];
        for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row++) {
          for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col++) {
            const value = parseFloat(data[row]?.[col]) || 0;
            values.push(value);
          }
        }
  
        // Call calculation API
        const response = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            function: func.toLowerCase(),
            range: values 
          }),
        });
  
        const result = await response.json();
        return result.result;
  
      } catch (error) {
        console.error('Formula error:', error);
        return 'ERROR';
      }
    }
    return formula;
  };
  

  const handleCellChange = async (rowIndex, colIndex, value) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);

    // Process formula after setting the raw input
    const processedValue = await processFormula(value);
    if (processedValue !== value) {
      newData[rowIndex][colIndex] = processedValue;
      setData([...newData]);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell> {/* Empty cell for row numbers */}
            {Array(cols).fill().map((_, index) => (
              <TableCell key={index}>{String.fromCharCode(65 + index)}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell>{rowIndex + 1}</TableCell> {/* Row number */}
              {row.map((cell, colIndex) => (
                <TableCell key={colIndex}>
                  <input
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent' }}
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
