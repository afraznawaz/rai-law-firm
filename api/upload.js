import supabase from './_supabase.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Auth check
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

    // Read raw body
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    // Parse multipart manually
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) return res.status(400).json({ error: 'No boundary in multipart' });

    const boundary = boundaryMatch[1];
    const parts = parseMultipart(body, boundary);
    if (!parts.length) return res.status(400).json({ error: 'No file found' });

    const filePart = parts[0];
    const fileName = filePart.filename || `upload-${Date.now()}`;
    const mimeType = filePart.contentType || 'application/octet-stream';
    const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
    const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Upload to Supabase Storage bucket 'certificates'
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('certificates')
      .upload(uniqueName, filePart.data, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadErr) {
      // Fallback: store as base64 data URL if storage fails
      const base64 = filePart.data.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;
      return res.status(200).json({
        url: dataUrl,
        name: fileName,
        type: ext,
        storage: 'base64'
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(uniqueName);

    return res.status(200).json({
      url: publicUrl,
      name: fileName,
      type: ext,
      storage: 'supabase'
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
}

function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuf = Buffer.from('--' + boundary);
  let start = 0;

  while (start < buffer.length) {
    const boundaryIdx = buffer.indexOf(boundaryBuf, start);
    if (boundaryIdx === -1) break;

    const headerStart = boundaryIdx + boundaryBuf.length + 2; // skip \r\n
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), headerStart);
    if (headerEnd === -1) break;

    const headerStr = buffer.slice(headerStart, headerEnd).toString();
    const dataStart = headerEnd + 4;

    const nextBoundary = buffer.indexOf(boundaryBuf, dataStart);
    const dataEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2; // skip \r\n before boundary

    const data = buffer.slice(dataStart, dataEnd);

    // Parse headers
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    const contentTypeMatch = headerStr.match(/Content-Type:\s*(.+)/i);

    if (filenameMatch) {
      parts.push({
        filename: filenameMatch[1],
        contentType: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
        data
      });
    }

    start = nextBoundary === -1 ? buffer.length : nextBoundary;
  }

  return parts;
}
