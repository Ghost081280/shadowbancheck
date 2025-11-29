/* =============================================================================
   INDEX.JS - Home Page Functionality
   ShadowBanCheck.io
   
   Handles:
   - Power Check form and URL input
   - Platform detection from URL
   - Engagement test UI for Twitter
   - Checks preview based on platform
   - Platform grid population
   - Engine animation
   ============================================================================= */

(function() {
'use strict';

// ============================================
// DOM ELEMENTS
// ============================================
let powerForm, powerUrlInput, powerAnalyzeBtn;
let platformDetected, detectedPlatformIcon, detectedPlatformName, platformDetectedNote;
let previewHashtag;
let engagementTestSection, engagementSteps, engagementProgressFill, engagementProgressText;
let engagementConfirmed, skipEngagementBtn;
let engineAnimation, powerCheckCard;
let platformGrid, powerPlatformIcons;
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
    // Multiple initialization strategies for reliability
    document.addEventListener('sharedComponentsLoaded', onComponentsLoaded);
    document.addEventListener('DOMContentLoaded', tryInit);
    document.addEventListener('platformsReady', tryInit);
    
    // Fallback with delay
    setTimeout(tryInit, 100);
    setTimeout(tryInit, 300);
}

function tryInit() {
    if (initialized) return;
    if (!window.platformData) {
        console.log('⏳ Waiting for platformData...');
        return;
    }
    onComponentsLoaded();
}

function onComponentsLoaded() {
    if (initialized) return;
    if (!window.platformData) {
        setTimeout(onComponentsLoaded, 100);
        return;
    }
    
    initialized = true;
    console.log('🚀 Index.js initializing...');
    
    // Get DOM elements
    powerForm = document.getElementById('power-check-form');
    powerUrlInput = document.getElementById('power-url-input');
    powerAnalyzeBtn = document.getElementById('power-analyze-btn');
    
    platformDetected = document.getElementById('platform-detected');
    detectedPlatformIcon = document.getElementById('detected-platform-icon');
    detectedPlatformName = document.getElementById('detected-platform-name');
    platformDetectedNote = document.getElementById('platform-detected-note');
    previewHashtag = document.getElementById('preview-hashtag');
    
    engagementTestSection = document.getElementById('engagement-test-section');
    engagementProgressFill = document.getElementById('engagement-progress-fill');
    engagementProgressText = document.getElementById('engagement-progress-text');
    engagementConfirmed = document.getElementById('engagement-confirmed');
    skipEngagementBtn = document.getElementById('skip-engagement-btn');
    
    engineAnimation = document.getElementById('engine-animation');
    powerCheckCard = document.getElementById('power-check-card');
    
    platformGrid = document.getElementById('platform-grid');
    powerPlatformIcons = document.getElementById('power-platform-icons');
    
    // Setup event listeners
    setupEventListeners();
    
    // Populate platforms
    populatePlatformGrid();
    populatePlatformIcons();
    
    // Detect IP
    detectUserIP();
    
    console.log('✅ Index.js initialized');
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // URL input - detect platform as user types
    if (powerUrlInput) {
        powerUrlInput.addEventListener('input', handleUrlInput);
        powerUrlInput.addEventListener('paste', (e) => {
            // Delay to let paste complete
            setTimeout(handleUrlInput, 100);
        });
    }
    
    // Form submission
    if (powerForm) {
        powerForm.addEventListener('submit', handlePowerCheckSubmit);
    }
    
    // Engagement test checkboxes
    const engagementCheckboxes = document.querySelectorAll('.engagement-checkbox');
    engagementCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleEngagementCheckboxChange);
    });
    
    // Engagement confirmed checkbox
    if (engagementConfirmed) {
        engagementConfirmed.addEventListener('change', handleEngagementConfirmed);
    }
    
    // Skip engagement button
    if (skipEngagementBtn) {
        skipEngagementBtn.addEventListener('click', handleSkipEngagement);
    }
    
    // Power info button
    const powerInfoBtn = document.getElementById('power-info-btn');
    if (powerInfoBtn) {
        powerInfoBtn.addEventListener('click', () => {
            openModal('power-info-modal');
        });
    }
    
    // AI info button
    const aiInfoBtn = document.getElementById('ai-info-btn');
    if (aiInfoBtn) {
        aiInfoBtn.addEventListener('click', () => {
            openModal('ai-info-modal');
        });
    }
    
    // Try AI button
    const tryAiBtn = document.getElementById('try-ai-btn');
    if (tryAiBtn) {
        tryAiBtn.addEventListener('click', () => {
            // Open Shadow AI chat
            if (typeof window.openShadowAI === 'function') {
                window.openShadowAI();
            } else {
                showToast('Shadow AI coming soon!', 'info');
            }
        });
    }
    
    // Open Shadow AI from contact
    const openShadowAiBtn = document.getElementById('open-shadow-ai');
    if (openShadowAiBtn) {
        openShadowAiBtn.addEventListener('click', () => {
            if (typeof window.openShadowAI === 'function') {
                window.openShadowAI();
            } else {
                showToast('Shadow AI coming soon!', 'info');
            }
        });
    }
    
    // Factor info buttons
    const factorInfoBtns = document.querySelectorAll('.factor-compact-info');
    factorInfoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const factor = e.target.closest('.engine-factor-compact');
            if (factor) {
                showFactorInfo(factor.dataset.factor);
            }
        });
    });
    
    // Audience info buttons
    const audienceInfoBtns = document.querySelectorAll('.audience-info-btn');
    audienceInfoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const audience = e.target.closest('.audience-info-btn').dataset.audience;
            showAudienceInfo(audience);
        });
    });
}

