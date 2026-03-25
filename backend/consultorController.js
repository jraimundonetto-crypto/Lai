// src/consultorController.js
/** 
 * CONTROLADOR CONSULTOR LUCRA AI v2.0 
 * Endpoint para perguntas textuais da IA
 * Salva histórico no Supabase
 */

const express = require("express");
const router = express.Router();
const { solicitarAnaliseIA } = require("./ia-servicos"); // função que chama a IA textual
const supabase = require("./supabaseClient"); // conexão com Supabase

// Função auxiliar: garante que o perfil empresarial exista
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
    if (error) {
      console.error("ERRO AO CRIAR PERFIL:", error);
    }
  }
}

// Endpoint POST /api/consultor
// Recebe pergunta, chama IA, salva e retorna resposta
router.post("/consultor", async (req, res) => {
  try {
    const { user_id, pergunta } = req.body;

    if (!user_id || !pergunta) {
      return res.status(400).json({ erro: "Faltando user_id ou pergunta" });
    }

    // Garante que o perfil empresarial exista
    await garantirPerfilEmpresarial(user_id);

    // Chama a IA para gerar a resposta
    const respostaIA = await solicitarAnaliseIA(pergunta);

    // Salva pergunta + resposta no histórico
    const { error: errSalvar } = await supabase
      .from("historico_consultor")
      .insert([{ user_id, pergunta, resposta: respostaIA, criado_em: new Date() }]);

    if (errSalvar) {
      console.error("Erro ao salvar histórico:", errSalvar);
    }

    res.json({ resposta: respostaIA });
  } catch (erro) {
    console.error("Erro Consultor:", erro);
    res.status(500).json({ erro: "Erro ao processar pergunta" });
  }
});

// Endpoint GET /api/consultor/historico/:user_id
// Retorna todas as perguntas/respostas do usuário
router.get("/consultor/historico/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!user_id) {
      return res.status(400).json({ erro: "Faltando user_id" });
    }

    const { data, error } = await supabase
      .from("historico_consultor")
      .select("*")
      .eq("user_id", user_id)
      .order("criado_em", { ascending: true });

    if (error) {
      console.error("Erro ao buscar histórico:", error);
      return res.status(500).json({ erro: "Erro ao buscar histórico" });
    }

    res.json(data || []);
  } catch (erro) {
    console.error("Erro Consultor (GET histórico):", erro);
    res.status(500).json({ erro: "Erro ao processar histórico" });
  }
});

module.exports = router;