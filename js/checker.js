/* =============================================================================
   CHECKER.JS - Account Checker Page Functionality
   ShadowBanCheck.io
   
   Handles:
   - Platform selection dropdown
   - Username input
   - Twitter engagement test UI
   - Platform-specific messaging
   - Engine animation
   - Form submission
   ============================================================================= */

(function() {
'use strict';

// ============================================
// DOM ELEMENTS
// ============================================
let platformSelect, usernameInput, checkAccountBtn, accountCheckForm;
let platformStatus, platformNote, platformNoteText;
let engagementTestSection, engagementProgressFill, engagementProgressText;
let engagementConfirmed, skipEngagementBtn;
let engineAnimation, checkerCard;
let supportedPlatformIcons;
let clearBtn;

// ============================================
// STATE
// ============================================
let currentPlatform = null;
let engagementStepsCompleted = {
    follow: false,
    like: false,
    retweet: false,
    reply: false
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    document.addEventListener('sharedComponentsLoaded', onComponentsLoaded);
    
    // Also try immediate init
    if (document.querySelector('header')) {
        onComponentsLoaded();
    }
}

function onComponentsLoaded() {
    // Get DOM elements
    platformSelect = document.getElementById('platform-select');
    usernameInput = document.getElementById('username-input');
    checkAccountBtn = document.getElementById('check-account-btn');
    accountCheckForm = document.getElementById('account-check-form');
    
    platformStatus = document.getElementById('platform-status');
    platformNote = document.getElementById('platform-note');
    platformNoteText = document.getElementById('platform-note-text');
    
    engagementTestSection = document.getElementById('engagement-test-section');
    engagementProgressFill = document.getElementById('engagement-progress-fill');
    engagementProgressText = document.getElementById('engagement-progress-text');
    engagementConfirmed = document.getElementById('engagement-confirmed');
    skipEngagementBtn = document.getElementById('skip-engagement-btn');
    
    engineAnimation = document.getElementById('engine-animation');
    checkerCard = document.getElementById('checker-card');
    
    supportedPlatformIcons = document.getElementById('supported-platform-icons');
    clearBtn = document.getElementById('clear-btn');
    
    // Populate platform dropdown
    populatePlatformSelect();
    
    // Populate platform icons
    populatePlatformIcons();
    
    // Setup event listeners
    setupEventListeners();
    
    // Detect IP
    detectUserIP();
}

// ============================================
// PLATFORM DROPDOWN
// ============================================
function populatePlatformSelect() {
    if (!platformSelect || !window.platformData) return;
    
    let optionsHtml = '<option value="">Select Platform</option>';
    
    // Live platforms first
    const livePlatforms = window.getLivePlatforms();
    livePlatforms.forEach(platform => {
        optionsHtml += `<option value="${platform.id}">${platform.icon} ${platform.name}</option>`;
    });
    
    // Coming soon platforms (disabled)
    const soonPlatforms = window.getComingSoonPlatforms();
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
    if (!supportedPlatformIcons || !window.platformData) return;
    
    let html = '';
    
    window.platformData.forEach(platform => {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        html += `
            <span class="platform-icon-badge ${statusClass}" title="${platform.name}${platform.status === 'soon' ? ' (Coming Soon)' : ''}">
                ${platform.icon}
            </span>
        `;
    });
    
    supportedPlatformIcons.innerHTML = html;
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Platform selection
    if (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
    }
    
    // Username input
    if (usernameInput) {
        usernameInput.addEventListener('input', validateForm);
    }
    
    // Form submission
    if (accountCheckForm) {
        accountCheckForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Engagement checkboxes
    const engagementCheckboxes = document.querySelectorAll('.engagement-checkbox');
    engagementCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleEngagementCheckboxChange);
    });
    
    // Engagement confirmed
    if (engagementConfirmed) {
        engagementConfirmed.addEventListener('change', handleEngagementConfirmed);
    }
    
    // Skip engagement
    if (skipEngagementBtn) {
        skipEngagementBtn.addEventListener('click', handleSkipEngagement);
    }
    
    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
    }
    
    // Info buttons
    const checkerInfoBtn = document.getElementById('checker-info-btn');
    if (checkerInfoBtn) {
        checkerInfoBtn.addEventListener('click', () => {
            openModal('checker-info-modal');
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
// PLATFORM CHANGE HANDLER
// ============================================
function handlePlatformChange() {
    const platformId = platformSelect.value;
    
    if (!platformId) {
        currentPlatform = null;
        hidePlatformNote();
        hideEngagementTest();
        updatePlatformStatus('Select a platform to continue');
        validateForm();
        return;
    }
    
    currentPlatform = window.getPlatformById(platformId);
    
    if (!currentPlatform) {
        hidePlatformNote();
        hideEngagementTest();
        return;
    }
    
    // Update status
    updatePlatformStatus(`${currentPlatform.name} selected`);
    
    // Show platform-specific note
    if (currentPlatform.messages && currentPlatform.messages.platformNote) {
        showPlatformNote(currentPlatform.messages.platformNote);
    } else if (currentPlatform.id === 'reddit') {
        showPlatformNote('Reddit does not use hashtags. We focus on account visibility, subreddit bans, and karma analysis.');
    } else {
        hidePlatformNote();
    }
    
    // Show/hide engagement test
    if (currentPlatform.id === 'twitter' && currentPlatform.supports.engagementTest) {
        showEngagementTest();
    } else {
        hideEngagementTest();
    }
    
    validateForm();
}

function updatePlatformStatus(text) {
    if (platformStatus) {
        platformStatus.textContent = text;
    }
}

function showPlatformNote(text) {
    if (platformNote && platformNoteText) {
        platformNoteText.textContent = text;
        platformNote.classList.remove('hidden');
    }
}

function hidePlatformNote() {
    if (platformNote) {
        platformNote.classList.add('hidden');
    }
}

// ============================================
// ENGAGEMENT TEST
// ============================================
function showEngagementTest() {
    if (engagementTestSection) {
        engagementTestSection.classList.remove('hidden');
    }
}

function hideEngagementTest() {
    if (engagementTestSection) {
        engagementTestSection.classList.add('hidden');
    }
    resetEngagementSteps();
}

function resetEngagementSteps() {
    engagementStepsCompleted = {
        follow: false,
        like: false,
        retweet: false,
        reply: false
    };
    
    const checkboxes = document.querySelectorAll('.engagement-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    
    if (engagementConfirmed) {
        engagementConfirmed.checked = false;
    }
    
    updateEngagementProgress();
}

function handleEngagementCheckboxChange(e) {
    const step = e.target.id.replace('step-', '');
    engagementStepsCompleted[step] = e.target.checked;
    updateEngagementProgress();
}

function updateEngagementProgress() {
    const completed = Object.values(engagementStepsCompleted).filter(v => v).length;
    const total = 4;
    const percentage = (completed / total) * 100;
    
    if (engagementProgressFill) {
        engagementProgressFill.style.width = `${percentage}%`;
    }
    
    if (engagementProgressText) {
        engagementProgressText.textContent = `${completed} of ${total} steps completed`;
    }
}

function handleEngagementConfirmed(e) {
    console.log('Engagement confirmed:', e.target.checked);
}

function handleSkipEngagement() {
    runAccountCheck(false);
}

// ============================================
// FORM VALIDATION
// ============================================
function validateForm() {
    const platformSelected = platformSelect && platformSelect.value;
    const usernameEntered = usernameInput && usernameInput.value.trim().length > 0;
    
    if (checkAccountBtn) {
        checkAccountBtn.disabled = !(platformSelected && usernameEntered);
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
    
    const username = usernameInput.value.trim().replace(/^@/, '');
    if (!username) {
        showToast('Please enter a username', 'error');
        return;
    }
    
    // Check if coming soon
    if (currentPlatform.status === 'soon') {
        showToast(`${currentPlatform.name} coming soon!`, 'warning');
        return;
    }
    
    // Check if engagement test completed
    const withEngagement = engagementConfirmed && engagementConfirmed.checked;
    
    runAccountCheck(withEngagement);
}

function runAccountCheck(withEngagement) {
    // Show engine animation
    showEngineAnimation();
    
    // Simulate analysis
    simulateAnalysis(withEngagement);
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
    
    // Determine which factors to show based on platform
    const isReddit = currentPlatform && currentPlatform.id === 'reddit';
    
    const factors = [
        { id: 'factor-1-progress', message: '> Querying Platform API...', delay: 500, active: true },
        { id: 'factor-2-progress', message: '> Running web analysis...', delay: 1000, active: true },
        { id: 'factor-3-progress', message: '> Checking historical data...', delay: 1500, active: true },
        { id: 'factor-4-progress', message: '> Scanning hashtag database...', delay: 2000, active: !isReddit },
        { id: 'factor-5-progress', message: '> Analyzing your IP connection...', delay: 2500, active: true }
    ];
    
    // Clear terminal
    if (terminalOutput) {
        terminalOutput.innerHTML = '';
    }
    
    // Animate each factor
    factors.forEach((factor) => {
        setTimeout(() => {
            // Add terminal line
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
    
    // Phase 2
    setTimeout(() => {
        const phase1 = document.getElementById('engine-phase-1');
        const phase2 = document.getElementById('engine-phase-2');
        if (phase1) phase1.classList.add('hidden');
        if (phase2) phase2.classList.remove('hidden');
    }, 3500);
}

function simulateAnalysis(withEngagement) {
    setTimeout(() => {
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        const username = usernameInput ? usernameInput.value.trim().replace(/^@/, '') : 'demo_user';
        
        // Get demo data
        const demoResult = window.DemoData ? window.DemoData.getResult(platformId, 'accountCheck') : null;
        
        if (demoResult) {
            demoResult.username = username;
            demoResult.withEngagement = withEngagement;
            demoResult.engagementSteps = { ...engagementStepsCompleted };
            sessionStorage.setItem('lastAnalysisResult', JSON.stringify(demoResult));
        }
        
        // Redirect to results
        window.location.href = `results.html?platform=${platformId}&username=${encodeURIComponent(username)}&demo=true`;
    }, 5000);
}

// ============================================
// CLEAR
// ============================================
function handleClear() {
    if (platformSelect) platformSelect.value = '';
    if (usernameInput) usernameInput.value = '';
    currentPlatform = null;
    hidePlatformNote();
    hideEngagementTest();
    updatePlatformStatus('Select a platform to continue');
    validateForm();
}

// ============================================
// IP DETECTION
// ============================================
function detectUserIP() {
    const ipElement = document.getElementById('ip-address');
    const ipTypeElement = document.getElementById('ip-type');
    const ipFlagElement = document.getElementById('ip-flag');
    
    if (!ipElement) return;
    
    const demoIp = window.DemoData ? window.DemoData.getIpData('residential') : null;
    
    if (demoIp) {
        ipElement.textContent = demoIp.ip;
        if (ipTypeElement) {
            ipTypeElement.textContent = demoIp.type;
            ipTypeElement.className = `ip-type ${demoIp.typeClass}`;
        }
        if (ipFlagElement) {
            ipFlagElement.textContent = demoIp.countryFlag;
        }
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

window.closePlatformInfoModal = function() {
    closeModal('platform-info-modal');
};

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
