/* =============================================================================
   INDEX.JS - Home Page Functionality + 5-Factor Engine Loader
   ShadowBanCheck.io
   
   This file combines:
   1. Home page UI functionality (forms, modals, animations)
   2. 5-Factor Engine initialization and status checking
   ============================================================================= */

(function() {
'use strict';

let initialized = false;
let currentPlatform = null;
let engagementStepsCompleted = { follow: false, like: false, retweet: false, reply: false };

// ============================================================================
// 5-FACTOR ENGINE LOADER
// ============================================================================

const FiveFactorLoader = {
    
    requiredGlobals: {
        databases: [
            'FlaggedContent',
            'FlaggedHashtags',
            'FlaggedMentions',
            'FlaggedEmojis',
            'FlaggedImages',
            'FlaggedVideos',
            'FlaggedAudio'
        ],
        platforms: [
            'PlatformBase',
            'PlatformFactory',
            'TwitterPlatform',
            'RedditPlatform'
        ],
        agents: [
            'AgentBase',
            'AgentRegistry',
            'PlatformAPIAgent',
            'WebAnalysisAgent',
            'HistoricalAgent',
            'DetectionAgent',
            'PredictiveAgent'
        ],
        engine: [
            'FiveFactorEngine',
            'shadowBanEngine'
        ],
        api: [
            'DetectionAPI',
            'detectionAPI'
        ]
    },
    
    /**
     * Check if all required modules are loaded
     * @returns {object} Status of all modules
     */
    checkStatus: function() {
        const status = {
            databases: {},
            platforms: {},
            agents: {},
            engine: {},
            api: {},
            allLoaded: true,
            missing: [],
            loadedCount: 0,
            totalCount: 0
        };
        
        for (const [category, globals] of Object.entries(this.requiredGlobals)) {
            for (const name of globals) {
                status.totalCount++;
                const loaded = !!window[name];
                status[category][name] = loaded;
                if (loaded) {
                    status.loadedCount++;
                } else {
                    status.allLoaded = false;
                    status.missing.push(name);
                }
            }
        }
        
        return status;
    },
    
    /**
     * Print status to console
     */
    printStatus: function() {
        const status = this.checkStatus();
        
        console.log('='.repeat(60));
        console.log('5-FACTOR ENGINE STATUS');
        console.log('='.repeat(60));
        
        for (const [category, modules] of Object.entries(status)) {
            if (typeof modules === 'object' && !Array.isArray(modules) && category !== 'missing') {
                console.log(`\n📦 ${category.toUpperCase()}:`);
                for (const [name, loaded] of Object.entries(modules)) {
                    console.log(`   ${loaded ? '✅' : '❌'} ${name}`);
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`Loaded: ${status.loadedCount}/${status.totalCount} modules`);
        if (status.allLoaded) {
            console.log('✅ ALL MODULES LOADED - Engine ready!');
        } else {
            console.log('❌ MISSING MODULES:', status.missing.join(', '));
        }
        console.log('='.repeat(60));
        
        return status;
    },
    
    /**
     * Wait for all modules to load
     * @param {number} timeout - Max wait time in ms
     * @returns {Promise<boolean>} True if all loaded
     */
    waitForLoad: function(timeout = 5000) {
        return new Promise((resolve) => {
            const start = Date.now();
            
            const check = () => {
                const status = this.checkStatus();
                if (status.allLoaded) {
                    console.log('✅ All 5-Factor Engine modules loaded');
                    resolve(true);
                } else if (Date.now() - start > timeout) {
                    console.warn('⚠️ Timeout waiting for modules:', status.missing);
                    resolve(false);
                } else {
                    setTimeout(check, 100);
                }
            };
            
            check();
        });
    },
    
    /**
     * Initialize engine with options
     * @param {object} options - { demoMode: boolean }
     */
    initEngine: function(options = {}) {
        const status = this.checkStatus();
        
        if (!status.allLoaded) {
            console.warn('⚠️ Cannot initialize engine - missing modules:', status.missing);
            return false;
        }
        
        // Set demo mode if specified
        if (options.demoMode !== undefined && window.shadowBanEngine) {
            window.shadowBanEngine.setDemoMode(options.demoMode);
        }
        
        console.log('✅ 5-Factor Engine initialized');
        return true;
    },
    
    /**
     * Check if engine is available for use
     * @returns {boolean}
     */
    isEngineReady: function() {
        return !!(window.shadowBanEngine && window.powerCheck);
    },
    
    /**
     * Get quick status for UI display
     * @returns {object} { ready, loadedCount, totalCount }
     */
    getQuickStatus: function() {
        const status = this.checkStatus();
        return {
            ready: status.allLoaded,
            loadedCount: status.loadedCount,
            totalCount: status.totalCount,
            percentage: Math.round((status.loadedCount / status.totalCount) * 100)
        };
    }
};

// Export loader globally
window.FiveFactorLoader = FiveFactorLoader;

// ============================================
// INITIALIZATION
// ============================================
function init() {
    if (initialized) return;
    
    // Wait for platformData
    if (!window.platformData || !Array.isArray(window.platformData)) {
        console.log('⏳ index.js waiting for platformData...');
        setTimeout(init, 50);
        return;
    }
    
    initialized = true;
    console.log('🚀 Index.js initializing...');
    
    setupEventListeners();
    populatePlatformGrid();
    populatePlatformIcons();
    updateContentAnalysisDisplay();
    
    // Check 5-Factor Engine status (non-blocking)
    const engineStatus = FiveFactorLoader.getQuickStatus();
    if (engineStatus.ready) {
        console.log('✅ 5-Factor Engine ready');
    } else {
        console.log(`⏳ 5-Factor Engine: ${engineStatus.loadedCount}/${engineStatus.totalCount} modules loaded`);
    }
    
    console.log('✅ Index.js initialized');
}

// Multiple init triggers
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('platformsReady', init);
setTimeout(init, 100);
setTimeout(init, 300);

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Power Check Form
    const powerForm = document.getElementById('power-check-form');
    const powerUrlInput = document.getElementById('power-url-input');
    
    if (powerUrlInput) {
        powerUrlInput.addEventListener('input', handleUrlInput);
        powerUrlInput.addEventListener('paste', () => setTimeout(handleUrlInput, 50));
    }
    
    if (powerForm) {
        powerForm.addEventListener('submit', handlePowerCheckSubmit);
    }
    
    // Engagement test
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
    
    // Info buttons
    const powerInfoBtn = document.getElementById('power-info-btn');
    if (powerInfoBtn) {
        powerInfoBtn.addEventListener('click', () => openModal('power-info-modal'));
    }
    
    const aiInfoBtn = document.getElementById('ai-info-btn');
    if (aiInfoBtn) {
        aiInfoBtn.addEventListener('click', () => openModal('ai-info-modal'));
    }
    
    const tryAiBtn = document.getElementById('try-ai-btn');
    if (tryAiBtn) {
        tryAiBtn.addEventListener('click', () => {
            if (typeof window.openShadowAI === 'function') {
                window.openShadowAI();
            } else {
                showToast('Shadow AI coming soon!', 'info');
            }
        });
    }
    
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
    
    // Factor info buttons (Under the Hood section)
    document.querySelectorAll('.factor-compact-info').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const factor = e.target.closest('.engine-factor-compact');
            if (factor && factor.dataset.factor) {
                showFactorInfo(factor.dataset.factor);
            }
        });
    });
    
    // Audience info buttons
    document.querySelectorAll('.audience-info-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const audience = e.target.closest('.audience-info-btn').dataset.audience;
            if (audience) showAudienceInfo(audience);
        });
    });
    
    // Share buttons
    setupShareButtons();
}

