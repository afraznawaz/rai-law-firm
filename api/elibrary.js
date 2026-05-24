import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, category } = req.query;

      if (id) {
        // Increment view count
        await supabase.from('elibrary_items').update({ views: supabase.rpc('increment', { x: 1 }) }).eq('id', id);
        // Use raw increment
        await supabase.rpc('increment_views', { item_id: parseInt(id) }).catch(() => {});
        // Simple update
        const { data: item } = await supabase.from('elibrary_items').select('*').eq('id', id).single();
        if (item) {
          await supabase.from('elibrary_items').update({ views: (item.views || 0) + 1 }).eq('id', id);
        }
        // Fetch comments
        const { data: comments } = await supabase.from('elibrary_comments').select('*').eq('item_id', id).order('created_at', { ascending: false });
        return res.status(200).json({ ...item, comments: comments || [] });
      }

      let query = supabase.from('elibrary_items').select('id,title,category,description,image_url,views,created_at').eq('published', true).order('created_at', { ascending: false });
      if (category && category !== 'All') query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { item_id, user_name, comment } = req.body;
      if (!item_id || !user_name || !comment) return res.status(400).json({ error: 'Missing fields' });
      const { data, error } = await supabase.from('elibrary_comments').insert({ item_id, user_name, comment }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('E-Library API error:', err);
    res.status(500).json({ error: err.message });
  }
}
