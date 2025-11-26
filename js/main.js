/* =============================================================================
   MAIN.JS - SHARED FUNCTIONALITY
   All global functionality for ShadowBanCheck.io
   
   NOTE: platformData is now loaded from platforms.js (loaded before this file)
   NOTE: Demo chat animation moved to shadow-ai.js
   ============================================================================= */

/* =============================================================================
   IP DETECTION
   Fetches user's IP and determines if VPN/Datacenter/Residential
   ============================================================================= */
let userIPData = null;

async function detectUserIP() {
    try {
        // Use ipapi.co for HTTPS-compatible IP info (includes VPN detection)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.ip) {
            let ipType = 'residential';
            let typeLabel = 'Residential';
            
            // ipapi.co doesn't have proxy detection in free tier, but we can infer from org/ASN
            const orgLower = (data.org || '').toLowerCase();
            const asnLower = (data.asn || '').toLowerCase();
            
            // Check for common VPN/datacenter indicators
            const vpnKeywords = ['vpn', 'proxy', 'tunnel', 'anonymous', 'private'];
            const datacenterKeywords = ['hosting', 'cloud', 'server', 'data center', 'datacenter', 'amazon', 'google', 'microsoft', 'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner'];
            
            const isLikelyVPN = vpnKeywords.some(kw => orgLower.includes(kw) || asnLower.includes(kw));
            const isLikelyDatacenter = datacenterKeywords.some(kw => orgLower.includes(kw) || asnLower.includes(kw));
            
            if (isLikelyVPN) {
                ipType = 'vpn';
                typeLabel = 'VPN/Proxy';
            } else if (isLikelyDatacenter) {
                ipType = 'datacenter';
                typeLabel = 'Datacenter';
            }
            
            userIPData = {
                ip: data.ip,
                country: data.country_name,
                city: data.city,
                isp: data.org,
                type: ipType,
                typeLabel: typeLabel,
                isVPN: isLikelyVPN,
                isDatacenter: isLikelyDatacenter,
                isMobile: false
            };
            
            // Update display if element exists
            updateIPDisplay();
            
            return userIPData;
        }
    } catch (error) {
        console.log('IP detection failed, using fallback');
        // Fallback - try ipify for just the IP
        try {
            const fallback = await fetch('https://api.ipify.org?format=json');
            const fallbackData = await fallback.json();
            userIPData = {
                ip: fallbackData.ip,
                type: 'unknown',
                typeLabel: 'Unknown'
            };
            updateIPDisplay();
            return userIPData;
        } catch (e) {
            userIPData = { ip: 'Unable to detect', type: 'unknown', typeLabel: '' };
            updateIPDisplay();
        }
    }
    return userIPData;
}

function updateIPDisplay() {
    const ipValueEl = document.getElementById('user-ip-address');
    const ipTypeEl = document.getElementById('user-ip-type');
    
    if (ipValueEl && userIPData) {
        ipValueEl.textContent = userIPData.ip;
        
        if (ipTypeEl && userIPData.typeLabel) {
            ipTypeEl.textContent = userIPData.typeLabel;
            ipTypeEl.className = 'ip-type ' + userIPData.type;
        }
    }
}

function getUserIPData() {
    return userIPData;
}

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
   POWER CHECK - 3-IN-1 ANALYSIS MODULE
   ============================================================================= */
const POWER_CHECK_STORAGE_KEY = 'shadowban_power_check_timestamp';

function canRunPowerCheck() {
    const lastCheck = localStorage.getItem(POWER_CHECK_STORAGE_KEY);
    if (!lastCheck) return true;
    
    const lastCheckTime = new Date(parseInt(lastCheck));
    const now = new Date();
    const hoursSince = (now - lastCheckTime) / (1000 * 60 * 60);
    
    return hoursSince >= 24;
}

function recordPowerCheck() {
    localStorage.setItem(POWER_CHECK_STORAGE_KEY, Date.now().toString());
}

function getTimeUntilNextPowerCheck() {
    const lastCheck = localStorage.getItem(POWER_CHECK_STORAGE_KEY);
    if (!lastCheck) return null;
    
    const lastCheckTime = new Date(parseInt(lastCheck));
    const nextCheckTime = new Date(lastCheckTime.getTime() + (24 * 60 * 60 * 1000));
    const now = new Date();
    const msUntil = nextCheckTime - now;
    
    if (msUntil <= 0) return null;
    
    const hours = Math.floor(msUntil / (1000 * 60 * 60));
    const minutes = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
}

