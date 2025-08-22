function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://tallison-digital-tests.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}
function asBearerUnderscore(tok) {
  const t = String(tok || '').trim();
  if (/^Bearer_/i.test(t)) return t;
  if (/^Bearer\s+/i.test(t)) return 'Bearer_' + t.replace(/^Bearer\s+/i, '');
  if (/^bearer[_\s]/i.test(t)) return 'Bearer_' + t.replace(/^bearer[_\s]/i, '');
  return `Bearer_${t}`;
}
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    // Aceita header Authorization OU body { token }
    let auth = req.headers.authorization;
    if (!auth && req.body && req.body.token) auth = String(req.body.token);
    if (!auth) return res.status(400).json({ error: 'Missing Authorization/token' });

    const r = await fetch('https://bradesco.md-apis.medallia.com/publicAPI/v2/accessToken', {
      method: 'POST',
      headers: { Authorization: asBearerUnderscore(auth) }
    });
    const txt = await r.text().catch(()=> '');
    try { return res.status(r.status).json(JSON.parse(txt)); }
    catch { return res.status(r.status).json({ raw: txt }); }
  } catch (e) {
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
