import { getConnection } from '../config/database.js'
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';


export async function realizarLogin(email, password) {
  let connection;
  try {
    connection = await getConnection();
    
    // Primeiro busca o usuário
    const [users] = await connection.execute(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?", 
      [email]
    );
    
    if (users.length === 0) {
        console.log('Nenhum usuário encontrado com este email');
      return null;
    }

    const user = users[0];
        
    console.log('👤 Dados do usuário:', {
            id: user.id,
            email: user.email,
            password_hash: user.password_hash
        });
    console.log('🔐 Comparando senha...');
    console.log('📨 Senha fornecida:', password);
    console.log('🗄️ Hash no banco:', user.password_hash);

    //COMPARAR SENHA COM HASH
    const isPasswordValid = await comparePassword(password, user.password_hash);


    
    if (!isPasswordValid) {
      return null;
    }

    // Retorna usuário sem a senha
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
     
  } catch (error) {
    console.error('Erro no model:', error);
    throw error;
  } finally { 
    if (connection) {
      await connection.end();
    }
  }
}

export async function conferenciaUsuario(email) {
    let connection;
    try{
        connection = await getConnection();
        const [users] = await connection.execute(
            "SELECT id, name, email FROM users WHERE email = ?", 
            [email]
        );
        return users[0];
    } catch (error){
        console.error('Erro no model:', error);
        throw error;
    } finally { 
        if (connection) {
            await connection.end();
        }
    }
}


export async function inserirUsuario(name, email, password_hash) {
    let connection;
    try{
        connection = await getConnection();
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, password_hash]
        ); //Insere os dados digitados no Banco de dados

        console.log('alterar_senha - Resultado do update:', result);
        return {
            success: true,
            affectedRows: result.affectedRows,
            message: result.affectedRows > 0 ? 'Usuário inserido com sucesso' : 'Nenhum usuário atualizado'
        };

    } catch (error) { //caso erro na conexão
        console.error('Erro no model:', error);
        throw error;
    } finally { 
        if (connection) {
            await connection.end(); //Desconecta do banco
        }
    }
};

export async function alterar_senha(email, novaSenha) {
    let connection;
    try{
        connection = await getConnection();
        // CRIPTOGRAFAR a nova senha antes de salvar
        const novaSenhaHash = await hashPassword(novaSenha);
        
        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [novaSenhaHash, email] // ← Salvar o HASH, não o texto puro
        );

        return {
            success: true,
            affectedRows: result.affectedRows,
            message: 'Senha alterada com sucesso!'
        };
    } catch (error) {
        console.error('Erro no model:', error);
        throw error;
    } finally { 
        if (connection) {
            await connection.end();
        }
    }
};

export async function deletarUsuario(userId, password) {
    let connection;
    try {
        connection = await getConnection();
        
        // Primeiro verifica se a senha está correta
        const [users] = await connection.execute(
            'SELECT id, password_hash FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return {
                success: false,
                message: 'Usuário não encontrado'
            };
        }
        
        const user = users[0];
        const isPasswordValid = await comparePassword(password, user.password_hash);
        
        if (!isPasswordValid) {
            return {
                success: false,
                message: 'Senha incorreta'
            };
        }
        
        // Se senha correta, deleta o usuário
        const [result] = await connection.execute(
            'DELETE FROM users WHERE id = ?', 
            [userId]
        );
        
        return {
            success: true,
            affectedRows: result.affectedRows,
            message: 'Usuário excluído com sucesso!'
        };
    } catch (error) {
        console.error('Erro no model ao excluir usuário:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}