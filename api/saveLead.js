export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://www.zolzolzol.co.il/api/saveLead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ZolZolZol-Landing/1.0'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(response.status).send(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
