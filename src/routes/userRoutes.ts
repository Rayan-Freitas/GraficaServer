import bcrypt from 'bcryptjs';
import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../db';

const router = express.Router();

// Conectando ao banco de dados
let db: any;
connectToDatabase()
  .then(database => (db = database))
  .catch(error => console.error('Erro ao conectar ao banco de dados:', error));

// Middleware para verificar permissões
const isAuthorized = async (req: any, res: Response, next: Function) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string); // Decodifica o token JWT
    const { userId } = decoded; // 'userId' extraído do JWT

    // Busca o usuário no banco de dados para verificar permissões
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Passa o usuário no objeto da requisição para as outras rotas
    req.user = user;

    // Verifica se o usuário tem permissão de admin ou se ele está acessando seus próprios dados
    if (user.isAdmin || user._id.toString() === userId) {
      return next();
    }

    return res.status(403).json({ message: 'Acesso negado' });
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido', error });
  }
};

// Rota para obter os dados do perfil do usuário logado
router.get('/profile', isAuthorized, async (req: any, res: any) => {
  try {
    const user = req.user;
    res.json({ username: user.username, email: user.email, endereco: user.endereco ?? '' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter perfil', error });
  }
});

// Rota para atualizar os dados do usuário
router.put('/update/:id', isAuthorized, async (req: any, res: any) => {
  try {
    const { nome, email, endereco, novaSenha } = req.body;
    const updates: any = { nome, email, endereco };

    // Atualiza a senha somente se ela for fornecida
    if (novaSenha) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(novaSenha, salt);
    }

    const user = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!user.value) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Dados atualizados com sucesso', user: user.value });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar dados', error });
  }
});

// Rota para deletar o usuário
router.delete('/delete/:id', isAuthorized, async (req: any, res: any) => {
  try {
    const result = await db.collection('users').findOneAndDelete({ _id: new ObjectId(req.params.id) });

    if (!result.value) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário', error });
  }
});

// Rota para listar todos os usuários (apenas para administradores)
router.get('/list', isAuthorized, async (req: any, res: any) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  try {
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar usuários', error });
  }
});

export { router as userRoutes };
