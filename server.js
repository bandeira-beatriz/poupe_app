import express from 'express';
import { getConnection } from './config/database.js';
import userRoutes from './routes/userRoutes.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs')

//Testando o sistema
app.get('/', (req, res) => {
    res.send('Bem vindo ao sistema!');
});

app.use('/api/user', userRoutes);

// //Testando o DB
app.get('/categories', async (req, res) => {
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

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse: http://localhost:${port}`)
});


