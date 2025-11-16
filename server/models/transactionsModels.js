import { getConnection } from '../config/database.js';

const TIPOS_PERMITIDOS = ['Receita', 'Despesa', 'Transferência', 'Investimento', 'Empréstimo'];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function novaTransacao(description, valor, date, userId, category_id, type) {
    let connection;
    try {
        connection = await getConnection();

        if (!TIPOS_PERMITIDOS.includes(type)) {
            return { success: false, message: `Tipo inválido. Use: ${TIPOS_PERMITIDOS.join(', ')}` };
        }

        const [result] = await connection.execute(
            "INSERT INTO transactions (description, valor, date, user_id, category_id, type) VALUES (?, ?, ?, ?, ?, ?)",
            [description, valor, date, userId, category_id, type]
        );

        return {
            success: true,
            affectedRows: result.affectedRows,
            message: result.affectedRows > 0 ? 'Nova transação criada com sucesso' : 'Nenhuma transação criada',
            transactionId: result.insertId
        };
    } catch (error) {
        console.error('Erro no model (novaTransacao):', error);
        if (error.code === 'ER_DATA_TOO_LONG' || error.message.includes('enum')) {
            return { success: false, message: `Tipo de transação inválido. Use: ${TIPOS_PERMITIDOS.join(', ')}` };
        }
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function atualizarTransacao(transactionId, description, valor, date, userId, category_id, type) {
    let connection;
    try {
        connection = await getConnection();

        if (!TIPOS_PERMITIDOS.includes(type)) {
            return { success: false, message: `Tipo inválido. Use: ${TIPOS_PERMITIDOS.join(', ')}` };
        }

        const [result] = await connection.execute(
            `UPDATE transactions 
             SET description = ?, valor = ?, date = ?, category_id = ?, type = ?
             WHERE id = ? AND user_id = ?`,
            [description, valor, date, category_id, type, transactionId, userId]
        );

        return {
            success: true,
            affectedRows: result.affectedRows,
            message: result.affectedRows > 0
                ? 'Transação atualizada com sucesso'
                : 'Nenhuma transação encontrada ou sem permissão para editar'
        };
    } catch (error) {
        console.error('Erro no model (atualizarTransacao):', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function deletandoTransacao(transactionId, userId) {
    let connection;
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
                : 'Transação não encontrada ou sem permissão para excluir'
        };
    } catch (error) {
        console.error('Erro no model (deletandoTransacao):', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function listandoTransacoes(userId, filtros = {}) {
    let connection;
    try {
        connection = await getConnection();

        let query = `
            SELECT t.id, t.description, t.valor, t.date, t.user_id, t.category_id, t.type, t.created_at,
                   c.description AS category_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ?
        `;

        const params = [Number(userId)];

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

        query += ' ORDER BY t.date DESC, t.id DESC';

        const [rows] = await connection.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Erro no model (listandoTransacoes):', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function obterEstatisticas(userId, mes, ano) {
    let connection;
    try {
        connection = await getConnection();

        let query = `SELECT type, COALESCE(SUM(valor), 0) AS total FROM transactions WHERE user_id = ?`;
        const params = [userId];

        if (mes && ano) {
            query += ` AND MONTH(date) = ? AND YEAR(date) = ?`;
            params.push(mes);
            params.push(ano);
        }

        query += ` GROUP BY type`;

        const [resultados] = await connection.execute(query, params);

        const estatisticas = {
            receitas: 0,
            despesas: 0,
            transferencias: 0,
            investimentos: 0,
            emprestimos: 0,
            saldo: 0
        };

        resultados.forEach(item => {
            const total = parseFloat(item.total);
            switch (item.type) {
                case 'Receita': estatisticas.receitas = total; break;
                case 'Despesa': estatisticas.despesas = total; break;
                case 'Transferência': estatisticas.transferencias = total; break;
                case 'Investimento': estatisticas.investimentos = total; break;
                case 'Empréstimo': estatisticas.emprestimos = total; break;
            }
        });

        estatisticas.saldo = estatisticas.receitas + estatisticas.emprestimos
                           - estatisticas.despesas - estatisticas.investimentos
                           - estatisticas.transferencias;

        return estatisticas;
    } catch (error) {
        console.error('Erro no model (obterEstatisticas):', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function buscarTransacaoPorId(transactionId, userId) {
    let connection;
    try {
        connection = await getConnection();

        const [rows] = await connection.execute(
            `SELECT t.id, t.description, t.valor, t.date, t.user_id, t.category_id, t.type, t.created_at,
                    c.description AS category_name
             FROM transactions t
             LEFT JOIN categories c ON t.category_id = c.id
             WHERE t.id = ? AND t.user_id = ?`,
            [transactionId, userId]
        );

        return rows[0] || null;
    } catch (error) {
        console.error('Erro no model (buscarTransacaoPorId):', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}
