// Vercel Serverless Function to proxy AI completions without browser CORS restrictions
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { baseUrl, apiKey, model, messages, temperature = 0.7, max_tokens } = body || {};

    if (!baseUrl || !apiKey || !model) {
      return res.status(400).json({ error: 'Missing required fields: baseUrl, apiKey, or model' });
    }

    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const upstreamUrl = `${cleanBaseUrl}/chat/completions`;

    const sanitizedMessages = (Array.isArray(messages) ? messages : []).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
      content: typeof m.content === 'string' ? m.content : String(m.content || '')
    }));

    // Candidate model list (with auto-fallback for decommissioned/legacy models)
    const candidateModels = [model];
    if (model === 'z-ai/glm-5.2') candidateModels.push('z-ai/glm-5.3-flash');
    if (model === 'deepseek-ai/deepseek-v4.1-flash') candidateModels.push('deepseek-ai/deepseek-r1', 'deepseek-ai/deepseek-v3');

    let lastError = null;
    let lastData = null;

    for (const currentModel of candidateModels) {
      try {
        const payload = {
          model: currentModel,
          messages: sanitizedMessages,
          temperature,
          ...(max_tokens ? { max_tokens } : {})
        };

        const response = await fetch(upstreamUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(35000),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          return res.status(200).json(data);
        }

        lastData = data;
        const errMsg = data.detail || data.message || `Upstream gateway returned ${response.status}`;
        lastError = { status: response.status, message: errMsg };

        // If model not found or decommissioned, try next candidate model
        if (response.status === 404 || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('decommissioned')) {
          continue;
        }

        // For other errors (e.g. auth 401), return immediately
        return res.status(response.status).json({
          error: errMsg,
          upstreamData: data
        });
      } catch (err) {
        lastError = { status: 500, message: err.message };
      }
    }

    return res.status(lastError?.status || 500).json({
      error: lastError?.message || 'Failed to communicate with AI gateway',
      upstreamData: lastData,
      type: 'upstream_error'
    });
  } catch (err) {
    console.error('AI Proxy Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process AI proxy request',
      type: 'proxy_error'
    });
  }
}
