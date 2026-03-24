export async function criarHome(user, supabase, navigate) {
    const container = document.createElement("div");
    container.className = "page";

    async function carregarDadosReais() {
        try {
            const { data: dadosEmpresa, error } = await supabase
                .from("estabelecimentos")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error || !dadosEmpresa) return;

            // -----------------------------
            // BASE
            // -----------------------------
            let custoTotal = 0;

            const custos = JSON.parse(dadosEmpresa.custos || "[]");
            const funcionarios = JSON.parse(dadosEmpresa.funcionarios || "[]");

            custos.forEach(c => custoTotal += Number(c.valor) || 0);

            funcionarios.forEach(f => {
                if (f.tipo === "Mensal") {
                    custoTotal += Number(f.valor) || 0;
                } else {
                    custoTotal += (f.valor * f.dias_semana * 4.33);
                }
            });

            const faturamento = Number(dadosEmpresa.faturamento_mensal) || 0;
            const meta = Number(dadosEmpresa.meta_financeira) || 0;
            const ticket = Number(dadosEmpresa.ticket_medio) || 0;

            const dias = 26;

            // -----------------------------
            // META DIÁRIA
            // -----------------------------
            const metaDia = meta / dias;
            const clientes = ticket > 0 ? Math.ceil(metaDia / ticket) : 0;

            // -----------------------------
            // SOBREVIVÊNCIA
            // -----------------------------
            const sobrevivenciaDia = custoTotal / dias;

            // -----------------------------
            // LUCRO REAL
            // -----------------------------
            const lucroAtual = faturamento - custoTotal;

            // PROJEÇÃO +20%
            const faturamentoProjetado = faturamento * 1.2;
            const faturamentoProjetadoDia = faturamentoProjetado / dias;

            const pedidosNecessarios = ticket > 0
                ? Math.ceil(faturamentoProjetadoDia / ticket)
                : 0;

            const lucroProjetado = faturamentoProjetado - custoTotal;

            // -----------------------------
            // DIVISÃO DO LUCRO (AGORA CORRETO)
            // -----------------------------
            const reinvestimento = lucroProjetado * 0.3;
            const caixa = lucroProjetado * 0.2;
            const lucroDono = lucroProjetado * 0.5;

            // -----------------------------
            // HTML
            // -----------------------------
            container.innerHTML = `
                <h1 class="titulo">Olá, ${dadosEmpresa.nome_proprietario || 'Empreendedor'}</h1>

                <div class="grid-2">

                    <!-- META DIÁRIA -->
                    <div class="card">
                        <p class="label">Meta de Venda Diária</p>
                        <h1 class="big">R$ ${metaDia.toFixed(0)}</h1>

                        <p class="sub">Para bater R$ ${meta.toFixed(0)} no mês</p>

                        <div class="divider"></div>

                        <p class="info"> ${clientes} clientes/dia</p>
                        <p class="info"> Ticket médio: R$ ${ticket.toFixed(2)}</p>
                    </div>

                    <!-- SOBREVIVÊNCIA -->
                    <div class="card danger">
                        <p class="label">Meta de Sobrevivência (Custos)</p>
                        <h1 class="big">R$ ${sobrevivenciaDia.toFixed(0)}</h1>

                        <p class="sub">Para não operar no prejuízo</p>

                        <div class="divider"></div>

                        <p class="info">Custo mensal: R$ ${custoTotal.toFixed(0)}</p>
                    </div>

                </div>

                <div class="grid-2">

                    <!-- META DE LUCRO -->
                    <div class="card gold">
                        <p class="label">Meta de Lucro (Projeção)</p>

                        <p class="sub">Hoje você fatura R$ ${faturamento.toFixed(0)}</p>
                        <p class="sub">Você pode chegar em:</p>

                        <h1 class="big">R$ ${faturamentoProjetado.toFixed(0)}</h1>

                        <div class="divider"></div>

                        <p class="info"> R$ ${faturamentoProjetadoDia.toFixed(0)} por dia</p>
                        <p class="info"> ${pedidosNecessarios} pedidos/dia</p>

                        <p class="info"> Lucro líquido:</p>
                        <h2 class="highlight">R$ ${lucroProjetado.toFixed(0)}</h2>
                    </div>

                    <!-- PARA ONDE VAI -->
                    <div class="card purple">
                        <p class="label">Para Onde Vai o Dinheiro</p>

                        <p class="sub">Baseado no lucro projetado</p>

                        <div class="divider"></div>

                        <p class="info"> Reinvestir</p>
                        <h3>R$ ${reinvestimento.toFixed(0)}</h3>

                        <p class="info"> Caixa</p>
                        <h3>R$ ${caixa.toFixed(0)}</h3>

                        <p class="info"> Seu lucro</p>
                        <h2 class="highlight">R$ ${lucroDono.toFixed(0)}</h2>
                    </div>

                </div>
            `;

        } catch (e) {
            console.error(e);
        }
    }

    const style = document.createElement("style");
    style.innerHTML = `
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .card {
            background: #0A0A0A;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #1A1A1A;
        }

        .label {
            color: #777;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .big {
            font-size: 36px;
            color: #FFF;
            font-weight: 800;
        }

        .sub {
            color: #555;
            font-size: 12px;
        }

        .info {
            color: #999;
            font-size: 13px;
            margin-top: 5px;
        }

        .highlight {
            color: #00FFA3;
            font-size: 22px;
            margin-top: 5px;
        }

        .divider {
            height: 1px;
            background: #1A1A1A;
            margin: 15px 0;
        }

        .danger { border-top: 3px solid #ff4444; }
        .gold { border-top: 3px solid #FFD700; }
        .purple { border-top: 3px solid #8A2BE2; }

        @media (max-width: 768px) {
            .grid-2 { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(style);

    carregarDadosReais();

    return container;
}