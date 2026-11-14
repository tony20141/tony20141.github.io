import { readFile } from 'node:fs/promises';
import { parseBank } from '../src/bank-parser.mjs';

const raw = await readFile('projects/project1/project1.md', 'utf8');
const bank = parseBank(raw, { project: 'project1' });
console.log('items:', bank.items.length);
console.log('dividers:', bank.items.filter((i) => i.divider).length);
console.log('questions (num set):', bank.items.filter((i) => i.num).length);

// How many raw H3/H2/H1 question-ish lines exist?
const lines = raw.split('\n');
const cnt = {
  h2: 0,
  h3PlainQ: 0,
  h3BoldQ: 0,
  h3Zh: 0,
  h1: 0,
  otherH3: 0,
};
for (const l of lines) {
  if (/^#\s/.test(l)) cnt.h1++;
  else if (/^##\s/.test(l)) cnt.h2++;
  else if (/^###\s/.test(l)) {
    const t = l.slice(4).trim();
    if (/^Question\s+\d/.test(t)) cnt.h3PlainQ++;
    else if (/^\*\*Question\s+\d/.test(t)) cnt.h3BoldQ++;
    else if (/^题\s*\d/.test(t) || /\(QUESTION\s+\d/.test(t)) cnt.h3Zh++;
    else if (/^\d+[.)]\s/.test(t)) cnt.h3PlainQ++;
    else cnt.otherH3++;
  }
}
console.log('raw counts:', cnt);
console.log('--- first 8 items ---');
bank.items.slice(0, 8).forEach((it) => console.log(`  [${it.id}] num=${it.num} divider=${it.divider} :: ${it.title.slice(0, 50)}`));
console.log('--- sample middle items (around 50,100,150) ---');
[50, 100, 150].forEach((n) => {
  const it = bank.items[n];
  if (it) console.log(`  idx ${n}: [${it.id}] num=${it.num} :: ${it.title.slice(0, 50)}`);
});
