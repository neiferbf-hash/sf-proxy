const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/login', async (req, res) => {
  const { username, password, client_id, client_secret } = req.body;
  try {
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id,
      client_secret,
      username,
      password
    });
    const r = await fetch('https://login.salesforce.com/services/oauth2/token', {
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
  const { instance, token, q } = req.query;
  if (!instance || !token || !q) return res.status(400).json({ error: 'Parâmetros obrigatórios: instance, token, q' });
  try {
    const r = await fetch(`${instance}/services/data/v62.0/query?q=${encodeURIComponent(q)}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('SF Proxy rodando!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