// ============================================
// URL INPUT & PLATFORM DETECTION
// ============================================
function handleUrlInput() {
    const url = powerUrlInput ? powerUrlInput.value.trim() : '';
    
    if (!url) {
        hidePlatformDetection();
        hideEngagementTest();
        currentPlatform = null;
        return;
    }
    
    // Detect platform using the global function
    const platform = window.detectPlatformFromUrl ? window.detectPlatformFromUrl(url) : null;
    
    console.log('🔍 URL detection:', url, '→', platform ? platform.name : 'none');
    
    if (platform) {
        currentPlatform = platform;
        showPlatformDetection(platform);
        updateChecksPreview(platform);
        
        // Show engagement test for Twitter (with proper null checking)
        if (platform.id === 'twitter' && 
            platform.supports && 
            platform.supports.engagementTest && 
            platform.engagementTest && 
            platform.engagementTest.enabled) {
            showEngagementTest();
        } else {
            hideEngagementTest();
        }
    } else {
        hidePlatformDetection();
        hideEngagementTest();
        currentPlatform = null;
    }
}

function showPlatformDetection(platform) {
    if (!platformDetected || !platform) return;
    
    platformDetected.classList.remove('hidden');
    
    if (detectedPlatformIcon) {
        detectedPlatformIcon.textContent = platform.icon;
    }
    if (detectedPlatformName) {
        detectedPlatformName.textContent = platform.name;
    }
    
    // Show platform note if applicable
    if (platformDetectedNote) {
        if (platform.messages && platform.messages.platformNote) {
            platformDetectedNote.textContent = platform.messages.platformNote;
            platformDetectedNote.classList.remove('hidden');
        } else if (platform.id === 'reddit') {
            platformDetectedNote.textContent = 'Reddit does not use hashtags — hashtag analysis will be skipped.';
            platformDetectedNote.classList.remove('hidden');
        } else {
            platformDetectedNote.classList.add('hidden');
        }
    }
}

function hidePlatformDetection() {
    if (platformDetected) {
        platformDetected.classList.add('hidden');
    }
}