function detectPlatformFromUrl(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
        return { name: 'Twitter/X', icon: '🐦', key: 'twitter' };
    } else if (urlLower.includes('reddit.com')) {
        return { name: 'Reddit', icon: '🤖', key: 'reddit' };
    } else if (urlLower.includes('instagram.com')) {
        return { name: 'Instagram', icon: '📸', key: 'instagram' };
    } else if (urlLower.includes('tiktok.com')) {
        return { name: 'TikTok', icon: '🎵', key: 'tiktok' };
    } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
        return { name: 'Facebook', icon: '📘', key: 'facebook' };
    } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return { name: 'YouTube', icon: '📺', key: 'youtube' };
    } else if (urlLower.includes('linkedin.com')) {
        return { name: 'LinkedIn', icon: '💼', key: 'linkedin' };
    } else if (urlLower.includes('threads.net')) {
        return { name: 'Threads', icon: '🧵', key: 'threads' };
    }
    
    return { name: 'Unknown Platform', icon: '🔗', key: 'unknown' };
}

function extractUsernameFromUrl(url, platform) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        // Twitter/X: /username/status/123 or /@username/status/123
        if (platform.key === 'twitter') {
            const match = pathname.match(/^\/?@?([a-zA-Z0-9_]+)/);
            if (match) return '@' + match[1];
        }
        
        // Reddit: /r/subreddit/comments/... or /user/username
        if (platform.key === 'reddit') {
            const userMatch = pathname.match(/\/u(?:ser)?\/([a-zA-Z0-9_-]+)/);
            if (userMatch) return 'u/' + userMatch[1];
            const subMatch = pathname.match(/\/r\/([a-zA-Z0-9_]+)/);
            if (subMatch) return 'r/' + subMatch[1];
        }
        
        // Instagram: /p/CODE or /username
        if (platform.key === 'instagram') {
            const match = pathname.match(/^\/?([a-zA-Z0-9_.]+)/);
            if (match && match[1] !== 'p' && match[1] !== 'reel') return '@' + match[1];
        }
        
        // TikTok: /@username/video/123
        if (platform.key === 'tiktok') {
            const match = pathname.match(/^\/?@([a-zA-Z0-9_.]+)/);
            if (match) return '@' + match[1];
        }
        
    } catch (e) {
        console.warn('Error parsing URL:', e);
    }
    
    // Fallback: generate demo username
    const demoUsernames = ['@socialuser', '@creator123', '@myaccount', '@brandpage'];
    return demoUsernames[Math.floor(Math.random() * demoUsernames.length)];
}

function generateDemoHashtags(platform) {
    const hashtagPools = {
        twitter: {
            safe: ['#Tech', '#News', '#Coding', '#Business', '#Marketing'],
            warning: ['#FollowBack', '#TeamFollowBack', '#Follow4Follow', '#GainWithXtina'],
            danger: ['#NSFW', '#Leaked', '#Giveaway', '#Free']
        },
        instagram: {
            safe: ['#Photography', '#Travel', '#Food', '#Art', '#Fitness'],
            warning: ['#Like4Like', '#FollowForFollow', '#InstaGood', '#PicOfTheDay'],
            danger: ['#Adult', '#DM', '#Promo', '#Spam']
        },
        tiktok: {
            safe: ['#ForYou', '#Viral', '#Trending', '#Dance', '#Comedy'],
            warning: ['#FYP', '#BlowThisUp', '#MakeThisViral', '#DuetThis'],
            danger: ['#Free', '#Giveaway', '#MoneyHack', '#GetRich']
        },
        reddit: {
            safe: ['#AMA', '#Discussion', '#News', '#Question'],
            warning: ['#Controversial', '#Unpopular', '#Debate'],
            danger: ['#Spam', '#Promo', '#Shill']
        },
        default: {
            safe: ['#Content', '#Social', '#Online'],
            warning: ['#Follow', '#Like', '#Share'],
            danger: ['#Free', '#Promo', '#Ad']
        }
    };
    
    const pool = hashtagPools[platform.key] || hashtagPools.default;
    const count = Math.floor(Math.random() * 4) + 2;
    const hashtags = [];
    const weights = [0.5, 0.3, 0.2];
    
    for (let i = 0; i < count; i++) {
        const rand = Math.random();
        let category;
        if (rand < weights[0]) category = 'safe';
        else if (rand < weights[0] + weights[1]) category = 'warning';
        else category = 'danger';
        
        const categoryHashtags = pool[category];
        const tag = categoryHashtags[Math.floor(Math.random() * categoryHashtags.length)];
        
        if (!hashtags.find(h => h.tag === tag)) {
            hashtags.push({ tag, status: category });
        }
    }
    
    return hashtags;
}

