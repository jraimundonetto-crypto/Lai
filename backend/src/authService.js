/**
 * MÓDULO DE CONTROLE DE ACESSO + CHECKOUT
 * Regra: jraimundonetto@gmail.com = VITALÍCIO
 * Outros = 7 Dias de TestE ou Bloqueio (R$ 47,00)
 */

const verificarAcesso = (email, dataCriacao) => {
    const ADMIN_EMAIL = 'jraimundonetto@gmail.com';
    const LINK_PAGAMENTO = "https://link.mercadopago.com.br/lucra-ai-47"; // Substitua pelo seu link real

    // 1. Verificação de Acesso Vitalício (Fundador)
    if (email === ADMIN_EMAIL) {
        return {
            tem_acesso: true,
            tipo_plano: "VITALÍCIO",
            dias_restantes: "ILIMITADO",
            mensagem: "Bem-vindo, Comandante. Acesso vitalício ativo.",
            link_checkout: null
        };
    }

    // 2. Verificação de Trial (7 dias)
    const hoje = new Date();
    const dataInicio = new Date(dataCriacao);
    const diferencaTempo = hoje - dataInicio;
    const diasPassados = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));
    const diasRestantes = 7 - diasPassados;

    if (diasRestantes > 0) {
        return {
            tem_acesso: true,
            tipo_plano: "TRIAL",
            dias_restantes: diasRestantes,
            mensagem: `Seu período de teste expira em ${diasRestantes} dias.`,
            link_checkout: LINK_PAGAMENTO
        };
    }

    // 3. BLOQUEIO (PAGAMENTO PENDENTE)
    return {
        tem_acesso: false,
        tipo_plano: "EXPIRADO",
        dias_restantes: 0,
        mensagem: "Seu acesso expirou. Para continuar utilizando a inteligência do LUCRA AI, realize o pagamento de R$ 47,00.",
        link_checkout: LINK_PAGAMENTO
    };
};

module.exports = { verificarAcesso };