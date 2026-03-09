const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

app.use(cors());

app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'building-leaders-proxy' });
});

// Proxy endpoint
app.post('/api/coach', async (req, res) => {
  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { messages, temperature = 0.7, max_tokens = 1200 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature,
        max_tokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek API error:', response.status, errText);
      return res.status(response.status).json({ error: 'DeepSeek API error', details: errText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Internal proxy error' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
