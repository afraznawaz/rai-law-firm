import supabase from './_supabase.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Verify auth
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

    if (!boundary) return res.status(400).json({ error: 'No boundary in content-type' });

    // Parse multipart
    const boundaryBuffer = Buffer.from('--' + boundary);
    const parts = [];
    let start = 0;

    while (start < buffer.length) {
      const boundaryIdx = buffer.indexOf(boundaryBuffer, start);
      if (boundaryIdx === -1) break;
      const headerStart = boundaryIdx + boundaryBuffer.length + 2;
      const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), headerStart);
      if (headerEnd === -1) break;
      const headers = buffer.slice(headerStart, headerEnd).toString();
      const dataStart = headerEnd + 4;
      const nextBoundary = buffer.indexOf(boundaryBuffer, dataStart);
      const dataEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2;
      const data = buffer.slice(dataStart, dataEnd);
      parts.push({ headers, data });
      start = nextBoundary === -1 ? buffer.length : nextBoundary;
    }

    // Find file part
    let fileData = null, fileName = 'upload', fileType = 'application/octet-stream';
    for (const part of parts) {
      if (part.headers.includes('filename=')) {
        const fnMatch = part.headers.match(/filename="([^"]+)"/);
        const ctMatch = part.headers.match(/Content-Type:\s*([^\r\n]+)/);
        if (fnMatch) fileName = fnMatch[1];
        if (ctMatch) fileType = ctMatch[1].trim();
        fileData = part.data;
        break;
      }
    }

    if (!fileData) return res.status(400).json({ error: 'No file found in request' });

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${timestamp}_${safeName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, fileData, {
        contentType: fileType,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath);

    return res.status(200).json({
      url: publicUrl,
      path: filePath,
      name: fileName,
      type: fileType,
      size: fileData.length
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