function generateDemoResults(platform, username, hashtags) {
    const postScore = Math.floor(Math.random() * 40) + 5;
    const accountScore = Math.floor(Math.random() * 50) + 10;
    
    let hashtagScore = 0;
    hashtags.forEach(h => {
        if (h.status === 'safe') hashtagScore += 5;
        else if (h.status === 'warning') hashtagScore += 25;
        else hashtagScore += 50;
    });
    hashtagScore = Math.min(Math.floor(hashtagScore / hashtags.length), 100);
    
    const overallScore = Math.floor((postScore * 0.35) + (accountScore * 0.35) + (hashtagScore * 0.30));
    
    const postFactors = generatePostFactors(platform, postScore);
    const accountFactors = generateAccountFactors(platform, accountScore);
    const hashtagFactors = generateHashtagFactors(hashtags);
    
    return {
        platform,
        username,
        hashtags,
        scores: { overall: overallScore, post: postScore, account: accountScore, hashtag: hashtagScore },
        factors: { post: postFactors, account: accountFactors, hashtag: hashtagFactors }
    };
}

function generatePostFactors(platform, score) {
    const factors = [];
    
    if (platform.key === 'twitter') {
        if (score < 30) {
            factors.push({ status: 'good', text: 'Post appears in search results' });
            factors.push({ status: 'good', text: 'Visible to logged-out users' });
            factors.push({ status: 'good', text: 'Engagement rate normal' });
        } else if (score < 60) {
            factors.push({ status: 'good', text: 'Post appears in search results' });
            factors.push({ status: 'warning', text: 'Lower engagement than expected' });
            factors.push({ status: 'warning', text: 'May be quality-filtered' });
        } else {
            factors.push({ status: 'warning', text: 'Limited search visibility' });
            factors.push({ status: 'bad', text: 'Significantly lower engagement' });
            factors.push({ status: 'bad', text: 'Quality filter likely applied' });
        }
    } else if (platform.key === 'reddit') {
        if (score < 30) {
            factors.push({ status: 'good', text: 'Post visible in subreddit' });
            factors.push({ status: 'good', text: 'Not caught by spam filter' });
            factors.push({ status: 'good', text: 'Comments appearing normally' });
        } else {
            factors.push({ status: 'good', text: 'Post exists and accessible' });
            factors.push({ status: 'warning', text: 'May be filtered in some feeds' });
            factors.push({ status: 'warning', text: 'Karma threshold concerns' });
        }
    } else {
        if (score < 30) {
            factors.push({ status: 'good', text: 'Post visible to public' });
            factors.push({ status: 'good', text: 'Normal reach detected' });
        } else {
            factors.push({ status: 'good', text: 'Post accessible' });
            factors.push({ status: 'warning', text: 'Reach may be limited' });
        }
    }
    
    return factors;
}

