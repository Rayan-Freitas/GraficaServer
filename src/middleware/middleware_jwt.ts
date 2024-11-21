import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware de autenticação JWT
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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