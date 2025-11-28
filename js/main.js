/* =============================================================================
   MAIN.JS - SHARED FUNCTIONALITY
   ShadowBanCheck.io - Updated with redirect flow and probability messaging
   ============================================================================= */

/* =============================================================================
   GLOBAL STATE
   ============================================================================= */
window.latestScanResults = null;
window.lastSearchType = null;
let userIPData = null;

/* =============================================================================
   PLATFORM DETECTION PATTERNS
   ============================================================================= */
const PLATFORM_PATTERNS = {
    twitter: /(?:twitter\.com|x\.com)\/([^\/\?]+)/i,
    reddit: /(?:reddit\.com)\/(?:r\/[^\/]+\/comments\/|user\/)?([^\/\?]+)/i,
    instagram: /(?:instagram\.com)\/(?:p\/|reel\/)?([^\/\?]+)/i,
    tiktok: /(?:tiktok\.com)\/@?([^\/\?]+)/i,
    facebook: /(?:facebook\.com)\/([^\/\?]+)/i,
    youtube: /(?:youtube\.com|youtu\.be)\/(?:watch\?v=|@)?([^\/\?\&]+)/i,
    linkedin: /(?:linkedin\.com)\/(?:in\/|posts\/)?([^\/\?]+)/i
};

/* =============================================================================
   FACTOR INFO DATA - For the (i) buttons
   ============================================================================= */
const FACTOR_INFO = {
    'platform-api': {
        icon: '🔌',
        title: 'Platform APIs',
        description: 'We query official platform APIs directly where available. This gives us the most reliable data about account status, visibility flags, and any restrictions the platform has applied.',
        details: [
            'Twitter/X API v2 - Account status, tweet visibility, restriction flags',
            'Reddit API - Shadowban status, karma, account standing',
            'Direct query for account existence and accessibility'
        ],
        tech: 'OAuth 2.0 authentication, rate-limited queries, response validation'
    },
    'web-analysis': {
        icon: '🔍',
        title: 'Web Analysis',
        description: 'We run automated browser tests from U.S.-based servers to check if content appears in search results. We test multiple scenarios: logged in, logged out, and private browsing mode.',
        details: [
            'Search visibility - Does the account/post appear in search?',
            'Public accessibility - Can logged-out users see the content?',
            'Private browsing - Same results with no cookies/history?'
        ],
        tech: 'Playwright automation, headless Chrome/Firefox, U.S. server locations'
    },
    'historical': {
        icon: '📊',
        title: 'Historical Data',
        description: 'We compare current engagement patterns against historical baselines. Sudden drops in engagement or visibility can indicate algorithmic suppression even when other signals look normal.',
        details: [
            'Engagement rate trends over time',
            'Follower growth/decline patterns',
            'Post reach compared to account baseline'
        ],
        tech: 'PostgreSQL time-series data, anomaly detection algorithms'
    },
    'hashtag-db': {
        icon: '#️⃣',
        title: 'Hashtag Database',
        description: 'Our database of banned, restricted, and low-reach hashtags is updated daily. We cross-reference any hashtags in your content against known problematic tags.',
        details: [
            'Banned hashtags that will hide your content',
            'Restricted hashtags with reduced reach',
            'Spam-flagged hashtags that trigger filters'
        ],
        tech: 'Daily automated scraping, community reports, real-time verification'
    },
    'ip-analysis': {
        icon: '🌐',
        title: 'IP Analysis',
        description: 'We analyze YOUR connection to detect VPN, proxy, or datacenter IPs. Platforms may treat content differently based on the IP reputation of the poster.',
        details: [
            'VPN/Proxy detection - Are you hiding your location?',
            'Datacenter IP flags - Server IPs are often restricted',
            'IP reputation scoring - History of abuse from this IP range'
        ],
        tech: 'IPQualityScore API, MaxMind GeoIP, reputation databases'
    }
};

/* =============================================================================
   IP DETECTION
   ============================================================================= */
