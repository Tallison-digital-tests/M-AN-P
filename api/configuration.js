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
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { accessToken, ...q } = req.query || {};
    if (!accessToken) return res.status(400).json({ error: 'Missing accessToken' });

    // nunca encaminhar form/formId
    delete q.form; delete q.formId;

    const qs = new URLSearchParams();
    for (const [k,v] of Object.entries(q)) {
      if (v == null) continue;
      if (Array.isArray(v)) v.forEach(x => qs.append(k, String(x)));
      else qs.append(k, String(v));
    }
    const upstream = 'https://bradesco.md-apis.medallia.com/publicAPI/v2/configuration' + (qs.toString() ? `?${qs}` : '');

    const r = await fetch(upstream, { headers: { Authorization: asBearerUnderscore(accessToken), Accept: 'application/json' } });
    const txt = await r.text().catch(()=> '');
    try { return res.status(r.status).json(JSON.parse(txt)); }
    catch { return res.status(r.status).json({ raw: txt }); }
  } catch (e) {
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
