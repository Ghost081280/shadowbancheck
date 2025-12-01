/* =============================================================================
   MAIN.JS - SHARED FUNCTIONALITY
   ShadowBanCheck.io - Core shared utilities across all pages
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
   5-FACTOR ENGINE STATUS UTILITIES
   
   Provides engine health/status info for UI display before and after searches.
   Shows which factors are online, offline, or unavailable.
   ============================================================================= */
const EngineStatus = {
    
    // Factor definitions with weights and descriptions
    factors: [
        { id: 1, name: 'Platform API', weight: 20, icon: '🔌', description: 'Direct platform data access' },
        { id: 2, name: 'Web Analysis', weight: 20, icon: '🔍', description: 'Search & visibility testing' },
        { id: 3, name: 'Historical Data', weight: 15, icon: '📊', description: 'Past patterns & trends' },
        { id: 4, name: 'Detection Engine', weight: 25, icon: '#️⃣', description: 'Hashtags, links & content' },
        { id: 5, name: 'Predictive AI', weight: 20, icon: '🤖', description: 'ML-based risk scoring' },
    ],
    
    /**
     * Check if 5-Factor Engine is fully loaded and ready
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
     * @returns {Object} { ready, loadedCount, totalCount, percentage }
     */
    getQuickStatus: function() {
        if (window.FiveFactorLoader && typeof window.FiveFactorLoader.getQuickStatus === 'function') {
            return window.FiveFactorLoader.getQuickStatus();
        }
        // Fallback
        const ready = this.isReady();
        return {
            ready: ready,
            loadedCount: ready ? 27 : 0,
            totalCount: 27,
            percentage: ready ? 100 : 0
        };
    },
    
    /**
     * Get detailed status of all modules
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
     * Get status of each factor (for UI display)
     * @param {string} platformId - Platform being checked
     * @param {string} checkType - 'power', 'account', or 'hashtag'
     * @returns {Array} Factor status objects for display
     */
    getFactorStatus: function(platformId = 'twitter', checkType = 'power') {
        const isReddit = platformId === 'reddit';
        const isHashtagCheck = checkType === 'hashtag' || checkType === 'tagCheck';
        const status = this.getDetailedStatus();
        
        return this.factors.map(factor => {
            let online = false;
            let applicable = true;
            let reason = '';
            
            switch(factor.id) {
                case 1: // Platform API
                    online = status.agents?.PlatformAPIAgent && status.platforms?.PlatformFactory;
                    applicable = !isHashtagCheck;
                    reason = isHashtagCheck ? 'Not needed for tag checks' : (online ? 'Ready' : 'Agent not loaded');
                    break;
                    
                case 2: // Web Analysis
                    online = status.agents?.WebAnalysisAgent;
                    reason = online ? 'Ready' : 'Agent not loaded';
                    break;
                    
                case 3: // Historical Data
                    online = status.agents?.HistoricalAgent;
                    reason = online ? 'Ready (Demo mode)' : 'Agent not loaded';
                    break;
                    
                case 4: // Detection Engine
                    online = status.agents?.DetectionAgent && 
                             (status.databases?.FlaggedHashtags || status.databases?.FlaggedContent);
                    applicable = !isReddit || checkType !== 'hashtag';
                    reason = isReddit && checkType === 'hashtag' ? 'N/A for Reddit' : (online ? 'Ready' : 'Databases not loaded');
                    break;
                    
                case 5: // Predictive AI
                    online = status.agents?.PredictiveAgent;
                    reason = online ? 'Ready' : 'Agent not loaded';
                    break;
            }
            
            return {
                ...factor,
                online: online,
                applicable: applicable,
                status: !applicable ? 'na' : (online ? 'online' : 'offline'),
                statusText: !applicable ? 'N/A' : (online ? 'Online' : 'Offline'),
                reason: reason
            };
        });
    },
    
    /**
     * Get overall health percentage
     * @returns {number} 0-100
     */
    getHealthPercentage: function() {
        const factors = this.getFactorStatus();
        const applicable = factors.filter(f => f.applicable);
        const online = applicable.filter(f => f.online);
        
        if (applicable.length === 0) return 100;
        return Math.round((online.length / applicable.length) * 100);
    },
    
    /**
     * Get health status label
     * @returns {string} 'excellent', 'good', 'degraded', 'offline'
     */
    getHealthLabel: function() {
        const pct = this.getHealthPercentage();
        if (pct >= 100) return 'excellent';
        if (pct >= 80) return 'good';
        if (pct >= 50) return 'degraded';
        return 'offline';
    },
    
    /**
     * Generate HTML for factor status display
     * @param {string} platformId 
     * @param {string} checkType 
     * @returns {string} HTML string
     */
    renderStatusHTML: function(platformId = 'twitter', checkType = 'power') {
        const factors = this.getFactorStatus(platformId, checkType);
        const health = this.getHealthLabel();
        const healthPct = this.getHealthPercentage();
        
        let html = `<div class="engine-status engine-status--${health}">`;
        html += `<div class="engine-status__header">`;
        html += `<span class="engine-status__title">5-Factor Engine</span>`;
        html += `<span class="engine-status__health engine-status__health--${health}">${healthPct}% Online</span>`;
        html += `</div>`;
        html += `<div class="engine-status__factors">`;
        
        factors.forEach(factor => {
            const statusClass = factor.status === 'online' ? 'online' : 
                               (factor.status === 'na' ? 'na' : 'offline');
            const statusIcon = factor.status === 'online' ? '✓' : 
                              (factor.status === 'na' ? '○' : '✗');
            
            html += `
                <div class="engine-factor engine-factor--${statusClass}" title="${factor.reason}">
                    <span class="engine-factor__icon">${factor.icon}</span>
                    <span class="engine-factor__name">${factor.name}</span>
                    <span class="engine-factor__weight">${factor.weight}%</span>
                    <span class="engine-factor__status">${statusIcon}</span>
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
        
        console.log('═══════════════════════════════════════');
        console.log('   5-FACTOR ENGINE STATUS');
        console.log('═══════════════════════════════════════');
        
        const factors = this.getFactorStatus();
        factors.forEach(f => {
            const icon = f.status === 'online' ? '✅' : (f.status === 'na' ? '⚪' : '❌');
            console.log(`${icon} Factor ${f.id}: ${f.name} (${f.weight}%) - ${f.statusText}`);
        });
        
        console.log('───────────────────────────────────────');
        console.log(`Overall Health: ${this.getHealthPercentage()}% (${this.getHealthLabel()})`);
        console.log(`Engine Ready: ${this.isReady() ? 'Yes' : 'No'}`);
        console.log('═══════════════════════════════════════');
    },
    
    /**
     * Watch for engine load and call callback when ready
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
   
   IMPORTANT: These are FALLBACK functions that directly access platformData.
   They do NOT call window.getPlatformById etc. to avoid infinite recursion.
   platforms.js should always load first and define the real functions.
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
    
    // Log engine status on init
    if (window.FiveFactorLoader || window.FiveFactorEngine) {
        console.log(`🔧 5-Factor Engine: ${EngineStatus.isReady() ? 'Ready' : 'Loading...'}`);
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
    // Engine status utilities
    engine: EngineStatus
});

// Make modal/toast functions globally accessible
window.closeModal = closeModal;
window.closeLimitModal = () => closeModal('limit-modal');
window.showToast = showToast;
window.openModal = openModal;

// Make engine status globally accessible
window.EngineStatus = EngineStatus;

// Set fallback platform helpers ONLY if platforms.js didn't load them
// This prevents the infinite recursion bug
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
console.log('💡 Run EngineStatus.printStatus() to check 5-Factor Engine health');
