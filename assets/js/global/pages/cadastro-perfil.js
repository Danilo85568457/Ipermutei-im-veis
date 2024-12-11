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
    fetch('https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/buscar-imoveis?/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, telefone, tipoConta, password }),
    })
        .then(async (response) => {
            const text = await response.text(); // Obtenha o texto bruto da resposta
            console.log('Resposta do servidor:', text);
            const data = JSON.parse(text); // Tente converter para JSON
            console.log('Dados convertidos:', data);
            return data;
        })
        .catch((error) => {
            console.error('Erro no registro:', error);
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
   