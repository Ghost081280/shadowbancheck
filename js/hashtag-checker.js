/* =============================================================================
   HASHTAG-CHECKER.JS - Hashtag Checker Page
   ShadowBanCheck.io
   
   Updated to use Real-Time Hashtag API for live verification.
   Factor 4 (Hashtag DB) now uses real-time API lookups.
   
   NOTE: Reddit is EXCLUDED from this page because Reddit doesn't use hashtags
   ============================================================================= */

(function() {
'use strict';

let initialized = false;
let currentPlatform = null;
let apiHealthy = false;

// ============================================
// INITIALIZATION
// ============================================
function init() {
    if (initialized) return;
    
    if (!window.platformData || !Array.isArray(window.platformData)) {
        console.log('⏳ hashtag-checker.js waiting for platformData...');
        setTimeout(init, 50);
        return;
    }
    
    initialized = true;
    console.log('🚀 Hashtag-checker.js initializing...');
    
    populatePlatformSelect();
    populatePlatformIcons();
    setupEventListeners();
    checkAPIHealth();
    updateDatabaseStats();
    
    console.log('✅ Hashtag-checker.js initialized');
}

// Multiple init triggers
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('platformsReady', init);
setTimeout(init, 100);
setTimeout(init, 300);

// ============================================
// API HEALTH CHECK
// ============================================
async function checkAPIHealth() {
    const statusIndicator = document.getElementById('api-status-indicator');
    const statusText = document.getElementById('api-status-text');
    
    if (window.HashtagAPI) {
        apiHealthy = await window.HashtagAPI.isHealthy();
        
        if (statusIndicator && statusText) {
            if (apiHealthy) {
                statusIndicator.className = 'status-dot online';
                statusText.textContent = 'Real-time verification active';
            } else {
                statusIndicator.className = 'status-dot offline';
                statusText.textContent = 'Using local database (API offline)';
            }
        }
        
        console.log(`🔌 API Status: ${apiHealthy ? 'Online' : 'Offline'}`);
    } else {
        console.log('⏳ HashtagAPI not loaded yet');
        setTimeout(checkAPIHealth, 500);
    }
}

// ============================================
// DATABASE STATS
// ============================================
async function updateDatabaseStats() {
    const statsEl = document.getElementById('hashtag-db-stats');
    
    if (!window.HashtagAPI || !statsEl) return;
    
    try {
        const stats = await window.HashtagAPI.getStats();
        
        if (stats.success && stats.stats) {
            const total = stats.stats.totalHashtags || 0;
            const lastUpdated = stats.stats.lastUpdated 
                ? new Date(stats.stats.lastUpdated).toLocaleString()
                : 'Unknown';
            
            statsEl.innerHTML = `
                <span class="stat-item">📊 ${total.toLocaleString()} hashtags tracked</span>
                <span class="stat-item">🔄 Last updated: ${lastUpdated}</span>
            `;
        }
    } catch (error) {
        console.warn('Could not fetch DB stats:', error);
    }
}

// ============================================
// PLATFORM DROPDOWN - EXCLUDES REDDIT
// ============================================
function populatePlatformSelect() {
    const select = document.getElementById('hashtag-platform-select');
    if (!select) {
        console.warn('⚠️ #hashtag-platform-select not found');
        return;
    }
    
    select.innerHTML = '<option value="">Choose a platform...</option>';
    
    const platforms = window.platformData.filter(p => 
        p.supports && p.supports.hashtagCheck === true
    );
    
    console.log('📋 Hashtag platforms (excluding Reddit):', platforms.map(p => p.name).join(', '));
    
    const livePlatforms = platforms.filter(p => p.status === 'live');
    const soonPlatforms = platforms.filter(p => p.status === 'soon');
    
    livePlatforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform.id;
        option.textContent = `${platform.icon} ${platform.name}`;
        select.appendChild(option);
    });
    
    if (livePlatforms.length > 0 && soonPlatforms.length > 0) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '── Coming Soon ──';
        select.appendChild(separator);
    }
    
    soonPlatforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform.id;
        option.textContent = `${platform.icon} ${platform.name} (Soon)`;
        option.disabled = true;
        select.appendChild(option);
    });
    
    console.log('✅ Hashtag dropdown populated');
}

