const knex = require("../db");
const {uploadImagem} = require("../servicos/upload");

const cadastrarProduto = async (req, res) => {
	const {descricao, quantidade_estoque, valor, categoria_id, produto_imagem} =
		req.body;
	const {originalname, mimetype, buffer} = req.file;

	try {
		const categoriaExistente = await knex("categorias")
			.where({id: categoria_id})
			.first();

		if (!categoriaExistente) {
			return res.status(404).json("A categoria informada não existe.");
		}
		let produto = await knex("produtos")
			.insert({
				descricao,
				quantidade_estoque,
				valor,
				categoria_id,
                produto_imagem
			})
			.returning("*");

		if (!produto) {
			return res.status(400).json("O produto não foi cadastrado.");
		}
		const id = produto[0].id;
     

		const imagemDoProduto = await uploadImagem(
			`produtos/${id}/${originalname}`,
			buffer,
			mimetype
		);

		produto =await knex("produtos")
			.update({
				produto_imagem: imagemDoProduto.url,
			})
			.where({id})
			.returning("*");
      
	
		return res.status(201).json(produto[0]);
	} catch (error) {
		return res.status(400).json(error.message);
	}
};

const listarProdutos = async (req, res) => {
	const {categoria_id} = req.query;

	try {
		let produtos;

		if (categoria_id) {
			const categoriaExistente = await knex("categorias")
				.where({id: categoria_id})
				.first();

			if (!categoriaExistente) {
				return res.status(400).json("A categoria informada não existe.");
			}

			produtos = await knex("produtos").where({categoria_id});
		} else {
			produtos = await knex("produtos").select("*");
		}

		return res.status(200).json(produtos);
	} catch (error) {
		return res.status(400).json({mensagem: error.message});
	}
};

const excluirProduto = async (req, res) => {
	//TODO: aplicar validação na exclusão do produto
	//TODO: aprimorar exclusao da imagem do produto
	const {id} = req.params;

	try {
		const produtoExistente = await knex("produtos").where({id}).first();

		if (!produtoExistente) {
			return res.status(400).json("O produto informado não existe");
		}

		const produtoExcluido = await knex("produtos")
			.del()
			.where({id})
			.returning("*");
		return res.status(200).json(produtoExcluido);
	} catch (error) {
		return res.status(400).json({mensagem: error.message});
	}
};
const detalharProduto = async (req, res) => {
	const {id} = req.params;

	try {
		const produtoEncontrado = await knex
			.select("*")
			.from("produtos")
			.where({id})
			.first();

		if (!produtoEncontrado) {
			return res.status(404).json({mensagem: "Produto não encontrado"});
		}

		return res.status(200).json(produtoEncontrado);
	} catch (error) {
		return res.status(500).json(error.message);
	}
};

const editarProduto = async (req, res) => {
	const {id} = req.params;
	const {descricao, quantidade_estoque, valor, categoria_id} = req.body;

	try {
		const produtoExistente = await knex("produtos").where({id}).first();

		if (!produtoExistente) {
			return res.status(400).json("O produto informado não existe");
		}

		const categoriaExistente = await knex("categorias")
			.where({id: categoria_id})
			.first();

		if (!categoriaExistente) {
			return res.status(400).json("A categoria informada não existe.");
		}

		const produto = await knex("produtos")
			.update({descricao, quantidade_estoque, valor, categoria_id})
			.where({id});

		res.status(204).send();
	} catch (error) {
		return res.status(400).json(error.message);
	}
};

module.exports = {
	cadastrarProduto,
	listarProdutos,
	excluirProduto,
	detalharProduto,
	editarProduto,
};
