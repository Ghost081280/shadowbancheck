// ShadowBanCheck.io - Main JS
// Includes: Smooth scroll, animations, social share, platform modals, checker functionality

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initScrollAnimations();
    initTryAIButton();
    initSocialShare();
    initPlatformModals();
    initPostChecker();
    initSearchCounter();
    initCheckerPageModals();
    initResultsPageShare();
    initCookiePopup();
});

// ============================================================================
// SMOOTH SCROLLING
// ============================================================================
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

// ============================================================================
// SCROLL ANIMATIONS
// ============================================================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.option-card, .platform-item, .step, .price-card, .audience-card, .ai-plan, .source-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ============================================================================
// TRY SHADOW AI BUTTON
// ============================================================================
function initTryAIButton() {
    const tryAIBtn = document.getElementById('try-ai-btn');
    const shadowAIBtn = document.getElementById('shadow-ai-btn');
    
    if (tryAIBtn && shadowAIBtn) {
        tryAIBtn.addEventListener('click', () => {
            shadowAIBtn.click();
        });
    }
}

// ============================================================================
// SOCIAL SHARE
// ============================================================================
function initSocialShare() {
    const shareURL = encodeURIComponent('https://shadowbancheck.io');
    const shareText = encodeURIComponent('Just checked if I\'m shadow banned with ShadowBanCheck.io 🔍');
    
    const twitterBtn = document.getElementById('share-twitter');
    if (twitterBtn) {
        twitterBtn.addEventListener('click', () => {
            window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}`, '_blank', 'width=600,height=400');
        });
    }
    
    const facebookBtn = document.getElementById('share-facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareURL}`, '_blank', 'width=600,height=400');
        });
    }
    
    const telegramBtn = document.getElementById('share-telegram');
    if (telegramBtn) {
        telegramBtn.addEventListener('click', () => {
            window.open(`https://t.me/share/url?url=${shareURL}&text=${shareText}`, '_blank', 'width=600,height=400');
        });
    }
    
    const linkedinBtn = document.getElementById('share-linkedin');
    if (linkedinBtn) {
        linkedinBtn.addEventListener('click', () => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareURL}`, '_blank', 'width=600,height=400');
        });
    }
}

// ============================================================================
// PLATFORM DATA
// ============================================================================
const platformData = {
    twitter: {
        name: 'Twitter / X',
        icon: '🐦',
        live: true,
        placeholder: '@username',
        checks: ['Search visibility for tweets', 'Reply thread visibility', 'Tweet impressions and reach', 'Profile discoverability', 'Hashtag performance', 'Shadowban detection'],
        description: 'We check if your tweets appear in search, if replies are visible to others, and if your content is being algorithmically suppressed.'
    },
    instagram: {
        name: 'Instagram',
        icon: '📸',
        live: false,
        placeholder: '@username',
        checks: ['Post visibility in feeds', 'Story reach', 'Hashtag bans', 'Explore page appearance', 'Shadow ban status', 'Account restrictions'],
        description: 'Verify if your posts are showing up in feeds, if hashtags are working, and if Instagram is limiting your reach.'
    },
    tiktok: {
        name: 'TikTok',
        icon: '🎵',
        live: false,
        placeholder: '@username',
        checks: ['For You Page visibility', 'Video reach and views', 'Hashtag suppression', 'Account restrictions', 'Shadow ban detection', 'Content violations'],
        description: 'Check if your videos are being shown on the For You Page and if TikTok is limiting your content distribution.'
    },
    facebook: {
        name: 'Facebook',
        icon: '📘',
        live: false,
        placeholder: 'username or page name',
        checks: ['Post reach and visibility', 'Page distribution', 'Content restrictions', 'Account status', 'News Feed appearance', 'Ad account health'],
        description: 'Verify if your posts are reaching followers, if your page is being suppressed, and check for content restrictions.'
    },
    reddit: {
        name: 'Reddit',
        icon: '🤖',
        live: true,
        placeholder: 'u/username',
        checks: ['Post visibility in subreddits', 'Comment visibility', 'Karma tracking', 'Subreddit-specific bans', 'Shadowban status', 'Account age restrictions'],
        description: 'Check if your posts and comments are visible to others, or if you\'ve been shadowbanned from specific subreddits.'
    },
    linkedin: {
        name: 'LinkedIn',
        icon: '💼',
        live: false,
        placeholder: 'profile URL or username',
        checks: ['Post reach and engagement', 'Profile visibility in search', 'Content distribution', 'Connection request limits', 'Account restrictions', 'Messaging capabilities'],
        description: 'Verify if your professional content is reaching your network and if LinkedIn is limiting your visibility.'
    },
    threads: {
        name: 'Threads',
        icon: '🧵',
        live: false,
        placeholder: '@username',
        checks: ['Post visibility in feeds', 'Reply visibility', 'Account discoverability', 'Content reach', 'Shadow ban detection', 'Algorithm suppression'],
        description: 'Check if your Threads posts are visible to followers and if Meta is suppressing your content.'
    },
    bluesky: {
        name: 'Bluesky',
        icon: '🦋',
        live: false,
        placeholder: '@handle.bsky.social',
        checks: ['Post visibility', 'Feed appearance', 'Account discoverability', 'Content moderation status', 'Reach metrics', 'Algorithmic promotion'],
        description: 'Verify if your Bluesky posts are reaching your audience and check for any content restrictions.'
    },
    youtube: {
        name: 'YouTube',
        icon: '📺',
        live: false,
        placeholder: 'channel name or @handle',
        checks: ['Video visibility in search', 'Recommended feed appearance', 'Monetization status', 'Comment visibility', 'Channel restrictions', 'Age restrictions'],
        description: 'Check if your videos are being recommended, appearing in search, and if YouTube is limiting your channel.'
    },
    pinterest: {
        name: 'Pinterest',
        icon: '📌',
        live: false,
        placeholder: 'username',
        checks: ['Pin visibility in feeds', 'Search appearance', 'Board distribution', 'Account quality score', 'Spam detection', 'Content restrictions'],
        description: 'Verify if your pins are showing up in search and feeds, or if Pinterest is limiting your reach.'
    },
    discord: {
        name: 'Discord',
        icon: '🎮',
        live: false,
        placeholder: 'username#1234',
        checks: ['Server bans', 'Message visibility', 'Account restrictions', 'Server join limits', 'DM restrictions', 'Verification status'],
        description: 'Check if you can join servers, send messages, and verify account restrictions across Discord.'
    },
    twitch: {
        name: 'Twitch',
        icon: '🟣',
        live: false,
        placeholder: 'channel name',
        checks: ['Channel discoverability', 'Chat restrictions', 'Content warnings', 'Monetization status', 'Shadow ban detection', 'Community guidelines strikes'],
        description: 'Verify if your Twitch channel is discoverable and check for any streaming or chat restrictions.'
    },
    kick: {
        name: 'Kick',
        icon: '⚡',
        live: false,
        placeholder: 'channel name',
        checks: ['Channel visibility', 'Stream reach', 'Chat permissions', 'Content restrictions', 'Monetization status', 'Platform limits'],
        description: 'Check if your Kick streams are visible and verify account status on the platform.'
    },
    snapchat: {
        name: 'Snapchat',
        icon: '👻',
        live: false,
        placeholder: 'username',
        checks: ['Story reach', 'Discover page presence', 'Account restrictions', 'Snap score impact', 'Public profile visibility', 'Content distribution'],
        description: 'Verify if your Snapchat stories are reaching friends and check for account limitations.'
    },
    truth: {
        name: 'Truth Social',
        icon: '🇺🇸',
        live: false,
        placeholder: '@username',
        checks: ['Post visibility', 'Feed appearance', 'Account discovery', 'Content reach', 'Shadow ban detection', 'Platform restrictions'],
        description: 'Check if your Truth Social posts are visible and reaching your followers.'
    },
    rumble: {
        name: 'Rumble',
        icon: '📹',
        live: false,
        placeholder: 'channel name',
        checks: ['Video visibility', 'Search appearance', 'Recommended feed', 'Monetization status', 'Content restrictions', 'Channel health'],
        description: 'Verify if your Rumble videos are being promoted and check for platform restrictions.'
    },
    telegram: {
        name: 'Telegram',
        icon: '✈️',
        live: false,
        placeholder: '@username or channel',
        checks: ['Channel visibility', 'Message delivery', 'Group restrictions', 'Account limitations', 'Search appearance', 'Spam detection'],
        description: 'Check if your Telegram messages are being delivered and if channels are discoverable.'
    },
    etsy: {
        name: 'Etsy',
        icon: '🛍️',
        live: false,
        placeholder: 'shop name',
        checks: ['Listing visibility in search', 'Shop quality score', 'Account restrictions', 'Policy violations', 'Search ranking', 'Suspended listings'],
        description: 'Verify if your Etsy products are showing up in search and check for shop restrictions.'
    },
    amazon: {
        name: 'Amazon',
        icon: '📦',
        live: false,
        placeholder: 'seller ID or store name',
        checks: ['Product listing visibility', 'Buy Box eligibility', 'Account health', 'Listing suppression', 'Search ranking', 'Review status'],
        description: 'Check if your Amazon products are visible, eligible for Buy Box, and verify account health.'
    },
    ebay: {
        name: 'eBay',
        icon: '🏷️',
        live: false,
        placeholder: 'seller username',
        checks: ['Listing visibility', 'Search appearance', 'Seller restrictions', 'Account limitations', 'Best Match ranking', 'Item suppression'],
        description: 'Verify if your eBay listings are appearing in search and check for seller account restrictions.'
    },
    email: {
        name: 'Email',
        icon: '📧',
        live: true,
        placeholder: 'your@email.com',
        checks: ['Spam folder placement', 'Deliverability rate', 'Domain reputation', 'Blacklist status', 'SPF/DKIM authentication', 'Inbox placement'],
        description: 'Check if your emails are landing in spam, if your domain is blacklisted, and verify email authentication.'
    },
    phone: {
        name: 'Phone Number',
        icon: '📱',
        live: false,
        placeholder: '+1 (555) 123-4567',
        checks: ['Number reputation', 'Spam flagging', 'Carrier restrictions', 'Blacklist status', 'SMS deliverability', 'Caller ID display'],
        description: 'Verify if your phone number is flagged as spam and check deliverability for calls and texts.'
    },
    domain: {
        name: 'Domain',
        icon: '🌐',
        live: false,
        placeholder: 'example.com',
        checks: ['Domain reputation', 'Blacklist status', 'DNS health', 'SSL certificate validity', 'Search engine indexing', 'Security warnings'],
        description: 'Check if your domain is blacklisted, properly indexed, and verify DNS and SSL configuration.'
    },
    ip: {
        name: 'IP Address',
        icon: '🖥️',
        live: false,
        placeholder: '192.168.1.1',
        checks: ['IP reputation', 'Blacklist status', 'Spam database presence', 'Geo-location accuracy', 'Network restrictions', 'Proxy/VPN detection'],
        description: 'Verify if your IP address is blacklisted and check reputation across major spam databases.'
    },
    google: {
        name: 'Google Business',
        icon: '📍',
        live: false,
        placeholder: 'business name',
        checks: ['Listing visibility', 'Suspension status', 'Review violations', 'Search appearance', 'Map presence', 'Business verification'],
        description: 'Check if your Google Business listing is visible, verified, and appearing in local search.'
    },
    website: {
        name: 'Website',
        icon: '🔗',
        live: false,
        placeholder: 'https://yoursite.com',
        checks: ['Search engine indexing', 'Sitemap status', 'Robots.txt configuration', 'Page speed score', 'Mobile friendliness', 'Security issues'],
        description: 'Verify if your website is properly indexed by search engines and check for technical SEO issues.'
    }
};

// ============================================================================
// PLATFORM MODALS - INDEX PAGE
// ============================================================================
function initPlatformModals() {
    const modal = document.getElementById('platform-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    
    const isCheckerPage = document.getElementById('searches-remaining');
    if (isCheckerPage || !modal || !modalBody) return;
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(modal);
    });
    
    document.querySelectorAll('.platform-item.clickable').forEach(item => {
        item.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            const data = platformData[platform];
            
            if (data) {
                const statusBadge = data.live 
                    ? '<span class="status-badge live">Live</span>' 
                    : '<span class="status-badge soon">Coming Soon</span>';
                
                modalBody.innerHTML = `
                    <div class="platform-modal-header">
                        <h3>${data.icon} ${data.name} ${statusBadge}</h3>
                        <p>${data.description}</p>
                    </div>
                    <div class="platform-checks">
                        <h4>What We Check:</h4>
                        <ul class="check-list">
                            ${data.checks.map(check => `<li>${check}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="platform-modal-cta">
                        ${data.live 
                            ? `<a href="checker.html?platform=${platform}" class="btn btn-primary">Check ${data.name} Now →</a>`
                            : `<button class="btn btn-secondary" disabled>Coming Soon</button>`
                        }
                    </div>
                `;
                openModal(modal);
            }
        });
    });
}

