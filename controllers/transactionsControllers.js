import {novaTransacao, 
        atualizarTransacao, 
        deletandoTransacao, 
        listandoTransacoes, 
        obterEstatisticas, 
        buscarTransacaoPorId} from '../models/transactionsModels.js';

export async function validarTransacao(req, res) {
  console.log('Cadastrando transação(s)');
  
  try {
    const userId = req.user.userId;
    const transacoes = req.body;

    //Verificar se é array ou objeto único
    const isArray = Array.isArray(transacoes);
    const listaTransacoes = isArray ? transacoes : [transacoes];

    console.log(`Processando ${listaTransacoes.length} transação(ões)`);

    const resultados = [];
    let temErroValidacao = false;

    //Validar CADA transação
    for (const [index, transacao] of listaTransacoes.entries()) {
      const { description, valor, date, category_id, type } = transacao;

    // Validação de campos obrigatórios
      if (!description || !valor || !date || !category_id || !type) {
        resultados.push({
          success: false,
          index: index,
          message: 'Todos os campos são obrigatórios!',
          data: transacao
        });
        temErroValidacao = true;
        continue;
      }

      if (isNaN(valor) || Number(valor) <= 0) {
        resultados.push({
          success: false,
          index: index,
          message: 'O valor deve ser um número positivo!',
          data: transacao
        });
        temErroValidacao = true;
        continue;
      }

      // Validação da data
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        resultados.push({
          success: false,
          index: index,
          message: 'Formato de data inválido! Use YYYY-MM-DD',
          data: transacao
        });
        temErroValidacao = true;
        continue;
      }

      //Se passou na validação, inserir no banco
      try {
        const resultado = await novaTransacao(
          description,
          parseFloat(valor),
          date,
          userId,
          parseInt(category_id),
          type
        );

        if (resultado.success) {
          console.log(`Transação ${index + 1} criada com ID:`, resultado.transactionId);
          resultados.push({
            success: true,
            index: index,
            message: 'Transação criada com sucesso!',
            transactionId: resultado.transactionId,
            data: {
              id: resultado.transactionId,
              description,
              valor: parseFloat(valor),
              date,
              userId,
              category_id: parseInt(category_id),
              type
            }
          });
        } else {
          resultados.push({
            success: false,
            index: index,
            message: resultado.message,
            data: transacao
          });
        }
      } catch (error) {
        resultados.push({
          success: false,
          index: index,
          message: `Erro ao inserir: ${error.message}`,
          data: transacao
        });
      }
    }

    //Preparar resposta final
    const sucessos = resultados.filter(r => r.success);
    const falhas = resultados.filter(r => !r.success);

    if (temErroValidacao && sucessos.length === 0) {
      // Se só tem erros de validação
      return res.status(400).json({
        success: false,
        message: 'Erro de validação nas transações',
        detalhes: resultados
      });
    }

    if (isArray) {
      // Resposta para ARRAY
      res.json({
        success: true,
        message: `Lote processado: ${sucessos.length} sucesso(s), ${falhas.length} falha(s)`,
        total: listaTransacoes.length,
        sucessos: sucessos.length,
        falhas: falhas.length,
        detalhes: resultados
      });
    } else {
      // Resposta para OBJETO ÚNICO
      const resultadoUnico = resultados[0];
      if (resultadoUnico.success) {
        res.status(201).json({
          success: true,
          message: 'Transação criada com sucesso!',
          transactionId: resultadoUnico.transactionId,
          data: resultadoUnico.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: resultadoUnico.message
        });
      }
    }

  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function alterarTransacao(req, res) {
  console.log('Cadastrando nova transação');
      try {

        const {description, valor, date, category_id, type} = req.body;
        const userId = req.user.userId;
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID da transação é obrigatório!'
        });
        }
        if (!description || !valor || !date || !category_id || !type) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios!'
        });
        }
        if (isNaN(valor) || Number(valor) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'O valor deve ser um número positivo!'
        });
        }

        // Validação da data (formato YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de data inválido! Use YYYY-MM-DD'
        });
        }
        console.log('Dados validados:', {description, valor, date, userId, category_id, type});

        const resultado = await atualizarTransacao(parseInt(id), description, parseFloat(valor), date, userId, parseInt(category_id), type);
        
        if (resultado.success) {
            if (resultado.affectedRows > 0) {
                console.log('Transação atualizada com sucesso. ID:', id);
        
        res.status(200).json({
            success: true,
            message: 'Transação atualziada com sucesso!',
            affectedRows: resultado.affectedRows,
            data: {
            id: parseInt(id),
            description,
            valor: parseFloat(valor),
            date,
            userId,
            category_id: parseInt(category_id),
            type
            }
        });
        } else {
        // Se o model retornou erro (tipo inválido, etc)
        res.status(400).json({
            success: false,
            message: resultado.message
        });
        }}; 
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar transação'
    });
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function deletarTransacao(req, res) {
  console.log('Deletando transação');
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        //Validação de todas as informações digitadas
        if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID da transação é obrigatório!'
        });
        }
        console.log('Deletando transação ID:', id, 'do usuário:', userId);

        const resultado = await deletandoTransacao(parseInt(id), userId)
        
         if (resultado.success) {
            if (resultado.affectedRows > 0) {
            console.log('Transação excluída com sucesso. ID:', id);
    
            res.status(200).json({
                success: true,
                message: 'Transação excluída com sucesso!',
                affectedRows: resultado.affectedRows
        });
      } else {
            console.log('Transação não encontrada. ID:', id);
            
            res.status(404).json({
            success: false,
            message: 'Transação não encontrada ou você não tem permissão para excluí-la'
            });
        }
        } else {
            res.status(400).json({
                success: false,
                message: resultado.message
            });
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar transação'
        });
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function listarTransacoes(req, res) {
    try {
        const userId = req.user.userId;
        console.log('User ID:', userId);
        
        const { 
            categoria_id, 
            tipo, 
            data_inicio, 
            data_fim, 
            page = 1, 
            limit = 10 
        } = req.query;

        console.log('Query params:', { categoria_id, tipo, data_inicio, data_fim, page, limit });

        //Garantir que page e limit são números
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        const filtros = {
            categoria_id: categoria_id || null,
            tipo: tipo || null,
            data_inicio: data_inicio || null,
            data_fim: data_fim || null,
            limit: limitNum,
            offset: offset
        };

        console.log('Filtros processados:', filtros);

        //CHAMAR A FUNÇÃO DO MODEL
        const transacoes = await listandoTransacoes(userId, filtros);

        // Contar total sem paginação
        const filtrosContagem = { 
            categoria_id: filtros.categoria_id,
            tipo: filtros.tipo,
            data_inicio: filtros.data_inicio,
            data_fim: filtros.data_fim
        };
        
        const todasTransacoes = await listandoTransacoes(userId, filtrosContagem);
        const total = todasTransacoes.length;
        const totalPages = Math.ceil(total / limitNum);

        console.log('Transações encontradas:', transacoes.length);

        res.json({
            success: true,
            data: transacoes,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error('💥 Erro ao listar transações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export async function buscarTransacao(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID da transação é obrigatório!'
            });
        }

        const transacao = await buscarTransacaoPorId(parseInt(id), userId);

        if (!transacao) {
            return res.status(404).json({
                success: false,
                message: 'Transação não encontrada'
            });
        }

        res.json({
            success: true,
            data: transacao
        });

    } catch (error) {
        console.error('Erro ao buscar transação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function obterEstatisticasporID(req, res) {
    try {
        const userId = req.user.userId;
        const { mes, ano } = req.query;

        // Usar mês/ano atual se não especificado
        const dataAtual = new Date();
        const mesAtual = mes || dataAtual.getMonth() + 1;
        const anoAtual = ano || dataAtual.getFullYear();

        const estatisticas = await obterEstatisticas(userId, mesAtual, anoAtual);

        res.json({
            success: true,
            data: estatisticas,
            periodo: {
                mes: mesAtual,
                ano: anoAtual
            }
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}
