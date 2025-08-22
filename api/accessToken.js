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



    // 1) Preferir Authorization do cliente
    let auth = req.headers.authorization?.trim();

    // 2) Fallback: body { token }
    if (!auth && req.body && req.body.token) auth = String(req.body.token).trim();



    if (!auth) return res.status(400).json({ error: 'Missing Authorization or token' });

    // Normaliza: se não começar com bearer + (_ ou espaço), prefixa com bearer_
    if (!/^bearer[_\s]/i.test(auth)) auth = `Bearer_${auth}`;



    const r = await fetch(upstream, { method: 'POST', headers: { Authorization: auth } });
    const txt = await r.text().catch(() => '');
    let data; try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
