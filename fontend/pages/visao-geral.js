function calcularResumoIA(dados) {
    const faturamento = dados.faturamento_mensal || 0;
    const ticketMedio = dados.ticket_medio || 1; // Evitar divisão por zero
    
    // Cálculo de Custos de Funcionários
    const custoFunc = dados.funcionarios.reduce((acc, f) => {
        if (f.tipo === "Mensal") return acc + f.valor;
        return acc + (f.valor * (f.dias_semana * 4.33)); // Média de semanas no mês
    }, 0);

    // Cálculo de Custos Operacionais
    const custoFixo = dados.custos.filter(c => c.tipo === "Fixo").reduce((acc, c) => acc + c.valor, 0);
    const custoVariavelTotal = dados.custos.filter(c => c.tipo === "Variável").reduce((acc, c) => acc + c.valor, 0);

    const custoTotal = custoFunc + custoFixo + custoVariavelTotal;
    const lucroEstimado = faturamento - custoTotal;
    
    // Ponto de Equilíbrio (Simplificado para esta etapa)
    // Quantos clientes com o ticket médio atual pagam a operação
    const clientesNecessariosDia = Math.ceil(custoTotal / ticketMedio / 30); 

    return {
        faturamento,
        lucroEstimado,
        meta: dados.meta_financeira,
        clientesNecessariosDia,
        custoTotal
    };
}
// pages/visao-geral.js
export function criarVisaoGeral(user, sbClient, dadosEmpresa, navigate) {
    const container = document.createElement("div");
    let custosSalvos = [];

if (dadosEmpresa?.custos) {

    try {

        custosSalvos = JSON.parse(dadosEmpresa.custos);

    } catch {

        custosSalvos = [];

    }

}

    // --- LÓGICA DE RECONSTRUÇÃO DE ESTADO ---
    const isRecorrente = dadosEmpresa?.nome_proprietario ? true : false;

    

    // --- INTERFACE DE CADASTRO COMPLETO ---
    container.innerHTML = `
    <div class="page">
        <h1 class="titulo">Visão Geral</h1>
<div class="card">
    <h2>Informações do Negócio</h2>
    <div class="grid-negocio">
        <div class="campo">
            <label>Nome do estabelecimento</label>
            <input id="nome_est" value="${dadosEmpresa?.nome || ""}">
        </div>
        <div class="campo">
            <label>Nome do proprietário</label>
            <input id="nome_prop" value="${dadosEmpresa?.nome_proprietario || ""}">
        </div>
    </div>
    <div class="campo" style="margin-top:20px;">
    <label>Tipo de Negócio (Para personalização da IA)</label>
    <div id="tipo-negocio-grid" class="dias-grid">
        <button type="button" class="dia-btn ${dadosEmpresa?.tipo_negocio === 'Hamburgueria' ? 'active' : ''}" data-tipo="Hamburgueria">Hamburgueria</button>
        <button type="button" class="dia-btn ${dadosEmpresa?.tipo_negocio === 'Pizzaria' ? 'active' : ''}" data-tipo="Pizzaria">Pizzaria</button>
        <button type="button" class="dia-btn ${dadosEmpresa?.tipo_negocio === 'Açaí' ? 'active' : ''}" data-tipo="Açaí">Açaí</button>
    </div>
</div>
</div>
            <div class="grid-funcionamento">
                <div>
                    <label>Dias de funcionamento</label>
                    <div id="dias-grid" class="dias-grid"></div>
                </div>
                <div class="horarios">
                    <div class="campo">
                        <label>Abertura</label>
                        <input type="time" id="abertura" value="${dadosEmpresa?.horario_abertura || ""}">
                    </div>
                    <div class="campo">
                        <label>Fechamento</label>
                        <input type="time" id="fechamento" value="${dadosEmpresa?.horario_fechamento || ""}">
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
    <h2>Financeiro e Metas</h2>
    <div class="grid-2">
        <div class="campo">
            <label>Faturamento bruto mensal (Total que entra)</label>
            <input id="fat_bruto" type="number" placeholder="Ex: 30000" value="${dadosEmpresa?.faturamento_mensal || ""}">
        </div>
        <div class="campo">
            <label>Hoje, quanto sobra no seu bolso por mês? (Lucro)</label>
            <input id="lucro_atual" type="number" placeholder="Ex: 5000" value="${dadosEmpresa?.lucro_atual_dono || ""}">
        </div>
    </div>
    
    <div class="grid-2" style="margin-top:20px;">
        <div class="campo">
            <label>Quanto você gostaria de ganhar por mês? (Meta)</label>
            <input id="meta_fin" type="number" placeholder="Ex: 15000" value="${dadosEmpresa?.meta_financeira || ""}">
        </div>
        <div class="campo">
            <label>Quanto um cliente gasta em média? (Ticket Médio)</label>
            <input id="ticket_medio" type="number" placeholder="Ex: 45" value="${dadosEmpresa?.ticket_medio || ""}">
            <div class="campo">
    <label>Quantos pedidos você faz por dia?</label>
    <input id="pedidos_dia" type="number" placeholder="Ex: 30" value="${dadosEmpresa?.pedidos_dia || ""}">
        </div>
    </div>
</div>

<div class="card">
    <h2>Funcionários</h2>
    <div id="funcionarios-lista"></div>
    <button id="add-funcionario" class="btn-add">+ Adicionar Funcionário</button>
</div>

        <div class="card">
            <h2>Custos Fixos / Variáveis</h2>
            <div id="custos-lista"></div>
            <button id="add-custo" class="btn-add">+ adicionar custo</button>
        </div>

        <div class="grid-2">
            <div class="card">
                <h2>Cardápio (Leitura IA)</h2>
                <div class="upload-area">
                    <button id="btn-upload" class="upload-btn">Escolher até 5 imagens</button>
                    <input type="file" id="upload-cardapio" multiple accept="image/*" hidden>
                    <div id="upload-status" class="upload-status">Nenhuma imagem selecionada</div>
                </div>
            </div>
            <div class="card">
                <h2>Dificuldades</h2>
                <div id="dificuldades-grid"></div>
            </div>
        </div>

        <button id="btn-salvar" class="btn-salvar">SALVAR ALTERAÇÕES</button>
    </div>
    `;

    // --- ESTILOS ORIGINAIS ---
   const style = document.createElement("style");
style.innerHTML = `

.page{
max-width:1100px;
margin:auto;
color:#E0E0E0;
font-family:'Inter',sans-serif;
padding:40px 20px;
}

/* HEADER ESTILO SAAS */

.titulo{
font-size:28px;
font-weight:800;
color:#FFF;
letter-spacing:-1px;
margin-bottom:30px;
border-left:4px solid #00FFA3;
padding-left:15px;
}

/* CARDS */

.card{
background:#0A0A0A;
border:1px solid #1A1A1A;
border-radius:6px;
padding:25px;
margin-bottom:25px;
transition:0.25s;
}

.card:hover{
background:#111;
}

/* TITULO DO CARD */

.card h2{
font-size:18px;
margin-bottom:15px;
color:#FFF;
}

/* GRID PADRÃO */

.grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:15px;
margin-top:15px;
}

.grid-negocio,
.grid-funcionamento,
.grid-2{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
gap:25px;
}

/* INPUTS */

input{
background:#121212;
border:1px solid #1F1F1F;
padding:14px;
border-radius:6px;
color:#FFF;
width:100%;
font-size:14px;
transition:0.2s;
}

input:focus{
outline:none;
border-color:#00FFA3;
box-shadow:0 0 0 1px #00FFA3;
}

/* CAMPOS */

.campo{
display:flex;
flex-direction:column;
gap:6px;
font-size:13px;
color:#888;
}

/* HORÁRIOS */

.horarios{
display:flex;
gap:15px;
}

/* DIAS */

.dias-grid{
display:flex;
flex-wrap:wrap;
gap:8px;
margin-top:10px;
}

.dia-btn,
.dif-btn{
background:#141414;
border:1px solid #222;
padding:8px 14px;
border-radius:4px;
color:#BBB;
cursor:pointer;
transition:0.25s;
font-size:12px;
}

.dia-btn:hover,
.dif-btn:hover{
border-color:#00FFA3;
color:#00FFA3;
}

.dia-btn.active,
.dif-btn.active{
background:#00FFA3;
color:black;
border-color:#00FFA3;
font-weight:600;
}

/* BOTÕES */

.btn-salvar{
width:100%;
background:#00FFA3;
color:#000;
border:none;
padding:18px;
border-radius:4px;
font-weight:700;
cursor:pointer;
font-size:14px;
letter-spacing:0.5px;
transition:0.2s;
margin-top:30px;
}

.btn-salvar:hover{
filter:brightness(1.1);
}

/* BOTÃO ADICIONAR */

.btn-add{
background:#111;
color:#FFF;
border:1px solid #222;
padding:12px;
border-radius:4px;
cursor:pointer;
margin-top:15px;
transition:0.2s;
}

.btn-add:hover{
border-color:#00FFA3;
color:#00FFA3;
}

/* UPLOAD */

.upload-btn{
background:#0F0F0F;
color:#00FFA3;
border:1px dashed #00FFA3;
padding:16px;
width:100%;
border-radius:6px;
cursor:pointer;
transition:0.2s;
}

.upload-btn:hover{
background:#151515;
}

.upload-status{
margin-top:10px;
font-size:12px;
color:#777;
}

`;
document.head.appendChild(style);

function mostrarPainelAnalise(container, resumo) {
    const corLucro = resumo.lucroEstimado >= 0 ? "#00C875" : "#ff4444";
    
    container.innerHTML = `
    <div class="page" style="animation: fadeIn 0.5s ease;">
        <h1 class="titulo">Análise Inteligente do seu Negócio</h1>
        
        <div class="grid-2">
            <div class="card" style="border-top: 4px solid #00FFA3;">
                <p style="color:#888; font-size:12px;">FATURAMENTO ATUAL</p>
                <h2 style="font-size:32px;">R$ ${resumo.faturamento.toLocaleString('pt-BR')}</h2>
            </div>
            <div class="card" style="border-top: 4px solid ${corLucro};">
                <p style="color:#888; font-size:12px;">LUCRO ESTIMADO</p>
                <h2 style="font-size:32px; color:${corLucro};">R$ ${resumo.lucroEstimado.toLocaleString('pt-BR')}</h2>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <p style="color:#888; font-size:12px;">META FINANCEIRA</p>
                <h3 style="color:#FFF;">R$ ${resumo.meta.toLocaleString('pt-BR')}</h3>
                <p style="font-size:11px; color:#555; margin-top:10px;">Distância da meta: R$ ${(resumo.meta - resumo.lucroEstimado).toLocaleString('pt-BR')}</p>
            </div>
            <div class="card">
                <p style="color:#888; font-size:12px;">CLIENTES NECESSÁRIOS / DIA</p>
                <h3 style="color:#00FFA3;">${resumo.clientesNecessariosDia} clientes</h3>
                <p style="font-size:11px; color:#555; margin-top:10px;">Baseado no seu Ticket Médio</p>
            </div>
        </div>

        <div class="card" style="background: #111; text-align:center; padding:40px;">
            <h2 style="color:#00FFA3;">Insight da IA</h2>
            <p style="color:#DDD; line-height:1.6; max-width:600px; margin:auto;">
                Com base nos seus custos de <strong>R$ ${resumo.custoTotal.toLocaleString('pt-BR')}</strong>, 
                seu negócio precisa de uma operação focada em eficiência. No próximo acesso, vamos analisar seus produtos para identificar onde está fugindo o seu lucro.
            </p>
            <button id="btn-finalizar-onboarding" class="btn-salvar" style="max-width:300px; margin-top:30px;">IR PARA O CAIXA INTELIGENTE</button>
        </div>
    </div>
    `;

    container.querySelector("#btn-finalizar-onboarding").onclick = () => {
        window.location.reload(); // Ou sua lógica de navegação para a aba Caixa
    };
}

// --- LÓGICA DO TIPO DE NEGÓCIO ---
let tipoSelecionado = dadosEmpresa?.tipo_negocio || "";
const botoesTipo = container.querySelectorAll("#tipo-negocio-grid .dia-btn");

botoesTipo.forEach(btn => {
    btn.onclick = () => {
        // Remove 'active' de todos os botões DESTA grid
        botoesTipo.forEach(b => b.classList.remove("active"));
        // Adiciona 'active' apenas no clicado
        btn.classList.add("active");
        // Salva o valor na variável
        tipoSelecionado = btn.getAttribute("data-tipo");
        console.log("Tipo selecionado:", tipoSelecionado);
    };
});
    // --- LÓGICA DOS DIAS ---
    const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    let diasSelecionados = dadosEmpresa?.dias_funcionamento || [];
if (typeof diasSelecionados === "string") {
    try { diasSelecionados = JSON.parse(diasSelecionados); } catch { diasSelecionados = []; }
}
if (!Array.isArray(diasSelecionados)) diasSelecionados = [];
    const diasGrid = container.querySelector("#dias-grid");

    dias.forEach(d => {
        const btn = document.createElement("button");
        btn.className = `dia-btn ${diasSelecionados.includes(d) ? "active" : ""}`;
        btn.innerText = d;
        btn.onclick = () => {
            if (diasSelecionados.includes(d)) {
                diasSelecionados = diasSelecionados.filter(i => i !== d);
                btn.classList.remove("active");
            } else {
                diasSelecionados.push(d);
                btn.classList.add("active");
            }
        };
        diasGrid.appendChild(btn);
    });
const listaCustos = container.querySelector("#custos-lista");

function renderizarCustos() {
    listaCustos.innerHTML = "";
    custosSalvos.forEach((custo, index) => {
        const div = document.createElement("div");
        div.className = "grid";
        div.style.marginBottom = "10px";
        div.innerHTML = `
            <input type="text" class="custo-nome" placeholder="Nome (Ex: Aluguel)" value="${custo.nome}">
            <input type="number" class="custo-valor" placeholder="Valor" value="${custo.valor}">
            <select class="custo-tipo" style="background:#121212; color:white; border:1px solid #1F1F1F; padding:10px; border-radius:6px;">
                <option value="Fixo" ${custo.tipo === 'Fixo' ? 'selected' : ''}>Fixo</option>
                <option value="Variável" ${custo.tipo === 'Variável' ? 'selected' : ''}>Variável</option>
            </select>
            <button class="remover-custo btn-add" data-index="${index}" style="color:#ff4444; border-color:#442222; margin-top:0;">Excluir</button>
        `;
        listaCustos.appendChild(div);
    });
}

    // --- LÓGICA DE CUSTOS ---
function capturarCustosDoDOM() {
    const lista = [];
    container.querySelectorAll("#custos-lista .grid").forEach(linha => {
        const nome = linha.querySelector(".custo-nome")?.value;
        const valor = parseFloat(linha.querySelector(".custo-valor")?.value) || 0;
        const tipo = linha.querySelector(".custo-tipo")?.value;

        lista.push({ nome, valor, tipo });
    });
    return lista;
}

container.querySelector("#add-custo").onclick = () => {
    custosSalvos = capturarCustosDoDOM(); //  SALVA ANTES
    custosSalvos.push({
        nome: "",
        valor: 0,
        tipo: "Fixo"
    });
    renderizarCustos();
};
container.addEventListener("click",(e)=>{

    if(e.target.classList.contains("remover-custo")){

        const index = e.target.dataset.index;

        custosSalvos.splice(index,1);

        renderizarCustos();

    }

});

// --- LÓGICA DE FUNCIONÁRIOS ---
let funcionariosSalvos = [];
try {
    funcionariosSalvos = JSON.parse(dadosEmpresa?.funcionarios || "[]");
} catch {
    funcionariosSalvos = [];
}

const listaFunc = container.querySelector("#funcionarios-lista");

function renderizarFuncionarios() {
    listaFunc.innerHTML = "";
    funcionariosSalvos.forEach((func, index) => {
        const div = document.createElement("div");
        div.className = "card";
        div.style.background = "#111";
        div.innerHTML = `
            <div class="grid">
                <div class="campo">
                    <label>Nome do Funcionário</label>
                    <input type="text" class="func-nome" value="${func.nome || ""}" placeholder="Ex: João">
                </div>
                <div class="campo">
                    <label>Valor do Salário / Diária</label>
                    <input type="number" class="func-valor" value="${func.valor || 0}">
                </div>
            </div>
            <div class="grid" style="margin-top:15px;">
                <div class="campo">
                    <label>Tipo de Pagamento</label>
                    <select class="func-tipo" style="background:#121212; color:white; border:1px solid #1F1F1F; padding:10px; border-radius:6px;">
                        <option value="Mensal" ${func.tipo === 'Mensal' ? 'selected' : ''}>Mensal</option>
                        <option value="Diário" ${func.tipo === 'Diário' ? 'selected' : ''}>Diário</option>
                    </select>
                </div>
                <div class="campo func-dias-container" style="display: ${func.tipo === 'Diário' ? 'block' : 'none'};">
                    <label>Dias por semana</label>
                    <input type="number" class="func-dias" value="${func.dias_semana || 0}" placeholder="Ex: 5">
                </div>
            </div>
            <button class="remover-func btn-add" data-index="${index}" style="color:#ff4444; border-color:#442222; margin-top:15px;">Remover</button>
        `;

        // Lógica para mostrar/esconder campo de dias
        const selectTipo = div.querySelector(".func-tipo");
        const containerDias = div.querySelector(".func-dias-container");
        selectTipo.onchange = (e) => {
            containerDias.style.display = e.target.value === "Diário" ? "block" : "none";
        };

        listaFunc.appendChild(div);
    });
}

function capturarFuncionariosDoDOM() {
    const lista = [];
    container.querySelectorAll("#funcionarios-lista .card").forEach(bloco => {
        const nome = bloco.querySelector(".func-nome")?.value;
        const valor = parseFloat(bloco.querySelector(".func-valor")?.value) || 0;
        const tipo = bloco.querySelector(".func-tipo")?.value;
        const dias_semana = parseInt(bloco.querySelector(".func-dias")?.value) || 0;

        lista.push({ nome, valor, tipo, dias_semana });
    });
    return lista;
}

container.querySelector("#add-funcionario").onclick = () => {
    funcionariosSalvos = capturarFuncionariosDoDOM(); //  SALVA ANTES
    funcionariosSalvos.push({ nome: "", valor: 0, tipo: "Mensal", dias_semana: 0 });
    renderizarFuncionarios();
};

container.addEventListener("click", (e) => {
    if (e.target.classList.contains("remover-func")) {
        const index = e.target.dataset.index;
        funcionariosSalvos.splice(index, 1);
        renderizarFuncionarios();
    }
});

// Inicializa a lista
renderizarFuncionarios();
renderizarCustos();

    // --- LÓGICA DAS DIFICULDADES ---
    const dificuldades = ["Marketing", "Tráfego pago", "Precificação", "Organização financeira", "Controle de estoque", "Gestão da equipe", "Comunicação com equipe", "Baixo lucro", "Falta de clientes", "Crescimento"];
    let selecionadas = dadosEmpresa?.dificuldades || [];
if (typeof selecionadas === "string") {
    try { selecionadas = JSON.parse(selecionadas); } catch { selecionadas = []; }
}
if (!Array.isArray(selecionadas)) selecionadas = [];
    const difGrid = container.querySelector("#dificuldades-grid");

    dificuldades.forEach(d => {
        const btn = document.createElement("button");
        btn.className = `dif-btn ${selecionadas.includes(d) ? "active" : ""}`;
        btn.innerText = d;
        btn.onclick = () => {
            if (selecionadas.includes(d)) {
                selecionadas = selecionadas.filter(i => i !== d);
                btn.classList.remove("active");
            } else {
                selecionadas.push(d);
                btn.classList.add("active");
            }
        };
        difGrid.appendChild(btn);
    });

    // --- UPLOAD ---
 const uploadInput = container.querySelector("#upload-cardapio");
const btnUpload = container.querySelector("#btn-upload");
const status = container.querySelector("#upload-status");

// abre seletor de arquivo
btnUpload.onclick = () => uploadInput.click();

// quando selecionar arquivo
uploadInput.onchange = async () => {

    const files = uploadInput.files;

    status.innerText = "Processando cardápio com IA...";

    for (const file of files) {

        const base64 = await converterParaBase64(file);

        const response = await fetch("http://localhost:3000/api/processar-cardapio", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
        imagem: base64,
        user_id: user.id
    })

});

        const resultado = await response.json();

        console.log("Resultado IA:", resultado);
    }

   navigate('visao-geral');


};
function converterParaBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });

}

   // --- SALVAR COM UPSERT (VERSÃO FINAL UNIFICADA) ---
    container.querySelector("#btn-salvar").onclick = async () => {
        const btn = container.querySelector("#btn-salvar");
        btn.innerText = "PROCESSANDO...";
        btn.disabled = true;

        try {
            // 1. CAPTURA OS CUSTOS
            const custosParaSalvar = [];
            container.querySelectorAll("#custos-lista .grid").forEach(linha => {
                const nome = linha.querySelector(".custo-nome")?.value;
                const valor = parseFloat(linha.querySelector(".custo-valor")?.value) || 0;
                const tipo = linha.querySelector(".custo-tipo")?.value;
                if (nome) custosParaSalvar.push({ nome, valor, tipo });
            });

            // 2. CAPTURA OS FUNCIONÁRIOS
            const funcionariosParaSalvar = [];
            container.querySelectorAll("#funcionarios-lista .card").forEach(bloco => {
                const nome = bloco.querySelector(".func-nome")?.value;
                const valor = parseFloat(bloco.querySelector(".func-valor")?.value) || 0;
                const tipo = bloco.querySelector(".func-tipo")?.value;
                const dias_semana = parseInt(bloco.querySelector(".func-dias")?.value) || 0;
                if (nome) funcionariosParaSalvar.push({ nome, valor, tipo, dias_semana });
            });

            // 3. CÁLCULO DE DESPESAS TOTAIS (Para a tabela visao_geral)
            const totalDespesasFixas = custosParaSalvar
                .filter(c => c.tipo === "Fixo")
                .reduce((acc, c) => acc + c.valor, 0) + 
                funcionariosParaSalvar.reduce((acc, f) => f.tipo === "Mensal" ? acc + f.valor : acc, 0);

            // --- 4. MONTAGEM DO PAYLOAD PRINCIPAL (LIMPO) ---
const payload = {
    user_id: user.id,
    nome: container.querySelector("#nome_est")?.value || "",
    nome_proprietario: container.querySelector("#nome_prop")?.value || "",
    tipo_negocio: tipoSelecionado, 
    horario_abertura: container.querySelector("#abertura")?.value || "",
    horario_fechamento: container.querySelector("#fechamento")?.value || "",
    faturamento_mensal: parseFloat(container.querySelector("#fat_bruto")?.value) || 0,
    lucro_atual_dono: parseFloat(container.querySelector("#lucro_atual")?.value) || 0,
    meta_financeira: parseFloat(container.querySelector("#meta_fin")?.value) || 0,
    ticket_medio: parseFloat(container.querySelector("#ticket_medio")?.value) || 0,
    pedidos_dia: parseInt(container.querySelector("#pedidos_dia")?.value) || 0,
    // Removi 'atualizado_em' porque não existe na sua tabela 'estabelecimentos'
    custos: JSON.stringify(custosParaSalvar),
    funcionarios: JSON.stringify(funcionariosParaSalvar),
    dificuldades: JSON.stringify(selecionadas),
    dias_funcionamento: JSON.stringify(diasSelecionados)
};

// --- 5. SALVAR EM ESTABELECIMENTOS ---
const { error: errorEst } = await sbClient
    .from("estabelecimentos")
    .upsert(payload, { onConflict: 'user_id' });

if (errorEst) throw errorEst;

// --- 6. SALVAR EM VISAO_GERAL (SIMPLIFICADO) ---
// Como a tabela 'visao_geral' deu erro 400, vamos enviar o mínimo possível
const { error: errorVisao } = await sbClient
    .from("visao_geral")
    .upsert({
        user_id: user.id,
        faturamento_mensal: payload.faturamento_mensal
        // Se der erro aqui, remova outras colunas como faturamento_semanal/anual
    }, { onConflict: 'user_id' }
);

            // 7. DISPARAR ANÁLISE AUTOMÁTICA DA IA
            const dadosParaAnalise = {
                faturamento_mensal: payload.faturamento_mensal,
                ticket_medio: payload.ticket_medio,
                meta_financeira: payload.meta_financeira,
                funcionarios: funcionariosParaSalvar,
                custos: custosParaSalvar
            };

            const resumo = calcularResumoIA(dadosParaAnalise);
            
            btn.innerText = "SALVO COM SUCESSO! ";
            
            // Limpa a tela e mostra o painel de resultados após breve delay
            setTimeout(() => {
                navigate ('home');
            }, 1000);

        } catch (err) {
            console.error("Erro geral ao salvar:", err);
            alert("Erro ao salvar: " + (err.message || "Verifique o console"));
            btn.innerText = "TENTAR NOVAMENTE";
            btn.disabled = false;
        }
    };

    return container;
}