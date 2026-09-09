# HTML File Update Guide

This guide shows exactly how to update each HTML file to work with the new organized structure.

## Universal Template (Use for ALL HTML files)

Copy this template for **every HTML file** in your project:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
    
    <!-- Global Styles -->
    <link rel="stylesheet" href="../../styles/variables.css">
    <link rel="stylesheet" href="../../styles/global.css">
    
    <!-- Page-Specific Styles (adjust filename) -->
    <link rel="stylesheet" href="./[page-name].css">
</head>
<body>
    <!-- Your HTML content here -->
    
    <!-- Global Scripts -->
    <script src="../../scripts/common.js"></script>
    <script src="../../scripts/header.js"></script>
    
    <!-- Page-Specific Script (adjust filename) -->
    <script src="./[page-name].js"></script>
</body>
</html>
```

---

## Path Adjustments by Location

### FILES IN `/pages/home/` 
Example: `pages/home/index.html`

**Relative depth: 2 levels up (`../../`)**

```html
<head>
    <link rel="stylesheet" href="../../styles/variables.css">
    <link rel="stylesheet" href="../../styles/global.css">
    <link rel="stylesheet" href="./index.css">
</head>
<body>
    <!-- ... content ... -->
    <script src="../../scripts/common.js"></script>
    <script src="../../scripts/header.js"></script>
    <script src="./index.js"></script>
</body>
```

**Navigation links from this file:**
```html
<a href="../../pages/login/login.html">Login</a>
<a href="../../services/hair-styling/hair-styling.html">Services</a>
<a href="../../profile/appointments/appointments.html">Appointments</a>
<a href="../../navigation/about-us/about-us.html">About Us</a>
```

---

### FILES IN `/pages/login/`
Example: `pages/login/login.html`

**Relative depth: 2 levels up (`../../`)**

```html
<head>
    <link rel="stylesheet" href="../../styles/variables.css">
    <link rel="stylesheet" href="../../styles/global.css">
    <link rel="stylesheet" href="./login.css">
</head>
<body>
    <!-- ... content ... -->
    <script src="../../scripts/common.js"></script>
    <script src="../../scripts/header.js"></script>
    <script src="./login.js"></script>
</body>
```

---

### FILES IN `/pages/contact/`
Example: `pages/contact/contact.html`

**Relative depth: 2 levels up (`../../`)**

```html
<head>
    <link rel="stylesheet" href="../../styles/variables.css">
    <link rel="stylesheet" href="../../styles/global.css">
    <link rel="stylesheet" href="./contact.css">
</head>
<body>
    <!-- ... content ... -->
    <script src="../../scripts/common.js"></script>
    <script src="../../scripts/header.js"></script>
    <script src="./contact.js"></script>
</body>
```

---

### FILES IN `/services/hair-styling/` (and all service folders)
Example: `services/hair-styling/hair-styling.html`

**Relative depth: 2 levels up (`../../`)**

```html
<head>
    <link rel="stylesheet" href="../../styles/variables.css">
    <link rel="stylesheet" href="../../styles/global.css">
    <link rel="stylesheet" href="./hair-styling.css">
</head>
<body>
    <!-- ... content ... -->
    <script src="../../scripts/common.js"></script>
    <script src="../../scripts/header.js"></script>
    <script src="./hair-styling.js"></script>
</body>
```

**Navigation from service pages:**
```html
<a href="../../pages/home/index.html">Home</a>
<a href="../../pages/login/login.html">Login</a>
<a href="../../profile/appointments/appointments.html">Book Appointment</a>
<a href="../../services/manicure/manicure.html">Other Service</a>
```

---

### FILES IN `/profile/appointments/`
Example: `profile/appointments/appointments.html`

**Relative depth: 2 levels up (`../../`)**

```html
<head>
    <link rel="stylesheet" href="../../styles/variables.css">
    <link rel="stylesheet" href="../../styles/global.css">
    <link rel="stylesheet" href="./appointments.css">
</head>
<body>
    <!-- ... content ... -->
    <script src="../../scripts/common.js"></script>
    <script src="../../scripts/header.js"></script>
    <script src="./appointments.js"></script>
</body>
```

---

### FILES IN `/profile/picture/` (and all other profile folders)
Example: `profile/picture/picture.html`

**Relative depth: 2 levels up (`../../`)**

```html
<head>
    <link rel="stylesheet" href="../../styles/variables.css">
    <link rel="stylesheet" href="../../styles/global.css">
    <link rel="stylesheet" href="./picture.css">
</head>
<body>
    <!-- ... content ... -->
    <script src="../../scripts/common.js"></script>
    <script src="../../scripts/header.js"></script>
    <script src="./picture.js"></script>
