import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const Spreadsheet = () => {
  const [data, setData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const rows = 20;
  const cols = 10;

  useEffect(() => {
    const initialData = Array(rows).fill().map(() => 
      Array(cols).fill().map(() => ({ raw: '', value: '' }))
    );
    setData(initialData);
  }, []);

  const processFormula = async (formula) => {
    if (formula.startsWith('=')) {
      try {
        const [func, rangePart] = formula.substring(1).split('(');
        const range = rangePart.replace(')', '');
        const [startCell, endCell] = range.split(':');

        const parseCell = (cell) => ({
          col: cell.charCodeAt(0) - 65,
          row: parseInt(cell.substring(1)) - 1
        });

        const start = parseCell(startCell);
        const end = parseCell(endCell);

        const values = [];
        for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row++) {
          for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col++) {
            const value = parseFloat(data[row]?.[col]?.value) || 0;
            values.push(value);
          }
        }

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

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    newData[rowIndex][colIndex].raw = value;
    setData(newData);
  };

  const evaluateCell = async (rowIndex, colIndex) => {
    const rawValue = data[rowIndex][colIndex].raw;
    const processedValue = await processFormula(rawValue);
    
    const newData = [...data];
    newData[rowIndex][colIndex].value = processedValue;
    setData(newData);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            {Array(cols).fill().map((_, index) => (
              <TableCell key={index}>{String.fromCharCode(65 + index)}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell>{rowIndex + 1}</TableCell>
              {row.map((cell, colIndex) => (
                <TableCell key={colIndex}>
                  <input
                    value={editingCell?.row === rowIndex && editingCell?.col === colIndex ? cell.raw : cell.value}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    onFocus={() => setEditingCell({ row: rowIndex, col: colIndex })}
                    onBlur={() => {
                      evaluateCell(rowIndex, colIndex);
                      setEditingCell(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        evaluateCell(rowIndex, colIndex);
                        setEditingCell(null);
                      }
                    }}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      color: cell.raw.startsWith('=') ? '#0b57d0' : 'inherit'
                    }}
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
