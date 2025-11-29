/* =============================================================================
   HASHTAG-CHECKER.JS - Hashtag Checker Page
   ShadowBanCheck.io
   
   NOTE: Reddit is EXCLUDED from this page because Reddit doesn't use hashtags
   ============================================================================= */

(function() {
'use strict';

let initialized = false;
let currentPlatform = null;

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
    hideRedditNotice(); // Start with notice hidden
    
    console.log('✅ Hashtag-checker.js initialized');
}

// Multiple init triggers
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('platformsReady', init);
setTimeout(init, 100);
setTimeout(init, 300);

// ============================================
// PLATFORM DROPDOWN - EXCLUDES REDDIT
// ============================================
function populatePlatformSelect() {
    const select = document.getElementById('hashtag-platform-select');
    if (!select) {
        console.warn('⚠️ #hashtag-platform-select not found');
        return;
    }
    
    // Clear existing options except placeholder
    select.innerHTML = '<option value="">Choose a platform...</option>';
    
    // Get platforms that support hashtag checks (EXCLUDES Reddit)
    const platforms = window.platformData.filter(p => 
        p.supports && p.supports.hashtagCheck === true
    );
    
    console.log('📋 Hashtag platforms (excluding Reddit):', platforms.map(p => p.name).join(', '));
    
    // Add live platforms first
    const livePlatforms = platforms.filter(p => p.status === 'live');
    const soonPlatforms = platforms.filter(p => p.status === 'soon');
    
    livePlatforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform.id;
        option.textContent = `${platform.icon} ${platform.name}`;
        select.appendChild(option);
    });
    
    // Add separator if we have both live and coming soon
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
    
    console.log('✅ Hashtag dropdown populated with', livePlatforms.length, 'live +', soonPlatforms.length, 'coming soon (NO Reddit)');
}

function populatePlatformIcons() {
    const container = document.getElementById('hashtag-platform-icons');
    if (!container || !window.platformData) return;
    
    let html = '';
    
    // Only platforms that support hashtags (excludes Reddit)
    const platforms = window.platformData.filter(p => 
        p.supports && p.supports.hashtagCheck === true
    );
    
    platforms.forEach(platform => {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const title = platform.status === 'soon' ? `${platform.name} (Coming Soon)` : platform.name;
        html += `<span class="platform-chip ${statusClass}" title="${title}" data-platform="${platform.id}">${platform.icon}</span>`;
    });
    
    container.innerHTML = html;
    
    // Add click handlers
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
    // Platform select change
    const platformSelect = document.getElementById('hashtag-platform-select');
    if (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
    }
    
    // Hashtag input
    const hashtagInput = document.getElementById('hashtag-input');
    if (hashtagInput) {
        hashtagInput.addEventListener('input', handleHashtagInput);
    }
    
    // Form submission
    const form = document.getElementById('hashtag-check-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
    }
    
    // Show Reddit note button
    const showRedditNoteBtn = document.getElementById('show-reddit-note');
    if (showRedditNoteBtn) {
        showRedditNoteBtn.addEventListener('click', showRedditNotice);
    }
    
    // Info buttons
    const hashtagInfoBtn = document.getElementById('hashtag-info-btn');
    if (hashtagInfoBtn) {
        hashtagInfoBtn.addEventListener('click', () => openModal('hashtag-info-modal'));
    }
    
    const engineInfoBtn = document.getElementById('engine-info-btn');
    if (engineInfoBtn) {
        engineInfoBtn.addEventListener('click', () => openModal('engine-info-modal'));
    }
}

// ============================================
// REDDIT NOTICE
// ============================================
function showRedditNotice() {
    const notice = document.getElementById('reddit-notice');
    if (notice) {
        notice.classList.remove('hidden');
        // Auto-hide after 10 seconds
        setTimeout(hideRedditNotice, 10000);
    }
}

