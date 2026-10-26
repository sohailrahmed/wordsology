// sitemap.xml: every page on the site, so Google can find them all.
import { getCollection } from 'astro:content';

export async function GET({ site }: { site: URL }) {
  const pages = await getCollection('pages');
  const urls = [...new Set(['/', '/qa/', '/practice-questions/', ...pages.map((p) => p.data.path)])];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u, site).href}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
