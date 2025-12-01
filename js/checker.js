/* =============================================================================
   CHECKER.JS - Account Checker Page
   ShadowBanCheck.io
   
   Updated to support 5-Factor Engine when available.
   Falls back to demo data if engine not loaded.
   ============================================================================= */

(function() {
'use strict';

let initialized = false;
let currentPlatform = null;
let engagementStepsCompleted = { follow: false, like: false, retweet: false, reply: false };

// ============================================
// INITIALIZATION
// ============================================
function init() {
    if (initialized) return;
    
    if (!window.platformData || !Array.isArray(window.platformData)) {
        console.log('⏳ checker.js waiting for platformData...');
        setTimeout(init, 50);
        return;
    }
    
    initialized = true;
    console.log('🚀 Checker.js initializing...');
    
    populatePlatformSelect();
    populatePlatformIcons();
    setupEventListeners();
    
    // Check 5-Factor Engine status
    if (window.FiveFactorLoader) {
        const status = window.FiveFactorLoader.getQuickStatus();
        console.log(`🔧 5-Factor Engine: ${status.ready ? 'Ready' : `${status.loadedCount}/${status.totalCount} modules`}`);
    }
    
    console.log('✅ Checker.js initialized');
}

// Multiple init triggers
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('platformsReady', init);
setTimeout(init, 100);
setTimeout(init, 300);

// ============================================
// PLATFORM DROPDOWN
// ============================================
function populatePlatformSelect() {
    const select = document.getElementById('platform-select');
    if (!select) {
        console.warn('⚠️ #platform-select not found');
        return;
    }
    
    select.innerHTML = '<option value="">Select Platform</option>';
    
    const platforms = window.platformData.filter(p => 
        p.supports && p.supports.accountCheck === true
    );
    
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
    
    console.log('✅ Platform dropdown populated with', livePlatforms.length, 'live +', soonPlatforms.length, 'coming soon');
}

function populatePlatformIcons() {
    const container = document.getElementById('checker-platform-icons');
    if (!container || !window.platformData) return;
    
    let html = '';
    
    const platforms = window.platformData.filter(p => 
        p.supports && p.supports.accountCheck === true
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
            if (platform) showPlatformInfoModal(platform);
        });
    });
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    const platformSelect = document.getElementById('platform-select');
    if (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
    }
    
    const usernameInput = document.getElementById('username-input');
    if (usernameInput) {
        usernameInput.addEventListener('input', handleUsernameInput);
    }
    
    const form = document.getElementById('account-check-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
    }
    
    const checkerInfoBtn = document.getElementById('checker-info-btn');
    if (checkerInfoBtn) {
        checkerInfoBtn.addEventListener('click', () => openModal('checker-info-modal'));
    }
    
    const engineInfoBtn = document.getElementById('engine-info-btn');
    if (engineInfoBtn) {
        engineInfoBtn.addEventListener('click', () => openModal('engine-info-modal'));
    }
    
    document.querySelectorAll('.engagement-checkbox').forEach(cb => {
        cb.addEventListener('change', handleEngagementCheckboxChange);
    });
    
    const engagementConfirmed = document.getElementById('engagement-confirmed');
    if (engagementConfirmed) {
        engagementConfirmed.addEventListener('change', handleEngagementConfirmed);
    }
    
    const skipEngagementBtn = document.getElementById('skip-engagement-btn');
    if (skipEngagementBtn) {
        skipEngagementBtn.addEventListener('click', handleSkipEngagement);
    }
}

