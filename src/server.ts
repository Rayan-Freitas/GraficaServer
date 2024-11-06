import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import connectToDatabase from './db';

const app = express();
const PORT = 58588;

// Middleware para parsing de JSON
app.use(express.json());

// Rota simples para verificar o funcionamento do servidor
app.get('/', (req: Request, res: Response) => {
  res.send('Servidor rodando');
});

// Função para iniciar o servidor e a conexão com o banco de dados
const startServer = async () => {
  try {
    await connectToDatabase(); // Conectando ao MongoDB
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
};

startServer();
