/* =============================================================================
   RESEARCH-DASHBOARD.JS v2.0
   ShadowBanCheck.io - Research Dashboard (Complete Fixed Version)
   
   Everything the Research dashboard needs:
   - Auth & Session
   - Navigation (FIXED)
   - Toast & Modals
   - Usage Tracking (pay-per-question)
   - Data Search & Filtering
   - Trend Analysis
   - Platform Analysis
   - Hashtag Database
   - Flagged Links Database (NEW)
   - Flagged Content Database (NEW)
   - Data Exports
   - Support Chat
   - Shadow AI Billing Integration
   ============================================================================= */

(function() {
'use strict';

console.log('🚀 Research Dashboard v2.0 loading...');

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    plan: 'Research',
    baseFee: 49,
    perQuestion: 0.25,
    exportsIncluded: Infinity,
    maxExportRows: 10000,
    storageKey: 'research_usage_data'
};

// =============================================================================
// DEMO DATA
// =============================================================================
const DemoData = {
    // Overall stats
    stats: {
        totalChecks: 127453,
        avgProbability: 34.2,
        flaggedHashtags: 1847,
        flaggedLinks: 892,
        flaggedWords: 2341,
        platformsTracked: 6
    },
    
    // Platform breakdown
    platforms: {
        twitter: { name: 'Twitter/X', icon: '🐦', checks: 42156, avgProb: 31.5, color: '#1DA1F2' },
        instagram: { name: 'Instagram', icon: '📸', checks: 33421, avgProb: 38.2, color: '#E4405F' },
        tiktok: { name: 'TikTok', icon: '🎵', checks: 24287, avgProb: 35.8, color: '#00f2ea' },
        reddit: { name: 'Reddit', icon: '🤖', checks: 15104, avgProb: 29.4, color: '#FF5700' },
        facebook: { name: 'Facebook', icon: '📘', checks: 9721, avgProb: 33.1, color: '#1877F2' },
        linkedin: { name: 'LinkedIn', icon: '💼', checks: 2764, avgProb: 22.6, color: '#0A66C2' }
    },
    
    // Recent high-probability detections
    recentDetections: [
        {
            id: 1,
            platform: 'instagram',
            type: 'account',
            content: '@fitness_influencer_2024 - Multiple restricted hashtags, reduced explore reach',
            probability: 87,
            factors: ['Restricted hashtags', 'Low engagement rate', 'Link in bio flagged'],
            timestamp: new Date(Date.now() - 1800000)
        },
        {
            id: 2,
            platform: 'twitter',
            type: 'account',
            content: '@crypto_trader_x - Reply visibility severely limited, search ban detected',
            probability: 78,
            factors: ['Reply deboosting', 'Search ban', 'High report rate'],
            timestamp: new Date(Date.now() - 3600000)
        },
        {
            id: 3,
            platform: 'tiktok',
            type: 'post',
            content: 'Video ID: 7234567890 - Not appearing on FYP, hashtag suppression',
            probability: 72,
            factors: ['FYP exclusion', 'Hashtag suppressed', 'Audio flagged'],
            timestamp: new Date(Date.now() - 5400000)
        },
        {
            id: 4,
            platform: 'reddit',
            type: 'account',
            content: 'u/news_aggregator - Posts auto-removed in multiple subreddits',
            probability: 69,
            factors: ['AutoMod removal', 'Spam filter', 'Low karma'],
            timestamp: new Date(Date.now() - 7200000)
        },
        {
            id: 5,
            platform: 'instagram',
            type: 'hashtag',
            content: '#weightloss - Currently suppressed, not appearing in recent tab',
            probability: 65,
            factors: ['Content policy', 'Health misinformation', 'Temporary ban'],
            timestamp: new Date(Date.now() - 9000000)
        }
    ],
    
    // Hashtag database
    hashtags: [
        { tag: '#shadowbanned', platform: 'twitter', status: 'restricted', detections: 2847, lastSeen: '2 hours ago' },
        { tag: '#crypto', platform: 'instagram', status: 'suppressed', detections: 1932, lastSeen: '1 hour ago' },
        { tag: '#election2024', platform: 'all', status: 'monitored', detections: 1654, lastSeen: '30 min ago' },
        { tag: '#adulting', platform: 'tiktok', status: 'banned', detections: 1287, lastSeen: '45 min ago' },
        { tag: '#weightloss', platform: 'instagram', status: 'suppressed', detections: 1043, lastSeen: '1 hour ago' },
        { tag: '#followforfollow', platform: 'twitter', status: 'restricted', detections: 987, lastSeen: '3 hours ago' },
        { tag: '#f4f', platform: 'instagram', status: 'restricted', detections: 856, lastSeen: '2 hours ago' },
        { tag: '#nsfw', platform: 'all', status: 'banned', detections: 743, lastSeen: '1 hour ago' },
        { tag: '#onlyfans', platform: 'instagram', status: 'banned', detections: 698, lastSeen: '4 hours ago' },
        { tag: '#dating', platform: 'tiktok', status: 'suppressed', detections: 612, lastSeen: '2 hours ago' }
    ],
    
    // Flagged links database
    flaggedLinks: [
        { domain: 'bit.ly', type: 'shortener', risk: 'medium', detections: 4521, platforms: 'all', note: 'Link shortener - reduces trust' },
        { domain: 'linktr.ee', type: 'aggregator', risk: 'medium', detections: 3847, platforms: 'instagram', note: 'May reduce organic reach' },
        { domain: 'tinyurl.com', type: 'shortener', risk: 'medium', detections: 2156, platforms: 'all', note: 'Link shortener - spam indicator' },
        { domain: 'onlyfans.com', type: 'adult', risk: 'high', detections: 1892, platforms: 'instagram,tiktok', note: 'Adult content - often banned' },
        { domain: 'beacons.ai', type: 'aggregator', risk: 'low', detections: 1654, platforms: 'instagram', note: 'Link aggregator' },
        { domain: 'amzn.to', type: 'affiliate', risk: 'low', detections: 1432, platforms: 'all', note: 'Amazon affiliate link' },
        { domain: 'free-followers.net', type: 'spam', risk: 'critical', detections: 987, platforms: 'all', note: 'Known spam domain' },
        { domain: 'rebrand.ly', type: 'shortener', risk: 'low', detections: 876, platforms: 'all', note: 'Branded shortener' },
        { domain: 'shareasale.com', type: 'affiliate', risk: 'medium', detections: 743, platforms: 'all', note: 'Affiliate network' },
        { domain: 'clickbank.net', type: 'affiliate', risk: 'high', detections: 654, platforms: 'all', note: 'Often flagged as spam' }
    ],
    
    // Flagged words/phrases database
    flaggedWords: [
        { phrase: 'free money', category: 'spam', risk: 'high', detections: 3241, platforms: 'all' },
        { phrase: 'guaranteed returns', category: 'cryptoScams', risk: 'high', detections: 2876, platforms: 'all' },
        { phrase: 'dm for collab', category: 'promotional', risk: 'medium', detections: 2543, platforms: 'instagram' },
        { phrase: 'follow for follow', category: 'engagementBait', risk: 'medium', detections: 2198, platforms: 'all' },
        { phrase: 'link in bio', category: 'promotional', risk: 'low', detections: 1987, platforms: 'instagram,tiktok' },
        { phrase: 'vaccine injury', category: 'healthMisinfo', risk: 'high', detections: 1654, platforms: 'all' },
        { phrase: 'election fraud', category: 'political', risk: 'high', detections: 1432, platforms: 'all' },
        { phrase: '100x gains', category: 'cryptoScams', risk: 'high', detections: 1287, platforms: 'all' },
        { phrase: 'passive income', category: 'promotional', risk: 'medium', detections: 1098, platforms: 'all' },
        { phrase: 'smash that like', category: 'engagementBait', risk: 'low', detections: 987, platforms: 'youtube' }
    ],
    
    // Export history
    exportHistory: [
        { id: 1, name: 'All Detections - Nov 2025', format: 'CSV', rows: 8543, date: '2025-11-28', size: '2.4 MB' },
        { id: 2, name: 'Twitter High Probability', format: 'CSV', rows: 1247, date: '2025-11-25', size: '456 KB' },
        { id: 3, name: 'Hashtag Database Snapshot', format: 'JSON', rows: 1847, date: '2025-11-20', size: '892 KB' }
    ],
    
    // Usage tracking - persisted to localStorage
    usage: {
        questions: 0,
        exports: 0,
        resetDate: null
    }
};

// =============================================================================
// AUTH
// =============================================================================
const Auth = {
    STORAGE_KEY: 'shadowban_session',
    
    getSession() {
        const session = localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
        try { return session ? JSON.parse(session) : null; } 
        catch (e) { return null; }
    },
    
    logout() {
        console.log('🚪 Logging out...');
        localStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.STORAGE_KEY);
        window.location.href = 'login.html';
    }
};

