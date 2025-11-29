/* =============================================================================
   MAIN.JS - SHARED FUNCTIONALITY
   ShadowBanCheck.io - Core shared utilities across all pages
   ============================================================================= */

/* =============================================================================
   MOBILE NAV
   ============================================================================= */
function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');
    const navOverlay = document.getElementById('nav-overlay');
    
    if (!navToggle || !navMobile) return;
    
    function toggleNav() {
        navMobile.classList.toggle('active');
        navOverlay?.classList.toggle('active');
        navToggle.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    }
    
    function closeNav() {
        navMobile.classList.remove('active');
        navOverlay?.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.classList.remove('nav-open');
    }
    
    navToggle.addEventListener('click', toggleNav);
    navOverlay?.addEventListener('click', closeNav);
    document.getElementById('nav-close')?.addEventListener('click', closeNav);
    
    navMobile.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeNav);
    });
}

/* =============================================================================
   SCROLL REVEAL
   ============================================================================= */
function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* =============================================================================
   MODAL UTILITIES (Shared)
   ============================================================================= */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function initModalHandlers() {
    // Close on overlay click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
        
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Close on ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
            });
            document.body.style.overflow = '';
        }
    });
}

/* =============================================================================
   TOAST NOTIFICATION
   ============================================================================= */
function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Force reflow to restart animation
    toast.offsetHeight;
    
    toast.classList.add('visible');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('visible');
        toast.classList.remove('show');
    }, 3000);
}

/* =============================================================================
   COOKIE POPUP
   ============================================================================= */
function initCookiePopup() {
    const popup = document.getElementById('cookie-popup');
    const acceptBtn = document.getElementById('cookie-accept');
    const dismissBtn = document.getElementById('cookie-dismiss');
    
    if (!popup) return;
    
    // Check if already accepted
    const cookieAccepted = localStorage.getItem('cookiesAccepted');
    
    if (!cookieAccepted) {
        // Show popup after a short delay
        setTimeout(() => {
            popup.classList.add('show');
        }, 1500);
    }
    
    // Accept button
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            popup.classList.add('dismissed');
            setTimeout(() => {
                popup.classList.remove('show');
                popup.classList.remove('dismissed');
            }, 400);
        });
    }
    
    // Dismiss button
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            popup.classList.add('dismissed');
            setTimeout(() => {
                popup.classList.remove('show');
                popup.classList.remove('dismissed');
            }, 400);
        });
    }
}

/* =============================================================================
   FAQ ACCORDION
   ============================================================================= */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
}

/* =============================================================================
   UTILITIES
   ============================================================================= */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/* =============================================================================
   HEADER SCROLL EFFECT
   ============================================================================= */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* =============================================================================
   BACK TO TOP BUTTON
   ============================================================================= */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* =============================================================================
   PLATFORM HELPER FUNCTIONS (Fallbacks ONLY if platforms.js fails to load)
   
   IMPORTANT: These are FALLBACK functions that directly access platformData.
   They do NOT call window.getPlatformById etc. to avoid infinite recursion.
   platforms.js should always load first and define the real functions.
   ============================================================================= */

function _fallbackGetPlatformById(id) {
    if (!id || !window.platformData) return null;
    return window.platformData.find(p => p.id === id) || null;
}

function _fallbackGetLivePlatforms() {
    if (!window.platformData) return [];
    return window.platformData.filter(p => p.status === 'live');
}

function _fallbackGetComingSoonPlatforms() {
    if (!window.platformData) return [];
    return window.platformData.filter(p => p.status === 'soon');
}

function _fallbackGetHashtagPlatforms() {
    if (!window.platformData) return [];
    return window.platformData.filter(p => p.supports && p.supports.hashtagCheck === true);
}

function _fallbackDetectPlatformFromUrl(url) {
    if (!url || typeof url !== 'string' || !window.platformData) return null;
    
    const lowerUrl = url.toLowerCase().trim();
    
    if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) {
        return _fallbackGetPlatformById('twitter');
    }
    if (lowerUrl.includes('reddit.com') || lowerUrl.includes('redd.it')) {
        return _fallbackGetPlatformById('reddit');
    }
    if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
        return _fallbackGetPlatformById('instagram');
    }
    if (lowerUrl.includes('tiktok.com')) {
        return _fallbackGetPlatformById('tiktok');
    }
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
        return _fallbackGetPlatformById('facebook');
    }
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return _fallbackGetPlatformById('youtube');
    }
    if (lowerUrl.includes('linkedin.com')) {
        return _fallbackGetPlatformById('linkedin');
    }
    
    return null;
}

/* =============================================================================
   INITIALIZE SHARED FUNCTIONALITY
   ============================================================================= */
let sharedInitialized = false;

function initSharedFunctionality() {
    if (sharedInitialized) return;
    sharedInitialized = true;
    
    initMobileNav();
    initModalHandlers();
    initScrollReveal();
    initHeaderScroll();
    initBackToTop();
    initCookiePopup();
    initFaqAccordion();
    
    console.log('✅ Shared functionality initialized');
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', initSharedFunctionality);

// Also init after shared components load
document.addEventListener('sharedComponentsLoaded', initSharedFunctionality);

/* =============================================================================
   EXPORTS (Global)
   ============================================================================= */
window.ShadowBan = window.ShadowBan || {};
Object.assign(window.ShadowBan, {
    showToast,
    openModal,
    closeModal,
    sleep,
    debounce
});

// Make modal/toast functions globally accessible
window.closeModal = closeModal;
window.closeLimitModal = () => closeModal('limit-modal');
window.showToast = showToast;
window.openModal = openModal;

// Set fallback platform helpers ONLY if platforms.js didn't load them
// This prevents the infinite recursion bug
if (typeof window.getPlatformById !== 'function') {
    window.getPlatformById = _fallbackGetPlatformById;
    console.warn('⚠️ Using fallback getPlatformById - platforms.js may not have loaded');
}
if (typeof window.getLivePlatforms !== 'function') {
    window.getLivePlatforms = _fallbackGetLivePlatforms;
}
if (typeof window.getComingSoonPlatforms !== 'function') {
    window.getComingSoonPlatforms = _fallbackGetComingSoonPlatforms;
}
if (typeof window.getHashtagPlatforms !== 'function') {
    window.getHashtagPlatforms = _fallbackGetHashtagPlatforms;
}
if (typeof window.detectPlatformFromUrl !== 'function') {
    window.detectPlatformFromUrl = _fallbackDetectPlatformFromUrl;
}
