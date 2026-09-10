/* ============================================
   SERVICE PAGE JAVASCRIPT - TEMPLATE
   Used for all service pages
   ============================================ */

/**
 * Service Page Module
 */
const ServicePage = {
    /**
     * Initialize service page
     */
    init() {
        this.setupScrollAnimations();
        this.setupBookButton();
        this.loadServiceData();
        console.log('✓ Service page initialized');
    },

    /**
     * Load service-specific data
     */
    loadServiceData() {
        const serviceType = this.getServiceType();
        console.log('Loading service:', serviceType);
    },

    /**
     * Get service type from URL or page element
     * @returns {string} Service type
     */
    getServiceType() {
        const pathname = window.location.pathname;
        if (pathname.includes('hair-styling')) return 'hair-styling';
        if (pathname.includes('hair-treatment')) return 'hair-treatment';
        if (pathname.includes('manicure')) return 'manicure';
        if (pathname.includes('pedicure')) return 'pedicure';
        if (pathname.includes('spa')) return 'spa';
        if (pathname.includes('facial')) return 'facial';
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

        document.querySelectorAll('.benefit-card, .testimonial-card, .pricing-card').forEach(el => {
            observer.observe(el);
        });
    },

    /**
     * Setup book appointment button
     */
    setupBookButton() {
        const buttons = document.querySelectorAll('[class*="button"]');
        buttons.forEach(button => {
            if (button.textContent.toLowerCase().includes('book')) {
                button.addEventListener('click', () => {
                    this.handleBooking();
                });
            }
        });
    },

    /**
     * Handle booking button click
     */
    handleBooking() {
        const serviceType = this.getServiceType();
        
        // Check if user is logged in
        const userSession = APP.retrieve('user_session');
        if (!userSession) {
            APP.notify('Please log in to book an appointment', 'info');
            setTimeout(() => {
                window.location.href = '../login/login.html';
            }, 1500);
            return;
        }

        // Store selected service for appointments page
        APP.store('selected_service', serviceType);

        // Redirect to appointments
        APP.notify('Redirecting to appointment booking...', 'success');
        setTimeout(() => {
            window.location.href = '../../profile/appointments/appointments.html';
        }, 1000);
    },

    /**
     * Add to favorites
     */
    addToFavorites() {
        const serviceType = this.getServiceType();
        const favorites = APP.retrieve('favorites') || [];

        if (!favorites.includes(serviceType)) {
            favorites.push(serviceType);
            APP.store('favorites', favorites);
            APP.notify('Added to favorites!', 'success');
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ServicePage.init();
});

console.log('✓ Service page scripts loaded');
