/* =============================================================================
   MAIN.JS - SHARED FUNCTIONALITY
   ShadowBanCheck.io - Core shared utilities across all pages
   
   3-Point Intelligence Model: Predictive (15%) + Real-Time (55%) + Historical (30%)
   Powered by 5 Specialized Detection Agents
   ============================================================================= */

/* =============================================================================
   MOBILE NAV
   ============================================================================= */
function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');
    const navOverlay = document.getElementById('nav-overlay');
    
    if (!navToggle || !navMobile) return;
    
    function toggleNav() {
        navMobile.classList.toggle('active');
        navOverlay?.classList.toggle('active');
        navToggle.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    }
    
    function closeNav() {
        navMobile.classList.remove('active');
        navOverlay?.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.classList.remove('nav-open');
    }
    
    navToggle.addEventListener('click', toggleNav);
    navOverlay?.addEventListener('click', closeNav);
    document.getElementById('nav-close')?.addEventListener('click', closeNav);
    
    navMobile.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeNav);
    });
}

/* =============================================================================
   SCROLL REVEAL
   ============================================================================= */
function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* =============================================================================
   MODAL UTILITIES (Shared)
   ============================================================================= */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function initModalHandlers() {
    // Close on overlay click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
        
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Close on ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
            });
            document.body.style.overflow = '';
        }
    });
}

/* =============================================================================
   TOAST NOTIFICATION
   ============================================================================= */
function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Force reflow to restart animation
    toast.offsetHeight;
    
    toast.classList.add('visible');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('visible');
        toast.classList.remove('show');
    }, 3000);
}

/* =============================================================================
   COOKIE POPUP
   ============================================================================= */
function initCookiePopup() {
    const popup = document.getElementById('cookie-popup');
    const acceptBtn = document.getElementById('cookie-accept');
    const dismissBtn = document.getElementById('cookie-dismiss');
    
    if (!popup) return;
    
    // Check if already accepted
    const cookieAccepted = localStorage.getItem('cookiesAccepted');
    
    if (!cookieAccepted) {
        // Show popup after a short delay
        setTimeout(() => {
            popup.classList.add('show');
        }, 1500);
    }
    
    // Accept button
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            popup.classList.add('dismissed');
            setTimeout(() => {
                popup.classList.remove('show');
                popup.classList.remove('dismissed');
            }, 400);
        });
    }
    
    // Dismiss button
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            popup.classList.add('dismissed');
            setTimeout(() => {
                popup.classList.remove('show');
                popup.classList.remove('dismissed');
            }, 400);
        });
    }
}

/* =============================================================================
   FAQ ACCORDION
   ============================================================================= */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
}

/* =============================================================================
   UTILITIES
   ============================================================================= */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/* =============================================================================
   HEADER SCROLL EFFECT
   ============================================================================= */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* =============================================================================
   BACK TO TOP BUTTON
   ============================================================================= */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* =============================================================================
   DETECTION AGENT STATUS UTILITIES
   
   5 Specialized Detection Agents powering the 3-Point Intelligence Model
   Shows agent status and module health for UI display
   ============================================================================= */