function updateChecksPreview(platform) {
    if (!previewHashtag || !platform) return;
    
    const statusEl = previewHashtag.querySelector('.preview-status');
    if (!statusEl) return;
    
    // Update hashtag check visibility based on platform
    if (platform.supports && platform.supports.hashtagCheck === false) {
        previewHashtag.classList.add('check-na');
        statusEl.textContent = 'N/A';
        statusEl.classList.remove('active');
        statusEl.classList.add('na');
    } else {
        previewHashtag.classList.remove('check-na');
        statusEl.textContent = '✓';
        statusEl.classList.add('active');
        statusEl.classList.remove('na');
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
    // Reset checkboxes
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
    // Could enable a different analysis mode
    console.log('Engagement confirmed:', e.target.checked);
}

function handleSkipEngagement() {
    // Run basic analysis without engagement test
    runPowerCheck(false);
}

// ============================================
// POWER CHECK SUBMISSION
// ============================================
function handlePowerCheckSubmit(e) {
    e.preventDefault();
    
    const url = powerUrlInput ? powerUrlInput.value.trim() : '';
    if (!url) {
        showToast('Please enter a post URL', 'error');
        return;
    }
    
    if (!currentPlatform) {
        showToast('Could not detect platform from URL. Supported: Twitter/X, Reddit', 'error');
        return;
    }
    
    // Check if coming soon platform
    if (currentPlatform.status === 'soon') {
        showToast(`${currentPlatform.name} coming soon!`, 'warning');
        return;
    }
    
    // Check if engagement test was completed (for Twitter)
    const withEngagement = engagementConfirmed && engagementConfirmed.checked;
    
    runPowerCheck(withEngagement);
}

function runPowerCheck(withEngagement) {
    // Show engine animation
    showEngineAnimation();
    
    // Simulate analysis (replace with real API call)
    simulateAnalysis(withEngagement);
}

// ============================================
// ENGINE ANIMATION
// ============================================
function showEngineAnimation() {
    if (powerCheckCard) {
        powerCheckCard.classList.add('hidden');
    }
    if (engineAnimation) {
        engineAnimation.classList.remove('hidden');
    }
    
    // Start animation
    runEngineAnimation();
}

function runEngineAnimation() {
    const terminalOutput = document.getElementById('terminal-output');
    const isReddit = currentPlatform && currentPlatform.id === 'reddit';
    
    const factors = [
        { id: 'factor-1-progress', message: '> Querying Platform API...', delay: 500, active: true },
        { id: 'factor-2-progress', message: '> Running web analysis from U.S. servers...', delay: 1000, active: true },
        { id: 'factor-3-progress', message: '> Checking historical patterns...', delay: 1500, active: true },
        { id: 'factor-4-progress', message: isReddit ? '> Hashtag analysis... (skipped for Reddit)' : '> Scanning hashtag database...', delay: 2000, active: !isReddit },
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
            if (terminalOutput) {
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
    
    // Phase 2: AI Analysis
    setTimeout(() => {
        const phase1 = document.getElementById('engine-phase-1');
        const phase2 = document.getElementById('engine-phase-2');
        if (phase1) phase1.classList.add('hidden');
        if (phase2) phase2.classList.remove('hidden');
        
        // AI processing messages
        const aiMessages = [
            'Cross-referencing signals...',
            'Calculating probability weights...',
            'Generating final score...'
        ];
        
        const aiMessageEl = document.getElementById('ai-processing-message');
        aiMessages.forEach((msg, i) => {
            setTimeout(() => {
                if (aiMessageEl) aiMessageEl.textContent = msg;
            }, i * 800);
        });
    }, 3500);
}

function simulateAnalysis(withEngagement) {
    // Simulate API delay
    setTimeout(() => {
        // Get demo data
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        const demoResult = window.DemoData ? window.DemoData.getResult(platformId, 'powerCheck') : null;
        
        // Store result in session storage for results page
        if (demoResult) {
            demoResult.withEngagement = withEngagement;
            demoResult.engagementSteps = { ...engagementStepsCompleted };
            demoResult.checkType = 'power';
            demoResult.factorsUsed = 5;
            sessionStorage.setItem('lastAnalysisResult', JSON.stringify(demoResult));
        }
        
        // Redirect to results page
        window.location.href = `results.html?platform=${platformId}&type=power&demo=true`;
    }, 5000);
}

// ============================================
// PLATFORM GRID
// ============================================
function populatePlatformGrid() {
    if (!platformGrid || !window.platformData) return;
    
    let html = '';
    
    // Add all platforms
    window.platformData.forEach(platform => {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const statusText = platform.status === 'live' ? 'Live' : 'Coming Soon';
        
        html += `
            <div class="platform-card ${statusClass}" data-platform="${platform.id}">
                <span class="platform-icon">${platform.icon}</span>
                <span class="platform-name">${platform.name}</span>
                <span class="platform-status ${statusClass}">● ${statusText}</span>
            </div>
        `;
    });
    
    // Add "Suggest Platform" card
    html += `
        <div class="platform-card suggest" data-action="suggest">
            <span class="platform-icon">💡</span>
            <span class="platform-name">Suggest a Platform</span>
            <span class="platform-status suggest">Request →</span>
        </div>
    `;
    
    platformGrid.innerHTML = html;
    
    // Add click handlers
    platformGrid.querySelectorAll('.platform-card').forEach(card => {
        card.addEventListener('click', () => {
            const platformId = card.dataset.platform;
            const action = card.dataset.action;
            
            if (action === 'suggest') {
                // Scroll to contact section
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }
            
            const platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
            if (platform) {
                showPlatformModal(platform);
            }
        });
    });
}

function populatePlatformIcons() {
    if (!powerPlatformIcons || !window.platformData) return;
    
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
    
    powerPlatformIcons.innerHTML = html;
    
    // Add click handlers for platform modals
    powerPlatformIcons.querySelectorAll('.platform-icon-badge').forEach(icon => {
        icon.addEventListener('click', () => {
            const platformId = icon.dataset.platform;
            const platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
            if (platform) {
                showPlatformModal(platform);
            }
        });
    });
}

function showPlatformModal(platform) {
    const modal = document.getElementById('platform-modal');
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalStatus = document.getElementById('modal-status');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !platform) return;
    
    if (modalIcon) modalIcon.textContent = platform.icon;
    if (modalTitle) modalTitle.textContent = `${platform.name} Analysis`;
    
    if (modalStatus) {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const statusText = platform.status === 'live' ? 'Live' : 'Coming Soon';
        modalStatus.innerHTML = `<span class="status-badge ${statusClass}">● ${statusText}</span>`;
    }
    
    // Build checks list
    let checksHtml = '<h4>Signals We Analyze:</h4><ul class="check-list" id="modal-checks">';
    
    if (platform.accountChecks && platform.accountChecks.length > 0) {
        platform.accountChecks.forEach(check => {
            checksHtml += `<li>${check}</li>`;
        });
    } else {
        checksHtml += '<li>Account visibility analysis</li>';
        checksHtml += '<li>Search presence detection</li>';
        checksHtml += '<li>Profile accessibility</li>';
    }
    
    checksHtml += '</ul>';
    
    // Add platform note if available
    if (platform.messages && platform.messages.platformNote) {
        checksHtml += `<p class="platform-modal-note">💡 ${platform.messages.platformNote}</p>`;
    }
    
    if (modalBody) modalBody.innerHTML = checksHtml;
    
    openModal('platform-modal');
}

// ============================================
// MODALS
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Close on overlay click
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.onclick = () => closeModal(modalId);
        }
        
        // Close on X button
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => closeModal(modalId);
        }
    }
}

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
};