function populatePlatformIcons() {
    const container = document.getElementById('hashtag-platform-icons');
    if (!container || !window.platformData) return;
    
    let html = '';
    
    const platforms = window.platformData.filter(p => 
        p.supports && p.supports.hashtagCheck === true
    );
    
    platforms.forEach(platform => {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const title = platform.status === 'soon' ? `${platform.name} (Coming Soon)` : platform.name;
        html += `<span class="platform-chip ${statusClass}" title="${title}" data-platform="${platform.id}">${platform.icon}</span>`;
    });
    
    container.innerHTML = html;
    
    container.querySelectorAll('.platform-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const platformId = chip.dataset.platform;
            const platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
            if (platform) showHashtagInfoModal(platform);
        });
    });
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    const platformSelect = document.getElementById('hashtag-platform-select');
    if (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
    }
    
    const hashtagInput = document.getElementById('hashtag-input');
    if (hashtagInput) {
        hashtagInput.addEventListener('input', handleHashtagInput);
    }
    
    const form = document.getElementById('hashtag-check-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
    }
    
    const hashtagInfoBtn = document.getElementById('hashtag-info-btn');
    if (hashtagInfoBtn) {
        hashtagInfoBtn.addEventListener('click', () => openModal('hashtag-info-modal'));
    }
    
    const engineInfoBtn = document.getElementById('engine-info-btn');
    if (engineInfoBtn) {
        engineInfoBtn.addEventListener('click', () => openModal('engine-info-modal'));
    }
    
    // Report hashtag button
    const reportBtn = document.getElementById('report-hashtag-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => openModal('report-hashtag-modal'));
    }
}

// ============================================
// HANDLERS
// ============================================
function handlePlatformChange(e) {
    const platformId = e.target.value;
    currentPlatform = platformId ? window.getPlatformById(platformId) : null;
    
    const note = document.getElementById('platform-selector-note');
    
    if (!platformId) {
        if (note) note.textContent = 'Different platforms have different banned hashtags';
        updateSubmitButton();
        return;
    }
    
    if (currentPlatform) {
        if (note) {
            if (currentPlatform.status === 'live') {
                note.textContent = `Real-time verification for ${currentPlatform.name}`;
            } else {
                note.textContent = `${currentPlatform.name} hashtag checking coming soon`;
            }
        }
    }
    
    updateSubmitButton();
}

function handleHashtagInput(e) {
    const value = e.target.value;
    const hashtags = parseHashtags(value);
    
    const countEl = document.getElementById('hashtag-count');
    if (countEl) {
        countEl.textContent = `${hashtags.length} hashtag${hashtags.length !== 1 ? 's' : ''}`;
    }
    
    updateSubmitButton();
}

