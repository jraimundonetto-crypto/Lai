// pages/consultor.js
export function criarConsultor(currentUser) {
    const container = document.createElement("div");
    container.className = "page";

    // Estrutura HTML - Mantendo o padrão de inputs que você já usa
    container.innerHTML = `
        <header class="header-secao" style="margin-bottom:20px;">
            <h1 class="titulo">Consultor <span>AI</span></h1>
            <p style="color:#666; font-size:13px; margin-top:-20px; padding-left:20px;">Seu mentor estratégico de negócios</p>
        </header>

        <div class="card" style="border-top: 3px solid var(--green-primary); background: #0A0A0A;">
            <div id="respostas-container" class="respostas-container">
                </div>

            <div class="input-area-fixa">
                <input type="text" id="input-pergunta" placeholder="Ex: Como reduzir meu custo fixo?">
                <div class="buttons-consultor">
                    <button id="btn-enviar" class="btn-enviar">PERGUNTAR</button>
                    <button id="btn-nova-pergunta" class="btn-limpar">LIMPAR</button>
                </div>
            </div>
        </div>
    `;

    const input = container.querySelector("#input-pergunta");
    const btn = container.querySelector("#btn-enviar");
    const btnNova = container.querySelector("#btn-nova-pergunta");
    const respostasContainer = container.querySelector("#respostas-container");

    // Função para formatar o texto (Transforma quebras de linha em parágrafos reais)
    function formatarResposta(texto) {
        // Substitui quebras de linha por <br> e preserva espaços
        return texto.replace(/\n/g, '<br>');
    }

    function criarBloco(perguntaTexto, respostaTexto, tipo = "normal") {
        const bloco = document.createElement("div");
        bloco.className = "bloco-resposta";

        bloco.innerHTML = `
            <div class="pergunta-item">
                <span class="label-user">VOCÊ</span>
                <p>${perguntaTexto}</p>
            </div>
            <div class="resposta-item ${tipo === "erro" ? "erro" : ""}">
                <span class="label-ia">CONSULTOR LUCRA AI</span>
                <div class="texto-resposta">${formatarResposta(respostaTexto)}</div>
            </div>
        `;

        respostasContainer.appendChild(bloco);
        respostasContainer.scrollTop = respostasContainer.scrollHeight;
    }

    async function carregarHistorico() {
        respostasContainer.innerHTML = `<p style="color:#444; font-size:12px; text-align:center;">Carregando histórico de consultoria...</p>`;
        try {
            const res = await fetch(`http://localhost:3000/api/consultor/historico/${currentUser.id}`);
            const dados = await res.json();
            respostasContainer.innerHTML = "";
            dados.forEach(item => {
                criarBloco(item.pergunta, item.resposta);
            });
        } catch (err) {
            respostasContainer.innerHTML = "";
            console.error("Erro histórico:", err);
        }
    }

    carregarHistorico();

    btn.onclick = async () => {
        const pergunta = input.value.trim();
        if (!pergunta) return;

        criarBloco(pergunta, "Analisando seus dados...", "loading");
        input.value = "";

        try {
            const res = await fetch("http://localhost:3000/api/consultor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: currentUser.id, pergunta })
            });
            const data = await res.json();

            const ultBloco = respostasContainer.querySelector(".bloco-resposta:last-child");
            if (ultBloco) {
                const respDiv = ultBloco.querySelector(".texto-resposta");
                respDiv.innerHTML = formatarResposta(data.resposta || "Não consegui analisar agora.");
                ultBloco.querySelector(".resposta-item").classList.remove("loading");
            }
            respostasContainer.scrollTop = respostasContainer.scrollHeight;
        } catch (erro) {
            criarBloco(pergunta, "Erro na conexão. Tente novamente.", "erro");
        }
    };

    btnNova.onclick = () => {
        respostasContainer.innerHTML = "";
        input.value = "";
        input.focus();
    };

    // Estilização atualizada para Celular e Organização de Texto
    const style = document.createElement("style");
    style.innerHTML = `
        .respostas-container { 
            display: flex; flex-direction: column; gap: 20px; 
            max-height: 50vh; overflow-y: auto; padding-bottom: 20px;
            scroll-behavior: smooth;
        }
        
        .bloco-resposta { display: flex; flex-direction: column; gap: 10px; }

        .pergunta-item { 
            align-self: flex-end; background: #111; padding: 12px; 
            border-radius: 12px 12px 2px 12px; max-width: 85%;
            border-right: 2px solid var(--green-primary);
        }
        
        .resposta-item { 
            align-self: flex-start; background: #1A1A1A; padding: 15px; 
            border-radius: 12px 12px 12px 2px; max-width: 90%;
            border-left: 2px solid #333;
        }

        .label-user, .label-ia { font-size: 9px; font-weight: 800; color: #555; display: block; margin-bottom: 5px; }
        .label-ia { color: var(--green-primary); }

        /* AQUI ESTÁ A MÁGICA PARA O TEXTO NÃO FICAR JUNTO */
        .texto-resposta { 
            font-size: 14px; line-height: 1.6; color: #DDD; 
            white-space: pre-wrap; /* Mantém as quebras de linha da IA */
            word-wrap: break-word;
        }

        .input-area-fixa { margin-top: 20px; border-top: 1px solid #1A1A1A; padding-top: 20px; }
        
        .buttons-consultor { display: flex; gap: 10px; margin-top: 10px; }

        .btn-enviar { flex: 2; background: var(--green-primary); color: #000; border: none; padding: 15px; border-radius: 8px; font-weight: 800; cursor: pointer; }
        .btn-limpar { flex: 1; background: #111; color: #666; border: 1px solid #222; padding: 15px; border-radius: 8px; font-weight: 800; cursor: pointer; }
        
        .resposta-item.erro { border-left-color: #FF4D4D; background: #221111; }
        
        /* Estilização da barra de scroll */
        .respostas-container::-webkit-scrollbar { width: 4px; }
        .respostas-container::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
    `;
    document.head.appendChild(style);

    return container;
}