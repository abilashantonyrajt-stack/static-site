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
        setTimeout(() => {
            // Store email if remember me is checked
            if (rememberMe && rememberMe.checked) {
                APP.store('remembered_email', emailInput.value);
            } else {
                APP.remove('remembered_email');
            }

            // Store user session
            APP.store('user_session', {
                email: emailInput.value,
                loginTime: new Date().toISOString()
            });

            APP.notify('Login successful! Redirecting...', 'success');

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '../home/index.html';
            }, 1500);
        }, 1000);
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
