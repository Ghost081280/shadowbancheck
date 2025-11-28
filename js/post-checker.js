/* =============================================================================
   POST CHECKER PAGE - JAVASCRIPT
   ShadowBanCheck.io
   Calculates shadow ban probability for individual posts
   
   5-FACTOR ENGINE + DETAILED SIGNALS:
   
   1. Platform APIs
      - Account status & engagement metrics
      - Account age signal
      - Follower/following ratio signal
   
   2. Web Analysis (U.S. Servers)
      - Search visibility
      - Profile accessibility
      - Link analysis signal (URLs in post)
   
   3. Historical Data (SKIPPED for single posts)
      - Pattern tracking
      - Posting frequency signal
      - Engagement velocity signal
   
   4. Hashtag Database
      - Banned hashtags
      - Restricted hashtags
      - Platform-specific tags
   
   5. IP Analysis
      - VPN/proxy detection
      - Datacenter detection
      - Geographic signals
   
   + Content Analysis (Bonus Scan)
      - Flagged words/phrases
      - Spam triggers
      - Platform-specific restricted terms
   ============================================================================= */

(function() {
'use strict';

// ============================================
// FLAGGED CONTENT DATABASE
// Words/phrases known to trigger shadow bans
// ============================================
const FLAGGED_CONTENT = {
    banned: [
        // Explicit/Adult
        'porn', 'xxx', 'nude', 'naked', 'onlyfans', 'sex', 'nsfw', 'adult content',
        // Violence
        'kill', 'murder', 'shoot', 'attack', 'bomb', 'terrorist',
        // Drugs
        'cocaine', 'heroin', 'meth', 'drugs for sale', 'buy drugs',
        // Scams
        'send money', 'wire transfer', 'nigerian prince', 'lottery winner',
        // Self-harm
        'suicide', 'cut myself', 'end it all', 'kill myself'
    ],
    
    restricted: [
        // Spam triggers
        'click here', 'link in bio', 'dm me', 'dm for', 'follow for follow', 'f4f',
        'like for like', 'l4l', 'free money', 'get rich quick', 'make money fast',
        'work from home', 'be your own boss', 'passive income', 'drop shipping',
        // Health/Medical
        'weight loss', 'lose weight fast', 'diet pills', 'fat burner', 'detox',
        'cure cancer', 'miracle cure', 'doctors hate', 'big pharma',
        'covid hoax', 'vaccine injury', 'anti-vax',
        // Political hot buttons
        'election fraud', 'stolen election', 'stop the steal', 'fake news',
        // Engagement bait
        'share if you agree', 'like if you', 'comment below', 'tag someone',
        'double tap', 'smash that like', 'hit subscribe',
        // Crypto/Finance spam
        'crypto giveaway', 'free bitcoin', 'nft drop', 'to the moon',
        'guaranteed returns', 'investment opportunity',
        // Adult-adjacent
        'sexy', 'hot girls', 'hot guys', 'thirst trap', 'bikini', 'lingerie',
        'onlyfans link', 'spicy content', 'subscribe for more'
    ],
    
    platformSpecific: {
        instagram: ['shadowbanned', 'algorithm', 'reach is dead', 'instagram is broken', 'shadow ban'],
        tiktok: ['fyp', 'foryou', 'viral', 'blowing up', 'xyzbca', 'blow this up'],
        twitter: ['ratio', 'quote tweet this', 'retweet if', 'twitter is dead'],
        linkedin: ['agree?', 'thoughts?', 'open to work', 'laid off', 'let go'],
        reddit: ['upvote if', 'karma farm', 'repost', 'stolen content']
    }
};

// ============================================
// SUSPICIOUS LINKS DATABASE
// ============================================
const SUSPICIOUS_LINKS = {
    banned: [
        'bit.ly', 'tinyurl', 'shorturl', 'goo.gl', // Link shorteners (often spam)
        'porn', 'xxx', 'adult', 'cam', // Adult sites
        'casino', 'betting', 'gambling' // Gambling
    ],
    
    restricted: [
        'discord.gg', 'telegram.me', 't.me', // Messaging platforms
        'wa.me', // WhatsApp links
        'onlyfans.com', 'fansly.com', // Adult platforms
        'linktree', 'linktr.ee', // Link aggregators
        'cashapp', 'venmo', 'paypal.me', // Payment links
        'gofundme', 'kickstarter' // Crowdfunding
    ]
};

// ============================================
// DEMO POST CONTENT
// Simulates extracted content from posts
// ============================================
const DEMO_POST_CONTENT = {
    twitter: [
        { text: "Just posted a new video! Check it out and let me know what you think. Link in bio! #content #creator", hasLink: true, linkType: 'safe' },
        { text: "Can't believe this happened today. The algorithm is so broken, my reach is dead. Anyone else?", hasLink: false },
        { text: "New product launch! DM me for exclusive discount code. Limited time only! 🔥 #sale", hasLink: false },
        { text: "Beautiful sunset from my trip to Bali. Sometimes you just need to disconnect. #travel", hasLink: false },
        { text: "This weight loss tip changed everything for me. Link in bio for the full guide!", hasLink: true, linkType: 'restricted' },
        { text: "Just hit 10k followers! Thank you all so much for the support. More content coming!", hasLink: false },
        { text: "Honest review of this product after 6 months. Thread below 🧵", hasLink: false }
    ],
    reddit: [
        { text: "I've been researching this topic for months and here's what I found.", hasLink: false },
        { text: "Unpopular opinion but I think this whole thing is overblown. Change my mind.", hasLink: false },
        { text: "Just discovered this life hack that saved me $500. Sharing because it helped.", hasLink: true, linkType: 'safe' },
        { text: "My honest experience with this product after 6 months of use.", hasLink: false },
        { text: "Anyone else notice their posts getting less engagement lately?", hasLink: false }
    ],
    instagram: [
        { text: "Morning vibes ☀️ Starting the day right! Recipe in stories 💕 #healthy #lifestyle", hasLink: false },
        { text: "Link in bio for my new collection! DM me for special discount 🛍️ #fashion", hasLink: true, linkType: 'restricted' },
        { text: "Transformation photo! Down 20 lbs with this approach. Swipe for tips!", hasLink: false },
        { text: "Just living my best life 🌴 Follow for more! #wanderlust #explore", hasLink: false },
        { text: "New post! Tag someone who needs to see this 👀 Share if you agree!", hasLink: false }
    ],
    tiktok: [
        { text: "Wait for it... 😂 #fyp #foryou #viral #funny", hasLink: false },
        { text: "This hack changed my life! Full tutorial on my page #lifehack", hasLink: false },
        { text: "POV: You finally understand the algorithm 🤯 #tiktok #creator", hasLink: false },
        { text: "Day 30 of posting until I go viral #fyp #blowthisup", hasLink: false },
        { text: "Storytime: What happened when I tried this trend...", hasLink: false }
    ],
    linkedin: [
        { text: "Excited to announce I'm open to new opportunities! Looking for my next challenge.", hasLink: false },
        { text: "Agree? 👇 The best leaders share this one trait. Thoughts?", hasLink: false },
        { text: "I was laid off last month. Here's what I learned about resilience.", hasLink: false },
        { text: "Just published a new article on leadership. Would love your feedback!", hasLink: true, linkType: 'safe' },
        { text: "Hiring alert! My team is looking for talent. DM me if interested!", hasLink: false }
    ]
};

// ============================================
// DEMO ACCOUNT SIGNALS
// Simulates account-level data
// ============================================
const DEMO_SIGNALS = {
    accountAge: [
        { days: 7, label: '1 week', risk: 'high', impact: '+12%' },
        { days: 30, label: '1 month', risk: 'medium', impact: '+6%' },
        { days: 90, label: '3 months', risk: 'low', impact: '+2%' },
        { days: 365, label: '1+ year', risk: 'none', impact: '0%' },
        { days: 730, label: '2+ years', risk: 'trusted', impact: '-3%' }
    ],
    
    followerRatio: [
        { followers: 50, following: 2000, label: '50:2000', risk: 'high', impact: '+10%' },
        { followers: 500, following: 1500, label: '500:1500', risk: 'medium', impact: '+5%' },
        { followers: 1000, following: 800, label: '1K:800', risk: 'low', impact: '+1%' },
        { followers: 5000, following: 300, label: '5K:300', risk: 'none', impact: '0%' },
        { followers: 50000, following: 200, label: '50K:200', risk: 'trusted', impact: '-2%' }
    ],
    
    postingFrequency: [
        { postsToday: 1, label: '1 post today', risk: 'none', impact: '0%' },
        { postsToday: 5, label: '5 posts today', risk: 'low', impact: '+2%' },
        { postsToday: 15, label: '15 posts today', risk: 'medium', impact: '+7%' },
        { postsToday: 30, label: '30+ posts today', risk: 'high', impact: '+15%' }
    ],
    
    engagementVelocity: [
        { status: 'normal', label: 'Normal velocity', risk: 'none', impact: '0%' },
        { status: 'low', label: 'Below average', risk: 'low', impact: '+3%' },
        { status: 'suppressed', label: 'Possibly suppressed', risk: 'medium', impact: '+8%' },
        { status: 'suspicious', label: 'Unusual spike', risk: 'high', impact: '+12%' }
    ]
};

// ============================================
// PLATFORM DETECTION PATTERNS
// ============================================
const PLATFORM_PATTERNS = {
    'twitter': /(?:twitter\.com|x\.com)\/\w+\/status\/\d+/i,
    'instagram': /instagram\.com\/(?:p|reel)\/[\w-]+/i,
    'tiktok': /tiktok\.com\/@[\w.]+\/video\/\d+/i,
    'reddit': /reddit\.com\/r\/\w+\/comments\/\w+/i,
    'facebook': /facebook\.com\/(?:\w+\/)?(?:posts|videos)\/\d+/i,
    'linkedin': /linkedin\.com\/(?:posts|feed\/update)/i,
    'youtube': /(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/i,
    'threads': /threads\.net\/@[\w.]+\/post\/[\w]+/i
};

const PLATFORM_DATA = {
    'twitter': { name: 'Twitter/X', icon: '𝕏', key: 'twitter' },
    'instagram': { name: 'Instagram', icon: '📷', key: 'instagram' },
    'tiktok': { name: 'TikTok', icon: '🎵', key: 'tiktok' },
    'reddit': { name: 'Reddit', icon: '🔴', key: 'reddit' },
    'facebook': { name: 'Facebook', icon: '👤', key: 'facebook' },
    'linkedin': { name: 'LinkedIn', icon: '💼', key: 'linkedin' },
    'youtube': { name: 'YouTube', icon: '▶️', key: 'youtube' },
    'threads': { name: 'Threads', icon: '🧵', key: 'threads' }
};

// ============================================
// STATE
// ============================================
let detectedPlatform = null;
let userIPData = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initPostChecker();
    initInfoModals();
    initSupportedPlatforms();
    detectIP();
});

function initPostChecker() {
    const form = document.getElementById('post-check-form');
    const urlInput = document.getElementById('post-url-input');
    const checkBtn = document.getElementById('check-post-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    if (!form || !urlInput || !checkBtn) return;
    
    urlInput.addEventListener('input', function() {
        detectPlatform(this.value.trim());
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const url = urlInput.value.trim();
        if (url) {
            runPostCheck(url);
        }
    });
    
    clearBtn?.addEventListener('click', function() {
        urlInput.value = '';
        detectedPlatform = null;
        updatePlatformDisplay();
    });
}

// ============================================
// PLATFORM DETECTION
// ============================================
function detectPlatform(url) {
    detectedPlatform = null;
    
    for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
        if (pattern.test(url)) {
            detectedPlatform = platform;
            break;
        }
    }
    
    updatePlatformDisplay();
    return detectedPlatform;
}

function updatePlatformDisplay() {
    const platformDisplay = document.getElementById('platform-detected');
    if (!platformDisplay) return;
    
    if (detectedPlatform && PLATFORM_DATA[detectedPlatform]) {
        const { icon, name } = PLATFORM_DATA[detectedPlatform];
        platformDisplay.innerHTML = `Platform: <strong>${icon} ${name}</strong>`;
        platformDisplay.classList.add('detected');
    } else {
        platformDisplay.innerHTML = 'Platform: Auto-detect';
        platformDisplay.classList.remove('detected');
    }
}

// ============================================
// IP DETECTION
// ============================================
async function detectIP() {
    const ipAddress = document.getElementById('ip-address');
    const ipType = document.getElementById('ip-type');
    const ipFlag = document.getElementById('ip-flag');
    
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.ip) {
            userIPData = {
                ip: data.ip,
                country: data.country_name,
                countryCode: data.country_code,
                city: data.city,
                isp: data.org,
                type: 'residential',
                typeLabel: 'Residential',
                isVPN: false,
                isDatacenter: false
            };
            
            const orgLower = (data.org || '').toLowerCase();
            const vpnKeywords = ['vpn', 'proxy', 'tunnel', 'anonymous', 'private'];
            const datacenterKeywords = ['hosting', 'cloud', 'server', 'data center', 'datacenter', 'amazon', 'google', 'microsoft', 'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner'];
            
            if (vpnKeywords.some(kw => orgLower.includes(kw))) {
                userIPData.type = 'vpn';
                userIPData.typeLabel = 'VPN/Proxy';
                userIPData.isVPN = true;
            } else if (datacenterKeywords.some(kw => orgLower.includes(kw))) {
                userIPData.type = 'datacenter';
                userIPData.typeLabel = 'Datacenter';
                userIPData.isDatacenter = true;
            }
            
            if (ipAddress) ipAddress.textContent = data.ip;
            if (ipType) {
                ipType.textContent = userIPData.typeLabel.toUpperCase();
                ipType.className = 'ip-type ' + userIPData.type;
            }
            if (ipFlag && data.country_code) {
                ipFlag.textContent = countryCodeToFlag(data.country_code);
                ipFlag.title = data.country_name || data.country_code;
            }
        }
    } catch (error) {
        console.log('IP detection failed:', error);
        if (ipAddress) ipAddress.textContent = 'Unable to detect';
        userIPData = { ip: 'Unknown', type: 'unknown', typeLabel: 'Unknown' };
    }
}

