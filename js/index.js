/* =============================================================================
   INDEX.JS - Home Page Functionality + Detection Agent Loader
   ShadowBanCheck.io
   
   3-Point Intelligence Model: Predictive (15%) + Real-Time (55%) + Historical (30%)
   Powered by 5 Specialized Detection Agents with 21 Detection Modules
   ============================================================================= */

(function() {
'use strict';

let initialized = false;
let currentPlatform = null;

// ============================================================================
// DETECTION AGENT LOADER
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
        
        console.log('═'.repeat(60));
        console.log('3-POINT INTELLIGENCE MODEL STATUS');
        console.log('Powered by 5 Specialized Detection Agents');
        console.log('═'.repeat(60));
        
        for (const [category, modules] of Object.entries(status)) {
            if (typeof modules === 'object' && !Array.isArray(modules) && category !== 'missing') {
                console.log(`\n📦 ${category.toUpperCase()}:`);
                for (const [name, loaded] of Object.entries(modules)) {
                    console.log(`   ${loaded ? '✅' : '❌'} ${name}`);
                }
            }
        }
        
        console.log('\n' + '═'.repeat(60));
        console.log(`Loaded: ${status.loadedCount}/${status.totalCount} modules`);
        if (status.allLoaded) {
            console.log('✅ ALL AGENTS DEPLOYED - System operational');
        } else {
            console.log('❌ MISSING MODULES:', status.missing.join(', '));
        }
        console.log('═'.repeat(60));
        
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
                    console.log('✅ All Detection Agents deployed');
                    resolve(true);
                } else if (Date.now() - start > timeout) {
                    console.warn('⚠️ Timeout waiting for agents:', status.missing);
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
            console.warn('⚠️ Cannot initialize - missing modules:', status.missing);
            return false;
        }
        
        // Set demo mode if specified
        if (options.demoMode !== undefined && window.shadowBanEngine) {
            window.shadowBanEngine.setDemoMode(options.demoMode);
        }
        
        console.log('✅ 5 Detection Agents initialized');
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
    
    // Check Detection Agents status (non-blocking)
    const agentStatus = FiveFactorLoader.getQuickStatus();
    if (agentStatus.ready) {
        console.log('✅ 5 Detection Agents deployed');
    } else {
        console.log(`⏳ Detection Agents: ${agentStatus.loadedCount}/${agentStatus.totalCount} modules loaded`);
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
    
    // Agent info buttons (Under the Hood section)
    document.querySelectorAll('.factor-compact-info, .agent-info-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const factor = e.target.closest('.engine-factor-compact, .detection-agent');
            if (factor && (factor.dataset.factor || factor.dataset.agent)) {
                showAgentInfo(factor.dataset.factor || factor.dataset.agent);
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
// CONTENT ANALYSIS DISPLAY
// ============================================
function updateContentAnalysisDisplay() {
    const statusEl = document.getElementById('content-analysis-status');
    if (statusEl) {
        statusEl.textContent = '21 detection modules ready';
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
                }
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
        
        // Update content analysis status with module count
        const statusEl = document.getElementById('content-analysis-status');
        if (statusEl) {
            const moduleCount = window.getActiveModulesForPlatform ? window.getActiveModulesForPlatform(platform.id) : 21;
            statusEl.textContent = `${moduleCount} detection modules for ${platform.name}`;
        }
    } else {
        hidePlatformDetection();
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
    
    runAnalysis();
}

function runAnalysis() {
    // Show engine animation
    const engineAnimation = document.getElementById('engine-animation');
    const powerCheckCard = document.getElementById('power-check-card');
    
    if (powerCheckCard) powerCheckCard.classList.add('hidden');
    if (engineAnimation) engineAnimation.classList.remove('hidden');
    
    // Run animation
    runEngineAnimation();
    
    // Check if Detection Agents are available
    if (FiveFactorLoader.isEngineReady()) {
        console.log('🚀 Deploying 5 Specialized Detection Agents');
        runFiveFactorAnalysis();
    } else {
        console.log('📊 Using demo data for analysis');
        simulateAnalysis();
    }
}

/**
 * Run analysis using the 5 Specialized Detection Agents
 */
async function runFiveFactorAnalysis() {
    const powerUrlInput = document.getElementById('power-url-input');
    const url = powerUrlInput ? powerUrlInput.value.trim() : '';
    
    try {
        // Use the detection engine
        const result = await window.powerCheck(url);
        
        // Add metadata
        result.checkType = 'power';
        result.agentsUsed = 5;
        
        // Store result
        sessionStorage.setItem('lastAnalysisResult', JSON.stringify(result));
        
        // Navigate to results
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        window.location.href = `results.html?platform=${platformId}&type=power&engine=5factor`;
        
    } catch (error) {
        console.error('Detection Agent error:', error);
        showToast('Analysis failed. Please try again.', 'error');
        
        // Fall back to demo
        simulateAnalysis();
    }
}

function runEngineAnimation() {
    const terminalOutput = document.getElementById('terminal-output');
    if (terminalOutput) terminalOutput.innerHTML = '';
    
    const platform = currentPlatform || { id: 'twitter', name: 'Twitter/X' };
    const isReddit = platform.id === 'reddit';
    const moduleCount = window.getActiveModulesForPlatform ? window.getActiveModulesForPlatform(platform.id) : 21;
    
    // Terminal lines with new messaging
    const lines = [
        { text: `> Deploying 5 Specialized Detection Agents...`, delay: 0 },
        { text: `> Target platform: ${platform.name}`, delay: 400 },
        { text: `> API Agent: Connecting to platform...`, delay: 800 },
        { text: `> API Agent: Querying account status...`, delay: 1200 },
        { text: `> Web Analysis Agent: Testing search visibility...`, delay: 1800 },
        { text: `> Historical Agent: Analyzing patterns...`, delay: 2400 },
        { text: isReddit ? `> Detection Agent: Hashtag module skipped (N/A)` : `> Detection Agent: Scanning ${moduleCount} signal modules...`, delay: 2800 },
        { text: `> Detection Agent: Content & link analysis...`, delay: 3200 },
        { text: `> Predictive AI Agent: Calculating risk score...`, delay: 3600 },
        { text: `> Calculating 3-Point Intelligence Score...`, delay: 4000 },
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
    
    // Agent progress - 5 Specialized Detection Agents
    const agents = [
        { id: 'factor-1-progress', delay: 1000, status: 'complete' },  // API Agent
        { id: 'factor-2-progress', delay: 2000, status: 'complete' },  // Web Analysis Agent
        { id: 'factor-3-progress', delay: 2600, status: 'complete' },  // Historical Agent
        { id: 'factor-4-progress', delay: 3000, status: isReddit ? 'partial' : 'complete' }, // Detection Agent
        { id: 'factor-5-progress', delay: 3800, status: 'complete' },  // Predictive AI Agent
    ];
    
    agents.forEach(agent => {
        setTimeout(() => {
            const el = document.getElementById(agent.id);
            if (el) {
                const status = el.querySelector('.factor-status');
                if (status) {
                    if (agent.status === 'complete') {
                        status.textContent = '✓';
                        status.classList.remove('pending');
                        status.classList.add('complete');
                    } else if (agent.status === 'partial') {
                        status.textContent = '◐';
                        status.classList.remove('pending');
                        status.classList.add('partial');
                    } else {
                        status.textContent = '—';
                        status.classList.remove('pending');
                        status.classList.add('na');
                    }
                }
            }
        }, agent.delay);
    });
    
    // Phase 2: AI Analysis
    setTimeout(() => {
        const phase1 = document.getElementById('engine-phase-1');
        const phase2 = document.getElementById('engine-phase-2');
        if (phase1) phase1.classList.add('hidden');
        if (phase2) phase2.classList.remove('hidden');
        
        const aiMessages = [
            'Cross-referencing intelligence points...',
            'Analyzing signal patterns...',
            'Calculating confidence levels...',
            'Generating suppression probability...'
        ];
        const aiMessageEl = document.getElementById('ai-processing-message');
        
        aiMessages.forEach((msg, i) => {
            setTimeout(() => {
                if (aiMessageEl) aiMessageEl.textContent = msg;
            }, i * 600);
        });
    }, 4200);
}

function simulateAnalysis() {
    setTimeout(() => {
        const platformId = currentPlatform ? currentPlatform.id : 'twitter';
        const demoResult = window.DemoData ? window.DemoData.getResult(platformId, 'powerCheck') : null;
        
        if (demoResult) {
            demoResult.checkType = 'power';
            demoResult.agentsUsed = 5;
            sessionStorage.setItem('lastAnalysisResult', JSON.stringify(demoResult));
        }
        
        window.location.href = `results.html?platform=${platformId}&type=power&demo=true`;
    }, 6000);
}

// ============================================
// PLATFORM GRID
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
        const statusText = platform.status === 'live' ? 'Operational' : 'Coming Soon';
        modalStatus.innerHTML = `<span class="status-badge ${statusClass}">● ${statusText}</span>`;
    }
    
    // Build detection info
    let checksHtml = '<h4>Detection Capabilities:</h4><ul class="check-list">';
    
    const checks = platform.accountChecks && platform.accountChecks.length > 0 
        ? platform.accountChecks 
        : ['Account visibility analysis', 'Search presence detection', 'Profile accessibility verification'];
    
    checks.forEach(check => {
        checksHtml += `<li>${check}</li>`;
    });
    checksHtml += '</ul>';
    
    // Add module count
    const moduleCount = window.getActiveModulesForPlatform ? window.getActiveModulesForPlatform(platform.id) : 21;
    checksHtml += `<p style="margin-top: var(--space-md); color: var(--text-secondary);"><strong>${moduleCount}</strong> detection modules active for ${platform.name}</p>`;
    
    if (platform.messages && platform.messages.platformNote) {
        checksHtml += `<p style="margin-top: var(--space-md); padding: var(--space-md); background: rgba(99, 102, 241, 0.1); border-radius: var(--radius-md);">💡 ${platform.messages.platformNote}</p>`;
    }
    
    if (modalBody) modalBody.innerHTML = checksHtml;
    
    openModal('platform-modal');
}

function showAgentInfo(agentType) {
    // 5 Specialized Detection Agents data
    const agentData = {
        'platform-api': { 
            icon: '🔌', 
            title: 'API Agent', 
            weight: '20%',
            desc: 'Direct integration with platform APIs. Queries account status, visibility flags, restriction indicators, and verification status.' 
        },
        'web-analysis': { 
            icon: '🔍', 
            title: 'Web Analysis Agent', 
            weight: '20%',
            desc: 'Automated browser testing from U.S. servers. Tests search visibility across logged-in, logged-out, and private browsing contexts.' 
        },
        'historical': { 
            icon: '📊', 
            title: 'Historical Agent', 
            weight: '15%',
            desc: 'Pattern tracking over time. Detects engagement anomalies, sudden drops, and historical restriction patterns. Pro tier enables tracking.' 
        },
        'hashtag-db': { 
            icon: '🎯', 
            title: 'Detection Agent', 
            weight: '25%',
            desc: '21 detection modules across 6 signal types: hashtags, cashtags, links, content, mentions, and emojis. Real-time database with 1,800+ flagged entries.' 
        },
        'content-links': { 
            icon: '🤖', 
            title: 'Predictive AI Agent', 
            weight: '20%',
            desc: 'Machine learning-based risk scoring. Analyzes content patterns, predicts suppression likelihood, and provides confidence assessments.' 
        },
        // Aliases for different naming conventions
        'api': { icon: '🔌', title: 'API Agent', weight: '20%', desc: 'Direct integration with platform APIs for account status and visibility data.' },
        'web': { icon: '🔍', title: 'Web Analysis Agent', weight: '20%', desc: 'Browser-based search visibility testing across multiple contexts.' },
        'detection': { icon: '🎯', title: 'Detection Agent', weight: '25%', desc: '21 modules across hashtags, cashtags, links, content, mentions, and emojis.' },
        'predictive': { icon: '🤖', title: 'Predictive AI Agent', weight: '20%', desc: 'ML-based risk scoring and suppression probability calculation.' },
    };
    
    const data = agentData[agentType];
    if (!data) return;
    
    const modal = document.getElementById('factor-info-modal');
    if (!modal) return;
    
    const icon = document.getElementById('factor-modal-icon');
    const title = document.getElementById('factor-modal-title');
    const body = document.getElementById('factor-modal-body');
    
    if (icon) icon.textContent = data.icon;
    if (title) title.textContent = `${data.title} (${data.weight})`;
    if (body) body.innerHTML = `<p>${data.desc}</p>`;
    
    openModal('factor-info-modal');
}

function showAudienceInfo(audience) {
    const audienceData = {
        'influencer': { 
            icon: '📱', 
            title: 'For Influencers & Creators', 
            content: 'When engagement suddenly drops, you need intelligence—not guesswork. Our 3-Point Intelligence Model analyzes your visibility across 21 signal types to identify exactly what triggered the suppression.' 
        },
        'politician': { 
            icon: '🗳️', 
            title: 'For Politicians & Officials', 
            content: 'Your constituents need to hear from you. Our Detection Agents monitor your visibility across platforms to ensure your message reaches your audience without algorithmic interference.' 
        },
        'public-figure': { 
            icon: '⭐', 
            title: 'For Public Figures', 
            content: 'When millions follow you, any reduction in reach matters. We provide the intelligence infrastructure to verify your content visibility and identify suppression patterns.' 
        },
        'agency': { 
            icon: '🏛️', 
            title: 'For Agencies & Brands', 
            content: 'Manage multiple client accounts with enterprise-grade detection. Track visibility across all accounts, receive automated alerts, and generate compliance reports.' 
        },
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
    const shareText = encodeURIComponent('Calculate your shadow ban probability with this intelligence platform!');
    
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
// CONSOLE HELPER
// ============================================
console.log('💡 Tip: Run FiveFactorLoader.printStatus() to check Detection Agent status');

})();
