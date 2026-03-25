/**
 * SERVIDOR EXPRESS - LUCRA AI v2.0
 * Ponto de entrada das requisições API.
 */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const { analisarCardapio } = require('./ia-servicos.js');
const path = require('path')

const iaServicos = require(path.join(__dirname, 'ia-servicos.js'))



const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


/* ================================
   CONEXÃO SUPABASE
================================ */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
async function garantirPerfilEmpresarial(user_id) {

  const { data } = await supabase
    .from("perfis_empresariais")
    .select("id")
    .eq("id", user_id)
    .single();

  if (!data) {

    console.log("Criando perfil empresarial automaticamente...");

    const { error } = await supabase
      .from("perfis_empresariais")
      .insert({
        id: user_id,
        user_id: user_id
      });

    if (error) {
      console.error("ERRO AO CRIAR PERFIL:", error);
    }

  }

}

/* ================================
   BUSCAR PRODUTOS
================================ */

app.get("/api/produtos/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const { data, error } = await supabase
      .from("cardapio_produtos")
      .select("*")
      .eq("user_id", user_id);

    if (error) {
      console.error("ERRO SUPABASE:", error);

      return res.status(500).json({
        erro: "Erro ao buscar produtos",
      });
    }

    res.json(data);
  } catch (err) {
    console.error("ERRO SERVIDOR:", err);

    res.status(500).json({
      erro: "Erro interno",
    });
  }
});

/* ================================
   PROCESSAR CARDÁPIO
================================ */

app.post("/api/processar-cardapio", async (req, res) => {
  try {
    console.log("[API] Processando cardápio");

    const { imagem, user_id } = req.body;
    
await garantirPerfilEmpresarial(user_id);
await supabase
.from("cardapio_produtos")
.delete()
.eq("user_id", user_id);

    const produtos = await analisarCardapio(imagem);

    const produtosSalvos = [];

    for (const item of produtos) {
      const preco = Number(item.preco) || 0;
      const custoEstimado = preco * 0.35;
      const lucro = preco - custoEstimado;

      const { error } = await supabase
        .from("cardapio_produtos")
        .insert({
          user_id: user_id,
          nome: item.nome,
          preco: preco,
          custo: custoEstimado,
          lucro_por_uni: lucro,
          categoria: "NORMAL",
        });

      if (error) {
        console.error("ERRO AO SALVAR:", error);
      } else {
        console.log("SALVO:", item.nome);
        produtosSalvos.push(item);
      }
    }

    res.json({
      status: "ok",
      produtos: produtosSalvos,
    });
  } catch (erro) {
    console.error("Erro IA:", erro);

    res.status(500).json({
      erro: "Erro ao processar cardápio",
    });
  }
});

/* ================================
   HEALTH CHECK
================================ */

app.get("/health", (req, res) => {
  res.status(200).send("LUCRA AI Backend Online");
});

/* ================================
   START SERVER
================================ */
const distribuicaoLucro = require("./distribuicao-lucro");
app.use("/api", distribuicaoLucro);

const consultorRouter = require("./consultorController");
app.use("/api", consultorRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Lucra AI Backend rodando na porta ${PORT}`);
});
