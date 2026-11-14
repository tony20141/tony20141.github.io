// Scans projects/ for the first markdown file per project folder and
// produces the project list consumed by the home page and /projects.
// Editing or adding a .md file in projects/ is all that's needed —
// the next build picks it up automatically.
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { PROJECT_META } from '../src/site-meta.mjs';

// astro dev/build always run with cwd = site root. (import.meta.url would
// resolve inside dist/ in the built chunk — don't use it for content paths.)
const rootDir = process.cwd();
const projectsRoot = path.join(rootDir, 'projects');

function firstMd(dir) {
  if (!existsSync(dir)) return null;
  const md = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.md') && !f.toLowerCase().endsWith('.old.md'))
    .sort((a, b) => a.localeCompare(b, 'en'));
  // Prefer the file whose stem matches the folder name (project1.md etc.)
  const folder = dir.split(path.sep).pop().toLowerCase();
  for (const f of md) {
    const stem = f.replace(/\.md$/i, '').toLowerCase();
    if (stem.startsWith(folder)) return f;
  }
  return md[0] ?? null;
}

export function getProjects() {
  if (!existsSync(projectsRoot)) return [];
  const out = [];
  for (const entry of readdirSync(projectsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const id = entry.name; // e.g. project1
    const dir = path.join(projectsRoot, id);
    const md = firstMd(dir);
    const slug = id.toLowerCase();
    const meta = PROJECT_META[id] ?? {};
    out.push({
      id,
      slug,
      title: meta.title ?? slug,
      description: meta.description ?? '',
      cover: meta.cover ?? (existsSync(path.join(dir, `${slug}.jpg`)) ? `/projects/${id}/${slug}.jpg` : null),
      hasMd: Boolean(md),
      // URL pattern used on the old site — keep it working.
      url: `/projects/${slug}/`,
    });
  }
  return out;
}