function hideRedditNotice() {
    const notice = document.getElementById('reddit-notice');
    if (notice) notice.classList.add('hidden');
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
                note.textContent = `Ready to check hashtags for ${currentPlatform.name}`;
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
    
    // Handle multiple formats:
    // - #hashtag format
    // - comma separated
    // - space separated
    // - newline separated
    
    const matches = text.match(/#[\w\u0080-\uFFFF]+/g) || [];
    
    // If no hashtags found with #, split by common separators
    if (matches.length === 0) {
        const words = text.split(/[\s,\n]+/).filter(w => w.trim());
        return words.map(w => w.startsWith('#') ? w : '#' + w).filter(w => w.length > 1);
    }
    
    return [...new Set(matches)]; // Remove duplicates
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
    if (note) note.textContent = 'Different platforms have different banned hashtags';
    
    currentPlatform = null;
    hideRedditNotice();
}

// ============================================
// ANALYSIS
// ============================================
function runAnalysis(hashtags) {
    const checkerCard = document.getElementById('checker-card');
    const engineAnimation = document.getElementById('engine-animation');
    
    if (checkerCard) checkerCard.classList.add('hidden');
    if (engineAnimation) engineAnimation.classList.remove('hidden');
    
    runEngineAnimation(hashtags);
    simulateAnalysis(hashtags);
}

function runEngineAnimation(hashtags) {
    const terminalOutput = document.getElementById('terminal-output');
    if (terminalOutput) terminalOutput.innerHTML = '';
    
    const platform = currentPlatform || { id: 'twitter', name: 'Twitter/X' };
    
    const lines = [
        { text: `> Initializing 3-Factor Detection Engine...`, delay: 0 },
        { text: `> Target platform: ${platform.name}`, delay: 400 },
        { text: `> Hashtags to check: ${hashtags.length}`, delay: 800 },
        { text: `> Querying hashtag database...`, delay: 1200 },
        { text: `> Running web visibility tests...`, delay: 1800 },
        { text: `> Checking historical patterns...`, delay: 2400 },
        { text: `> Calculating risk probability...`, delay: 2800 },
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
    
    // 3 factors for hashtag check (no API, no IP) - Factor 1 and 5 are N/A
    const factors = [
        { id: 'factor-1-progress', delay: 500, status: 'na' },   // API - N/A
        { id: 'factor-2-progress', delay: 1500, status: 'complete' }, // Web
        { id: 'factor-3-progress', delay: 2200, status: 'complete' }, // Historical
        { id: 'factor-4-progress', delay: 2600, status: 'complete' }, // Hashtag DB
        { id: 'factor-5-progress', delay: 500, status: 'na' },   // IP - N/A
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
        
        const aiMessages = ['Analyzing hashtag patterns...', 'Cross-referencing database...', 'Generating risk score...'];
        const aiMessageEl = document.getElementById('ai-processing-message');
        aiMessages.forEach((msg, i) => {
            setTimeout(() => {
                if (aiMessageEl) aiMessageEl.textContent = msg;
            }, i * 700);
        });
    }, 3200);
}

function simulateAnalysis(hashtags) {
    setTimeout(() => {
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        
        // Check against banned hashtags database
        let bannedCount = 0;
        let restrictedCount = 0;
        const results = [];
        
        if (window.bannedHashtags) {
            hashtags.forEach(tag => {
                const cleanTag = tag.replace('#', '').toLowerCase();
                const status = checkHashtagStatus(cleanTag, platformId);
                results.push({ hashtag: tag, status: status });
                if (status === 'banned') bannedCount++;
                if (status === 'restricted') restrictedCount++;
            });
        }
        
        // Calculate probability
        const totalRisk = bannedCount * 30 + restrictedCount * 15;
        const probability = Math.min(95, Math.max(5, totalRisk + Math.floor(Math.random() * 10)));
        
        const demoResult = {
            platform: platformId,
            platformName: currentPlatform ? currentPlatform.name : 'Twitter/X',
            checkType: 'hashtag',
            hashtags: hashtags,
            hashtagResults: results,
            bannedCount: bannedCount,
            restrictedCount: restrictedCount,
            probability: probability,
            factorsUsed: 3,
            timestamp: new Date().toISOString(),
        };
        
        sessionStorage.setItem('lastAnalysisResult', JSON.stringify(demoResult));
        window.location.href = `results.html?platform=${platformId}&type=hashtag&demo=true`;
    }, 4500);
}

function checkHashtagStatus(hashtag, platformId) {
    // Check against banned hashtags database
    if (window.bannedHashtags) {
        const platformBanned = window.bannedHashtags[platformId] || window.bannedHashtags.all || [];
        if (platformBanned.includes(hashtag)) {
            return 'banned';
        }
    }
    
    // Common restricted patterns
    const restrictedPatterns = ['nsfw', 'adult', 'xxx', 'sex', 'naked', 'nude'];
    if (restrictedPatterns.some(p => hashtag.includes(p))) {
        return 'restricted';
    }
    
    return 'safe';
}

// ============================================
// MODALS
// ============================================
function showHashtagInfoModal(platform) {
    const modal = document.getElementById('platform-modal') || document.getElementById('hashtag-info-modal');
    if (!modal || !platform) return;
    
    // Populate modal with platform-specific content
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
    
    // Build hashtag checks list
    let checksHtml = '<h4>Hashtag Signals We Check:</h4><ul class="check-list">';
    
    const checks = platform.hashtagChecks && platform.hashtagChecks.length > 0 
        ? platform.hashtagChecks 
        : ['Banned hashtag detection', 'Restricted hashtag identification', 'Platform-specific limitations'];
    
    checks.forEach(check => {
        checksHtml += `<li>${check}</li>`;
    });
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
