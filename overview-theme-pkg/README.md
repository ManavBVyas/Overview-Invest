# Overview Invest Theme Package

This package contains the core CSS, animations, and fonts for the Overview Invest "Cyberpunk/Glassmorphism" UI.

## How to use in another project

### Option 1: Install via NPM (Recommended)

1.  In your new project, install this package:
    ```bash
    npm install ../path/to/Overview_Invest_V5/overview-theme-pkg
    ```
    *(Adjust the path to where this folder is located)*

2.  In your `src/main.jsx` (or `src/index.js`), import the CSS:
    ```javascript
    import 'overview-theme/index.css';
    ```

3.  That's it! Your app now has the fonts, variables, and global styles.

### Option 2: "Just a Command" Copy

If you want to just replace your local `index.css` with this one:

1.  Run passing the path to the install script:
    ```bash
    node ../path/to/Overview_Invest_V5/overview-theme-pkg/install.js
    ```

## What's included?

*   **Fonts**: Segoe UI, Courier New (Google Fonts)
*   **Variables**:
    *   `--glass-bg`: The signature transparent dark background
    *   `--accent-green`: #00FF85
*   **Classes**:
    *   `.card`: Glassmorphism container
    *   `.btn`: Neon green button
    *   `.ticker-container`: Background scrolling numbers
*   **Animations**: `scroll-horizontal`, `pulse`, `shake`
