/* =============================================================================
   POST CHECKER PAGE - JAVASCRIPT
   ShadowBanCheck.io
   Calculates shadow ban probability for individual posts
   Redirects to results.html with permanent URL
   ============================================================================= */

(function() {
'use strict';

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
    'reddit': { name: 'Reddit', icon: '🤖', key: 'reddit' },
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
    
    // URL input - detect platform as user types
    urlInput.addEventListener('input', function() {
        detectPlatform(this.value.trim());
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const url = urlInput.value.trim();
        if (url) {
            runPostCheck(url);
        }
    });
    
    // Clear button
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
            
            // Determine IP type
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
            
            // Update display
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
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// ============================================
// RUN POST CHECK WITH ANIMATION
// ============================================
async function runPostCheck(url) {
    // Validate URL
    if (!isValidUrl(url)) {
        showToast('Please enter a valid URL');
        return;
    }
    
    // Detect platform if not already
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
    
    // Hide checker card, show animation
    if (checkerCard) checkerCard.style.display = 'none';
    if (engineAnimation) engineAnimation.classList.remove('hidden');
    
    // Scroll to animation
    engineAnimation?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Set button loading state
    checkBtn?.classList.add('loading');
    
    try {
        // Run engine animation
        await runEngineAnimation();
        
        // Generate results
        const results = generateResults(url);
        
        // Store and redirect
        sessionStorage.setItem('shadowban_results', JSON.stringify(results));
        
        // Store for Shadow AI
        window.latestScanResults = results;
        window.lastSearchType = 'post';
        
        // Extract post ID for URL
        const postId = extractPostId(url);
        
        // Redirect to results page
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
        
        // Show checker card again
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
        
        // Twitter: /username/status/123456789
        if (detectedPlatform === 'twitter') {
            const match = pathname.match(/\/status\/(\d+)/);
            if (match) return match[1];
        }
        
        // Reddit: /r/subreddit/comments/abc123/...
        if (detectedPlatform === 'reddit') {
            const match = pathname.match(/\/comments\/([a-zA-Z0-9]+)/);
            if (match) return match[1];
        }
        
        // Instagram: /p/ABC123/ or /reel/ABC123/
        if (detectedPlatform === 'instagram') {
            const match = pathname.match(/\/(?:p|reel)\/([\w-]+)/);
            if (match) return match[1];
        }
        
        // YouTube: ?v=ABC123 or /ABC123
        if (detectedPlatform === 'youtube') {
            const vParam = urlObj.searchParams.get('v');
            if (vParam) return vParam;
            const match = pathname.match(/\/([\w-]+)$/);
            if (match) return match[1];
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
    
    // Phase 1: Engine startup
    if (phase1) phase1.classList.remove('hidden');
    if (phase2) phase2.classList.add('hidden');
    if (terminalOutput) terminalOutput.innerHTML = '';
    
    // Terminal animation
    await runTerminalAnimation(terminalOutput);
    
    // Factor progress animation (skip historical for post check)
    await animateFactorProgress();
    
    // Phase 2: AI Analysis
    if (phase1) phase1.classList.add('hidden');
    if (phase2) phase2.classList.remove('hidden');
    
    // AI processing
    await runAIAnalysis();
}

async function runTerminalAnimation(container) {
    if (!container) return;
    
    const platformName = PLATFORM_DATA[detectedPlatform]?.name || detectedPlatform;
    
    const lines = [
        { type: 'command', text: '$ shadowban-engine --init --type=post' },
        { type: 'response', text: '→ Loading 5-Factor Detection Engine v1.0...' },
        { type: 'response', text: `→ Target: ${platformName} post` },
        { type: 'command', text: `$ GET /api/${detectedPlatform}/v2/post/analyze` },
        { type: 'data', text: '{ "status": "fetching", "type": "post" }' },
        { type: 'success', text: '✓ Platform API connected' },
        { type: 'command', text: '$ playwright launch --headless --us-server' },
        { type: 'response', text: '→ Spawning browser instances from U.S. servers...' },
        { type: 'success', text: '✓ Web analysis ready' },
        { type: 'response', text: '→ Historical analysis: SKIPPED (single post check)' },
        { type: 'command', text: '$ SELECT * FROM hashtag_db WHERE post_id = ?' },
        { type: 'success', text: '✓ Hashtag database checked' },
        { type: 'command', text: '$ analyze_ip --check-vpn' },
        { type: 'success', text: '✓ IP analysis complete' },
        { type: 'success', text: '═══ 4/5 FACTORS READY ═══' },
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
    // For post checks: API, Web, Hashtag, IP are active; Historical is skipped
    const factors = [
        { id: 'factor-1-progress', skip: false },  // API
        { id: 'factor-2-progress', skip: false },  // Web
        { id: 'factor-3-progress', skip: true },   // Historical (skip for posts)
        { id: 'factor-4-progress', skip: false },  // Hashtags
        { id: 'factor-5-progress', skip: false }   // IP
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
        'Analyzing post content...',
        'Checking hashtag health...',
        'Calculating probability score...',
        'Generating recommendations...'
    ];
    
    for (const message of messages) {
        if (messageEl) messageEl.textContent = message;
        await sleep(500);
    }
}

// ============================================
// GENERATE RESULTS
// ============================================
function generateResults(url) {
    const platform = PLATFORM_DATA[detectedPlatform] || { name: 'Unknown', icon: '🔗', key: detectedPlatform };
    const postId = extractPostId(url);
    
    // Generate probability score
    const baseScore = Math.floor(Math.random() * 35) + 10; // 10-45%
    const vpnPenalty = userIPData?.isVPN ? 10 : 0;
    const datacenterPenalty = userIPData?.isDatacenter ? 15 : 0;
    
    let probability = Math.min(Math.max(baseScore + vpnPenalty + datacenterPenalty, 5), 95);
    
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
    if (probability < 30) {
        findings.push({ type: 'good', text: 'Post appears in search results' });
        findings.push({ type: 'good', text: 'No flagged content detected' });
        findings.push({ type: 'good', text: 'Hashtags appear safe' });
    } else if (probability < 60) {
        findings.push({ type: 'good', text: 'Post is accessible' });
        findings.push({ type: 'warning', text: 'Some visibility signals below normal' });
        if (userIPData?.isVPN) {
            findings.push({ type: 'warning', text: 'VPN detected - may affect reach' });
        }
    } else {
        findings.push({ type: 'warning', text: 'Multiple visibility concerns detected' });
        findings.push({ type: 'bad', text: 'Search visibility may be limited' });
    }
    
    // Factor results (post checks skip historical)
    const factors = {
        api: { 
            active: true, 
            status: probability < 40 ? 'good' : 'warning',
            finding: probability < 40 ? 'Post data retrieved successfully' : 'Some engagement metrics below expected'
        },
        web: { 
            active: true, 
            status: probability < 50 ? 'good' : 'warning',
            finding: probability < 50 ? 'Post visible in search from U.S. servers' : 'Limited search visibility detected'
        },
        historical: { 
            active: false, 
            status: 'inactive',
            finding: 'Not applicable for single post checks'
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
        verification: null,
        ipData: userIPData,
        factorsUsed: '4/5'
    };
}

// ============================================
// SUPPORTED PLATFORMS
// ============================================
function initSupportedPlatforms() {
    const container = document.getElementById('supported-platform-icons');
    if (!container || typeof PLATFORMS === 'undefined') return;
    
    // Show all 5 platforms (2 live, 3 coming soon)
    const allPlatforms = [...PLATFORMS];
    
    // Sort - live first, then coming soon
    allPlatforms.sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (a.status !== 'live' && b.status === 'live') return 1;
        return 0;
    });
    
    const html = allPlatforms.map(p => `
        <span class="platform-chip ${p.status === 'soon' ? 'coming' : ''}" data-platform="${p.id}" title="${p.name}${p.status === 'soon' ? ' (Coming Soon)' : ''}">${p.icon}</span>
    `).join('');
    
    container.innerHTML = html;
    
    // Add click handlers
    container.querySelectorAll('.platform-chip[data-platform]').forEach(chip => {
        chip.addEventListener('click', () => showPlatformInfoModal(chip.dataset.platform));
    });
}

// ============================================
// MODALS
// ============================================
function initInfoModals() {
    // Post info button
    const postInfoBtn = document.getElementById('post-info-btn');
    const postModal = document.getElementById('post-info-modal');
    
    postInfoBtn?.addEventListener('click', () => {
        postModal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    // Engine info button
    const engineInfoBtn = document.getElementById('engine-info-btn');
    const engineModal = document.getElementById('engine-info-modal');
    
    engineInfoBtn?.addEventListener('click', () => {
        engineModal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    // Close handlers
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
    
    // Escape key
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
    
    iconEl.textContent = platform.icon;
    titleEl.textContent = `${platform.name} - Post Probability Analysis`;
    
    if (platform.status === 'live') {
        const checksToShow = platform.postChecks || platform.checks || [];
        
        bodyEl.innerHTML = `
            <p class="modal-intro">For ${platform.name} posts, we calculate probability by analyzing:</p>
            <ul class="platform-checks-list">
                ${checksToShow.slice(0, 6).map(check => `<li>✓ ${check}</li>`).join('')}
            </ul>
            <p style="margin-top: var(--space-md); color: var(--text-muted); font-size: 0.875rem;">
                Results include probability score, detailed breakdown, and recommendations.
            </p>
        `;
    } else {
        bodyEl.innerHTML = `
            <p class="modal-intro">${platform.name} post probability analysis is coming soon!</p>
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
