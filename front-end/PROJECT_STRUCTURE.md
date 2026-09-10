# Project Structure Documentation

## Overview
Your project has been professionally reorganized with a clear separation of concerns:
- **Global Assets**: Shared styles and scripts
- **Pages**: Individual pages with dedicated CSS/JS
- **Services**: Service/menu pages
- **Profile**: User profile pages
- **Navigation**: Navigation/info pages

---

## New Folder Structure

```
front-end/
├── styles/                          # Global stylesheets
│   ├── variables.css               # CSS variables and design tokens
│   └── global.css                  # Base styles and utilities
│
├── scripts/                         # Global JavaScript
│   ├── common.js                   # Shared utilities and functions
│   └── header.js                   # Header and navigation functionality
│
├── pages/                           # Main pages
│   ├── home/
│   │   ├── index.html
│   │   ├── index.css
│   │   └── index.js
│   ├── login/
│   │   ├── login.html
│   │   ├── login.css
│   │   └── login.js
│   └── contact/
│       ├── contact.html
│       ├── contact.css
│       └── contact.js
│
├── services/                        # Service pages
│   ├── hair-styling/
│   │   ├── hair-styling.html
│   │   ├── hair-styling.css
│   │   └── hair-styling.js
│   ├── hair-treatment/
│   │   ├── hair-treatment.html
│   │   ├── hair-treatment.css
│   │   └── hair-treatment.js
│   ├── manicure/
│   ├── pedicure/
│   ├── spa/
│   └── facial/
│
├── profile/                         # Profile pages
│   ├── appointments/
│   │   ├── appointments.html       # (Existing - update paths)
│   │   ├── appointments.css        # (Existing - update paths)
│   │   └── appointments.js         # (Existing - update paths)
│   ├── picture/
│   │   ├── picture.html
│   │   ├── picture.css
│   │   └── picture.js
│   ├── username/
│   ├── mailinfo/
│   ├── notifications/
│   ├── cupponcode/
│   ├── referafriend/
│   ├── logout/
│   └── wishlist/
│
├── navigation/                      # Navigation pages
│   ├── about-us/
│   │   ├── about-us.html
│   │   ├── about-us.css
│   │   └── about-us.js
│   ├── contact/ (different from pages/contact)
│   │   ├── contact.html
│   │   ├── contact.css
│   │   └── contact.js
│   └── wishlist/ (alternative wishlist location)
│
├── components/                      # Reusable components
│   └── header/
│       ├── header.html             # (Optional - for sharing header code)
│       ├── header.css              # (Optional - header styling)
│       └── header.js               # (Optional - header functionality)
│
├── searchbar/                       # (Keep existing structure)
│   ├── Search_bar.HTML
│   └── items/
│       └── hair.html
│
├── assets/                          # (Create if needed)
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── index.html                       # (Can stay at root, or move to pages/home/)
├── style.css                        # (Deprecated - use styles/global.css instead)
├── index.js                         # (Deprecated - use scripts/common.js instead)
├── README.md
└── PROJECT_TEXTBOOK.txt
```

---

## How to Update HTML Files

### 1. Add Global Assets (to ALL HTML files)

```html
<!-- In the <head> section, replace old references with: -->
<link rel="stylesheet" href="../../styles/variables.css">
<link rel="stylesheet" href="../../styles/global.css">
<link rel="stylesheet" href="./[page-name].css">

<!-- Before closing </body> tag, add: -->
<script src="../../scripts/common.js"></script>
<script src="../../scripts/header.js"></script>
<script src="./[page-name].js"></script>
```

### 2. Update Relative Paths

**For pages/ directory** (depth: pages/home/):
```html
<!-- Navigate up 2 levels, then into other directories -->
<a href="../../services/hair-styling/hair-styling.html">Hair Styling</a>
<a href="../../profile/appointments/appointments.html">Appointments</a>
<a href="../../navigation/about-us/about-us.html">About Us</a>
```

**For services/ directory** (depth: services/hair-styling/):
```html
<a href="../../pages/home/index.html">Home</a>
<a href="../../pages/login/login.html">Login</a>
<a href="../../profile/appointments/appointments.html">Book Appointment</a>
```