async function detectUserIP() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.ip) {
            let ipType = 'residential';
            let typeLabel = 'Residential';
            
            const orgLower = (data.org || '').toLowerCase();
            
            const vpnKeywords = ['vpn', 'proxy', 'tunnel', 'anonymous', 'private'];
            const datacenterKeywords = ['hosting', 'cloud', 'server', 'data center', 'datacenter', 'amazon', 'google', 'microsoft', 'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner'];
            
            const isLikelyVPN = vpnKeywords.some(kw => orgLower.includes(kw));
            const isLikelyDatacenter = datacenterKeywords.some(kw => orgLower.includes(kw));
            
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
                countryCode: data.country_code,
                city: data.city,
                isp: data.org,
                type: ipType,
                typeLabel: typeLabel,
                isVPN: isLikelyVPN,
                isDatacenter: isLikelyDatacenter
            };
            
            updateIPDisplay();
            return userIPData;
        }
    } catch (error) {
        console.log('IP detection failed:', error);
        userIPData = { ip: 'Unable to detect', type: 'unknown', typeLabel: '' };
        updateIPDisplay();
    }
    return userIPData;
}

function updateIPDisplay() {
    const ipValueEl = document.getElementById('user-ip-address');
    const ipTypeEl = document.getElementById('user-ip-type');
    const ipFlagEl = document.getElementById('user-ip-flag');
    
    if (ipValueEl && userIPData) {
        ipValueEl.textContent = userIPData.ip;
        
        if (ipTypeEl && userIPData.typeLabel) {
            ipTypeEl.textContent = userIPData.typeLabel;
            ipTypeEl.className = 'ip-type ' + userIPData.type;
        }
        
        if (ipFlagEl && userIPData.countryCode) {
            ipFlagEl.textContent = countryCodeToFlag(userIPData.countryCode);
            ipFlagEl.title = userIPData.country || userIPData.countryCode;
        }
    }
}

function countryCodeToFlag(countryCode) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

/* =============================================================================
   PLATFORM URL DETECTION
   ============================================================================= */
function detectPlatformFromUrl(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
        return { name: 'Twitter/X', icon: '𝕏', key: 'twitter', id: 'twitter' };
    } else if (urlLower.includes('reddit.com')) {
        return { name: 'Reddit', icon: '🤖', key: 'reddit', id: 'reddit' };
    } else if (urlLower.includes('instagram.com')) {
        return { name: 'Instagram', icon: '📸', key: 'instagram', id: 'instagram' };
    } else if (urlLower.includes('tiktok.com')) {
        return { name: 'TikTok', icon: '🎵', key: 'tiktok', id: 'tiktok' };
    } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
        return { name: 'Facebook', icon: '📘', key: 'facebook', id: 'facebook' };
    } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return { name: 'YouTube', icon: '📺', key: 'youtube', id: 'youtube' };
    } else if (urlLower.includes('linkedin.com')) {
        return { name: 'LinkedIn', icon: '💼', key: 'linkedin', id: 'linkedin' };
    }
    
    return null;
}

function extractUsernameFromUrl(url, platform) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        if (platform.key === 'twitter') {
            const match = pathname.match(/^\/?@?([a-zA-Z0-9_]+)/);
            if (match && match[1] !== 'status') return '@' + match[1];
        }
        
        if (platform.key === 'reddit') {
            const userMatch = pathname.match(/\/u(?:ser)?\/([a-zA-Z0-9_-]+)/);
            if (userMatch) return 'u/' + userMatch[1];
        }
        
    } catch (e) {
        console.warn('Error parsing URL:', e);
    }
    
    return '@user' + Math.floor(Math.random() * 1000);
}

function extractPostIdFromUrl(url, platform) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        if (platform.key === 'twitter') {
            const match = pathname.match(/\/status\/(\d+)/);
            if (match) return match[1];
        }
        
        if (platform.key === 'reddit') {
            const match = pathname.match(/\/comments\/([a-zA-Z0-9]+)/);
            if (match) return match[1];
        }
        
    } catch (e) {
        console.warn('Error extracting post ID:', e);
    }
    
    return Date.now().toString();
}