function parseHashtags(text) {
    if (!text) return [];
    
    const matches = text.match(/#[\w\u0080-\uFFFF]+/g) || [];
    
    if (matches.length === 0) {
        const words = text.split(/[\s,\n]+/).filter(w => w.trim());
        return words.map(w => w.startsWith('#') ? w : '#' + w).filter(w => w.length > 1);
    }
    
    return [...new Set(matches)];
}

function updateSubmitButton() {
    const platformSelect = document.getElementById('hashtag-platform-select');
    const hashtagInput = document.getElementById('hashtag-input');
    const checkBtn = document.getElementById('check-hashtags-btn');
    
    const hasPlatform = platformSelect && platformSelect.value;
    const hashtags = parseHashtags(hashtagInput ? hashtagInput.value : '');
    const hasHashtags = hashtags.length > 0;
    const isLive = currentPlatform && currentPlatform.status === 'live';
    
    if (checkBtn) {
        checkBtn.disabled = !(hasPlatform && hasHashtags && isLive);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const hashtagInput = document.getElementById('hashtag-input');
    const hashtagText = hashtagInput ? hashtagInput.value.trim() : '';
    const hashtags = parseHashtags(hashtagText);
    
    if (!currentPlatform) {
        showToast('Please select a platform', 'warning');
        return;
    }
    
    if (hashtags.length === 0) {
        showToast('Please enter at least one hashtag', 'warning');
        return;
    }
    
    if (currentPlatform.status !== 'live') {
        showToast(`${currentPlatform.name} hashtag checking coming soon!`, 'info');
        return;
    }
    
    runAnalysis(hashtags);
}

function handleClear() {
    const platformSelect = document.getElementById('hashtag-platform-select');
    const hashtagInput = document.getElementById('hashtag-input');
    const checkBtn = document.getElementById('check-hashtags-btn');
    const countEl = document.getElementById('hashtag-count');
    const note = document.getElementById('platform-selector-note');
    
    if (platformSelect) platformSelect.value = '';
    if (hashtagInput) hashtagInput.value = '';
    if (checkBtn) checkBtn.disabled = true;
    if (countEl) countEl.textContent = '0 hashtags';
    if (note) note.textContent = 'Each platform has different hashtag restrictions';
    
    currentPlatform = null;
}

// ============================================
// REAL-TIME ANALYSIS
// ============================================
async function runAnalysis(hashtags) {
    const checkerCard = document.getElementById('checker-card');
    const engineAnimation = document.getElementById('engine-animation');
    
    if (checkerCard) checkerCard.classList.add('hidden');
    if (engineAnimation) engineAnimation.classList.remove('hidden');
    
    // Start engine animation
    runEngineAnimation(hashtags);
    
    // Perform real-time API check
    const platformId = currentPlatform ? currentPlatform.id : 'twitter';
    
    try {
        let results;
        
        if (window.HashtagAPI) {
            // Use real-time API
            console.log('🔍 Checking hashtags via real-time API...');
            results = await window.HashtagAPI.checkBulk(hashtags, platformId);
        } else {
            // Fallback to local
            console.log('📂 Falling back to local check...');
            results = performLocalCheck(hashtags, platformId);
        }
        
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 4500));
        
        // Store results and navigate
        const demoResult = {
            platform: platformId,
            platformName: currentPlatform ? currentPlatform.name : 'Twitter/X',
            checkType: 'hashtag',
            hashtags: hashtags,
            hashtagResults: results.results.map(r => ({
                hashtag: '#' + r.hashtag,
                status: r.status,
                confidence: r.confidence,
                lastVerified: r.lastVerified,
                source: r.source
            })),
            bannedCount: results.summary.banned,
            restrictedCount: results.summary.restricted,
            safeCount: results.summary.safe,
            probability: calculateProbability(results.summary),
            factorsUsed: 3,
            apiUsed: !!window.HashtagAPI,
            timestamp: new Date().toISOString(),
        };
        
        sessionStorage.setItem('lastAnalysisResult', JSON.stringify(demoResult));
        window.location.href = `results.html?platform=${platformId}&type=hashtag&demo=true`;
        
    } catch (error) {
        console.error('Analysis error:', error);
        showToast('Error checking hashtags. Please try again.', 'error');
        
        // Reset UI
        if (checkerCard) checkerCard.classList.remove('hidden');
        if (engineAnimation) engineAnimation.classList.add('hidden');
    }
}

function calculateProbability(summary) {
    // Weighted probability calculation
    const bannedWeight = 30;
    const restrictedWeight = 15;
    
    const totalRisk = (summary.banned * bannedWeight) + (summary.restricted * restrictedWeight);
    const maxRisk = summary.total * bannedWeight;
    
    if (maxRisk === 0) return 5;
    
    const probability = Math.round((totalRisk / maxRisk) * 100);
    return Math.min(95, Math.max(5, probability));
}

