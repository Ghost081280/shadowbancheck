/* =============================================================================
   SHARED COMPONENTS LOADER
   ShadowBanCheck.io
   Loads header, mobile-nav, and footer into all pages
   ============================================================================= */

(function() {
'use strict';

// ============================================
// CONFIGURATION
// ============================================
// Detect if we're in a subfolder and adjust paths accordingly
const currentPath = window.location.pathname;
const isInSubfolder = currentPath.includes('/legal/');
const SHARED_PATH = isInSubfolder ? '../shared/' : './shared/';
const ROOT_PATH = isInSubfolder ? '../' : './';

const COMPONENTS = {
    header: {
        file: 'header.html',
        target: 'body',
        position: 'afterbegin' // Insert at the beginning of body
    },
    mobileNav: {
        file: 'mobile-nav.html',
        target: 'header',
        position: 'afterend' // Insert after header
    },
    footer: {
        file: 'footer.html',
        target: 'body',
        position: 'beforeend', // Insert at end of body
        beforeSelector: 'script' // But before script tags
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
            // Fix links like href="index.html" to href="../index.html"
            html = html.replace(/href="((?!http|#|mailto:|tel:)[^"]+)"/g, (match, path) => {
                // Don't modify already-relative paths or anchors
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
        
        // Special handling for footer - insert before scripts
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
        
        console.log(`✅ Loaded ${name}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Failed to load ${name}:`, error);
        return false;
    }
}

// ============================================
// MOBILE NAV INITIALIZATION
// ============================================
function initializeMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const close = document.getElementById('nav-close');
    const overlay = document.getElementById('nav-overlay');
    const mobileNav = document.getElementById('nav-mobile');
    
    if (!toggle || !mobileNav) {
        console.warn('⚠️ Mobile nav elements not found');
        return;
    }
    
    function openNav() {
        mobileNav.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeNav() {
        mobileNav.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    toggle.addEventListener('click', openNav);
    
    if (close) {
        close.addEventListener('click', closeNav);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeNav);
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeNav();
        }
    });
    
    // Close when clicking nav links
    const navLinks = mobileNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });
    
    console.log('✅ Mobile nav initialized');
}

// ============================================
// HIDE HOME LINK ON HOME PAGE
// ============================================
function hideHomeOnHomePage() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Check if we're on index.html or root
    const isHomePage = currentPage === 'index.html' || currentPage === '' || currentPage === '/';
    
    if (isHomePage) {
        // Hide desktop home link
        const desktopHomeLink = document.getElementById('nav-home-link');
        if (desktopHomeLink) {
            desktopHomeLink.style.display = 'none';
            console.log('✅ Hidden desktop Home link (on home page)');
        }
        
        // Hide mobile home link
        const mobileHomeLink = document.getElementById('nav-mobile-home-link');
        if (mobileHomeLink) {
            mobileHomeLink.style.display = 'none';
            console.log('✅ Hidden mobile Home link (on home page)');
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
    
    // Initialize mobile nav after components are loaded
    initializeMobileNav();
    
    // Hide home link if on home page
    hideHomeOnHomePage();
    
    // Dispatch event for other scripts to know components are ready
    document.dispatchEvent(new CustomEvent('sharedComponentsLoaded'));
    
    console.log('✅ All shared components loaded');
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
