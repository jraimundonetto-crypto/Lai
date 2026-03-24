export const createSidebar = (onNavigate, sbClient) => {
    const sidebar = document.createElement('nav');
    sidebar.className = 'sidebar';

    sidebar.innerHTML = `
        <div class="logo">
            Lucra <span>AI</span>
        </div>

        <ul class="menu">
            <li data-page="visao-geral" class="active">
                Visão Geral
            </li>

            <li data-page="caixa-inteligente">
                Caixa Inteligente
            </li>

            <li data-page="produtos">
                Produtos
            </li>
    
            <li data-page="consultor">
                Consultor
            </li>
        </ul>

        <div class="logout" id="logout-btn">
            Sair
        </div>
    `;

    const menuItems = sidebar.querySelectorAll('li[data-page]');

    /* NAVEGAÇÃO ORIGINAL — MANTIDA */
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            onNavigate(item.dataset.page);
        });
    });

    /* LOGOUT ORIGINAL — MANTIDO */
    sidebar.querySelector('#logout-btn').addEventListener('click', async () => {
        const { error } = await sbClient.auth.signOut();
        if (!error) {
            window.location.href = 'login.html';
        }
    });

    return sidebar;
};