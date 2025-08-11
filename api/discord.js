const { verifyKey } = require('discord-interactions');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(200).send('ok');

    const sig = req.headers['x-signature-ed25519'];
    const ts  = req.headers['x-signature-timestamp'];

    const rawBody = await getRawBody(req);

    const isValid = verifyKey(rawBody, sig, ts, process.env.DISCORD_PUBLIC_KEY);
    if (!isValid) return res.status(401).send('invalid request');

    const payload = JSON.parse(rawBody);
    if (payload.type === 1) return res.json({ type: 1 });

    return res.json({ type: 4, data: { content: 'Verified ✅' } });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
