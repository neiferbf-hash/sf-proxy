const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = '3MVG9riCAn8HHkYWaWkJNoB0XZwXPjBb0PyWHXKHaoR557F0aqBxEptwcXAc4iCBl2k3mggzh0dmysUsX7ZQV';
const CLIENT_SECRET = 'FEC323EDDA941E33103550DD64D5DBC6B66CDBB51E8341F6DB6A2F73182F6FC7';
const SF_DOMAIN = 'https://qms-certification.my.salesforce.com';

app.get('/connect', async (req, res) => {
  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    });
    const r = await fetch(`${SF_DOMAIN}/services/oauth2/token`, {
      method: 'POST',
      body: params
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/query', async (req, res) => {
  const { token, q } = req.query;
  if (!token || !q) return res.status(400).json({ error: 'Parâmetros obrigatórios' });
  try {
    const r = await fetch(`${SF_DOMAIN}/services/data/v62.0/query?q=${encodeURIComponent(q)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('SF Proxy rodando!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Porta ${PORT}`));
