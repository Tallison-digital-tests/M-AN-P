// /api/configuration.js
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://tallison-digital-tests.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function authVariants(tok) {
  const t = String(tok || '').trim();
  const out = new Set();
  if (/^Bearer\s/i.test(t)) {
    const raw = t.replace(/^Bearer\s+/i, '');
    out.add(`Bearer ${raw}`); out.add(`bearer_${raw}`); out.add(t);
  } else if (/^Bearer_/i.test(t)) {
    const raw = t.replace(/^Bearer_/i, '');
    out.add(`Bearer ${raw}`); out.add(`bearer_${raw}`); out.add(t);
  } else if (/^bearer[_\s]/i.test(t)) {
    const raw = t.replace(/^bearer[_\s]/i, '');
    out.add(`Bearer ${raw}`); out.add(`bearer_${raw}`); out.add(t);
  } else {
    out.add(`Bearer ${t}`); out.add(`bearer_${t}`); out.add(t);
  }
  return Array.from(out);
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { accessToken, ...rest } = req.query || {};
    if (!accessToken) return res.status(400).json({ error: 'Missing accessToken' });

    // Não encaminhar "form" ou "formId" na query
    delete rest.form;
    delete rest.formId;

    // Remonta a query string com os demais parâmetros
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(rest)) {
      if (Array.isArray(v)) v.forEach(item => qs.append(k, String(item)));
      else if (v !== undefined && v !== null) qs.append(k, String(v));
    }

    const upstreamBase = 'https://bradesco.md-apis.medallia.com/publicAPI/v2/configuration';
    const upstreamUrl = qs.toString() ? `${upstreamBase}?${qs.toString()}` : upstreamBase;

    let lastTxt = '';
    let lastStatus = 500;

    // Tenta formatos de Authorization automaticamente
    for (const auth of authVariants(accessToken)) {
      const r = await fetch(upstreamUrl, { headers: { Authorization: auth, Accept: 'application/json' } });
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
