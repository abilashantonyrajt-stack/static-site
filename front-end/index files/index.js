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

  if (query.includes("hair")) {
    window.location.href = "./navigation/Menu/HairStyling.html";
  }
  else if (query.includes("treatment")) {
    window.location.href = "./navigation/Menu/HairTreatment.html";
  }
  else if (query.includes("manicure")) {
    window.location.href = "./navigation/Menu/Manicure.html";
  }
  else if (query.includes("pedicure")) {
    window.location.href = "./navigation/Menu/Pedicure.html";
  }
  else if (query.includes("spa")) {
    window.location.href = "./navigation/Menu/Spa.html";
  }
  else if (query.includes("facial")) {
    window.location.href = "./navigation/Menu/Facial.html";
  }
  else {
    window.alert("result not found for: " + query);
  }
}