function showFactorInfo(factorId) {
    const factorData = {
        'platform-api': {
            icon: '🔌',
            title: 'Platform APIs',
            content: 'We directly query official platform APIs where available. For Twitter/X, we use API v2 to check account status, visibility flags, and any restriction indicators. For Reddit, we query their public API for shadowban detection.'
        },
        'web-analysis': {
            icon: '🔍',
            title: 'Web Analysis',
            content: 'Our automated browser testing runs from U.S.-based servers. We check if your profile and content appear in search results when logged in, logged out, and in private browsing mode. This helps detect restrictions invisible to the account owner.'
        },
        'historical': {
            icon: '📊',
            title: 'Historical Data',
            content: 'For Pro users, we track accounts over time to establish engagement baselines. Sudden drops in reach, engagement anomalies, or visibility changes are flagged. Free users don\'t have historical tracking—upgrade to Pro for this feature.'
        },
        'hashtag-db': {
            icon: '#️⃣',
            title: 'Hashtag Database',
            content: 'Our database contains 1,800+ banned and restricted hashtags across all major platforms. We cross-reference your content against this database and verify restrictions in real-time. Note: Reddit doesn\'t use hashtags.'
        },
        'ip-analysis': {
            icon: '🌐',
            title: 'IP Analysis',
            content: 'We analyze YOUR connection to detect VPN, proxy, or datacenter usage. Platforms may treat content differently based on IP reputation. This is why you should only check your own content—checking others uses the wrong IP.'
        }
    };
    
    const data = factorData[factorId];
    if (!data) return;
    
    const modal = document.getElementById('factor-info-modal');
    if (!modal) return;
    
    const iconEl = document.getElementById('factor-modal-icon');
    const titleEl = document.getElementById('factor-modal-title');
    const bodyEl = document.getElementById('factor-modal-body');
    
    if (iconEl) iconEl.textContent = data.icon;
    if (titleEl) titleEl.textContent = data.title;
    if (bodyEl) bodyEl.innerHTML = `<p>${data.content}</p>`;
    
    openModal('factor-info-modal');
}

