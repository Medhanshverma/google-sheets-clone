import { NextResponse } from 'next/server';
import * as mathFunctions from '../../../utils/mathFunctions';
import * as dataQualityFunctions from '../../../utils/dataQualityFunctions';

export async function POST(request) {
  const { function: func, range } = await request.json();

  let result;
  if (mathFunctions[func]) {
    result = mathFunctions[func](range);
  } else if (dataQualityFunctions[func]) {
    result = dataQualityFunctions[func](range);
  } else {
    return NextResponse.json({ error: 'Invalid function' }, { status: 400 });
  }

  return NextResponse.json({ result });
}
