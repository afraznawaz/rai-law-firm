import supabase from './_supabase.js';

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

    // Parse multipart form data manually
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const contentType = req.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) return res.status(400).json({ error: 'No boundary' });

    const boundaryBuf = Buffer.from('--' + boundary);
    const parts = [];
    let start = 0;
    while (start < buffer.length) {
      const idx = buffer.indexOf(boundaryBuf, start);
      if (idx === -1) break;
      const end = buffer.indexOf(boundaryBuf, idx + boundaryBuf.length);
      if (end === -1) break;
      const part = buffer.slice(idx + boundaryBuf.length + 2, end - 2);
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd === -1) { start = end; continue; }
      const headers = part.slice(0, headerEnd).toString();
      const body = part.slice(headerEnd + 4);
      const nameMatch = headers.match(/name="([^"]+)"/);
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      const ctMatch = headers.match(/Content-Type: (.+)/);
      if (nameMatch) parts.push({ name: nameMatch[1], filename: filenameMatch?.[1], contentType: ctMatch?.[1]?.trim(), body });
      start = end;
    }

    const filePart = parts.find(p => p.filename);
    if (!filePart) return res.status(400).json({ error: 'No file found' });

    const ext = filePart.filename.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const folder = req.query.folder || 'uploads';

    const { data, error } = await supabase.storage
      .from('media')
      .upload(`${folder}/${fileName}`, filePart.body, { contentType: filePart.contentType, upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`${folder}/${fileName}`);
    return res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
