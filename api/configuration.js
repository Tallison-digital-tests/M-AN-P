// /api/configuration.js
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://tallison-digital-tests.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function asBearerUnderscore(tok) {
  const t = String(tok || '').trim();
  return /^bearer[_\s]/i.test(t) ? t : `bearer_${t}`;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { accessToken, payload } = req.body || {};
    if (!accessToken) return res.status(400).json({ error: 'Missing accessToken' });
    if (!payload)     return res.status(400).json({ error: 'Missing payload' });

    const upstream = 'https://bradesco.md-apis.medallia.com/publicAPI/v2/configuration';
    const r = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Authorization': asBearerUnderscore(accessToken),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) // ← envia SOMENTE o payload para o upstream
    });

    const txt = await r.text().catch(() => '');
    let data; try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
