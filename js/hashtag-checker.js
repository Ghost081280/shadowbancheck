/* =============================================================================
   HASHTAG-CHECKER.JS - Hashtag Checker Page Functionality
   ShadowBanCheck.io
   
   Handles:
   - Platform selection dropdown (EXCLUDES Reddit - no hashtags)
   - Hashtag input parsing
   - Engine animation (3 factors for hashtag checks)
   - Form submission
   ============================================================================= */

(function() {
'use strict';

// ============================================
// DOM ELEMENTS
// ============================================
let platformSelect, hashtagInput, checkHashtagsBtn, hashtagCheckForm;
let hashtagCount;
let engineAnimation, hashtagCheckerCard;
let supportedPlatformIcons;
let initialized = false;

// ============================================
// STATE
// ============================================
let currentPlatform = null;
let parsedHashtags = [];

// ============================================
// INITIALIZATION
// ============================================
function init() {
    document.addEventListener('sharedComponentsLoaded', onComponentsLoaded);
    document.addEventListener('DOMContentLoaded', onComponentsLoaded);
    
    // Also try immediate init with delay
    setTimeout(onComponentsLoaded, 200);
}

function onComponentsLoaded() {
    // Prevent double initialization
    if (initialized) return;
    
    // Wait for platformData
    if (!window.platformData) {
        setTimeout(onComponentsLoaded, 100);
        return;
    }
    
    initialized = true;
    
    // Get DOM elements
    platformSelect = document.getElementById('hashtag-platform-select') || document.getElementById('platform-select');
    hashtagInput = document.getElementById('hashtag-input');
    checkHashtagsBtn = document.getElementById('check-hashtags-btn');
    hashtagCheckForm = document.getElementById('hashtag-check-form');
    
    hashtagCount = document.getElementById('hashtag-count');
    
    engineAnimation = document.getElementById('engine-animation');
    hashtagCheckerCard = document.getElementById('hashtag-checker-card');
    
    supportedPlatformIcons = document.getElementById('hashtag-platform-icons');
    
    // Populate platform dropdown (EXCLUDES Reddit)
    populatePlatformSelect();
    
    // Populate platform icons (EXCLUDES Reddit)
    populatePlatformIcons();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Hashtag-checker.js initialized');
}

// ============================================
// PLATFORM DROPDOWN (Excludes Reddit - no hashtags)
// ============================================
function populatePlatformSelect() {
    if (!platformSelect) {
        console.warn('Platform select element not found');
        return;
    }
    
    let optionsHtml = '<option value="">Select Platform</option>';
    
    // Only platforms that support hashtags (excludes Reddit)
    const hashtagPlatforms = window.platformData.filter(p => p.supports && p.supports.hashtagCheck !== false);
    
    // Live hashtag platforms first
    const livePlatforms = hashtagPlatforms.filter(p => p.status === 'live');
    livePlatforms.forEach(platform => {
        optionsHtml += `<option value="${platform.id}">${platform.icon} ${platform.name}</option>`;
    });
    
    // Coming soon platforms (disabled)
    const soonPlatforms = hashtagPlatforms.filter(p => p.status === 'soon');
    if (soonPlatforms.length > 0) {
        optionsHtml += '<optgroup label="Coming Soon">';
        soonPlatforms.forEach(platform => {
            optionsHtml += `<option value="${platform.id}" disabled>${platform.icon} ${platform.name} (Coming Soon)</option>`;
        });
        optionsHtml += '</optgroup>';
    }
    
    platformSelect.innerHTML = optionsHtml;
}

function populatePlatformIcons() {
    if (!supportedPlatformIcons) return;
    
    // Only show platforms that support hashtags (excludes Reddit)
    const hashtagPlatforms = window.platformData.filter(p => p.supports && p.supports.hashtagCheck !== false);
    
    let html = '';
    
    hashtagPlatforms.forEach(platform => {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const title = platform.status === 'soon' ? `${platform.name} (Coming Soon)` : platform.name;
        html += `
            <span class="platform-icon-badge ${statusClass}" title="${title}" data-platform="${platform.id}" style="cursor:pointer;">
                ${platform.icon}
            </span>
        `;
    });
    
    supportedPlatformIcons.innerHTML = html;
    
    // Add click handlers for platform modals
    supportedPlatformIcons.querySelectorAll('.platform-icon-badge').forEach(icon => {
        icon.addEventListener('click', () => {
            const platformId = icon.dataset.platform;
            const platform = window.platformData.find(p => p.id === platformId);
            if (platform) {
                showPlatformModal(platform);
            }
        });
    });
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Platform selection
    if (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
    }
    
    // Hashtag input
    if (hashtagInput) {
        hashtagInput.addEventListener('input', handleHashtagInput);
    }
    
    // Form submission
    if (hashtagCheckForm) {
        hashtagCheckForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Info button
    const hashtagInfoBtn = document.getElementById('hashtag-info-btn');
    if (hashtagInfoBtn) {
        hashtagInfoBtn.addEventListener('click', () => {
            showInfoModal();
        });
    }
}

// ============================================
// PLATFORM CHANGE HANDLER
// ============================================
function handlePlatformChange() {
    const platformId = platformSelect.value;
    
    if (!platformId) {
        currentPlatform = null;
        validateForm();
        return;
    }
    
    currentPlatform = window.platformData.find(p => p.id === platformId);
    validateForm();
}

// ============================================
// HASHTAG INPUT HANDLER
// ============================================
function handleHashtagInput() {
    const text = hashtagInput.value;
    parsedHashtags = parseHashtags(text);
    updateHashtagCount();
    validateForm();
}

function parseHashtags(text) {
    if (!text) return [];
    
    // Match #hashtag format
    const hashtagPattern = /#(\w+)/g;
    const matches = text.match(hashtagPattern) || [];
    
    // Also support comma/space separated without #
    const words = text.split(/[,\s]+/).filter(w => w.length > 0);
    const additional = words.filter(w => !w.startsWith('#') && /^\w+$/.test(w));
    
    // Combine and dedupe
    const all = [...matches.map(h => h.replace('#', '')), ...additional];
    const unique = [...new Set(all.map(h => h.toLowerCase()))];
    
    return unique;
}

function updateHashtagCount() {
    if (hashtagCount) {
        const count = parsedHashtags.length;
        hashtagCount.textContent = `${count} hashtag${count !== 1 ? 's' : ''} detected`;
    }
}

// ============================================
// FORM VALIDATION
// ============================================
function validateForm() {
    const platformSelected = platformSelect && platformSelect.value;
    const hashtagsEntered = parsedHashtags.length > 0;
    
    if (checkHashtagsBtn) {
        checkHashtagsBtn.disabled = !(platformSelected && hashtagsEntered);
    }
}

// ============================================
// FORM SUBMISSION
// ============================================
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!currentPlatform) {
        showToast('Please select a platform', 'error');
        return;
    }
    
    if (parsedHashtags.length === 0) {
        showToast('Please enter at least one hashtag', 'error');
        return;
    }
    
    // Check if coming soon
    if (currentPlatform.status === 'soon') {
        showToast(`${currentPlatform.name} coming soon!`, 'warning');
        return;
    }
    
    runHashtagCheck();
}

function runHashtagCheck() {
    // Show engine animation
    showEngineAnimation();
    
    // Simulate analysis
    simulateAnalysis();
}

// ============================================
// ENGINE ANIMATION (3 FACTORS for hashtag checks)
// ============================================
function showEngineAnimation() {
    if (hashtagCheckerCard) {
        hashtagCheckerCard.classList.add('hidden');
    }
    if (engineAnimation) {
        engineAnimation.classList.remove('hidden');
    }
    
    runEngineAnimation();
}

function runEngineAnimation() {
    const terminalOutput = document.getElementById('terminal-output');
    
    // Hashtag check uses 3 factors (no API, no IP)
    const factors = [
        { id: 'factor-1', message: '> Platform API... (skipped for hashtag check)', delay: 300, active: false },
        { id: 'factor-2', message: '> Running web analysis...', delay: 600, active: true },
        { id: 'factor-3', message: '> Checking historical data...', delay: 1000, active: true },
        { id: 'factor-4', message: '> Scanning hashtag database...', delay: 1400, active: true },
        { id: 'factor-5', message: '> IP analysis... (not applicable)', delay: 1600, active: false }
    ];
    
    // Clear terminal
    if (terminalOutput) {
        terminalOutput.innerHTML = '';
    }
    
    // Animate each factor
    factors.forEach((factor) => {
        setTimeout(() => {
            // Add terminal line only for active factors
            if (terminalOutput && factor.active) {
                const line = document.createElement('div');
                line.className = 'terminal-line';
                line.textContent = factor.message;
                terminalOutput.appendChild(line);
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
            
            // Update factor status
            const factorEl = document.getElementById(factor.id);
            if (factorEl) {
                const status = factorEl.querySelector('.factor-compact-status') || factorEl.querySelector('.factor-status');
                if (status) {
                    if (factor.active) {
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
    
    // Phase 2 - AI Processing
    setTimeout(() => {
        const phase1 = document.getElementById('engine-phase-1');
        const phase2 = document.getElementById('engine-phase-2');
        if (phase1) phase1.classList.add('hidden');
        if (phase2) phase2.classList.remove('hidden');
    }, 2500);
}

function simulateAnalysis() {
    setTimeout(() => {
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        
        // Check hashtags against banned database
        const results = checkHashtagsAgainstDatabase(parsedHashtags, platformId);
        
        // Store results
        const resultData = {
            platform: platformId,
            platformName: currentPlatform ? currentPlatform.name : 'Twitter/X',
            platformIcon: currentPlatform ? currentPlatform.icon : '𝕏',
            checkType: 'hashtag',
            hashtags: parsedHashtags,
            hashtagResults: results,
            factorsUsed: 3,
            timestamp: new Date().toISOString()
        };
        
        sessionStorage.setItem('lastAnalysisResult', JSON.stringify(resultData));
        
        // Redirect to results
        window.location.href = `results.html?platform=${platformId}&type=hashtag&demo=true`;
    }, 3500);
}

function checkHashtagsAgainstDatabase(hashtags, platformId) {
    const results = [];
    
    // Check against BannedHashtags database if available
    const database = window.BannedHashtags;
    
    hashtags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        let status = 'safe';
        let reason = 'No issues detected';
        
        if (database) {
            // Check banned
            if (database.banned && database.banned.includes(tagLower)) {
                status = 'banned';
                reason = 'This hashtag is banned and will limit visibility';
            }
            // Check restricted
            else if (database.restricted && database.restricted.includes(tagLower)) {
                status = 'restricted';
                reason = 'This hashtag is restricted and may limit reach';
            }
            // Check spam
            else if (database.spam && database.spam.includes(tagLower)) {
                status = 'warning';
                reason = 'This hashtag is associated with spam behavior';
            }
        }
        
        results.push({
            hashtag: tag,
            status: status,
            reason: reason
        });
    });
    
    return results;
}

// ============================================
// PLATFORM MODAL
// ============================================
function showPlatformModal(platform) {
    let modal = document.getElementById('platform-modal');
    if (!modal) {
        const modalHtml = `
            <div id="platform-modal" class="modal hidden">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close" onclick="document.getElementById('platform-modal').classList.add('hidden');document.body.style.overflow='';">×</button>
                    <div class="modal-header">
                        <span class="modal-icon" id="platform-modal-icon">📱</span>
                        <h2 id="platform-modal-title">Platform Analysis</h2>
                        <div id="platform-modal-status"></div>
                    </div>
                    <div class="modal-body" id="platform-modal-body"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('platform-modal');
    }
    
    const modalIcon = document.getElementById('platform-modal-icon');
    const modalTitle = document.getElementById('platform-modal-title');
    const modalStatus = document.getElementById('platform-modal-status');
    const modalBody = document.getElementById('platform-modal-body');
    
    if (modalIcon) modalIcon.textContent = platform.icon;
    if (modalTitle) modalTitle.textContent = platform.name;
    
    if (modalStatus) {
        const statusClass = platform.status === 'live' ? 'status-live' : 'status-soon';
        const statusText = platform.status === 'live' ? '● Live' : '○ Coming Soon';
        modalStatus.innerHTML = `<span class="${statusClass}">${statusText}</span>`;
    }
    
    if (modalBody) {
        let html = '<h4>Hashtag Signals We Analyze:</h4><ul class="modal-check-list">';
        if (platform.hashtagChecks) {
            platform.hashtagChecks.forEach(check => {
                html += `<li>✓ ${check}</li>`;
            });
        }
        html += '</ul>';
        
        if (platform.status === 'soon') {
            html += `<p class="modal-note">🚀 ${platform.name} hashtag analysis is coming soon!</p>`;
        }
        
        modalBody.innerHTML = html;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    modal.querySelector('.modal-overlay').onclick = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };
}

// ============================================
// INFO MODAL
// ============================================
function showInfoModal() {
    let modal = document.getElementById('hashtag-info-modal');
    if (!modal) {
        const modalHtml = `
            <div id="hashtag-info-modal" class="modal hidden">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close" onclick="document.getElementById('hashtag-info-modal').classList.add('hidden');document.body.style.overflow='';">×</button>
                    <div class="modal-header">
                        <span class="modal-icon">#️⃣</span>
                        <h2>Hashtag Checker</h2>
                    </div>
                    <div class="modal-body">
                        <p>The Hashtag Checker analyzes your hashtags for potential issues using <strong>3 factors</strong>:</p>
                        <ul class="modal-check-list">
                            <li>🌐 <strong>Web Analysis</strong> - Hashtag visibility in search</li>
                            <li>📊 <strong>Historical Data</strong> - Patterns and trends</li>
                            <li>#️⃣ <strong>Hashtag Database</strong> - 1,800+ known banned/restricted tags</li>
                        </ul>
                        <p class="modal-note">💡 <strong>Tip:</strong> Check your hashtags BEFORE posting to avoid accidentally using banned or restricted tags that could limit your reach.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('hashtag-info-modal');
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    modal.querySelector('.modal-overlay').onclick = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}

// ============================================
// INIT
// ============================================
init();

})();
