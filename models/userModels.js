import { getConnection } from '../config/database.js'

export async function realizarLogin(email, password_hash){    
    let connection;
    try{
        connection = await getConnection(); //Conecta o banco de dados
        const [users] = await connection.execute(
            "SELECT id, name, email FROM users WHERE email = ? AND password_hash = ?", 
            [email, password_hash] //confere se os dados são os mesmos no banco de dados
        );
        return users[0];   // Retorna o usuário ou undefined
         
    } catch (error) { //caso erro na conexão
        console.error('Erro no model:', error);
        throw error;
    } finally { 
        if (connection) {
            await connection.end(); //Desconecta do banco
        }
    }
}

export async function conferenciaUsuario(email) {
    let connection;
    try{
        connection = await getConnection();
        const [users] = await connection.execute(
            "SELECT id, name, email FROM users WHERE email = ?", 
            [email] //Conecta a informação do frontend com o banco de dados
        );
        return users[0];   // Retorna o usuário ou undefined
    } catch (error){
        console.error('Erro no model:', error);
        throw error;
    } finally { 
        if (connection) {
            await connection.end(); //Desconecta do banco
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
            message: result.affectedRows > 0 ? 'Senha alterada com sucesso!' : 'Nenhum usuário atualizado'
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
        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [novaSenha, email]
        ); //Insere os dados digitados no Banco de dados

        return {
            success: true,
            affectedRows: result.affectedRows,
            message: 'Senha alterada com sucesso!'
        };
    } catch (error) { //caso erro na conexão
        console.error('Erro no model:', error);
        throw error;
    } finally { 
        if (connection) {
            await connection.end(); //Desconecta do banco
        }
    };
    
}