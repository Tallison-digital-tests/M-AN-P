export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { formId, accessToken } = req.query;
    if (!formId || !accessToken) return res.status(400).json({ error: 'Missing formId or accessToken' });

    const upstream = `https://bradesco.md-apis.medallia.com/publicAPI/v2/configuration?formId=${encodeURIComponent(formId)}`;
    const r = await fetch(upstream, { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await r.json().catch(() => ({}));
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
