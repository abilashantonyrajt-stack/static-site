if (!document.querySelector('script[data-shared-script]')) {
  const sharedScript = document.createElement('script');
  sharedScript.src = '../../../index.js';
  sharedScript.dataset.sharedScript = 'true';
  document.head.appendChild(sharedScript);
}
document.body.dataset.page = 'logout';

document.addEventListener('DOMContentLoaded', () => {
    if (window.APP && APP.clearSession) {
        APP.clearSession();
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user_session');
    }
    const main = document.querySelector('main') || document.body;
    const note = document.createElement('p');
    note.textContent = 'You have been logged out. Redirecting...';
    main.appendChild(note);
    setTimeout(() => {
        window.location.href = '../../../login/login.html';
    }, 800);
});