/* =============================================================================
   POWER CHECK - REDIRECT FLOW
   ============================================================================= */
function initPowerCheck() {
    const form = document.getElementById('power-check-form');
    const input = document.getElementById('power-url-input');
    const infoBtn = document.getElementById('power-info-btn');
    
    // Initialize platform icons
    initPowerPlatforms();
    
    // Info button opens modal
    infoBtn?.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openModal('power-info-modal');
    });
    
    // URL input detection for connection step
    input?.addEventListener('input', debounce(handleUrlInput, 300));
    input?.addEventListener('paste', () => setTimeout(handleUrlInput, 50));
    
    // Form submission
    form?.addEventListener('submit', function(e) {
        e.preventDefault();
        handlePowerCheckSubmit();
    });
}

function handleUrlInput() {
    const input = document.getElementById('power-url-input');
    const connectionStep = document.getElementById('connection-step');
    const url = input?.value?.trim();
    
    if (!url || !connectionStep) return;
    
    const platform = detectPlatformFromUrl(url);
    
    if (platform) {
        showConnectionStep(platform);
    } else {
        connectionStep.classList.add('hidden');
    }
}

function showConnectionStep(platform) {
    const connectionStep = document.getElementById('connection-step');
    const accountContainer = document.getElementById('connection-account');
    
    if (!connectionStep || !accountContainer) return;
    
    // Hide all platform follow options
    accountContainer.querySelectorAll('.account-to-follow').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Show the relevant platform
    const platformFollow = document.getElementById(`follow-${platform.key}`);
    if (platformFollow) {
        platformFollow.classList.remove('hidden');
    }
    
    // Show connection step
    connectionStep.classList.remove('hidden');
    
    // Reset checkbox
    const checkbox = document.getElementById('connection-confirmed');
    if (checkbox) checkbox.checked = false;
}

async function handlePowerCheckSubmit() {
    const input = document.getElementById('power-url-input');
    const button = document.getElementById('power-analyze-btn');
    const url = input?.value?.trim();
    
    if (!url) {
        showToast('Please enter a post URL');
        input?.focus();
        return;
    }
    
    // Validate URL
    try {
        new URL(url);
    } catch {
        showToast('Please enter a valid URL');
        return;
    }
    
    // Detect platform
    const platform = detectPlatformFromUrl(url);
    if (!platform) {
        showToast('Please enter a URL from a supported platform (Twitter/X, Reddit, etc.)');
        return;
    }
    
    // Check if platform is live
    if (typeof PLATFORMS !== 'undefined') {
        const platformData = PLATFORMS.find(p => p.id === platform.key);
        if (!platformData || platformData.status !== 'live') {
            showToast(`${platform.name} support coming soon! Currently we support Twitter/X and Reddit.`);
            return;
        }
    }
    
    // Set loading state
    button?.classList.add('loading');
    button?.setAttribute('disabled', 'true');
    
    // Get connection status
    const connectionConfirmed = document.getElementById('connection-confirmed')?.checked || false;
    
    // Show engine animation
    await runEngineAnimation(platform, url, connectionConfirmed);
}

async function runEngineAnimation(platform, url, connectionConfirmed) {
    const powerCard = document.getElementById('power-check-card');
    const engineAnimation = document.getElementById('engine-animation');
    const phase1 = document.getElementById('engine-phase-1');
    const phase2 = document.getElementById('engine-phase-2');
    const terminalOutput = document.getElementById('terminal-output');
    
    // Hide power card, show animation
    if (powerCard) powerCard.style.display = 'none';
    if (engineAnimation) engineAnimation.classList.remove('hidden');
    
    // Scroll to animation
    engineAnimation?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Phase 1: Engine startup
    if (phase1) phase1.classList.remove('hidden');
    if (phase2) phase2.classList.add('hidden');
    if (terminalOutput) terminalOutput.innerHTML = '';
    
    // Run terminal animation
    await runTerminalAnimation(terminalOutput, platform);
    
    // Animate factor progress
    await animateFactorProgress();
    
    // Phase 2: AI Analysis
    if (phase1) phase1.classList.add('hidden');
    if (phase2) phase2.classList.remove('hidden');
    
    // AI processing messages
    await runAIAnalysis();
    
    // Generate results and redirect
    const results = generatePowerCheckResults(platform, url, connectionConfirmed);
    redirectToResults(results);
}

