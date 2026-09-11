/* ============================================
   NAVIGATION PAGE JAVASCRIPT - TEMPLATE
   Used for navigation pages
   ============================================ */

/**
 * Navigation Page Module
 */
const NavPage = {
    /**
     * Initialize navigation page
     */
    init() {
        this.setupScrollAnimations();
        this.loadPageContent();
        console.log('✓ Navigation page initialized');
    },

    /**
     * Load page-specific content
     */
    loadPageContent() {
        const pageType = this.getPageType();
        console.log('Loading navigation page:', pageType);

        switch (pageType) {
            case 'about-us':
                this.loadAboutContent();
                break;
            case 'contact':
                this.loadContactContent();
                break;
            case 'wishlist':
                this.loadWishlistContent();
                break;
        }
    },

    /**
     * Get current page type
     * @returns {string} Page type
     */
    getPageType() {
        const pathname = window.location.pathname.toLowerCase();
        if (pathname.includes('about')) return 'about-us';
        if (pathname.includes('contact')) return 'contact';
        if (pathname.includes('wish')) return 'wishlist';
        return 'unknown';
    },

    /**
     * Setup scroll animations
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.content-block, .team-member, .value-card').forEach(el => {
            observer.observe(el);
        });
    },

    /**
     * Load about page content
     */
    loadAboutContent() {
        const aboutData = {
            mission: 'To provide world-class beauty and wellness services that enhance confidence and promote self-care.',
            vision: 'To be the leading salon and spa destination known for excellence and customer satisfaction.',
            values: ['Quality', 'Professionalism', 'Innovation', 'Customer Care']
        };

        console.log('About page data loaded:', aboutData);
    },

    /**
     * Load contact page content (if used in nav)
     */
    loadContactContent() {
        const contactData = {
            phone: '(555) 123-4567',
            email: 'info@salon.com',
            address: '123 Beauty Street, Fashion City, FC 12345'
        };

        console.log('Contact info loaded:', contactData);
    },

    /**
     * Load wishlist content
     */
    loadWishlistContent() {
        const favorites = APP.retrieve('favorites') || [];
        const wishlistContainer = document.querySelector('.wishlist-container');

        if (wishlistContainer) {
            if (favorites.length === 0) {
                wishlistContainer.innerHTML = '<p>Your wishlist is empty. Start adding your favorite services!</p>';
                return;
            }

            wishlistContainer.innerHTML = `
                <p>You have ${favorites.length} items in your wishlist</p>
                <div class="wishlist-grid">
                    ${favorites.map(service => `
                        <div class="wishlist-item">
                            <h3>${this.formatServiceName(service)}</h3>
                            <button class="button button-secondary" onclick="NavPage.removeFromWishlist('${service}')">
                                Remove from Wishlist
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },

    /**
     * Remove from wishlist
     * @param {string} service - Service to remove
     */
    removeFromWishlist(service) {
        const favorites = APP.retrieve('favorites') || [];
        const updated = favorites.filter(s => s !== service);
        APP.store('favorites', updated);
        APP.notify('Removed from wishlist', 'success');
        this.loadWishlistContent();
    },

    /**
     * Format service name
     * @param {string} service - Service name
     * @returns {string}
     */
    formatServiceName(service) {
        return service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    NavPage.init();
});

console.log('✓ Navigation page scripts loaded');