function generateAccountFactors(platform, score) {
    const factors = [];
    
    if (platform.key === 'twitter') {
        if (score < 25) {
            factors.push({ status: 'good', text: 'Profile accessible' });
            factors.push({ status: 'good', text: 'Not search banned' });
            factors.push({ status: 'good', text: 'QFD not detected' });
        } else if (score < 50) {
            factors.push({ status: 'good', text: 'Profile accessible' });
            factors.push({ status: 'good', text: 'Not search banned' });
            factors.push({ status: 'warning', text: 'QFD partially enabled' });
        } else {
            factors.push({ status: 'good', text: 'Profile accessible' });
            factors.push({ status: 'warning', text: 'Some search restrictions' });
            factors.push({ status: 'bad', text: 'Reply deboosting detected' });
        }
    } else if (platform.key === 'reddit') {
        if (score < 30) {
            factors.push({ status: 'good', text: 'Account not shadowbanned' });
            factors.push({ status: 'good', text: 'Profile page accessible' });
        } else {
            factors.push({ status: 'good', text: 'Account exists' });
            factors.push({ status: 'warning', text: 'Some subreddit restrictions' });
        }
    } else {
        if (score < 30) {
            factors.push({ status: 'good', text: 'Account in good standing' });
            factors.push({ status: 'good', text: 'No restrictions detected' });
        } else {
            factors.push({ status: 'good', text: 'Account active' });
            factors.push({ status: 'warning', text: 'Possible reach limitations' });
        }
    }
    
    return factors;
}

function generateHashtagFactors(hashtags) {
    const factors = [];
    const safeCount = hashtags.filter(h => h.status === 'safe').length;
    const warningCount = hashtags.filter(h => h.status === 'warning').length;
    const dangerCount = hashtags.filter(h => h.status === 'danger').length;
    
    if (safeCount > 0) factors.push({ status: 'good', text: `${safeCount} hashtag${safeCount > 1 ? 's' : ''} safe` });
    if (warningCount > 0) factors.push({ status: 'warning', text: `${warningCount} hashtag${warningCount > 1 ? 's' : ''} low-reach` });
    if (dangerCount > 0) factors.push({ status: 'bad', text: `${dangerCount} hashtag${dangerCount > 1 ? 's' : ''} restricted` });
    
    return factors;
}

function getDataSources(platform) {
    // Universal data sources - our Engine collects from multiple places
    return [
        { icon: '🔌', title: 'Platform APIs', desc: 'Direct integration where available' },
        { icon: '🤖', title: 'AI Web Analysis', desc: '3rd party scraping & pattern detection' },
        { icon: '📊', title: 'Historical Data', desc: 'Baseline comparison & trend analysis' }
    ];
}