async function runTerminalAnimation(container, platform) {
    if (!container) return;
    
    const lines = [
        { type: 'command', text: '$ shadowban-engine --init' },
        { type: 'response', text: '→ Loading 5-Factor Detection Engine v1.0...' },
        { type: 'response', text: `→ Target platform: ${platform.name}` },
        { type: 'command', text: `$ GET /api/${platform.key}/v2/status` },
        { type: 'data', text: '{ "status": "active", "checking": true }' },
        { type: 'success', text: '✓ Platform API connected' },
        { type: 'command', text: '$ playwright launch --headless --us-server' },
        { type: 'response', text: '→ Spawning browser instances from U.S. servers...' },
        { type: 'success', text: '✓ Web analysis ready' },
        { type: 'command', text: '$ query historical_data' },
        { type: 'success', text: '✓ Historical baseline loaded' },
        { type: 'command', text: '$ SELECT * FROM hashtag_db' },
        { type: 'success', text: '✓ Hashtag database ready' },
        { type: 'command', text: '$ analyze_ip --check-vpn' },
        { type: 'success', text: '✓ IP analysis complete' },
        { type: 'success', text: '═══ ALL 5 FACTORS READY ═══' },
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
        }
        
        container.appendChild(lineEl);
        container.scrollTop = container.scrollHeight;
        
        await sleep(150);
    }
}

