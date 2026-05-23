import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { name, phone, email, case_type, preferred_date, preferred_time, message } = req.body;
      if (!name || !phone || !preferred_date || !preferred_time) {
        return res.status(400).json({ error: 'Name, phone, date and time are required' });
      }
      // Check if slot is already booked
      const { data: existing } = await supabase.from('bookings')
        .select('id').eq('preferred_date', preferred_date).eq('preferred_time', preferred_time).eq('status', 'confirmed');
      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'This slot is already booked. Please choose another time.' });
      }
      const { data, error } = await supabase.from('bookings')
        .insert({ name, phone, email, case_type, preferred_date, preferred_time, message, status: 'confirmed' })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
      const { id, status } = req.body;
      const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
      const { id } = req.body;
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Bookings API error:', err);
    res.status(500).json({ error: err.message });
  }
}
