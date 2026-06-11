import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { admin } = req.query;
      if (admin) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
        const { data, error } = await supabase.from('lawyers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('lawyers').select('*').eq('status', 'approved').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { name, email, phone, bar_number, specialization, experience, bio } = req.body;
      const { data, error } = await supabase.from('lawyers')
        .insert({ name, email, phone, bar_number, specialization, experience, bio, status: 'pending' })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
      const { id, status, name, email, phone, bar_number, specialization, experience, bio } = req.body;
      const { data, error } = await supabase.from('lawyers')
        .update({ status, name, email, phone, bar_number, specialization, experience, bio })
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
      const { error } = await supabase.from('lawyers').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