// ============================================
// HANDLERS
// ============================================
function handlePlatformChange(e) {
    const platformId = e.target.value;
    currentPlatform = platformId ? window.getPlatformById(platformId) : null;
    
    const platformStatus = document.getElementById('platform-status');
    const platformNote = document.getElementById('platform-note');
    const platformNoteText = document.getElementById('platform-note-text');
    const checkBtn = document.getElementById('check-account-btn');
    const engagementSection = document.getElementById('engagement-test-section');
    
    if (!platformId) {
        if (platformStatus) platformStatus.textContent = 'Select a platform to continue';
        if (platformNote) platformNote.classList.add('hidden');
        if (checkBtn) checkBtn.disabled = true;
        if (engagementSection) engagementSection.classList.add('hidden');
        return;
    }
    
    if (currentPlatform) {
        if (platformStatus) {
            platformStatus.textContent = currentPlatform.status === 'live' 
                ? `${currentPlatform.name} - Ready to analyze` 
                : `${currentPlatform.name} - Coming soon`;
        }
        
        if (platformNote && platformNoteText && currentPlatform.messages && currentPlatform.messages.platformNote) {
            platformNoteText.textContent = currentPlatform.messages.platformNote;
            platformNote.classList.remove('hidden');
        } else if (platformNote) {
            platformNote.classList.add('hidden');
        }
        
        if (currentPlatform.id === 'twitter' && 
            currentPlatform.supports && currentPlatform.supports.engagementTest &&
            currentPlatform.engagementTest && currentPlatform.engagementTest.enabled) {
            if (engagementSection) engagementSection.classList.remove('hidden');
        } else {
            if (engagementSection) engagementSection.classList.add('hidden');
        }
    }
    
    updateSubmitButton();
}

function handleUsernameInput(e) {
    let value = e.target.value.trim();
    
    if (value && !value.startsWith('@')) {
        e.target.value = '@' + value;
    }
    
    updateSubmitButton();
}

