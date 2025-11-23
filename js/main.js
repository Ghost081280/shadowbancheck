// ShadowBanCheck.io - Main JS (Index Page)
// Includes: Smooth scroll, animations, social share, platform modals

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initScrollAnimations();
    initTryAIButton();
    initSocialShare();
    initPlatformModals();
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

    // Observe all animated elements
    document.querySelectorAll('.option-card, .platform-item, .step, .price-card, .audience-card, .ai-plan').forEach(el => {
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
    
    // Twitter/X
    const twitterBtn = document.getElementById('share-twitter');
    if (twitterBtn) {
        twitterBtn.addEventListener('click', () => {
            window.open(
                `https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}`,
                '_blank',
                'width=600,height=400'
            );
        });
    }
    
    // Facebook
    const facebookBtn = document.getElementById('share-facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => {
            window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${shareURL}`,
                '_blank',
                'width=600,height=400'
            );
        });
    }
    
    // Telegram
    const telegramBtn = document.getElementById('share-telegram');
    if (telegramBtn) {
        telegramBtn.addEventListener('click', () => {
            window.open(
                `https://t.me/share/url?url=${shareURL}&text=${shareText}`,
                '_blank',
                'width=600,height=400'
            );
        });
    }
    
    // LinkedIn
    const linkedinBtn = document.getElementById('share-linkedin');
    if (linkedinBtn) {
        linkedinBtn.addEventListener('click', () => {
            window.open(
                `https://www.linkedin.com/sharing/share-offsite/?url=${shareURL}`,
                '_blank',
                'width=600,height=400'
            );
        });
    }
}