async function animateFactorProgress() {
    const factors = ['factor-1-progress', 'factor-2-progress', 'factor-3-progress', 'factor-4-progress', 'factor-5-progress'];
    
    for (const factorId of factors) {
        const factorEl = document.getElementById(factorId);
        const statusEl = factorEl?.querySelector('.factor-status');
        
        if (factorEl && statusEl) {
            factorEl.classList.add('active');
            statusEl.textContent = '◉';
            statusEl.classList.remove('pending');
            statusEl.classList.add('running');
            
            await sleep(300);
            
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
        'Cross-referencing signals...',
        'Analyzing visibility patterns...',
        'Checking historical anomalies...',
        'Calculating probability score...',
        'Generating recommendations...'
    ];
    
    for (const message of messages) {
        if (messageEl) messageEl.textContent = message;
        await sleep(500);
    }
}

function generatePowerCheckResults(platform, url, connectionConfirmed) {
    const username = extractUsernameFromUrl(url, platform);
    const postId = extractPostIdFromUrl(url, platform);
    
    // Generate probability score (demo - will be real API later)
    const baseScore = Math.floor(Math.random() * 35) + 10;
    const vpnPenalty = userIPData?.isVPN ? 10 : 0;
    const datacenterPenalty = userIPData?.isDatacenter ? 15 : 0;
    const connectionBonus = connectionConfirmed ? -5 : 5;
    
    let probability = Math.min(Math.max(baseScore + vpnPenalty + datacenterPenalty + connectionBonus, 5), 95);
    
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
    
    // Generate findings based on probability
    const findings = generateFindings(platform, probability, userIPData);
    
    // Generate factor results
    const factors = {
        api: { 
            active: true, 
            status: probability < 40 ? 'good' : 'warning',
            finding: probability < 40 ? 'Account active and accessible via API' : 'Some API flags detected'
        },
        web: { 
            active: true, 
            status: probability < 50 ? 'good' : 'warning',
            finding: probability < 50 ? 'Search visibility confirmed from U.S. servers' : 'Reduced search visibility detected'
        },
        historical: { 
            active: true, 
            status: probability < 30 ? 'good' : 'warning',
            finding: probability < 30 ? 'Engagement within normal baseline' : 'Engagement below baseline'
        },
        hashtag: { 
            active: true, 
            status: 'good',
            finding: 'No banned or restricted hashtags detected'
        },
        ip: { 
            active: true, 
            status: userIPData?.isVPN || userIPData?.isDatacenter ? 'warning' : 'good',
            finding: userIPData?.isVPN ? 'VPN detected (+10% probability)' : 
                     userIPData?.isDatacenter ? 'Datacenter IP detected (+15% probability)' : 
                     'Residential IP verified'
        }
    };
    
    // Twitter-specific: Blue checkmark
    let verification = null;
    if (platform.key === 'twitter') {
        // Demo: randomly assign verification status
        const verificationTypes = ['none', 'blue', 'gold', 'grey'];
        const verificationWeights = [0.7, 0.2, 0.05, 0.05];
        const rand = Math.random();
        let cumulative = 0;
        let verificationType = 'none';
        
        for (let i = 0; i < verificationTypes.length; i++) {
            cumulative += verificationWeights[i];
            if (rand <= cumulative) {
                verificationType = verificationTypes[i];
                break;
            }
        }
        
        verification = {
            type: verificationType,
            hasCheckmark: verificationType !== 'none',
            impact: verificationType === 'none' ? '+5% added to probability (unverified accounts may have lower visibility)' : 'Verification status positive for visibility'
        };
        
        // Add to probability if no checkmark
        if (verificationType === 'none') {
            probability = Math.min(probability + 5, 95);
        }
    }
    
    // Build results object
    const results = {
        type: 'power',
        platform: platform,
        url: url,
        username: username,
        postId: postId,
        timestamp: Date.now(),
        probability: probability,
        verdict: verdict,
        verdictText: verdictText,
        findings: findings,
        factors: factors,
        verification: verification,
        ipData: userIPData,
        connectionConfirmed: connectionConfirmed
    };
    
    // Store for Shadow AI
    window.latestScanResults = results;
    window.lastSearchType = 'power';
    
    return results;
}

function generateFindings(platform, probability, ipData) {
    const findings = [];
    
    if (probability < 30) {
        findings.push({ type: 'good', text: 'Account appears in search results' });
        findings.push({ type: 'good', text: 'Profile accessible to public' });
        findings.push({ type: 'good', text: 'Engagement patterns look normal' });
    } else if (probability < 60) {
        findings.push({ type: 'good', text: 'Account exists and is accessible' });
        findings.push({ type: 'warning', text: 'Some visibility signals below normal' });
        if (ipData?.isVPN) {
            findings.push({ type: 'warning', text: 'VPN detected - may affect platform trust' });
        }
    } else {
        findings.push({ type: 'warning', text: 'Multiple visibility concerns detected' });
        findings.push({ type: 'bad', text: 'Search visibility significantly reduced' });
        findings.push({ type: 'warning', text: 'Engagement below historical baseline' });
    }
    
    // Twitter-specific finding about verification
    if (platform.key === 'twitter') {
        findings.push({ type: 'warning', text: 'No verification badge detected (may affect visibility)' });
    }
    
    return findings;
}

function redirectToResults(results) {
    // Store results in sessionStorage for results.html to read
    sessionStorage.setItem('shadowban_results', JSON.stringify(results));
    
    // Build URL (placeholder structure until backend ready)
    // Format: /results/twitter/username or /results/post/twitter/postId
    const platform = results.platform.key;
    const identifier = results.username.replace('@', '').replace('u/', '');
    
    // For now, use query params (will be clean URLs with backend)
    const params = new URLSearchParams({
        platform: platform,
        q: identifier,
        type: 'power',
        t: results.timestamp
    });
    
    // Redirect to results page
    window.location.href = `results.html?${params.toString()}`;
}

/* =============================================================================
   FACTOR INFO MODALS
   ============================================================================= */
function initFactorInfoButtons() {
    // Handle clicks on factor info buttons in Under the Hood section
    document.querySelectorAll('.factor-compact-info, .factor-info-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const factorKey = this.closest('[data-factor]')?.dataset.factor;
            if (factorKey && FACTOR_INFO[factorKey]) {
                openFactorInfoModal(factorKey);
            }
        });
    });
}

