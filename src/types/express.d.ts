declare namespace Express {
    export interface Request {
      user?: any;  // Ou você pode definir um tipo específico, como { userId: string }
    }
  }
  