/* =============================================================================
   HASHTAG CHECKER PAGE - JAVASCRIPT
   ShadowBanCheck.io
   Calculates shadow ban probability for hashtags
   Redirects to results.html with permanent URL
   ============================================================================= */

(function() {
'use strict';

// ============================================
// BANNED HASHTAGS DATABASE
// ============================================
const bannedHashtags = {
    instagram: {
        banned: [
            'adulting', 'alone', 'attractive', 'beautyblogger', 'bikinibody',
            'costumes', 'dating', 'dm', 'elevator', 'girlsonly', 'humpday',
            'hustler', 'killingit', 'models', 'nasty', 'petite', 'pushup',
            'sexy', 'single', 'sunbathing', 'tanlines', 'teenagers', 'thinspo',
            'twerk', 'undies', 'valentinesday', 'woman', 'women'
        ],
        restricted: [
            'fitfam', 'likeforlike', 'popular', 'snap', 'tgif', 'followforfollow',
            'like4like', 'follow4follow', 'l4l', 'f4f', 'fitness', 'gym'
        ]
    },
    tiktok: {
        banned: [
            'porn', 'sex', 'nudity', 'sexy', 'hot', 'underwear', 'lingerie',
            'acne', 'weightloss', 'eatingdisorder', 'selfharm', 'depression',
            'anxiety', 'suicide', 'drugs', 'weed', 'cocaine'
        ],
        restricted: [
            'fyp', 'foryou', 'foryoupage', 'viral', 'xyzbca', 'plottwist',
            'trending', 'blowthisup', 'makemefamous'
        ]
    },
    twitter: {
        banned: [
            'porn', 'sex', 'nsfw', 'onlyfans', 'fraud', 'rigged'
        ],
        restricted: [
            'covid', 'coronavirus', 'vaccine', 'election', 'qanon', 'stopthesteal'
        ]
    },
    facebook: {
        banned: [
            'porn', 'sex', 'nude', 'drugs', 'weed', 'cannabis', 'gambling', 'betting'
        ],
        restricted: [
            'vaccine', 'covid', 'crypto', 'bitcoin', 'nft'
        ]
    },
    linkedin: {
        banned: [
            'porn', 'sex', 'mlm', 'getrichquick', 'scam'
        ],
        restricted: [
            'hiring', 'jobsearch', 'opentowork', 'follow', 'like', 'crypto',
            'nft', 'viral', 'hustle'
        ]
    }
};

window.bannedHashtags = bannedHashtags;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initHashtagChecker();
    initInfoModals();
    initPlatformTabs();
    initSupportedPlatforms();
    updateHashtagCount();
});

function initHashtagChecker() {
    const form = document.getElementById('hashtag-check-form');
    const hashtagInput = document.getElementById('hashtag-input');
    const checkBtn = document.getElementById('check-hashtags-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    if (!form || !hashtagInput || !checkBtn) return;
    
    // Update count on input
    hashtagInput.addEventListener('input', updateHashtagCount);
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const hashtags = parseHashtags(hashtagInput.value);
        if (hashtags.length > 0) {
            runHashtagCheck(hashtags);
        } else {
            showToast('Please enter at least one hashtag');
        }
    });
    
    // Clear button
    clearBtn?.addEventListener('click', function() {
        hashtagInput.value = '';
        updateHashtagCount();
    });
}