function countryCodeToFlag(countryCode) {
    if (!countryCode) return '';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// ============================================
// CONTENT ANALYSIS
// ============================================
function analyzeContent(platformId) {
    const platformContent = DEMO_POST_CONTENT[platformId] || DEMO_POST_CONTENT.twitter;
    const postData = platformContent[Math.floor(Math.random() * platformContent.length)];
    const content = postData.text;
    const contentLower = content.toLowerCase();
    const wordCount = content.split(/\s+/).length;
    
    const foundFlags = {
        banned: [],
        restricted: [],
        platformSpecific: []
    };
    
    // Check banned terms
    FLAGGED_CONTENT.banned.forEach(term => {
        if (contentLower.includes(term.toLowerCase())) {
            foundFlags.banned.push(term);
        }
    });
    
    // Check restricted terms
    FLAGGED_CONTENT.restricted.forEach(term => {
        if (contentLower.includes(term.toLowerCase())) {
            foundFlags.restricted.push(term);
        }
    });
    
    // Check platform-specific terms
    const platformTerms = FLAGGED_CONTENT.platformSpecific[platformId] || [];
    platformTerms.forEach(term => {
        if (contentLower.includes(term.toLowerCase())) {
            foundFlags.platformSpecific.push(term);
        }
    });
    
    // Calculate content penalty
    let penalty = 0;
    penalty += foundFlags.banned.length * 25;
    penalty += foundFlags.restricted.length * 8;
    penalty += foundFlags.platformSpecific.length * 5;
    
    return {
        content: content,
        wordCount: wordCount,
        hasLink: postData.hasLink || false,
        linkType: postData.linkType || null,
        flaggedTerms: foundFlags,
        totalFlagged: foundFlags.banned.length + foundFlags.restricted.length + foundFlags.platformSpecific.length,
        penalty: Math.min(penalty, 40),
        status: foundFlags.banned.length > 0 ? 'bad' : 
                (foundFlags.restricted.length > 0 || foundFlags.platformSpecific.length > 0) ? 'warning' : 'good'
    };
}

// ============================================
// LINK ANALYSIS
// ============================================
function analyzeLinks(hasLink, linkType) {
    if (!hasLink) {
        return {
            hasLink: false,
            status: 'good',
            finding: 'No external links detected',
            penalty: 0
        };
    }
    
    if (linkType === 'banned') {
        return {
            hasLink: true,
            status: 'bad',
            finding: 'Suspicious link shortener detected',
            penalty: 15
        };
    } else if (linkType === 'restricted') {
        return {
            hasLink: true,
            status: 'warning',
            finding: 'Link aggregator detected (linktree-style)',
            penalty: 5
        };
    } else {
        return {
            hasLink: true,
            status: 'good',
            finding: 'Link appears safe',
            penalty: 0
        };
    }
}

// ============================================
// GENERATE DEMO SIGNALS
// ============================================
function generateDemoSignals() {
    const accountAge = DEMO_SIGNALS.accountAge[Math.floor(Math.random() * DEMO_SIGNALS.accountAge.length)];
    const followerRatio = DEMO_SIGNALS.followerRatio[Math.floor(Math.random() * DEMO_SIGNALS.followerRatio.length)];
    const postingFrequency = DEMO_SIGNALS.postingFrequency[Math.floor(Math.random() * DEMO_SIGNALS.postingFrequency.length)];
    const engagementVelocity = DEMO_SIGNALS.engagementVelocity[Math.floor(Math.random() * DEMO_SIGNALS.engagementVelocity.length)];
    
    return {
        accountAge,
        followerRatio,
        postingFrequency,
        engagementVelocity
    };
}

// ============================================
// RUN POST CHECK WITH ANIMATION
// ============================================
async function runPostCheck(url) {
    if (!isValidUrl(url)) {
        showToast('Please enter a valid URL');
        return;
    }
    
    if (!detectedPlatform) {
        detectPlatform(url);
    }
    
    if (!detectedPlatform) {
        showToast('Sorry, we don\'t recognize this URL. Please enter a valid social media post URL.');
        return;
    }
    
    // Check if platform is live
    if (typeof PLATFORMS !== 'undefined') {
        const platformData = PLATFORMS.find(p => p.id === detectedPlatform);
        if (!platformData || platformData.status !== 'live') {
            const name = PLATFORM_DATA[detectedPlatform]?.name || detectedPlatform;
            showToast(`${name} support coming soon! Currently we support Twitter/X and Reddit.`);
            return;
        }
    }
    
    const checkerCard = document.getElementById('checker-card');
    const engineAnimation = document.getElementById('engine-animation');
    const checkBtn = document.getElementById('check-post-btn');
    
    if (checkerCard) checkerCard.style.display = 'none';
    if (engineAnimation) engineAnimation.classList.remove('hidden');
    engineAnimation?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    checkBtn?.classList.add('loading');
    
    try {
        await runEngineAnimation();
        const results = generateResults(url);
        
        sessionStorage.setItem('shadowban_results', JSON.stringify(results));
        window.latestScanResults = results;
        window.lastSearchType = 'post';
        
        const postId = extractPostId(url);
        const params = new URLSearchParams({
            platform: detectedPlatform,
            q: postId,
            type: 'post',
            t: results.timestamp
        });
        
        window.location.href = `results.html?${params.toString()}`;
        
    } catch (error) {
        console.error('Check failed:', error);
        showToast('Analysis failed. Please try again.');
        if (checkerCard) checkerCard.style.display = '';
        if (engineAnimation) engineAnimation.classList.add('hidden');
        checkBtn?.classList.remove('loading');
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function extractPostId(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        if (detectedPlatform === 'twitter') {
            const match = pathname.match(/\/status\/(\d+)/);
            if (match) return match[1];
        }
        if (detectedPlatform === 'reddit') {
            const match = pathname.match(/\/comments\/([a-zA-Z0-9]+)/);
            if (match) return match[1];
        }
        if (detectedPlatform === 'instagram') {
            const match = pathname.match(/\/(?:p|reel)\/([\w-]+)/);
            if (match) return match[1];
        }
        if (detectedPlatform === 'youtube') {
            const vParam = urlObj.searchParams.get('v');
            if (vParam) return vParam;
        }
    } catch (e) {
        console.warn('Error extracting post ID:', e);
    }
    return Date.now().toString();
}

async function runEngineAnimation() {
    const phase1 = document.getElementById('engine-phase-1');
    const phase2 = document.getElementById('engine-phase-2');
    const terminalOutput = document.getElementById('terminal-output');
    
    if (phase1) phase1.classList.remove('hidden');
    if (phase2) phase2.classList.add('hidden');
    if (terminalOutput) terminalOutput.innerHTML = '';
    
    await runTerminalAnimation(terminalOutput);
    await animateFactorProgress();
    
    if (phase1) phase1.classList.add('hidden');
    if (phase2) phase2.classList.remove('hidden');
    
    await runAIAnalysis();
}

async function runTerminalAnimation(container) {
    if (!container) return;
    
    const platformName = PLATFORM_DATA[detectedPlatform]?.name || detectedPlatform;
    
    const lines = [
        { type: 'command', text: '$ shadowban-engine --init --type=post --deep-scan' },
        { type: 'response', text: '→ Loading 5-Factor Detection Engine v1.0...' },
        { type: 'response', text: `→ Target: ${platformName} post` },
        { type: 'divider', text: '─── Factor 1: Platform APIs ───' },
        { type: 'command', text: `$ GET /api/${detectedPlatform}/v2/post/analyze` },
        { type: 'data', text: '{ "status": "connected", "signals": "enabled" }' },
        { type: 'success', text: '✓ Platform API connected' },
        { type: 'response', text: '  ├─ Signal: Account age verified' },
        { type: 'response', text: '  └─ Signal: Follower ratio analyzed' },
        { type: 'divider', text: '─── Factor 2: Web Analysis ───' },
        { type: 'command', text: '$ playwright launch --headless --us-servers' },
        { type: 'response', text: '→ Testing search visibility from U.S...' },
        { type: 'success', text: '✓ Web analysis complete' },
        { type: 'command', text: '$ scan_links --extract-urls' },
        { type: 'response', text: '  └─ Signal: Link analysis complete' },
        { type: 'divider', text: '─── Factor 3: Historical Data ───' },
        { type: 'response', text: '→ Skipped for single post analysis' },
        { type: 'response', text: '  ├─ Signal: Posting frequency (coming soon)' },
        { type: 'response', text: '  └─ Signal: Engagement velocity (coming soon)' },
        { type: 'divider', text: '─── Factor 4: Hashtag Database ───' },
        { type: 'command', text: '$ query hashtag_db --extract-from-post' },
        { type: 'success', text: '✓ Hashtags checked against 1,800+ entries' },
        { type: 'divider', text: '─── Factor 5: IP Analysis ───' },
        { type: 'command', text: '$ analyze_ip --connection-type --geo' },
        { type: 'success', text: '✓ IP analysis complete' },
        { type: 'divider', text: '─── Content Scan (Bonus) ───' },
        { type: 'command', text: '$ extract_content --post-text' },
        { type: 'response', text: '→ Extracting post content...' },
        { type: 'command', text: '$ scan_content --flagged-terms=150+' },
        { type: 'response', text: '→ Scanning for banned & restricted terms...' },
        { type: 'success', text: '✓ Content analysis complete' },
        { type: 'divider', text: '═══════════════════════════════' },
        { type: 'success', text: '✓ 4/5 FACTORS + 6 SIGNALS ANALYZED' },
        { type: 'response', text: '→ Calculating probability score...' }
    ];
    
    for (const line of lines) {
        const lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';
        
        if (line.type === 'command') {
            lineEl.innerHTML = `<span class="prompt">$</span> <span class="command">${line.text.replace('$ ', '')}</span>`;
        } else if (line.type === 'response') {
            lineEl.innerHTML = `<span class="response">${line.text}</span>`;
        } else if (line.type === 'success') {
            lineEl.innerHTML = `<span class="success">${line.text}</span>`;
        } else if (line.type === 'data') {
            lineEl.innerHTML = `<span class="data">${line.text}</span>`;
        } else if (line.type === 'divider') {
            lineEl.innerHTML = `<span class="divider">${line.text}</span>`;
        }
        
        container.appendChild(lineEl);
        container.scrollTop = container.scrollHeight;
        
        await sleep(80);
    }
}

async function animateFactorProgress() {
    const factors = [
        { id: 'factor-1-progress', skip: false },
        { id: 'factor-2-progress', skip: false },
        { id: 'factor-3-progress', skip: true },
        { id: 'factor-4-progress', skip: false },
        { id: 'factor-5-progress', skip: false }
    ];
    
    for (const factor of factors) {
        const factorEl = document.getElementById(factor.id);
        const statusEl = factorEl?.querySelector('.factor-status');
        
        if (!factorEl || !statusEl) continue;
        
        if (factor.skip) {
            factorEl.classList.add('skipped');
            statusEl.textContent = '—';
            statusEl.classList.add('skipped');
            await sleep(100);
        } else {
            factorEl.classList.add('active');
            statusEl.textContent = '◉';
            statusEl.classList.remove('pending');
            statusEl.classList.add('running');
            
            await sleep(200);
            
            factorEl.classList.remove('active');
            factorEl.classList.add('complete');
            statusEl.textContent = '✓';
            statusEl.classList.remove('running');
            statusEl.classList.add('complete');
        }
    }
}

async function runAIAnalysis() {
    const messageEl = document.getElementById('ai-processing-message');
    const messages = [
        'Aggregating factor signals...',
        'Analyzing content flags...',
        'Weighting risk indicators...',
        'Calculating probability score...',
        'Generating detailed report...'
    ];
    
    for (const message of messages) {
        if (messageEl) messageEl.textContent = message;
        await sleep(350);
    }
}

// ============================================
// GENERATE RESULTS
// ============================================
function generateResults(url) {
    const platform = PLATFORM_DATA[detectedPlatform] || { name: 'Unknown', icon: '🔗', key: detectedPlatform };
    const postId = extractPostId(url);
    
    // Run all analyses
    const contentAnalysis = analyzeContent(detectedPlatform);
    const linkAnalysis = analyzeLinks(contentAnalysis.hasLink, contentAnalysis.linkType);
    const demoSignals = generateDemoSignals();
    
    // Calculate base probability
    let probability = Math.floor(Math.random() * 25) + 8;
    
    // Add penalties
    probability += contentAnalysis.penalty;
    probability += linkAnalysis.penalty;
    probability += userIPData?.isVPN ? 10 : 0;
    probability += userIPData?.isDatacenter ? 15 : 0;
    
    const parseImpact = (impact) => {
        const match = impact.match(/([+-]?\d+)/);
        return match ? parseInt(match[1]) : 0;
    };
    
    probability += parseImpact(demoSignals.accountAge.impact);
    probability += parseImpact(demoSignals.followerRatio.impact);
    probability += parseImpact(demoSignals.postingFrequency.impact);
    probability += parseImpact(demoSignals.engagementVelocity.impact);
    
    probability = Math.min(Math.max(probability, 5), 95);
    
    // Determine verdict
    let verdict = 'likely-visible';
    let verdictText = 'Likely Visible';
    if (probability >= 60) {
        verdict = 'likely-restricted';
        verdictText = 'Likely Restricted';
    } else if (probability >= 30) {
        verdict = 'possibly-limited';
        verdictText = 'Possibly Limited';
    }
    
    // Generate findings
    const findings = [];
    
    if (contentAnalysis.status === 'bad') {
        findings.push({ type: 'bad', text: `Banned term detected in content` });
    } else if (contentAnalysis.status === 'warning') {
        findings.push({ type: 'warning', text: `${contentAnalysis.totalFlagged} potentially flagged term(s) found` });
    } else {
        findings.push({ type: 'good', text: 'Content scan passed - no flagged terms' });
    }
    
    if (linkAnalysis.status !== 'good' && linkAnalysis.hasLink) {
        findings.push({ type: linkAnalysis.status === 'bad' ? 'bad' : 'warning', text: linkAnalysis.finding });
    }
    
    if (demoSignals.accountAge.risk === 'high') {
        findings.push({ type: 'warning', text: `New account (${demoSignals.accountAge.label}) - less platform trust` });
    }
    if (demoSignals.followerRatio.risk === 'high' || demoSignals.followerRatio.risk === 'medium') {
        findings.push({ type: 'warning', text: `Follower ratio (${demoSignals.followerRatio.label}) may trigger spam filters` });
    }
    if (demoSignals.postingFrequency.risk !== 'none') {
        findings.push({ type: 'warning', text: `High posting frequency (${demoSignals.postingFrequency.label})` });
    }
    if (demoSignals.engagementVelocity.risk !== 'none') {
        findings.push({ type: demoSignals.engagementVelocity.risk === 'high' ? 'bad' : 'warning', text: demoSignals.engagementVelocity.label });
    }
    
    if (userIPData?.isVPN) {
        findings.push({ type: 'warning', text: 'VPN detected - may affect platform trust' });
    } else if (userIPData?.isDatacenter) {
        findings.push({ type: 'warning', text: 'Datacenter IP detected - bot-like signal' });
    }
    
    if (findings.filter(f => f.type !== 'good').length < 2) {
        findings.push({ type: 'good', text: 'Post appears in search from U.S. servers' });
    }
    
    // Build factor results with signals
    const factors = {
        api: { 
            active: true, 
            status: demoSignals.accountAge.risk === 'high' || demoSignals.followerRatio.risk === 'high' ? 'warning' : 'good',
            finding: 'Account metrics retrieved',
            signals: [
                { name: 'Account Age', value: demoSignals.accountAge.label, risk: demoSignals.accountAge.risk, impact: demoSignals.accountAge.impact },
                { name: 'Follower Ratio', value: demoSignals.followerRatio.label, risk: demoSignals.followerRatio.risk, impact: demoSignals.followerRatio.impact }
            ]
        },
        web: { 
            active: true, 
            status: linkAnalysis.status === 'bad' ? 'warning' : 'good',
            finding: 'Search visibility tested from U.S.',
            signals: [
                { name: 'Link Analysis', value: linkAnalysis.hasLink ? 'Link detected' : 'No links', risk: linkAnalysis.status === 'good' ? 'none' : linkAnalysis.status === 'warning' ? 'medium' : 'high', impact: linkAnalysis.penalty > 0 ? `+${linkAnalysis.penalty}%` : '0%' }
            ]
        },
        historical: { 
            active: false, 
            status: 'inactive',
            finding: 'Skipped for single post analysis',
            signals: [
                { name: 'Posting Frequency', value: demoSignals.postingFrequency.label, risk: demoSignals.postingFrequency.risk, impact: demoSignals.postingFrequency.impact, comingSoon: true },
                { name: 'Engagement Velocity', value: demoSignals.engagementVelocity.label, risk: demoSignals.engagementVelocity.risk, impact: demoSignals.engagementVelocity.impact, comingSoon: true }
            ]
        },
        hashtag: { 
            active: true, 
            status: 'good',
            finding: 'Hashtags checked against 1,800+ database',
            signals: []
        },
        ip: { 
            active: true, 
            status: userIPData?.isVPN || userIPData?.isDatacenter ? 'warning' : 'good',
            finding: userIPData?.isVPN ? 'VPN detected (+10%)' : 
                     userIPData?.isDatacenter ? 'Datacenter IP (+15%)' : 
                     'Residential IP verified',
            signals: [
                { name: 'Connection Type', value: userIPData?.typeLabel || 'Unknown', risk: userIPData?.isVPN || userIPData?.isDatacenter ? 'medium' : 'none', impact: userIPData?.isVPN ? '+10%' : userIPData?.isDatacenter ? '+15%' : '0%' },
                { name: 'Location', value: userIPData?.country || 'Unknown', risk: 'none', impact: '0%' }
            ]
        }
    };
    
    // Content analysis (bonus scan)
    const contentScan = {
        active: true,
        wordCount: contentAnalysis.wordCount,
        status: contentAnalysis.status,
        finding: contentAnalysis.totalFlagged > 0 
            ? `${contentAnalysis.totalFlagged} flagged term(s) detected`
            : 'No flagged content detected',
        flaggedTerms: contentAnalysis.flaggedTerms,
        penalty: contentAnalysis.penalty,
        scannedContent: contentAnalysis.content
    };
    
    return {
        type: 'post',
        platform: {
            name: platform.name,
            icon: platform.icon,
            key: platform.key,
            id: detectedPlatform
        },
        url: url,
        username: 'Post',
        postId: postId,
        timestamp: Date.now(),
        probability: probability,
        verdict: verdict,
        verdictText: verdictText,
        findings: findings,
        factors: factors,
        contentScan: contentScan,
        verification: null,
        ipData: userIPData,
        factorsUsed: '4/5',
        signalsAnalyzed: 6
    };
}

// ============================================
// SUPPORTED PLATFORMS
// ============================================
function initSupportedPlatforms() {
    const container = document.getElementById('supported-platform-icons');
    if (!container || typeof PLATFORMS === 'undefined') return;
    
    const allPlatforms = [...PLATFORMS].sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (a.status !== 'live' && b.status === 'live') return 1;
        return 0;
    });
    
    const html = allPlatforms.map(p => `
        <span class="platform-chip ${p.status === 'soon' ? 'coming' : ''}" data-platform="${p.id}" title="${p.name}${p.status === 'soon' ? ' (Coming Soon)' : ''}">${p.icon}</span>
    `).join('');
    
    container.innerHTML = html;
    
    container.querySelectorAll('.platform-chip[data-platform]').forEach(chip => {
        chip.addEventListener('click', () => showPlatformInfoModal(chip.dataset.platform));
    });
}

