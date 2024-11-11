const express = require('express');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const cors = require('cors'); 

const app = express();
app.use(express.json());


// Configuração do CORS
const corsOptions = {
  origin: 'https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com', 
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));  

const s3 = new S3Client({
  region: 'sa-east-1', // Apenas a região
   credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  forcePathStyle: true, 
});


const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'meu-bucket-ipermutei',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now().toString()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5 MB para o tamanho do arquivo
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


app.post('/upload', upload.single('image'), (req, res) => {
  res.status(200).send({ message: 'Upload bem-sucedido', file: req.file });
}, (error, req, res, next) => {
  console.error('Erro no upload:', error);
  res.status(400).send({ error: error.message });
});


// Configuração da conexão com o PostgreSQL usando variáveis de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:Danilo123@localhost:5432/Ipermutei',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
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

  // Garantir que o preço seja numérico
  const precoNumerico = parseFloat(price);
  if (isNaN(precoNumerico)) {
      return res.status(400).json({ message: 'Preço inválido.' });
  }

  try {
      // Extrair URLs das fotos para salvar no banco
      const photoUrls = req.files.map(file => file.location);
      console.log('URLs das fotos:', photoUrls);

      // Query para inserir o imóvel e salvar as URLs das fotos
      const query = `INSERT INTO imoveis (property_type, address, number, complement, cep, neighborhood, area, bedrooms, suites, bathrooms, parking_spaces, price, description, photos)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`;
      
      const values = [
          propertyType, address, number, complement, cep, neighborhood, area, bedrooms, suites, bathrooms, parkingSpaces, precoNumerico, description,
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
  console.error("Rota /api/buscar-imoveis acessada com sucesso");

  try {
    // Consulta simples: busca apenas os 5 primeiros registros da tabela "imoveis"
    const result = await pool.query('SELECT * FROM imoveis LIMIT 5');
    
    // Log para verificar quantos imóveis foram encontrados
    console.error(`Imóveis encontrados: ${result.rows.length}`);
    
    // Retorna os resultados encontrados
    res.status(200).json(result.rows);
  } catch (error) {
    // Log de erro para diagnóstico
    console.error('Erro ao buscar imóveis:', error);
    
    // Retorna uma mensagem de erro para o cliente
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
