// ===== DOM Elements =====
const form = document.getElementById('signup-form');
const nameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');
const termsCheck = document.getElementById('terms');
const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const confirmError = document.getElementById('confirm-error');
const nameGroup = document.getElementById('name-group');
const emailGroup = document.getElementById('email-group');
const passwordGroup = document.getElementById('password-group');
const confirmGroup = document.getElementById('confirm-group');
const togglePw = document.getElementById('toggle-pw');
const eyeOpen = document.getElementById('eye-open');
const eyeClosed = document.getElementById('eye-closed');
const btnSignup = document.getElementById('btn-signup');
const signupCard = document.getElementById('signup-card');
const successCard = document.getElementById('success-card');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

// ===== Toggle Password Visibility =====
togglePw.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eyeOpen.style.display = isPassword ? 'none' : 'block';
    eyeClosed.style.display = isPassword ? 'block' : 'none';
});

// ===== Password Strength Checker =====
function getPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-5
}

const strengthLabels = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const strengthColors = ['', '#f87171', '#fb923c', '#fbbf24', '#34d399', '#22d3ee'];

passwordInput.addEventListener('input', () => {
    const pw = passwordInput.value;
    const score = getPasswordStrength(pw);

    if (pw.length === 0) {
        strengthBar.style.width = '0%';
        strengthText.textContent = '';
        return;
    }

    strengthBar.style.width = (score / 5) * 100 + '%';
    strengthBar.style.background = strengthColors[score];
    strengthText.textContent = strengthLabels[score];
    strengthText.style.color = strengthColors[score];

    // Clear error while typing
    if (passwordGroup.classList.contains('error') && pw.length >= 6) {
        clearError(passwordGroup, passwordError);
    }
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
nameInput.addEventListener('input', () => {
    if (nameGroup.classList.contains('error') && nameInput.value.trim().length >= 2) {
        clearError(nameGroup, nameError);
    }
});

emailInput.addEventListener('input', () => {
    if (emailGroup.classList.contains('error') && validateEmail(emailInput.value)) {
        clearError(emailGroup, emailError);
    }
});

confirmInput.addEventListener('input', () => {
    if (confirmGroup.classList.contains('error') && confirmInput.value === passwordInput.value) {
        clearError(confirmGroup, confirmError);
    }
});

// ===== Form Submission =====
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    // Clear all errors
    clearError(nameGroup, nameError);
    clearError(emailGroup, emailError);
    clearError(passwordGroup, passwordError);
    clearError(confirmGroup, confirmError);

    // Validate name
    if (!nameInput.value.trim()) {
        showError(nameGroup, nameError, 'Full name is required');
        valid = false;
    } else if (nameInput.value.trim().length < 2) {
        showError(nameGroup, nameError, 'Name must be at least 2 characters');
        valid = false;
    }

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
    } else if (passwordInput.value.length < 6) {
        showError(passwordGroup, passwordError, 'Password must be at least 6 characters');
        valid = false;
    }

    // Validate confirm password
    if (!confirmInput.value) {
        showError(confirmGroup, confirmError, 'Please confirm your password');
        valid = false;
    } else if (confirmInput.value !== passwordInput.value) {
        showError(confirmGroup, confirmError, 'Passwords do not match');
        valid = false;
    }

    // Validate terms
    if (!termsCheck.checked) {
        alert('Please agree to the Terms & Conditions');
        valid = false;
    }

    // Real signup API call
    btnSignup.classList.add('loading');
    btnSignup.disabled = true;

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullname: nameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            btnSignup.classList.remove('loading');
            btnSignup.disabled = false;

            // Show success
            signupCard.style.animation = 'cardOut 0.4s ease forwards';
            setTimeout(() => {
                signupCard.style.display = 'none';
                successCard.style.display = 'block';
                successCard.style.animation = 'cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            }, 400);
        } else {
            if (data.error === 'Email already exists') {
                showError(emailGroup, emailError, data.error);
            } else {
                alert('Signup failed: ' + (data.error || 'Unknown error'));
            }
            btnSignup.classList.remove('loading');
            btnSignup.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Server error, please try again later.');
        btnSignup.classList.remove('loading');
        btnSignup.disabled = false;
    }
});

// ===== Add cardOut keyframes =====
const style = document.createElement('style');
style.textContent = `@keyframes cardOut { to { opacity: 0; transform: translateY(-24px) scale(0.96); } }`;
document.head.appendChild(style);

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
