// Splits large "question bank" markdown files into structured items so the
// bank viewer can render, search and paginate them client-side.
//
// Heading semantics (the author's files are inconsistent, so be lenient):
//  - H1                      → section banner/divider (e.g. "Part 12")
//  - H2                      → always starts an item (question or section)
//  - H3 "Question N" / "题 N" / "N." / "N)" → starts a question item
//  - any other H3            → stays in the current question's body
//  - everything before the first heading → preamble (rendered, not indexed)
//
// Question numbers are extracted from several shapes:
//  "Question 73", "**Question 73:**", "题 275", "题 275 (QUESTION 275)",
//  "1." / "1)". Stable ids are `q-<n>` when a number is found, else a slug.

const H1_RE = /^#\s+(?!#)(.+?)\s*$/;
const H2_RE = /^##\s+(.+?)\s*$/;
const H3_RE = /^###\s+(.+?)\s*$/;

export function parseBank(md, { project }) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const items = [];
  let preamble = [];
  let current = null;

  const slugify = (t) =>
    t
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s.-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 48) || 'item';

  const seen = new Set();
  const unique = (id) => {
    let out = id;
    let i = 2;
    while (seen.has(out)) out = `${id}-${i++}`;
    seen.add(out);
    return out;
  };

  // Pull a question number out of a heading, in whatever shape it appears.
  const questionNum = (t) => {
    let m = /^question\s+(\d+)/i.exec(t); // "Question 73" / "QUESTION 275"
    if (m) return m[1];
    m = /^题\s*(\d+)/.exec(t); // "题 275" (Chinese)
    if (m) return m[1];
    m = /\(question\s+(\d+)/i.exec(t); // "题 275 (QUESTION 275)"
    if (m) return m[1];
    m = /^(\d+)[.)]\s/.exec(t); // "1. …" / "1) …"
    if (m) return m[1];
    return null;
  };

  // An H3 only starts a question when it is clearly one; free-form H3
  // sub-headings ("原始问题与答案（英文）", "中文翻译与解释") stay in the body.
  const questionish = (t) => questionNum(t) !== null;

  // Strip markdown emphasis and a trailing colon from a heading title.
  const clean = (s) => s.replace(/\*/g, '').replace(/[:：]\s*$/, '').trim();

  const pushCurrent = () => {
    if (!current) return;
    current.body = current.body.join('\n').trim();
    if (current.body || current.title) {
      items.push({
        id: unique(current.id),
        title: current.title,
        body: current.body,
        num: current.num,
      });
    }
    current = null;
  };

  for (const line of lines) {
    let m;
    if ((m = H1_RE.exec(line))) {
      // H1 = section banner → divider entry.
      pushCurrent();
      const t = clean(m[1]);
      items.push({
        id: unique(`sec-${slugify(t)}`),
        title: t,
        body: '',
        divider: true,
        num: null,
      });
    } else if ((m = H2_RE.exec(line))) {
      // H2 always starts an item.
      pushCurrent();
      const t = clean(m[1]);
      const num = questionNum(t);
      current = { id: num ? `q-${num}` : slugify(t), title: t, body: [], num };
    } else if ((m = H3_RE.exec(line))) {
      const t = clean(m[1]);
      if (questionish(t)) {
        pushCurrent();
        const num = questionNum(t);
        current = { id: num ? `q-${num}` : slugify(t), title: t, body: [], num };
      } else if (current) {
        current.body.push(line); // sub-heading inside a question
      } else {
        preamble.push(line);
      }
    } else if (current) {
      current.body.push(line);
    } else {
      preamble.push(line);
    }
  }
  pushCurrent();

  // Rewrite relative image paths to absolute /projects/<id>/ URLs so the
  // rendered HTML works from /projects/<slug>/ pages.
  const base = `/projects/${project}/`;
  const absImages = (s) =>
    s.replace(/(!\[[^\]]*\]\(|<)(\.{1,2}\/|[A-Za-z]:[\\/]|[^\s(])/g, (match, pre, target) => {
      if (/^https?:|^data:|^#/.test(target)) return match;
      if (target.startsWith('/')) return match;
      return `${pre}${base}${target.replace(/^\.\/?/, '')}`;
    });

  return {
    preamble: preamble.join('\n').trim(),
    items: items.map((it) => ({ ...it, body: absImages(it.body) })),
  };
}

export function bankIndex(bank) {
  return bank.items.map((it) => ({ id: it.id, title: it.title }));
}
