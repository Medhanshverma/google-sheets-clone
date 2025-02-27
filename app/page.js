'use client'

import React from 'react';
import FormulaBar from '@/components/FormulaBar';
import Toolbar from '@/components/Toolbar';
import Spreadsheet from '@/components/spreadsheet';

export default function Home() {
  return (
    <div>
      <Toolbar/>
      <FormulaBar/>
      <Spreadsheet/>
    </div>
  );
}
