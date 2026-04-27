import supabase from './_supabase.js';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

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

    const { fileName, fileType, fileData, bucket } = req.body;
    if (!fileName || !fileData) return res.status(400).json({ error: 'Missing file data' });

    // Decode base64
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const targetBucket = bucket || 'case-files';
    const filePath = `${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, buffer, { contentType: fileType, upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
    return res.status(200).json({ url: urlData.publicUrl, path: filePath });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
