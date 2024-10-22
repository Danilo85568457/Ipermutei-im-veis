
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Add form validation here if needed
    window.location.href = 'https://websim.ai/p/27rcsnias5_5b3x5ms5_/127';
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

        
 