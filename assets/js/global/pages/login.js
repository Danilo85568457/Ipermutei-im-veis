
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Login form submitted.");

    // Capturar os valores do formulário
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log("Captured values:", { email, password });

    // Fazer a requisição ao backend
    fetch('https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/login',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login falhou. Verifique suas credenciais.');
        }
        return response.json();
    })
    .then(data => {
        // Salvar o token e o nome do usuário
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userName', data.name); // Assumindo que a API retorna o nome do usuário
        alert('Login bem-sucedido!');
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Falha no login. Verifique suas credenciais.');
    });
});


function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }
}

        
 