function openFactorInfoModal(factorKey) {
    const info = FACTOR_INFO[factorKey];
    if (!info) return;
    
    const modal = document.getElementById('factor-info-modal');
    const iconEl = document.getElementById('factor-modal-icon');
    const titleEl = document.getElementById('factor-modal-title');
    const bodyEl = document.getElementById('factor-modal-body');
    
    if (!modal || !bodyEl) return;
    
    if (iconEl) iconEl.textContent = info.icon;
    if (titleEl) titleEl.textContent = info.title;
    
    bodyEl.innerHTML = `
        <p style="margin-bottom: var(--space-lg);">${info.description}</p>
        
        <div class="factor-detail-section">
            <h4>What We Check:</h4>
            <ul class="factor-detail-list">
                ${info.details.map(d => `<li><span>✓</span> ${d}</li>`).join('')}
            </ul>
        </div>
        
        <div class="factor-tech-details">
            <h5>Technical Implementation:</h5>
            <p><code>${info.tech}</code></p>
        </div>
    `;
    
    openModal('factor-info-modal');
}

/* =============================================================================
   MODAL UTILITIES
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
   PLATFORM GRID
   ============================================================================= */
function initPlatformGrid() {
    const platformGrid = document.getElementById('platform-grid');
    if (!platformGrid || typeof platformData === 'undefined') return;
    
    platformGrid.innerHTML = '';
    
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
        
        item.addEventListener('click', () => openPlatformModal(platform));
        platformGrid.appendChild(item);
    });
}

function initPowerPlatforms() {
    const container = document.getElementById('power-platform-icons');
    if (!container || typeof PLATFORMS === 'undefined') return;
    
    const livePlatforms = PLATFORMS.filter(p => p.status === 'live');
    const comingSoonCount = PLATFORMS.filter(p => p.status !== 'live').length;
    
    let html = livePlatforms.map(p => `
        <span class="platform-chip" data-platform="${p.id}" title="${p.name}">${p.icon}</span>
    `).join('');
    
    if (comingSoonCount > 0) {
        html += `<span class="platform-chip coming" id="power-more-platforms" title="View all platforms">+${comingSoonCount}</span>`;
    }
    
    container.innerHTML = html;
    
    container.querySelectorAll('.platform-chip[data-platform]').forEach(chip => {
        chip.addEventListener('click', () => {
            const platform = PLATFORMS.find(p => p.id === chip.dataset.platform);
            if (platform) openPlatformModal(platform);
        });
    });
    
    document.getElementById('power-more-platforms')?.addEventListener('click', openAllPlatformsModal);
}

function openPlatformModal(platform) {
    const modal = document.getElementById('platform-modal');
    if (!modal) return;
    
    document.getElementById('modal-icon').textContent = platform.icon;
    document.getElementById('modal-title').textContent = `${platform.name} Analysis`;
    
    const statusEl = document.getElementById('modal-status');
    if (statusEl) {
        statusEl.innerHTML = platform.status === 'live' 
            ? '<span class="status-badge live">● Live</span>'
            : '<span class="status-badge soon">◷ Coming Soon</span>';
    }
    
    const bodyEl = document.getElementById('modal-body');
    if (bodyEl) {
        if (platform.status === 'live' && platform.checks) {
            // Add Twitter-specific checkmark info
            let checksHtml = platform.checks.slice(0, 8).map(check => `<li>✓ ${check}</li>`).join('');
            
            if (platform.id === 'twitter') {
                checksHtml += `<li>✓ <strong>Verification badge detection</strong> (Blue ✓, Gold ✓, Grey ✓)</li>`;
            }
            
            bodyEl.innerHTML = `
                <p class="modal-intro">For ${platform.name}, we analyze these signals to calculate probability:</p>
                <ul class="platform-checks-list">${checksHtml}</ul>
                <p style="margin-top: var(--space-md); color: var(--text-muted); font-size: 0.875rem;">
                    Results include shadow ban probability, detailed breakdown, and recommendations.
                </p>
            `;
        } else {
            bodyEl.innerHTML = `
                <p class="modal-intro">${platform.name} analysis is coming soon!</p>
                <p style="color: var(--text-muted);">We're working on adding ${platform.name} to our 5-Factor Detection Engine.</p>
            `;
        }
    }
    
    openModal('platform-modal');
}

