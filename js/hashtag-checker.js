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
    // Multiple initialization strategies for reliability
    document.addEventListener('sharedComponentsLoaded', tryInit);
    document.addEventListener('DOMContentLoaded', tryInit);
    document.addEventListener('platformsReady', tryInit);
    
    // Fallback with delays
    setTimeout(tryInit, 100);
    setTimeout(tryInit, 300);
    setTimeout(tryInit, 500);
}

function tryInit() {
    if (initialized) return;
    if (!window.platformData || !Array.isArray(window.platformData)) {
        console.log('⏳ Hashtag-checker: Waiting for platformData...');
        return;
    }
    onComponentsLoaded();
}

function onComponentsLoaded() {
    // Prevent double initialization
    if (initialized) return;
    initialized = true;
    
    console.log('🚀 Hashtag-checker.js initializing...');
    
    // Get DOM elements - try both ID formats
    platformSelect = document.getElementById('hashtag-platform-select') || document.getElementById('platform-select');
    hashtagInput = document.getElementById('hashtag-input');
    checkHashtagsBtn = document.getElementById('check-hashtags-btn');
    hashtagCheckForm = document.getElementById('hashtag-check-form');
    
    hashtagCount = document.getElementById('hashtag-count');
    
    engineAnimation = document.getElementById('engine-animation');
    hashtagCheckerCard = document.getElementById('hashtag-checker-card') || document.getElementById('checker-card');
    
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
        console.warn('❌ Platform select element not found');
        return;
    }
    
    if (!window.platformData || !Array.isArray(window.platformData)) {
        console.warn('❌ platformData not available');
        return;
    }
    
    // Only platforms that support hashtags (excludes Reddit)
    const hashtagPlatforms = window.platformData.filter(p => 
        p.supports && p.supports.hashtagCheck === true
    );
    
    console.log('📋 Populating hashtag dropdown with', hashtagPlatforms.length, 'platforms (excluding Reddit)');
    
    let optionsHtml = '<option value="">Select Platform</option>';
    
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
    console.log('✅ Hashtag platform dropdown populated');
}

function populatePlatformIcons() {
    if (!supportedPlatformIcons) return;
    if (!window.platformData || !Array.isArray(window.platformData)) return;
    
    // Only show platforms that support hashtags (excludes Reddit)
    const hashtagPlatforms = window.platformData.filter(p => 
        p.supports && p.supports.hashtagCheck === true
    );
    
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
            const platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
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
    
    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (hashtagInput) hashtagInput.value = '';
            if (platformSelect) platformSelect.value = '';
            currentPlatform = null;
            parsedHashtags = [];
            updateHashtagCount();
            validateForm();
        });
    }
    
    // Show Reddit note button
    const showRedditNote = document.getElementById('show-reddit-note');
    if (showRedditNote) {
        showRedditNote.addEventListener('click', () => {
            const redditNotice = document.getElementById('reddit-notice');
            if (redditNotice) {
                redditNotice.classList.toggle('hidden');
            }
        });
    }
}

// ============================================
// PLATFORM CHANGE HANDLER
// ============================================
function handlePlatformChange() {
    const platformId = platformSelect ? platformSelect.value : '';
    
    if (!platformId) {
        currentPlatform = null;
        validateForm();
        return;
    }
    
    currentPlatform = window.getPlatformById ? window.getPlatformById(platformId) : null;
    console.log('🔄 Hashtag platform selected:', currentPlatform ? currentPlatform.name : 'none');
    validateForm();
}

// ============================================
// HASHTAG INPUT HANDLER
// ============================================
function handleHashtagInput() {
    const text = hashtagInput ? hashtagInput.value : '';
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
    const words = text.split(/[,\s\n]+/).filter(w => w.length > 0);
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
        { id: 'factor-1-progress', message: '> Platform API... (skipped for hashtag check)', delay: 300, active: false },
        { id: 'factor-2-progress', message: '> Running web analysis...', delay: 600, active: true },
        { id: 'factor-3-progress', message: '> Checking historical data...', delay: 1000, active: true },
        { id: 'factor-4-progress', message: '> Scanning hashtag database...', delay: 1400, active: true },
        { id: 'factor-5-progress', message: '> IP analysis... (not applicable)', delay: 1600, active: false }
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
                const status = factorEl.querySelector('.factor-status');
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
        
        // AI processing messages
        const aiMessages = [
            'Cross-referencing database...',
            'Calculating risk scores...',
            'Generating results...'
        ];
        
        const aiMessageEl = document.getElementById('ai-processing-message');
        aiMessages.forEach((msg, i) => {
            setTimeout(() => {
                if (aiMessageEl) aiMessageEl.textContent = msg;
            }, i * 500);
        });
    }, 2500);
}

