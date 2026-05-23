import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('chatbot_settings').select('*').eq('id', 1).single();
      if (error) return res.status(200).json({ enabled: true, welcome_message: 'Hello! Welcome to R&A Law Firm. I am Advocate Noor, your virtual legal assistant. How can I assist you today?' });
      return res.status(200).json(data);
    }
    if (req.method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
      const { enabled, welcome_message } = req.body;
      const { data, error } = await supabase.from('chatbot_settings')
        .update({ enabled, updated_at: new Date().toISOString() }).eq('id', 1).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