// Make Auth globally available
window.Auth = Auth;

// =============================================================================
// USAGE STORAGE
// =============================================================================
function loadUsageData() {
    try {
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored) {
            const data = JSON.parse(stored);
            const now = new Date();
            const resetDate = new Date(data.resetDate);
            
            // Check if we need to reset (new month)
            if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
                // Reset for new month
                DemoData.usage = {
                    questions: 0,
                    exports: 0,
                    resetDate: getNextResetDate()
                };
                saveUsageData();
            } else {
                DemoData.usage = data;
            }
        } else {
            // Initialize
            DemoData.usage = {
                questions: 12, // Demo starting value
                exports: 3,
                resetDate: getNextResetDate()
            };
            saveUsageData();
        }
    } catch (e) {
        console.warn('Error loading usage data:', e);
    }
}

function saveUsageData() {
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(DemoData.usage));
    } catch (e) {
        console.warn('Error saving usage data:', e);
    }
}

function getNextResetDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

// =============================================================================
// TOAST
// =============================================================================
function showToast(icon, message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast) {
        console.log('Toast:', icon, message);
        return;
    }
    
    if (toastIcon) toastIcon.textContent = icon;
    if (toastMessage) toastMessage.textContent = message;
    
    toast.classList.remove('hidden');
    toast.classList.add('visible');
    
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, duration);
}

