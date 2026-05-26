export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const decoded = decodeURIComponent(url);

    const allowed = ['lawyersofpakistan.com', 'pakistanlawsite.com', 'fia.gov.pk', 'fbr.gov.pk', 'secp.gov.pk'];
    const isAllowed = allowed.some(d => decoded.includes(d));
    if (!isAllowed) return res.status(403).json({ error: 'Domain not allowed' });

    const response = await fetch(decoded, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,application/octet-stream,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://lawyersofpakistan.com/',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Source returned ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    const filename = decoded.split('/').pop() || 'document.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 100) {
      return res.status(502).json({ error: 'Empty or invalid PDF received' });
    }
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Proxy PDF error:', err);
    res.status(500).json({ error: err.message });
  }
}
