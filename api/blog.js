import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, slug, admin } = req.query;
      if (id) {
        const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (slug) {
        const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (!admin) query = query.eq('published', true);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

      const { title, slug, category, excerpt, content, author, published } = req.body;
      const { data, error } = await supabase.from('blog_posts')
        .insert({ title, slug, category, excerpt, content, author, published })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

      const { id, title, slug, category, excerpt, content, author, published } = req.body;
      const { data, error } = await supabase.from('blog_posts')
        .update({ title, slug, category, excerpt, content, author, published, updated_at: new Date().toISOString() })
        .eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

      const { id } = req.body;
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Blog API error:', err);
    res.status(500).json({ error: err.message });
  }
}
