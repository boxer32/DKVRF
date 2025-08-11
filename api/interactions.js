const { verifyKey } = require('discord-interactions');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(200).send('ok');

    const sig = req.headers['x-signature-ed25519'];
    const ts  = req.headers['x-signature-timestamp'];

    // raw body
    const rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', c => (data += c));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

    const ok = sig && ts && verifyKey(rawBody, sig, ts, process.env.DISCORD_PUBLIC_KEY);
    if (!ok) return res.status(401).json({ error: 'invalid request signature' });

    const i = JSON.parse(rawBody);
    if (i.type === 1) return res.json({ type: 1 }); // PONG

    return res.json({ type: 4, data: { content: 'Verified ✅ (/api/interactions)' } });
  } catch (e) {
    console.error(e);
    return res.status(500).send('Server error');
  }
};
