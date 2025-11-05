import { inserirCategoria, verificarCategoriaExistente, deletarCategoria } from '../models/categoriesModels.js';

export async function novaCategoria(req, res) {
    console.log('Cadastrar nova categoria no banco...');
    
    try {
        console.log('Body recebido:', req.body);
        const { description } = req.body; // <- nome mais intuitivo
        console.log('Descrição recebida:', description);
        
        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Digite uma nova categoria!'
            });
        }

        console.log('Verificando se categoria já existe...');
        const categoriaExistente = await verificarCategoriaExistente(description);
        
        if (categoriaExistente) {
            console.log('Categoria já cadastrada!');
            return res.status(409).json({
                success: false,
                message: 'Categoria já cadastrada!'
            });
        }

        const nova = await inserirCategoria(description);
        console.log('Categoria criada com sucesso! ID:', nova.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Categoria criada com sucesso!',
            categoria: {
                id: nova.insertId,
                description
            }
        });
        
    } catch (error) {
        console.error('Erro ao criar nova categoria:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar nova categoria.'
        });
    }
}

export async function deleteCategoria(req, res) {
    console.log('Deletar categoria do Banco de dados');
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Digite uma categoria!'
            });
        }

        console.log('Verificando se categoria existe...');
        const categoriaExistente = await verificarCategoriaExistente(description);
        
        if (!categoriaExistente) {
            console.log('Categoria não cadastrada!');
            return res.status(404).json({
                success: false,
                message: 'Categoria não cadastrada!'
            });
        }

        const resultado = await deletarCategoria(description);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Categoria não encontrada' 
            });
        }

        console.log('Categoria deletada com sucesso!');
        return res.status(200).json({
            success: true,
            message: 'Categoria deletada com sucesso!',
            affectedRows: resultado.affectedRows
        });

    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar categoria.'
        });
    }
};