import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Mock de banco de dados de usuários
let users: { [key: string]: any } = {};

// Função para gerar o token JWT
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

// Rota de registro
router.post('/register', async (req: any, res: any) => {
  const { username, password } = req.body;
  
  // Verifica se o usuário já existe
  if (users[username]) {
    return res.status(400).send('User already exists');
  }

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Adiciona o novo usuário no "banco de dados"
  users[username] = { username, password: hashedPassword };
  
  // Retorna uma mensagem de sucesso
  res.status(201).send('User registered');
});

// Rota de login
router.post('/login', async (req: any, res: any) => {
  const { username, password } = req.body;

  const user = users[username];
  if (!user) {
    return res.status(400).send('Invalid credentials');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).send('Invalid credentials');
  }

  // Gera o token JWT
  const token = generateToken(user.username);
  res.json({ token });
});

export { router as authRoutes };
