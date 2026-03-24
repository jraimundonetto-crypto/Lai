export function criarProdutos(user, sbClient, dadosProdutos, navigate) {

    const container = document.createElement("div");
    container.className = "page";

    const listaCompleta = Array.isArray(dadosProdutos) ? [...dadosProdutos] : [];

    let totalPerdidoMes = 0;

    const produtosAnalisados = listaCompleta.map(p => {

        const precoVenda = parseFloat(p.preco) || 0;
        const custoProducao = parseFloat(p.custo) || 0;
        const lucroReais = precoVenda - custoProducao;

        // 🔥 INTELIGÊNCIA DE PREÇO
        const margemIdeal = 0.70;
        const margemMinima = 0.50;

        const margemAtual = precoVenda > 0 
            ? (precoVenda - custoProducao) / precoVenda 
            : 0;

        const precoIdeal = custoProducao / (1 - margemIdeal);
        let quantoAumentar = precoIdeal - precoVenda;

        if (margemAtual >= margemIdeal) {
            quantoAumentar = 0;
        } else {
            quantoAumentar = quantoAumentar > 0 ? quantoAumentar : 0;
        }

        // 🔥 IMPACTO MENSAL
        const impactoMes = quantoAumentar * 30;
        totalPerdidoMes += impactoMes;

        return {
            ...p,
            precoVenda,
            custoProducao,
            lucroReais,
            quantoAumentar,
            impactoMes
        };
    });

    // 🔥 ORDENA POR IMPACTO
    produtosAnalisados.sort((a, b) => b.impactoMes - a.impactoMes);

    const maiorLucro = [...produtosAnalisados].sort((a, b) => b.lucroReais - a.lucroReais)[0] || null;
    const piorLucro = [...produtosAnalisados].sort((a, b) => a.lucroReais - b.lucroReais)[0] || null;

    // 🔥 NOVO CÁLCULO DE MÉDIA
    const mediaAumento = produtosAnalisados.length > 0
        ? totalPerdidoMes / produtosAnalisados.length / 30
        : 0;

    container.innerHTML = `
        <header class="header-secao" style="margin-bottom:30px;">
            <h1 class="titulo">Análise de Produtos</h1>
            <p style="color:#666; font-size:13px; margin-top:-20px; padding-left:20px;">
                Mostrando todos os ${produtosAnalisados.length} itens identificados no seu cardápio
            </p>
        </header>

        <!-- 🔥 CARD PRINCIPAL MELHORADO -->
        <div class="grid-3" style="margin-bottom: 25px;">
            
            <div class="card" style="border-top: 3px solid var(--red-alert);">
                <label style="font-size:10px; color:#555;">GANHO POSSÍVEL / MÊS</label>
                
                <h2 style="font-size: 20px; margin: 10px 0; color:#FFF;">
                    + R$ ${totalPerdidoMes.toFixed(2)}
                </h2>

                <span style="color:#888; font-size:11px;">
                    Aumentando em média R$ ${mediaAumento.toFixed(2)} por produto
                </span>
            </div>

            <div class="card" style="border-top: 3px solid #00D1FF;">
                <label style="font-size:10px; color:#555;">MAIOR LUCRO UNITÁRIO</label>
                <h2 style="font-size: 16px; margin: 10px 0; color:#FFF;">
                    ${maiorLucro ? maiorLucro.nome : "---"}
                </h2>
                <span style="color:var(--green-primary); font-weight:800;">
                    R$ ${maiorLucro ? maiorLucro.lucroReais.toFixed(2) : "0,00"}
                </span>
            </div>

            <div class="card" style="border-top: 3px solid var(--red-alert);">
                <label style="font-size:10px; color:#555;">MENOR LUCRO UNITÁRIO</label>
                <h2 style="font-size: 16px; margin: 10px 0; color:#FFF;">
                    ${piorLucro ? piorLucro.nome : "---"}
                </h2>
                <span style="color:var(--red-alert); font-weight:800;">
                    R$ ${piorLucro ? piorLucro.lucroReais.toFixed(2) : "0,00"}
                </span>
            </div>

        </div>

        <div class="card" style="max-height: 70vh; overflow-y: auto; padding-right: 10px;">
            
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr; border-bottom: 1px solid #222; padding-bottom: 15px; margin-bottom:10px; font-size:10px; color:#555; font-weight:bold; text-transform: uppercase; position: sticky; top: 0; background: #111; z-index: 10;">
                <div>Item</div>
                <div style="text-align: center;">Custo</div>
                <div style="text-align: center;">Venda</div>
                <div style="text-align: center;">Lucro</div>
                <div style="text-align: right;">Sugestão IA</div>
            </div>

            <div id="lista-produtos-ia">
                ${produtosAnalisados.map(p => `
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr; align-items: center; padding: 15px 0; border-bottom: 1px solid #111;">
                        
                        <div>
                            <p style="font-weight: 700; color: #FFF; font-size: 14px;margin:0;">
                                ${p.nome}
                            </p>
                        </div>

                        <div style="text-align: center; color: #888; font-size: 13px;">
                            R$ ${p.custoProducao.toFixed(2)}
                        </div>

                        <div style="text-align: center; color: #EEE; font-size: 13px; font-weight: 600;">
                            R$ ${p.precoVenda.toFixed(2)}
                        </div>

                        <div style="text-align: center; color: var(--green-primary); font-size: 14px; font-weight: 800;">
                            R$ ${p.lucroReais.toFixed(2)}
                        </div>

                        <div style="text-align: right;">
                            ${p.quantoAumentar > 0 ? `
                                <span style="
                                    font-size: 11px; 
                                    color: var(--red-alert); 
                                    font-weight: 900; 
                                    background: rgba(255,71,87,0.1); 
                                    padding: 4px 8px; 
                                    border-radius: 4px;
                                ">
                                    Aumentar R$ ${p.quantoAumentar.toFixed(2)}
                                </span>
                            ` : `
                                <span style="
                                    font-size: 10px; 
                                    color: var(--green-primary); 
                                    font-weight: 800;
                                ">
                                    ✓ Preço OK
                                </span>
                            `}
                        </div>

                    </div>
                `).join('')}
            </div>
        </div>

        <button id="btn-voltar-home" class="btn-salvar" style="margin-top: 30px;">
            VOLTAR PARA HOME
        </button>
    `;

    container.querySelector("#btn-voltar-home").onclick = () => navigate('home');

    return container;
}