import express, { Request, Response } from 'express';

const router = express.Router();

// Rota protegida
router.get('/profile', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to your profile!',
    user: req.user,
  });
});

export { router as userRoutes };