**For profile/ directory** (depth: profile/appointments/):
```html
<a href="../../pages/home/index.html">Home</a>
<a href="../../services/hair-styling/hair-styling.html">Services</a>
<a href="../../navigation/about-us/about-us.html">About Us</a>
```

**For navigation/ directory** (depth: navigation/about-us/):
```html
<a href="../../pages/home/index.html">Home</a>
<a href="../../pages/contact/contact.html">Contact Us</a>
<a href="../../profile/picture/picture.html">My Profile</a>
```

### 3. Remove Old References

❌ **Remove these from ALL HTML files:**
```html
<link rel="stylesheet" href="style.css">        <!-- OLD - use global.css -->
<link rel="stylesheet" href="../style.css">    <!-- OLD - use global.css -->
<link rel="stylesheet" href="../../style.css"> <!-- OLD - use global.css -->
<script src="index.js"></script>               <!-- OLD - use common.js -->
<script src="../index.js"></script>            <!-- OLD - use common.js -->
<script src="../../index.js"></script>         <!-- OLD - use common.js -->
```

---

## CSS & JS Module Descriptions

### Global Styles (`styles/global.css`)
- Typography (h1-h6, p, a)
- Form elements (button, input, select)
- Button styles (.button, .button--dark, etc.)
- Layout utilities (.container, .flex, .grid)
- Utility classes (.mt-1, .mb-2, .p-3, etc.)
- Responsive breakpoints

### Global Scripts (`scripts/common.js`)
Contains the `APP` object with utilities:
- `APP.init()` - Initialize application
- `APP.notify(message, type)` - Show notifications
- `APP.formatDate(date)` - Format dates
- `APP.formatTime(time)` - Format times
- `APP.isInViewport(element)` - Check visibility
- `APP.scrollTo(target)` - Smooth scroll
- `APP.debounce(func, delay)` - Debounce function
- `APP.throttle(func, limit)` - Throttle function
- `APP.store(key, value)` - Save to localStorage
- `APP.retrieve(key)` - Get from localStorage
- `APP.remove(key)` - Delete from localStorage
- `APP.request(url, options)` - Make API requests

### Header Scripts (`scripts/header.js`)
Contains the `Header` object:
- `Header.init()` - Initialize header
- `Header.setupDropdowns()` - Handle dropdown menus
- `Header.toggleDropdown(dropdown)` - Toggle dropdown visibility
- `Header.closeAllDropdowns()` - Close all open dropdowns
- `Header.setupSearch()` - Setup search functionality
- `Header.performSearch()` - Execute search
- `Header.handleSearch(query)` - Route to appropriate page

