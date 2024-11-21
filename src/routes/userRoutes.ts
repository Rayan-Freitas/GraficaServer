import bcrypt from 'bcryptjs';
import express, { Request, Response } from 'express';
import { User } from '../models/User';

const router = express.Router();

// Middleware para verificar permissões
const isAuthorized = (req: Request, res: Response, next: Function) => {
  const { isAdmin, _id } = req.user;
  // Verifica se o usuário é admin ou se está acessando seus próprios dados
  if (isAdmin || req.params.id === _id.toString()) {
      return next();
  }
  return res.status(403).json({ message: 'Acesso negado' });
};

// Rota para obter os dados do perfil do usuário logado
router.get('/profile', async (req: any, res: any) => {
  try {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      res.json(user);
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
      const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
      if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      res.json({ message: 'Dados atualizados com sucesso', user });
  } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar dados', error });
  }
});
// Rota para deletar o usuário
router.delete('/delete/:id', isAuthorized, async (req: any, res: any) => {
  try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar usuário', error });
  }
});
// Rota para listar todos os usuários (apenas para administradores)
router.get('/list', async (req: any, res: any) => {
  if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acesso negado' });
  }
  try {
      const users = await User.find().select('-password');
      res.json(users);
  } catch (error) {
      res.status(500).json({ message: 'Erro ao listar usuários', error });
  }
});

export { router as userRoutes };
