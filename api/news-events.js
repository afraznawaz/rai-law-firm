import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      const { data, error } = await supabase.from('news_events').select('*').eq('published', true).order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(Array.isArray(data) ? data : []);
    }
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

    if (req.method === 'POST') {
      const { title, type, description, content, event_date, location, file_url, file_name, file_type, published } = req.body;
      const { data, error } = await supabase.from('news_events').insert({ title, type, description, content, event_date, location, file_url, file_name, file_type, published }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, title, type, description, content, event_date, location, file_url, file_name, file_type, published } = req.body;
      const { data, error } = await supabase.from('news_events').update({ title, type, description, content, event_date, location, file_url, file_name, file_type, published }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('news_events').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('News Events API error:', err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
