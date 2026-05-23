import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: 'Slug required' });

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Post not found' });
    return res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
