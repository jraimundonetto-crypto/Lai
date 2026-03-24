/**
 * CONTROLADOR LUCRA AI v2.0 - VERSÃO ROBUSTA
 */

const supabase = require('./supabaseClient');
const { calcularSaudeFinanceira } = require('./motorFinanceiro');
const { gerarPromptDiagnostico } = require('./aiPromptManager');
const { solicitarAnaliseIA } = require('./aiService');

const processarDiagnostico = async (user_id) => {
    try {
        console.log(`[DEBUG] Buscando usuário: ${user_id}`);

        // 1. Busca perfil (usando .select('*') para evitar erro de coluna)
        const { data: usuario, error: errUsuario } = await supabase
            .from('perfis_empresariais')
            .select('*')
            .eq('user_id', user_id.trim())
            .maybeSingle();

        if (errUsuario) {
            console.error("[DEBUG] Erro Supabase:", errUsuario);
            throw new Error("Erro na consulta ao banco.");
        }
        
        if (!usuario) {
            throw new Error("Usuário não encontrado na base de dados.");
        }

        console.log("[DEBUG] Usuário encontrado:", usuario.user_id);

        // 2. Busca configurações (com tratamento de erro)
        const { data: config } = await supabase
            .from('configuracao_financeira')
            .select('*')
            .eq('user_id', user_id.trim())
            .maybeSingle();

        // 3. Busca cardápio e dificuldades
        const { data: cardapio } = await supabase.from('cardapio_produtos').select('*').eq('user_id', user_id.trim());
        const { data: dificuldades } = await supabase.from('dificuldades_empreendedor').select('dificuldade_tag').eq('user_id', user_id.trim());

        const tags = dificuldades ? dificuldades.map(d => d.dificuldade_tag) : [];
        const cardapioContext = {
            maior: cardapio?.find(p => p.categoria === 'MAIOR_MARGEM'),
            pior: cardapio?.find(p => p.categoria === 'PIOR_MARGEM')
        };

        // 4. Executa Motor (usando valores padrão se config for null)
        const analise = calcularSaudeFinanceira({
            faturamento_mensal: config?.venda_mensal || 0,
            custos_fixos_total: config?.contas_pagar_mes || 0,
            custos_variaveis_total: 0,
            pro_labore: config?.pro_labore_sugerido || 0,
            fator_regional: 1.0 
        });

        // 5. Executa IA
        const prompt = gerarPromptDiagnostico(usuario, analise, cardapioContext, tags);
        const diagnosticoIA = await solicitarAnaliseIA(prompt);

        return {
            status: "SUCESSO",
            diagnostico: diagnosticoIA,
            indicadores: analise
        };

    } catch (error) {
        return { status: "ERRO", mensagem: error.message };
    }
};

module.exports = { processarDiagnostico };