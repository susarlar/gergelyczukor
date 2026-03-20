const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// Supabase (optional — server works without it, just won't persist)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// Simple admin auth
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;


function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return res.status(503).json({ error: 'Admin not configured' });
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'building-leaders-proxy' });
});

// Proxy endpoint — now also saves to Supabase
app.post('/api/coach', async (req, res) => {
  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { messages, temperature = 0.7, max_tokens = 1200, answers, language, consent } = req.body;

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
    const analysis = data.choices?.[0]?.message?.content || null;

    // Save to Supabase in background (only if user consented)
    if (supabase && answers && consent !== false) {
      supabase.from('sessions').insert({
        language: language || 'en',
        answers,
        analysis,
      }).then(({ error }) => {
        if (error) console.error('Supabase insert error:', error.message);
      });
    }

    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Internal proxy error' });
  }
});

// ===== ADMIN ENDPOINTS =====

// List all sessions (newest first)
app.get('/api/admin/sessions', requireAdmin, async (_req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });

  const { data, error } = await supabase
    .from('sessions')
    .select('id, created_at, language, answers, coach_notes')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get single session with full analysis
app.get('/api/admin/sessions/:id', requireAdmin, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Session not found' });
  res.json(data);
});

// Add/update coach notes on a session
app.patch('/api/admin/sessions/:id', requireAdmin, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });

  const { coach_notes } = req.body;
  const { data, error } = await supabase
    .from('sessions')
    .update({ coach_notes })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete a session
app.delete('/api/admin/sessions/:id', requireAdmin, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
