// Utilities to compose a combined text block from embedded JSON quotes (no HTTP)

import QUOTES from '../quotes/index.json';

const QUOTE_FILES = ['en.txt','hi.txt','de.txt','es.txt','fr.txt','he.txt','it.txt','pt.txt','ru.txt','tr.txt','uk.txt'];

function sanitizeAndSplit(text) {
  return text
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length >= 2);
}

function pickRandomUnique(lines, count) {
  const result = [];
  const used = new Set();
  const max = Math.min(count, lines.length);
  while (result.length < max) {
    const idx = Math.floor(Math.random() * lines.length);
    if (used.has(idx)) continue;
    used.add(idx);
    result.push(lines[idx]);
  }
  return result;
}

function getLinesForFile(file) {
  const text = QUOTES[file] || '';
  return sanitizeAndSplit(text);
}

export async function buildCombinedBlock(prefilledThought = '') {
  const enLines = getLinesForFile('en.txt');
  const hiLines = getLinesForFile('hi.txt');

  const others = QUOTE_FILES.filter(f => f !== 'en.txt' && f !== 'hi.txt');
  const otherFile = others[Math.floor(Math.random() * others.length)];
  const otherLines = getLinesForFile(otherFile);

  const picked = [
    //...prefilledThought.trim(),
    ...pickRandomUnique(enLines, 6),
    ...pickRandomUnique(hiLines, 8),
  ];
  if (otherLines.length > 0) picked.push(pickRandomUnique(otherLines, 1)[0]);

  picked.push(prefilledThought.trim());

  // Join with no space between concatenated quotes as requested
  return picked.join('');
}


