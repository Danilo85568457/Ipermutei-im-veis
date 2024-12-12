
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Capturar os valores do formulário
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Fazer a requisição ao backend
    fetch('https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/login', {
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
        // Armazenar o token no localStorage
        localStorage.setItem('token', data.token);
        alert(data.message);

        // Redirecionar o usuário
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Erro no login:', error);
        alert('Erro ao fazer login. Tente novamente.');
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

        
 