window.showToast = showToast;

// =============================================================================
// NAVIGATION - FIXED
// =============================================================================
function switchSection(sectionName, updateHash = true) {
    console.log('📍 Switching to section:', sectionName);
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemSection = item.dataset.section || item.getAttribute('data-section');
        item.classList.toggle('active', itemSection === sectionName);
    });
    
    // Update sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        const sectionId = section.id.replace('section-', '');
        const isActive = sectionId === sectionName;
        section.classList.toggle('active', isActive);
        
        if (isActive) {
            console.log('✅ Activated section:', section.id);
        }
    });
    
    // Close mobile sidebar
    const sidebar = document.querySelector('.research-sidebar');
    if (sidebar) sidebar.classList.remove('open');
    
    // Update URL hash
    if (updateHash) {
        history.pushState(null, '', `#${sectionName}`);
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

window.switchSection = switchSection;

function initNavigation() {
    console.log('🔗 Initializing navigation...');
    
    // Bind click handlers to all nav items
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section || item.getAttribute('data-section');
            console.log('Nav clicked:', section);
            switchSection(section);
        });
    });
    
    // Handle initial hash
    const hash = window.location.hash.slice(1);
    if (hash) {
        console.log('Initial hash:', hash);
        switchSection(hash, false);
    }
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1);
        if (hash) switchSection(hash, false);
    });
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.research-sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
    
    console.log('✅ Navigation initialized');
}

// =============================================================================
// USAGE TRACKER
// =============================================================================
const UsageTracker = {
    getDaysUntilReset() {
        if (!DemoData.usage.resetDate) return 30;
        const diff = new Date(DemoData.usage.resetDate) - new Date();
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    },
    
    calculateCost() {
        const u = DemoData.usage;
        return {
            questions: u.questions * CONFIG.perQuestion,
            get total() { return CONFIG.baseFee + this.questions; }
        };
    },
    
    update() {
        const usage = DemoData.usage;
        const cost = this.calculateCost();
        const daysLeft = this.getDaysUntilReset();
        
        // Update usage display
        const questionsEl = document.getElementById('usage-questions');
        const exportsEl = document.getElementById('usage-exports');
        const estimateEl = document.querySelector('.usage-estimate');
        
        if (questionsEl) questionsEl.textContent = `${usage.questions} questions`;
        if (exportsEl) exportsEl.textContent = `${usage.exports} exports`;
        if (estimateEl) {
            estimateEl.innerHTML = `AI Questions: <strong>$${cost.questions.toFixed(2)}</strong> (${usage.questions} × $0.25) • Resets in ${daysLeft} days`;
        }
        
        // Update billing section
        const billingAi = document.getElementById('billing-ai');
        const billingTotal = document.getElementById('billing-total');
        const billingQuestionsCount = document.getElementById('billing-questions-count');
        const billingAiTotal = document.getElementById('billing-ai-total');
        const billingGrandTotal = document.getElementById('billing-grand-total');
        
        if (billingAi) billingAi.textContent = `$${cost.questions.toFixed(2)}`;
        if (billingTotal) billingTotal.textContent = `$${cost.total.toFixed(2)}`;
        if (billingQuestionsCount) billingQuestionsCount.textContent = usage.questions;
        if (billingAiTotal) billingAiTotal.textContent = `$${cost.questions.toFixed(2)}`;
        if (billingGrandTotal) billingGrandTotal.textContent = `$${cost.total.toFixed(2)}`;
        
        // Update export count
        const statExports = document.getElementById('stat-exports');
        if (statExports) statExports.textContent = usage.exports;
        
        // Progress bars
        const questionBar = document.querySelector('.usage-item:first-child .usage-bar-fill');
        const exportBar = document.querySelector('.usage-item:last-child .usage-bar-fill');
        
        if (questionBar) {
            questionBar.style.width = `${Math.min(100, (usage.questions / 50) * 100)}%`;
        }
        
        if (exportBar) {
            exportBar.style.width = `${Math.min(100, (usage.exports / 50) * 100)}%`;
        }
    },
    
    incrementQuestion() {
        DemoData.usage.questions++;
        saveUsageData();
        this.update();
        showToast('🤖', `AI question charged: $${CONFIG.perQuestion}`);
        console.log('💰 AI question billed: $' + CONFIG.perQuestion + ' | Total questions: ' + DemoData.usage.questions);
    },
    
    incrementExport() {
        DemoData.usage.exports++;
        saveUsageData();
        this.update();
    }
};

