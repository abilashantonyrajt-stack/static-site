if (!document.querySelector('script[data-shared-script]')) {
  const sharedScript = document.createElement('script');
  sharedScript.src = '../index.js';
  sharedScript.dataset.sharedScript = 'true';
  document.head.appendChild(sharedScript);
}
document.body.dataset.page = 'login';

const LoginPage = {
    mode: 'login',

    init() {
        const form = document.getElementById('authForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submit();
        });

        const toggle = document.getElementById('authToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.setMode(this.mode === 'login' ? 'register' : 'login'));
        }

        const remembered = APP.retrieve('remembered_email');
        const emailInput = document.getElementById('email');
        if (remembered && emailInput) {
            emailInput.value = remembered;
            const remember = document.getElementById('rememberMe');
            if (remember) remember.checked = true;
        }
    },

    setMode(mode) {
        this.mode = mode;
        const isRegister = mode === 'register';
        document.getElementById('authTitle').textContent = isRegister ? 'Create account' : 'Welcome back';
        document.getElementById('authSubtitle').textContent = isRegister
            ? 'Register to save your appointments on the server.'
            : 'Log in to book your next beauty appointment.';
        document.getElementById('authSubmit').textContent = isRegister ? 'Register' : 'Login';
        document.getElementById('authToggle').textContent = isRegister
            ? 'Already have an account? Login'
            : 'Need an account? Register';

        const nameInput = document.getElementById('name');
        const nameLabel = document.getElementById('nameLabel');
        nameInput.hidden = !isRegister;
        nameLabel.hidden = !isRegister;
        nameInput.required = isRegister;
        this.showMessage('');
    },

    showMessage(text, type) {
        const el = document.getElementById('authMessage');
        if (!el) return;
        if (!text) {
            el.hidden = true;
            el.textContent = '';
            return;
        }
        el.hidden = false;
        el.textContent = text;
        el.style.color = type === 'error' ? '#8b1e1e' : '#1d6a3a';
    },

    async submit() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value.trim();
        const remember = document.getElementById('rememberMe');
        const button = document.getElementById('authSubmit');

        this.showMessage('');
        button.disabled = true;
        const original = button.textContent;
        button.textContent = this.mode === 'register' ? 'Creating account...' : 'Logging in...';

        try {
            const path = this.mode === 'register' ? '/api/auth/register' : '/api/auth/login';
            const result = await APP.request(APP.apiUrl(path), {
                method: 'POST',
                body: { email, password, name: name || email.split('@')[0] }
            });

            APP.setSession(result.token, result.user);
            if (remember && remember.checked) {
                APP.store('remembered_email', email);
            } else {
                APP.remove('remembered_email');
            }

            this.showMessage('Success! Redirecting...', 'success');
            window.location.href = '../index files/index.html';
        } catch (error) {
            this.showMessage(error.message || 'Could not reach the server. Start it with npm start in backend/.', 'error');
            button.disabled = false;
            button.textContent = original;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => LoginPage.init());