// ============================================
// CONTENT ANALYSIS DISPLAY (Replaces IP Display)
// ============================================
function updateContentAnalysisDisplay() {
    const statusEl = document.getElementById('content-analysis-status');
    if (statusEl) {
        statusEl.textContent = 'Ready to scan post content & links';
    }
}

// ============================================
// URL INPUT & PLATFORM DETECTION
// ============================================
function handleUrlInput() {
    const powerUrlInput = document.getElementById('power-url-input');
    const url = powerUrlInput ? powerUrlInput.value.trim() : '';
    
    if (!url) {
        hidePlatformDetection();
        hideEngagementTest();
        currentPlatform = null;
        updateContentAnalysisDisplay();
        return;
    }
    
    // Try new platform detection first, fall back to old
    let platform = null;
    
    // New 5-Factor Engine platform detection
    if (window.PlatformFactory && typeof window.PlatformFactory.fromUrl === 'function') {
        const platformInstance = window.PlatformFactory.fromUrl(url);
        if (platformInstance) {
            // Map to old format for compatibility
            platform = {
                id: platformInstance.id,
                name: platformInstance.getName(),
                icon: platformInstance.getIcon(),
                status: 'live',
                supports: {
                    hashtagCheck: true,
                    engagementTest: platformInstance.id === 'twitter'
                },
                engagementTest: { enabled: platformInstance.id === 'twitter' }
            };
        }
    }
    
    // Fall back to old detection
    if (!platform && window.detectPlatformFromUrl) {
        platform = window.detectPlatformFromUrl(url);
    }
    
    console.log('🔍 URL detection:', url.substring(0, 50), '→', platform ? platform.name : 'none');
    
    if (platform) {
        currentPlatform = platform;
        showPlatformDetection(platform);
        updateChecksPreview(platform);
        
        // Update content analysis status
        const statusEl = document.getElementById('content-analysis-status');
        if (statusEl) {
            statusEl.textContent = `Will analyze ${platform.name} post content, links & bio`;
        }
        
        // Show engagement test for Twitter
        if (platform.id === 'twitter' && 
            platform.supports && platform.supports.engagementTest && 
            platform.engagementTest && platform.engagementTest.enabled) {
            showEngagementTest();
        } else {
            hideEngagementTest();
        }
    } else {
        hidePlatformDetection();
        hideEngagementTest();
        currentPlatform = null;
        updateContentAnalysisDisplay();
    }
}

