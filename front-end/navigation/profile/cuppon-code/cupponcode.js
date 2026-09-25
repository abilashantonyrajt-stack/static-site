// Proper subpage - auth protected like p&p
if (!document.querySelector('script[data-shared-script]')) {
  const s = document.createElement('script');
  s.src = '/index.js';
  s.dataset.sharedScript = 'true';
  document.head.appendChild(s);
}
document.body.dataset.page = 'cuppon-code';
document.addEventListener('DOMContentLoaded', async () => {
  const token = window.APP && APP.getToken ? APP.getToken() : localStorage.getItem('token');
  if (!token) { window.location.href = '/login'; return; }
  try { await APP.request(APP.apiUrl('/api/auth/me')); } catch { window.location.href = '/login'; }
});