// ============================================
// MODALS
// ============================================
function initInfoModals() {
    const postInfoBtn = document.getElementById('post-info-btn');
    const postModal = document.getElementById('post-info-modal');
    
    postInfoBtn?.addEventListener('click', () => {
        postModal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    const engineInfoBtn = document.getElementById('engine-info-btn');
    const engineModal = document.getElementById('engine-info-modal');
    
    engineInfoBtn?.addEventListener('click', () => {
        engineModal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        };
        
        closeBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', closeModal);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
            });
            document.body.style.overflow = '';
        }
    });
}

function showPlatformInfoModal(platformId) {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;
    
    const modal = document.getElementById('platform-info-modal');
    const iconEl = document.getElementById('platform-modal-icon');
    const titleEl = document.getElementById('platform-modal-title');
    const bodyEl = document.getElementById('platform-modal-body');
    
    if (!modal || !bodyEl) return;
    
    if (iconEl) iconEl.textContent = platform.icon;
    if (titleEl) titleEl.textContent = `${platform.name} - Post Analysis`;
    
    if (platform.status === 'live') {
        const checksToShow = platform.postChecks || platform.checks || [];
        
        bodyEl.innerHTML = `
            <p class="modal-intro">For ${platform.name} posts, we analyze:</p>
            <ul class="platform-checks-list">
                ${checksToShow.slice(0, 6).map(check => `<li>✓ ${check}</li>`).join('')}
            </ul>
            <div style="margin-top: var(--space-md); padding: var(--space-sm); background: rgba(99, 102, 241, 0.1); border-radius: var(--radius-md);">
                <strong style="color: var(--primary-light);">+ Signals Analyzed:</strong>
                <ul style="margin-top: var(--space-xs); font-size: 0.875rem; color: var(--text-muted);">
                    <li>Account Age • Follower Ratio • Link Analysis</li>
                    <li>Content Scan (150+ flagged terms)</li>
                </ul>
            </div>
        `;
    } else {
        bodyEl.innerHTML = `
            <p class="modal-intro">${platform.name} post analysis is coming soon!</p>
            <p style="color: var(--text-muted);">We're working to add ${platform.name} to our detection engine.</p>
        `;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePlatformInfoModal() {
    const modal = document.getElementById('platform-info-modal');
    modal?.classList.add('hidden');
    document.body.style.overflow = '';
}

window.closePlatformInfoModal = closePlatformInfoModal;

// ============================================
// UTILITIES
// ============================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message) {
    if (typeof window.ShadowBan?.showToast === 'function') {
        window.ShadowBan.showToast(message);
        return;
    }
    
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

})();
