/* =============================================================================
   MAIN.JS - SHARED FUNCTIONALITY
   All global functionality for ShadowBanCheck.io
   ============================================================================= */

/* =============================================================================
   PLATFORM DATA - SINGLE SOURCE OF TRUTH
   ============================================================================= */
const platformData = [
    // Social Media - Live
    { name: 'Instagram', icon: '📸', category: 'social', status: 'live' },
    { name: 'TikTok', icon: '🎵', category: 'social', status: 'live' },
    { name: 'Twitter/X', icon: '🐦', category: 'social', status: 'live' },
    { name: 'Facebook', icon: '📘', category: 'social', status: 'live' },
    { name: 'LinkedIn', icon: '💼', category: 'social', status: 'live' },
    { name: 'YouTube', icon: '▶️', category: 'social', status: 'live' },
    { name: 'Pinterest', icon: '📌', category: 'social', status: 'live' },
    { name: 'Snapchat', icon: '👻', category: 'social', status: 'live' },
    { name: 'Reddit', icon: '🤖', category: 'social', status: 'live' },
    { name: 'Threads', icon: '🧵', category: 'social', status: 'live' },
    
    // Messaging - Live
    { name: 'WhatsApp', icon: '💬', category: 'messaging', status: 'live' },
    { name: 'Telegram', icon: '✈️', category: 'messaging', status: 'live' },
    { name: 'Discord', icon: '🎮', category: 'messaging', status: 'live' },
    
    // E-Commerce - Live
    { name: 'Amazon', icon: '📦', category: 'ecommerce', status: 'live' },
    { name: 'eBay', icon: '🏷️', category: 'ecommerce', status: 'live' },
    { name: 'Etsy', icon: '🎨', category: 'ecommerce', status: 'live' },
    { name: 'Shopify', icon: '🛒', category: 'ecommerce', status: 'live' },
    
    // Other - Live
    { name: 'Google', icon: '🔍', category: 'other', status: 'live' },
    { name: 'Bing', icon: '🌐', category: 'other', status: 'live' },
    { name: 'Twitch', icon: '📺', category: 'other', status: 'live' },
    
    // Coming Soon
    { name: 'Bluesky', icon: '🦋', category: 'social', status: 'soon' },
    { name: 'Mastodon', icon: '🐘', category: 'social', status: 'soon' },
    { name: 'Rumble', icon: '📹', category: 'social', status: 'soon' },
    { name: 'Truth Social', icon: '🗽', category: 'social', status: 'soon' },
    { name: 'Kick', icon: '🎯', category: 'social', status: 'soon' },
    { name: 'Quora', icon: '❓', category: 'social', status: 'soon' }
];

// Export for use in other files
window.platformData = platformData;

/* =============================================================================
   MOBILE NAVIGATION
   ============================================================================= */
function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navOverlay = document.getElementById('nav-overlay');
    const navMobile = document.getElementById('nav-mobile');
    
    if (!navToggle || !navMobile) return;
    
    function openNav() {
        navMobile.classList.add('active');
        navOverlay?.classList.add('active');
        document.body.classList.add('nav-open');
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
    }
    
    function closeNav() {
        navMobile.classList.remove('active');
        navOverlay?.classList.remove('active');
        document.body.classList.remove('nav-open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
    }
    
    // Toggle button
    navToggle.addEventListener('click', function() {
        if (navMobile.classList.contains('active')) {
            closeNav();
        } else {
            openNav();
        }
    });
    
    // Close button
    navClose?.addEventListener('click', closeNav);
    
    // Overlay click
    navOverlay?.addEventListener('click', closeNav);
    
    // Close on link click
    const navLinks = navMobile.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMobile.classList.contains('active')) {
            closeNav();
        }
    });
    
    // Close on resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMobile.classList.contains('active')) {
            closeNav();
        }
    });
}

/* =============================================================================
   BACK TO TOP BUTTON
   ============================================================================= */
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;
    
    // Show/hide based on scroll position
    function toggleBackToTop() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Listen for scroll
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    
    // Check initial state
    toggleBackToTop();
}

/* =============================================================================
   SCROLL REVEAL ANIMATIONS
   ============================================================================= */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => observer.observe(el));
}