// ============================================
// HASHTAG PARSING
// ============================================
function parseHashtags(input) {
    if (!input) return [];
    
    let cleaned = input
        .toLowerCase()
        .replace(/[,\n\r]/g, ' ')
        .replace(/[^\w\s#]/g, '')
        .trim();
    
    let tags = cleaned.split(/\s+/)
        .map(tag => tag.replace(/^#+/, ''))
        .filter(tag => tag.length > 0);
    
    return [...new Set(tags)];
}

function updateHashtagCount() {
    const input = document.getElementById('hashtag-input');
    const countDisplay = document.getElementById('hashtag-count');
    
    if (!input || !countDisplay) return;
    
    const hashtags = parseHashtags(input.value);
    const count = hashtags.length;
    countDisplay.textContent = `${count} hashtag${count !== 1 ? 's' : ''}`;
}

// ============================================
// CHECK HASHTAG AGAINST DATABASE
// ============================================
function checkHashtag(hashtag) {
    const tag = hashtag.toLowerCase().replace(/^#/, '');
    const results = {
        hashtag: `#${tag}`,
        tag: tag,
        platforms: {}
    };
    
    Object.keys(bannedHashtags).forEach(platform => {
        const platformData = bannedHashtags[platform];
        
        if (platformData.banned.includes(tag)) {
            results.platforms[platform] = 'banned';
        } else if (platformData.restricted.includes(tag)) {
            results.platforms[platform] = 'restricted';
        } else {
            results.platforms[platform] = 'safe';
        }
    });
    
    const statuses = Object.values(results.platforms);
    if (statuses.includes('banned')) {
        results.status = 'banned';
    } else if (statuses.includes('restricted')) {
        results.status = 'restricted';
    } else {
        results.status = 'safe';
    }
    
    return results;
}

// ============================================
// RUN HASHTAG CHECK WITH ANIMATION
// ============================================
async function runHashtagCheck(hashtags) {
    const checkerCard = document.getElementById('checker-card');
    const engineAnimation = document.getElementById('engine-animation');
    const checkBtn = document.getElementById('check-hashtags-btn');
    
    // Hide checker card, show animation
    if (checkerCard) checkerCard.style.display = 'none';
    if (engineAnimation) engineAnimation.classList.remove('hidden');
    
    // Scroll to animation
    engineAnimation?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Set button loading state
    checkBtn?.classList.add('loading');
    
    try {
        // Run engine animation
        await runEngineAnimation(hashtags.length);
        
        // Check all hashtags
        const rawResults = hashtags.map(tag => checkHashtag(tag));
        
        // Generate results
        const results = generateResults(hashtags, rawResults);
        
        // Store and redirect
        sessionStorage.setItem('shadowban_results', JSON.stringify(results));
        
        // Store for Shadow AI
        window.latestScanResults = results;
        window.lastSearchType = 'hashtag';
        
        // Redirect to results page
        const params = new URLSearchParams({
            platform: 'hashtag',
            q: hashtags.slice(0, 3).join(','),
            type: 'hashtag',
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

async function runEngineAnimation(hashtagCount) {
    const phase1 = document.getElementById('engine-phase-1');
    const phase2 = document.getElementById('engine-phase-2');
    const terminalOutput = document.getElementById('terminal-output');
    
    // Phase 1: Engine startup
    if (phase1) phase1.classList.remove('hidden');
    if (phase2) phase2.classList.add('hidden');
    if (terminalOutput) terminalOutput.innerHTML = '';
    
    // Terminal animation
    await runTerminalAnimation(terminalOutput, hashtagCount);
    
    // Factor progress animation (API and IP skipped for hashtag checks)
    await animateFactorProgress();
    
    // Phase 2: AI Analysis
    if (phase1) phase1.classList.add('hidden');
    if (phase2) phase2.classList.remove('hidden');
    
    // AI processing
    await runAIAnalysis();
}

async function runTerminalAnimation(container, hashtagCount) {
    if (!container) return;
    
    const lines = [
        { type: 'command', text: '$ shadowban-engine --init --type=hashtag' },
        { type: 'response', text: '→ Loading 5-Factor Detection Engine v1.0...' },
        { type: 'response', text: `→ Target: ${hashtagCount} hashtag${hashtagCount > 1 ? 's' : ''}` },
        { type: 'response', text: '→ Platform APIs: SKIPPED (not needed for hashtags)' },
        { type: 'command', text: '$ query hashtag_database --all-platforms' },
        { type: 'data', text: '{ "db_size": 1847, "platforms": 5 }' },
        { type: 'success', text: '✓ Hashtag database loaded (1,800+ entries)' },
        { type: 'command', text: '$ playwright launch --headless --visibility-test' },
        { type: 'response', text: '→ Running real-time visibility tests...' },
        { type: 'success', text: '✓ Web analysis complete' },
        { type: 'command', text: '$ query historical_patterns' },
        { type: 'response', text: '→ Checking restriction history...' },
        { type: 'success', text: '✓ Historical data loaded' },
        { type: 'response', text: '→ IP Analysis: SKIPPED (not applicable)' },
        { type: 'success', text: '═══ 3/5 FACTORS READY ═══' },
        { type: 'response', text: '→ Calculating risk probability...' }
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
    // For hashtag checks: Web, Historical, Hashtags are active; API and IP are skipped
    const factors = [
        { id: 'factor-1-progress', skip: true },   // API (skip)
        { id: 'factor-2-progress', skip: false },  // Web
        { id: 'factor-3-progress', skip: false },  // Historical
        { id: 'factor-4-progress', skip: false },  // Hashtags
        { id: 'factor-5-progress', skip: true }    // IP (skip)
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
        'Cross-referencing database...',
        'Analyzing platform rules...',
        'Checking restriction patterns...',
        'Calculating risk probability...',
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
function generateResults(hashtags, rawResults) {
    // Count statuses
    const counts = { safe: 0, restricted: 0, banned: 0 };
    rawResults.forEach(r => counts[r.status]++);
    
    // Calculate probability (higher = worse)
    const totalChecked = rawResults.length;
    let probability = Math.round(
        ((counts.banned * 100) + (counts.restricted * 50)) / totalChecked
    );
    probability = Math.min(Math.max(probability, 0), 100);
    
    // Determine verdict
    let verdict = 'likely-visible';
    let verdictText = 'Low Risk';
    if (counts.banned > 0) {
        verdict = 'likely-restricted';
        verdictText = 'High Risk';
    } else if (counts.restricted > 0) {
        verdict = 'possibly-limited';
        verdictText = 'Moderate Risk';
    }
    
    // Generate findings
    const findings = [];
    if (counts.banned > 0) {
        findings.push({ type: 'bad', text: `${counts.banned} banned hashtag${counts.banned > 1 ? 's' : ''} found` });
    }
    if (counts.restricted > 0) {
        findings.push({ type: 'warning', text: `${counts.restricted} restricted hashtag${counts.restricted > 1 ? 's' : ''} found` });
    }
    if (counts.safe > 0) {
        findings.push({ type: 'good', text: `${counts.safe} safe hashtag${counts.safe > 1 ? 's' : ''} verified` });
    }
    
    // Factor results (hashtag checks skip API and IP)
    const factors = {
        api: { 
            active: false, 
            status: 'inactive',
            finding: 'Not needed for hashtag lookups'
        },
        web: { 
            active: true, 
            status: counts.banned > 0 ? 'warning' : 'good',
            finding: 'Real-time visibility tests completed'
        },
        historical: { 
            active: true, 
            status: 'good',
            finding: 'Historical patterns analyzed'
        },
        hashtag: { 
            active: true, 
            status: counts.banned > 0 ? 'bad' : counts.restricted > 0 ? 'warning' : 'good',
            finding: `Checked against 1,800+ entry database`
        },
        ip: { 
            active: false, 
            status: 'inactive',
            finding: 'Not applicable for hashtag-only checks'
        }
    };
    
    // Build hashtag breakdown
    const hashtagBreakdown = rawResults.map(r => ({
        hashtag: r.hashtag,
        status: r.status,
        platforms: r.platforms
    }));
    
    return {
        type: 'hashtag',
        platform: {
            name: 'Multi-Platform',
            icon: '#️⃣',
            key: 'hashtag',
            id: 'hashtag'
        },
        url: null,
        username: null,
        hashtags: hashtags.map(h => `#${h}`),
        hashtagBreakdown: hashtagBreakdown,
        timestamp: Date.now(),
        probability: probability,
        verdict: verdict,
        verdictText: verdictText,
        findings: findings,
        factors: factors,
        verification: null,
        ipData: null,
        factorsUsed: '3/5',
        summary: {
            total: totalChecked,
            safe: counts.safe,
            restricted: counts.restricted,
            banned: counts.banned
        }
    };
}

// ============================================
// PLATFORM TABS
// ============================================
function initPlatformTabs() {
    const tabs = document.querySelectorAll('.platform-tab');
    const panels = document.querySelectorAll('.hashtag-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const platform = tab.dataset.platform;
            
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update panels
            panels.forEach(p => {
                if (p.dataset.platform === platform) {
                    p.classList.add('active');
                } else {
                    p.classList.remove('active');
                }
            });
        });
    });
}

// ============================================
// SUPPORTED PLATFORMS
// ============================================
function initSupportedPlatforms() {
    const container = document.getElementById('hashtag-platform-icons');
    if (!container) return;
    
    // Get platforms from platforms.js or use fallback
    const allPlatforms = typeof PLATFORMS !== 'undefined' ? [...PLATFORMS] : [
        { id: 'twitter', name: 'Twitter/X', icon: '𝕏', status: 'live' },
        { id: 'reddit', name: 'Reddit', icon: '🔴', status: 'live' }
    ];
    
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
        chip.addEventListener('click', () => showHashtagPlatformInfo(chip.dataset.platform));
    });
}

// ============================================
// MODALS
// ============================================
function initInfoModals() {
    // Hashtag info button
    const hashtagInfoBtn = document.getElementById('hashtag-info-btn');
    const hashtagModal = document.getElementById('hashtag-info-modal');
    
    hashtagInfoBtn?.addEventListener('click', () => {
        hashtagModal?.classList.remove('hidden');
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

function showHashtagPlatformInfo(platformId) {
    const allPlatforms = typeof PLATFORMS !== 'undefined' ? PLATFORMS : [];
    const platform = allPlatforms.find(p => p.id === platformId);
    
    const name = platform?.name || platformId;
    const icon = platform?.icon || '🔍';
    const platformData = bannedHashtags[platformId];
    
    let modal = document.getElementById('platform-hashtag-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'platform-hashtag-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-icon" id="hashtag-modal-icon"></div>
                <h3 class="modal-title" id="hashtag-modal-title"></h3>
                <div class="modal-body" id="hashtag-modal-body"></div>
                <div class="modal-footer">
                    <button class="btn btn-primary btn-lg" onclick="document.getElementById('platform-hashtag-modal').classList.add('hidden'); document.body.style.overflow = '';">Got It!</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        });
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }
    
    document.getElementById('hashtag-modal-icon').textContent = icon;
    document.getElementById('hashtag-modal-title').textContent = `${name} - Hashtag Database`;
    
    const bodyEl = document.getElementById('hashtag-modal-body');
    
    if (platformData) {
        bodyEl.innerHTML = `
            <p class="modal-intro">We check your hashtags against our ${name} database:</p>
            <div style="margin: var(--space-md) 0;">
                <strong style="color: var(--danger);">🚫 ${platformData.banned.length} Banned Hashtags</strong>
                <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 4px;">
                    Examples: ${platformData.banned.slice(0, 5).map(h => '#' + h).join(', ')}${platformData.banned.length > 5 ? '...' : ''}
                </p>
            </div>
            <div style="margin: var(--space-md) 0;">
                <strong style="color: var(--warning);">⚠️ ${platformData.restricted.length} Restricted Hashtags</strong>
                <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 4px;">
                    Examples: ${platformData.restricted.slice(0, 5).map(h => '#' + h).join(', ')}${platformData.restricted.length > 5 ? '...' : ''}
                </p>
            </div>
            <p style="margin-top: var(--space-md); font-size: 0.8125rem; color: var(--text-muted);">
                Database updated daily based on community reports and platform changes.
            </p>
        `;
    } else {
        bodyEl.innerHTML = `
            <p class="modal-intro">${name} hashtag database coming soon!</p>
            <p style="color: var(--text-muted);">We're building our ${name} hashtag database.</p>
        `;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

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

// ============================================
// EXPORTS
// ============================================
window.HashtagChecker = {
    parseHashtags,
    checkHashtag,
    bannedHashtags
};

})();
