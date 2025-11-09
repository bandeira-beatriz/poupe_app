import { getConnection } from '../config/database.js';


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function novaTransacao(description, valor, date, userId, category_id, type) {
    let connection
    try {
        connection = await getConnection();
        // VALIDAR se o type é um dos valores permitidos
        const tiposPermitidos = ['Receita', 'Despesa', 'Transferência', 'Investimento', 'Empréstimo'];

        if (!tiposPermitidos.includes(type)) {
            return {
                success: false,
                message: `Tipo inválido. Use: ${tiposPermitidos.join(', ')}`
            };
        }

        const [result] = await connection.execute(
      "INSERT INTO transactions (description, valor, date, user_id, category_id, type) VALUES (?, ?, ?, ?, ?, ?)", 
      [description, valor, date, userId, category_id, type]
    );
    console.log('Inserir nova transação', result);
        return {
            success: true,
            affectedRows: result.affectedRows,
            message: result.affectedRows > 0 ? 'Nova transação criada com sucesso' : 'Nenhuma transação criada',
            transactionId: result.insertId
        };

    } catch (error) { //caso erro na conexão
        console.error('Erro no model:', error);
        if (error.code === 'ER_DATA_TOO_LONG' || error.message.includes('enum')) {
            return {
                success: false,
                message: 'Tipo de transação inválido. Use: Receita, Despesa, Transferência, Investimento ou Empréstimo'
            };
        }
        
        throw error;
    } finally { 
        if (connection) {
            await connection.end();
        }
    }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function atualizarTransacao(transactionId, description, valor, date, userId, category_id, type) {
    let connection
    try {
        connection = await getConnection();
        // VALIDAR se o type é um dos valores permitidos
        const tiposPermitidos = ['Receita', 'Despesa', 'Transferência', 'Investimento', 'Empréstimo'];

        if (!tiposPermitidos.includes(type)) {
            return {
                success: false,
                message: `Tipo inválido. Use: ${tiposPermitidos.join(', ')}`
            };
        }

        const [result] = await connection.execute(
            `UPDATE transactions 
             SET description = ?, valor = ?, date = ?, category_id = ?, type = ? 
             WHERE id = ? AND user_id = ?`, 
            [description, valor, date, category_id, type, transactionId, userId]
        );

        console.log('Atualizar transação - Resultado:', result);
        return {
            success: true,
            affectedRows: result.affectedRows,
            message: result.affectedRows > 0 
                ? 'Transação atualizada com sucesso' 
                : 'Nenhuma transação encontrada ou você não tem permissão para editá-la'
        };

    } catch (error) {
        console.error('Erro no model ao atualizar transação:', error);
        
        if (error.code === 'ER_DATA_TOO_LONG' || error.message.includes('enum')) {
            return {
                success: false,
                message: 'Tipo de transação inválido. Use: Receita, Despesa, Transferência, Investimento ou Empréstimo'
            };
        }
        
        throw error;
    } finally { 
        if (connection) {
            await connection.end();
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function deletandoTransacao(transactionId, userId) {
    let connection
    try {
        connection = await getConnection();

        const [result] = await connection.execute(
            'DELETE FROM transactions WHERE id = ? AND user_id = ?', 
            [transactionId, userId]
        );

        return {
            success: true,
            affectedRows: result.affectedRows,
            message: result.affectedRows > 0 
                ? 'Transação excluída com sucesso!' 
                : 'Transação não encontrada ou você não tem permissão para excluí-la'
        };

    } catch (error) {
        console.error('Erro no model ao excluir transação:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export async function listandoTransacoes(userId, filtros = {}) {
    let connection;
    try {
        connection = await getConnection();
        
        let query = `
            SELECT t.id, t.description, t.valor, t.date, t.user_id, t.category_id, t.type, t.created_at,
                   c.description as category_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ?
        `;

        let params = [Number(userId)];

        console.log('Filtros recebidos no model:', filtros);
        console.log('userId recebido:', userId);

        // Filtros
        if (filtros.category_id) {
        query += ' AND t.category_id = ?';
        params.push(Number(filtros.category_id));
        }
        if (filtros.tipo) {
            query += ' AND t.type = ?';
            params.push(filtros.tipo);
        }

        if (filtros.data_inicio && filtros.data_fim) {
            query += ' AND t.date BETWEEN ? AND ?';
            params.push(filtros.data_inicio, filtros.data_fim);
        }

        // Ordenação
        query += ' ORDER BY t.date DESC, t.id DESC';

        console.log('Query final:', query);
        console.log('Parâmetros:', params);

        const [rows] = await connection.execute(query, params);
        return rows;

    } catch (error) {
        console.error('Erro no model ao listar transações:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function obterEstatisticas(userId, mes, ano) {
    let connection;
    try {
        connection = await getConnection();
        
        let query = `SELECT type, COALESCE(SUM(valor), 0) as total FROM transactions WHERE user_id = ?`;

        let params = [userId]
        if(mes && ano){
            query += ` AND MONTH(date) = ? AND YEAR(date) = ?`;
            params.push(mes, ano);
        }

        query += ` GROUP BY type`;

        //consulta para todos os tipos
        const [resultados] = await connection.execute(query, params);

        //Inicializar totais
        const estatisticas = {
            receitas: 0,
            despesas: 0,
            transferencias: 0,
            investimentos: 0,
            emprestimos: 0,
            saldo: 0
        };

        //Preencher totais por tipo
        resultados.forEach(item => {
            switch(item.type) {
                case 'Receita':
                    estatisticas.receitas = parseFloat(item.total);
                    break;
                case 'Despesa':
                    estatisticas.despesas = parseFloat(item.total);
                    break;
                case 'Transferência':
                    estatisticas.transferencias = parseFloat(item.total);
                    break;
                case 'Investimento':
                    estatisticas.investimentos = parseFloat(item.total);
                    break;
                case 'Empréstimo':
                    estatisticas.emprestimos = parseFloat(item.total);
                    break;
            }
        });

        //Calcular saldo
        estatisticas.saldo = estatisticas.receitas + 
                           estatisticas.emprestimos - 
                           estatisticas.despesas - 
                           estatisticas.investimentos - 
                           estatisticas.transferencias;

        return estatisticas;

    } catch (error) {
        console.error('Erro no model ao obter estatísticas:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function buscarTransacaoPorId(transactionId, userId) {
    let connection;
    try {
        connection = await getConnection();
        
        const [transacoes] = await connection.execute(
            `SELECT t.id, t.description, t.valor, t.date, t.user_id, t.category_id, t.type, t.created_at,
                    c.description as category_name
             FROM transactions t
             LEFT JOIN categories c ON t.category_id = c.id
             WHERE t.id = ? AND t.user_id = ?`,
            [transactionId, userId]
        );
        
        return transacoes[0]; // Retorna a transação ou undefined

    } catch (error) {
        console.error('Erro no model ao buscar transação:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}