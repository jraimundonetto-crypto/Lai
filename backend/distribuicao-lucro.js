const express = require("express")

const { gerarDistribuicaoLucro } = require("./ia-servicos")

const router = express.Router()

router.post("/distribuicao-lucro", async (req, res) => {
  try {

    const {
      faturamentoMensal,
      custosTotais,
      lucroLiquido,
      produtos
    } = req.body

    const resultado = await gerarDistribuicaoLucro({
      faturamentoMensal,
      custosTotais,
      lucroLiquido,
      produtos
    })

    res.json(resultado)

  } catch (erro) {

    console.error("Erro distribuição IA:", erro)

    res.status(500).json({
      erro: "Falha na análise"
    })

  }
})

module.exports = router