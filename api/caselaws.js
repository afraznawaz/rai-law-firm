import supabase from './_supabase.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { admin } = req.query;
      let query = supabase.from('case_laws').select('*').order('created_at', { ascending: false });
      if (!admin) query = query.eq('published', true);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    // Auth required for mutations
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

    if (req.method === 'POST') {
      const { title, court, parties, date, judges, outcome, category, description, file_url, file_type, published } = req.body;
      const { data, error } = await supabase.from('case_laws')
        .insert({ title, court, parties, date, judges, outcome, category, description, file_url, file_type, published })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, title, court, parties, date, judges, outcome, category, description, file_url, file_type, published } = req.body;
      const { data, error } = await supabase.from('case_laws')
        .update({ title, court, parties, date, judges, outcome, category, description, file_url, file_type, published })
        .eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('case_laws').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Case Laws API error:', err);
    res.status(500).json({ error: err.message });
  }
}