function showPlatformDetection(platform) {
    const platformDetected = document.getElementById('platform-detected');
    if (!platformDetected || !platform) return;
    
    platformDetected.classList.remove('hidden');
    
    const icon = document.getElementById('detected-platform-icon');
    const name = document.getElementById('detected-platform-name');
    const note = document.getElementById('platform-detected-note');
    
    if (icon) icon.textContent = platform.icon;
    if (name) name.textContent = platform.name;
    
    if (note) {
        if (platform.id === 'reddit') {
            note.textContent = 'Reddit does not use hashtags — hashtag analysis will be skipped.';
            note.classList.remove('hidden');
        } else if (platform.messages && platform.messages.platformNote) {
            note.textContent = platform.messages.platformNote;
            note.classList.remove('hidden');
        } else {
            note.classList.add('hidden');
        }
    }
}

function hidePlatformDetection() {
    const el = document.getElementById('platform-detected');
    if (el) el.classList.add('hidden');
}

function updateChecksPreview(platform) {
    const previewHashtag = document.getElementById('preview-hashtag');
    if (!previewHashtag || !platform) return;
    
    const statusEl = previewHashtag.querySelector('.preview-status');
    if (!statusEl) return;
    
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
    const el = document.getElementById('engagement-test-section');
    if (el) el.classList.remove('hidden');
}

function hideEngagementTest() {
    const el = document.getElementById('engagement-test-section');
    if (el) el.classList.add('hidden');
    resetEngagementSteps();
}

function resetEngagementSteps() {
    engagementStepsCompleted = { follow: false, like: false, retweet: false, reply: false };
    document.querySelectorAll('.engagement-checkbox').forEach(cb => cb.checked = false);
    const ec = document.getElementById('engagement-confirmed');
    if (ec) ec.checked = false;
    updateEngagementProgress();
}

function handleEngagementCheckboxChange(e) {
    const step = e.target.id.replace('step-', '');
    engagementStepsCompleted[step] = e.target.checked;
    updateEngagementProgress();
}

function updateEngagementProgress() {
    const completed = Object.values(engagementStepsCompleted).filter(v => v).length;
    const percentage = (completed / 4) * 100;
    
    const fill = document.getElementById('engagement-progress-fill');
    const text = document.getElementById('engagement-progress-text');
    
    if (fill) fill.style.width = `${percentage}%`;
    if (text) text.textContent = `${completed} of 4 steps completed`;
}

function handleEngagementConfirmed(e) {
    if (e.target.checked) {
        // User confirmed they completed steps
        console.log('Engagement confirmed');
    }
}

function handleSkipEngagement() {
    hideEngagementTest();
    runAnalysis(false);
}

