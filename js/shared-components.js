/* =============================================================================
   SHARED COMPONENTS LOADER
   ShadowBanCheck.io
   
   Loads shared HTML components into all pages:
   - Header
   - Mobile Navigation
   - Footer
   - Cookie Popup
   - Back to Top Button
   - Toast Notification
   
   NOTE: This file ONLY loads HTML. All JavaScript initialization
   (mobile nav toggle, cookie popup logic, back-to-top scroll, etc.)
   is handled by main.js after components are loaded.
   ============================================================================= */

(function() {
'use strict';

// ============================================
// CONFIGURATION
// ============================================
const currentPath = window.location.pathname;
const isInSubfolder = currentPath.includes('/legal/');
const SHARED_PATH = isInSubfolder ? '../shared/' : './shared/';
const ROOT_PATH = isInSubfolder ? '../' : './';

const COMPONENTS = {
    header: {
        file: 'header.html',
        target: 'body',
        position: 'afterbegin'
    },
    mobileNav: {
        file: 'mobile-nav.html',
        target: 'header',
        position: 'afterend'
    },
    footer: {
        file: 'footer.html',
        target: 'body',
        position: 'beforeend',
        beforeSelector: 'script'
    },
    cookiePopup: {
        file: 'cookie-popup.html',
        target: 'body',
        position: 'beforeend',
        beforeSelector: 'script'
    },
    backToTop: {
        file: 'back-to-top.html',
        target: 'body',
        position: 'beforeend',
        beforeSelector: 'script'
    },
    toast: {
        file: 'toast.html',
        target: 'body',
        position: 'beforeend',
        beforeSelector: 'script'
    }
};

// ============================================
// COMPONENT LOADER
// ============================================
async function loadComponent(name, config) {
    try {
        const response = await fetch(SHARED_PATH + config.file);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let html = await response.text();
        
        // Fix relative paths if in subfolder
        if (isInSubfolder) {
            html = html.replace(/href="((?!http|#|mailto:|tel:)[^"]+)"/g, (match, path) => {
                if (path.startsWith('../') || path.startsWith('/')) {
                    return match;
                }
                return `href="${ROOT_PATH}${path}"`;
            });
        }
        
        // Find target element
        let target = document.querySelector(config.target);
        
        if (!target) {
            console.warn(`⚠️ Target "${config.target}" not found for ${name}`);
            return false;
        }
        
        // Special handling - insert before scripts
        if (config.beforeSelector && config.position === 'beforeend') {
            const firstScript = document.querySelector(config.target + ' > ' + config.beforeSelector);
            if (firstScript) {
                firstScript.insertAdjacentHTML('beforebegin', html);
            } else {
                target.insertAdjacentHTML(config.position, html);
            }
        } else {
            target.insertAdjacentHTML(config.position, html);
        }
        
        return true;
        
    } catch (error) {
        console.error(`❌ Failed to load ${name}:`, error);
        return false;
    }
}

// ============================================
// HIDE HOME LINK ON HOME PAGE
// ============================================
function hideHomeOnHomePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isHomePage = currentPage === 'index.html' || currentPage === '' || currentPage === '/';
    
    if (isHomePage) {
        const desktopHomeLink = document.getElementById('nav-home-link');
        if (desktopHomeLink) {
            desktopHomeLink.style.display = 'none';
        }
        
        const mobileHomeLink = document.getElementById('nav-mobile-home-link');
        if (mobileHomeLink) {
            mobileHomeLink.style.display = 'none';
        }
    }
}

// ============================================
// MAIN INITIALIZATION
// ============================================
async function initializeSharedComponents() {
    console.log('🔧 Loading shared components...');
    
    // Load components in order
    await loadComponent('header', COMPONENTS.header);
    await loadComponent('mobileNav', COMPONENTS.mobileNav);
    await loadComponent('footer', COMPONENTS.footer);
    await loadComponent('cookiePopup', COMPONENTS.cookiePopup);
    await loadComponent('backToTop', COMPONENTS.backToTop);
    await loadComponent('toast', COMPONENTS.toast);
    
    // Hide home link if on home page
    hideHomeOnHomePage();
    
    // Dispatch event for main.js to know components are ready
    document.dispatchEvent(new CustomEvent('sharedComponentsLoaded'));
    
    console.log('✅ Shared components loaded');
}

// ============================================
// RUN ON DOM READY
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSharedComponents);
} else {
    initializeSharedComponents();
}

})();
