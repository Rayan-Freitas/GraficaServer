// routes/authRoutes.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../db';
import express from 'express';

const router = express.Router();

// Função para registrar o usuário
router.post('/register', async (req: any, res: any) => {
  const { email, password, name } = req.body;

  try {
    // Conectar ao banco de dados
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');  // A coleção 'users' no banco 'grafica'

    // Verificar se o usuário já existe
    const userExists = await usersCollection.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email já registrado' });
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Inserir o novo usuário na coleção
    const result = await usersCollection.insertOne({ email, password: hashedPassword, name });

    // Gerar o JWT
    const token = jwt.sign({ userId: result.insertedId }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return res.status(201).json({ message: 'Usuário registrado com sucesso', token });
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

// Função para login do usuário
router.post('/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    // Conectar ao banco de dados
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');  // A coleção 'users' no banco 'grafica'

    // Verificar se o usuário existe
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    // Comparar a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    // Gerar o JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login bem-sucedido', token });
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

export { router as authRoutes };
