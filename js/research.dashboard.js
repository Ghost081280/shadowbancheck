/* =============================================================================
   RESEARCH-DASHBOARD.JS v1.0
   ShadowBanCheck.io - Research Dashboard (All-in-One)
   
   Everything the Research dashboard needs in one file:
   - Auth & Session
   - Navigation
   - Toast & Modals
   - Usage Tracking (pay-per-question)
   - Data Search & Filtering
   - Trend Analysis
   - Platform Analysis
   - Hashtag Database
   - Data Exports
   - Support Chat
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    plan: 'Research',
    baseFee: 49,
    perQuestion: 0.25,  // Higher than agency since deep analysis of aggregated data
    exportsIncluded: Infinity,  // Unlimited exports
    maxExportRows: 10000
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
    
    // Export history
    exportHistory: [
        { id: 1, name: 'All Detections - Nov 2025', format: 'CSV', rows: 8543, date: '2025-11-28', size: '2.4 MB' },
        { id: 2, name: 'Twitter High Probability', format: 'CSV', rows: 1247, date: '2025-11-25', size: '456 KB' },
        { id: 3, name: 'Hashtag Database Snapshot', format: 'JSON', rows: 1847, date: '2025-11-20', size: '892 KB' }
    ],
    
    // Usage tracking
    usage: {
        questions: 12,
        exports: 3,
        resetDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
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
        localStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.STORAGE_KEY);
        window.location.href = 'login.html';
    }
};

// =============================================================================
// TOAST
// =============================================================================
function showToast(icon, message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast) return;
    
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
// NAVIGATION
// =============================================================================
function switchSection(sectionName, updateHash = true) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
    });
    
    document.querySelectorAll('.dashboard-section').forEach(section => {
        const sectionId = section.id.replace('section-', '');
        section.classList.toggle('active', sectionId === sectionName);
    });
    
    document.querySelector('.research-sidebar')?.classList.remove('open');
    
    if (updateHash) history.pushState(null, '', `#${sectionName}`);
}

window.switchSection = switchSection;

function initNavigation() {
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(item.dataset.section);
        });
    });
    
    const hash = window.location.hash.slice(1);
    if (hash) switchSection(hash, false);
    
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1);
        if (hash) switchSection(hash, false);
    });
    
    // Mobile menu
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.research-sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
        
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}

// =============================================================================
// USAGE TRACKER
// =============================================================================
const UsageTracker = {
    getDaysUntilReset() {
        const diff = DemoData.usage.resetDate - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
        
        // Progress bars (visual)
        const questionBar = document.querySelector('.usage-item:first-child .usage-bar-fill');
        const exportBar = document.querySelector('.usage-item:last-child .usage-bar-fill');
        
        if (questionBar) {
            // Arbitrary scale for visualization - 50 questions = 100%
            questionBar.style.width = `${Math.min(100, (usage.questions / 50) * 100)}%`;
        }
        
        if (exportBar) {
            // Arbitrary scale - 50 exports = 100%
            exportBar.style.width = `${Math.min(100, (usage.exports / 50) * 100)}%`;
        }
    },
    
    incrementQuestion() {
        DemoData.usage.questions++;
        this.update();
        showToast('🤖', `AI question charged: $${CONFIG.perQuestion}`);
    },
    
    incrementExport() {
        DemoData.usage.exports++;
        this.update();
    }
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
        
        // Simulate search
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
        
        // Generate fake filtered results based on filters
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
        const totalResults = results.length * 1000 + Math.floor(Math.random() * 500); // Fake larger number
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
        
        // Filter by query
        if (query) {
            const q = query.toLowerCase().replace('#', '');
            hashtags = hashtags.filter(h => h.tag.toLowerCase().includes(q));
        }
        
        // Filter by platform
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
    
    exportQuick(type) {
        const exports = {
            'all-detections': { name: 'All Detections (Last 30 days)', format: 'CSV', rows: 8500 },
            'hashtags': { name: 'Flagged Hashtags Database', format: 'CSV', rows: 1847 },
            'high-prob': { name: 'High Probability Detections', format: 'CSV', rows: 2100 },
            'trends': { name: 'Trend Analysis Report', format: 'JSON', rows: 52 }
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
    
    // Initialize hashtag tabs
    initHashtagTabs() {
        const tabs = document.querySelectorAll('#section-hashtags .results-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const filter = tab.dataset.filter;
                this.filterHashtags(filter);
            });
        });
    },
    
    filterHashtags(status) {
        const container = document.getElementById('hashtag-results');
        if (!container) return;
        
        let hashtags = [...DemoData.hashtags];
        
        if (status !== 'all') {
            hashtags = hashtags.filter(h => h.status === status);
        }
        
        // Re-render with filtered data
        if (hashtags.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <span>#️⃣</span>
                    <p>No ${status} hashtags found.</p>
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
    console.log('🚀 Research Dashboard v1.0 initializing...');
    
    initNavigation();
    
    // Logout
    document.querySelectorAll('.logout-btn, #research-logout-btn').forEach(btn => {
        btn.addEventListener('click', () => { if (confirm('Logout?')) Auth.logout(); });
    });
    
    // Support form
    document.getElementById('support-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('✅', 'Message sent!');
        e.target.reset();
    });
    
    // Search form
    document.getElementById('search-keyword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            ResearchManager.search();
        }
    });
    
    // Hashtag search
    document.getElementById('hashtag-search')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            ResearchManager.searchHashtags();
        }
    });
    
    // Initial renders
    UsageTracker.update();
    ResearchManager.renderRecentDetections();
    ResearchManager.renderHashtags();
    ResearchManager.renderExportHistory();
    ResearchManager.initPlatformFilters();
    ResearchManager.initHashtagTabs();
    SupportChat.init();
    
    console.log('✅ Research Dashboard ready');
}

// Run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
