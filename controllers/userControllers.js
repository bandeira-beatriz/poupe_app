import { realizarLogin, conferenciaUsuario, inserirUsuario, alterar_senha} from '../models/userModels.js'
import { getConnection } from '../config/database.js';


export async function validarCredencial(req, res){
    console.log('Validando usuário')
    try{
        //Pegando os dados do frontend e transformando em corpo da requisição
        const { email, password_hash } = req.body;
        console.log(`E-mail ${email} acessado`)
        
        if (!email || !password_hash){ //verifica se foram digitados
                console.log('Email e senha são obrigatórios!');
                
                return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios!'
            });
        }

        const usuario = await realizarLogin(email, password_hash); //Usuários iguais permite que seja realizado a conversa com o Models User.

        if (usuario) { //com usuários corretos válida o login, USUARIO: pode retornar o usuário ou undefined (Ver em Models)
            console.log('Login realizado com sucesso');
            
            res.json({ 
                success: true, 
                user: usuario 
            });
        } else {
            console.log('Email ou senha incorretos!');
            
            res.status(401).json({ 
                success: false,
                message: 'Email ou senha incorretos!'
 
            });
        }

    } catch (error) { //Erro ao acessar o servidor
        console.error('Erro no controller:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor!',
            error: error.message
        });
    }
}

export async function cadastrarNovoUser(req, res){
    console.log('Cadastrar novo usuário no Banco')
    
    try {
        const { name, email, password_hash } = req.body; //O usuário digita os dados
        
        if (!name || !email || !password_hash) { //Verifica caso sejam diferentes ou não digitado
        console.log('Nome, email e senha são obrigatórios!');
        
            return res.status(400).json({
                success: false,
                message: 'Nome, email e senha são obrigatórios!'
            
            });
        }
        
        const usuarioExistente = await conferenciaUsuario(email) //Conecta a informação do frontend com o banco de dados
        
        console.log('Este email já está cadastrado!');
        
        if (usuarioExistente){
            return res.status(409).json({
                success: false,
                message: 'Este email já está cadastrado!'
            });
        } //Verifica se o usuário já não existe no banco de dados
 
        
        //Cadastrar novo usuário

        const cadastrarUsuario = await inserirUsuario(name, email, password_hash) //Conecta o banco de dados

        console.log('Usuário criado com sucesso!');
        
        res.status(201).json({ //Mostra o sucesso
            success: true,
            message: 'Usuário criado com sucesso!',
            user: {
                id: cadastrarUsuario.insertId,
                name,
                email
            }
        });
        
    } catch (error) { //erro no registro
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar usuário'
        });
    }
};

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


