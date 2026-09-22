/**
 * Generates public/sitemap.xml from the content data files.
 *
 * Routes are content-shaped (`/learn/:module/:slug`, `/projects/:slug`), so the
 * sitemap has to be derived from the data rather than hand-maintained. The data
 * files use one `slug: '...'` form throughout, which is enough to extract with
 * a regex and avoids compiling TypeScript just to list URLs. The script fails
 * loudly if it finds nothing, so a format change cannot silently ship an empty
 * sitemap.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SITE = 'https://vivekkumarq.github.io/neuralpath';
const DATA = 'src/app/data';

const STATIC_ROUTES = [
  ['', '1.0'],
  ['/roadmap', '0.9'],
  ['/learn', '0.9'],
  ['/projects', '0.8'],
  ['/interview', '0.8'],
  ['/glossary', '0.7'],
  ['/resources', '0.7'],
  ['/now', '0.6'],
  ['/dashboard', '0.4'],
  ['/bookmarks', '0.3'],
  ['/about', '0.5'],
];

const slugs = (text) => [...text.matchAll(/^\s*slug: '([a-z0-9-]+)',/gm)].map((match) => match[1]);

const moduleDir = join(DATA, 'modules');
const files = await readdir(moduleDir);

const urls = STATIC_ROUTES.map(([path, priority]) => ({ path, priority }));
let topicCount = 0;

for (const file of files.filter((name) => name.endsWith('.module.ts'))) {
  const text = await readFile(join(moduleDir, file), 'utf8');
  const [moduleSlug, ...topicSlugs] = slugs(text);
  if (!moduleSlug) throw new Error(`No slugs found in ${file}`);

  urls.push({ path: `/learn/${moduleSlug}`, priority: '0.8' });
  for (const topic of topicSlugs) {
    urls.push({ path: `/learn/${moduleSlug}/${topic}`, priority: '0.7' });
    topicCount++;
  }
}

for (const project of slugs(await readFile(join(DATA, 'projects.ts'), 'utf8'))) {
  urls.push({ path: `/projects/${project}`, priority: '0.6' });
}

if (topicCount < 20) throw new Error(`Only ${topicCount} topics found — check the data format`);

const today = new Date().toISOString().slice(0, 10);
const body = urls
  .map(
    ({ path, priority }) =>
      `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${today}</lastmod>\n` +
      `    <priority>${priority}</priority>\n  </url>`,
  )
  .join('\n');

await writeFile(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
);

console.log(`sitemap.xml: ${urls.length} urls (${topicCount} topics)`);
