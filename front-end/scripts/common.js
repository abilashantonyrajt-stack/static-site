/* ============================================
   COMMON/SHARED JAVASCRIPT FUNCTIONS
   ============================================ */

/**
 * Utility object for common functions
 */
const APP = {
    /**
     * Initialize application
     */
    init() {
        this.setupEventListeners();
        console.log('✓ Application initialized');
    },

    /**
     * Setup common event listeners
     */
    setupEventListeners() {
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-content').forEach(el => {
                    el.style.display = 'none';
                });
            }
        });

        // Handle page transitions
        document.addEventListener('DOMContentLoaded', () => {
            this.setupPageTransitions();
        });
    },

    /**
     * Setup smooth page transitions
     */
    setupPageTransitions() {
        const page = document.querySelector('.page-content');
        if (page) {
            page.classList.add('fade-in');
        }
    },

    /**
     * Show notification
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', 'info'
     */
    notify(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('notification--show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('notification--show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * Format date
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Format time
     * @param {string} time - Time in HH:MM format
     * @returns {string} Formatted time
     */
    formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    },

    /**
     * Check if element is in viewport
     * @param {Element} element - Element to check
     * @returns {boolean}
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Scroll to element
     * @param {string|Element} target - Selector or element
     * @param {number} offset - Offset from top
     */
    scrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const topPosition = element.offsetTop - offset;
        window.scrollTo({
            top: topPosition,
            behavior: 'smooth'
        });
    },

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in ms
     * @returns {Function}
     */
    debounce(func, delay = 300) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function}
     */
    throttle(func, limit = 100) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Store data in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    store(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    /**
     * Retrieve data from localStorage
     * @param {string} key - Storage key
     * @returns {*} Retrieved value
     */
    retrieve(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error('Retrieve error:', e);
            return null;
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Remove error:', e);
            return false;
        }
    },

    /**
     * Make API request
     * @param {string} url - API endpoint
     * @param {object} options - Fetch options
     * @returns {Promise}
     */
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    APP.init();
});

console.log('✓ Common scripts loaded');
