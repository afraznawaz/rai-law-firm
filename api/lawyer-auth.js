import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { action, email, password, full_name, bar_number, specialization, city, phone, bio, experience_years } = req.body;

      if (action === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name, role: 'lawyer' } } });
        if (error) throw error;
        if (data.user) {
          await supabase.from('lawyer_profiles').insert({ user_id: data.user.id, full_name, bar_number, specialization, city, phone, bio, experience_years: parseInt(experience_years) || 0, approved: false });
        }
        return res.status(201).json({ message: 'Registration successful. Awaiting approval.' });
      }

      if (action === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: profile } = await supabase.from('lawyer_profiles').select('*').eq('user_id', data.user.id).single();
        return res.status(200).json({ user: data.user, session: data.session, profile });
      }
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('lawyer_profiles').select('*').eq('approved', true).order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
