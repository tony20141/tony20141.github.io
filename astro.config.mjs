// @ts-check
import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

/**
 * Serve (dev) + copy (build) the repo-root content folders that generated
 * pages reference by absolute URL: projects/ (md + images) and assets/
 * (images kept from the old Docusaurus blog).
 */
function localStatic(...dirs) {
  const MIME = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif',
    '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8',
    '.json': 'application/json', '.css': 'text/css', '.js': 'text/javascript',
    '.xml': 'application/xml',
  };
  function safeJoin(urlPath) {
    try {
      const abs = path.join(rootDir, decodeURIComponent(urlPath));
      return abs.startsWith(rootDir) ? abs : null;
    } catch {
      return null;
    }
  }
  function copyDir(src, dest) {
    if (!existsSync(src)) return;
    mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, entry.name);
      const d = path.join(dest, entry.name);
      if (entry.isDirectory()) copyDir(s, d);
      else copyFileSync(s, d);
    }
  }
  return {
    name: 'local-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (!url || !/^\/projects\/.+$/.test(url)) return next();
        const file = safeJoin(url);
        if (!file || !existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
        res.end(readFileSync(file));
      });
    },
    writeBundle() {
      for (const d of dirs) copyDir(path.join(rootDir, d), path.join(rootDir, 'dist', d));
    },
  };
}

export default defineConfig({
  site: 'https://www.qqlink.net',
  vite: {
    // Only `projects/` is served from the repo (covers + per-project images).
    // The old Docusaurus `assets/` bundle is not used by the new site.
    plugins: [localStatic('projects')],
    build: {
      chunkSizeWarningLimit: 4096,
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
});
