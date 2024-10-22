const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Servir arquivos estáticos da pasta 'assets'
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Servir arquivos HTML diretamente da pasta 'pages'
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Servir o index.html diretamente na rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
