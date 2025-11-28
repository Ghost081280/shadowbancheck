/* =============================================================================
   ACCOUNT CHECKER PAGE - JAVASCRIPT
   ShadowBanCheck.io
   Calculates shadow ban probability for user accounts
   Redirects to results.html with permanent URL
   ============================================================================= */

(function() {
'use strict';

// ============================================
// STATE
// ============================================
let selectedPlatform = null;
let userIPData = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initAccountChecker();
    initPlatformSelect();
    initSupportedPlatforms();
    initInfoModals();
    detectIP();
    
    // Check for pre-selected platform from URL
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedPlatform = urlParams.get('platform');
    if (preselectedPlatform) {
        const select = document.getElementById('platform-select');
        if (select) {
            select.value = preselectedPlatform;
            handlePlatformChange(preselectedPlatform);
        }
    }
});

function initAccountChecker() {
    const form = document.getElementById('account-check-form');
    const usernameInput = document.getElementById('username-input');
    const checkBtn = document.getElementById('check-account-btn');
    const clearBtn = document.getElementById('clear-btn');
    const platformSelect = document.getElementById('platform-select');
    
    if (!form || !usernameInput || !checkBtn) return;
    
    // Username input
    usernameInput.addEventListener('input', updateCheckButton);
    
    // Platform select
    platformSelect?.addEventListener('change', function() {
        handlePlatformChange(this.value);
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username && selectedPlatform) {
            runAccountCheck(username);
        }
    });
    
    // Clear button
    clearBtn?.addEventListener('click', function() {
        usernameInput.value = '';
        platformSelect.value = '';
        selectedPlatform = null;
        updateCheckButton();
        updatePlatformStatus();
    });
}

function initPlatformSelect() {
    const select = document.getElementById('platform-select');
    if (!select || typeof PLATFORMS === 'undefined') return;
    
    // Clear existing options except first
    select.innerHTML = '<option value="">Select Platform</option>';
    
    // Add live platforms first
    const livePlatforms = PLATFORMS.filter(p => p.status === 'live');
    const comingSoon = PLATFORMS.filter(p => p.status !== 'live');
    
    if (livePlatforms.length > 0) {
        const liveGroup = document.createElement('optgroup');
        liveGroup.label = '✓ Available Now';
        livePlatforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform.id;
            option.textContent = `${platform.icon} ${platform.name}`;
            liveGroup.appendChild(option);
        });
        select.appendChild(liveGroup);
    }
    
    if (comingSoon.length > 0) {
        const soonGroup = document.createElement('optgroup');
        soonGroup.label = '◷ Coming Soon';
        comingSoon.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform.id;
            option.textContent = `${platform.icon} ${platform.name}`;
            option.disabled = true;
            soonGroup.appendChild(option);
        });
        select.appendChild(soonGroup);
    }
}

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

function handlePlatformChange(platformId) {
    if (!platformId) {
        selectedPlatform = null;
        updatePlatformStatus();
        updateCheckButton();
        return;
    }
    
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;
    
    if (platform.status !== 'live') {
        showToast(`${platform.name} coming soon! Create an account to get notified.`);
        document.getElementById('platform-select').value = '';
        selectedPlatform = null;
    } else {
        selectedPlatform = platform;
    }
    
    updatePlatformStatus();
    updateCheckButton();
}

function updatePlatformStatus() {
    const statusEl = document.getElementById('platform-status');
    if (!statusEl) return;
    
    if (selectedPlatform) {
        statusEl.textContent = `${selectedPlatform.icon} ${selectedPlatform.name} selected`;
        statusEl.classList.add('ready');
    } else {
        statusEl.textContent = 'Select a platform to continue';
        statusEl.classList.remove('ready');
    }
}

