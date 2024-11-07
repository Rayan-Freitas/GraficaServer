import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import cors from 'cors';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());  // Para interpretar JSON no corpo da requisição

// Middleware de autenticação JWT
const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(403).send('Access Denied');
    return;  // Impede que o código continue após a resposta
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);  // Verifica o token JWT
    req.user = user;  // Adiciona a propriedade 'user' ao objeto 'req'
    next();  // Passa o controle para o próximo middleware ou rota
  } catch (err) {
    res.status(403).send('Invalid Token');
  }
};

// Rotas de Teste
app.get('/', (req: Request, res: Response) => {
    res.send('Servidor rodando');
  });

// Rotas públicas de autenticação
app.use('/auth', authRoutes);

// Rotas protegidas com JWT
app.use('/user', authenticateJWT, userRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
