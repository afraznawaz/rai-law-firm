export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const decoded = decodeURIComponent(url);
    // Only allow known safe PDF domains
    const allowed = ['lawyersofpakistan.com', 'pakistanlawsite.com', 'fia.gov.pk', 'fbr.gov.pk', 'secp.gov.pk'];
    const isAllowed = allowed.some(d => decoded.includes(d));
    if (!isAllowed) return res.status(403).json({ error: 'Domain not allowed' });

    const response = await fetch(decoded, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RAI-Associates-Library/1.0)',
        'Accept': 'application/pdf,*/*'
      }
    });

    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

    const contentType = response.headers.get('content-type') || 'application/pdf';
    const filename = decoded.split('/').pop() || 'document.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Proxy PDF error:', err);
    res.status(500).json({ error: err.message });
  }
}
