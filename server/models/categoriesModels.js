import { getConnection } from '../config/database.js';

export async function verificarCategoriaExistente(description) {
    let connection;
    try {
        connection = await getConnection(); 
        const [categorias] = await connection.execute(
            'SELECT id FROM categories WHERE description = ?',
            [description]
        );
        return categorias.length > 0; // true se existe
    } catch (error) {
        console.error('Erro ao verificar categoria:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

export async function inserirCategoria(description) {
    let connection;
    try {
        connection = await getConnection();
        const [result] = await connection.execute(
            'INSERT INTO categories (description) VALUES (?)',
            [description]
        );
        console.log('Nova categoria inserida, ID:', result.insertId);
        return {
            success: true,
            insertId: result.insertId,
            message: 'Categoria criada com sucesso!'
        };
    } catch (error) {
        console.error('Erro no model ao inserir categoria:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
};

export async function deletarCategoria(description) {
    let connection;
    try {
        connection = await getConnection();
        const [result] = await connection.execute(
            'DELETE FROM categories WHERE description = (?)', 
            [description]
        );
        console.log('Excluir categoria');      
        return {
            success: true,
            affectedRows: result.affectedRows, // número de linhas deletadas
            message: 'Categoria excluída com sucesso!'
    };
    } catch (error) {
        console.error('Erro no model ao excluír categoria:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
};