import supabase from './_supabase.js';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

    const form = new IncomingForm({ maxFileSize: 20 * 1024 * 1024 });
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
    });

    const file = files.file?.[0] || files.file;
    if (!file) return res.status(400).json({ error: 'No file' });

    const fileBuffer = fs.readFileSync(file.filepath || file.path);
    const originalName = file.originalFilename || file.name || 'upload';
    const mimeType = file.mimetype || file.type || 'application/octet-stream';
    const fileName = `uploads/${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, { contentType: mimeType, upsert: false });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
    return res.status(200).json({ url: publicUrl, fileName: originalName, fileType: mimeType });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
