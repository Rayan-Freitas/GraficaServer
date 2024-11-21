import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../db';

const router = express.Router();

// Função para registrar o usuário
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    res.status(400).json({ message: 'Email, senha e username são obrigatórios.' });
    return;
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const userExists = await usersCollection.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'Email já registrado' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      username,
      isAdmin: false, // Novo campo: usuário começa sem privilégios de administrador
      endereco: '',   // Novo campo: endereço vazio ao registrar
    });

    const userPayload = {
      userId: result.insertedId,
      username,
      email,
    };

    const token = jwt.sign(userPayload, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(201).json({ message: 'Usuário registrado com sucesso', token });
  } catch (error: unknown) {
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
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Usuário não encontrado' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Senha incorreta' });
      return;
    }

    const userPayload = {
      userId: user._id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(userPayload, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login bem-sucedido', token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
    } else {
      res.status(500).json({ message: 'Erro desconhecido ao fazer login' });
    }
  }
});

export { router as authRoutes };
