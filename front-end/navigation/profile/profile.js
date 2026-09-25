// Profile — proper like p&p AuthContext, shows real user from /api/auth/me, protects route
if (!document.querySelector('script[data-shared-script]')) {
  const s = document.createElement('script');
  s.src = '/index.js';
  s.dataset.sharedScript = 'true';
  document.head.appendChild(s);
}
document.body.dataset.page = 'profile';

async function loadProfile() {
  const token = APP.getToken();
  if (!token) {
    window.location.href = '/login';
    return;
  }
  try {
    const { user } = await APP.request(APP.apiUrl('/api/auth/me'));
    document.getElementById('profileName').textContent = user.name || '—';
    document.getElementById('profileEmail').textContent = user.email || '—';
    document.getElementById('avatar').textContent = (user.name || user.email || 'D').trim().charAt(0).toUpperCase();
    // stats
    try {
      const apts = await APP.request(APP.apiUrl('/api/appointments'));
      document.getElementById('statAppointments').textContent = String(apts.length);
      const upcoming = apts.filter(a => a.status === 'upcoming').length;
      document.getElementById('profileMeta').textContent = `${upcoming} upcoming • ${apts.length} total`;
    } catch {
      document.getElementById('statAppointments').textContent = '—';
    }
  } catch (e) {
    document.getElementById('profileMsg').hidden = false;
    document.getElementById('profileMsg').textContent = e.message || 'Please sign in again';
    document.getElementById('profileMsg').style.color = '#8b1e1e';
    setTimeout(() => window.location.href = '/login', 1200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  const btn = document.getElementById('signOutBtn');
  if (btn) btn.addEventListener('click', () => {
    APP.clearSession();
    window.location.href = '/login';
  });
});
