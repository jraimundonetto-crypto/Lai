export function criarDashboard(user, sbClient, dadosEmpresa, navigate) {
    const container = document.createElement('div');
    container.className = 'page';

    // Cálculos Estratégicos
    const metaMensal = dadosEmpresa?.meta_financeira || 10000;
    const diasOperacao = 26; // Baseado na sua sugestão de 26 dias úteis
    const faturamentoDiarioAlvo = metaMensal / diasOperacao;
    
    // Ponto de Equilíbrio (Simulação: Custos Fixos + Variáveis estimados)
    // Se você não tiver esse dado no banco, podemos usar 60% da meta como segurança inicial
    const pontoEquilibrioMensal = metaMensal * 0.6; 
    const pontoEquilibrioDiario = pontoEquilibrioMensal / diasOperacao;

    const ticketMedio = dadosEmpresa?.ticket_medio || 40;
    const clientesNecessarios = Math.ceil(faturamentoDiarioAlvo / ticketMedio);

    container.innerHTML = `
        <h1 class="titulo">Olá, ${dadosEmpresa?.nome_proprietario || 'José'}</h1>
        
        <div style="margin-bottom: 35px;">
            <button id="btn-caixa" class="btn-salvar" style="width:auto; padding: 15px 40px;">REGISTRAR VENDA DE HOJE</button>
        </div>

        <div class="grid-2">
            <div class="card" style="border-top: 4px solid var(--green-primary);">
                <div class="campo"><label>Meta de Venda Diária</label></div>
                <h2 style="font-size: 36px; color: #FFF;">R$ ${faturamentoDiarioAlvo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
                <p style="color: var(--green-primary); font-size: 13px; margin-top: 8px; font-weight: 600;">
                    Para bater os R$ ${metaMensal.toLocaleString('pt-BR')} em ${diasOperacao} dias
                </p>
            </div>

            <div class="card" style="border-top: 4px solid #FFA500;">
                <div class="campo"><label>Ponto de Equilíbrio (Mínimo Diário)</label></div>
                <h2 style="font-size: 36px; color: #FFF;">R$ ${pontoEquilibrioDiario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
                <p style="color: #FFA500; font-size: 13px; margin-top: 8px; font-weight: 600;">
                    Venda mínima para cobrir custos e fornecedores
                </p>
            </div>
        </div>

        <div class="grid-2" style="margin-top: 10px;">
            <div class="card">
                <div class="campo"><label>Esforço de Clientes</label></div>
                <h2 style="font-size: 28px;">${clientesNecessarios} Clientes/dia</h2>
                <p style="color: var(--text-muted); font-size: 12px; margin-top: 5px;">Baseado no seu Ticket Médio atual</p>
            </div>

            <div class="card">
                <div class="campo"><label>Ticket Médio Alvo</label></div>
                <h2 style="font-size: 28px; color: var(--green-primary);">R$ ${ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
                <p style="color: var(--text-muted); font-size: 12px; margin-top: 5px;">Valor médio por venda</p>
            </div>
        </div>
    `;

    container.querySelector('#btn-caixa').onclick = () => navigate('caixa-inteligente');
    return container;
}