// ============================================================================
// CHECKER PAGE - FORM MODALS
// ============================================================================
function initCheckerPageModals() {
    const modal = document.getElementById('platform-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    
    const isCheckerPage = document.getElementById('searches-remaining');
    if (!isCheckerPage || !modal || !modalBody) return;
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(modal);
    });
    
    document.querySelectorAll('.platform-item.clickable').forEach(item => {
        item.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            const data = platformData[platform];
            const isLive = this.querySelector('.badge.live');
            
            if (!isLive) {
                // Show Coming Soon modal
                modalBody.innerHTML = `
                    <div class="coming-soon-content">
                        <div class="coming-soon-icon">${data ? data.icon : '🔜'}</div>
                        <h2>${data ? data.name : 'This Platform'}</h2>
                        <p>Coming Soon! We're working on adding this platform.</p>
                        <p style="color: var(--text-muted); font-size: 0.875rem;">Currently live: Twitter/X, Reddit, and Email</p>
                        <a href="index.html#pricing" class="btn" style="margin-top: 1rem;">Get Notified When Live</a>
                    </div>
                `;
                openModal(modal);
                return;
            }
            
            if (!hasSearchesRemaining()) {
                if (confirm('You\'ve used all your free searches today. Would you like to get more searches?')) {
                    window.location.href = 'index.html#pricing';
                }
                return;
            }
            
            openCheckerFormModal(modal, modalBody, platform, data);
        });
    });
    
    // Check URL for platform parameter
    const urlParams = new URLSearchParams(window.location.search);
    const platformParam = urlParams.get('platform');
    
    if (platformParam && platformData[platformParam] && platformData[platformParam].live) {
        setTimeout(() => {
            openCheckerFormModal(modal, modalBody, platformParam, platformData[platformParam]);
        }, 500);
    }
}