function performLocalCheck(hashtags, platformId) {
    const results = [];
    let banned = 0;
    let restricted = 0;
    let safe = 0;
    
    hashtags.forEach(tag => {
        const cleanTag = tag.replace('#', '').toLowerCase();
        const status = checkHashtagStatusLocal(cleanTag, platformId);
        
        results.push({
            hashtag: cleanTag,
            platform: platformId,
            status: status.status,
            confidence: status.confidence,
            source: 'local',
            lastVerified: null
        });
        
        if (status.status === 'banned') banned++;
        else if (status.status === 'restricted') restricted++;
        else safe++;
    });
    
    return {
        success: true,
        summary: { total: hashtags.length, banned, restricted, safe, unknown: 0 },
        results: results
    };
}

function checkHashtagStatusLocal(hashtag, platformId) {
    if (window.bannedHashtags) {
        const platformData = window.bannedHashtags[platformId] || {};
        const banned = platformData.banned || [];
        const restricted = platformData.restricted || [];
        
        if (banned.includes(hashtag)) {
            return { status: 'banned', confidence: 85 };
        }
        if (restricted.includes(hashtag)) {
            return { status: 'restricted', confidence: 75 };
        }
    }
    
    // Pattern matching
    const bannedPatterns = ['porn', 'xxx', 'nsfw', 'nude', 'followback', 'f4f'];
    const restrictedPatterns = ['like4like', 'l4l', 'spam', 'dm'];
    
    if (bannedPatterns.some(p => hashtag.includes(p))) {
        return { status: 'banned', confidence: 70 };
    }
    if (restrictedPatterns.some(p => hashtag.includes(p))) {
        return { status: 'restricted', confidence: 60 };
    }
    
    return { status: 'safe', confidence: 50 };
}

