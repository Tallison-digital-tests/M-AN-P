// /api/accessToken.js
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://tallison-digital-tests.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const upstream = 'https://bradesco.md-apis.medallia.com/publicAPI/v2/accessToken';

    // 1) Preferir Authorization do cliente: "Authorization: Bearer <PROPERTY_TOKEN>"
    let auth = req.headers.authorization;

    // 2) Fallback: body { token: "<PROPERTY_TOKEN>" }
    if (!auth && req.body && req.body.token) auth = `Bearer ${req.body.token}`;

    if (!auth) return res.status(400).json({ error: 'Missing Authorization (Bearer <token>)' });

    const r = await fetch(upstream, {
      method: 'POST',
      headers: { 'Authorization': auth }
      // sem body — esta instância autentica via header
    });

    const data = await r.json().catch(() => ({}));
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