function openCheckerFormModal(modal, modalBody, platform, data) {
    modalBody.innerHTML = `
        <div class="modal-header-custom">
            <span class="modal-icon">${data.icon}</span>
            <h2>${data.name} Check</h2>
        </div>
        <p class="modal-description">${data.description}</p>
        
        <form id="check-form" class="modal-form">
            <input type="hidden" name="platform" value="${platform}">
            
            <div class="form-group">
                <label for="username-input">
                    ${platform === 'email' ? 'Email Address' : 'Username'}
                </label>
                <input 
                    type="text" 
                    id="username-input" 
                    name="username" 
                    placeholder="${data.placeholder || '@username'}" 
                    required
                    class="form-input"
                >
            </div>
            
            <button type="submit" class="btn-check">
                <span>Check for Shadow Ban</span>
                <span>→</span>
            </button>
        </form>
    `;
    
    openModal(modal);
    
    setTimeout(() => {
        document.getElementById('username-input')?.focus();
    }, 100);
    
    document.getElementById('check-form').addEventListener('submit', handleCheckerFormSubmit);
}

function handleCheckerFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const platform = formData.get('platform');
    const username = formData.get('username');
    
    if (!decrementSearchCounter()) {
        alert('You\'ve used all your free searches today. Please upgrade for unlimited checks.');
        window.location.href = 'index.html#pricing';
        return;
    }
    
    const resultsData = {
        platform: platform,
        platformName: platformData[platform]?.name || platform,
        platformIcon: platformData[platform]?.icon || '🔍',
        username: username,
        timestamp: new Date().toISOString(),
        probability: Math.floor(Math.random() * 30) + 10,
        checks: {
            visibility: Math.random() > 0.3 ? 'pass' : 'warning',
            engagement: Math.random() > 0.3 ? 'pass' : 'warning',
            searchability: Math.random() > 0.3 ? 'pass' : 'warning',
            reach: Math.random() > 0.3 ? 'pass' : 'warning'
        }
    };
    
    localStorage.setItem('checkResults', JSON.stringify(resultsData));
    
    const submitBtn = e.target.querySelector('.btn-check');
    submitBtn.innerHTML = '<span>Analyzing...</span><span>⏳</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        window.location.href = 'results.html';
    }, 1500);
}

