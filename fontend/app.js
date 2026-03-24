import { getClient } from './lib/supabaseClient.js';
import { createSidebar } from './components/sidebar.js';
import { criarDashboard } from './components/dashboard.js';
import { criarVisaoGeral } from './pages/visao-geral.js';
import { criarProdutos } from './pages/produtos.js';
import { criarConsultor } from './pages/consultor.js';
import { criarCaixaInteligente } from './pages/caixa-inteligente.js';
import { criarHome } from './pages/home.js';

const contentArea = document.getElementById('content');
const sidebarContainer = document.getElementById('sidebar-container');

let sbClient;
let currentUser;

async function iniciarSistema() {
    console.log("APP INICIADO");

    sbClient = await getClient();

    const { data: { user }, error: authError } = await sbClient.auth.getUser();

    if (authError || !user) {
        console.log("Usuário não logado");
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    if (sidebarContainer) {
        sidebarContainer.innerHTML = "";
        sidebarContainer.appendChild(createSidebar(navigate, sbClient));
    }

    try {
        const { data: assinatura, error: assError } = await sbClient
            .from('assinaturas')
            .select('*')
            .eq('user_id', user.id)
            .single();

        console.log("ASSINATURA:", assinatura);

        const status = assinatura?.status?.toLowerCase()?.trim();

        if (assError || !assinatura || status !== 'aprovado') {
            contentArea.innerHTML = `
                <div style="background:#1a1a1a;padding:50px;text-align:center;color:white;border-radius:15px;margin:20px;">
                    <h1 style="color:#00C875;">Acesso Restrito</h1>
                    <p>Assinatura não encontrada ou pendente.</p>
                    <a href="https://mpago.la/2oBvZbp"
                       style="background:#00C875;padding:15px 30px;color:black;font-weight:bold;text-decoration:none;border-radius:8px;display:inline-block;margin-top:20px;">
                       ATIVAR AGORA (R$ 47,00)
                    </a>
                </div>
            `;
            return;
        }

        // LIBERADO
        navigate('home');

    } catch (err) {
        console.error("ERRO CRÍTICO:", err);
    }
}

async function navigate(page) {
    console.log("Navegando para:", page);

    const { data: dadosEmpresa } = await sbClient
        .from('estabelecimentos')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

    contentArea.innerHTML = "";

    switch (page) {
        case 'home':
            contentArea.appendChild(await criarHome(currentUser, sbClient, navigate));
            break;

        case 'visao-geral':
            contentArea.appendChild(criarVisaoGeral(currentUser, sbClient, dadosEmpresa, navigate));
            break;

        case 'dashboard':
            contentArea.appendChild(criarDashboard(currentUser, sbClient, dadosEmpresa, navigate));
            break;

        case 'produtos':
            const respProd = await fetch(`http://localhost:3000/api/produtos/${currentUser.id}`);
            const dadosProdutos = await respProd.json();
            contentArea.appendChild(criarProdutos(currentUser, sbClient, dadosProdutos, navigate));
            break;

        case 'consultor':
            contentArea.appendChild(criarConsultor(currentUser));
            break;

        case 'caixa-inteligente':
            contentArea.appendChild(criarCaixaInteligente(currentUser, sbClient, dadosEmpresa, navigate));
            break;

        default:
            console.warn("Rota não encontrada:", page);
    }

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js")
            .then(() => console.log("SW registrado"))
            .catch(err => console.log("Erro SW:", err));
    }
}

iniciarSistema();