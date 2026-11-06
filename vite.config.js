import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import base44 from '@base44/vite-plugin'

function localAiProxyPlugin() {
  return {
    name: 'local-ai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const upstreamUrl = `${parsed.baseUrl.replace(/\/+$/, '')}/chat/completions`;
              const candidateModels = [parsed.model];
              if (parsed.model === 'z-ai/glm-5.2') candidateModels.push('z-ai/glm-5.3-flash');
              if (parsed.model === 'deepseek-ai/deepseek-v4.1-flash') candidateModels.push('deepseek-ai/deepseek-r1', 'deepseek-ai/deepseek-v3');

              let lastResp = null;
              let lastData = null;

              for (const currentModel of candidateModels) {
                const resp = await fetch(upstreamUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${parsed.apiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: currentModel,
                    messages: parsed.messages,
                    temperature: parsed.temperature || 0.7,
                    ...(parsed.max_tokens ? { max_tokens: parsed.max_tokens } : {})
                  }),
                  signal: AbortSignal.timeout(35000),
                });
                const data = await resp.json().catch(() => ({}));
                if (resp.ok) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(JSON.stringify(data));
                  return;
                }
                lastResp = resp;
                lastData = data;
                const errMsg = data.detail || data.message || '';
                if (resp.status === 404 || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('decommissioned')) {
                  continue;
                }
                break;
              }

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = lastResp?.status || 500;
              res.end(JSON.stringify(lastData || { error: 'Failed' }));
            } catch (err) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.statusCode = 200;
          res.end('OK');
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    localAiProxyPlugin(),
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true'
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            return 'vendor';
          }
        }
      }
    }
  }
});