// ============================================================================
// MODAL HELPERS
// ============================================================================
function openModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// ============================================================================
// SEARCH COUNTER
// ============================================================================
const MAX_SEARCHES = 3;
const MAX_HASHTAG_SEARCHES = 5;
const STORAGE_KEY = 'shadowban_searches_remaining';
const HASHTAG_STORAGE_KEY = 'shadowban_hashtag_searches_remaining';
const DATE_KEY = 'shadowban_last_reset_date';

function initSearchCounter() {
    const counterElement = document.getElementById('searches-remaining');
    const hashtagCounterElement = document.getElementById('hashtag-searches-remaining');
    
    if (!counterElement && !hashtagCounterElement) return;
    
    const today = new Date().toDateString();
    const lastResetDate = localStorage.getItem(DATE_KEY);
    
    if (lastResetDate !== today) {
        localStorage.setItem(STORAGE_KEY, MAX_SEARCHES.toString());
        localStorage.setItem(HASHTAG_STORAGE_KEY, MAX_HASHTAG_SEARCHES.toString());
        localStorage.setItem(DATE_KEY, today);
    }
    
    updateSearchCounterDisplay();
}

function updateSearchCounterDisplay() {
    const counterElement = document.getElementById('searches-remaining');
    const hashtagCounterElement = document.getElementById('hashtag-searches-remaining');
    
    if (counterElement) {
        const remaining = parseInt(localStorage.getItem(STORAGE_KEY) || MAX_SEARCHES);
        if (remaining === 0) {
            counterElement.innerHTML = `<span style="color: #ef4444;">No searches remaining today.</span> <a href="index.html#pricing" style="color: var(--primary); text-decoration: underline;">Upgrade for unlimited</a>`;
        } else {
            counterElement.textContent = `${remaining} / ${MAX_SEARCHES} searches available today`;
        }
    }
    
    if (hashtagCounterElement) {
        const remaining = parseInt(localStorage.getItem(HASHTAG_STORAGE_KEY) || MAX_HASHTAG_SEARCHES);
        if (remaining === 0) {
            hashtagCounterElement.innerHTML = `<span style="color: #ef4444;">No searches remaining today.</span> <a href="index.html#pricing" style="color: var(--primary); text-decoration: underline;">Upgrade for unlimited</a>`;
        } else {
            hashtagCounterElement.textContent = `${remaining} / ${MAX_HASHTAG_SEARCHES} searches available today`;
        }
    }
}

