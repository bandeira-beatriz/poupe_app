import { realizarLogin, conferenciaUsuario, inserirUsuario, alterar_senha, deletarUsuario } from '../models/userModels.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-forte-aqui';

export async function validarCredencial(req, res) {
  console.log('Validando usuário');
    console.log('📧 Email recebido:', req.body.email);
    console.log('🔑 Senha recebida:', req.body.password);


  try {

    const { email, password } = req.body;

    const usuario1 = await conferenciaUsuario(email);
    console.log('👤 Usuário encontrado:', usuario1);
    
    if (!email || !password) {
      console.log(!email);
      console.log(!password);
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios!'
      });
    }

    // Primeiro busca o usuário apenas pelo email
    const usuario = await conferenciaUsuario(email);
    
    if (!usuario) {
      console.log(!email);
      console.log(!password);
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos!'
      });
    }

    // Agora busca com a senha para verificar (seu método atual)
    const usuarioCompleto = await realizarLogin(email, password);
    
    if (usuarioCompleto) {
      // GERAR TOKEN JWT
      const token = jwt.sign(
        {
          userId: usuarioCompleto.id,
          email: usuarioCompleto.email,
          name: usuarioCompleto.name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login realizado com sucesso');
      
      res.json({
        success: true,
        user: {
          id: usuarioCompleto.id,
          name: usuarioCompleto.name,
          email: usuarioCompleto.email
        },
        token: token // ← AGORA RETORNA O TOKEN
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos!'
      });
    }

  } catch (error) {
    console.error('Erro no controller:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor!'
    });
  }
}

export async function cadastrarNovoUser(req, res) {
  console.log('Cadastrar novo usuário no Banco');
  
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios!'
      });
    }
    
    const usuarioExistente = await conferenciaUsuario(email);
    
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Este email já está cadastrado!'
      });
    }

    //CRIPTOGRAFAR SENHA ANTES DE SALVAR
    const password_hash = await hashPassword(password);

    const cadastrarUsuario = await inserirUsuario(name, email, password_hash);

    console.log('Usuário criado com sucesso!');
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!'
    });
    
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário'
    });
  }
}

export async function alterarSenha(req, res) {
    console.log('Alterando nova senha')
    try{
        const { email, novaSenha } = req.body; //O usuário digita os dados
        
        if (!email || !novaSenha) { //Verifica caso sejam diferentes ou não digitado
            console.log('Email e senha são obrigatórios!');
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios!'
                
            });
        }

        const usuarioExistente = await conferenciaUsuario(email) //Conecta a informação do frontend com o banco de dados
        

        if (!usuarioExistente){
            console.log('Este usuário não está cadastrado!');
            return res.status(404).json({
                success: false,
                message: 'Este usuário não está cadastrado!'
            });
        } //Verifica se o usuário já não existe no banco de dados

        //Cadastrar nova senha

        const resultado = await alterar_senha(email, novaSenha);
        console.log('Senha atualizada com sucesso!');
        
        res.status(200).json({
            success: true,
            message: 'Senha atualizada com sucesso!',
            affectedRows: resultado.affectedRows
        })

    } catch (error) { //erro no registro
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar senha'
        });
    }
}

export async function excluirUsuario(req, res) {
    console.log('Excluindo usuário');
    
    try {
        const user_id = req.user.userId; // Do token JWT
        const { password } = req.body; // Senha para confirmação

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Senha é obrigatória para excluir a conta!'
            });
        }

        const resultado = await deletarUsuario(user_id, password);

        if (resultado.success) {
            res.json({
                success: true,
                message: 'Usuário excluído com sucesso!'
            });
        } else {
            res.status(400).json({
                success: false,
                message: resultado.message
            });
        }

    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}


