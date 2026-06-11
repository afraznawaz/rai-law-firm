// One-time migration endpoint — adds columns to blog_posts
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  const secret = req.headers['x-migrate-secret'];
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const projectRef = process.env.FULLSTACK_PROJECT_REF;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const queries = [
    'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image text',
    'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS video_url text',
  ];

  const results = [];
  for (const sql of queries) {
    try {
      const r = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });
      const d = await r.json();
      results.push({ sql, ok: r.ok, result: d });
    } catch (e) {
      results.push({ sql, ok: false, error: e.message });
    }
  }

  return res.status(200).json({ results });
}