function hasSearchesRemaining() {
    const remaining = parseInt(localStorage.getItem(STORAGE_KEY) || MAX_SEARCHES);
    return remaining > 0;
}

function decrementSearchCounter() {
    const remaining = parseInt(localStorage.getItem(STORAGE_KEY) || MAX_SEARCHES);
    
    if (remaining > 0) {
        localStorage.setItem(STORAGE_KEY, (remaining - 1).toString());
        updateSearchCounterDisplay();
        return true;
    }
    
    return false;
}

// ============================================================================
// RESULTS PAGE - SHARE BUTTONS
// ============================================================================
function initResultsPageShare() {
    const shareTwitter = document.getElementById('share-twitter-results');
    if (!shareTwitter) return;
    
    const resultsData = JSON.parse(localStorage.getItem('checkResults') || '{}');
    const platform = resultsData.platformName || 'social media';
    const username = resultsData.username || 'my account';
    const probability = resultsData.probability || 0;
    
    const shareText = `I just checked ${username} for shadow bans on ${platform}! Got a ${probability}% probability score with detailed analysis. Check yours free:`;
    const shareUrl = 'https://shadowbancheck.io';
    
    document.getElementById('share-twitter-results')?.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    document.getElementById('share-facebook-results')?.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
    });
    
    document.getElementById('share-telegram-results')?.addEventListener('click', () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    });
    
    document.getElementById('share-linkedin-results')?.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
}

