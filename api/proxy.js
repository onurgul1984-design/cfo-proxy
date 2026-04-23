export default async function handler(req, res) {
  // CORS headers — herkesten izin ver
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'url parametresi gerekli' });
  }

  // Sadece izinli domainlere proxy yap
  const allowedDomains = [
    'evds2.tcmb.gov.tr',
    'evds3.tcmb.gov.tr',
    'www.tcmb.gov.tr',
    'api.frankfurter.dev',
    'cdn.jsdelivr.net',
    'open.er-api.com'
  ];

  try {
    const url = new URL(targetUrl);
    if (!allowedDomains.some(d => url.hostname === d || url.hostname.endsWith('.' + d))) {
      return res.status(403).json({ error: 'Bu domain izinli değil: ' + url.hostname });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Geçersiz URL' });
  }

  try {
    const r = await fetch(targetUrl);
    const text = await r.text();
    res.status(r.status);
    const contentType = r.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    return res.send(text);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy hatası: ' + (err.message || err) });
  }
}
