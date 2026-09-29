export default async function handler(req, res) {
  const query = new URL(req.url, 'http://localhost').search;
  const target = 'https://telecom-packages.vercel.app/api/packages' + query;

  try {
    const response = await fetch(target, {
      headers: { 'User-Agent': 'ZolZolZol-Landing/1.0' }
    });
    const data = await response.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(response.status).send(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
