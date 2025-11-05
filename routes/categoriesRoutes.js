import {Router} from 'express';
import { novaCategoria, deleteCategoria } from  '../controllers/categoriesControllers.js';
import { getConnection } from '../config/database.js';



const routerCategoria = Router();

routerCategoria.post('/cadastrar', novaCategoria);

routerCategoria.delete('/deletar', deleteCategoria);

routerCategoria.get('/tabela', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    } finally {
        if (connection) {
            await connection.end(); // ✅ Fecha a conexão
        }
    }
});


export default routerCategoria;