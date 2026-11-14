// Minimal RSS feed, no extra dependencies.
import { getCollection } from 'astro:content';
import { SITE } from '../../site-meta.mjs';

export async function GET({ site }) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  const url = new URL('/blog/rss.xml', site);
  const items = posts
    .map((p) => {
      const link = new URL(`/blog/${p.id.replace(/\.md$/, '')}/`, site).href;
      const text = p.body
        .replace(/[#*`>\[\]!]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 300);
      return `    <item>
      <title>${escapeXml(p.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
      <description>${escapeXml(text)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${site}</link>
    <atom:link href="${url}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
