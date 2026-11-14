// Build-time data helpers for project pages. Kept as a plain module (no
// Astro frontmatter) so path handling and file IO stay testable and stable
// across Astro versions.
import { readdirSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getProjects } from './content-projects.mjs';
import { parseBank } from './bank-parser.mjs';
import { FORCE_BANKS } from './site-meta.mjs';

// cwd = site root during dev and build (see content-projects.mjs).
const rootDir = process.cwd();
const projectsRoot = path.join(rootDir, 'projects');

function stripFrontmatter(md) {
  const fm = md.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fm) return { md, titleFromMd: null };
  const t = fm[1].match(/^title:\s*(.+)$/m);
  const titleFromMd = t ? t[1].replace(/^["']|["']$/g, '') : null;
  return { md: md.slice(fm[0].length), titleFromMd };
}

function looksLikeBank(md) {
  const qHeaders = (md.match(/^## (Question|\d+[.)])/gm) || []).length;
  return qHeaders >= 10;
}

function pickMdFile(dir, id) {
  const files = readdirSync(dir);
  const folder = id.toLowerCase();
  return (
    files.find((f) => {
      const stem = f.replace(/\.md$/i, '').toLowerCase();
      return stem.startsWith(folder) && f.toLowerCase().endsWith('.md') && !f.toLowerCase().endsWith('.old.md');
    }) ??
    files.find((f) => f.toLowerCase().endsWith('.md') && !f.toLowerCase().endsWith('.old.md')) ??
    null
  );
}

/** All projects that have a markdown source, with parsed bank when relevant. */
export async function getProjectPages() {
  const pages = [];
  for (const p of getProjects()) {
    const dir = path.join(projectsRoot, p.id);
    if (!statSync(dir).isDirectory()) continue;
    const mdFile = pickMdFile(dir, p.id);
    if (!mdFile) continue;

    const raw = await readFile(path.join(dir, mdFile), 'utf8');
    const { md, titleFromMd } = stripFrontmatter(raw);
    const firstLine = md.split('\n').find((l) => l.trim().startsWith('# '));
    const mdTitle = firstLine ? firstLine.replace(/^#\s+/, '').trim() : p.title;

    const size = Buffer.byteLength(raw);
    const isBank = FORCE_BANKS.has(p.id) || (size >= 60 * 1024 && looksLikeBank(md));

    pages.push({
      project: p,
      mdFile,
      md,
      size,
      title: titleFromMd ?? (p.title !== p.id ? p.title : mdTitle),
      bank: isBank ? parseBank(md, { project: p.id }) : null,
    });
  }
  return pages;
}
