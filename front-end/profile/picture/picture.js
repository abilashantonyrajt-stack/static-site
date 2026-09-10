/* ============================================
   PROFILE PAGE JAVASCRIPT - TEMPLATE
   Used for profile pages
   ============================================ */

/**
 * Profile Page Module
 */
const ProfilePage = {
    /**
     * Initialize profile page
     */
    init() {
        this.checkUserSession();
        this.setupFormHandlers();
        this.loadPageContent();
        console.log('✓ Profile page initialized');
    },

    /**
     * Check if user is logged in
     */
    checkUserSession() {
        const userSession = APP.retrieve('user_session');
        if (!userSession) {
            APP.notify('Please log in first', 'info');
            setTimeout(() => {
                window.location.href = '../login/login.html';
            }, 1500);
        }
    },

    /**
     * Load page-specific content
     */
    loadPageContent() {
        const pageType = this.getPageType();
        console.log('Loading profile page:', pageType);

        switch (pageType) {
            case 'picture':
                this.loadPictureContent();
                break;
            case 'username':
                this.loadUsernameContent();
                break;
            case 'mailinfo':
                this.loadMailInfoContent();
                break;
            case 'notifications':
                this.loadNotificationsContent();
                break;
            case 'cupponcode':
                this.loadCupponCodeContent();
                break;
            case 'referafriend':
                this.loadReferAFriendContent();
                break;
            case 'logout':
                this.handleLogout();
                break;
            case 'wishlist':
                this.loadWishlistContent();
                break;
            default:
                console.log('Unknown profile page');
        }
    },

    /**
     * Get current page type
     * @returns {string} Page type
     */
    getPageType() {
        const pathname = window.location.pathname.toLowerCase();
        if (pathname.includes('picture')) return 'picture';
        if (pathname.includes('username')) return 'username';
        if (pathname.includes('mailinfo')) return 'mailinfo';
        if (pathname.includes('notifications')) return 'notifications';
        if (pathname.includes('cuppon')) return 'cupponcode';
        if (pathname.includes('refer')) return 'referafriend';
        if (pathname.includes('logout')) return 'logout';
        if (pathname.includes('wish')) return 'wishlist';
        return 'unknown';
    },

    /**
     * Setup form handlers
     */
    setupFormHandlers() {
        const forms = document.querySelectorAll('.profile-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });
    },

    /**
     * Handle form submission
     * @param {Element} form - Form element
     */
    handleFormSubmit(form) {
        const button = form.querySelector('button');
        button.disabled = true;
        button.textContent = 'Saving...';

        // Simulate save
        setTimeout(() => {
            this.showMessage('Changes saved successfully!', 'success');
            button.disabled = false;
            button.textContent = 'Save Changes';
        }, 1000);
    },

    /**
     * Load picture profile content
     */
    loadPictureContent() {
        const profilePic = APP.retrieve('profile_picture');
        if (profilePic) {
            const imgElement = document.querySelector('.profile-picture-preview');
            if (imgElement) {
                imgElement.src = profilePic;
            }
        }
    },

    /**
     * Load username content
     */
    loadUsernameContent() {
        const username = APP.retrieve('username');
        const usernameInput = document.querySelector('input[name="username"]');
        if (username && usernameInput) {
            usernameInput.value = username;
        }
    },

    /**
     * Load mail info content
     */
    loadMailInfoContent() {
        const userSession = APP.retrieve('user_session');
        const emailInput = document.querySelector('input[type="email"]');
        if (userSession && emailInput) {
            emailInput.value = userSession.email;
        }
    },

    /**
     * Load notifications content
     */
    loadNotificationsContent() {
        const notifications = APP.retrieve('notifications') || [];
        const notificationsList = document.querySelector('.notifications-list');

        if (notificationsList) {
            if (notifications.length === 0) {
                notificationsList.innerHTML = '<p>No notifications</p>';
                return;
            }

            notificationsList.innerHTML = notifications.map(notif => `
                <div class="list-item">
                    <div class="list-item-content">
                        <h3>${notif.title}</h3>
                        <p>${notif.message}</p>
                        <small>${notif.date}</small>
                    </div>
                </div>
            `).join('');
        }
    },

    /**
     * Load cuppon code content
     */
    loadCupponCodeContent() {
        const cuppons = APP.retrieve('cuppons') || [];
        const cupponsList = document.querySelector('.cuppons-list');

        if (cupponsList) {
            if (cuppons.length === 0) {
                cupponsList.innerHTML = '<p>No active coupons</p>';
                return;
            }

            cupponsList.innerHTML = cuppons.map(cuppon => `
                <div class="list-item">
                    <div class="list-item-content">
                        <h3>${cuppon.code}</h3>
                        <p>${cuppon.discount}% off on ${cuppon.service}</p>
                        <small>Expires: ${cuppon.expires}</small>
                    </div>
                    <div class="list-item-action">
                        <button class="button button-secondary">Copy Code</button>
                    </div>
                </div>
            `).join('');
        }
    },

    /**
     * Load refer a friend content
     */
    loadReferAFriendContent() {
        const userSession = APP.retrieve('user_session');
        const referralLink = `${window.location.origin}/register?ref=${userSession.id || 'user'}`;
        const linkInput = document.querySelector('.referral-link');
        if (linkInput) {
            linkInput.value = referralLink;
        }
    },

    /**
     * Load wishlist content
     */
    loadWishlistContent() {
        const favorites = APP.retrieve('favorites') || [];
        const wishlistContainer = document.querySelector('.wishlist-container');

        if (wishlistContainer) {
            if (favorites.length === 0) {
                wishlistContainer.innerHTML = '<p>Your wishlist is empty</p>';
                return;
            }

            wishlistContainer.innerHTML = favorites.map(service => `
                <div class="list-item">
                    <div class="list-item-content">
                        <h3>${this.formatServiceName(service)}</h3>
                        <p>Added to your favorites</p>
                    </div>
                    <div class="list-item-action">
                        <button class="button button-secondary" onclick="ProfilePage.removeFromWishlist('${service}')">Remove</button>
                    </div>
                </div>
            `).join('');
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
        this.loadWishlistContent();
        this.showMessage('Removed from wishlist', 'success');
    },

    /**
     * Handle logout
     */
    handleLogout() {
        const confirmButton = document.querySelector('.confirm-logout');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                APP.remove('user_session');
                APP.notify('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = '../../pages/home/index.html';
                }, 1500);
            });
        }
    },

    /**
     * Format service name
     * @param {string} service - Service name
     * @returns {string}
     */
    formatServiceName(service) {
        return service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },

    /**
     * Show message
     * @param {string} message - Message text
     * @param {string} type - 'success', 'error', 'info'
     */
    showMessage(message, type = 'info') {
        const messageDiv = document.querySelector('.message') || document.createElement('div');
        if (!messageDiv.parentElement) {
            const container = document.querySelector('.profile-container');
            if (container) {
                container.insertBefore(messageDiv, container.firstChild);
            }
        }

        messageDiv.className = `message ${type} show`;
        messageDiv.textContent = message;

        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 3000);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ProfilePage.init();
});

console.log('✓ Profile page scripts loaded');