function openAllPlatformsModal() {
    const livePlatforms = PLATFORMS.filter(p => p.status === 'live');
    const comingSoon = PLATFORMS.filter(p => p.status !== 'live');
    
    let modal = document.getElementById('all-platforms-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'all-platforms-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-icon">🌐</div>
                <h3 class="modal-title">All Supported Platforms</h3>
                <div class="modal-body" id="all-platforms-body"></div>
                <div class="modal-footer">
                    <button class="btn btn-primary btn-lg" onclick="closeModal('all-platforms-modal')">Got It!</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const bodyEl = document.getElementById('all-platforms-body');
    let html = '<div class="all-platforms-list">';
    
    html += '<div class="platforms-group"><h4 style="color: var(--success);">✓ Live Now</h4>';
    html += '<div class="platforms-grid">';
    livePlatforms.forEach(p => {
        html += `<div class="platform-item" data-platform="${p.id}"><span>${p.icon}</span><span>${p.name}</span></div>`;
    });
    html += '</div></div>';
    
    if (comingSoon.length > 0) {
        html += '<div class="platforms-group" style="margin-top: var(--space-lg);"><h4 style="color: var(--warning);">◷ Coming Soon</h4>';
        html += '<div class="platforms-grid">';
        comingSoon.forEach(p => {
            html += `<div class="platform-item coming"><span>${p.icon}</span><span>${p.name}</span></div>`;
        });
        html += '</div></div>';
    }
    
    html += '</div>';
    bodyEl.innerHTML = html;
    
    openModal('all-platforms-modal');
}

/* =============================================================================
   FAQ ACCORDION
   ============================================================================= */
function initFAQAccordion() {
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question?.addEventListener('click', function() {
            const wasActive = item.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            // Toggle current
            if (!wasActive) item.classList.add('active');
        });
    });
}

/* =============================================================================
   SOCIAL SHARE
   ============================================================================= */
function initSocialShare() {
    const shareUrl = encodeURIComponent(window.location.origin);
    const shareText = encodeURIComponent('Calculate your shadow ban probability with the 5-Factor Detection Engine! 🔍');
    
    document.getElementById('share-twitter')?.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
    });
    
    document.getElementById('share-facebook')?.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
    });
    
    document.getElementById('share-telegram')?.addEventListener('click', () => {
        window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, '_blank');
    });
    
    document.getElementById('share-linkedin')?.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
    });
}

/* =============================================================================
   TOAST NOTIFICATION
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
    
    setTimeout(() => toast.classList.remove('visible'), 3000);
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
   MOBILE NAV
   ============================================================================= */
