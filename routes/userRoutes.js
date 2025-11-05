// routes/userRoutes.js
import { Router } from 'express';
import { cadastrarNovoUser, validarCredencial, alterarSenha, excluirUsuario } from '../controllers/userControllers.js';
import { getConnection } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js'; // ← IMPORTAR MIDDLEWARE

const routerUser = Router();

// Rotas públicas
routerUser.post('/registrar', cadastrarNovoUser);
routerUser.post('/login', validarCredencial);

//Rotas protegidas (precisam de token)
routerUser.put('/alterar-senha', authMiddleware, alterarSenha);
routerUser.delete('/excluir', authMiddleware, excluirUsuario )
routerUser.get('/tabela', authMiddleware, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT id, name, email FROM users'); // Não retorna senhas!
    res.json(rows); 
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  } finally {
    if (connection) await connection.end(); 
  }
});

// Nova rota protegida para pegar perfil do usuário logado
routerUser.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user // Dados do token JWT
  });
});

export default routerUser;