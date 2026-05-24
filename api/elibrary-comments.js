import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { post_id } = req.query;
      if (!post_id) return res.status(400).json({ error: 'post_id required' });
      const { data, error } = await supabase
        .from('elibrary_comments')
        .select('*')
        .eq('post_id', post_id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Login required to comment' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid session' });

      const { post_id, body } = req.body;
      if (!post_id || !body?.trim()) return res.status(400).json({ error: 'post_id and body required' });

      const { data, error } = await supabase.from('elibrary_comments')
        .insert({ post_id, body: body.trim(), user_id: user.id, user_email: user.email, user_name: user.email.split('@')[0] })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Comments API error:', err);
    res.status(500).json({ error: err.message });
  }
}
