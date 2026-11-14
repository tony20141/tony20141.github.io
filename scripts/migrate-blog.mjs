// One-off: extract Docusaurus post articles (HTML) into markdown source
// files under src/content/blog/. Run: node scripts/migrate-blog.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const stripTags = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const posts = [
  {
    dir: 'blog/AAA',
    slug: 'how-to-make-a-markdown-website',
    title: 'How to make a markdown website',
    date: '2024-01-21',
    tags: ['markdown-website', 'docusaurus'],
  },
  {
    dir: 'blog/welcome',
    slug: 'welcome',
    title: 'Welcome',
    date: '2021-08-26',
    tags: ['docusaurus', 'facebook', 'hello'],
  },
  {
    dir: 'blog/welcome-docusaurus-v2',
    slug: 'linux-note',
    title: 'Linux note',
    date: '2024-01-21',
    tags: ['linux', 'cent-os', 'markdown-website'],
  },
];

const outDir = path.join(root, 'src/content/blog');
mkdirSync(outDir, { recursive: true });

for (const p of posts) {
  const html = readFileSync(path.join(root, p.dir, 'index.html'), 'utf8');
  const m = html.match(/<article[^>]*>([\s\S]*?)<\/article>/);
  if (!m) {
    console.error('no article in', p.dir);
    continue;
  }
  const article = m[1];
  // Grab image srcs (absolute /assets/... refs survive; images stay served from assets/)
  const imgs = [...article.matchAll(/<img[^>]+src="([^"]+)"/g)].map((x) => x[1]);
  const text = stripTags(article);
  const md = `---
title: ${JSON.stringify(p.title)}
date: ${p.date}
tags: ${JSON.stringify(p.tags)}
author: Yimin Qiu
migrated: docusaurus
---

${text}
${imgs.length ? '\n<!-- images (served from /assets): ' + imgs.join(', ') + ' -->\n' : ''}
`.trim();
  writeFileSync(path.join(outDir, `${p.slug}.md`), md);
  console.log('wrote', path.join('src/content/blog', `${p.slug}.md`), md.length, 'chars, images:', imgs.length);
}
console.log('done');
