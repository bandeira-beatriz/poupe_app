import {
  novaTransacao,
  atualizarTransacao,
  deletandoTransacao,
  listandoTransacoes,
  obterEstatisticas,
  buscarTransacaoPorId
} from '../models/transactionsModels.js';

// ======================================================================
// CADASTRAR NOVA TRANSAÇÃO
// ======================================================================
export async function validarTransacao(req, res) {
  console.log('Cadastrando transação(s)');

  try {
    const userId = req.user.userId;
    const transacoes = req.body;
    const listaTransacoes = Array.isArray(transacoes) ? transacoes : [transacoes];

    const resultados = [];
    let temErroValidacao = false;

    for (const [index, transacao] of listaTransacoes.entries()) {
      const { description, valor, date, category_id, type } = transacao;

      if (!description || !valor || !date || !category_id || !type) {
        resultados.push({ success: false, index, message: 'Todos os campos são obrigatórios!' });
        temErroValidacao = true;
        continue;
      }

      if (isNaN(valor) || Number(valor) <= 0) {
        resultados.push({ success: false, index, message: 'O valor deve ser um número positivo!' });
        temErroValidacao = true;
        continue;
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        resultados.push({ success: false, index, message: 'Formato de data inválido! Use YYYY-MM-DD' });
        temErroValidacao = true;
        continue;
      }

      try {
        const resultado = await novaTransacao(description, parseFloat(valor), date, userId, parseInt(category_id), type);
        if (resultado.success) {
          console.log('Transação criada com sucesso!');     
          resultados.push({
            success: true,
            message: 'Transação criada com sucesso!',
            transactionId: resultado.transactionId
          });
        } else {
          resultados.push({ success: false, message: resultado.message });
        }
      } catch (error) {
        resultados.push({ success: false, message: `Erro ao inserir: ${error.message}` });
      }
    }

    const sucessos = resultados.filter(r => r.success);
    const falhas = resultados.filter(r => !r.success);

    if (temErroValidacao && sucessos.length === 0) {
      return res.status(400).json({ success: false, message: 'Erro de validação nas transações', detalhes: resultados });
    }

    if (Array.isArray(transacoes)) {
      return res.json({
        success: true,
        message: `Lote processado: ${sucessos.length} sucesso(s), ${falhas.length} falha(s)`,
        detalhes: resultados
      });
    } else {
      const r = resultados[0];
      return res.status(r.success ? 201 : 400).json({
        success: r.success,
        message: r.message,
        transactionId: r.transactionId || null
      });
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// ======================================================================
// ATUALIZAR TRANSAÇÃO
// ======================================================================
export async function alterarTransacao(req, res) {
  console.log('Atualizando transação');

  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { description, valor, date, category_id, type } = req.body;

    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    if (!description || !valor || !date || !category_id || !type)
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
    if (isNaN(valor) || Number(valor) <= 0)
      return res.status(400).json({ success: false, message: 'O valor deve ser positivo!' });

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date))
      return res.status(400).json({ success: false, message: 'Formato de data inválido! Use YYYY-MM-DD' });

    const resultado = await atualizarTransacao(
      parseInt(id),
      description,
      parseFloat(valor),
      date,
      userId,
      parseInt(category_id),
      type
    );

    if (resultado.success && resultado.affectedRows > 0) {
          console.log('Transação atualizada com sucesso!');     
      res.json({ success: true, message: 'Transação atualizada com sucesso!' });
    } else {
          console.log('Transação não encontrada ou não pertence ao usuário.');   
      res.status(404).json({ success: false, message: 'Transação não encontrada ou não pertence ao usuário.' });
    }
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// ======================================================================
// DELETAR TRANSAÇÃO
// ======================================================================
export async function deletarTransacao(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const resultado = await deletandoTransacao(parseInt(id), userId);

    if (resultado.success && resultado.affectedRows > 0) {
      res.json({ success: true, message: 'Transação excluída com sucesso!' });
    } else {
      res.status(404).json({ success: false, message: 'Transação não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// ======================================================================
// LISTAR TRANSAÇÕES COM FILTROS E PAGINAÇÃO
// ======================================================================
export async function listarTransacoes(req, res) {
  try {
    const userId = req.user.userId;
    const { categoria_id, tipo, data_inicio, data_fim, page = 1, limit = 10 } = req.query;

    const filtros = {
      categoria_id: categoria_id || null,
      tipo: tipo || null,
      data_inicio: data_inicio || null,
      data_fim: data_fim || null,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const transacoes = await listandoTransacoes(userId, filtros);
    const total = transacoes.length; // ou COUNT no model depois

    res.json({
      success: true,
      data: transacoes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// ======================================================================
// BUSCAR TRANSAÇÃO POR ID
// ======================================================================
export async function buscarTransacao(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const transacao = await buscarTransacaoPorId(parseInt(id), userId);
    if (!transacao) return res.status(404).json({ success: false, message: 'Transação não encontrada' });

    res.json({ success: true, data: transacao });
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// ======================================================================
// ESTATÍSTICAS
// ======================================================================
export async function obterEstatisticasporID(req, res) {
  try {
    const userId = req.user.userId;
    const { mes, ano } = req.query;

    const agora = new Date();
    const mesAtual = mes || agora.getMonth() + 1;
    const anoAtual = ano || agora.getFullYear();

    const estatisticas = await obterEstatisticas(userId, mesAtual, anoAtual);

    res.json({
      success: true,
      data: estatisticas,
      periodo: { mes: mesAtual, ano: anoAtual }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

