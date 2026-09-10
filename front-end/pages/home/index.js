/* ============================================
   HOME PAGE JAVASCRIPT
   ============================================ */

/**
 * Home Page Module
 */
const HomePage = {
    /**
     * Initialize home page
     */
    init() {
        this.setupScrollAnimations();
        this.setupServiceButtons();
        console.log('✓ Home page initialized');
    },

    /**
     * Setup scroll animations for elements
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

        document.querySelectorAll('.service-card, .testimonial-card').forEach(el => {
            observer.observe(el);
        });
    },

    /**
     * Setup service card click handlers
     */
    setupServiceButtons() {
        const serviceCards = document.querySelectorAll('.service-card');

        serviceCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.button')) return;
                // Optional: add animation or redirect
            });
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    HomePage.init();
});

console.log('✓ Home page scripts loaded');