</body>
```

---

### FILES IN `/navigation/about-us/` (and all navigation folders)
Example: `navigation/about-us/about-us.html`

**Relative depth: 2 levels up (`../../`)**

```html
<head>
    <link rel="stylesheet" href="../../styles/variables.css">
    <link rel="stylesheet" href="../../styles/global.css">
    <link rel="stylesheet" href="./about-us.css">
</head>
<body>
    <!-- ... content ... -->
    <script src="../../scripts/common.js"></script>
    <script src="../../scripts/header.js"></script>
    <script src="./about-us.js"></script>
</body>
```

---

## Checklist for Each HTML File

- [ ] Remove old `<link rel="stylesheet" href="style.css">`
- [ ] Remove old `<link rel="stylesheet" href="../style.css">`
- [ ] Remove old `<link rel="stylesheet" href="../../style.css">`
- [ ] Remove old `<script src="index.js"></script>`
- [ ] Remove old `<script src="../index.js"></script>`
- [ ] Remove old `<script src="../../index.js"></script>`
- [ ] Add `<link rel="stylesheet" href="../../styles/variables.css">`
- [ ] Add `<link rel="stylesheet" href="../../styles/global.css">`
- [ ] Add page-specific CSS: `<link rel="stylesheet" href="./[page-name].css">`
- [ ] Add `<script src="../../scripts/common.js"></script>`
- [ ] Add `<script src="../../scripts/header.js"></script>`
- [ ] Add page-specific JS: `<script src="./[page-name].js"></script>`
- [ ] Update all internal navigation links to new paths
- [ ] Test page in browser
- [ ] Test dropdown menus
- [ ] Test internal links
- [ ] Test responsive design (resize to 768px and 480px)

---

## Critical Details

### The `../../` Path Prefix
- `../../` means "go up 2 directory levels"
- This works for ALL files because they're ALL 2 levels deep
  - `pages/home/` = 2 levels
  - `services/hair-styling/` = 2 levels
  - `profile/appointments/` = 2 levels
  - `navigation/about-us/` = 2 levels

### Why This Structure Works
```
front-end/                          ← Level 0 (origin)
  ├── styles/                       ← Level 1
  ├── scripts/                      ← Level 1
  ├── pages/
  │   └── home/
  │       └── index.html            ← Level 2
  ├── services/
  │   └── hair-styling/
  │       └── hair-styling.html     ← Level 2
  ├── profile/
  │   └── appointments/
  │       └── appointments.html     ← Level 2
  └── navigation/
      └── about-us/
          └── about-us.html         ← Level 2
```

Every HTML file is exactly 2 levels deep, so:
- `../../styles/` always finds the styles folder
- `../../scripts/` always finds the scripts folder
- `./filename.css` always finds the page-specific CSS in the same folder

---

## Real-World Example: Login Page Update

### BEFORE (Old Structure)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Login</h1>
    <a href="index.html">Home</a>
    <script src="index.js"></script>
</body>
</html>
```

### AFTER (New Structure)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    
    <!-- Global Styles -->
    <link rel="stylesheet" href="../../styles/variables.css">
    <link rel="stylesheet" href="../../styles/global.css">
    
    <!-- Page-Specific Styles -->
    <link rel="stylesheet" href="./login.css">
</head>
<body>
    <h1>Login</h1>
    <a href="../../pages/home/index.html">Home</a>
    
    <!-- Global Scripts -->
    <script src="../../scripts/common.js"></script>
    <script src="../../scripts/header.js"></script>
    
    <!-- Page-Specific Script -->
    <script src="./login.js"></script>
</body>
</html>
```

---

## Optional: Create a Macro (for Text Editors)

If you use VS Code, you can create a snippet for quick insertion:

1. File → Preferences → User Snippets
2. Select `html.json`
3. Add this snippet:

```json
"New Page Template": {
    "prefix": "newpage",
    "body": [
        "<!DOCTYPE html>",
        "<html lang=\"en\">",
        "<head>",
        "    <meta charset=\"UTF-8\">",
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
        "    <title>${1:Page Title}</title>",
        "    ",
        "    <link rel=\"stylesheet\" href=\"../../styles/variables.css\">",
        "    <link rel=\"stylesheet\" href=\"../../styles/global.css\">",
        "    <link rel=\"stylesheet\" href=\"./[page-name].css\">",
        "</head>",
        "<body>",
        "    ${2:<!-- Content here -->}",
        "    ",
        "    <script src=\"../../scripts/common.js\"></script>",
        "    <script src=\"../../scripts/header.js\"></script>",
        "    <script src=\"./[page-name].js\"></script>",
        "</body>",
        "</html>"
    ]
}
```

Then type `newpage` in any HTML file and press Tab to auto-insert the template.

---

## Still Have Questions?

Refer to:
- `PROJECT_STRUCTURE.md` - Complete structure overview
- Check console logs - Each module logs when it initializes
- Browser DevTools - Check for 404 errors in the Network tab
- Comment your code - Leave notes about what each section does

Good luck! 🎉
