function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const isOpen = dropdown.style.display === "block";

  document.querySelectorAll(".dropdown-content").forEach((menu) => {
    menu.style.display = "none";
  });

  dropdown.style.display = isOpen ? "none" : "block";
}

window.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown-content").forEach((menu) => {
      menu.style.display = "none";
    });
  }
});


function find() {
  const qEl = document.getElementById("searchInput");
  const query = (qEl ? qEl.value : "").toLowerCase().trim();
  if (!query) { APP && APP.notify ? APP.notify('Please enter a search term','info') : alert('Please enter a search term'); return; }
  if (query.includes("hair") && !query.includes("treatment")) {
    window.location.href = "/navigation/menu/hairstyling/HairStyling.html";
  } else if (query.includes("treatment")) {
    window.location.href = "/navigation/menu/hairtreatment/HairTreatment.html";
  } else if (query.includes("manicure")) {
    window.location.href = "/navigation/menu/manicure/Manicure.html";
  } else if (query.includes("pedicure")) {
    window.location.href = "/navigation/menu/pedicure/Pedicure.html";
  } else if (query.includes("spa")) {
    window.location.href = "/navigation/menu/spa/Spa.html";
  } else if (query.includes("facial")) {
    window.location.href = "/navigation/menu/facial/facial.html";
  } else {
    (APP && APP.notify) ? APP.notify('No services found for "'+query+'"','error') : alert("result not found for: " + query);
  }
}

// Layout Injection Logic — use absolute paths so every page depth works (no fragile basePath)
document.addEventListener("DOMContentLoaded", function() {
    const headerHTML = `
    <header class="site-header">
      <a class="brand" href="/index.html">DA<sup>2</sup> Beauty Paradise</a>
      <nav class="header-actions" aria-label="Main navigation">
        <div class="dropdown">
          <button class="dropbtn button button--light" onclick="toggleDropdown('menuDropdown')">Services ▾</button>
          <div id="menuDropdown" class="dropdown-content">
            <a href="/navigation/menu/hairstyling/HairStyling.html">Hair Styling</a>
            <a href="/navigation/menu/hairtreatment/HairTreatment.html">Hair Treatment</a>
            <a href="/navigation/menu/pedicure/Pedicure.html">Pedicure</a>
            <a href="/navigation/menu/manicure/Manicure.html">Manicure</a>
            <a href="/navigation/menu/spa/Spa.html">Spa & Facial</a>
            <a href="/navigation/menu/facial/facial.html">Facial</a>
          </div>
        </div>
        <a class="button button--light" href="/login/login.html" style="padding:10px 18px; font-size:0.88rem">Sign in</a>
        <a class="button button--dark" href="/navigation/profile/appointments/appointments.html" style="padding:10px 18px; font-size:0.88rem">Book</a>
        <div class="dropdown">
          <button class="dropbtn button button--light" onclick="toggleDropdown('profileDropdown')" aria-label="Profile">☰</button>
          <div id="profileDropdown" class="dropdown-content">
            <a href="/navigation/profile/appointments/appointments.html">My Appointments</a>
            <a href="/navigation/profile/mail-info/mailinfo.html">Profile</a>
            <a href="/navigation/profile/notifications/notifications.html">Notifications</a>
            <a href="/login/login.html">Sign out</a>
          </div>
        </div>
      </nav>
    </header>`;

    const footerHTML = `
    <footer class="site-footer">
      <div>© 2026 DA² Beauty Paradise — Kothanur, Bengaluru</div>
      <div><a href="/navigation/About_Us.HTML" style="color:inherit; text-decoration:none; border-bottom:1px solid var(--gold-line)">About</a> · <a href="/contacts/contact.html" style="color:inherit; text-decoration:none; border-bottom:1px solid var(--gold-line)">Contact</a></div>
      <div style="opacity:0.7">By appointment • 09:00–18:00 • Private atelier</div>
    </footer>`;

    // Inject header at the top of the body
    if (!document.querySelector('.site-header')) {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }
    
    // Inject footer at the bottom of the body
    if (!document.querySelector('.site-footer')) {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
});
