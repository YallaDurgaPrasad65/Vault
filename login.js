// ===== DOM Elements =====
const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailGroup = document.getElementById('email-group');
const passwordGroup = document.getElementById('password-group');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const togglePw = document.getElementById('toggle-pw');
const eyeOpen = document.getElementById('eye-open');
const eyeClosed = document.getElementById('eye-closed');
const btnLogin = document.getElementById('btn-login');

// Redirect if already logged in
if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
}

// ===== Toggle Password Visibility =====
togglePw.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eyeOpen.style.display = isPassword ? 'none' : 'block';
    eyeClosed.style.display = isPassword ? 'block' : 'none';
});

// ===== Validation Helpers =====
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(group, msgEl, message) {
    group.classList.add('error');
    msgEl.textContent = message;
    group.classList.add('shake');
    setTimeout(() => group.classList.remove('shake'), 400);
}

function clearError(group, msgEl) {
    group.classList.remove('error');
    msgEl.textContent = '';
}

// ===== Real-time Validation =====
emailInput.addEventListener('input', () => {
    if (emailGroup.classList.contains('error') && validateEmail(emailInput.value)) {
        clearError(emailGroup, emailError);
    }
});

passwordInput.addEventListener('input', () => {
    if (passwordGroup.classList.contains('error') && passwordInput.value.length >= 6) {
        clearError(passwordGroup, passwordError);
    }
});

// ===== Form Submission =====
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    // Clear all errors
    clearError(emailGroup, emailError);
    clearError(passwordGroup, passwordError);

    // Validate email
    if (!emailInput.value.trim()) {
        showError(emailGroup, emailError, 'Email is required');
        valid = false;
    } else if (!validateEmail(emailInput.value)) {
        showError(emailGroup, emailError, 'Please enter a valid email');
        valid = false;
    }

    // Validate password
    if (!passwordInput.value) {
        showError(passwordGroup, passwordError, 'Password is required');
        valid = false;
    }

    if (!valid) return;

    // API Call
    btnLogin.classList.add('loading');
    btnLogin.disabled = true;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailInput.value.trim(),
                password: passwordInput.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            showError(emailGroup, emailError, data.error || 'Login failed');
            showError(passwordGroup, passwordError, ' ');
            btnLogin.classList.remove('loading');
            btnLogin.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showError(emailGroup, emailError, 'Server error, please try again later.');
        btnLogin.classList.remove('loading');
        btnLogin.disabled = false;
    }
});

// ===== Input focus micro-interaction =====
document.querySelectorAll('.input-wrapper input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.01)';
        input.parentElement.style.transition = 'transform 0.2s ease';
    });
    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});