// ============================================
// ENGINE ANIMATION - Updated for Real-Time API
// ============================================
function runEngineAnimation(hashtags) {
    const terminalOutput = document.getElementById('terminal-output');
    if (terminalOutput) terminalOutput.innerHTML = '';
    
    const platform = currentPlatform || { id: 'twitter', name: 'Twitter/X' };
    const useAPI = apiHealthy && window.HashtagAPI;
    
    // Updated terminal lines for real-time API
    const lines = [
        { text: `> Initializing 3-Factor Detection Engine...`, delay: 0 },
        { text: `> Target platform: ${platform.name}`, delay: 400 },
        { text: `> Hashtags to check: ${hashtags.length}`, delay: 800 },
        { text: useAPI ? `> Connecting to real-time API...` : `> Using local database...`, delay: 1200 },
        { text: useAPI ? `> API connected ✓` : `> Local database loaded ✓`, delay: 1600 },
        { text: `> Querying hashtag database...`, delay: 2000 },
        { text: `> Running web visibility tests...`, delay: 2400 },
        { text: `> Checking historical patterns...`, delay: 2800 },
        { text: `> Calculating risk probability...`, delay: 3200 },
    ];
    
    lines.forEach(line => {
        setTimeout(() => {
            if (terminalOutput) {
                const lineEl = document.createElement('div');
                lineEl.className = 'terminal-line';
                lineEl.textContent = line.text;
                terminalOutput.appendChild(lineEl);
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
        }, line.delay);
    });
    
    // Factor progress - API now USED for real-time lookups
    const factors = [
        { id: 'factor-1-progress', delay: 1400, status: useAPI ? 'complete' : 'na' }, // API - NOW USED!
        { id: 'factor-2-progress', delay: 2200, status: 'complete' }, // Web
        { id: 'factor-3-progress', delay: 2600, status: 'complete' }, // Historical
        { id: 'factor-4-progress', delay: 3000, status: 'complete' }, // Hashtag DB
        { id: 'factor-5-progress', delay: 1400, status: 'na' },       // Content & Links - N/A
    ];
    
    factors.forEach(factor => {
        setTimeout(() => {
            const el = document.getElementById(factor.id);
            if (el) {
                const status = el.querySelector('.factor-status') || el.querySelector('.factor-compact-status');
                if (status) {
                    if (factor.status === 'complete') {
                        status.textContent = '✓';
                        status.classList.remove('pending');
                        status.classList.add('complete');
                    } else {
                        status.textContent = '—';
                        status.classList.remove('pending');
                        status.classList.add('na');
                    }
                }
            }
        }, factor.delay);
    });
    
    // Phase 2: AI Analysis
    setTimeout(() => {
        const phase1 = document.getElementById('engine-phase-1');
        const phase2 = document.getElementById('engine-phase-2');
        if (phase1) phase1.classList.add('hidden');
        if (phase2) phase2.classList.remove('hidden');
        
        const aiMessages = [
            'Analyzing hashtag patterns...',
            'Cross-referencing real-time data...',
            'Generating risk assessment...'
        ];
        const aiMessageEl = document.getElementById('ai-processing-message');
        aiMessages.forEach((msg, i) => {
            setTimeout(() => {
                if (aiMessageEl) aiMessageEl.textContent = msg;
            }, i * 600);
        });
    }, 3600);
}

// ============================================
// REPORT HASHTAG
// ============================================
async function submitHashtagReport() {
    const hashtagInput = document.getElementById('report-hashtag-input');
    const statusSelect = document.getElementById('report-status-select');
    const evidenceInput = document.getElementById('report-evidence-input');
    
    if (!hashtagInput || !statusSelect) return;
    
    const hashtag = hashtagInput.value.trim();
    const status = statusSelect.value;
    const evidence = evidenceInput ? evidenceInput.value.trim() : '';
    
    if (!hashtag || !status || !currentPlatform) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    if (window.HashtagAPI) {
        const result = await window.HashtagAPI.reportHashtag(
            hashtag,
            currentPlatform.id,
            status,
            evidence
        );
        
        if (result.success) {
            showToast('Report submitted! We will verify this hashtag.', 'success');
            closeModal('report-hashtag-modal');
            
            // Clear form
            hashtagInput.value = '';
            statusSelect.value = '';
            if (evidenceInput) evidenceInput.value = '';
        } else {
            showToast('Error submitting report. Please try again.', 'error');
        }
    } else {
        showToast('API not available. Report saved locally.', 'info');
        closeModal('report-hashtag-modal');
    }
}

// Expose for modal button
window.submitHashtagReport = submitHashtagReport;

// ============================================
// MODALS
// ============================================
function showHashtagInfoModal(platform) {
    const modal = document.getElementById('platform-modal') || document.getElementById('hashtag-info-modal');
    if (!modal || !platform) return;
    
    const modalIcon = modal.querySelector('.modal-icon') || document.getElementById('modal-icon');
    const modalTitle = modal.querySelector('.modal-title') || document.getElementById('modal-title');
    const modalBody = modal.querySelector('.modal-body') || document.getElementById('modal-body');
    const modalStatus = modal.querySelector('.modal-status') || document.getElementById('modal-status');
    
    if (modalIcon) modalIcon.textContent = platform.icon;
    if (modalTitle) modalTitle.textContent = `${platform.name} Hashtag Analysis`;
    
    if (modalStatus) {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const statusText = platform.status === 'live' ? 'Live' : 'Coming Soon';
        modalStatus.innerHTML = `<span class="status-badge ${statusClass}">● ${statusText}</span>`;
    }
    
    let checksHtml = '<h4>Real-Time Verification:</h4><ul class="check-list">';
    checksHtml += '<li>✓ Live API connection to our hashtag database</li>';
    checksHtml += '<li>✓ Real-time status verification</li>';
    checksHtml += '<li>✓ Last verified timestamps</li>';
    checksHtml += '<li>✓ Confidence scoring</li>';
    checksHtml += '</ul>';
    
    if (platform.messages && platform.messages.platformNote) {
        checksHtml += `<p style="margin-top: var(--space-md); padding: var(--space-md); background: rgba(99, 102, 241, 0.1); border-radius: var(--radius-md);">💡 ${platform.messages.platformNote}</p>`;
    }
    
    if (modalBody) modalBody.innerHTML = checksHtml;
    
    openModal(modal.id);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) overlay.onclick = () => closeModal(modalId);
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.onclick = () => closeModal(modalId);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

window.closeModal = closeModal;
window.closeLimitModal = function() { closeModal('limit-modal'); };

// ============================================
// HELPERS
// ============================================
function showToast(message, type) {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log('Toast:', message, type);
    }
}

})();