function updateSubmitButton() {
    const platformSelect = document.getElementById('platform-select');
    const usernameInput = document.getElementById('username-input');
    const checkBtn = document.getElementById('check-account-btn');
    
    const hasPlatform = platformSelect && platformSelect.value;
    const hasUsername = usernameInput && usernameInput.value.trim().length > 1;
    const isLive = currentPlatform && currentPlatform.status === 'live';
    
    if (checkBtn) {
        checkBtn.disabled = !(hasPlatform && hasUsername && isLive);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username-input');
    const username = usernameInput ? usernameInput.value.trim() : '';
    
    if (!currentPlatform) {
        showToast('Please select a platform', 'warning');
        return;
    }
    
    if (!username || username.length < 2) {
        showToast('Please enter a username', 'warning');
        return;
    }
    
    if (currentPlatform.status !== 'live') {
        showToast(`${currentPlatform.name} is coming soon!`, 'info');
        return;
    }
    
    const engagementSection = document.getElementById('engagement-test-section');
    const engagementConfirmed = document.getElementById('engagement-confirmed');
    const withEngagement = engagementSection && 
                          !engagementSection.classList.contains('hidden') &&
                          engagementConfirmed && 
                          engagementConfirmed.checked;
    
    runAnalysis(username, withEngagement);
}

function handleClear() {
    const platformSelect = document.getElementById('platform-select');
    const usernameInput = document.getElementById('username-input');
    const checkBtn = document.getElementById('check-account-btn');
    const platformStatus = document.getElementById('platform-status');
    const platformNote = document.getElementById('platform-note');
    const engagementSection = document.getElementById('engagement-test-section');
    
    if (platformSelect) platformSelect.value = '';
    if (usernameInput) usernameInput.value = '';
    if (checkBtn) checkBtn.disabled = true;
    if (platformStatus) platformStatus.textContent = 'Select a platform to continue';
    if (platformNote) platformNote.classList.add('hidden');
    if (engagementSection) engagementSection.classList.add('hidden');
    
    currentPlatform = null;
    resetEngagementSteps();
}

// ============================================
// ENGAGEMENT TEST
// ============================================
function handleEngagementCheckboxChange(e) {
    const step = e.target.id.replace('step-', '');
    engagementStepsCompleted[step] = e.target.checked;
    updateEngagementProgress();
}

function handleEngagementConfirmed(e) {
    console.log('Engagement confirmed:', e.target.checked);
}

function handleSkipEngagement() {
    const engagementSection = document.getElementById('engagement-test-section');
    if (engagementSection) engagementSection.classList.add('hidden');
    resetEngagementSteps();
    
    const usernameInput = document.getElementById('username-input');
    const username = usernameInput ? usernameInput.value.trim() : '';
    if (username && currentPlatform) {
        runAnalysis(username, false);
    }
}

function resetEngagementSteps() {
    engagementStepsCompleted = { follow: false, like: false, retweet: false, reply: false };
    document.querySelectorAll('.engagement-checkbox').forEach(cb => cb.checked = false);
    const ec = document.getElementById('engagement-confirmed');
    if (ec) ec.checked = false;
    updateEngagementProgress();
}

function updateEngagementProgress() {
    const completed = Object.values(engagementStepsCompleted).filter(v => v).length;
    const fill = document.getElementById('engagement-progress-fill');
    const text = document.getElementById('engagement-progress-text');
    
    if (fill) fill.style.width = `${(completed / 4) * 100}%`;
    if (text) text.textContent = `${completed} of 4 steps completed`;
}

// ============================================
// ANALYSIS
// ============================================
function runAnalysis(username, withEngagement) {
    const checkerCard = document.getElementById('checker-card');
    const engineAnimation = document.getElementById('engine-animation');
    
    if (checkerCard) checkerCard.classList.add('hidden');
    if (engineAnimation) engineAnimation.classList.remove('hidden');
    
    runEngineAnimation();
    
    // Check if 5-Factor Engine is available
    const useEngine = window.FiveFactorLoader && window.FiveFactorLoader.isEngineReady();
    
    if (useEngine) {
        console.log('🚀 Using 5-Factor Engine for account check');
        runFiveFactorAnalysis(username, withEngagement);
    } else {
        console.log('📊 Using demo data for account check');
        simulateAnalysis(username, withEngagement);
    }
}

/**
 * Run analysis using the new 5-Factor Engine
 */
async function runFiveFactorAnalysis(username, withEngagement) {
    const platformId = currentPlatform ? currentPlatform.id : 'twitter';
    
    try {
        // Use the engine's checkAccount function
        const result = await window.checkAccount(username, platformId);
        
        // Add engagement data
        result.withEngagement = withEngagement;
        result.engagementSteps = { ...engagementStepsCompleted };
        result.username = username;
        
        // Store result
        sessionStorage.setItem('lastAnalysisResult', JSON.stringify(result));
        
        // Navigate to results
        window.location.href = `results.html?platform=${platformId}&type=account&username=${encodeURIComponent(username)}&engine=5factor`;
        
    } catch (error) {
        console.error('5-Factor Engine error:', error);
        showToast('Analysis failed. Using demo data.', 'warning');
        
        // Fall back to demo
        simulateAnalysis(username, withEngagement);
    }
}

function runEngineAnimation() {
    const terminalOutput = document.getElementById('terminal-output');
    if (terminalOutput) terminalOutput.innerHTML = '';
    
    const platform = currentPlatform || { id: 'twitter', name: 'Twitter/X' };
    const isReddit = platform.id === 'reddit';
    
    const lines = [
        { text: `> Initializing 5-Factor Detection Engine...`, delay: 0 },
        { text: `> Target platform: ${platform.name}`, delay: 400 },
        { text: `> Connecting to platform API...`, delay: 800 },
        { text: `> Querying account status...`, delay: 1200 },
        { text: `> Running web visibility tests...`, delay: 1800 },
        { text: `> Analyzing historical patterns...`, delay: 2400 },
        { text: isReddit ? `> Hashtag check: Scanning recent posts...` : `> Scanning hashtag database...`, delay: 2800 },
        { text: `> Analyzing bio content & links...`, delay: 3200 },
        { text: `> Scanning for flagged words...`, delay: 3400 },
        { text: `> Checking link/domain reputation...`, delay: 3600 },
        { text: `> Calculating probability score...`, delay: 4000 },
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
    
    const factors = [
        { id: 'factor-1', delay: 1000, status: 'complete' },
        { id: 'factor-2', delay: 1800, status: 'complete' },
        { id: 'factor-3', delay: 2400, status: 'complete' },
        { id: 'factor-4', delay: 2800, status: isReddit ? 'na' : 'complete' },
        { id: 'factor-5', delay: 3800, status: 'complete' },
    ];
    
    factors.forEach(factor => {
        setTimeout(() => {
            const el = document.getElementById(factor.id);
            if (el) {
                let status = el.querySelector('.factor-compact-status') || el.querySelector('.factor-status');
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
    
    setTimeout(() => {
        const phase1 = document.getElementById('engine-phase-1');
        const phase2 = document.getElementById('engine-phase-2');
        if (phase1) phase1.classList.add('hidden');
        if (phase2) phase2.classList.remove('hidden');
        
        const aiMessages = ['Cross-referencing signals...', 'Analyzing content patterns...', 'Calculating probability weights...', 'Generating score...'];
        const aiMessageEl = document.getElementById('ai-processing-message');
        aiMessages.forEach((msg, i) => {
            setTimeout(() => {
                if (aiMessageEl) aiMessageEl.textContent = msg;
            }, i * 600);
        });
    }, 4200);
}

function simulateAnalysis(username, withEngagement) {
    setTimeout(() => {
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        
        // Try to get 5-factor format demo data
        let demoResult = null;
        if (window.DemoData) {
            demoResult = window.DemoData.getResult(platformId, 'accountCheck', { format: 'auto' });
        }
        
        if (demoResult) {
            demoResult.username = username;
            demoResult.withEngagement = withEngagement;
            demoResult.engagementSteps = { ...engagementStepsCompleted };
            demoResult.checkType = 'account';
            demoResult.factorsUsed = 5;
            sessionStorage.setItem('lastAnalysisResult', JSON.stringify(demoResult));
        }
        
        window.location.href = `results.html?platform=${platformId}&type=account&username=${encodeURIComponent(username)}&demo=true`;
    }, 5500);
}

// ============================================
// MODALS
// ============================================
function showPlatformInfoModal(platform) {
    const modal = document.getElementById('platform-modal') || 
                  document.getElementById('platform-info-modal') || 
                  document.getElementById('checker-info-modal');
    if (!modal || !platform) return;
    
    const icon = modal.querySelector('.modal-icon') || document.getElementById('modal-icon') || document.getElementById('platform-modal-icon');
    const title = modal.querySelector('.modal-title') || document.getElementById('modal-title') || document.getElementById('platform-modal-title');
    const body = modal.querySelector('.modal-body') || document.getElementById('modal-body') || document.getElementById('platform-modal-body');
    const statusEl = modal.querySelector('.modal-status') || document.getElementById('modal-status');
    
    if (icon) icon.textContent = platform.icon;
    if (title) title.textContent = `${platform.name} Account Analysis`;
    
    if (statusEl) {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const statusText = platform.status === 'live' ? 'Live' : 'Coming Soon';
        statusEl.innerHTML = `<span class="status-badge ${statusClass}">● ${statusText}</span>`;
    }
    
    if (body) {
        let html = '<h4>Account Signals We Analyze:</h4><ul class="check-list">';
        const checks = platform.accountChecks || ['Account visibility', 'Search presence', 'Profile accessibility'];
        checks.forEach(check => {
            html += `<li>${check}</li>`;
        });
        html += '</ul>';
        
        if (platform.messages && platform.messages.platformNote) {
            html += `<p style="margin-top: var(--space-md); padding: var(--space-md); background: rgba(99, 102, 241, 0.1); border-radius: var(--radius-md);">💡 ${platform.messages.platformNote}</p>`;
        }
        
        body.innerHTML = html;
    }
    
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
window.closePlatformInfoModal = function() { closeModal('platform-info-modal'); };

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
