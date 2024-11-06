import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../db';

const router = express.Router();

// Função para registrar o usuário
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, username } = req.body;

  // Verificar se todos os campos necessários estão preenchidos
  if (!email || !password || !username) {
    res.status(400).json({ message: 'Email, senha e username são obrigatórios.' });
    return;
  }

  try {
    // Conectar ao banco de dados
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');  // A coleção 'users' no banco 'grafica'

    // Verificar se o usuário já existe
    const userExists = await usersCollection.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'Email já registrado' });
      return;
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Inserir o novo usuário na coleção
    const result = await usersCollection.insertOne({ email, password: hashedPassword, username });

    // Gerar o JWT
    const token = jwt.sign({ userId: result.insertedId }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(201).json({ message: 'Usuário registrado com sucesso', token });
  } catch (error: unknown) { // Aqui, especificamos o tipo de `error` como `unknown`
    // Verificar se o erro é uma instância de Error
    if (error instanceof Error) {
      res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
    } else {
      res.status(500).json({ message: 'Erro desconhecido ao registrar usuário' });
    }
  }
});

// Função para login do usuário
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Conectar ao banco de dados
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');  // A coleção 'users' no banco 'grafica'

    // Verificar se o usuário existe
    const user = await usersCollection.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Usuário não encontrado' });
      return;
    }

    // Comparar a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Senha incorreta' });
      return;
    }

    // Gerar o JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login bem-sucedido', token });
  } catch (error: unknown) { // Aqui, especificamos o tipo de `error` como `unknown`
    // Verificar se o erro é uma instância de Error
    if (error instanceof Error) {
      res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
    } else {
      res.status(500).json({ message: 'Erro desconhecido ao fazer login' });
    }
  }
});

export { router as authRoutes };
