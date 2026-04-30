import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    const baseUrl = 'https://raiandassociates.com.pk';
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/#about', priority: '0.8', changefreq: 'monthly' },
      { url: '/#services', priority: '0.9', changefreq: 'monthly' },
      { url: '/#expert', priority: '0.8', changefreq: 'monthly' },
      { url: '/#blog', priority: '0.9', changefreq: 'daily' },
      { url: '/#reviews', priority: '0.7', changefreq: 'weekly' },
      { url: '/#contact', priority: '0.8', changefreq: 'monthly' },
    ];

    const blogUrls = (posts || []).map(p => ({
      url: `/blog/${p.slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: p.updated_at ? p.updated_at.split('T')[0] : today
    }));

    const allUrls = [...staticPages, ...blogUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls.map(p => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
