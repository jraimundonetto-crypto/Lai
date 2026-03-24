export function criarCaixaInteligente(user, sbClient, dadosEmpresa, navigate) {
    const container = document.createElement("div");
    container.className = "page";

    const hojeData = new Date();
    const hojeStr = hojeData.toISOString().split('T')[0];
    const diaAtual = hojeData.getDate();

    async function carregarDadosCompletos() {
        const { data: ultimoCaixa } = await sbClient
            .from('fluxo_caixa')
            .select('valor_final')
            .eq('user_id', user.id)
            .order('data_caixa', { ascending: false })
            .limit(1);

        const inicioMes = new Date(hojeData.getFullYear(), hojeData.getMonth(), 1).toISOString();

        const { data: vendasMes } = await sbClient
            .from('fluxo_caixa')
            .select('vendas_dia')
            .eq('user_id', user.id)
            .gte('data_caixa', inicioMes);

        const totalAcumuladoMes = vendasMes?.reduce((acc, curr) => acc + (curr.vendas_dia || 0), 0) || 0;

        const custosLista = JSON.parse(dadosEmpresa?.custos || "[]");
        const funcLista = JSON.parse(dadosEmpresa?.funcionarios || "[]");

        // ✅ CUSTOS FIXOS + VARIÁVEIS
        const totalCustos = custosLista.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);

        // ✅ CORREÇÃO DOS FUNCIONÁRIOS (IGUAL AO HOME/IA)
        const totalFunc = funcLista.reduce((acc, f) => {
            const valor = parseFloat(f.valor) || 0;

            if (f.tipo === "Mensal") {
                return acc + valor;
            } else {
                return acc + (valor * (parseFloat(f.dias_semana) || 0) * 4.33);
            }
        }, 0);

        // ✅ META DE SOBREVIVÊNCIA REAL
        const custoPorDiaReal = (totalCustos + totalFunc) / 26;

        const custoAcumuladoAteAgora = custoPorDiaReal * diaAtual;
        const retiradaDisponivel = totalAcumuladoMes - (totalCustos + totalFunc);

        const metaMensal = parseFloat(dadosEmpresa?.faturamento_mensal || 0);
        const metaDiaria = metaMensal / 26;

        renderizarInterface(
            ultimoCaixa?.[0]?.valor_final || 0,
            totalAcumuladoMes,
            custoPorDiaReal,
            retiradaDisponivel,
            metaMensal,
            metaDiaria
        );
    }

    function renderizarInterface(saldoAnterior, totalAcumuladoMes, custoDiarioReal, retiradaDisponivel, metaMensal, metaDiaria) {

        // 🔥 STATUS INTELIGENTE
        let statusTexto = "";
        let statusCor = "";

        if (totalAcumuladoMes < (custoDiarioReal * diaAtual)) {
            statusTexto = "Abaixo da sobrevivência";
            statusCor = "#ff4444";
        } else if (totalAcumuladoMes < metaMensal) {
            statusTexto = "Entre sobrevivência e meta";
            statusCor = "#FFBB00";
        } else {
            statusTexto = "Acima da meta";
            statusCor = "#00C875";
        }

        container.innerHTML = `
            <h1 class="titulo">Caixa Inteligente</h1>

            <div style="display:flex; align-items:center; gap:8px; margin-bottom:15px;">
                <div class="pulse" style="background:${statusCor};"></div>
                <span style="color:${statusCor}; font-weight:600; font-size:12px;">
                    ${statusTexto}
                </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 15px;">

                <div class="card" style="border-left: 3px solid #ff4444; padding:16px;">
                    <p class="label">Meta de Sobrevivência</p>
                    <h2 style="font-size:18px;">R$ ${custoDiarioReal.toFixed(2)} <span>/dia</span></h2>
                    <p class="sub">Mensal: R$ ${(custoDiarioReal * 26).toFixed(2)}</p>
                </div>

                <div class="card" style="border-left: 3px solid #2196F3; padding:16px;">
                    <p class="label">Vendas no Mês</p>
                    <h2 style="font-size:18px;">R$ ${totalAcumuladoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>

                <div class="card" style="border-left: 3px solid #00C875; padding:16px;">
                    <p class="label">Meta Mensal</p>
                    <h2 style="font-size:18px;">R$ ${metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                    <p class="sub">Dia: R$ ${metaDiaria.toFixed(2)}</p>
                </div>

                <div class="card" style="border-left: 3px solid #E91E63; padding:16px; background: rgba(233,30,99,0.05);">
                    <p class="label destaque">Dinheiro Livre</p>
                    <h2 style="font-size:18px;">R$ ${retiradaDisponivel > 0 ? retiradaDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "0,00"}</h2>
                </div>

            </div>

            <div class="card" style="padding:16px;">
                <div class="grid-2">
                    <div class="campo">
                        <label>Data</label>
                        <input type="date" id="data_caixa" value="${hojeStr}">
                    </div>
                    <div class="campo">
                        <label>Caixa Inicial</label>
                        <input type="number" id="caixa_inicial" value="${saldoAnterior}">
                    </div>
                </div>
            </div>

            <div class="card" style="padding:16px;">
                <div class="grid-2">
                    <div class="campo">
                        <label>Vendas Hoje</label>
                        <input type="number" id="vendas_dia">
                    </div>
                    <div class="campo">
                        <label>Caixa Final</label>
                        <input type="number" id="caixa_final" readonly>
                    </div>
                </div>
            </div>

            <button id="btn-salvar-caixa" class="btn-salvar">FINALIZAR</button>
        `;

        // 🔥 ANIMAÇÃO
        const style = document.createElement("style");
        style.innerHTML = `
            .pulse {
                width:8px;
                height:8px;
                border-radius:50%;
                animation: pulse 1s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.3; }
                100% { opacity: 1; }
            }
            .label { font-size:10px; color:#777; text-transform:uppercase; }
            .sub { font-size:9px; color:#555; margin-top:4px; }
            span { font-size:9px; color:#666; }
        `;
        document.head.appendChild(style);

        const inVendas = container.querySelector("#vendas_dia");
        const inInicial = container.querySelector("#caixa_inicial");
        const inFinal = container.querySelector("#caixa_final");

        const calcular = () => {
            const v = parseFloat(inVendas.value) || 0;
            const i = parseFloat(inInicial.value) || 0;
            inFinal.value = (v + i).toFixed(2);
        };

        inVendas.oninput = calcular;
        inInicial.oninput = calcular;

        container.querySelector("#btn-salvar-caixa").onclick = async () => {
            const payload = {
                user_id: user.id,
                data_caixa: hojeStr,
                valor_inicial: parseFloat(inInicial.value) || 0,
                vendas_dia: parseFloat(inVendas.value) || 0,
                valor_final: parseFloat(inFinal.value) || 0
            };

            await sbClient.from('fluxo_caixa').upsert(payload, {
                onConflict: 'user_id, data_caixa'
            });

            navigate('home');
        };
    }

    carregarDadosCompletos();
    return container;
}