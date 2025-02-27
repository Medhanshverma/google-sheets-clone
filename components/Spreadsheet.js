import React, { useState, useEffect, useRef } from 'react';

const Spreadsheet = () => {
  const [data, setData] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [formulaInput, setFormulaInput] = useState('');
  const formulaRef = useRef(null);
  const rows = 20;
  const cols = 10;

  useEffect(() => {
    const initialData = Array(rows).fill().map((_, rowIndex) => 
      Array(cols).fill().map(() => ({
        raw: '',
        value: '',
        display: ''
      }))
    );
    setData(initialData);
  }, []);

  useEffect(() => {
    if (selectedCell.row !== null && selectedCell.col !== null) {
      const cell = data[selectedCell.row][selectedCell.col];
      setFormulaInput(cell.raw);
      formulaRef.current?.focus();
    }
  }, [selectedCell, data]);

  const processFormula = (formula) => {
    try {
      const [funcPart, argsPart] = formula.slice(1).split(/\((.*)\)/);
      const func = funcPart.trim().toUpperCase();
      const args = argsPart.split(',').map(arg => arg.trim().replace(/^"(.*)"$/, '$1'));

      const parseRange = (range) => {
        const [start, end] = range.split(':').map(cell => {
          const [col, row] = cell.match(/([A-Z]+)(\d+)/).slice(1);
          return {
            col: col.charCodeAt(0) - 65,
            row: parseInt(row) - 1
          };
        });
        return { start, end: end || start };
      };

      
      if (['TRIM', 'UPPER', 'LOWER'].includes(func)) {
        const range = parseRange(args[0]);
        const values = [];
        for (let r = range.start.row; r <= range.end.row; r++) {
          for (let c = range.start.col; c <= range.end.col; c++) {
            values.push(String(data[r]?.[c]?.value || ''));
          }
        }
        
        switch(func) {
          case 'TRIM': return values.map(v => v.trim());
          case 'UPPER': return values.map(v => v.toUpperCase());
          case 'LOWER': return values.map(v => v.toLowerCase());
        }
      }

      if (func === 'REMOVE_DUPLICATES') {
        const range = parseRange(args[0]);
        const seen = new Set();
        const result = [];
        
        for (let r = range.start.row; r <= range.end.row; r++) {
          const row = data[r].slice(range.start.col, range.end.col + 1)
                          .map(cell => cell.value);
          const key = row.join('|');
          if (!seen.has(key)) {
            seen.add(key);
            result.push(row);
          }
        }
        return result.flat();
      }

      if (func === 'FIND_AND_REPLACE') {
        const [find, replace, rangeArg] = args;
        const range = parseRange(rangeArg);
        const values = [];
        
        for (let r = range.start.row; r <= range.end.row; r++) {
          for (let c = range.start.col; c <= range.end.col; c++) {
            const value = String(data[r]?.[c]?.value || '');
            values.push(value.replace(new RegExp(find, 'g'), replace));
          }
        }
        return values;
      }

      
      const range = parseRange(args[0]);
      const values = [];
      for (let r = range.start.row; r <= range.end.row; r++) {
        for (let c = range.start.col; c <= range.end.col; c++) {
          values.push(parseFloat(data[r]?.[c]?.value) || 0);
        }
      }

      switch(func) {
        case 'SUM': return values.reduce((a, b) => a + b, 0);
        case 'AVERAGE': return values.reduce((a, b) => a + b, 0) / values.length;
        case 'MAX': return Math.max(...values);
        case 'MIN': return Math.min(...values);
        case 'COUNT': return values.filter(v => !isNaN(v)).length;
        default: throw new Error('Unknown function');
      }

    } catch (error) {
      return '#ERROR';
    }
  };

  const handleFormulaChange = (e) => {
    const value = e.target.value;
    setFormulaInput(value);

    if (selectedCell.row === null || selectedCell.col === null) return;

    const newData = [...data];
    const cell = newData[selectedCell.row][selectedCell.col];
    
    
    cell.raw = value;
    cell.display = value;
    
    if (!value.startsWith('=')) {
      cell.value = value;
    }

    setData(newData);
  };

  const handleFormulaSubmit = () => {
    if (selectedCell.row === null || selectedCell.col === null) return;

    const newData = [...data];
    const cell = newData[selectedCell.row][selectedCell.col];
    
    if (cell.raw.startsWith('=')) {
      try {
        const result = processFormula(cell.raw);
        cell.value = Array.isArray(result) ? result[0] : result;
        cell.display = result;
      } catch (error) {
        cell.value = '#ERROR';
        cell.display = '#ERROR';
      }
    }

    setData(newData);
    setSelectedCell({ row: null, col: null });
  };

  return (
    <div className="spreadsheet-container">
      <div className="formula-bar">
        <input
          ref={formulaRef}
          value={formulaInput}
          onChange={handleFormulaChange}
          onKeyDown={(e) => e.key === 'Enter' && handleFormulaSubmit()}
          placeholder={selectedCell.row !== null ? 
            `Editing ${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}` : 
            'Select a cell to edit'}
        />
      </div>

      <div className="grid">
        <div className="header-row">
          <div className="header-cell corner"></div>
          {Array(cols).fill().map((_, i) => (
            <div key={`col-${i}`} className="header-cell">
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {data.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="data-row">
            <div className="row-header">{rowIndex + 1}</div>
            {row.map((cell, colIndex) => (
              <div
                key={`cell-${colIndex}`}
                className={`cell ${selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCell({ row: rowIndex, col: colIndex });
                  setFormulaInput(cell.raw);
                }}
              >
                {cell.display || ' '}
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        .spreadsheet-container {
          font-family: Arial, sans-serif;
          padding: 20px;
          background: #f8f9fa;
        }

        .formula-bar {
          margin-bottom: 10px;
        }

        .formula-bar input {
          width: 100%;
          padding: 8px;
          border: 1px solid #dfe1e5;
          border-radius: 4px;
          font-size: 14px;
        }

        .grid {
          display: grid;
          grid-template-columns: 50px repeat(${cols}, 120px);
          border: 1px solid #dfe1e5;
          background: white;
        }

        .header-row, .data-row {
          display: contents;
        }

        .header-cell, .row-header, .cell {
          height: 30px;
          padding: 4px;
          border-right: 1px solid #dfe1e5;
          border-bottom: 1px solid #dfe1e5;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .header-cell {
          background: #f1f3f4;
          font-weight: bold;
        }

        .row-header {
          background: #f1f3f4;
          font-weight: bold;
        }

        .cell {
          cursor: pointer;
          background: white;
        }

        .cell.selected {
          box-shadow: inset 0 0 0 2px #1a73e8;
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default Spreadsheet;
