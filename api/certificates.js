import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { admin } = req.query;
      let query = supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (!admin) query = query.eq('published', true);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

    if (req.method === 'POST') {
      const { title, issuer, date, description, image_url, category, published } = req.body;
      const { data, error } = await supabase.from('certificates')
        .insert({ title, issuer, date, description, image_url, category, published })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, title, issuer, date, description, image_url, category, published } = req.body;
      const { data, error } = await supabase.from('certificates')
        .update({ title, issuer, date, description, image_url, category, published })
        .eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Certificates API error:', err);
    res.status(500).json({ error: err.message });
  }
}