// ============================================================================
// PLATFORM MODALS
// ============================================================================
const platformData = {
    twitter: {
        name: 'Twitter / X',
        icon: '🐦',
        checks: [
            'Search visibility for tweets',
            'Reply thread visibility',
            'Tweet impressions and reach',
            'Profile discoverability',
            'Hashtag performance',
            'Shadowban detection'
        ],
        description: 'We check if your tweets appear in search, if replies are visible to others, and if your content is being algorithmically suppressed.'
    },
    instagram: {
        name: 'Instagram',
        icon: '📸',
        checks: [
            'Post visibility in feeds',
            'Story reach',
            'Hashtag bans',
            'Explore page appearance',
            'Shadow ban status',
            'Account restrictions'
        ],
        description: 'Verify if your posts are showing up in feeds, if hashtags are working, and if Instagram is limiting your reach.'
    },
    tiktok: {
        name: 'TikTok',
        icon: '🎵',
        checks: [
            'For You Page visibility',
            'Video reach and views',
            'Hashtag suppression',
            'Account restrictions',
            'Shadow ban detection',
            'Content violations'
        ],
        description: 'Check if your videos are being shown on the For You Page and if TikTok is limiting your content distribution.'
    },
    facebook: {
        name: 'Facebook',
        icon: '📘',
        checks: [
            'Post reach and visibility',
            'Page distribution',
            'Content restrictions',
            'Account status',
            'News Feed appearance',
            'Ad account health'
        ],
        description: 'Verify if your posts are reaching followers, if your page is being suppressed, and check for content restrictions.'
    },
    reddit: {
        name: 'Reddit',
        icon: '🤖',
        checks: [
            'Post visibility in subreddits',
            'Comment visibility',
            'Karma tracking',
            'Subreddit-specific bans',
            'Shadowban status',
            'Account age restrictions'
        ],
        description: 'Check if your posts and comments are visible to others, or if you\'ve been shadowbanned from specific subreddits.'
    },
    linkedin: {
        name: 'LinkedIn',
        icon: '💼',
        checks: [
            'Post reach and engagement',
            'Profile visibility in search',
            'Content distribution',
            'Connection request limits',
            'Account restrictions',
            'Messaging capabilities'
        ],
        description: 'Verify if your professional content is reaching your network and if LinkedIn is limiting your visibility.'
    },
    threads: {
        name: 'Threads',
        icon: '🧵',
        checks: [
            'Post visibility in feeds',
            'Reply visibility',
            'Account discoverability',
            'Content reach',
            'Shadow ban detection',
            'Algorithm suppression'
        ],
        description: 'Check if your Threads posts are visible to followers and if Meta is suppressing your content.'
    },
    bluesky: {
        name: 'Bluesky',
        icon: '🦋',
        checks: [
            'Post visibility',
            'Feed appearance',
            'Account discoverability',
            'Content moderation status',
            'Reach metrics',
            'Algorithmic promotion'
        ],
        description: 'Verify if your Bluesky posts are reaching your audience and check for any content restrictions.'
    },
    youtube: {
        name: 'YouTube',
        icon: '📺',
        checks: [
            'Video visibility in search',
            'Recommended feed appearance',
            'Monetization status',
            'Comment visibility',
            'Channel restrictions',
            'Age restrictions'
        ],
        description: 'Check if your videos are being recommended, appearing in search, and if YouTube is limiting your channel.'
    },
    pinterest: {
        name: 'Pinterest',
        icon: '📌',
        checks: [
            'Pin visibility in feeds',
            'Search appearance',
            'Board distribution',
            'Account quality score',
            'Spam detection',
            'Content restrictions'
        ],
        description: 'Verify if your pins are showing up in search and feeds, or if Pinterest is limiting your reach.'
    },
    discord: {
        name: 'Discord',
        icon: '🎮',
        checks: [
            'Server bans',
            'Message visibility',
            'Account restrictions',
            'Server join limits',
            'DM restrictions',
            'Verification status'
        ],
        description: 'Check if you can join servers, send messages, and verify account restrictions across Discord.'
    },
    twitch: {
        name: 'Twitch',
        icon: '🟣',
        checks: [
            'Channel discoverability',
            'Chat restrictions',
            'Content warnings',
            'Monetization status',
            'Shadow ban detection',
            'Community guidelines strikes'
        ],
        description: 'Verify if your Twitch channel is discoverable and check for any streaming or chat restrictions.'
    },
    kick: {
        name: 'Kick',
        icon: '⚡',
        checks: [
            'Channel visibility',
            'Stream reach',
            'Chat permissions',
            'Content restrictions',
            'Monetization status',
            'Platform limits'
        ],
        description: 'Check if your Kick streams are visible and verify account status on the platform.'
    },
    snapchat: {
        name: 'Snapchat',
        icon: '👻',
        checks: [
            'Story reach',
            'Discover page presence',
            'Account restrictions',
            'Snap score impact',
            'Public profile visibility',
            'Content distribution'
        ],
        description: 'Verify if your Snapchat stories are reaching friends and check for account limitations.'
    },
    truth: {
        name: 'Truth Social',
        icon: '🇺🇸',
        checks: [
            'Post visibility',
            'Feed appearance',
            'Account discovery',
            'Content reach',
            'Shadow ban detection',
            'Platform restrictions'
        ],
        description: 'Check if your Truth Social posts are visible and reaching your followers.'
    },
    rumble: {
        name: 'Rumble',
        icon: '📹',
        checks: [
            'Video visibility',
            'Search appearance',
            'Recommended feed',
            'Monetization status',
            'Content restrictions',
            'Channel health'
        ],
        description: 'Verify if your Rumble videos are being promoted and check for platform restrictions.'
    },
    telegram: {
        name: 'Telegram',
        icon: '✈️',
        checks: [
            'Channel visibility',
            'Message delivery',
            'Group restrictions',
            'Account limitations',
            'Search appearance',
            'Spam detection'
        ],
        description: 'Check if your Telegram messages are being delivered and if channels are discoverable.'
    },
    etsy: {
        name: 'Etsy',
        icon: '🛍️',
        checks: [
            'Listing visibility in search',
            'Shop quality score',
            'Account restrictions',
            'Policy violations',
            'Search ranking',
            'Suspended listings'
        ],
        description: 'Verify if your Etsy products are showing up in search and check for shop restrictions.'
    },
    amazon: {
        name: 'Amazon',
        icon: '📦',
        checks: [
            'Product listing visibility',
            'Buy Box eligibility',
            'Account health',
            'Listing suppression',
            'Search ranking',
            'Review status'
        ],
        description: 'Check if your Amazon products are visible, eligible for Buy Box, and verify account health.'
    },
    ebay: {
        name: 'eBay',
        icon: '🏷️',
        checks: [
            'Listing visibility',
            'Search appearance',
            'Seller restrictions',
            'Account limitations',
            'Best Match ranking',
            'Item suppression'
        ],
        description: 'Verify if your eBay listings are appearing in search and check for seller account restrictions.'
    },
    email: {
        name: 'Email',
        icon: '📧',
        checks: [
            'Spam folder placement',
            'Deliverability rate',
            'Domain reputation',
            'Blacklist status',
            'SPF/DKIM authentication',
            'Inbox placement'
        ],
        description: 'Check if your emails are landing in spam, if your domain is blacklisted, and verify email authentication.'
    },
    phone: {
        name: 'Phone Number',
        icon: '📱',
        checks: [
            'Number reputation',
            'Spam flagging',
            'Carrier restrictions',
            'Blacklist status',
            'SMS deliverability',
            'Caller ID display'
        ],
        description: 'Verify if your phone number is flagged as spam and check deliverability for calls and texts.'
    },
    domain: {
        name: 'Domain',
        icon: '🌐',
        checks: [
            'Domain reputation',
            'Blacklist status',
            'DNS health',
            'SSL certificate validity',
            'Search engine indexing',
            'Security warnings'
        ],
        description: 'Check if your domain is blacklisted, properly indexed, and verify DNS and SSL configuration.'
    },
    ip: {
        name: 'IP Address',
        icon: '🖥️',
        checks: [
            'IP reputation',
            'Blacklist status',
            'Spam database presence',
            'Geo-location accuracy',
            'Network restrictions',
            'Proxy/VPN detection'
        ],
        description: 'Verify if your IP address is blacklisted and check reputation across major spam databases.'
    },
    google: {
        name: 'Google Business',
        icon: '📍',
        checks: [
            'Listing visibility',
            'Suspension status',
            'Review violations',
            'Search appearance',
            'Map presence',
            'Business verification'
        ],
        description: 'Check if your Google Business listing is visible, verified, and appearing in local search.'
    },
    website: {
        name: 'Website',
        icon: '🔗',
        checks: [
            'Search engine indexing',
            'Sitemap status',
            'Robots.txt configuration',
            'Page speed score',
            'Mobile friendliness',
            'Security issues'
        ],
        description: 'Verify if your website is properly indexed by search engines and check for technical SEO issues.'
    }
};

