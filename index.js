const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/query', async (req, res) => {
  const { instance, token, q } = req.query;
  if (!instance || !token || !q) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: instance, token, q' });
  }
  try {
    const url = `${instance}/services/data/v62.0/query?q=${encodeURIComponent(q)}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('SF Proxy rodando!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
