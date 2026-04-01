/**
 * SERVIDOR EXPRESS - LUCRA AI v2.0
 * Ponto de entrada das requisições API.
 */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const { analisarCardapio } = require("./ia-servicos");

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

/* ================================
   MIDDLEWARE DE PROTEÇÃO (BLOQUEIO REAL)
================================ */
const verificarAssinatura = async (req, res, next) => {
    // Pega o ID tanto de parâmetros da URL quanto do corpo da requisição
    const user_id = req.params.user_id || req.body.user_id;

    if (!user_id) {
        return res.status(400).json({ erro: "User ID não fornecido" });
    }

    try {
        const { data: assinatura, error } = await supabase
            .from('assinaturas')
            .select('status')
            .eq('user_id', user_id)
            .single();

        const status = assinatura?.status?.toLowerCase()?.trim();

        // Verificação rigorosa de status
        if (error || !assinatura || status !== 'aprovado') {
            console.log(`[BLOQUEIO] Usuário ${user_id} barrado. Status: ${status}`);
            return res.status(403).json({ 
                erro: "Acesso negado. Assinatura inativa.",
                bloqueado: true 
            });
        }

        next(); // Se estiver aprovado, segue para a rota original
    } catch (err) {
        console.error("Erro no middleware:", err);
        return res.status(500).json({ erro: "Erro interno de validação" });
    }
};

/* ================================
   FUNÇÕES AUXILIARES
================================ */
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
      .insert({ id: user_id, user_id: user_id });
    if (error) console.error("ERRO AO CRIAR PERFIL:", error);
  }
}

/* ================================
   ROTAS DA API
================================ */

// BUSCAR PRODUTOS (Voltou a ser GET para bater com o Frontend)
app.get("/api/produtos/:user_id", verificarAssinatura, async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const { data, error } = await supabase
      .from("cardapio_produtos")
      .select("*")
      .eq("user_id", user_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("ERRO AO BUSCAR PRODUTOS:", err);
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});

// PROCESSAR CARDÁPIO COM IA
app.post("/api/processar-cardapio", verificarAssinatura, async (req, res) => {
  try {
    console.log("[API] Processando cardápio");
    const { imagem, user_id } = req.body;
    
    await garantirPerfilEmpresarial(user_id);
    await supabase.from("cardapio_produtos").delete().eq("user_id", user_id);

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

      if (!error) {
        produtosSalvos.push(item);
      }
    }

    res.json({ status: "ok", produtos: produtosSalvos });
  } catch (erro) {
    console.error("Erro IA:", erro);
    res.status(500).json({ erro: "Erro ao processar cardápio" });
  }
});

/* ================================
   HEALTH CHECK & OUTROS ROUTERS
================================ */
app.get("/health", (req, res) => {
  res.status(200).send("LUCRA AI Backend Online");
});

const distribuicaoLucro = require("./distribuicao-lucro");
app.use("/api", distribuicaoLucro);

const consultorRouter = require("./consultorController");
app.use("/api", consultorRouter);

/* ================================
   START SERVER
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Lucra AI Backend rodando na porta ${PORT}`);
});
