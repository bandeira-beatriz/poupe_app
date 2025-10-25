import {Router} from 'express';
import { cadastrarNovoUser, validarCredencial, alterarSenha } from '../controllers/userControllers.js';


const router = Router();

router.post('/registrar', cadastrarNovoUser);

router.post('/login', validarCredencial);

router.put('/alterar-senha', alterarSenha);

export default router;


