/* =============================================================================
   MAIN.JS - SHARED FUNCTIONALITY
   All global functionality for ShadowBanCheck.io
   ============================================================================= */

/* =============================================================================
   PLATFORM DATA - SINGLE SOURCE OF TRUTH
   Status: 'live' = Twitter/X, Reddit, Email | 'soon' = everything else
   ============================================================================= */
const platformData = [
    // LIVE Platforms (3)
    { 
        name: 'Twitter/X', 
        icon: '🐦', 
        category: 'social', 
        status: 'live',
        checks: [
            'Search suggestion ban (account hidden from search)',
            'Reply deboosting (replies hidden behind "Show more")',
            'Ghost ban (tweets invisible to others)',
            'Search ban (tweets hidden from search results)',
            'Quality Filter Detection (QFD) status',
            'Sensitive media flags on profile',
            'Age-restricted content warnings',
            'Engagement rate analysis vs. followers',
            'Hashtag visibility in trends',
            'Profile accessibility from logged-out view'
        ]
    },
    { 
        name: 'Reddit', 
        icon: '🤖', 
        category: 'social', 
        status: 'live',
        checks: [
            'Shadowban status (posts/comments invisible)',
            'Subreddit-specific bans detection',
            'Karma threshold restrictions',
            'Account age restrictions',
            'Spam filter triggering',
            'AutoModerator removal patterns',
            'Post visibility in subreddit listings',
            'Comment visibility in threads',
            'Profile page accessibility',
            'Cross-posting restrictions'
        ]
    },
    { 
        name: 'Email', 
        icon: '📧', 
        category: 'other', 
        status: 'live',
        checks: [
            'Domain blacklist status (Spamhaus, SURBL)',
            'IP reputation score',
            'DKIM/SPF/DMARC configuration',
            'Email deliverability rate',
            'Spam folder placement probability',
            'Bounce rate analysis',
            'Sender reputation score',
            'Content spam trigger analysis',
            'Gmail/Outlook/Yahoo inbox placement',
            'Unsubscribe compliance status'
        ]
    },
    
    // COMING SOON - Social Media
    { name: 'Instagram', icon: '📸', category: 'social', status: 'soon' },
    { name: 'TikTok', icon: '🎵', category: 'social', status: 'soon' },
    { name: 'Facebook', icon: '📘', category: 'social', status: 'soon' },
    { name: 'LinkedIn', icon: '💼', category: 'social', status: 'soon' },
    { name: 'YouTube', icon: '▶️', category: 'social', status: 'soon' },
    { name: 'Pinterest', icon: '📌', category: 'social', status: 'soon' },
    { name: 'Snapchat', icon: '👻', category: 'social', status: 'soon' },
    { name: 'Threads', icon: '🧵', category: 'social', status: 'soon' },
    { name: 'Bluesky', icon: '🦋', category: 'social', status: 'soon' },
    { name: 'Mastodon', icon: '🐘', category: 'social', status: 'soon' },
    { name: 'Rumble', icon: '📹', category: 'social', status: 'soon' },
    { name: 'Truth Social', icon: '🗽', category: 'social', status: 'soon' },
    { name: 'Kick', icon: '🎯', category: 'social', status: 'soon' },
    { name: 'Quora', icon: '❓', category: 'social', status: 'soon' },
    
    // COMING SOON - Messaging
    { name: 'WhatsApp', icon: '💬', category: 'messaging', status: 'soon' },
    { name: 'Telegram', icon: '✈️', category: 'messaging', status: 'soon' },
    { name: 'Discord', icon: '🎮', category: 'messaging', status: 'soon' },
    
    // COMING SOON - E-Commerce
    { name: 'Amazon', icon: '📦', category: 'ecommerce', status: 'soon' },
    { name: 'eBay', icon: '🏷️', category: 'ecommerce', status: 'soon' },
    { name: 'Etsy', icon: '🎨', category: 'ecommerce', status: 'soon' },
    { name: 'Shopify', icon: '🛒', category: 'ecommerce', status: 'soon' },
    
    // COMING SOON - Other
    { name: 'Google', icon: '🔍', category: 'other', status: 'soon' },
    { name: 'Bing', icon: '🌐', category: 'other', status: 'soon' },
    { name: 'Twitch', icon: '📺', category: 'other', status: 'soon' }
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
    
    function toggleBackToTop() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
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
    
    platformGrid.innerHTML = '';
    
    // Sort: live platforms first, then alphabetically
    const sortedPlatforms = [...platformData].sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (a.status !== 'live' && b.status === 'live') return 1;
        return a.name.localeCompare(b.name);
    });
    
    sortedPlatforms.forEach(platform => {
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
        
        item.addEventListener('click', function() {
            openPlatformModal(platform);
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
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalStatus = document.getElementById('modal-status');
    const modalBody = document.getElementById('modal-body');
    const modalCta = document.getElementById('modal-cta');
    
    if (modalIcon) modalIcon.textContent = platform.icon;
    if (modalTitle) modalTitle.textContent = `Check ${platform.name}`;
    
    // Update status badge
    if (modalStatus) {
        if (platform.status === 'live') {
            modalStatus.innerHTML = '<span class="status-badge live">● Live</span>';
        } else {
            modalStatus.innerHTML = '<span class="status-badge soon">● Coming Soon</span>';
        }
    }
    
    // Update body content
    if (modalBody) {
        if (platform.status === 'live' && platform.checks) {
            modalBody.className = 'modal-body';
            modalBody.innerHTML = `
                <h4>What We Check:</h4>
                <ul class="check-list" id="modal-checks">
                    ${platform.checks.map(check => `<li>${check}</li>`).join('')}
                </ul>
            `;
        } else {
            modalBody.className = 'modal-body coming-soon';
            modalBody.innerHTML = `
                <p>We're working hard to add ${platform.name} support!</p>
                <p style="margin-top: var(--space-md);">Want to be notified when it's ready? Sign up for our newsletter or check back soon.</p>
            `;
        }
    }
    
    // Update CTA button
    if (modalCta) {
        if (platform.status === 'live') {
            const platformSlug = platform.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            modalCta.href = `checker.html?platform=${platformSlug}`;
            modalCta.textContent = `Check ${platform.name} →`;
            modalCta.style.display = 'block';
        } else {
            modalCta.style.display = 'none';
        }
    }
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Close handlers
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    
    // ESC key
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/* =============================================================================
   POST CHECKER - DEMO RESULTS
   ============================================================================= */
function initPostChecker() {
    const form = document.getElementById('post-checker-form');
    const input = document.getElementById('post-url-input');
    const button = document.getElementById('analyze-post-btn');
    const resultsSection = document.getElementById('post-results');
    const checkAnotherBtn = document.getElementById('check-another-btn');
    
    if (!form || !input || !button) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const url = input.value.trim();
        if (!url) {
            showToast('Please enter a post URL');
            return;
        }
        
        // Validate URL format
        if (!isValidUrl(url)) {
            showToast('Please enter a valid URL');
            return;
        }
        
        // Detect platform from URL
        const platform = detectPlatform(url);
        
        // Show loading state
        button.classList.add('loading');
        button.disabled = true;
        
        // Simulate analysis (demo)
        setTimeout(() => {
            button.classList.remove('loading');
            button.disabled = false;
            
            // Generate demo results
            showDemoResults(platform, url);
        }, 2000);
    });
    
    // Check another button
    checkAnotherBtn?.addEventListener('click', function() {
        resultsSection?.classList.add('hidden');
        input.value = '';
        input.focus();
    });
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function detectPlatform(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
        return { name: 'Twitter/X', icon: '🐦' };
    } else if (urlLower.includes('reddit.com')) {
        return { name: 'Reddit', icon: '🤖' };
    } else if (urlLower.includes('instagram.com')) {
        return { name: 'Instagram', icon: '📸' };
    } else if (urlLower.includes('tiktok.com')) {
        return { name: 'TikTok', icon: '🎵' };
    } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
        return { name: 'Facebook', icon: '📘' };
    } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return { name: 'YouTube', icon: '▶️' };
    } else if (urlLower.includes('linkedin.com')) {
        return { name: 'LinkedIn', icon: '💼' };
    }
    
    return { name: 'Unknown Platform', icon: '🔗' };
}

