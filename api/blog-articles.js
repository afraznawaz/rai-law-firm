import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { slug, id } = req.query;
      if (slug) {
        const { data, error } = await supabase.from('blog_articles').select('*').eq('slug', slug).eq('published', true).single();
        if (error) return res.status(404).json({ error: 'Not found' });
        // Increment views
        await supabase.from('blog_articles').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
        return res.status(200).json({ ...data, views: (data.views || 0) + 1 });
      }
      if (id) {
        const { data, error } = await supabase.from('blog_articles').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('blog_articles').select('*').eq('published', true).order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
