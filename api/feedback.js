// /api/feedback.js
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://tallison-digital-tests.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}
function authVariants(tok) {
  const t = String(tok || '').trim();
  const variants = new Set();
  if (/^Bearer\s/i.test(t)) {
    const raw = t.replace(/^Bearer\s+/i, '');
    variants.add(`Bearer ${raw}`); variants.add(`bearer_${raw}`); variants.add(t);
  } else if (/^Bearer_/i.test(t)) {
    const raw = t.replace(/^Bearer_/i, '');
    variants.add(`Bearer ${raw}`); variants.add(`bearer_${raw}`); variants.add(t);
  } else if (/^bearer[_\s]/i.test(t)) {
    const raw = t.replace(/^bearer[_\s]/i, '');
    variants.add(`Bearer ${raw}`); variants.add(`bearer_${raw}`); variants.add(t);
  } else {
    variants.add(`Bearer ${t}`); variants.add(`bearer_${t}`); variants.add(t);
  }
  return Array.from(variants);
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { accessToken, ...payload } = req.body || {};
    if (!accessToken) return res.status(400).json({ error: 'Missing accessToken' });

    const upstream = 'https://bradesco.md-apis.medallia.com/publicAPI/v2/feedback';

    let lastTxt = '';
    let lastStatus = 500;
    for (const auth of authVariants(accessToken)) {
      const r = await fetch(upstream, {
        method: 'POST',
        headers: {
          'Authorization': auth,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      lastStatus = r.status;
      const txt = await r.text().catch(() => '');
      lastTxt = txt;

      if (r.status !== 401 && r.status !== 403) {
        try { return res.status(r.status).json(JSON.parse(txt)); }
        catch { return res.status(r.status).json({ raw: txt }); }
      }
    }

    try { return res.status(lastStatus).json(JSON.parse(lastTxt || '{}')); }
    catch { return res.status(lastStatus).json({ raw: lastTxt }); }
  } catch (e) {
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