window.UsageTracker = UsageTracker;

// Hook for Shadow AI billing
window.billResearchQuestion = function() {
    UsageTracker.incrementQuestion();
};

// =============================================================================
// RESEARCH MANAGER
// =============================================================================
const ResearchManager = {
    currentFilters: {
        keyword: '',
        platform: 'all',
        type: 'all',
        probability: 'all',
        date: '30',
        sort: 'date'
    },
    
    // Get platform info
    getPlatformInfo(platformId) {
        return DemoData.platforms[platformId] || { name: platformId, icon: '🌐', color: '#6366f1' };
    },
    
    // Format timestamp
    formatTime(date) {
        if (!(date instanceof Date)) date = new Date(date);
        const diff = Date.now() - date.getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    },
    
    // Get probability class
    getProbabilityClass(prob) {
        if (prob >= 70) return 'high';
        if (prob >= 40) return 'medium';
        return 'low';
    },
    
    // Get risk class
    getRiskClass(risk) {
        if (risk === 'critical' || risk === 'high') return 'danger';
        if (risk === 'medium') return 'warning';
        return 'healthy';
    },
    
    // Get factor class
    getFactorClass(factor) {
        const lower = factor.toLowerCase();
        if (lower.includes('ban') || lower.includes('removed') || lower.includes('flagged')) return 'negative';
        if (lower.includes('reduced') || lower.includes('limited') || lower.includes('low')) return 'warning';
        if (lower.includes('normal') || lower.includes('healthy') || lower.includes('visible')) return 'positive';
        return 'neutral';
    },
    
    // Render recent detections
    renderRecentDetections() {
        const container = document.getElementById('recent-detections');
        if (!container) return;
        
        container.innerHTML = DemoData.recentDetections.map(d => {
            const platform = this.getPlatformInfo(d.platform);
            const probClass = this.getProbabilityClass(d.probability);
            
            return `
                <div class="data-preview-card">
                    <div class="data-preview-header">
                        <div class="data-preview-platform">
                            <span>${platform.icon}</span>
                            <strong>${platform.name}</strong>
                            <span class="badge">${d.type}</span>
                        </div>
                        <span class="data-preview-score ${probClass}">${d.probability}%</span>
                    </div>
                    <div class="data-preview-content">${d.content}</div>
                    <div class="data-preview-factors">
                        ${d.factors.map(f => `<span class="factor-chip ${this.getFactorClass(f)}">${f}</span>`).join('')}
                    </div>
                    <div class="data-preview-footer">
                        <span>ID: #${d.id}</span>
                        <span>${this.formatTime(d.timestamp)}</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Search data
    search() {
        const keyword = document.getElementById('search-keyword')?.value || '';
        const platform = document.getElementById('search-platform')?.value || 'all';
        const type = document.getElementById('search-type')?.value || 'all';
        const probability = document.getElementById('search-probability')?.value || 'all';
        const date = document.getElementById('search-date')?.value || '30';
        const sort = document.getElementById('search-sort')?.value || 'date';
        
        this.currentFilters = { keyword, platform, type, probability, date, sort };
        
        showToast('🔍', 'Searching data...');
        
        setTimeout(() => {
            this.renderSearchResults();
        }, 800);
    },
    
    // Render search results
    renderSearchResults() {
        const container = document.getElementById('search-results');
        const countEl = document.getElementById('results-count');
        const badgeEl = document.getElementById('results-badge');
        
        if (!container) return;
        
        let results = [...DemoData.recentDetections];
        
        // Filter by platform
        if (this.currentFilters.platform !== 'all') {
            results = results.filter(r => r.platform === this.currentFilters.platform);
        }
        
        // Filter by type
        if (this.currentFilters.type !== 'all') {
            results = results.filter(r => r.type === this.currentFilters.type);
        }
        
        // Filter by probability
        if (this.currentFilters.probability !== 'all') {
            results = results.filter(r => {
                if (this.currentFilters.probability === 'high') return r.probability >= 70;
                if (this.currentFilters.probability === 'medium') return r.probability >= 40 && r.probability < 70;
                return r.probability < 40;
            });
        }
        
        // Filter by keyword
        if (this.currentFilters.keyword) {
            const kw = this.currentFilters.keyword.toLowerCase();
            results = results.filter(r => r.content.toLowerCase().includes(kw));
        }
        
        // Update count
        const totalResults = results.length * 1000 + Math.floor(Math.random() * 500);
        if (countEl) countEl.textContent = `(${totalResults.toLocaleString()} results)`;
        if (badgeEl) badgeEl.textContent = `Found ${totalResults.toLocaleString()}`;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <span>📭</span>
                    <p>No results match your filters. Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = results.map(d => {
            const platform = this.getPlatformInfo(d.platform);
            const probClass = this.getProbabilityClass(d.probability);
            
            return `
                <div class="data-preview-card">
                    <div class="data-preview-header">
                        <div class="data-preview-platform">
                            <span>${platform.icon}</span>
                            <strong>${platform.name}</strong>
                            <span class="badge">${d.type}</span>
                        </div>
                        <span class="data-preview-score ${probClass}">${d.probability}%</span>
                    </div>
                    <div class="data-preview-content">${d.content}</div>
                    <div class="data-preview-factors">
                        ${d.factors.map(f => `<span class="factor-chip ${this.getFactorClass(f)}">${f}</span>`).join('')}
                    </div>
                    <div class="data-preview-footer">
                        <span>ID: #${d.id}</span>
                        <span>${this.formatTime(d.timestamp)}</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Reset filters
    resetFilters() {
        document.getElementById('search-keyword').value = '';
        document.getElementById('search-platform').value = 'all';
        document.getElementById('search-type').value = 'all';
        document.getElementById('search-probability').value = 'all';
        document.getElementById('search-date').value = '30';
        document.getElementById('search-sort').value = 'date';
        
        this.currentFilters = {
            keyword: '',
            platform: 'all',
            type: 'all',
            probability: 'all',
            date: '30',
            sort: 'date'
        };
        
        document.getElementById('search-results').innerHTML = `
            <div class="empty-state-small">
                <span>🔍</span>
                <p>Enter search criteria above to query suppression data.</p>
            </div>
        `;
        document.getElementById('results-count').textContent = '';
        document.getElementById('results-badge').textContent = 'Ready to search';
        
        showToast('🔄', 'Filters reset');
    },
    
    // Search hashtags
    searchHashtags() {
        const query = document.getElementById('hashtag-search')?.value || '';
        const platform = document.getElementById('hashtag-platform')?.value || 'all';
        
        showToast('🔍', 'Searching hashtags...');
        
        setTimeout(() => {
            this.renderHashtags(query, platform);
        }, 500);
    },
    
    // Render hashtags
    renderHashtags(query = '', platform = 'all') {
        const container = document.getElementById('hashtag-results');
        if (!container) return;
        
        let hashtags = [...DemoData.hashtags];
        
        if (query) {
            const q = query.toLowerCase().replace('#', '');
            hashtags = hashtags.filter(h => h.tag.toLowerCase().includes(q));
        }
        
        if (platform !== 'all') {
            hashtags = hashtags.filter(h => h.platform === platform || h.platform === 'all');
        }
        
        if (hashtags.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <span>#️⃣</span>
                    <p>No hashtags found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = hashtags.map(h => {
            const statusBadge = {
                banned: '<span class="badge danger">Banned</span>',
                suppressed: '<span class="badge warning">Suppressed</span>',
                restricted: '<span class="badge info">Restricted</span>',
                monitored: '<span class="badge">Monitored</span>'
            }[h.status] || '<span class="badge">Unknown</span>';
            
            const platformInfo = h.platform === 'all' 
                ? { icon: '🌐', name: 'All Platforms' }
                : this.getPlatformInfo(h.platform);
            
            return `
                <div class="result-item">
                    <div class="result-icon ${h.status === 'banned' ? 'danger' : h.status === 'suppressed' ? 'warning' : 'healthy'}">#️⃣</div>
                    <div class="result-content">
                        <div class="result-title">${h.tag}</div>
                        <div class="result-meta">
                            <span>${platformInfo.icon} ${platformInfo.name}</span> • 
                            <span>Last seen: ${h.lastSeen}</span>
                        </div>
                    </div>
                    <div class="result-score">
                        ${statusBadge}
                        <span class="score-label" style="margin-top: 0.25rem;">${h.detections.toLocaleString()} detections</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Search flagged links
    searchFlaggedLinks() {
        const query = document.getElementById('link-search')?.value || '';
        const type = document.getElementById('link-type')?.value || 'all';
        
        showToast('🔍', 'Searching flagged links...');
        
        setTimeout(() => {
            this.renderFlaggedLinks(query, type);
        }, 500);
    },
    
    // Render flagged links
    renderFlaggedLinks(query = '', type = 'all') {
        const container = document.getElementById('flagged-links-results');
        if (!container) return;
        
        let links = [...DemoData.flaggedLinks];
        
        if (query) {
            const q = query.toLowerCase();
            links = links.filter(l => l.domain.toLowerCase().includes(q));
        }
        
        if (type !== 'all') {
            links = links.filter(l => l.type === type);
        }
        
        if (links.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <span>🔗</span>
                    <p>No flagged links found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = links.map(l => {
            const riskBadge = {
                critical: '<span class="badge danger">Critical</span>',
                high: '<span class="badge danger">High Risk</span>',
                medium: '<span class="badge warning">Medium</span>',
                low: '<span class="badge info">Low</span>'
            }[l.risk] || '<span class="badge">Unknown</span>';
            
            const typeIcon = {
                shortener: '🔗',
                aggregator: '📎',
                affiliate: '💰',
                spam: '🚫',
                adult: '🔞'
            }[l.type] || '🔗';
            
            return `
                <div class="result-item">
                    <div class="result-icon ${this.getRiskClass(l.risk)}">${typeIcon}</div>
                    <div class="result-content">
                        <div class="result-title">${l.domain}</div>
                        <div class="result-meta">
                            <span>Type: ${l.type}</span> • 
                            <span>Platforms: ${l.platforms}</span>
                        </div>
                        <div class="result-meta" style="margin-top: 0.25rem; font-style: italic;">${l.note}</div>
                    </div>
                    <div class="result-score">
                        ${riskBadge}
                        <span class="score-label" style="margin-top: 0.25rem;">${l.detections.toLocaleString()} detections</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Search flagged words
    searchFlaggedWords() {
        const query = document.getElementById('word-search')?.value || '';
        const category = document.getElementById('word-category')?.value || 'all';
        
        showToast('🔍', 'Searching flagged content...');
        
        setTimeout(() => {
            this.renderFlaggedWords(query, category);
        }, 500);
    },
    
    // Render flagged words
    renderFlaggedWords(query = '', category = 'all') {
        const container = document.getElementById('flagged-words-results');
        if (!container) return;
        
        let words = [...DemoData.flaggedWords];
        
        if (query) {
            const q = query.toLowerCase();
            words = words.filter(w => w.phrase.toLowerCase().includes(q));
        }
        
        if (category !== 'all') {
            words = words.filter(w => w.category === category);
        }
        
        if (words.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <span>📝</span>
                    <p>No flagged content found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = words.map(w => {
            const riskBadge = {
                high: '<span class="badge danger">High Risk</span>',
                medium: '<span class="badge warning">Medium</span>',
                low: '<span class="badge info">Low</span>'
            }[w.risk] || '<span class="badge">Unknown</span>';
            
            const catIcon = {
                spam: '🚫',
                cryptoScams: '💰',
                promotional: '📢',
                engagementBait: '🎣',
                healthMisinfo: '💊',
                political: '🏛️'
            }[w.category] || '📝';
            
            return `
                <div class="result-item">
                    <div class="result-icon ${this.getRiskClass(w.risk)}">${catIcon}</div>
                    <div class="result-content">
                        <div class="result-title">"${w.phrase}"</div>
                        <div class="result-meta">
                            <span>Category: ${w.category}</span> • 
                            <span>Platforms: ${w.platforms}</span>
                        </div>
                    </div>
                    <div class="result-score">
                        ${riskBadge}
                        <span class="score-label" style="margin-top: 0.25rem;">${w.detections.toLocaleString()} detections</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Export functions
    exportResults() {
        showToast('📥', 'Preparing export...');
        setTimeout(() => {
            UsageTracker.incrementExport();
            this.addExportToHistory('Search Results Export', 'CSV', Math.floor(Math.random() * 5000) + 500);
            showToast('✅', 'Export ready! Download started.');
        }, 1500);
    },
    
    exportTrends() {
        showToast('📥', 'Exporting trends data...');
        setTimeout(() => {
            UsageTracker.incrementExport();
            this.addExportToHistory('Trend Analysis Report', 'JSON', 52);
            showToast('✅', 'Trends export complete!');
        }, 1200);
    },
    
    exportHashtags() {
        showToast('📥', 'Exporting hashtag database...');
        setTimeout(() => {
            UsageTracker.incrementExport();
            this.addExportToHistory('Hashtag Database', 'CSV', DemoData.hashtags.length);
            showToast('✅', 'Hashtag export complete!');
        }, 1000);
    },
    
    exportFlaggedLinks() {
        showToast('📥', 'Exporting flagged links...');
        setTimeout(() => {
            UsageTracker.incrementExport();
            this.addExportToHistory('Flagged Links Database', 'CSV', DemoData.flaggedLinks.length);
            showToast('✅', 'Flagged links export complete!');
        }, 1000);
    },
    
    exportFlaggedWords() {
        showToast('📥', 'Exporting flagged content...');
        setTimeout(() => {
            UsageTracker.incrementExport();
            this.addExportToHistory('Flagged Content Database', 'CSV', DemoData.flaggedWords.length);
            showToast('✅', 'Flagged content export complete!');
        }, 1000);
    },
    
    exportQuick(type) {
        const exports = {
            'all-detections': { name: 'All Detections (Last 30 days)', format: 'CSV', rows: 8500 },
            'hashtags': { name: 'Flagged Hashtags Database', format: 'CSV', rows: 1847 },
            'high-prob': { name: 'High Probability Detections', format: 'CSV', rows: 2100 },
            'trends': { name: 'Trend Analysis Report', format: 'JSON', rows: 52 },
            'flagged-links': { name: 'Flagged Links Database', format: 'CSV', rows: 892 },
            'flagged-words': { name: 'Flagged Content Database', format: 'CSV', rows: 2341 }
        };
        
        const exp = exports[type];
        if (!exp) return;
        
        showToast('📥', `Exporting ${exp.name}...`);
        setTimeout(() => {
            UsageTracker.incrementExport();
            this.addExportToHistory(exp.name, exp.format, exp.rows);
            showToast('✅', 'Export complete!');
        }, 1500);
    },
    
    addExportToHistory(name, format, rows) {
        const newExport = {
            id: DemoData.exportHistory.length + 1,
            name: name,
            format: format,
            rows: rows,
            date: new Date().toISOString().split('T')[0],
            size: `${Math.floor(rows * 0.3)} KB`
        };
        
        DemoData.exportHistory.unshift(newExport);
        this.renderExportHistory();
    },
    
    renderExportHistory() {
        const container = document.getElementById('export-history');
        if (!container) return;
        
        if (DemoData.exportHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <span>📜</span>
                    <p>No exports yet.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = DemoData.exportHistory.map(e => `
            <div class="client-list-item">
                <div class="client-avatar" style="background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);">📄</div>
                <div class="client-info">
                    <div class="client-name">${e.name}</div>
                    <div class="client-meta">${e.rows.toLocaleString()} rows • ${e.format} • ${e.size}</div>
                </div>
                <span class="badge">${e.date}</span>
            </div>
        `).join('');
    },
    
    // Platform filter handling
    initPlatformFilters() {
        const pills = document.querySelectorAll('.platform-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.updatePlatformStats(pill.dataset.platform);
            });
        });
    },
    
    updatePlatformStats(platform) {
        const totalEl = document.getElementById('platform-total');
        const avgEl = document.getElementById('platform-avg');
        
        if (platform === 'all') {
            if (totalEl) totalEl.textContent = DemoData.stats.totalChecks.toLocaleString();
            if (avgEl) avgEl.textContent = `${DemoData.stats.avgProbability}%`;
        } else {
            const p = DemoData.platforms[platform];
            if (p) {
                if (totalEl) totalEl.textContent = p.checks.toLocaleString();
                if (avgEl) avgEl.textContent = `${p.avgProb}%`;
            }
        }
    },
    
    // Initialize tabs
    initTabs(sectionId, resultsId, filterFn) {
        const tabs = document.querySelectorAll(`#section-${sectionId} .results-tab`);
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                filterFn(tab.dataset.filter);
            });
        });
    },
    
    // Filter hashtags by status
    filterHashtags(status) {
        const container = document.getElementById('hashtag-results');
        if (!container) return;
        
        let hashtags = [...DemoData.hashtags];
        
        if (status !== 'all') {
            hashtags = hashtags.filter(h => h.status === status);
        }
        
        if (hashtags.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <span>#️⃣</span>
                    <p>No ${status} hashtags found.</p>
                </div>
            `;
            return;
        }
        
        this.renderHashtags('', 'all');
        // Re-filter after render
        if (status !== 'all') {
            const items = container.querySelectorAll('.result-item');
            items.forEach(item => {
                const badge = item.querySelector('.badge');
                if (badge && !badge.textContent.toLowerCase().includes(status)) {
                    item.style.display = 'none';
                }
            });
        }
    },
    
    // Filter links by risk
    filterLinks(risk) {
        const container = document.getElementById('flagged-links-results');
        if (!container) return;
        
        let links = [...DemoData.flaggedLinks];
        
        if (risk !== 'all') {
            links = links.filter(l => l.risk === risk);
        }
        
        this.renderFlaggedLinks('', 'all');
    },
    
    // Filter words by risk
    filterWords(risk) {
        const container = document.getElementById('flagged-words-results');
        if (!container) return;
        
        let words = [...DemoData.flaggedWords];
        
        if (risk !== 'all') {
            words = words.filter(w => w.risk === risk);
        }
        
        this.renderFlaggedWords('', 'all');
    }
};

window.ResearchManager = ResearchManager;

// =============================================================================
// SUPPORT CHAT
// =============================================================================
const SupportChat = {
    messages: [
        { from: 'system', text: 'Welcome to Research support! How can we help with your data analysis?', time: 'Just now' }
    ],
    
    render() {
        const container = document.querySelector('.chat-widget-body');
        if (!container) return;
        
        container.innerHTML = this.messages.map(msg => {
            if (msg.from === 'system') {
                return `<div class="chat-message system"><div class="chat-message-content"><div class="chat-message-bubble system-bubble">${msg.text}</div></div></div>`;
            }
            return `<div class="chat-message ${msg.from}"><div class="chat-message-avatar">${msg.from === 'admin' ? '👤' : '🔬'}</div><div class="chat-message-content"><div class="chat-message-bubble">${msg.text}</div><div class="chat-message-time">${msg.time}</div></div></div>`;
        }).join('');
        
        container.scrollTop = container.scrollHeight;
    },
    
    send(text) {
        if (!text.trim()) return;
        this.messages.push({ from: 'user', text: text.trim(), time: 'Just now' });
        this.render();
        
        setTimeout(() => {
            this.messages.push({ from: 'admin', text: 'Thanks for reaching out! A research support specialist will respond shortly. For instant help, try Shadow AI!', time: 'Just now' });
            this.render();
        }, 1500);
    },
    
    init() {
        const container = document.querySelector('.chat-widget');
        if (!container) return;
        
        const input = container.querySelector('input');
        const btn = container.querySelector('.send-btn');
        
        if (input && btn) {
            btn.addEventListener('click', () => { this.send(input.value); input.value = ''; });
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') { this.send(input.value); input.value = ''; } });
        }
        
        this.render();
    }
};

// =============================================================================
// INIT
// =============================================================================
function init() {
    console.log('🚀 Research Dashboard v2.0 initializing...');
    
    // Load saved usage data
    loadUsageData();
    
    // Initialize navigation
    initNavigation();
    
    // Logout handlers - FIXED
    const logoutBtns = document.querySelectorAll('.logout-btn, #research-logout-btn');
    console.log('Found logout buttons:', logoutBtns.length);
    
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Logout clicked');
            if (confirm('Are you sure you want to logout?')) {
                Auth.logout();
            }
        });
    });
    
    // Support form
    const supportForm = document.getElementById('support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('✅', 'Message sent!');
            e.target.reset();
        });
    }
    
    // Search form enter key
    const searchKeyword = document.getElementById('search-keyword');
    if (searchKeyword) {
        searchKeyword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                ResearchManager.search();
            }
        });
    }
    
    // Hashtag search enter key
    const hashtagSearch = document.getElementById('hashtag-search');
    if (hashtagSearch) {
        hashtagSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                ResearchManager.searchHashtags();
            }
        });
    }
    
    // Link search enter key
    const linkSearch = document.getElementById('link-search');
    if (linkSearch) {
        linkSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                ResearchManager.searchFlaggedLinks();
            }
        });
    }
    
    // Word search enter key
    const wordSearch = document.getElementById('word-search');
    if (wordSearch) {
        wordSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                ResearchManager.searchFlaggedWords();
            }
        });
    }
    
    // Initial renders
    UsageTracker.update();
    ResearchManager.renderRecentDetections();
    ResearchManager.renderHashtags();
    ResearchManager.renderFlaggedLinks();
    ResearchManager.renderFlaggedWords();
    ResearchManager.renderExportHistory();
    ResearchManager.initPlatformFilters();
    
    // Initialize tabs
    ResearchManager.initTabs('hashtags', 'hashtag-results', ResearchManager.filterHashtags.bind(ResearchManager));
    
    // Initialize support chat
    SupportChat.init();
    
    // Update stats
    document.getElementById('stat-total-checks')?.textContent && 
        (document.getElementById('stat-total-checks').textContent = DemoData.stats.totalChecks.toLocaleString());
    document.getElementById('stat-flagged-links')?.textContent && 
        (document.getElementById('stat-flagged-links').textContent = DemoData.stats.flaggedLinks.toLocaleString());
    document.getElementById('stat-flagged-words')?.textContent && 
        (document.getElementById('stat-flagged-words').textContent = DemoData.stats.flaggedWords.toLocaleString());
    
    console.log('✅ Research Dashboard v2.0 ready');
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