const AgentStatus = {
    
    // 5 Specialized Detection Agents
    agents: [
        { id: 1, key: 'api', name: 'API Agent', weight: 20, icon: '🔌', description: 'Direct platform data access & account status' },
        { id: 2, key: 'web', name: 'Web Analysis Agent', weight: 20, icon: '🔍', description: 'Search visibility & accessibility testing' },
        { id: 3, key: 'historical', name: 'Historical Agent', weight: 15, icon: '📊', description: 'Pattern tracking & trend analysis' },
        { id: 4, key: 'detection', name: 'Detection Agent', weight: 25, icon: '🎯', description: '21 modules across 6 signal types' },
        { id: 5, key: 'predictive', name: 'Predictive AI Agent', weight: 20, icon: '🤖', description: 'ML-based risk scoring & forecasting' },
    ],
    
    // 3-Point Intelligence Model
    intelligencePoints: [
        { id: 'predictive', name: 'Predictive Intelligence', weight: 15, description: 'ML-based risk forecasting' },
        { id: 'realtime', name: 'Real-Time Detection', weight: 55, description: 'Live signal analysis' },
        { id: 'historical', name: 'Historical Analysis', weight: 30, description: 'Pattern tracking over time' }
    ],
    
    // 6 Signal Types with 21 Detection Modules
    signalTypes: [
        { id: 'hashtags', name: 'Hashtags', modules: 4, icon: '#️⃣' },
        { id: 'cashtags', name: 'Cashtags', modules: 3, icon: '💲' },
        { id: 'links', name: 'Links', modules: 4, icon: '🔗' },
        { id: 'content', name: 'Content', modules: 4, icon: '📝' },
        { id: 'mentions', name: 'Mentions', modules: 3, icon: '@' },
        { id: 'emojis', name: 'Emojis', modules: 3, icon: '😀' }
    ],
    
    totalModules: 21,
    
    /**
     * Check if detection system is fully loaded and ready
     * @returns {boolean}
     */
    isReady: function() {
        if (window.FiveFactorLoader && typeof window.FiveFactorLoader.isEngineReady === 'function') {
            return window.FiveFactorLoader.isEngineReady();
        }
        // Fallback: check for key globals
        return !!(window.FiveFactorEngine && window.powerCheck);
    },
    
    /**
     * Get quick status summary
     * @returns {Object} { ready, agentCount, modulesActive }
     */
    getQuickStatus: function() {
        if (window.FiveFactorLoader && typeof window.FiveFactorLoader.getQuickStatus === 'function') {
            const status = window.FiveFactorLoader.getQuickStatus();
            return {
                ready: status.ready,
                agentCount: status.ready ? 5 : Math.floor(status.loadedCount / 5),
                modulesActive: status.ready ? 21 : Math.floor(status.percentage * 0.21),
                percentage: status.percentage
            };
        }
        // Fallback
        const ready = this.isReady();
        return {
            ready: ready,
            agentCount: ready ? 5 : 0,
            modulesActive: ready ? 21 : 0,
            percentage: ready ? 100 : 0
        };
    },
    
    /**
     * Get detailed status of all agents
     * @returns {Object} Full status breakdown
     */
    getDetailedStatus: function() {
        if (window.FiveFactorLoader && typeof window.FiveFactorLoader.checkStatus === 'function') {
            return window.FiveFactorLoader.checkStatus();
        }
        // Fallback with basic checks
        return {
            databases: {
                FlaggedContent: !!window.FlaggedContent,
                FlaggedHashtags: !!window.FlaggedHashtags,
                FlaggedMentions: !!window.FlaggedMentions,
                FlaggedEmojis: !!window.FlaggedEmojis,
                FlaggedLinks: !!window.FlaggedLinks
            },
            platforms: {
                PlatformBase: !!window.PlatformBase,
                TwitterPlatform: !!window.TwitterPlatform,
                RedditPlatform: !!window.RedditPlatform,
                PlatformFactory: !!window.PlatformFactory
            },
            agents: {
                PlatformAPIAgent: !!window.PlatformAPIAgent,
                WebAnalysisAgent: !!window.WebAnalysisAgent,
                HistoricalAgent: !!window.HistoricalAgent,
                DetectionAgent: !!window.DetectionAgent,
                PredictiveAgent: !!window.PredictiveAgent
            },
            engine: {
                FiveFactorEngine: !!window.FiveFactorEngine
            },
            api: {
                powerCheck: !!window.powerCheck,
                checkAccount: !!window.checkAccount,
                checkTags: !!window.checkTags
            },
            allLoaded: this.isReady()
        };
    },
    
    /**
     * Get status of each agent (for UI display)
     * @param {string} platformId - Platform being checked
     * @param {string} checkType - 'power', 'account', or 'hashtag'
     * @returns {Array} Agent status objects for display
     */
    getAgentStatus: function(platformId = 'twitter', checkType = 'power') {
        const isReddit = platformId === 'reddit';
        const isHashtagCheck = checkType === 'hashtag' || checkType === 'tagCheck';
        const status = this.getDetailedStatus();
        
        return this.agents.map(agent => {
            let online = false;
            let applicable = true;
            let reason = '';
            
            switch(agent.key) {
                case 'api': // API Agent
                    online = status.agents?.PlatformAPIAgent && status.platforms?.PlatformFactory;
                    applicable = !isHashtagCheck;
                    reason = isHashtagCheck ? 'Not required for tag analysis' : (online ? 'Deployed' : 'Agent not loaded');
                    break;
                    
                case 'web': // Web Analysis Agent
                    online = status.agents?.WebAnalysisAgent;
                    reason = online ? 'Deployed' : 'Agent not loaded';
                    break;
                    
                case 'historical': // Historical Agent
                    online = status.agents?.HistoricalAgent;
                    reason = online ? 'Deployed (Demo mode)' : 'Agent not loaded';
                    break;
                    
                case 'detection': // Detection Agent
                    online = status.agents?.DetectionAgent && 
                             (status.databases?.FlaggedHashtags || status.databases?.FlaggedContent);
                    applicable = !isReddit || checkType !== 'hashtag';
                    reason = isReddit && checkType === 'hashtag' ? 'N/A for Reddit' : (online ? 'Deployed - 21 modules active' : 'Databases not loaded');
                    break;
                    
                case 'predictive': // Predictive AI Agent
                    online = status.agents?.PredictiveAgent;
                    reason = online ? 'Deployed' : 'Agent not loaded';
                    break;
            }
            
            return {
                ...agent,
                online: online,
                applicable: applicable,
                status: !applicable ? 'na' : (online ? 'online' : 'offline'),
                statusText: !applicable ? 'N/A' : (online ? 'Deployed' : 'Offline'),
                reason: reason
            };
        });
    },
    
    /**
     * Get active detection modules for a platform
     * @param {string} platformId
     * @returns {number} Number of active modules
     */
    getActiveModules: function(platformId = 'twitter') {
        if (window.getActiveModulesForPlatform) {
            return window.getActiveModulesForPlatform(platformId);
        }
        return this.totalModules;
    },
    
    /**
     * Get overall health percentage
     * @returns {number} 0-100
     */
    getHealthPercentage: function() {
        const agents = this.getAgentStatus();
        const applicable = agents.filter(a => a.applicable);
        const online = applicable.filter(a => a.online);
        
        if (applicable.length === 0) return 100;
        return Math.round((online.length / applicable.length) * 100);
    },
    
    /**
     * Get health status label
     * @returns {string} 'operational', 'degraded', 'offline'
     */
    getHealthLabel: function() {
        const pct = this.getHealthPercentage();
        if (pct >= 100) return 'operational';
        if (pct >= 60) return 'degraded';
        return 'offline';
    },
    
    /**
     * Get confidence level based on score
     * @param {number} confidence - 0-100
     * @returns {Object} { label, description, class }
     */
    getConfidenceLevel: function(confidence) {
        if (confidence >= 70) {
            return { label: 'High Confidence', description: '3+ sources corroborate', class: 'high' };
        }
        if (confidence >= 40) {
            return { label: 'Medium Confidence', description: '2 sources corroborate', class: 'medium' };
        }
        return { label: 'Low Confidence', description: 'Single source', class: 'low' };
    },
    
    /**
     * Generate HTML for agent status display
     * @param {string} platformId 
     * @param {string} checkType 
     * @returns {string} HTML string
     */
    renderStatusHTML: function(platformId = 'twitter', checkType = 'power') {
        const agents = this.getAgentStatus(platformId, checkType);
        const health = this.getHealthLabel();
        const healthPct = this.getHealthPercentage();
        const activeModules = this.getActiveModules(platformId);
        
        let html = `<div class="agent-status agent-status--${health}">`;
        html += `<div class="agent-status__header">`;
        html += `<span class="agent-status__title">5 Detection Agents</span>`;
        html += `<span class="agent-status__health agent-status__health--${health}">${healthPct === 100 ? 'All Deployed' : healthPct + '% Active'}</span>`;
        html += `</div>`;
        html += `<div class="agent-status__modules">${activeModules}/${this.totalModules} detection modules</div>`;
        html += `<div class="agent-status__agents">`;
        
        agents.forEach(agent => {
            const statusClass = agent.status === 'online' ? 'online' : 
                               (agent.status === 'na' ? 'na' : 'offline');
            const statusIcon = agent.status === 'online' ? '✓' : 
                              (agent.status === 'na' ? '○' : '✗');
            
            html += `
                <div class="detection-agent detection-agent--${statusClass}" title="${agent.reason}">
                    <span class="detection-agent__icon">${agent.icon}</span>
                    <span class="detection-agent__name">${agent.name}</span>
                    <span class="detection-agent__weight">${agent.weight}%</span>
                    <span class="detection-agent__status">${statusIcon}</span>
                </div>
            `;
        });
        
        html += `</div></div>`;
        return html;
    },
    
    /**
     * Render status into a DOM element
     * @param {string|Element} target - Selector or element
     * @param {string} platformId 
     * @param {string} checkType 
     */
    renderTo: function(target, platformId = 'twitter', checkType = 'power') {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (el) {
            el.innerHTML = this.renderStatusHTML(platformId, checkType);
        }
    },
    
    /**
     * Print status to console
     */
    printStatus: function() {
        if (window.FiveFactorLoader && typeof window.FiveFactorLoader.printStatus === 'function') {
            window.FiveFactorLoader.printStatus();
            return;
        }
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('   3-POINT INTELLIGENCE MODEL STATUS');
        console.log('   Powered by 5 Specialized Detection Agents');
        console.log('═══════════════════════════════════════════════════════');
        
        console.log('\n📊 Intelligence Points:');
        this.intelligencePoints.forEach(p => {
            console.log(`   ${p.name}: ${p.weight}% - ${p.description}`);
        });
        
        console.log('\n🤖 Detection Agents:');
        const agents = this.getAgentStatus();
        agents.forEach(a => {
            const icon = a.status === 'online' ? '✅' : (a.status === 'na' ? '⚪' : '❌');
            console.log(`   ${icon} ${a.name} (${a.weight}%) - ${a.statusText}`);
        });
        
        console.log('\n🎯 Signal Types (21 modules):');
        this.signalTypes.forEach(s => {
            console.log(`   ${s.icon} ${s.name}: ${s.modules} modules`);
        });
        
        console.log('\n───────────────────────────────────────────────────────');
        console.log(`System Health: ${this.getHealthPercentage()}% (${this.getHealthLabel()})`);
        console.log(`Agents Ready: ${this.isReady() ? 'Yes' : 'No'}`);
        console.log('═══════════════════════════════════════════════════════');
    },
    
    /**
     * Watch for agent load and call callback when ready
     * @param {Function} callback 
     * @param {number} timeout - Max wait time in ms
     */
    onReady: function(callback, timeout = 10000) {
        if (this.isReady()) {
            callback(true);
            return;
        }
        
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (this.isReady()) {
                clearInterval(checkInterval);
                callback(true);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                callback(false);
            }
        }, 100);
    }
};

