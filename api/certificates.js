import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // GET - fetch all certificates (public)
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    // Verify auth for write operations
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

    // POST - save certificate record (file already uploaded to storage)
    if (req.method === 'POST') {
      const { title, description, file_url, file_name, file_type, file_size } = req.body;
      if (!title || !file_url) return res.status(400).json({ error: 'Title and file_url required' });
      const { data, error } = await supabase
        .from('certificates')
        .insert({ title, description, file_url, file_name, file_type, file_size })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    // DELETE - remove certificate
    if (req.method === 'DELETE') {
      const { id, file_path } = req.body;
      if (!id) return res.status(400).json({ error: 'ID required' });
      // Remove from storage if path provided
      if (file_path) {
        await supabase.storage.from('certificates').remove([file_path]);
      }
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
