document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado.');

    const userMenuMobile = document.getElementById('userMenuMobile');
    const userMenuDesktop = document.getElementById('userMenuDesktop');
    const loginMenuMobile = document.getElementById('loginMenuMobile');
    const loginMenuDesktop = document.getElementById('loginMenuDesktop');

    console.log('Elementos do menu encontrados:', {
        userMenuMobile,
        userMenuDesktop,
        loginMenuMobile,
        loginMenuDesktop,
    });

    const authToken = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName');

    console.log('Auth Token:', authToken);
    console.log('Nome do Usuário:', userName);

    if (authToken && userName) {
        console.log('Usuário autenticado.');

        const userContent = `
            <div class="user-info">
                <span class="user-icon" style="cursor: pointer;"><ion-icon name="person-outline"></ion-icon>${userName}</span>
            </div>

            <div id="userModal" class="modal hidden">
                <div class="modal-content">
                <span class="close-button">&times;</span>
               <h3>Bem-vindo (a), <span id="modalUserName">${userName}</span></h3>
                <a href="./pages/Minha-conta.html" class="profile-link">Meu Perfil</a>
                <button id="logoutButton" class="logout-button">Sair</button>
                </div>
            </div>
        `;

        // Atualiza os menus
        if (userMenuMobile) {
            userMenuMobile.innerHTML = userContent;
            console.log('Menu mobile atualizado.');
        }
        if (userMenuDesktop) {
            userMenuDesktop.innerHTML = userContent;
            console.log('Menu desktop atualizado.');
        }
        if (loginMenuMobile) {
            loginMenuMobile.remove();
            console.log('Login mobile removido.');
        }
        if (loginMenuDesktop) {
            loginMenuDesktop.remove();
            console.log('Login desktop removido.');
        }

        // Atualiza o nome do usuário no modal
        const modalUserName = document.getElementById('modalUserName');
        if (modalUserName) {
            modalUserName.textContent = userName;
            console.log('Nome do usuário atualizado no modal.');
        } else {
            console.error('Elemento modalUserName não encontrado.');
        }

        attachEventListeners();
    } else {
        console.warn('Usuário não autenticado. Exibindo menus padrão.');
    }
});

function attachEventListeners() {
    const userIcon = document.querySelector('.user-icon');
    console.log('Ícone do usuário encontrado:', userIcon);

    const modal = document.getElementById('userModal');
    const closeButton = document.querySelector('.close-button');
    const logoutButton = document.getElementById('logoutButton');

    console.log('Elementos do modal:', { modal, closeButton, logoutButton });

    if (!userIcon) {
        console.error('Ícone do usuário não encontrado no DOM.');
        return;
    }
    if (!modal) {
        console.error('Modal não encontrado no DOM.');
        return;
    }
    if (!closeButton) {
        console.error('Botão de fechar do modal não encontrado.');
        return;
    }

    // Exibir o modal ao clicar no ícone do usuário
    userIcon.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.style.display = 'block';
        document.body.classList.add('modal-open'); // Desativa scroll
    });
    
    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open'); // Reativa scroll
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            document.body.classList.remove('modal-open'); // Reativa scroll
        }
    });
    

    // Lógica do botão de logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log('Botão de logout clicado.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userName');
            alert('Você saiu da sua conta.');
            window.location.href = './pages/login.html';
        });
    } else {
        console.warn('Botão de logout não encontrado.');
    }
}