function showAudienceInfo(audience) {
    const audienceData = {
        'influencer': {
            icon: '📱',
            title: 'Why This Matters for Influencers',
            content: '<p>Your income depends on reach. When engagement suddenly drops, it\'s not always your content—platforms can silently limit your visibility without telling you.</p><p>Our 5-Factor Engine helps you:</p><ul><li>Detect hidden restrictions before sponsors notice</li><li>Identify which signals are affecting your reach</li><li>Take action to restore visibility</li></ul>'
        },
        'politician': {
            icon: '🗳️',
            title: 'Why This Matters for Politicians',
            content: '<p>Your ability to communicate with constituents depends on platform visibility. Shadow bans can silently suppress your message during critical times.</p><p>Our 5-Factor Engine helps you:</p><ul><li>Verify your posts reach your audience</li><li>Document potential suppression for transparency</li><li>Maintain accountability with citable results</li></ul>'
        },
        'public-figure': {
            icon: '⭐',
            title: 'Why This Matters for Public Figures',
            content: '<p>Actors, athletes, royalty—your public image relies on social media reach. Hidden restrictions can damage your brand without your knowledge.</p><p>Our 5-Factor Engine helps you:</p><ul><li>Monitor visibility across platforms</li><li>Get alerts when restrictions are detected</li><li>Maintain your public presence</li></ul>'
        },
        'agency': {
            icon: '🏛️',
            title: 'Why This Matters for Agencies & Brands',
            content: '<p>Whether you\'re a government agency or a PR firm, your communications need to reach their intended audience.</p><p>Our 5-Factor Engine helps you:</p><ul><li>Monitor multiple client accounts</li><li>Get proactive alerts on restrictions</li><li>Generate reports for stakeholders</li></ul>'
        }
    };
    
    const data = audienceData[audience];
    if (!data) return;
    
    const modal = document.getElementById('audience-modal');
    if (!modal) return;
    
    const iconEl = document.getElementById('audience-modal-icon');
    const titleEl = document.getElementById('audience-modal-title');
    const bodyEl = document.getElementById('audience-modal-body');
    
    if (iconEl) iconEl.textContent = data.icon;
    if (titleEl) titleEl.textContent = data.title;
    if (bodyEl) bodyEl.innerHTML = data.content;
    
    openModal('audience-modal');
}

// ============================================
// IP DETECTION
// ============================================
function detectUserIP() {
    const ipElement = document.getElementById('user-ip-address');
    const ipTypeElement = document.getElementById('user-ip-type');
    const ipFlagElement = document.getElementById('user-ip-flag');
    
    if (!ipElement) return;
    
    // Use demo data for now
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
    } else {
        ipElement.textContent = '192.168.1.42';
        if (ipTypeElement) {
            ipTypeElement.textContent = 'Residential';
            ipTypeElement.className = 'ip-type good';
        }
        if (ipFlagElement) {
            ipFlagElement.textContent = '🇺🇸';
        }
    }
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'info') {
    // Try global toast first
    if (window.showToast && typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Fallback to local toast
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
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
