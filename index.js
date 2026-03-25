const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = '3MVG9riCAn8HHkYWaWkJNoB0XZwXPjBb0PyWHXKHaoR557F0aqBxEptwcXAc4iCBl2k3mggzh0dmysUsX7ZQV';
const CLIENT_SECRET = 'FEC323EDDA941E33103550DD64D5DBC6B66CDBB51E8341F6DB6A2F73182F6FC7';
const SF_DOMAIN = 'https://qms-certification.my.salesforce.com';

let cachedToken = null;

async function getToken() {
  const params = new URLSearchParams({ grant_type:'client_credentials', client_id:CLIENT_ID, client_secret:CLIENT_SECRET });
  const r = await fetch(`${SF_DOMAIN}/services/oauth2/token`, { method:'POST', body:params });
  const data = await r.json();
  cachedToken = data.access_token;
  return cachedToken;
}

app.get('/connect', async (req, res) => {
  try { res.json({ access_token: await getToken() }); }
  catch(err) { res.status(500).json({ error:err.message }); }
});

app.get('/query', async (req, res) => {
  const { q } = req.query;
  try {
    if (!cachedToken) await getToken();
    let r = await fetch(`${SF_DOMAIN}/services/data/v62.0/query?q=${encodeURIComponent(q)}`, {
      headers: { 'Authorization': `Bearer ${cachedToken}` }
    });
    let data = await r.json();
    if (data[0]?.errorCode === 'INVALID_SESSION_ID') {
      await getToken();
      r = await fetch(`${SF_DOMAIN}/services/data/v62.0/query?q=${encodeURIComponent(q)}`, {
        headers: { 'Authorization': `Bearer ${cachedToken}` }
      });
      data = await r.json();
    }
    res.json(data);
  } catch(err) { res.status(500).json({ error:err.message }); }
});

app.post('/chat', async (req, res) => {
  const { messages, system } = req.body;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key': process.env.ANTHROPIC_KEY, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, system, messages })
    });
    res.json(await r.json());
  } catch(err) { res.status(500).json({ error:err.message }); }
});

app.get('/', (req, res) => res.send('SF Proxy rodando!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Porta ${PORT}`));