// ============================================
// FORM SUBMISSION & ANALYSIS
// ============================================
function handlePowerCheckSubmit(e) {
    e.preventDefault();
    
    const powerUrlInput = document.getElementById('power-url-input');
    const url = powerUrlInput ? powerUrlInput.value.trim() : '';
    
    if (!url) {
        showToast('Please enter a post URL', 'warning');
        return;
    }
    
    if (!currentPlatform) {
        showToast('Could not detect platform. Please check the URL.', 'warning');
        return;
    }
    
    if (currentPlatform.status !== 'live') {
        showToast(`${currentPlatform.name} is coming soon!`, 'info');
        return;
    }
    
    // Check if engagement test is visible and confirmed
    const engagementSection = document.getElementById('engagement-test-section');
    const engagementConfirmed = document.getElementById('engagement-confirmed');
    const withEngagement = engagementSection && 
                          !engagementSection.classList.contains('hidden') && 
                          engagementConfirmed && 
                          engagementConfirmed.checked;
    
    runAnalysis(withEngagement);
}

function runAnalysis(withEngagement) {
    // Show engine animation
    const engineAnimation = document.getElementById('engine-animation');
    const powerCheckCard = document.getElementById('power-check-card');
    
    if (powerCheckCard) powerCheckCard.classList.add('hidden');
    if (engineAnimation) engineAnimation.classList.remove('hidden');
    
    // Run animation
    runEngineAnimation();
    
    // Check if new 5-Factor Engine is available
    if (FiveFactorLoader.isEngineReady()) {
        console.log('🚀 Using 5-Factor Engine for analysis');
        runFiveFactorAnalysis(withEngagement);
    } else {
        console.log('📊 Using demo data for analysis');
        simulateAnalysis(withEngagement);
    }
}

/**
 * Run analysis using the new 5-Factor Engine
 */
async function runFiveFactorAnalysis(withEngagement) {
    const powerUrlInput = document.getElementById('power-url-input');
    const url = powerUrlInput ? powerUrlInput.value.trim() : '';
    
    try {
        // Use the new engine
        const result = await window.powerCheck(url);
        
        // Add engagement data
        result.withEngagement = withEngagement;
        result.engagementSteps = { ...engagementStepsCompleted };
        result.checkType = 'power';
        result.factorsUsed = 5;
        
        // Store result
        sessionStorage.setItem('lastAnalysisResult', JSON.stringify(result));
        
        // Navigate to results
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        window.location.href = `results.html?platform=${platformId}&type=power&engine=5factor`;
        
    } catch (error) {
        console.error('5-Factor Engine error:', error);
        showToast('Analysis failed. Please try again.', 'error');
        
        // Fall back to demo
        simulateAnalysis(withEngagement);
    }
}

