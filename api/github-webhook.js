module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Optional: verify GitHub signature if secret is set
  // For now accept any push to main
  const event = req.headers['x-github-event'];
  if (event && event !== 'push' && event !== 'ping') {
    return res.status(200).json({ ok: true, ignored: event });
  }

  // Trigger Vercel deployment via API with gitSource
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN;
  const PROJECT_ID = 'prj_mezdM1IxWHA9AZApNkR5nAuRJUxz';
  const ORG_ID = 'team_OMvLjH08uEsGPg6h2MRr0OSA';
  
  if (!VERCEL_TOKEN) {
    console.error('VERCEL_TOKEN not set');
    return res.status(500).json({ error: 'VERCEL_TOKEN not configured' });
  }

  try {
    const payload = await (async () => {
      // Try to get commit SHA from GitHub payload
      let sha = undefined;
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (body && body.after) sha = body.after;
        if (body && body.head_commit && body.head_commit.id) sha = body.head_commit.id;
      } catch {}
      return {
        name: 'da2-beauty-paradise',
        project: PROJECT_ID,
        teamId: ORG_ID,
        gitSource: {
          type: 'github',
          repo: 'abilashantonyrajt-stack/static-site',
          ref: 'main',
          ...(sha ? { sha } : {}),
        },
      };
    })();

    const resp = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error('Vercel deploy failed', resp.status, data);
      return res.status(500).json({ error: 'Vercel deploy failed', details: data });
    }
    console.log('Triggered deploy', data.id || data.url);
    return res.status(200).json({ ok: true, deployment: data.id || data.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error', details: String(e.message || e) });
  }
};
