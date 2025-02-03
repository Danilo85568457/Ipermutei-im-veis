const express = require('express');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const cors = require('cors'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:Danilo123@localhost:3000/Ipermutei',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});


// Rota para cadastro de imóvel
app.post('/api/cadastro-imovel', authenticateToken,upload.array('photos', 12), async (req, res) => {
  

  const { propertyType, city, number, complement, cep, neighborhood, area, bedrooms, suites, bathrooms, parkingSpaces, price, description, address } = req.body;

  // Validação simples dos dados recebidos
  if (!propertyType || !city || !price) {
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
      const query = `INSERT INTO imoveis ("propertyType", city, number, complement, cep, neighborhood, area, bedrooms, suites, bathrooms, parking_spaces, price, description, photos, address)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`;
                     console.log("Query a ser executada:", query);
      
                     const values = [
                      propertyType,        // $1 -> property_type
                      city,                // $2 -> city
                      number,              // $3 -> number
                      complement,          // $4 -> complement
                      cep,                 // $5 -> cep
                      neighborhood,        // $6 -> neighborhood
                      area,                // $7 -> area
                      bedrooms,            // $8 -> bedrooms
                      suites,              // $9 -> suites
                      bathrooms,           // $10 -> bathrooms
                      parkingSpaces,       // $11 -> parking_spaces
                      precoNumerico,       // $12 -> price
                      description,         // $13 -> description
                      JSON.stringify(photoUrls), // $14 -> photos (JSON válido)
                      address              // $15 -> address
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


const SECRET_KEY = '6d700f0280840ccd25b0ddbcf41f0a0b963e5320d703a8cd3aaff433903bb6fbee94aba54687b73968e8078d65a892104c0e48f58198216a912cb589c9073f9d';
 

app.post('/api/login', async (req, res) => {
  console.log("Login endpoint hit with data:", req.body);
  const { email, password } = req.body;
  
  // Verificar se o usuário existe
  const userQuery = 'SELECT * FROM users WHERE email = $1';
  const userResult = await pool.query(userQuery, [email]);
  console.log("Query result:", userResult.rows);

  if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  const user = userResult.rows[0];

  // Verificar a senha
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  // Gerar o token JWT
  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

  // Incluir o nome do usuário na resposta
  res.status(200).json({ 
      token, 
      name: user.name, // Retorna o nome do usuário
      message: 'Login bem-sucedido' 
  });
});





app.post('/api/register', async (req, res) => {
  const { name, email, telefone, tipoConta, password } = req.body;

  // Validação simples dos campos
  if (!name || !email || !telefone || !tipoConta || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
      // Verifica se o email já está em uso
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
          return res.status(400).json({ message: 'E-mail já cadastrado.' });
      }

      // Hash da senha para maior segurança
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insere o usuário no banco de dados
      const result = await pool.query(
          'INSERT INTO users (name, email, telefone, tipo_conta, password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [name, email, telefone, tipoConta, hashedPassword]
      );

      res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: result.rows[0].id });
  } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});



function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log('🔹 Cabeçalho Authorization recebido:', authHeader);

    if (!authHeader) {
        console.error('❌ Erro: Cabeçalho Authorization ausente.');
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1]; // Remove o "Bearer "
    
    if (!token) {
        console.error('❌ Erro: Token ausente no cabeçalho Authorization.');
        return res.status(401).json({ message: 'Token não fornecido corretamente.' });
    }

    if (!process.env.JWT_SECRET) {
        console.error('❌ Erro crítico: JWT_SECRET não está definido no .env');
        return res.status(500).json({ message: 'Erro interno no servidor. Falha na configuração do JWT_SECRET.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('❌ Erro ao verificar token:', err.message);
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }

        console.log('✅ Token verificado com sucesso. Usuário:', user);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken; // Exporta a função para uso em outros módulos



app.get('/api/get-property', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID do imóvel não informado.' });
  }

  try {
    const query = 'SELECT * FROM imoveis WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length > 0) {
      const property = result.rows[0];
      res.json({ success: true, property });
    } else {
      res.status(404).json({ message: 'Imóvel não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar o imóvel:', error);
    res.status(500).json({ message: 'Erro ao buscar o imóvel.', error: error.message });
  }
});



app.get('/api/buscar-imoveis', async (req, res) => {
  const {propertyType,city, neighborhood, minArea, maxArea, bedrooms, parking, minPrice, maxPrice } = req.query;
  
  // Log inicial dos parâmetros recebidos
  console.error("Parâmetros de busca recebidos:", {propertyType, city, neighborhood, minArea, maxArea, bedrooms, parking, minPrice, maxPrice });

  try {
    // Query base para buscar imóveis
    let query = `SELECT * FROM imoveis WHERE 1=1`; // Base da query
    const values = [];

    // Adiciona filtros dinâmicos com base nos parâmetros fornecidos
    if (propertyType) {
      query += ` AND propertytype ILIKE '%${propertyType}%'`;
      console.error(`Filtro tipo do Imovel aplicado: ${propertyType}`);
    }
    if (city) {
      query += ` AND city ILIKE '%${city}%'`;
      console.error(`Filtro de cidade aplicado: ${city}`);
    }
    if (neighborhood) {
      query += ` AND neighborhood ILIKE '%${neighborhood}%'`;
      console.error(`Filtro de bairro aplicado: ${neighborhood}`);
    }
    if (minArea) {
      query += ` AND area >= ${Number(minArea)}`;
      values.push(minArea);
      console.error(`Filtro de área mínima aplicado: ${minArea}`);
    }
    if (maxArea) {
      query += ` AND area <= ${Number(maxArea)}`;
      // values.push(maxArea);
      console.error(`Filtro de área maxima aplicado: ${maxArea}`);
    }
    if (bedrooms) {
      query += ` AND bedrooms = ${Number(bedrooms)}`;
      // values.push(bedrooms);
      console.error(`Filtro de número de quartos aplicado: ${bedrooms}`);
    }
    if (parking) {
      query += ` AND parking_spaces = ${NUmber(parking)}`;
      // values.push(parking);
      console.error(`Filtro de vagas de garagem aplicado: ${parking}`);
    }
    if (minPrice && maxPrice) {
      query += ` AND price BETWEEN ${Number(minPrice)} AND ${Number(maxPrice)}`;
      // values.push(minPrice, maxPrice);
      console.error(`Filtro de faixa de preço aplicado: minPrice=${minPrice}, maxPrice=${maxPrice}`);
    } else if (minPrice) {
      query += ` AND price >= ${Number(minPrice)}`;
      // values.push(minPrice);
      console.error(`Filtro de preço mínimo aplicado: ${minPrice}`);
    } else if (maxPrice) {
      query += ` AND price <= ${Number(maxPrice)}`;
      // values.push(maxPrice);
      console.error(`Filtro de preço máximo aplicado: ${maxPrice}`);
    }

    // Log da query final e dos valores antes da execução
    console.error("Query SQL final:", query);
    console.error("Valores para a query:", values);

    // Executa a consulta
    const result = await pool.query(query);
    
    // Log dos resultados encontrados
    console.error(`Imóveis encontrados: ${result.rows.length}`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error);
    res.status(500).json({ message: 'Erro ao buscar imóveis.' });
  }
});


app.get('/api/imoveis/detalhes', async (req, res) => {
  const { imovelId } = req.query; // Captura o ID do imóvel a ser detalhado
  const apiKey = 'c9fdd79584fb8d369a6a579af1a8f681'; // Sua chave de API
  const url = `https://sandbox-rest.vistahost.com.br/imoveis/detalhes?key=${apiKey}&imovel=${imovelId}`;

  try {
    // Requisição ao servidor remoto para obter os detalhes do imóvel
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    const details = await response.json();

    if (response.ok) {
      res.status(200).json(details);
    } else {
      res.status(response.status).json({ error: details.message || 'Erro ao buscar detalhes do imóvel' });
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes do imóvel:', error);
    res.status(500).json({ message: 'Erro interno ao buscar detalhes do imóvel.' });
  }
});

app.get('/api/imoveis-destaque', async (req, res) => {
  try {
      console.log("Iniciando busca de imóveis no banco de dados...");

      const query = `
          SELECT id, "propertyType", city, bedrooms, bathrooms, area, price, photos 
          FROM imoveis
          ORDER BY id DESC
          LIMIT 6
      `;
      const result = await pool.query(query);

      // Verifica se há resultados
      if (result.rows.length === 0) {
          console.warn("Nenhum imóvel encontrado no banco de dados.");
          return res.status(200).json([]);
      }

      console.log(`Total de imóveis encontrados: ${result.rows.length}`);

      // Formata os resultados
      const imoveis = result.rows.map(imovel => {
        let photos = [];
        try {
          if (typeof imovel.photos === 'string') {
              console.log(`Fotos como string para o imóvel ID ${imovel.id}: ${imovel.photos}`);
              if (imovel.photos.startsWith('[')) {
                  photos = JSON.parse(imovel.photos);
              } else if (imovel.photos.includes(',')) {
                  photos = imovel.photos.split(',').map(url => url.trim());
              } else {
                  photos = [imovel.photos.trim()];
              }
          } else if (Array.isArray(imovel.photos)) {
              console.log(`Fotos como array para o imóvel ID ${imovel.id}:`, imovel.photos);
              photos = imovel.photos;
          }
        
            photos = photos.filter(photo => photo.startsWith('https')); // Filtra URLs válidas
        } catch (e) {
            console.error(`Erro ao processar JSON de photos para o imóvel ID ${imovel.id}:`, e);
        }
        
          // Adiciona uma imagem padrão se nenhuma foto válida for encontrada
          if (photos.length === 0) {
              photos.push('');
          }

          return {
              id: imovel.id,
              propertyType: imovel.propertyType,
              city: imovel.city,
              bedrooms: imovel.bedrooms,
              bathrooms: imovel.bathrooms,
              area: imovel.area,
              price: imovel.price,
              photos
          };
      });

      console.log("Retornando imóveis formatados para o cliente.");
      res.status(200).json(imoveis);

  } catch (error) {
      console.error('Erro ao buscar imóveis no banco de dados:', error);
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
