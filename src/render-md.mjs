// Standalone markdown renderer — deliberately decoupled from Astro's content
// pipeline so the site's build behavior doesn't depend on which minor Astro
// version is installed.
//
// One unified pipeline (process string → html):
//   remark-parse + remark-gfm (mdast) → remark-rehype (hast) →
//   shiki transformer (async, swaps <pre><code> for dual-theme html) →
//   heading-id transformer → rehype-stringify
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { createHighlighter } from 'shiki';

let highlighterPromise = null;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      // Languages the notes actually use; unknown ones degrade to plain <pre>.
      langs: [
        'bash',
        'python',
        'json',
        'ini',
        'javascript',
        'typescript',
        'go',
        'java',
        'c',
        'cpp',
        'yaml',
        'dockerfile',
      ],
      defaultColor: false,
    });
  }
  return highlighterPromise;
}

const usedIds = new Set();
function slugHeading(text, fallback) {
  const base = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s.-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 48) || fallback;
  let id = base;
  let n = 2;
  while (usedIds.has(id)) id = `${base}-${n++}`;
  usedIds.add(id);
  return id;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Plugin factory (unified calls it with the processor) returning an async
// transformer. The highlighter is created lazily inside the transformer so
// the factory itself stays synchronous.
function shikiPlugin() {
  return async (tree) => {
    const shiki = await getHighlighter();
    const targets = [];
    visit(tree, 'element', (node, index, parent) => {
      if (index == null || !parent || node.tagName !== 'pre') return;
      if (node.children.length !== 1) return;
      const code = node.children[0];
      if (code.type !== 'element' || code.tagName !== 'code') return;
      const cls = ((code.properties && code.properties.className) || []).join(' ');
      const m = cls.match(/language-([\w+-]+)/);
      const lang = m ? m[1] : 'text';
      const text = code.children
        .map((c) => (typeof c.value === 'string' ? c.value : ''))
        .join('');
      targets.push({ parent, index, lang, text });
    });
    for (const t of targets) {
      let out;
      try {
        out = await shiki.codeToHtml(t.text, {
          lang: t.lang,
          themes: { light: 'github-light', dark: 'github-dark' },
        });
      } catch {
        out = `<pre class="shiki"><code>${escapeHtml(t.text)}</code></pre>`;
      }
      t.parent.children[t.index] = { type: 'raw', value: out };
    }
    return tree;
  };
}

function headingIdsPlugin() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (/^h[1-6]$/.test(node.tagName)) {
        const text = node.children
          .map((c) => (typeof c.value === 'string' ? c.value : ''))
          .join('');
        node.properties = { ...(node.properties || {}), id: slugHeading(text, node.tagName) };
      }
    });
    return tree;
  };
}

/**
 * Render a markdown string to HTML: GFM tables/strikethrough, dual-theme
 * shiki highlighting, heading ids for anchors.
 */
export async function renderMarkdown(md) {
  usedIds.clear();
  const html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(shikiPlugin)
    .use(headingIdsPlugin)
    .use(rehypeStringify)
    .process(md);
  return { html: String(html) };
}