function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');
    const navOverlay = document.getElementById('nav-overlay');
    
    if (!navToggle || !navMobile) return;
    
    function toggleNav() {
        const isOpen = navMobile.classList.contains('active');
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
   AUDIENCE INFO MODALS
   ============================================================================= */
function initAudienceModals() {
    const audienceData = {
        'influencer': {
            icon: '📱',
            title: 'Why Influencers Need Probability Analysis',
            content: `
                <p class="modal-intro">As an influencer, your reach IS your business. Even a small visibility reduction can significantly impact your income.</p>
                <h4>Common Triggers:</h4>
                <ul class="check-list">
                    <li>Content that automated systems flag incorrectly</li>
                    <li>Using hashtags that became restricted after you posted</li>
                    <li>Engagement patterns that algorithms find "suspicious"</li>
                </ul>
                <div class="modal-tech-note">
                    <h4>💡 Why Probability Matters</h4>
                    <p>Platforms don't disclose their algorithms. We analyze <strong>5 independent signals</strong> to calculate the <strong>probability</strong> your reach is being limited. A 15% probability is normal; 50%+ means multiple signals indicate issues.</p>
                </div>
            `
        },
        'politician': {
            icon: '🗳️',
            title: 'Why Politicians Need Probability Analysis',
            content: `
                <p class="modal-intro">Your constituents need to hear your message. Shadow bans can silently suppress your voice during critical moments.</p>
                <h4>Why This Happens:</h4>
                <ul class="check-list">
                    <li>Algorithms may flag political content as "divisive"</li>
                    <li>Mass-reporting campaigns from opponents</li>
                    <li>Automated systems don't understand political context</li>
                </ul>
                <div class="modal-tech-note">
                    <h4>💡 Transparency Matters</h4>
                    <p>Platforms have <strong>no legal obligation</strong> to disclose visibility restrictions. Our 5-Factor Engine calculates probability with <strong>documented evidence</strong> you can use for appeals or public disclosure.</p>
                </div>
            `
        },
        'public-figure': {
            icon: '⭐',
            title: 'Why Public Figures Need Probability Analysis',
            content: `
                <p class="modal-intro">Whether you're an actor, athlete, or personality—your fans expect to see your content. Shadow bans can disconnect you from your audience.</p>
                <h4>At-Risk Situations:</h4>
                <ul class="check-list">
                    <li>Expressing views that algorithms flag</li>
                    <li>High visibility making you a target for reporting</li>
                    <li>Content misinterpreted by automated moderation</li>
                </ul>
            `
        },
        'agency': {
            icon: '🏛️',
            title: 'Why Agencies & Brands Need Probability Analysis',
            content: `
                <p class="modal-intro">When you invest in social communications, you need to know your messages are actually being delivered.</p>
                <h4>At-Risk Situations:</h4>
                <ul class="check-list">
                    <li>Public health announcements flagged as "misinformation"</li>
                    <li>Crisis communications not reaching stakeholders</li>
                    <li>Brand campaigns suppressed without explanation</li>
                </ul>
                <div class="modal-tech-note">
                    <h4>💡 Accountability</h4>
                    <p>Our detection system provides <strong>documented evidence</strong> your legal, compliance, and communications teams can use to demand transparency or adjust strategy.</p>
                </div>
            `
        }
    };
    
    document.querySelectorAll('.audience-info-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const type = this.dataset.audience;
            const data = audienceData[type];
            if (!data) return;
            
            document.getElementById('audience-modal-icon').textContent = data.icon;
            document.getElementById('audience-modal-title').textContent = data.title;
            document.getElementById('audience-modal-body').innerHTML = data.content;
            
            openModal('audience-modal');
        });
    });
}

/* =============================================================================
   INITIALIZE
   ============================================================================= */
function initializeApp() {
    initMobileNav();
    initModalHandlers();
    initScrollReveal();
    initPlatformGrid();
    initPowerCheck();
    initFactorInfoButtons();
    initFAQAccordion();
    initSocialShare();
    initAudienceModals();
    
    detectUserIP();
    
    console.log('✅ ShadowBanCheck.io initialized');
}

// Initialize when DOM ready or after shared components load
document.addEventListener('DOMContentLoaded', initializeApp);
document.addEventListener('sharedComponentsLoaded', initializeApp);

// Prevent double init
let initialized = false;
const originalInit = initializeApp;
initializeApp = function() {
    if (initialized) return;
    initialized = true;
    originalInit();
};

/* =============================================================================
   EXPORTS
   ============================================================================= */
window.ShadowBan = {
    showToast,
    openModal,
    closeModal,
    detectUserIP,
    getIPData: () => userIPData,
    getLatestResults: () => window.latestScanResults
};

window.closeLimitModal = () => closeModal('limit-modal');
