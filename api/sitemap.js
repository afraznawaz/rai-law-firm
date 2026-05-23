import supabase from './_supabase.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    const baseUrl = 'https://raiandassociates.com.pk';
    const today = new Date().toISOString().split('T')[0];

    // Only real indexable pages — NO hash/anchor URLs
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly', lastmod: today },
      { url: '/admin', priority: '0.1', changefreq: 'never', lastmod: today },
    ];

    // All published blog posts as real URLs
    const blogUrls = (posts || []).map(p => ({
      url: `/blog/${p.slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: p.updated_at ? p.updated_at.split('T')[0] : (p.created_at ? p.created_at.split('T')[0] : today)
    }));

    const allUrls = [...staticPages, ...blogUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls.map(p => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.status(200).send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
