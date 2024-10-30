const express = require('express');
const path = require('path');
const multer = require('multer');
const { Pool } = require('pg');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuração do AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();

// Configuração da conexão com o PostgreSQL usando variáveis de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:Danilo123@localhost:5432/Ipermutei',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Configuração do multer para upload de fotos no S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'meu-bucket-ipermutei',
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now().toString()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB por arquivo
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      console.error(`Tipo de arquivo inválido: ${file.originalname}`);
      return cb(new Error('Apenas imagens (JPEG, PNG, GIF) são permitidas.'));
    }
  },
});

// Rota para cadastro de imóvel
app.post('/api/cadastro-imovel', upload.array('photos', 12), async (req, res) => {
  console.log('Dados recebidos no corpo da requisição:', req.body);
  console.log('Fotos recebidas:', req.files);
  
  const { propertyType, address, number, complement, cep, neighborhood, area, bedrooms, suites, bathrooms, parkingSpaces, price, description } = req.body;

  // Validação simples dos dados recebidos
  if (!propertyType || !address || !price) {
      console.warn('Dados inválidos recebidos:', req.body);
      return res.status(400).json({ message: 'Dados obrigatórios não informados.' });
  }

  try {
      // Extrair URLs das fotos para salvar no banco
      const photoUrls = req.files.map(file => file.location);
      console.log('URLs das fotos:', photoUrls);

      // Query para inserir o imóvel e salvar as URLs das fotos
      const query = `INSERT INTO imoveis (property_type, address, number, complement, cep, neighborhood, area, bedrooms, suites, bathrooms, parking_spaces, price, description, photos)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`;
      
      const values = [
          propertyType, address, number, complement, cep, neighborhood, area, bedrooms, suites, bathrooms, parkingSpaces, price, description,
          JSON.stringify(photoUrls) // Salvar URLs das fotos como JSON no banco de dados
      ];

      console.log('Executando query no banco de dados:', query, values); 

      const result = await pool.query(query, values);
      console.log('Resultado da query:', result);
      
      res.status(201).json({ success: true, message: 'Imóvel cadastrado com sucesso!', id: result.rows[0].id });
  } catch (error) {
      console.error('Erro ao cadastrar imóvel no banco de dados:', error);
      if (error.code === '23505') {
          return res.status(409).json({ message: 'Imóvel já cadastrado.' });
      }
      res.status(500).json({ message: 'Erro ao cadastrar imóvel.', error: error.message });
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