function showDemoResults(platform, url) {
    const resultsSection = document.getElementById('post-results');
    const resultsIcon = document.getElementById('results-icon');
    const resultsTitle = document.getElementById('results-title');
    const resultsPlatform = document.getElementById('results-platform');
    const scoreCircle = document.getElementById('score-circle');
    const scoreValue = document.getElementById('score-value');
    const factorsList = document.getElementById('factors-list');
    
    if (!resultsSection) return;
    
    // Generate random score for demo (weighted towards good results)
    const score = Math.random() < 0.7 ? Math.floor(Math.random() * 35) + 5 : Math.floor(Math.random() * 40) + 45;
    
    // Update results
    if (resultsIcon) resultsIcon.textContent = '📊';
    if (resultsTitle) resultsTitle.textContent = 'Analysis Complete';
    if (resultsPlatform) resultsPlatform.textContent = `Platform detected: ${platform.name}`;
    if (scoreValue) scoreValue.textContent = `${score}%`;
    
    // Update score circle color
    if (scoreCircle) {
        scoreCircle.classList.remove('warning', 'danger');
        if (score >= 60) {
            scoreCircle.classList.add('danger');
        } else if (score >= 35) {
            scoreCircle.classList.add('warning');
        }
    }
    
    // Generate factors based on platform
    if (factorsList) {
        const factors = generateDemoFactors(platform.name, score);
        factorsList.innerHTML = factors.map(f => `
            <li class="factor-${f.status}">
                <span>${f.icon}</span>
                ${f.text}
            </li>
        `).join('');
    }
    
    // Show results
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function generateDemoFactors(platformName, score) {
    const factors = [];
    
    if (platformName === 'Twitter/X') {
        factors.push(
            { icon: '✓', status: 'good', text: 'Post appears in hashtag searches' },
            { icon: '✓', status: 'good', text: 'Profile visible to logged-out users' },
            { icon: '✓', status: 'good', text: 'Replies visible in threads' }
        );
        
        if (score > 30) {
            factors.push({ icon: '⚠', status: 'warning', text: 'Lower than expected engagement rate' });
        }
        if (score > 50) {
            factors.push({ icon: '✗', status: 'bad', text: 'Some replies hidden behind "Show more"' });
        }
        if (score <= 30) {
            factors.push({ icon: '✓', status: 'good', text: 'No quality filter restrictions detected' });
        }
    } else if (platformName === 'Reddit') {
        factors.push(
            { icon: '✓', status: 'good', text: 'Post visible in subreddit listing' },
            { icon: '✓', status: 'good', text: 'Profile page accessible' }
        );
        
        if (score > 40) {
            factors.push({ icon: '⚠', status: 'warning', text: 'Lower karma than expected for visibility' });
            factors.push({ icon: '⚠', status: 'warning', text: 'Some comments may be filtered' });
        } else {
            factors.push({ icon: '✓', status: 'good', text: 'Comments appearing normally in threads' });
            factors.push({ icon: '✓', status: 'good', text: 'No AutoModerator removal patterns' });
        }
    } else {
        // Generic factors for other platforms
        factors.push(
            { icon: '✓', status: 'good', text: 'Content appears to be visible' },
            { icon: '✓', status: 'good', text: 'Profile accessible' }
        );
        
        if (score > 40) {
            factors.push({ icon: '⚠', status: 'warning', text: 'Engagement lower than expected' });
        } else {
            factors.push({ icon: '✓', status: 'good', text: 'Engagement within normal range' });
        }
    }
    
    return factors;
}

/* =============================================================================
   DEMO CHAT ANIMATION - TYPEWRITER EFFECT
   ============================================================================= */
function initDemoChatAnimation() {
    const demoChat = document.getElementById('demo-chat-messages');
    if (!demoChat) return;
    
    let hasPlayed = false;
    
    const chatSequence = [
        { 
            type: 'ai', 
            text: "👋 Hi! I'm Shadow AI, your personal shadow ban detective.",
            delay: 500
        },
        { 
            type: 'ai', 
            text: "I can check if you're being suppressed on Twitter/X, Reddit, Instagram, TikTok, and 22+ other platforms.",
            delay: 1500
        },
        { 
            type: 'ai', 
            text: "I analyze engagement patterns, visibility signals, and platform-specific indicators to give you a probability score.",
            delay: 1500
        },
        { 
            type: 'ai', 
            text: "Would you like to learn more about our Pro subscription? 🚀",
            delay: 1500
        },
        { 
            type: 'user', 
            text: "Yes, tell me more!",
            delay: 2000,
            clickable: true
        },
        { 
            type: 'ai', 
            text: "Great choice! With Shadow AI Pro you get:",
            delay: 1000
        },
        { 
            type: 'ai', 
            text: "✓ 100 AI questions/day\n✓ Live platform checks\n✓ Recovery strategies\n✓ 24/7 availability",
            delay: 1200
        },
        { 
            type: 'ai', 
            text: '👉 <a href="#pricing">View pricing plans</a> to get started with a 7-day free trial!',
            delay: 1500
        }
    ];
    
    let currentIndex = 0;
    let isAnimating = false;
    
    function showTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        demoChat.appendChild(typing);
        demoChat.scrollTop = demoChat.scrollHeight;
        return typing;
    }
    
    function addMessage(message) {
        const msgEl = document.createElement('div');
        msgEl.className = `demo-msg ${message.type}`;
        
        if (message.type === 'ai') {
            // For AI messages, use innerHTML to support links and formatting
            msgEl.innerHTML = message.text.replace(/\n/g, '<br>');
        } else {
            msgEl.textContent = message.text;
        }
        
        if (message.clickable) {
            msgEl.style.cursor = 'pointer';
            msgEl.title = 'Click to continue';
        }
        
        demoChat.appendChild(msgEl);
        demoChat.scrollTop = demoChat.scrollHeight;
        
        return msgEl;
    }
    
    function playNextMessage() {
        if (currentIndex >= chatSequence.length) {
            isAnimating = false;
            return;
        }
        
        const message = chatSequence[currentIndex];
        currentIndex++;
        
        if (message.type === 'ai') {
            // Show typing indicator for AI messages
            const typing = showTypingIndicator();
            
            setTimeout(() => {
                typing.remove();
                addMessage(message);
                
                setTimeout(playNextMessage, message.delay || 1000);
            }, 800 + Math.random() * 400);
        } else {
            // User messages appear after a delay
            setTimeout(() => {
                addMessage(message);
                setTimeout(playNextMessage, message.delay || 1000);
            }, message.delay || 1000);
        }
    }
    
    function startAnimation() {
        if (hasPlayed || isAnimating) return;
        
        hasPlayed = true;
        isAnimating = true;
        demoChat.innerHTML = '';
        currentIndex = 0;
        
        setTimeout(playNextMessage, 500);
    }
    
    // Start animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasPlayed) {
                startAnimation();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(demoChat);
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
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
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
    
    const counterElements = document.querySelectorAll('#searches-remaining, #hashtag-searches-remaining');
    counterElements.forEach(el => {
        if (el) el.textContent = `${remaining} / ${total} available`;
    });
    
    const miniCounters = document.querySelectorAll('#checks-remaining-display');
    miniCounters.forEach(el => {
        if (el) el.textContent = `${remaining} free checks left today`;
    });
    
    if (remaining === 0) {
        const pricingCta = document.getElementById('pricing-cta');
        if (pricingCta) pricingCta.classList.remove('hidden');
    }
}

