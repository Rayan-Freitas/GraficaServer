import express, { Request, Response } from 'express';
import connectToDatabase from '../db';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Conectando ao banco de dados
let db: any;
connectToDatabase()
    .then(database => (db = database))
    .catch(error => console.error('Erro ao conectar ao banco de dados:', error));

// Criar modelo
router.post('/modelos', async (req: any, res: any) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

    try {
        const result = await db.collection('modelos').insertOne({ nome });
        res.status(201).json({ message: 'Modelo criado com sucesso', modeloId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar o modelo' });
    }
});

// Listar todos os modelos
router.get('/modelos', async (_req: Request, res: Response) => {
    try {
        const modelos = await db.collection('modelos').find().toArray();
        res.json(modelos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar modelos' });
    }
});

// Alterar modelo
router.put('/modelos/:id', async (req: any, res: any) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

    try {
        const result = await db.collection('modelos').updateOne(
            { _id: new ObjectId(id) },
            { $set: { nome } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Modelo não encontrado' });
        }
        res.json({ message: 'Modelo atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o modelo' });
    }
});

// Excluir modelo
router.delete('/modelos/:id', async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const result = await db.collection('modelos').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Modelo não encontrado' });
        }
        res.json({ message: 'Modelo excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir o modelo' });
    }
});

export default router;
