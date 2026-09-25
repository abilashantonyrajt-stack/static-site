if (!document.querySelector('script[data-shared-script]')) {
  const sharedScript = document.createElement('script');
  sharedScript.src = '../index.js';
  sharedScript.dataset.sharedScript = 'true';
  document.head.appendChild(sharedScript);
}
document.body.dataset.page = 'login';

const LoginPage = {
    mode: 'login',
    otpVerified: false,
    otpTimer: null,
    otpSeconds: 0,

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

        const sendBtn = document.getElementById('sendOtp');
        if (sendBtn) sendBtn.addEventListener('click', () => this.sendOtp());
        const verifyBtn = document.getElementById('verifyOtp');
        if (verifyBtn) verifyBtn.addEventListener('click', () => this.verifyOtp());
        const emailEl = document.getElementById('email');
        if (emailEl) emailEl.addEventListener('input', () => { this.otpVerified = false; this.updateOtpUi(); });

        const remembered = APP.retrieve('remembered_email');
        const emailInput = document.getElementById('email');
        if (remembered && emailInput) {
            emailInput.value = remembered;
            const remember = document.getElementById('rememberMe');
            if (remember) remember.checked = true;
        }
        this.updateOtpUi();
    },

    updateOtpUi() {
        const status = document.getElementById('otpStatus');
        const info = document.getElementById('otpInfo');
        const otpInput = document.getElementById('otp');
        const sendBtn = document.getElementById('sendOtp');
        if (!status || !info) return;
        if (this.otpVerified) {
            status.hidden = false;
            status.textContent = 'âœ“ Gmail verified';
            status.style.color = '#1d6a3a';
            if (otpInput) otpInput.style.borderColor = 'rgba(76,175,109,0.5)';
        } else if (this.otpSeconds > 0) {
            status.hidden = false;
            status.textContent = `Resend in ${this.otpSeconds}s`;
            status.style.color = 'var(--muted)';
        } else {
            // keep info visible if otp was sent
            if (info.hidden === false) {
                status.hidden = false;
                status.textContent = 'Enter 6-digit OTP from your Gmail';
                status.style.color = 'var(--muted)';
            } else {
                status.hidden = true;
            }
        }
        if (sendBtn) sendBtn.disabled = this.otpSeconds > 0;
    },

    startOtpTimer() {
        this.otpSeconds = 60;
        this.updateOtpUi();
        clearInterval(this.otpTimer);
        this.otpTimer = setInterval(() => {
            this.otpSeconds--;
            this.updateOtpUi();
            if (this.otpSeconds <= 0) clearInterval(this.otpTimer);
        }, 1000);
    },

    async sendOtp() {
        const email = document.getElementById('email').value.trim().toLowerCase();
        if (!email) { this.showMessage('Please enter your Gmail first', 'error'); return; }
        if (!email.endsWith('@gmail.com')) { this.showMessage('Only Gmail is allowed â€” please use @gmail.com', 'error'); return; }
        const btn = document.getElementById('sendOtp');
        const orig = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
        this.showMessage('');
        try {
            const res = await APP.request(APP.apiUrl('/api/auth/send-otp'), { method: 'POST', body: { email } });
            this.showMessage(res.message || 'OTP sent to your Gmail', 'success');
            document.getElementById('otpInfo').hidden = false;
            // In dev when SMTP not configured, backend returns otp for convenience
            if (res.otp) {
                console.log('DEV OTP:', res.otp);
                this.showMessage(`OTP sent! (dev: ${res.otp})`, 'success');
                document.getElementById('otp').value = res.otp;
            }
            this.otpVerified = false;
            this.startOtpTimer();
            this.updateOtpUi();
        } catch (e) {
            this.showMessage(e.message || 'Could not send OTP', 'error');
            if (btn) { btn.disabled = false; btn.textContent = orig; }
        }
    },

    async verifyOtp() {
        const email = document.getElementById('email').value.trim().toLowerCase();
        const otp = document.getElementById('otp').value.trim();
        if (!email.endsWith('@gmail.com')) { this.showMessage('Only Gmail is allowed', 'error'); return; }
        if (!/^\d{6}$/.test(otp)) { this.showMessage('OTP must be 6 digits', 'error'); return; }
        const btn = document.getElementById('verifyOtp');
        const orig = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }
        this.showMessage('');
        try {
            await APP.request(APP.apiUrl('/api/auth/verify-otp'), { method: 'POST', body: { email, otp } });
            this.otpVerified = true;
            this.showMessage('âœ“ Gmail verified â€” you can now continue', 'success');
            this.updateOtpUi();
        } catch (e) {
            this.otpVerified = false;
            this.showMessage(e.message || 'Invalid OTP', 'error');
            this.updateOtpUi();
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = orig; }
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
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value.trim();
        const remember = document.getElementById('rememberMe');
        const button = document.getElementById('authSubmit');

        if (!email.endsWith('@gmail.com')) {
            this.showMessage('Only Gmail is allowed â€” please use your @gmail.com address', 'error');
            return;
        }
        if (!this.otpVerified) {
            this.showMessage('Please verify your Gmail with OTP first (Send OTP â†’ Verify)', 'error');
            return;
        }
        const otpVal = document.getElementById('otp').value.trim();
        if (!/^\d{6}$/.test(otpVal)) {
            this.showMessage('Please enter the 6-digit OTP from your Gmail', 'error');
            return;
        }

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
            window.location.href = '/';
        } catch (error) {
            this.showMessage(error.message || 'Could not reach the server. Start it with npm start in backend/.', 'error');
            button.disabled = false;
            button.textContent = original;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => LoginPage.init());

