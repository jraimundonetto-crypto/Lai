function calcularLucro(precoVenda, custo) {

    const lucro = precoVenda - custo;

    return {
        preco_venda: precoVenda,
        custo: custo,
        lucro_por_unidade: lucro
    };
}

module.exports = { calcularLucro };