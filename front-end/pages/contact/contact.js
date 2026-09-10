/* ============================================
   CONTACT PAGE JAVASCRIPT
   ============================================ */

/**
 * Contact Page Module
 */
const ContactPage = {
    /**
     * Initialize contact page
     */
    init() {
        this.setupFormHandlers();
        console.log('✓ Contact page initialized');
    },

    /**
     * Setup contact form handlers
     */
    setupFormHandlers() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Clear message on field change
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.clearMessage();
            });
        });
    },

    /**
     * Handle form submission
     */
    handleSubmit() {
        const form = document.querySelector('.contact-form');
        const nameInput = form.querySelector('input[name="name"]');
        const emailInput = form.querySelector('input[name="email"]');
        const phoneInput = form.querySelector('input[name="phone"]');
        const subjectInput = form.querySelector('input[name="subject"]');
        const messageInput = form.querySelector('textarea[name="message"]');
        const button = form.querySelector('.button');
        const messageDiv = form.querySelector('.form-message');

        // Validate form
        if (!this.validateForm(form)) {
            this.showMessage('Please fill in all required fields correctly', 'error');
            return;
        }

        // Show loading state
        button.classList.add('loading');
        button.disabled = true;
        button.textContent = 'Sending...';

        // Prepare contact data
        const contactData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            subject: subjectInput.value.trim(),
            message: messageInput.value.trim(),
            timestamp: new Date().toISOString()
        };

        // Simulate sending message
        setTimeout(() => {
            // Store message in localStorage
            const messages = APP.retrieve('contact_messages') || [];
            messages.push(contactData);
            APP.store('contact_messages', messages);

            // Reset form
            form.reset();

            // Show success message
            this.showMessage('Thank you! Your message has been sent successfully.', 'success');

            // Reset button
            button.classList.remove('loading');
            button.disabled = false;
            button.textContent = 'Send Message';

            // Log to console
            console.log('Message stored:', contactData);
        }, 1500);
    },

    /**
     * Validate form fields
     * @param {Element} form - Form element
     * @returns {boolean}
     */
    validateForm(form) {
        const nameInput = form.querySelector('input[name="name"]');
        const emailInput = form.querySelector('input[name="email"]');
        const phoneInput = form.querySelector('input[name="phone"]');
        const messageInput = form.querySelector('textarea[name="message"]');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || name.length < 2) {
            APP.notify('Please enter a valid name', 'error');
            return false;
        }

        if (!email || !this.isValidEmail(email)) {
            APP.notify('Please enter a valid email address', 'error');
            return false;
        }

        if (!phone || phone.length < 7) {
            APP.notify('Please enter a valid phone number', 'error');
            return false;
        }

        if (!message || message.length < 10) {
            APP.notify('Message must be at least 10 characters', 'error');
            return false;
        }

        return true;
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Show message in form
     * @param {string} message - Message text
     * @param {string} type - 'success' or 'error'
     */
    showMessage(message, type) {
        const form = document.querySelector('.contact-form');
        let messageDiv = form.querySelector('.form-message');

        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.className = 'form-message';
            form.insertBefore(messageDiv, form.firstChild);
        }

        messageDiv.textContent = message;
        messageDiv.className = `form-message ${type}`;

        // Auto-hide after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.className = 'form-message';
            }, 5000);
        }
    },

    /**
     * Clear message
     */
    clearMessage() {
        const messageDiv = document.querySelector('.contact-form .form-message');
        if (messageDiv) {
            messageDiv.className = 'form-message';
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ContactPage.init();
});

console.log('✓ Contact page scripts loaded');
