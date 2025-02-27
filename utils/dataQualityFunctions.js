export const trim = (value) => value.trim();

export const upper = (value) => value.toUpperCase();

export const lower = (value) => value.toLowerCase();

export const removeDuplicates = (range) => [...new Set(range)];

export const findAndReplace = (range, find, replace) => range.map(val => val.replace(new RegExp(find, 'g'), replace));
