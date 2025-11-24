// ShadowBanCheck.io - Main JS
// Includes: Smooth scroll, animations, social share, cookie popup, and page-specific initializers

document.addEventListener('DOMContentLoaded', () => {
    // Core Site Functions - Always Run
    initSmoothScroll();
    initScrollAnimations();
    initTryAIButton();
    initSocialShare();
    initPlatformModals();
    initCookiePopup();

    // Page-Specific Functions - Only run if their elements are present on the page

    // Checker/Hashtag Checker Page Initializations (Requires an element from checker.html or hashtag-checker.html)
    // We check for 'platform-checker-form' (from checker.html) or if the functions are defined 
    // This uses the functions defined in checker.js and hashtag-checker.js
    if (document.getElementById('platform-checker-form') || document.getElementById('hashtag-checker-form')) {
        if (typeof initPostChecker === 'function') initPostChecker();
        if (typeof initSearchCounter === 'function') initSearchCounter();
        if (typeof initCheckerPageModals === 'function') initCheckerPageModals();
    }

    // Results Page Initializations (Requires an element from results.html)
    if (document.getElementById('results-header')) {
        // This is defined in results.js
        if (typeof initResultsPageShare === 'function') initResultsPageShare();
    }
});

// ===========================================================================
// SMOOTH SCROLLING
// ===========================================================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===========================================================================
// SCROLL ANIMATIONS
// ===========================================================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ===========================================================================
// TOP LEVEL NAV AND MODALS
// ===========================================================================
function initTryAIButton() {
    const btn = document.querySelector('.btn-nav');
    if (btn && btn.textContent.includes('Shadow AI Pro')) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(btn.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

function initSocialShare() {
    // Basic placeholder for site-wide social share logic if needed later
    console.log('Social share placeholders ready.');
}

// Handles the platform picker modal on the index/homepage
function initPlatformModals() {
    const modal = document.getElementById('platform-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = modal?.querySelector('.modal-close');
    
    if (!modal) return;
    
    // Close function
    const closeModal = () => modal.classList.add('hidden');
    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { 
        if (e.target.id === 'platform-modal') closeModal(); 
    });
    document.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); 
    });

    // Open function & content
    document.querySelectorAll('.platform-card a').forEach(cardLink => {
        cardLink.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.getAttribute('data-platform');
            const targetUrl = this.getAttribute('href');

            if (platform) {
                // If it's a live checker, go to the checker page
                if (platform === 'twitter' || platform === 'reddit' || platform === 'email' || targetUrl.includes('hashtag')) {
                    window.location.href = targetUrl;
                    return;
                }
                
                // Show modal for 'coming soon'
                const card = this.closest('.platform-card');
                const name = card.querySelector('h3').textContent;
                const icon = card.querySelector('.platform-icon').textContent;
                
                modalBody.innerHTML = `
                    <div class="modal-header">
                        <span class="platform-icon-large">${icon}</span>
                        <h2>${name} Checker: Coming Soon!</h2>
                    </div>
                    <p>We are currently integrating our advanced ${name} algorithms. We expect this checker to go live within 2-4 weeks.</p>
                    <p>In the meantime, check out our **Free Twitter/X & Reddit Checkers!**</p>
                    <a href="checker.html" class="btn-primary" style="margin-top: 1rem;">Go to Live Checkers</a>
                `;
                modal.classList.remove('hidden');
            } else {
                 // For other links in the card (e.g., FAQ)
                 window.location.href = targetUrl;
            }
        });
    });
}

// ===========================================================================
// COOKIE POPUP
// ===========================================================================
function initCookiePopup() {
    const cookiePopup = document.getElementById('cookie-popup');
    const acceptBtn = document.getElementById('cookie-accept');
    const dismissBtn = document.getElementById('cookie-dismiss');
    
    if (!cookiePopup) return;
    
    const cookieAccepted = localStorage.getItem('shadowban_cookies_accepted');
    
    if (!cookieAccepted) {
        setTimeout(() => {
            cookiePopup.classList.remove('hidden');
        }, 1000);
    }
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('shadowban_cookies_accepted', 'true');
            cookiePopup.classList.add('hidden');
        });
    }
    
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            localStorage.setItem('shadowban_cookies_accepted', 'dismissed');
            cookiePopup.classList.add('hidden');
        });
    }
}

function showCookiePolicy() {
    alert('Cookie Policy\n\nWe use cookies to:\n• Remember your preferences\n• Analyze site traffic and usage\n• Improve your experience\n• Track free searches (3 per day)\n\nBy using ShadowBanCheck.io, you consent to our use of cookies. You can disable cookies in your browser settings, but some features may not work properly.\n\nFor more information, contact us at andrew@ghost081280.com');
}
