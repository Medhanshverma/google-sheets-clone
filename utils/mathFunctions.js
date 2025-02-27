export const sum = (range) => range.reduce((acc, val) => acc + parseFloat(val), 0);

export const average = (range) => sum(range) / range.length;

export const max = (range) => Math.max(...range.map(val => parseFloat(val)));

export const min = (range) => Math.min(...range.map(val => parseFloat(val)));

export const count = (range) => range.filter(val => !isNaN(parseFloat(val))).length;