function simulateAnalysis() {
    setTimeout(() => {
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        
        // Check hashtags against banned database
        const results = checkHashtagsAgainstDatabase(parsedHashtags, platformId);
        
        // Calculate overall probability
        let probability = 0;
        const bannedCount = results.filter(r => r.status === 'banned').length;
        const restrictedCount = results.filter(r => r.status === 'restricted').length;
        const warningCount = results.filter(r => r.status === 'warning').length;
        
        probability = (bannedCount * 30) + (restrictedCount * 15) + (warningCount * 5);
        probability = Math.min(probability, 95); // Cap at 95%
        
        // Store results
        const resultData = {
            platform: platformId,
            platformName: currentPlatform ? currentPlatform.name : 'Twitter/X',
            platformIcon: currentPlatform ? currentPlatform.icon : '𝕏',
            checkType: 'hashtag',
            hashtags: parsedHashtags,
            hashtagResults: results,
            probability: probability,
            verdict: probability > 50 ? 'High Risk' : probability > 25 ? 'Medium Risk' : 'Low Risk',
            verdictClass: probability > 50 ? 'danger' : probability > 25 ? 'warning' : 'good',
            factorsUsed: 3,
            timestamp: new Date().toISOString(),
            keyFindings: generateHashtagFindings(results),
            recommendations: generateHashtagRecommendations(results)
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
                reason = 'This hashtag is banned and will severely limit visibility';
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
        } else {
            // Demo mode - simulate some results
            if (['adult', 'nsfw', 'xxx'].includes(tagLower)) {
                status = 'banned';
                reason = 'This hashtag is banned and will severely limit visibility';
            } else if (['crypto', 'nft', 'giveaway'].includes(tagLower)) {
                status = 'restricted';
                reason = 'This hashtag is restricted and may limit reach';
            } else if (['viral', 'fyp', 'trending'].includes(tagLower)) {
                status = 'warning';
                reason = 'This hashtag is overused and has low discovery value';
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

function generateHashtagFindings(results) {
    const findings = [];
    
    const bannedCount = results.filter(r => r.status === 'banned').length;
    const restrictedCount = results.filter(r => r.status === 'restricted').length;
    const safeCount = results.filter(r => r.status === 'safe').length;
    
    if (bannedCount > 0) {
        findings.push({
            status: 'warning',
            text: `${bannedCount} banned hashtag${bannedCount > 1 ? 's' : ''} detected - will severely limit visibility`
        });
    }
    
    if (restrictedCount > 0) {
        findings.push({
            status: 'warning',
            text: `${restrictedCount} restricted hashtag${restrictedCount > 1 ? 's' : ''} may reduce reach`
        });
    }
    
    if (safeCount > 0) {
        findings.push({
            status: 'good',
            text: `${safeCount} hashtag${safeCount > 1 ? 's' : ''} appear safe to use`
        });
    }
    
    if (bannedCount === 0 && restrictedCount === 0) {
        findings.push({
            status: 'good',
            text: 'No problematic hashtags detected in your selection'
        });
    }
    
    return findings;
}

function generateHashtagRecommendations(results) {
    const recommendations = [];
    
    const banned = results.filter(r => r.status === 'banned');
    const restricted = results.filter(r => r.status === 'restricted');
    
    if (banned.length > 0) {
        recommendations.push({
            priority: 'high',
            title: 'Remove Banned Hashtags',
            description: `Remove these hashtags immediately: ${banned.map(r => '#' + r.hashtag).join(', ')}. Using banned hashtags can shadow ban your entire post.`
        });
    }
    
    if (restricted.length > 0) {
        recommendations.push({
            priority: 'medium',
            title: 'Consider Replacing Restricted Hashtags',
            description: `These hashtags may limit your reach: ${restricted.map(r => '#' + r.hashtag).join(', ')}. Consider using more specific alternatives.`
        });
    }
    
    if (banned.length === 0 && restricted.length === 0) {
        recommendations.push({
            priority: 'low',
            title: 'Your Hashtags Look Good',
            description: 'No problematic hashtags detected. Your hashtag selection should not trigger any platform restrictions.'
        });
    }
    
    return recommendations;
}

// ============================================
// PLATFORM MODAL
// ============================================
function showPlatformModal(platform) {
    if (!platform) return;
    
    let modal = document.getElementById('platform-modal');
    if (!modal) {
        const modalHtml = `
            <div id="platform-modal" class="modal hidden">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="modal-header">
                        <span class="modal-icon" id="platform-modal-icon">📱</span>
                        <h3 class="modal-title" id="platform-modal-title">Platform Analysis</h3>
                        <div id="platform-modal-status"></div>
                    </div>
                    <div class="modal-body" id="platform-modal-body"></div>
                    <div class="modal-footer">
                        <button class="btn btn-primary btn-lg" onclick="document.getElementById('platform-modal').classList.add('hidden');document.body.style.overflow='';">Got It!</button>
                    </div>
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
        if (platform.hashtagChecks && platform.hashtagChecks.length > 0) {
            platform.hashtagChecks.forEach(check => {
                html += `<li>✓ ${check}</li>`;
            });
        } else {
            html += '<li>✓ Banned hashtag detection</li>';
            html += '<li>✓ Restricted hashtag identification</li>';
        }
        html += '</ul>';
        
        if (platform.status === 'soon') {
            html += `<p class="modal-note">🚀 ${platform.name} hashtag analysis is coming soon!</p>`;
        }
        
        modalBody.innerHTML = html;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.onclick = () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        };
    }
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        };
    }
}

// ============================================
// INFO MODAL
// ============================================
function showInfoModal() {
    const modal = document.getElementById('hashtag-info-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.onclick = () => {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            };
        }
        
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            };
        }
    }
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'info') {
    if (window.showToast && typeof window.showToast === 'function') {
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
