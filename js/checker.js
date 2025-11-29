/* =============================================================================
   CHECKER.JS - Account Checker Page Functionality
   ShadowBanCheck.io
   
   Handles:
   - Platform selection dropdown
   - Username input
   - Twitter engagement test UI (optional but recommended)
   - Platform-specific messaging
   - Engine animation (4 factors - NO IP for account check)
   - Form submission
   ============================================================================= */

(function() {
'use strict';

// ============================================
// DOM ELEMENTS
// ============================================
let platformSelect, usernameInput, checkAccountBtn, accountCheckForm;
let platformNote;
let engagementTestSection, engagementProgressFill, engagementProgressText;
let engagementConfirmed, skipEngagementBtn;
let engineAnimation, checkerCard;
let supportedPlatformIcons;
let initialized = false;

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
    platformSelect = document.getElementById('platform-select');
    usernameInput = document.getElementById('username-input');
    checkAccountBtn = document.getElementById('check-account-btn');
    accountCheckForm = document.getElementById('account-check-form');
    
    platformNote = document.getElementById('platform-note');
    
    engagementTestSection = document.getElementById('engagement-test-section');
    engagementProgressFill = document.getElementById('engagement-progress-fill');
    engagementProgressText = document.getElementById('engagement-progress-text');
    engagementConfirmed = document.getElementById('engagement-confirmed');
    skipEngagementBtn = document.getElementById('skip-engagement-btn');
    
    engineAnimation = document.getElementById('engine-animation');
    checkerCard = document.getElementById('checker-card');
    
    supportedPlatformIcons = document.getElementById('checker-platform-icons');
    
    // Populate platform dropdown
    populatePlatformSelect();
    
    // Populate platform icons
    populatePlatformIcons();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Checker.js initialized');
}

// ============================================
// PLATFORM DROPDOWN
// ============================================
function populatePlatformSelect() {
    if (!platformSelect) {
        console.warn('Platform select element not found');
        return;
    }
    
    let optionsHtml = '<option value="">Select Platform</option>';
    
    // Live platforms first
    const livePlatforms = window.platformData.filter(p => p.status === 'live');
    livePlatforms.forEach(platform => {
        optionsHtml += `<option value="${platform.id}">${platform.icon} ${platform.name}</option>`;
    });
    
    // Coming soon platforms (disabled)
    const soonPlatforms = window.platformData.filter(p => p.status === 'soon');
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
    
    let html = '';
    
    window.platformData.forEach(platform => {
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
    
    // Info button
    const checkerInfoBtn = document.getElementById('checker-info-btn');
    if (checkerInfoBtn) {
        checkerInfoBtn.addEventListener('click', () => {
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
        hidePlatformNote();
        hideEngagementTest();
        validateForm();
        return;
    }
    
    currentPlatform = window.platformData.find(p => p.id === platformId);
    
    if (!currentPlatform) {
        hidePlatformNote();
        hideEngagementTest();
        return;
    }
    
    // Show platform-specific note
    if (currentPlatform.id === 'reddit') {
        showPlatformNote('ℹ️ Reddit does not use hashtags. We focus on account visibility, subreddit bans, and karma analysis.');
    } else if (currentPlatform.messages && currentPlatform.messages.platformNote) {
        showPlatformNote('ℹ️ ' + currentPlatform.messages.platformNote);
    } else {
        hidePlatformNote();
    }
    
    // Show/hide engagement test (optional but recommended for Twitter)
    if (currentPlatform.id === 'twitter' && currentPlatform.supports && currentPlatform.supports.engagementTest) {
        showEngagementTest();
    } else {
        hideEngagementTest();
    }
    
    validateForm();
}

function showPlatformNote(text) {
    if (platformNote) {
        platformNote.innerHTML = `<p>${text}</p>`;
        platformNote.classList.remove('hidden');
    }
}

function hidePlatformNote() {
    if (platformNote) {
        platformNote.classList.add('hidden');
    }
}

// ============================================
// ENGAGEMENT TEST (Optional but Recommended)
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
// ENGINE ANIMATION (4 FACTORS - NO IP)
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
    const isReddit = currentPlatform && currentPlatform.id === 'reddit';
    
    // Account check uses 4 factors (NO IP - doesn't make sense for username check)
    const factors = [
        { id: 'factor-1', message: '> Querying Platform API...', delay: 500, active: true },
        { id: 'factor-2', message: '> Running web analysis...', delay: 1000, active: true },
        { id: 'factor-3', message: '> Checking historical data...', delay: 1500, active: true },
        { id: 'factor-4', message: '> Scanning hashtag database...', delay: 2000, active: !isReddit }
        // NO factor 5 (IP) for account checks
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
    }, 3000);
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
            demoResult.factorsUsed = 4; // Account check uses 4 factors, not 5
            demoResult.checkType = 'account';
            sessionStorage.setItem('lastAnalysisResult', JSON.stringify(demoResult));
        }
        
        // Redirect to results
        window.location.href = `results.html?platform=${platformId}&username=${encodeURIComponent(username)}&type=account&demo=true`;
    }, 4500);
}

// ============================================
// PLATFORM MODAL
// ============================================
function showPlatformModal(platform) {
    // Create modal if it doesn't exist
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
        let html = '<h4>Account Signals We Analyze:</h4><ul class="modal-check-list">';
        if (platform.accountChecks) {
            platform.accountChecks.slice(0, 6).forEach(check => {
                html += `<li>✓ ${check}</li>`;
            });
        }
        html += '</ul>';
        
        if (platform.status === 'soon') {
            html += `<p class="modal-note">🚀 ${platform.name} analysis is coming soon! We're working on integrating this platform.</p>`;
        }
        
        modalBody.innerHTML = html;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Close on overlay click
    modal.querySelector('.modal-overlay').onclick = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };
}

// ============================================
// INFO MODAL
// ============================================
function showInfoModal() {
    let modal = document.getElementById('checker-info-modal');
    if (!modal) {
        const modalHtml = `
            <div id="checker-info-modal" class="modal hidden">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close" onclick="document.getElementById('checker-info-modal').classList.add('hidden');document.body.style.overflow='';">×</button>
                    <div class="modal-header">
                        <span class="modal-icon">👤</span>
                        <h2>Account Checker</h2>
                    </div>
                    <div class="modal-body">
                        <p>The Account Checker analyzes your social media account for signs of shadowbanning using <strong>4 independent factors</strong>:</p>
                        <ul class="modal-check-list">
                            <li>📡 <strong>Platform API</strong> - Direct query of platform data</li>
                            <li>🌐 <strong>Web Analysis</strong> - Profile visibility from logged-out view</li>
                            <li>📊 <strong>Historical Data</strong> - Comparison with baseline patterns</li>
                            <li>#️⃣ <strong>Hashtag Database</strong> - Check for restricted tag usage</li>
                        </ul>
                        <p class="modal-note">💡 <strong>For Twitter/X:</strong> Complete the optional engagement test for enhanced accuracy. This lets us verify your actions are visible to other accounts.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('checker-info-modal');
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
