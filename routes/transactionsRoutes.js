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
// routerTransaction.get('/tabela',authMiddleware, async (req, res) => {
//     let connection;
//     try {
//         if (!req.user) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'req.user está undefined - Middleware não funcionou'
//             });
//         }

//         const user_id = req.user.userId;
//         console.log('🔍 DEBUG - user_id:', user_id);        
//         connection = await getConnection();
        
//         const [rows] = await connection.execute(
//             'SELECT id, description, valor, date, category_id, type FROM transactions WHERE user_id = ? ORDER BY date DESC', 
//             [user_id]
//         );
        
//         res.json({
//             success: true,
//             data: rows,
//             total: rows.length
//         });
        
//     } catch (error) {
//         console.error('Erro ao buscar transações:', error);
//         res.status(500).json({ 
//             success: false,
//             error: 'Erro interno do servidor' 
//         });
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// });


export default routerTransaction;

