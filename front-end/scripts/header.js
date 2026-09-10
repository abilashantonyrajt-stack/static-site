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
     * Handle search based on query
     * @param {string} query - Search query
     */
    handleSearch(query) {
        const searchMap = {
            'hair styling': './services/hair-styling/hair-styling.html',
            'hair treatment': './services/hair-treatment/hair-treatment.html',
            'manicure': './services/manicure/manicure.html',
            'pedicure': './services/pedicure/pedicure.html',
            'spa': './services/spa/spa.html',
            'facial': './services/facial/facial.html'
        };

        for (const [keyword, path] of Object.entries(searchMap)) {
            if (query.includes(keyword.toLowerCase())) {
                window.location.href = path;
                return;
            }
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