### Page-Specific Modules
Each page has its own module:
- **HomePage** (pages/home/index.js)
- **LoginPage** (pages/login/login.js)
- **ContactPage** (pages/contact/contact.js)
- **ServicePage** (services/*/[name].js)
- **ProfilePage** (profile/*/[name].js)
- **NavPage** (navigation/*/[name].js)

---

## Variable Naming Conventions

### CSS Color Variables
```css
--ink: #6f180b;           /* Dark brown - primary text */
--muted: #e05c30;         /* Terracotta - accents */
--paper: #e9d1bd;         /* Light beige - backgrounds */
--cream: #bd763f;         /* Warm brown - secondary text */
--peach: #a95f3b;         /* Muted terracotta - hover states */
```

### CSS Spacing Variables
```css
--padding: 10px;          /* Base padding unit */
--margin: 10px;           /* Base margin unit */
--gap: 16px;             /* Grid/flex gap (responsive) */
```

### CSS Size Variables
```css
--radius-sm: 8px;         /* Small border-radius */
--radius-md: 12px;        /* Medium border-radius */
--radius-lg: 20px;        /* Large border-radius */
--radius-full: 100px;     /* Fully rounded (pills) */
```

---

## localStorage Keys Reference

When storing user data, use these standardized keys:

```javascript
// User & Auth
APP.store('user_session', { email, loginTime })
APP.store('remembered_email', 'user@example.com')

// Profile
APP.store('profile_picture', 'data:image/...')
APP.store('username', 'john_doe')

// Appointments
APP.store('appointments', [{ id, service, date, time, ... }])
APP.store('selected_service', 'hair-styling')

// Preferences
APP.store('favorites', ['hair-styling', 'spa'])
APP.store('notifications', [{ title, message, date }])
APP.store('cuppons', [{ code, discount, service, expires }])

// Forms
APP.store('contact_messages', [{ name, email, subject, message, timestamp }])
```

---

## File Naming Conventions

- **HTML Files**: Use kebab-case or match folder name
  - `/pages/home/index.html`
  - `/services/hair-styling/hair-styling.html`
  - `/profile/about-us/about-us.html`

- **CSS Files**: Match HTML filename
  - `/pages/home/index.css`
  - `/services/hair-styling/hair-styling.css`

- **JS Files**: Match HTML filename (or slightly more descriptive)
  - `/pages/home/index.js`
  - `/services/hair-styling/hair-styling.js`

---

## Responsive Design Breakpoints

Used consistently across all CSS files:

```css
/* Tablet and below */
@media (max-width: 768px) { }

/* Mobile and below */
@media (max-width: 480px) { }

/* Optional: Large desktop */
@media (min-width: 1440px) { }
```

---

## Getting Started with the New Structure

### Step 1: Move Existing Files
1. Move `front-end/index.html` → `front-end/pages/home/index.html`
2. Move `front-end/login.html` → `front-end/pages/login/login.html`
3. Move `front-end/Contact.html` → `front-end/pages/contact/contact.html`
4. Move existing service HTML files → `front-end/services/[service]/[service].html`
5. Move existing profile HTML files → `front-end/profile/[profile]/[profile].html`
6. Move existing navigation HTML files → `front-end/navigation/[nav]/[nav].html`

### Step 2: Update HTML Links
For each HTML file:
1. Remove old `<link rel="stylesheet" href="style.css">`
2. Remove old `<script src="index.js"></script>`
3. Add new global CSS/JS imports (see section above)
4. Update all internal links to use new paths

### Step 3: Verify Navigation
1. Test dropdown menus work
2. Test internal links navigate correctly
3. Test search functionality

### Step 4: Optional - Migrate Old Files
1. Keep old `style.css` for now as backup
2. Keep old `index.js` for now as backup
3. Delete after confirming everything works

---

## Best Practices

1. **Always import global CSS first**, then page-specific CSS
2. **Always load common.js before page-specific JS**
3. **Use APP utilities** for localStorage and notifications
4. **Use CSS variables** instead of hardcoded colors
5. **Test at breakpoints** (768px and 480px) before deployment
6. **Use semantic HTML** (header, main, section, article, etc.)
7. **Keep form validation logic** in page-specific JS modules

---

## Troubleshooting

### Styles not loading?
1. Check relative paths are correct
2. Verify `styles/variables.css` is imported before `global.css`
3. Check browser console for 404 errors

### Scripts not running?
1. Check console for JavaScript errors
2. Verify `common.js` loads before page-specific JS
3. Check `APP` object exists: `console.log(APP)`

### Navigation not working?
1. Verify all link `href` attributes use correct relative paths
2. Check that path depth matches folder nesting
3. Test links manually

### localStorage not persisting?
1. Check browser allows localStorage
2. Verify you're using `APP.store()` and `APP.retrieve()`
3. Inspect using browser DevTools > Application > LocalStorage

---

## Quick Reference: Path Examples

### From pages/home/index.html
```html
<!-- Go UP 2 levels (to front-end/) then navigate -->
<a href="../../services/hair-styling/hair-styling.html">Hair Styling</a>
<a href="../../profile/appointments/appointments.html">Book Now</a>
<a href="../../navigation/about-us/about-us.html">About</a>
```

### From services/hair-styling/hair-styling.html
```html
<!-- Go UP 2 levels (to front-end/) then navigate -->
<a href="../../pages/home/index.html">Home</a>
<a href="../../profile/appointments/appointments.html">Book</a>
<a href="../../scripts/header.js">Header JS</a>
```

### From profile/appointments/appointments.html
```html
<!-- Go UP 3 levels (to front-end/) then navigate -->
<a href="../../../pages/home/index.html">Home</a>
<a href="../../../services/hair-styling/hair-styling.html">Services</a>
```

---

## Notes for Development

- All files have been created with starter content
- Page-specific modules are ready to extend
- Global utilities are documented in comments
- CSS is mobile-first with progressive enhancement
- All pages are responsive at 768px and 480px breakpoints
- Use `App.notify()` for user feedback instead of `alert()`

---

Generated: Project Organization v1.0
