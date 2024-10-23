const express = require('express');
const path = require('path');
const multer = require('multer');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const port = process.env.PORT || 4000;

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


// Configurar o pool de conexão com o Heroku Postgres
const pool = new Pool({
  user: 'postgres',         
  host: 'localhost',          
  database: 'Ipermutei',     
  password: 'Danilo123@',  
  port: 5432,                 
});
// Configurar o multer para upload de fotos
const upload = multer({ dest: 'uploads/' }); // Armazenamento local, pode ser S3 para produção

// Rota para cadastrar o imóvel

app.post('/api/cadastro-imovel', upload.array('photos', 12), async (req, res) => {
  // Log para verificar os dados recebidos no corpo da requisição
  console.log('Dados recebidos no corpo da requisição:', req.body);
  
  // Log para verificar as fotos enviadas
  console.log('Fotos recebidas:', req.files);

  const { propertyType, address, number, complement, cep, neighborhood, area, bedrooms, suites, bathrooms, parkingSpaces, price, description } = req.body;
  const photos = req.files;

  try {
    // Query para inserir os dados do imóvel no banco de dados
    const query = `INSERT INTO imoveis (property_type, address, number, complement, cep, neighborhood, area, bedrooms, suites, bathrooms, parking_spaces, price, description, photos)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`;
    
    const values = [
      propertyType, 
      address, 
      number, 
      complement, 
      cep, 
      neighborhood, 
      area, 
      bedrooms, 
      suites, 
      bathrooms, 
      parkingSpaces, 
      price, 
      description, 
      JSON.stringify(photos.map(file => file.filename)) // Salva os nomes dos arquivos das fotos
    ];

    console.log('Executando query no banco de dados:', query, values); // Log para verificar a query e os valores

    const result = await pool.query(query, values);
    console.log('Resultado da query:', result); // Log para verificar o resultado da query
    
    res.status(201).json({ message: 'Imóvel cadastrado com sucesso!', id: result.rows[0].id });
  } catch (error) {
    console.error('Erro ao cadastrar imóvel no banco de dados:', error); // Log para capturar o erro
    res.status(500).json({ message: 'Erro ao cadastrar imóvel.' });
  }
});

app.get('/api/buscar-imoveis', async (req, res) => {
  const { city, neighborhood, minArea, bedrooms, parking, minPrice, maxPrice } = req.query;

  try {
    // Query base para buscar imóveis
    let query = `SELECT * FROM imoveis WHERE 1=1`; // Base da query
    const values = [];

    // Adiciona filtros dinâmicos com base nos parâmetros fornecidos
    if (city) {
      query += ` AND LOWER(address) LIKE LOWER($${values.length + 1})`;
      values.push(`%${city}%`);
    }
    if (neighborhood) {
      query += ` AND LOWER(neighborhood) LIKE LOWER($${values.length + 1})`;
      values.push(`%${neighborhood}%`);
    }
    if (minArea) {
      query += ` AND area >= $${values.length + 1}`;
      values.push(minArea);
    }
    if (bedrooms) {
      query += ` AND bedrooms >= $${values.length + 1}`;
      values.push(bedrooms);
    }
    if (parking) {
      query += ` AND parking_spaces >= $${values.length + 1}`;
      values.push(parking);
    }
    if (minPrice && maxPrice) {
      query += ` AND price BETWEEN $${values.length + 1} AND $${values.length + 2}`;
      values.push(minPrice, maxPrice);
    }

    // Executa a consulta
    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error);
    res.status(500).json({ message: 'Erro ao buscar imóveis.' });
  }
});