function initPlatformModals() {
    const modal = document.getElementById('platform-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    
    if (!modal || !modalBody || !closeBtn) return;
    
    // Click outside modal to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close button
    closeBtn.addEventListener('click', function() {
        closeModal();
    });
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // Platform items click
    document.querySelectorAll('.platform-item.clickable').forEach(item => {
        item.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            const data = platformData[platform];
            
            if (data) {
                modalBody.innerHTML = `
                    <div class="platform-modal-header">
                        <h3>${data.icon} ${data.name}</h3>
                        <p>${data.description}</p>
                    </div>
                    <div class="platform-checks">
                        <h4>What We Check:</h4>
                        <ul class="check-list">
                            ${data.checks.map(check => `<li>${check}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="platform-modal-cta">
                        <a href="checker.html" class="btn btn-primary">Check ${data.name} Now →</a>
                    </div>
                `;
                openModal();
            }
        });
    });
    
    function openModal() {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// ============================================================================
// ANALYTICS TRACKING
// ============================================================================
function trackEvent(category, action, label) {
    console.log('Event:', category, action, label);
    // TODO: Integrate with Google Analytics
    // Example: gtag('event', action, { 'event_category': category, 'event_label': label });
}

// Track CTA clicks
document.querySelectorAll('.btn-large, .btn-pricing, .btn-price, .btn-plan').forEach(btn => {
    btn.addEventListener('click', (e) => {
        trackEvent('CTA', 'click', e.target.textContent || 'Button');
    });
});

// ============================================================================
// POST URL CHECKER
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
        
        // Validate URL
        if (!isValidSocialURL(url)) {
            alert('Please enter a valid social media post URL (Twitter, Instagram, TikTok, Reddit, or YouTube)');
            return;
        }
        
        // Show loading state
        btn.disabled = true;
        btn.innerHTML = '<span class="btn-text">Analyzing...</span><span class="btn-icon">⏳</span>';
        
        // Simulate analysis (replace with real API call later)
        setTimeout(() => {
            showResults(url);
            btn.disabled = false;
            btn.innerHTML = '<span class="btn-text">Analyze Post Now</span><span class="btn-icon">🔍</span>';
        }, 2000);
    });
    
    // Allow Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btn.click();
        }
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

function showResults(url) {
    const resultsDiv = document.getElementById('post-results');
    const platform = detectPlatform(url);
    
    // Demo results (replace with real API data later)
    const demoResults = {
        probability: Math.floor(Math.random() * 30) + 60, // 60-90%
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
    
    // Smooth scroll to results
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initPostChecker();
});
