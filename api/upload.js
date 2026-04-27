import supabase from './_supabase.js';

export const config = { api: { bodyParser: false } };

async function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

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

    const contentType = req.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) return res.status(400).json({ error: 'No boundary found' });

    const body = await parseMultipart(req);
    const boundaryBuf = Buffer.from('--' + boundary);

    // Parse multipart
    const parts = [];
    let start = 0;
    while (start < body.length) {
      const boundaryIdx = body.indexOf(boundaryBuf, start);
      if (boundaryIdx === -1) break;
      const headerStart = boundaryIdx + boundaryBuf.length + 2;
      const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), headerStart);
      if (headerEnd === -1) break;
      const headers = body.slice(headerStart, headerEnd).toString();
      const dataStart = headerEnd + 4;
      const nextBoundary = body.indexOf(boundaryBuf, dataStart);
      const dataEnd = nextBoundary === -1 ? body.length : nextBoundary - 2;
      const data = body.slice(dataStart, dataEnd);
      parts.push({ headers, data });
      start = nextBoundary === -1 ? body.length : nextBoundary;
    }

    let fileData = null;
    let fileName = '';
    let mimeType = 'application/octet-stream';
    let bucket = 'documents';

    for (const part of parts) {
      if (part.headers.includes('filename=')) {
        const fnMatch = part.headers.match(/filename="([^"]+)"/);
        const ctMatch = part.headers.match(/Content-Type:\s*([^\r\n]+)/);
        if (fnMatch) fileName = fnMatch[1];
        if (ctMatch) mimeType = ctMatch[1].trim();
        fileData = part.data;
        // Choose bucket based on type
        if (mimeType.startsWith('image/')) bucket = 'blog-images';
        else bucket = 'documents';
      }
    }

    if (!fileData || !fileName) return res.status(400).json({ error: 'No file found in request' });

    const ext = fileName.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(uniqueName, fileData, { contentType: mimeType, upsert: false });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(uniqueName);

    return res.status(200).json({
      url: publicUrl,
      fileName: fileName,
      fileType: mimeType,
      bucket: bucket
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
