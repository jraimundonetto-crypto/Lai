/**
 * MÓDULO DE GEOINTELIGÊNCIA - LUCRA AI
 * Objetivo: Identificar região e ajustar percepção de custos.
 */
const axios = require('axios');

const detectarLocalizacao = async (ip) => {
    try {
        // Em localhost, o IP pode vir como ::1 ou 127.0.0.1. 
        // Para teste, se for local, simulamos um IP de São Paulo.
        const ipBusca = (ip === '::1' || ip === '127.0.0.1') ? '45.231.135.255' : ip;
        
        const response = await axios.get(`http://ip-api.com/json/${ipBusca}?fields=status,region,city`);
        
        if (response.data.status === 'success') {
            return {
                estado: response.data.region, // Ex: SP, MG, RJ
                cidade: response.data.city,
                ajuste_regional: obterFatorCusto(response.data.region)
            };
        }
        return { estado: 'SP', ajuste_regional: 1.0 }; // Fallback padrão
    } catch (error) {
        return { estado: 'SP', ajuste_regional: 1.0 };
    }
};

/**
 * Retorna um fator de peso baseado no estado.
 * Exemplo: SP e RJ têm custo operacional geralmente 15% maior que a média.
 */
const obterFatorCusto = (estado) => {
    const pesos = {
        'SP': 1.15,
        'RJ': 1.12,
        'MG': 1.05,
        'SC': 1.08,
        'PR': 1.07
    };
    return pesos[estado] || 1.0;
};

module.exports = { detectarLocalizacao };