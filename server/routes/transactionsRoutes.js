import { validarTransacao, alterarTransacao, deletarTransacao, listarTransacoes, buscarTransacao, obterEstatisticasporID } from '../controllers/transactionsControllers.js';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getConnection } from '../config/database.js';

const routerTransaction = Router()

routerTransaction.put('/:id', authMiddleware, alterarTransacao);
routerTransaction.post('/inserir', authMiddleware, validarTransacao)
routerTransaction.delete('/:id', authMiddleware, deletarTransacao);
routerTransaction.get('/filtros', authMiddleware, listarTransacoes);           // Listar com filtros
routerTransaction.get('/estatisticas', authMiddleware, obterEstatisticasporID);    // Estatísticas
routerTransaction.get('/:id', authMiddleware, buscarTransacao);           

export default routerTransaction;

