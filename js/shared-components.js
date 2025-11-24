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
const SHARED_PATH = './shared/';

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
        
        const html = await response.text();
        
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
// COOKIE POLICY FUNCTION
// ============================================
window.showCookiePolicy = function() {
    alert('Cookie Policy\n\nWe use cookies to:\n• Remember your preferences\n• Track free searches\n• Improve your experience');
};

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
