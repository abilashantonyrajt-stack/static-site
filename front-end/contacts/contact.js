document.body.dataset.page = 'contact';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.simple-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = (form.querySelector('#username, [name="username"], [name="name"]') || {}).value || '';
        const email = (form.querySelector('#email, [name="email"]') || {}).value || '';
        const message = (form.querySelector('#message, [name="message"]') || {}).value || '';
        const button = form.querySelector('[type="submit"], .button');

        if (button) button.disabled = true;
        try {
            await APP.request(APP.apiUrl('/api/contact'), {
                method: 'POST',
                body: { name: name.trim(), email: email.trim(), message: message.trim() }
            });
            form.reset();
            alert('Thank you! Your message has been sent.');
        } catch (error) {
            alert(error.message || 'Could not send message. Start the backend with npm start in backend/.');
        } finally {
            if (button) button.disabled = false;
        }
    });
});