function renderPowerResults(results) {
    const resultsSection = document.getElementById('power-results');
    if (!resultsSection) return;
    
    // Overall section
    const overallIcon = document.getElementById('overall-icon');
    const overallPlatform = document.getElementById('overall-platform');
    const overallScoreCircle = document.getElementById('overall-score-circle');
    const overallScoreValue = document.getElementById('overall-score-value');
    
    if (overallIcon) overallIcon.textContent = results.platform.icon;
    if (overallPlatform) {
        overallPlatform.textContent = `${results.platform.name} • ${results.username} • ${results.hashtags.length} hashtags detected`;
    }
    if (overallScoreValue) overallScoreValue.textContent = results.scores.overall + '%';
    if (overallScoreCircle) {
        overallScoreCircle.classList.remove('warning', 'danger');
        if (results.scores.overall >= 60) overallScoreCircle.classList.add('danger');
        else if (results.scores.overall >= 35) overallScoreCircle.classList.add('warning');
    }
    
    // Post panel
    renderPanel('post', results.scores.post, results.factors.post);
    
    // Account panel
    const accountUsername = document.getElementById('account-username');
    if (accountUsername) accountUsername.textContent = results.username;
    renderPanel('account', results.scores.account, results.factors.account);
    
    // Hashtag panel
    const hashtagCount = document.getElementById('hashtag-count');
    if (hashtagCount) hashtagCount.textContent = `${results.hashtags.length} hashtags detected`;
    
    const hashtagList = document.getElementById('hashtag-list');
    if (hashtagList) {
        hashtagList.innerHTML = results.hashtags.map(h => 
            `<span class="hashtag-tag ${h.status}">${h.tag}</span>`
        ).join('');
    }
    renderPanel('hashtag', results.scores.hashtag, results.factors.hashtag);
    
    // Data sources
    const sourcesGrid = document.getElementById('sources-grid');
    if (sourcesGrid) {
        const sources = getDataSources(results.platform);
        sourcesGrid.innerHTML = sources.map(s => `
            <div class="source-item">
                <span class="source-icon">${s.icon}</span>
                <div>
                    <strong>${s.title}</strong>
                    <p>${s.desc}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Show results
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPanel(type, score, factors) {
    const panelScore = document.getElementById(`${type}-score`);
    const panelFactors = document.getElementById(`${type}-factors`);
    
    if (panelScore) {
        const scoreValue = panelScore.querySelector('.panel-score-value');
        if (scoreValue) scoreValue.textContent = score + '%';
        
        panelScore.classList.remove('warning', 'danger');
        if (score >= 60) panelScore.classList.add('danger');
        else if (score >= 35) panelScore.classList.add('warning');
    }
    
    if (panelFactors) {
        panelFactors.innerHTML = factors.map(f => {
            const icon = f.status === 'good' ? '✓' : f.status === 'warning' ? '⚠' : '✗';
            return `<li class="factor-${f.status}"><span>${icon}</span>${f.text}</li>`;
        }).join('');
    }
}

function openPowerInfoModal() {
    const modal = document.getElementById('power-info-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setupModalClose(modal);
}

function openLimitModal(timeLeft) {
    const modal = document.getElementById('limit-modal');
    if (!modal) return;
    
    const timeDisplay = document.getElementById('limit-time-remaining');
    if (timeDisplay && timeLeft) {
        timeDisplay.innerHTML = `Next free check available in: <strong>${timeLeft.hours}h ${timeLeft.minutes}m</strong>`;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setupModalClose(modal);
}

function closeLimitModal() {
    const modal = document.getElementById('limit-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function setupModalClose(modal) {
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    closeBtn?.addEventListener('click', closeModal, { once: true });
    overlay?.addEventListener('click', closeModal, { once: true });
    
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

window.closeLimitModal = closeLimitModal;

function initPowerCheck() {
    const form = document.getElementById('power-check-form');
    const input = document.getElementById('power-url-input');
    const button = document.getElementById('power-analyze-btn');
    const infoBtn = document.getElementById('power-info-btn');
    const checkAnotherBtn = document.getElementById('power-check-another-btn');
    const resultsSection = document.getElementById('power-results');
    
    // Info button
    infoBtn?.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openPowerInfoModal();
    });
    
    // Form submission
    form?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const url = input?.value.trim();
        if (!url) {
            showToast('Please enter a post URL');
            return;
        }
        
        // Validate URL
        try {
            new URL(url);
        } catch {
            showToast('Please enter a valid URL');
            return;
        }
        
        // Check rate limit
        if (!canRunPowerCheck()) {
            const timeLeft = getTimeUntilNextPowerCheck();
            openLimitModal(timeLeft);
            return;
        }
        
        // Start analysis
        runPowerCheck(url);
    });
    
    // Check another button
    checkAnotherBtn?.addEventListener('click', function() {
        if (!canRunPowerCheck()) {
            const timeLeft = getTimeUntilNextPowerCheck();
            openLimitModal(timeLeft);
            return;
        }
        
        resultsSection?.classList.add('hidden');
        if (input) {
            input.value = '';
            input.focus();
        }
    });
}

function runPowerCheck(url) {
    const button = document.getElementById('power-analyze-btn');
    const resultsSection = document.getElementById('power-results');
    
    // Set loading state
    button?.classList.add('loading');
    button?.setAttribute('disabled', 'true');
    
    // Hide previous results
    resultsSection?.classList.add('hidden');
    
    // Simulate analysis delay
    setTimeout(() => {
        const platform = detectPlatformFromUrl(url);
        const username = extractUsernameFromUrl(url, platform);
        const hashtags = generateDemoHashtags(platform);
        const results = generateDemoResults(platform, username, hashtags);
        
        recordPowerCheck();
        renderPowerResults(results);
        
        button?.classList.remove('loading');
        button?.removeAttribute('disabled');
        
    }, 2000);
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
    initPowerCheck();
    initFAQAccordion();
    initSocialShare();
    initCookiePopup();
    
    // Update search counter display
    updateSearchCounterDisplay();
    
    // Detect user IP (async, updates display when ready)
    detectUserIP();
    
    console.log('✅ ShadowBanCheck.io initialized');
});

/* =============================================================================
   UTILITY EXPORTS
   ============================================================================= */
window.ShadowBan = {
    platformData: window.platformData, // from platforms.js
    getSearchCount,
    incrementSearchCount,
    getRemainingSearches,
    updateSearchCounterDisplay,
    openPlatformModal,
    showToast,
    detectUserIP,
    getUserIPData
};
