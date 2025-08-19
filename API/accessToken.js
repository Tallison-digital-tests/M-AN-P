export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const r = await fetch('https://bradesco.md-apis.medallia.com/publicAPI/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await r.json().catch(() => ({}));
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