function runEngineAnimation() {
    const terminalOutput = document.getElementById('terminal-output');
    if (terminalOutput) terminalOutput.innerHTML = '';
    
    const platform = currentPlatform || { id: 'twitter', name: 'Twitter/X' };
    const isReddit = platform.id === 'reddit';
    
    // Updated terminal lines - Content & Links instead of IP
    const lines = [
        { text: `> Initializing 5-Factor Detection Engine...`, delay: 0 },
        { text: `> Target platform: ${platform.name}`, delay: 400 },
        { text: `> Connecting to platform API...`, delay: 800 },
        { text: `> Querying account status...`, delay: 1200 },
        { text: `> Running web visibility tests (U.S. servers)...`, delay: 1800 },
        { text: `> Analyzing historical patterns...`, delay: 2400 },
        { text: isReddit ? `> Hashtag check: N/A (Reddit)` : `> Scanning hashtag database...`, delay: 2800 },
        { text: `> Analyzing content & links...`, delay: 3200 },
        { text: `> Scanning bio for flagged words...`, delay: 3400 },
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
    
    // Factor progress - 5 factors for Power Check (Content & Links replaces IP)
    const factors = [
        { id: 'factor-1-progress', delay: 1000, status: 'complete' },
        { id: 'factor-2-progress', delay: 2000, status: 'complete' },
        { id: 'factor-3-progress', delay: 2600, status: 'complete' },
        { id: 'factor-4-progress', delay: 3000, status: isReddit ? 'na' : 'complete' },
        { id: 'factor-5-progress', delay: 3800, status: 'complete' }, // Content & Links
    ];
    
    factors.forEach(factor => {
        setTimeout(() => {
            const el = document.getElementById(factor.id);
            if (el) {
                const status = el.querySelector('.factor-status');
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
        
        const aiMessages = ['Cross-referencing signals...', 'Analyzing content patterns...', 'Calculating probability weights...', 'Generating final score...'];
        const aiMessageEl = document.getElementById('ai-processing-message');
        
        aiMessages.forEach((msg, i) => {
            setTimeout(() => {
                if (aiMessageEl) aiMessageEl.textContent = msg;
            }, i * 600);
        });
    }, 4200);
}

function simulateAnalysis(withEngagement) {
    setTimeout(() => {
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        const demoResult = window.DemoData ? window.DemoData.getResult(platformId, 'powerCheck') : null;
        
        if (demoResult) {
            demoResult.withEngagement = withEngagement;
            demoResult.engagementSteps = { ...engagementStepsCompleted };
            demoResult.checkType = 'power';
            demoResult.factorsUsed = 5;
            sessionStorage.setItem('lastAnalysisResult', JSON.stringify(demoResult));
        }
        
        window.location.href = `results.html?platform=${platformId}&type=power&demo=true`;
    }, 6000);
}

// ============================================
// PLATFORM GRID - Uses .platform-item CSS class
// ============================================
function populatePlatformGrid() {
    const platformGrid = document.getElementById('platform-grid');
    if (!platformGrid || !window.platformData) {
        console.log('⚠️ Cannot populate platform grid - missing element or data');
        return;
    }
    
    let html = '';
    
    window.platformData.forEach(platform => {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const statusText = platform.status === 'live' ? 'Live' : 'Soon';
        
        // Using .platform-item class to match CSS
        html += `
            <div class="platform-item" data-status="${platform.status}" data-platform="${platform.id}">
                <span class="platform-icon">${platform.icon}</span>
                <span class="platform-name">${platform.name}</span>
                <span class="platform-badge ${statusClass}">${statusText}</span>
            </div>
        `;
    });
    
    // Suggest platform card
    html += `
        <div class="platform-item" data-action="suggest">
            <span class="platform-icon">💡</span>
            <span class="platform-name">Suggest</span>
            <span class="platform-badge">Request</span>
        </div>
    `;
    
    platformGrid.innerHTML = html;
    console.log('✅ Platform grid populated with', window.platformData.length, 'platforms');
    
    // Add click handlers
    platformGrid.querySelectorAll('.platform-item').forEach(item => {
        item.addEventListener('click', () => {
            const platformId = item.dataset.platform;
            const action = item.dataset.action;
            
            if (action === 'suggest') {
                const contact = document.getElementById('contact');
                if (contact) contact.scrollIntoView({ behavior: 'smooth' });
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
    const container = document.getElementById('power-platform-icons');
    if (!container || !window.platformData) return;
    
    let html = '';
    
    window.platformData.forEach(platform => {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const title = platform.status === 'soon' ? `${platform.name} (Coming Soon)` : platform.name;
        html += `<span class="platform-chip ${statusClass}" title="${title}" data-platform="${platform.id}">${platform.icon}</span>`;
    });
    
    container.innerHTML = html;
    console.log('✅ Platform icons populated');
    
    // Add click handlers
    container.querySelectorAll('.platform-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const platformId = chip.dataset.platform;
            const platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
            if (platform) showPlatformModal(platform);
        });
    });
}

// ============================================
// MODALS
// ============================================
function showPlatformModal(platform) {
    const modal = document.getElementById('platform-modal');
    if (!modal || !platform) return;
    
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalStatus = document.getElementById('modal-status');
    const modalBody = document.getElementById('modal-body');
    
    if (modalIcon) modalIcon.textContent = platform.icon;
    if (modalTitle) modalTitle.textContent = `${platform.name} Analysis`;
    
    if (modalStatus) {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const statusText = platform.status === 'live' ? 'Live' : 'Coming Soon';
        modalStatus.innerHTML = `<span class="status-badge ${statusClass}">● ${statusText}</span>`;
    }
    
    // Build checks list
    let checksHtml = '<h4>Signals We Analyze:</h4><ul class="check-list">';
    
    const checks = platform.accountChecks && platform.accountChecks.length > 0 
        ? platform.accountChecks 
        : ['Account visibility analysis', 'Search presence detection', 'Profile accessibility'];
    
    checks.forEach(check => {
        checksHtml += `<li>${check}</li>`;
    });
    checksHtml += '</ul>';
    
    if (platform.messages && platform.messages.platformNote) {
        checksHtml += `<p style="margin-top: var(--space-md); padding: var(--space-md); background: rgba(99, 102, 241, 0.1); border-radius: var(--radius-md);">💡 ${platform.messages.platformNote}</p>`;
    }
    
    if (modalBody) modalBody.innerHTML = checksHtml;
    
    openModal('platform-modal');
}

function showFactorInfo(factorType) {
    // Updated factor data - Content & Links replaces IP
    const factorData = {
        'platform-api': { icon: '🔌', title: 'Platform APIs', desc: 'Direct integration with official platform APIs. We query account status, visibility flags, and restriction indicators.' },
        'web-analysis': { icon: '🔍', title: 'Web Analysis', desc: 'Automated browser testing from U.S. servers. We check search visibility logged-in, logged-out, and in private mode.' },
        'historical': { icon: '📊', title: 'Historical Data', desc: 'We track accounts over time to detect anomalies. Sudden engagement drops affect probability. Pro only for tracking.' },
        'hashtag-db': { icon: '#️⃣', title: 'Hashtag Database', desc: '1,800+ banned and restricted hashtags updated daily. We verify restrictions in real-time.' },
        'content-links': { icon: '📝', title: 'Content & Links', desc: 'We scan post text, bio content, and links for flagged words, suspicious domains, and patterns that trigger platform filters.' },
    };
    
    const data = factorData[factorType];
    if (!data) return;
    
    const modal = document.getElementById('factor-info-modal');
    if (!modal) return;
    
    const icon = document.getElementById('factor-modal-icon');
    const title = document.getElementById('factor-modal-title');
    const body = document.getElementById('factor-modal-body');
    
    if (icon) icon.textContent = data.icon;
    if (title) title.textContent = data.title;
    if (body) body.innerHTML = `<p>${data.desc}</p>`;
    
    openModal('factor-info-modal');
}

function showAudienceInfo(audience) {
    const audienceData = {
        'influencer': { icon: '📱', title: 'For Influencers & Creators', content: 'When engagement suddenly drops, you need to know if it\'s the algorithm or a shadow ban. Our probability score helps you diagnose the issue and take action.' },
        'politician': { icon: '🗳️', title: 'For Politicians & Officials', content: 'Your constituents need to hear from you. We analyze your visibility across platforms to ensure your message isn\'t being suppressed.' },
        'public-figure': { icon: '⭐', title: 'For Public Figures', content: 'Actors, athletes, royalty—when millions follow you, any reduction in reach matters. We help you verify your content is being seen.' },
        'agency': { icon: '🏛️', title: 'For Agencies & Brands', content: 'Manage multiple client accounts with our Agency plan. Track visibility across all clients and get alerts when issues arise.' },
    };
    
    const data = audienceData[audience];
    if (!data) return;
    
    const modal = document.getElementById('audience-modal');
    if (!modal) return;
    
    const icon = document.getElementById('audience-modal-icon');
    const title = document.getElementById('audience-modal-title');
    const body = document.getElementById('audience-modal-body');
    
    if (icon) icon.textContent = data.icon;
    if (title) title.textContent = data.title;
    if (body) body.innerHTML = `<p>${data.content}</p>`;
    
    openModal('audience-modal');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn('Modal not found:', modalId);
        return;
    }
    
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

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Make closeModal globally accessible
window.closeModal = closeModal;

// ============================================
// SHARE BUTTONS
// ============================================
function setupShareButtons() {
    const shareTwitter = document.getElementById('share-twitter');
    const shareFacebook = document.getElementById('share-facebook');
    const shareTelegram = document.getElementById('share-telegram');
    const shareLinkedIn = document.getElementById('share-linkedin');
    
    const shareUrl = encodeURIComponent('https://shadowbancheck.io');
    const shareText = encodeURIComponent('Calculate your shadow ban probability with this free tool!');
    
    if (shareTwitter) {
        shareTwitter.addEventListener('click', () => {
            window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`, '_blank');
        });
    }
    if (shareFacebook) {
        shareFacebook.addEventListener('click', () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
        });
    }
    if (shareTelegram) {
        shareTelegram.addEventListener('click', () => {
            window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, '_blank');
        });
    }
    if (shareLinkedIn) {
        shareLinkedIn.addEventListener('click', () => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
        });
    }
}

// ============================================
// TOAST HELPER
// ============================================
function showToast(message, type) {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log('Toast:', message, type);
    }
}

// ============================================
// CONSOLE HELPER - Check engine status
// ============================================
console.log('💡 Tip: Run FiveFactorLoader.printStatus() to check engine modules');

})();