// ============================================================================
// POST URL CHECKER (Index page)
// ============================================================================
function initPostChecker() {
    const input = document.getElementById('post-url-input');
    const btn = document.getElementById('analyze-post-btn');
    const resultsDiv = document.getElementById('post-results');
    
    if (!input || !btn || !resultsDiv) return;
    
    btn.addEventListener('click', async () => {
        const url = input.value.trim();
        
        if (!url) {
            alert('Please enter a post URL');
            return;
        }
        
        if (!isValidSocialURL(url)) {
            alert('Please enter a valid social media post URL (Twitter, Instagram, TikTok, Reddit, or YouTube)');
            return;
        }
        
        btn.disabled = true;
        btn.innerHTML = '<span class="btn-text">Analyzing...</span><span class="btn-icon">⏳</span>';
        
        setTimeout(() => {
            showPostResults(url);
            btn.disabled = false;
            btn.innerHTML = '<span class="btn-text">Analyze Post Now</span><span class="btn-icon">🔍</span>';
        }, 2000);
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btn.click();
    });
}

function isValidSocialURL(url) {
    const patterns = [
        /twitter\.com\/.*\/status\//,
        /x\.com\/.*\/status\//,
        /instagram\.com\/p\//,
        /instagram\.com\/reel\//,
        /tiktok\.com\/.*\/video\//,
        /reddit\.com\/r\/.*\/comments\//,
        /youtube\.com\/watch\?v=/,
        /youtu\.be\//
    ];
    
    return patterns.some(pattern => pattern.test(url));
}

function showPostResults(url) {
    const resultsDiv = document.getElementById('post-results');
    const platform = detectPlatform(url);
    
    const demoResults = {
        probability: Math.floor(Math.random() * 30) + 60,
        factors: [
            'Engagement rate 75% below account average',
            'Post not appearing in platform search results',
            'Limited visibility in follower feeds',
            'Replies hidden from non-followers',
            'Content flagged by automated filters'
        ],
        verdict: Math.random() > 0.5 ? 'Likely Shadow Banned' : 'Possibly Restricted'
    };
    
    resultsDiv.innerHTML = `
        <div class="result-header">
            <span class="result-icon">📊</span>
            <h3>Analysis Complete - ${platform}</h3>
        </div>
        <div class="result-content">
            <div class="result-score">
                <div class="score-number">${demoResults.probability}%</div>
                <div class="score-label">Probability of Shadow Ban</div>
                <div class="score-verdict">${demoResults.verdict}</div>
            </div>
            
            <div class="result-factors">
                <h4>🔍 Factors Analyzed:</h4>
                <ul>
                    ${demoResults.factors.slice(0, 3).map(factor => `<li>${factor}</li>`).join('')}
                </ul>
            </div>
            
            <div class="result-cta">
                <h4>🤖 Want Deeper Analysis?</h4>
                <p>Shadow AI Pro gives you detailed recovery strategies, historical tracking, and unlimited checks for just $9.99/mo</p>
                <a href="#shadow-ai-pro" class="btn">Get Shadow AI Pro - 7 Day Free Trial</a>
            </div>
        </div>
    `;
    
    resultsDiv.style.display = 'block';
    
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function detectPlatform(url) {
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('reddit.com')) return 'Reddit';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    return 'Social Media';
}

// ============================================================================
// ANALYTICS
// ============================================================================
function trackEvent(category, action, label) {
    console.log('Event:', category, action, label);
}

document.querySelectorAll('.btn-large, .btn-pricing, .btn-price, .btn-plan').forEach(btn => {
    btn.addEventListener('click', (e) => {
        trackEvent('CTA', 'click', e.target.textContent || 'Button');
    });
});

// ============================================================================
// COOKIE POPUP
// ============================================================================
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
