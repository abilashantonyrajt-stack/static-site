/* ============================================
   LOGIN PAGE JAVASCRIPT
   ============================================ */

/**
 * Login Page Module
 */
const LoginPage = {
    /**
     * Initialize login page
     */
    init() {
        this.setupFormHandlers();
        this.loadRememberedEmail();
        console.log('✓ Login page initialized');
    },

    /**
     * Setup form submission and validation
     */
    setupFormHandlers() {
        const form = document.querySelector('.login-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('focus', () => {
                input.closest('.form-group').classList.remove('error');
            });
        });
    },

    /**
     * Validate individual field
     * @param {Element} field - Input field to validate
     */
    validateField(field) {
        const formGroup = field.closest('.form-group');
        let isValid = true;

        if (field.type === 'email') {
            isValid = this.isValidEmail(field.value);
        } else if (field.type === 'password') {
            isValid = field.value.length >= 6;
        }

        if (!isValid) {
            formGroup.classList.add('error');
            const errorMsg = formGroup.querySelector('.error-message');
            if (errorMsg) {
                if (field.type === 'email') {
                    errorMsg.textContent = 'Please enter a valid email address';
                } else {
                    errorMsg.textContent = 'Password must be at least 6 characters';
                }
            }
        } else {
            formGroup.classList.remove('error');
        }

        return isValid;
    },

    /**
     * Handle login submission
     */
    handleLogin() {
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const rememberMe = document.querySelector('input[type="checkbox"]');
        const loginButton = document.querySelector('.login-button');

        // Validate both fields
        const emailValid = this.validateField(emailInput);
        const passwordValid = this.validateField(passwordInput);

        if (!emailValid || !passwordValid) return;

        // Show loading state
        loginButton.classList.add('loading');
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        // Simulate login process
        setTimeout(async () => {
            try {
                const result = await APP.request(APP.apiUrl('/api/auth/login'), {
                    method: 'POST',
                    body: {
                        email: emailInput.value,
                        password: passwordInput.value
                    }
                });

                if (rememberMe && rememberMe.checked) {
                    APP.store('remembered_email', emailInput.value);
                } else {
                    APP.remove('remembered_email');
                }

                APP.setSession(result.token, result.user);
                APP.notify('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '../../index files/index.html';
                }, 1500);
            } catch (error) {
                APP.notify(error.message || 'Login failed', 'error');
                loginButton.classList.remove('loading');
                loginButton.disabled = false;
                loginButton.textContent = 'Log in';
            }
        }, 300);
    },

    /**
     * Load remembered email if available
     */
    loadRememberedEmail() {
        const emailInput = document.querySelector('input[type="email"]');
        const rememberMe = document.querySelector('input[type="checkbox"]');

        const rememberedEmail = APP.retrieve('remembered_email');
        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail;
            if (rememberMe) {
                rememberMe.checked = true;
            }
        }
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LoginPage.init();
});

console.log('✓ Login page scripts loaded');
