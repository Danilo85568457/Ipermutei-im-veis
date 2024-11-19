        document.getElementById('registration-form').addEventListener('submit', function(e) {
            e.preventDefault();
            // Basic form validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;
            const tipoConta = document.querySelector('input[name="tipo_conta"]:checked');
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;

            if (!name || !email || !telefone || !tipoConta || !password || !confirmPassword || !terms) {
                alert('Por favor, preencha todos os campos e aceite os termos.');
                return;
            }

            if (password !== confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }
            window.location.href = '/';
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
   