import express, { Request, Response } from 'express';
import connectToDatabase from '../db';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Conectando ao banco de dados
let db: any;
connectToDatabase()
  .then(database => db = database)
  .catch(error => console.error("Erro ao conectar ao banco de dados:", error));

// Rota para criar um pedido
router.post('/pedidos', async (req: Request, res: Response) => {
  const { nome, datacriacao, datapagamento, dataalteracao, valor, quantidade, descricao, wstatus, idmodelo, idusuario, idfuncionariobaixa } = req.body;
  
  try {
    const result = await db.collection('pedidos').insertOne({
      nome,
      datacriacao,
      datapagamento,
      dataalteracao,
      valor,
      quantidade,
      descricao,
      wstatus,
      idmodelo,
      idusuario,
      idfuncionariobaixa
    });
    res.status(201).json(result.ops[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o pedido' });
  }
});

// Rota para obter todos os pedidos
router.get('/pedidos', async (_req: Request, res: Response) => {
  try {
    const pedidos = await db.collection('pedidos').find({ wstatus: { $ne: 'X' } }).toArray();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Rota para obter um pedido específico por ID
router.get('/pedidos/:id', async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const pedido = await db.collection('pedidos').findOne({ _id: new ObjectId(id), wstatus: { $ne: 'X' } });
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o pedido' });
  }
});

// Rota para atualizar um pedido específico por ID
router.put('/pedidos/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const { nome, datapagamento, dataalteracao, valor, quantidade, descricao, wstatus, idmodelo, idusuario, idfuncionariobaixa } = req.body;

  try {
    const result = await db.collection('pedidos').findOneAndUpdate(
      { _id: new ObjectId(id), wstatus: { $ne: 'X' } },
      { $set: { nome, datapagamento, dataalteracao, valor, quantidade, descricao, wstatus, idmodelo, idusuario, idfuncionariobaixa } },
      { returnDocument: 'after' }
    );
    if (!result.value) {
      return res.status(404).json({ error: 'Pedido não encontrado ou excluído' });
    }
    res.json(result.value);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o pedido' });
  }
});

// Rota para excluir (suavemente) um pedido específico por ID
router.delete('/pedidos/:id', async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const result = await db.collection('pedidos').findOneAndUpdate(
      { _id: new ObjectId(id), wstatus: { $ne: 'X' } },
      { $set: { wstatus: 'X' } },
      { returnDocument: 'after' }
    );
    if (!result.value) {
      return res.status(404).json({ error: 'Pedido não encontrado ou já excluído' });
    }
    res.json({ message: 'Pedido excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir o pedido' });
  }
});

export default router;
