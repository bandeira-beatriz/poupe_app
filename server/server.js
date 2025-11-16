import 'dotenv/config';
import express from 'express';
import { getConnection } from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import routerCategoria from './routes/categoriesRoutes.js';
import routerTransaction from './routes/transactionsRoutes.js'
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs')

//Testando o sistema
app.get('/', (req, res) => {
    res.send('Bem vindo ao sistema!');
});

//Rotas do usuário, categoria e transações
app.use('/api/user', userRoutes);
app.use('/api/categories', routerCategoria);
app.use('/api/transactions', routerTransaction);


const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse: http://localhost:${port}`)
});


