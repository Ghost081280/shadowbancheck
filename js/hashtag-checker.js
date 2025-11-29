/* =============================================================================
   HASHTAG-CHECKER.JS - Hashtag Checker Page Functionality
   ShadowBanCheck.io
   
   Handles:
   - Platform selector (excludes Reddit - no hashtags)
   - Hashtag input and parsing
   - Database scanning
   - Engine animation
   - Results display
   ============================================================================= */

(function() {
'use strict';

// ============================================
// DOM ELEMENTS
// ============================================
let platformSelect, hashtagInput, checkHashtagsBtn, hashtagCheckForm;
let platformSelectorNote, redditNotice;
let hashtagCount;
let engineAnimation, checkerCard;
let hashtagPlatformIcons;
let clearBtn, showRedditNoteBtn;

// ============================================
// STATE
// ============================================
let currentPlatform = null;

// ============================================
// INITIALIZATION
// ============================================
function init() {
    document.addEventListener('sharedComponentsLoaded', onComponentsLoaded);
    
    if (document.querySelector('header')) {
        onComponentsLoaded();
    }
}

function onComponentsLoaded() {
    // Get DOM elements
    platformSelect = document.getElementById('hashtag-platform-select');
    hashtagInput = document.getElementById('hashtag-input');
    checkHashtagsBtn = document.getElementById('check-hashtags-btn');
    hashtagCheckForm = document.getElementById('hashtag-check-form');
    
    platformSelectorNote = document.getElementById('platform-selector-note');
    redditNotice = document.getElementById('reddit-notice');
    
    hashtagCount = document.getElementById('hashtag-count');
    
    engineAnimation = document.getElementById('engine-animation');
    checkerCard = document.getElementById('checker-card');
    
    hashtagPlatformIcons = document.getElementById('hashtag-platform-icons');
    
    clearBtn = document.getElementById('clear-btn');
    showRedditNoteBtn = document.getElementById('show-reddit-note');
    
    // Populate platform dropdown (hashtag-enabled only, NO Reddit)
    populatePlatformSelect();
    
    // Populate platform icons
    populatePlatformIcons();
    
    // Setup event listeners
    setupEventListeners();
}

// ============================================
// PLATFORM DROPDOWN - EXCLUDES REDDIT
// ============================================
function populatePlatformSelect() {
    if (!platformSelect || !window.platformData) return;
    
    let optionsHtml = '<option value="">Choose a platform...</option>';
    
    // Get platforms that support hashtags
    const hashtagPlatforms = window.getHashtagPlatforms();
    
    // Live hashtag platforms first
    const liveHashtagPlatforms = hashtagPlatforms.filter(p => p.status === 'live');
    liveHashtagPlatforms.forEach(platform => {
        optionsHtml += `<option value="${platform.id}">${platform.icon} ${platform.name}</option>`;
    });
    
    // Coming soon hashtag platforms (disabled)
    const soonHashtagPlatforms = hashtagPlatforms.filter(p => p.status === 'soon');
    if (soonHashtagPlatforms.length > 0) {
        optionsHtml += '<optgroup label="Coming Soon">';
        soonHashtagPlatforms.forEach(platform => {
            optionsHtml += `<option value="${platform.id}" disabled>${platform.icon} ${platform.name} (Coming Soon)</option>`;
        });
        optionsHtml += '</optgroup>';
    }
    
    platformSelect.innerHTML = optionsHtml;
}

function populatePlatformIcons() {
    if (!hashtagPlatformIcons || !window.platformData) return;
    
    // Only show platforms that support hashtags
    const hashtagPlatforms = window.getHashtagPlatforms();
    
    let html = '';
    hashtagPlatforms.forEach(platform => {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        html += `
            <span class="platform-icon-badge ${statusClass}" title="${platform.name}${platform.status === 'soon' ? ' (Coming Soon)' : ''}">
                ${platform.icon}
            </span>
        `;
    });
    
    hashtagPlatformIcons.innerHTML = html;
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
    
    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
    }
    
    // Show Reddit note button
    if (showRedditNoteBtn) {
        showRedditNoteBtn.addEventListener('click', toggleRedditNotice);
    }
    
    // Info buttons
    const hashtagInfoBtn = document.getElementById('hashtag-info-btn');
    if (hashtagInfoBtn) {
        hashtagInfoBtn.addEventListener('click', () => {
            openModal('hashtag-info-modal');
        });
    }
    
    const engineInfoBtn = document.getElementById('engine-info-btn');
    if (engineInfoBtn) {
        engineInfoBtn.addEventListener('click', () => {
            openModal('engine-info-modal');
        });
    }
}

// ============================================
// PLATFORM CHANGE
// ============================================
function handlePlatformChange() {
    const platformId = platformSelect.value;
    
    if (!platformId) {
        currentPlatform = null;
        updatePlatformNote('Different platforms have different banned hashtags');
        validateForm();
        return;
    }
    
    currentPlatform = window.getPlatformById(platformId);
    
    if (currentPlatform) {
        // Show platform-specific note
        const platformNotes = window.BannedHashtags ? window.BannedHashtags.getPlatformNotes(platformId) : null;
        if (platformNotes) {
            updatePlatformNote(platformNotes);
        } else {
            updatePlatformNote(`Checking hashtags for ${currentPlatform.name}`);
        }
    }
    
    validateForm();
}

function updatePlatformNote(text) {
    if (platformSelectorNote) {
        platformSelectorNote.textContent = text;
    }
}

// ============================================
// REDDIT NOTICE
// ============================================
function toggleRedditNotice() {
    if (redditNotice) {
        redditNotice.classList.toggle('hidden');
    }
}

// ============================================
// HASHTAG INPUT
// ============================================
function handleHashtagInput() {
    const hashtags = parseHashtags(hashtagInput.value);
    updateHashtagCount(hashtags.length);
    validateForm();
}

function parseHashtags(text) {
    if (!text) return [];
    
    // Extract hashtags from text
    const matches = text.match(/#\w+/g) || [];
    let hashtags = matches.map(h => h.replace('#', '').toLowerCase());
    
    // Also try comma/space separated
    if (hashtags.length === 0) {
        hashtags = text.split(/[\s,\n]+/)
            .map(h => h.replace(/^#/, '').trim().toLowerCase())
            .filter(h => h.length > 0);
    }
    
    // Remove duplicates
    return [...new Set(hashtags)];
}

function updateHashtagCount(count) {
    if (hashtagCount) {
        hashtagCount.textContent = `${count} hashtag${count !== 1 ? 's' : ''}`;
    }
}

// ============================================
// FORM VALIDATION
// ============================================
function validateForm() {
    const platformSelected = platformSelect && platformSelect.value;
    const hashtags = parseHashtags(hashtagInput ? hashtagInput.value : '');
    const hasHashtags = hashtags.length > 0;
    
    if (checkHashtagsBtn) {
        checkHashtagsBtn.disabled = !(platformSelected && hasHashtags);
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
    
    const hashtags = parseHashtags(hashtagInput.value);
    if (hashtags.length === 0) {
        showToast('Please enter at least one hashtag', 'error');
        return;
    }
    
    // Check if coming soon
    if (currentPlatform.status === 'soon') {
        showToast(`${currentPlatform.name} coming soon!`, 'warning');
        return;
    }
    
    runHashtagCheck(hashtags);
}

function runHashtagCheck(hashtags) {
    // Show engine animation
    showEngineAnimation();
    
    // Run the check
    simulateHashtagCheck(hashtags);
}

// ============================================
// ENGINE ANIMATION
// ============================================
function showEngineAnimation() {
    if (checkerCard) {
        checkerCard.classList.add('hidden');
    }
    if (engineAnimation) {
        engineAnimation.classList.remove('hidden');
    }
    
    runEngineAnimation();
}

function runEngineAnimation() {
    const terminalOutput = document.getElementById('terminal-output');
    
    const factors = [
        { id: 'factor-1-progress', message: '> Platform API not needed for hashtags', delay: 300, active: false },
        { id: 'factor-2-progress', message: '> Running web visibility tests...', delay: 600, active: true },
        { id: 'factor-3-progress', message: '> Checking historical patterns...', delay: 1000, active: true },
        { id: 'factor-4-progress', message: '> Scanning 1,800+ hashtag database...', delay: 1400, active: true },
        { id: 'factor-5-progress', message: '> IP analysis not needed for hashtags', delay: 1800, active: false }
    ];
    
    // Clear terminal
    if (terminalOutput) {
        terminalOutput.innerHTML = '';
    }
    
    factors.forEach((factor) => {
        setTimeout(() => {
            if (terminalOutput && factor.active) {
                const line = document.createElement('div');
                line.className = 'terminal-line';
                line.textContent = factor.message;
                terminalOutput.appendChild(line);
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
            
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
    
    // Phase 2
    setTimeout(() => {
        const phase1 = document.getElementById('engine-phase-1');
        const phase2 = document.getElementById('engine-phase-2');
        if (phase1) phase1.classList.add('hidden');
        if (phase2) phase2.classList.remove('hidden');
    }, 2500);
}

function simulateHashtagCheck(hashtags) {
    setTimeout(() => {
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        
        // Use BannedHashtags database if available
        let result = null;
        if (window.BannedHashtags) {
            result = window.BannedHashtags.checkMultiple(hashtags, platformId);
        }
        
        // Store result
        if (result) {
            result.platform = platformId;
            result.timestamp = new Date().toISOString();
            sessionStorage.setItem('lastHashtagResult', JSON.stringify(result));
        }
        
        // For demo, also store in lastAnalysisResult format
        const demoResult = window.DemoData ? window.DemoData.getResult('twitter', 'hashtagCheck') : null;
        if (demoResult) {
            demoResult.platform = platformId;
            demoResult.hashtagsChecked = hashtags.length;
            if (result) {
                demoResult.results = result.results;
                demoResult.summary = result.summary;
                demoResult.probability = result.probability;
            }
            sessionStorage.setItem('lastAnalysisResult', JSON.stringify(demoResult));
        }
        
        // Redirect to results
        window.location.href = `results.html?type=hashtag&platform=${platformId}&demo=true`;
    }, 3500);
}

// ============================================
// CLEAR
// ============================================
function handleClear() {
    if (platformSelect) platformSelect.value = '';
    if (hashtagInput) hashtagInput.value = '';
    currentPlatform = null;
    updateHashtagCount(0);
    updatePlatformNote('Different platforms have different banned hashtags');
    validateForm();
    
    // Hide reddit notice if visible
    if (redditNotice) {
        redditNotice.classList.add('hidden');
    }
}

// ============================================
// MODALS
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.onclick = () => closeModal(modalId);
        }
        
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => closeModal(modalId);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// INIT
// ============================================
init();

})();