/* =============================================================================
   PLATFORM HELPER FUNCTIONS (Fallbacks ONLY if platforms.js fails to load)
   ============================================================================= */

function _fallbackGetPlatformById(id) {
    if (!id || !window.platformData) return null;
    return window.platformData.find(p => p.id === id) || null;
}

function _fallbackGetLivePlatforms() {
    if (!window.platformData) return [];
    return window.platformData.filter(p => p.status === 'live');
}

function _fallbackGetComingSoonPlatforms() {
    if (!window.platformData) return [];
    return window.platformData.filter(p => p.status === 'soon');
}

function _fallbackGetHashtagPlatforms() {
    if (!window.platformData) return [];
    return window.platformData.filter(p => p.supports && p.supports.hashtagCheck === true);
}

function _fallbackDetectPlatformFromUrl(url) {
    if (!url || typeof url !== 'string' || !window.platformData) return null;
    
    const lowerUrl = url.toLowerCase().trim();
    
    if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) {
        return _fallbackGetPlatformById('twitter');
    }
    if (lowerUrl.includes('reddit.com') || lowerUrl.includes('redd.it')) {
        return _fallbackGetPlatformById('reddit');
    }
    if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
        return _fallbackGetPlatformById('instagram');
    }
    if (lowerUrl.includes('tiktok.com')) {
        return _fallbackGetPlatformById('tiktok');
    }
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
        return _fallbackGetPlatformById('facebook');
    }
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return _fallbackGetPlatformById('youtube');
    }
    if (lowerUrl.includes('linkedin.com')) {
        return _fallbackGetPlatformById('linkedin');
    }
    
    return null;
}

