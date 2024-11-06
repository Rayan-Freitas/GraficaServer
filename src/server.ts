// src/server.ts
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 58588;

// Middleware para interpretar JSON
app.use(express.json());

// Conexão com o MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/meuBanco';
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((error) => console.error('Erro ao conectar ao MongoDB:', error));

// Rota de teste
app.get('/', (req: Request, res: Response) => {
  res.send('Servidor rodando');
});

// Inicia o servidor na porta 58588
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
