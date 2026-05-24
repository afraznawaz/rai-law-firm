import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { slug, id } = req.query;

      if (slug) {
        // Increment views
        await supabase.rpc('increment_elib_views', { post_slug: slug }).catch(() => {});
        const { data, error } = await supabase.from('elibrary_posts').select('*').eq('slug', slug).single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      const { data, error } = await supabase
        .from('elibrary_posts')
        .select('id,title,slug,category,excerpt,image_url,views,author,created_at')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('E-Library API error:', err);
    res.status(500).json({ error: err.message });
  }
}
