import supabase from './_supabase.js';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

      let body = req.body;
      if (!body || !body.title) {
        const form = new IncomingForm({ maxFileSize: 20 * 1024 * 1024 });
        const { fields, files } = await new Promise((resolve, reject) => {
          form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
        });
        const file = files.file?.[0] || files.file;
        if (file) {
          const fileBuffer = fs.readFileSync(file.filepath || file.path);
          const originalName = file.originalFilename || file.name || 'upload';
          const mimeType = file.mimetype || file.type || 'application/octet-stream';
          const fileName = `certificates/${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, fileBuffer, { contentType: mimeType, upsert: false });
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
          body = { title: fields.title?.[0] || fields.title, description: fields.description?.[0] || fields.description, file_url: publicUrl, file_type: mimeType, file_name: originalName };
        }
      }
      const { data, error } = await supabase.from('certificates').insert(body).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
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
