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
  const query = document.getElementById("searchInput").value.toLowerCase();

  if (query.includes("hair") && !query.includes("treatment")) {
    window.location.href = "./navigation/menu/hairstyling/HairStyling.html";
  }
  else if (query.includes("treatment")) {
    window.location.href = "./navigation/menu/hairtreatment/HairTreatment.html";
  }
  else if (query.includes("manicure")) {
    window.location.href = "./navigation/menu/manicure/Manicure.html";
  }
  else if (query.includes("pedicure")) {
    window.location.href = "./navigation/menu/pedicure/Pedicure.html";
  }
  else if (query.includes("spa")) {
    window.location.href = "./navigation/menu/spa/Spa.html";
  }
  else if (query.includes("facial")) {
    window.location.href = "./navigation/menu/facial/facial.html";
  }
  else {
    window.alert("result not found for: " + query);
  }
}

// Layout Injection Logic
document.addEventListener("DOMContentLoaded", function() {
    // Determine the base path based on the current script src
    const scripts = document.getElementsByTagName('script');
    let basePath = './';
    for (let script of scripts) {
        if (script.src.includes('index.js')) {
            const parts = script.getAttribute('src').split('/');
            parts.pop(); // remove 'index.js'
            if(parts.length > 0 && parts[0] !== '') {
                basePath = parts.join('/') + '/';
            } else if (parts.length === 0) {
                basePath = './';
            } else {
                basePath = '';
            }
            break;
        }
    }

    const headerHTML = `
    <header class="site-header">
      <a class="brand" href="${basePath}index.html">DA<sup>2</sup> Beauty Paradise</a>
      <nav class="header-actions" aria-label="Main navigation">
        <div class="dropdown">
          <button class="dropbtn button button--light" onclick="toggleDropdown('menuDropdown')">Menu</button>
          <div id="menuDropdown" class="dropdown-content">
            <a href="${basePath}navigation/menu/hairstyling/HairStyling.html">Hair Styling</a>
            <a href="${basePath}navigation/menu/hairtreatment/HairTreatment.html">Hair Treatment</a>
            <a href="${basePath}navigation/menu/pedicure/Pedicure.html">Pedicure</a>
            <a href="${basePath}navigation/menu/manicure/Manicure.html">Manicure</a>
            <a href="${basePath}navigation/menu/spa/Spa.html">Spa</a>
          </div>
        </div>
        <div class="dropdown">
          <button class="dropbtn button button--light" onclick="toggleDropdown('profileDropdown')">Profile</button>
          <div id="profileDropdown" class="dropdown-content">
            <a href="${basePath}navigation/profile/picture/picture.html">Picture</a>
            <a href="${basePath}navigation/profile/username/username.html">Username</a>
            <a href="${basePath}navigation/profile/mail-info/mailinfo.html">Profile Information</a>
            <a href="${basePath}navigation/profile/appointments/appointments.html">Appointments</a>
            <a href="${basePath}navigation/profile/notifications/notifications.html">Notifications</a>
            <a href="${basePath}navigation/profile/cuppon-code/cupponcode.html">Coupon Code</a>
            <a href="${basePath}navigation/profile/refer-a-friend/referAfriend.html">refer-a-friend</a>
            <a href="${basePath}navigation/profile/logout/logout.html">Logout</a>
          </div>
        </div>
      </nav>
    </header>`;

    const footerHTML = `
    <hr>
    <footer class="site-footer">
      <div>Social media links</div>
      <div>Contact information</div>
      <div>Copyright information</div>
      <div>Privacy policy</div>
      <div>Terms of service</div>
      <div>FAQ</div>
      <div>Newsletter subscription</div>
      <div>Site map</div>
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
