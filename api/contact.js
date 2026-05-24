import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !phone || !message) return res.status(400).json({ error: 'Name, phone and message are required' });
      const { data, error } = await supabase.from('contact_messages').insert({ name, email, phone, subject, message }).select().single();
      if (error) throw error;
      return res.status(201).json({ ok: true, id: data.id });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Contact API error:', err);
    res.status(500).json({ error: err.message });
  }
}
