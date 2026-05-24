import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    if (req.method === 'GET') {
      const { action } = req.query;

      if (action === 'profile') {
        const { data, error } = await supabase.from('lawyers').select('*').eq('email', user.email).single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (action === 'leads') {
        const { data: lawyer } = await supabase.from('lawyers').select('id').eq('email', user.email).single();
        if (!lawyer) return res.status(404).json({ error: 'Lawyer not found' });
        const { data, error } = await supabase.from('contact_submissions')
          .select('*').order('created_at', { ascending: false }).limit(20);
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (action === 'stats') {
        const { data: lawyer } = await supabase.from('lawyers').select('id,profile_views,consultation_count').eq('email', user.email).single();
        return res.status(200).json(lawyer || {});
      }

      if (action === 'blogs') {
        const { data, error } = await supabase.from('blog_posts').select('id,title,category,published,created_at').eq('author', user.email).order('created_at', { ascending: false });
        return res.status(200).json(data || []);
      }
    }

    if (req.method === 'PUT') {
      const { action, ...body } = req.body;

      if (action === 'profile') {
        const allowed = ['full_name','phone','whatsapp','city','address','bio','practice_areas','bar_council','experience_years','fee_range','available_for_consultation','profile_photo_url','linkedin','website'];
        const update = {};
        allowed.forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        update.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('lawyers').update(update).eq('email', user.email).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (action === 'availability') {
        const { data, error } = await supabase.from('lawyers')
          .update({ available_for_consultation: body.status, updated_at: new Date().toISOString() })
          .eq('email', user.email).select('available_for_consultation').single();
        if (error) throw error;
        return res.status(200).json(data);
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
}
