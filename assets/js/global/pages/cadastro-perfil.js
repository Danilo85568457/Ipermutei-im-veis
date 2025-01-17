document.getElementById('registration-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const tipoConta = document.querySelector('input[name="tipo_conta"]:checked').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terms = document.getElementById('terms').checked;

    // Validação básica
    if (!name || !email || !telefone || !tipoConta || !password || !confirmPassword || !terms) {
        alert('Por favor, preencha todos os campos e aceite os termos.');
        return;
    }

    if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return;
    }

    // Enviar dados para o backend
    fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, telefone, tipoConta, password }),
    })
        .then(async (response) => {
            const text = await response.text();
            console.log('Resposta do servidor:', text);
    
            // Tenta converter para JSON
            const data = JSON.parse(text);
    
            // Verifica se o cadastro foi bem-sucedido
            if (response.ok) {
                alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
                window.location.href = 'login.html'; // Redireciona para a página de login
            } else {
                alert(data.message || 'Erro no cadastro.');
            }
        })
        .catch((error) => {
            console.error('Erro no registro:', error);
            alert('Erro ao realizar o cadastro. Por favor, tente novamente.');
        });
    
    
});


        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const icon = input.nextElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        }
   