/* =============================================================================
   PLATFORM GRID INJECTION
   ============================================================================= */
function initPlatformGrid() {
    const platformGrid = document.getElementById('platform-grid');
    if (!platformGrid) return;
    
    // Clear existing content
    platformGrid.innerHTML = '';
    
    // Create platform items
    platformData.forEach(platform => {
        const item = document.createElement('div');
        item.className = 'platform-item';
        item.dataset.platform = platform.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        item.dataset.status = platform.status;
        
        const statusBadge = platform.status === 'live' 
            ? '<span class="platform-badge live">Live</span>'
            : '<span class="platform-badge soon">Soon</span>';
        
        item.innerHTML = `
            <span class="platform-icon">${platform.icon}</span>
            <span class="platform-name">${platform.name}</span>
            ${statusBadge}
        `;
        
        // Click handler
        item.addEventListener('click', function() {
            if (platform.status === 'live') {
                openPlatformModal(platform);
            } else {
                showComingSoonToast(platform.name);
            }
        });
        
        platformGrid.appendChild(item);
    });
}

/* =============================================================================
   PLATFORM MODAL
   ============================================================================= */
function openPlatformModal(platform) {
    const modal = document.getElementById('platform-modal');
    if (!modal) return;
    
    // Update modal content
    const modalTitle = modal.querySelector('.modal-title');
    const modalIcon = modal.querySelector('.modal-icon');
    
    if (modalTitle) modalTitle.textContent = `Check ${platform.name}`;
    if (modalIcon) modalIcon.textContent = platform.icon;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Close handlers
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    
    // ESC key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function showComingSoonToast(platformName) {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = `${platformName} checking coming soon!`;
    toast.classList.add('visible');
    
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

/* =============================================================================
   FAQ ACCORDION
   ============================================================================= */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (!question || !answer) return;
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all others
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current
            item.classList.toggle('active');
        });
    });
}

/* =============================================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================================= */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* =============================================================================
   HEADER SCROLL EFFECT
   ============================================================================= */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class for shadow
        if (currentScroll > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

/* =============================================================================
   SEARCH COUNTER (Free tier tracking)
   ============================================================================= */
const FREE_DAILY_LIMIT = 3;

function getSearchCount() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('shadowban_searches');
    
    if (stored) {
        const data = JSON.parse(stored);
        if (data.date === today) {
            return data.count;
        }
    }
    
    return 0;
}

function incrementSearchCount() {
    const today = new Date().toDateString();
    const currentCount = getSearchCount();
    
    localStorage.setItem('shadowban_searches', JSON.stringify({
        date: today,
        count: currentCount + 1
    }));
    
    updateSearchCounterDisplay();
    return currentCount + 1;
}

function getRemainingSearches() {
    return Math.max(0, FREE_DAILY_LIMIT - getSearchCount());
}

function updateSearchCounterDisplay() {
    const remaining = getRemainingSearches();
    const total = FREE_DAILY_LIMIT;
    
    // Update counter displays
    const counterElements = document.querySelectorAll('#searches-remaining, #hashtag-searches-remaining');
    counterElements.forEach(el => {
        if (el) el.textContent = `${remaining} / ${total} available`;
    });
    
    // Update mini displays
    const miniCounters = document.querySelectorAll('#checks-remaining-display');
    miniCounters.forEach(el => {
        if (el) el.textContent = `${remaining} free checks left today`;
    });
    
    // Show upgrade CTA if depleted
    if (remaining === 0) {
        const pricingCta = document.getElementById('pricing-cta');
        if (pricingCta) pricingCta.classList.remove('hidden');
    }
}

/* =============================================================================
   SOCIAL SHARE
   ============================================================================= */
function initSocialShare() {
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent('Check if you\'re shadow banned across 26+ platforms! 🔍');
    
    // Share buttons
    document.getElementById('share-twitter')?.addEventListener('click', function() {
        window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank', 'width=600,height=400');
    });
    
    document.getElementById('share-facebook')?.addEventListener('click', function() {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank', 'width=600,height=400');
    });
    
    document.getElementById('share-telegram')?.addEventListener('click', function() {
        window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, '_blank', 'width=600,height=400');
    });
    
    document.getElementById('share-linkedin')?.addEventListener('click', function() {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank', 'width=600,height=400');
    });
    
    document.getElementById('share-reddit')?.addEventListener('click', function() {
        window.open(`https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}`, '_blank', 'width=600,height=400');
    });
    
    document.getElementById('copy-link')?.addEventListener('click', function() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showCopyToast('Link copied to clipboard!');
        });
    });
}

function showCopyToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('visible');
    
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

/* =============================================================================
   COOKIE POPUP
   ============================================================================= */
function initCookiePopup() {
    const cookiePopup = document.getElementById('cookie-popup');
    if (!cookiePopup) return;
    
    // Check if already accepted
    if (localStorage.getItem('cookies_accepted')) {
        cookiePopup.remove();
        return;
    }
    
    // Show popup
    setTimeout(() => {
        cookiePopup.classList.add('visible');
    }, 1500);
    
    // Accept button
    const acceptBtn = document.getElementById('cookie-accept');
    acceptBtn?.addEventListener('click', function() {
        localStorage.setItem('cookies_accepted', 'true');
        cookiePopup.classList.remove('visible');
        setTimeout(() => cookiePopup.remove(), 300);
    });
    
    // Manage button (just close for now)
    const manageBtn = document.getElementById('cookie-manage');
    manageBtn?.addEventListener('click', function() {
        alert('Cookie preferences coming soon! Essential cookies only are currently used.');
    });
}

/* =============================================================================
   DEMO CHAT ANIMATION (Index page spotlight)
   ============================================================================= */
function initDemoChatAnimation() {
    const demoChat = document.getElementById('demo-chat');
    if (!demoChat) return;
    
    const messages = [
        { type: 'user', text: 'Am I shadow banned on Instagram?' },
        { type: 'ai', text: 'I\'ll check that for you now... Analyzing your account visibility across Instagram\'s explore page, hashtags, and search results.' },
        { type: 'ai', text: '✅ Good news! Your account appears to be in good standing. No shadow ban indicators detected. Your posts are appearing in hashtag searches normally.' }
    ];
    
    let messageIndex = 0;
    
    function showNextMessage() {
        if (messageIndex >= messages.length) {
            // Reset after delay
            setTimeout(() => {
                demoChat.innerHTML = '';
                messageIndex = 0;
                setTimeout(showNextMessage, 1000);
            }, 5000);
            return;
        }
        
        const msg = messages[messageIndex];
        const msgEl = document.createElement('div');
        msgEl.className = `demo-message ${msg.type}`;
        
        if (msg.type === 'ai') {
            // Show typing indicator first
            const typingEl = document.createElement('div');
            typingEl.className = 'demo-message ai typing';
            typingEl.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
            demoChat.appendChild(typingEl);
            demoChat.scrollTop = demoChat.scrollHeight;
            
            setTimeout(() => {
                typingEl.remove();
                msgEl.textContent = msg.text;
                demoChat.appendChild(msgEl);
                demoChat.scrollTop = demoChat.scrollHeight;
                messageIndex++;
                setTimeout(showNextMessage, 2000);
            }, 1500);
        } else {
            msgEl.textContent = msg.text;
            demoChat.appendChild(msgEl);
            demoChat.scrollTop = demoChat.scrollHeight;
            messageIndex++;
            setTimeout(showNextMessage, 1500);
        }
    }
    
    // Start animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(showNextMessage, 500);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(demoChat);
}

/* =============================================================================
   INITIALIZE ALL
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    // Core functionality
    initMobileNav();
    initBackToTop();
    initScrollReveal();
    initHeaderScroll();
    initSmoothScroll();
    
    // Page-specific
    initPlatformGrid();
    initFAQAccordion();
    initSocialShare();
    initCookiePopup();
    initDemoChatAnimation();
    
    // Update search counter display
    updateSearchCounterDisplay();
    
    console.log('✅ ShadowBanCheck.io initialized');
});

/* =============================================================================
   UTILITY EXPORTS
   ============================================================================= */
window.ShadowBan = {
    platformData,
    getSearchCount,
    incrementSearchCount,
    getRemainingSearches,
    updateSearchCounterDisplay,
    openPlatformModal,
    showComingSoonToast,
    showCopyToast
};
