/* ============================================
   HEADER & NAVIGATION FUNCTIONALITY
   ============================================ */

/**
 * Header functionality
 */
const Header = {
    /**
     * Initialize header
     */
    init() {
        this.setupDropdowns();
        this.setupSearch();
        console.log('✓ Header initialized');
    },

    /**
     * Setup dropdown menus
     */
    setupDropdowns() {
        const dropdownButtons = document.querySelectorAll('.dropbtn');

        dropdownButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = button.nextElementSibling;
                if (dropdown && dropdown.classList.contains('dropdown-content')) {
                    this.toggleDropdown(dropdown);
                }
            });
        });
    },

    /**
     * Toggle dropdown menu
     * @param {Element} dropdown - Dropdown element
     */
    toggleDropdown(dropdown) {
        // Close all other dropdowns
        document.querySelectorAll('.dropdown-content').forEach(el => {
            if (el !== dropdown) {
                el.style.display = 'none';
            }
        });

        // Toggle current dropdown
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    },

    /**
     * Close all dropdowns
     */
    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-content').forEach(el => {
            el.style.display = 'none';
        });
    },

    /**
     * Setup search functionality
     */
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('buttonsearch');

        if (!searchButton) return;

        searchButton.addEventListener('click', () => this.performSearch());

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
    },

    /**
     * Perform search
     */
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const query = searchInput.value.toLowerCase().trim();

        if (!query) {
            APP.notify('Please enter a search term', 'info');
            return;
        }

        this.handleSearch(query);
    },

    /**
     * Handle search based on query - uses absolute paths so it works from any page depth
     * @param {string} query - Search query
     */
    handleSearch(query) {
        const q = query.toLowerCase().trim();
        if (!q) { APP.notify('Please enter a search term','info'); return; }
        // Match like index.js find() - order matters: treatment before hair
        if (q.includes('treatment')) {
            window.location.href = '/navigation/menu/hairtreatment/HairTreatment.html';
            return;
        }
        if (q.includes('hair')) {
            window.location.href = '/navigation/menu/hairstyling/HairStyling.html';
            return;
        }
        if (q.includes('manicure')) {
            window.location.href = '/navigation/menu/manicure/Manicure.html';
            return;
        }
        if (q.includes('pedicure')) {
            window.location.href = '/navigation/menu/pedicure/Pedicure.html';
            return;
        }
        if (q.includes('spa')) {
            window.location.href = '/navigation/menu/spa/Spa.html';
            return;
        }
        if (q.includes('facial') || q.includes('face')) {
            window.location.href = '/navigation/menu/facial/facial.html';
            return;
        }
        APP.notify(`No services found for "${query}"`, 'error');
    }
};

// Initialize header when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Header.init();
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        Header.closeAllDropdowns();
    }
});

console.log('✓ Header scripts loaded');