/* =============================================================================
   INITIALIZE SHARED FUNCTIONALITY
   ============================================================================= */
let sharedInitialized = false;

function initSharedFunctionality() {
    if (sharedInitialized) return;
    sharedInitialized = true;
    
    initMobileNav();
    initModalHandlers();
    initScrollReveal();
    initHeaderScroll();
    initBackToTop();
    initCookiePopup();
    initFaqAccordion();
    
    // Log agent status on init
    if (window.FiveFactorLoader || window.FiveFactorEngine) {
        console.log(`🤖 Detection Agents: ${AgentStatus.isReady() ? 'All Deployed' : 'Initializing...'}`);
    }
    
    console.log('✅ Shared functionality initialized');
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', initSharedFunctionality);

// Also init after shared components load
document.addEventListener('sharedComponentsLoaded', initSharedFunctionality);

/* =============================================================================
   EXPORTS (Global)
   ============================================================================= */
window.ShadowBan = window.ShadowBan || {};
Object.assign(window.ShadowBan, {
    showToast,
    openModal,
    closeModal,
    sleep,
    debounce,
    // Agent status utilities
    agents: AgentStatus
});

// Make modal/toast functions globally accessible
window.closeModal = closeModal;
window.closeLimitModal = () => closeModal('limit-modal');
window.showToast = showToast;
window.openModal = openModal;

// Make agent status globally accessible (keep EngineStatus as alias for backwards compatibility)
window.AgentStatus = AgentStatus;
window.EngineStatus = AgentStatus; // Backwards compatibility

// Set fallback platform helpers ONLY if platforms.js didn't load them
if (typeof window.getPlatformById !== 'function') {
    window.getPlatformById = _fallbackGetPlatformById;
    console.warn('⚠️ Using fallback getPlatformById - platforms.js may not have loaded');
}
if (typeof window.getLivePlatforms !== 'function') {
    window.getLivePlatforms = _fallbackGetLivePlatforms;
}
if (typeof window.getComingSoonPlatforms !== 'function') {
    window.getComingSoonPlatforms = _fallbackGetComingSoonPlatforms;
}
if (typeof window.getHashtagPlatforms !== 'function') {
    window.getHashtagPlatforms = _fallbackGetHashtagPlatforms;
}
if (typeof window.detectPlatformFromUrl !== 'function') {
    window.detectPlatformFromUrl = _fallbackDetectPlatformFromUrl;
}

// Console helper
console.log('💡 Run AgentStatus.printStatus() to check 3-Point Intelligence Model health');