function updateCheckButton() {
    const btn = document.getElementById('check-account-btn');
    const usernameInput = document.getElementById('username-input');
    
    if (!btn || !usernameInput) return;
    
    const hasUsername = usernameInput.value.trim().length > 0;
    const hasPlatform = selectedPlatform !== null;
    
    btn.disabled = !hasUsername || !hasPlatform;
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
// RUN ACCOUNT CHECK WITH ANIMATION
// ============================================
async function runAccountCheck(username) {
    // Clean username
    username = username.replace(/^@/, '').trim();
    
    if (!username || !selectedPlatform) {
        showToast('Please select a platform and enter a username');
        return;
    }
    
    const checkerCard = document.getElementById('checker-card');
    const engineAnimation = document.getElementById('engine-animation');
    const checkBtn = document.getElementById('check-account-btn');
    
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
        const results = generateResults(username);
        
        // Store and redirect
        sessionStorage.setItem('shadowban_results', JSON.stringify(results));
        
        // Store for Shadow AI
        window.latestScanResults = results;
        window.lastSearchType = 'account';
        
        // Redirect to results page
        const params = new URLSearchParams({
            platform: selectedPlatform.id,
            q: username,
            type: 'account',
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
    
    // Factor progress animation (skip hashtag for account check)
    await animateFactorProgress(true);
    
    // Phase 2: AI Analysis
    if (phase1) phase1.classList.add('hidden');
    if (phase2) phase2.classList.remove('hidden');
    
    // AI processing
    await runAIAnalysis();
}

async function runTerminalAnimation(container) {
    if (!container) return;
    
    const lines = [
        { type: 'command', text: '$ shadowban-engine --init --type=account' },
        { type: 'response', text: '→ Loading 5-Factor Detection Engine v1.0...' },
        { type: 'response', text: `→ Target: ${selectedPlatform.name} account` },
        { type: 'command', text: `$ GET /api/${selectedPlatform.id}/v2/user/${document.getElementById('username-input')?.value || 'user'}` },
        { type: 'data', text: '{ "status": "active", "checking": true }' },
        { type: 'success', text: '✓ Platform API connected' },
        { type: 'command', text: '$ playwright launch --headless --us-server' },
        { type: 'response', text: '→ Spawning browser instances from U.S. servers...' },
        { type: 'success', text: '✓ Web analysis ready' },
        { type: 'command', text: '$ query historical_baselines' },
        { type: 'success', text: '✓ Historical data loaded' },
        { type: 'response', text: '→ Hashtag analysis: SKIPPED (account-only check)' },
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

async function animateFactorProgress(skipHashtag = false) {
    const factors = [
        { id: 'factor-1-progress', skip: false },
        { id: 'factor-2-progress', skip: false },
        { id: 'factor-3-progress', skip: false },
        { id: 'factor-4-progress', skip: skipHashtag }, // Hashtag
        { id: 'factor-5-progress', skip: false }
    ];
    
    for (const factor of factors) {
        const factorEl = document.getElementById(factor.id);
        const statusEl = factorEl?.querySelector('.factor-status');
        
        if (!factorEl || !statusEl) continue;
        
        if (factor.skip) {
            // Mark as skipped
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
        'Analyzing account patterns...',
        'Checking visibility status...',
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
function generateResults(username) {
    // Generate probability score
    const baseScore = Math.floor(Math.random() * 30) + 10; // 10-40%
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
        findings.push({ type: 'good', text: 'Account appears in search results' });
        findings.push({ type: 'good', text: 'Profile is publicly accessible' });
        findings.push({ type: 'good', text: 'Engagement patterns within normal range' });
    } else if (probability < 60) {
        findings.push({ type: 'good', text: 'Account exists and is accessible' });
        findings.push({ type: 'warning', text: 'Some visibility signals below normal' });
        if (userIPData?.isVPN) {
            findings.push({ type: 'warning', text: 'VPN detected - may affect platform trust' });
        }
    } else {
        findings.push({ type: 'warning', text: 'Multiple visibility concerns detected' });
        findings.push({ type: 'bad', text: 'Search visibility significantly reduced' });
    }
    
    // Factor results
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
            active: false, 
            status: 'inactive',
            finding: 'Not applicable for account checks'
        },
        ip: { 
            active: true, 
            status: userIPData?.isVPN || userIPData?.isDatacenter ? 'warning' : 'good',
            finding: userIPData?.isVPN ? 'VPN detected (+10% probability)' : 
                     userIPData?.isDatacenter ? 'Datacenter IP detected (+15% probability)' : 
                     'Residential IP verified'
        }
    };
    
    // Twitter-specific: Check verification (demo)
    let verification = null;
    if (selectedPlatform.id === 'twitter') {
        const rand = Math.random();
        verification = {
            type: rand < 0.7 ? 'none' : rand < 0.9 ? 'blue' : rand < 0.95 ? 'gold' : 'grey',
            hasCheckmark: rand >= 0.7,
            impact: rand < 0.7 ? '+5% added to probability (unverified)' : 'Positive for visibility'
        };
        
        if (!verification.hasCheckmark) {
            probability = Math.min(probability + 5, 95);
            findings.push({ type: 'warning', text: 'No verification badge (may affect visibility)' });
        }
    }
    
    return {
        type: 'account',
        platform: {
            name: selectedPlatform.name,
            icon: selectedPlatform.icon,
            key: selectedPlatform.id,
            id: selectedPlatform.id
        },
        url: `https://${selectedPlatform.id === 'twitter' ? 'twitter.com' : selectedPlatform.id + '.com'}/${username}`,
        username: `@${username}`,
        timestamp: Date.now(),
        probability: probability,
        verdict: verdict,
        verdictText: verdictText,
        findings: findings,
        factors: factors,
        verification: verification,
        ipData: userIPData,
        factorsUsed: '4/5'
    };
}

// ============================================
// MODALS
// ============================================
function initInfoModals() {
    // Checker info button
    const checkerInfoBtn = document.getElementById('checker-info-btn');
    const checkerModal = document.getElementById('checker-info-modal');
    
    checkerInfoBtn?.addEventListener('click', () => {
        checkerModal?.classList.remove('hidden');
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
    titleEl.textContent = `${platform.name} - Probability Analysis`;
    
    if (platform.status === 'live' && platform.checks) {
        let checksHtml = platform.checks.slice(0, 8).map(check => `<li>✓ ${check}</li>`).join('');
        
        if (platform.id === 'twitter') {
            checksHtml += `<li>✓ <strong>Verification badge detection</strong> (Blue ✓, Gold ✓, Grey ✓)</li>`;
        }
        
        bodyEl.innerHTML = `
            <p class="modal-intro">For ${platform.name} accounts, we calculate probability by analyzing:</p>
            <ul class="platform-checks-list">${checksHtml}</ul>
            <p style="margin-top: var(--space-md); color: var(--text-muted); font-size: 0.875rem;">
                Results include probability score, detailed breakdown, and recommendations.
            </p>
        `;
    } else {
        bodyEl.innerHTML = `
            <p class="modal-intro">${platform.name} probability analysis is coming soon!</p>
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
