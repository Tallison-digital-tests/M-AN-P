// /api/configuration.js
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://tallison-digital-tests.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { formId, accessToken } = req.query;
    if (!formId || !accessToken) return res.status(400).json({ error: 'Missing formId or accessToken' });

    let auth = String(accessToken).trim();
    if (!/^bearer[_\s]/i.test(auth)) auth = `Bearer_${auth}`;

    const upstream = `https://bradesco.md-apis.medallia.com/publicAPI/v2/configuration?formId=${encodeURIComponent(formId)}`;
    const r = await fetch(upstream, { headers: { Authorization: auth } });
    const txt = await r.text().catch(() => '');
    let data; try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