/* =============================================================================
   SOCIAL SHARE
   ============================================================================= */
function initSocialShare() {
    const shareUrl = encodeURIComponent(window.location.origin);
    const shareText = encodeURIComponent('Check if you\'re shadow banned across 26+ platforms! 🔍');
    
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
            showToast('Link copied to clipboard!');
        });
    });
}

/* =============================================================================
   TOAST NOTIFICATIONS
   ============================================================================= */
function showToast(message) {
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
    
    if (localStorage.getItem('cookies_accepted')) {
        cookiePopup.remove();
        return;
    }
    
    setTimeout(() => {
        cookiePopup.classList.remove('hidden');
        cookiePopup.classList.add('visible');
    }, 1500);
    
    const acceptBtn = document.getElementById('cookie-accept');
    acceptBtn?.addEventListener('click', function() {
        localStorage.setItem('cookies_accepted', 'true');
        cookiePopup.classList.remove('visible');
        setTimeout(() => cookiePopup.remove(), 300);
    });
    
    const dismissBtn = document.getElementById('cookie-dismiss');
    dismissBtn?.addEventListener('click', function() {
        cookiePopup.classList.remove('visible');
        setTimeout(() => cookiePopup.remove(), 300);
    });
}

/* =============================================================================
   SHADOW AI BUTTON HANDLERS - Handled by shadow-ai.js
   ============================================================================= */
// Note: Shadow AI buttons (#try-ai-btn, #open-shadow-ai) are handled by shadow-ai.js

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
    initPostChecker();
    initFAQAccordion();
    initSocialShare();
    initCookiePopup();
    initDemoChatAnimation();
    
    // Shadow AI buttons handled by shadow-ai.js
    
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
    showToast
};
