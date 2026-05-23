import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { date } = req.query;
      const token = req.headers.authorization?.replace('Bearer ', '');

      // Public: get booked slots for a date
      if (date && !token) {
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_time')
          .eq('booking_date', date)
          .neq('status', 'cancelled');
        if (error) throw error;
        return res.status(200).json(data.map(b => b.booking_time));
      }

      // Admin: get all bookings
      if (token) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });
        const { data, error } = await supabase
          .from('bookings').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }

      return res.status(400).json({ error: 'Missing params' });
    }

    if (req.method === 'POST') {
      const { name, phone, case_type, booking_date, booking_time, notes } = req.body;
      // Check if slot already taken
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', booking_date)
        .eq('booking_time', booking_time)
        .neq('status', 'cancelled');
      if (existing && existing.length > 0)
        return res.status(409).json({ error: 'Slot already booked' });

      const { data, error } = await supabase
        .from('bookings')
        .insert({ name, phone, case_type, booking_date, booking_time, notes, status: 'pending' })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });
      const { id, status } = req.body;
      const { data, error } = await supabase
        .from('bookings').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.body;
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Bookings error:', err);
    res.status(500).json({ error: err.message });
  }
}
