/* =============================================================================
   PRO-DASHBOARD.JS v1.0
   ShadowBanCheck.io - Pro Dashboard (All-in-One)
   
   Everything the Pro dashboard needs in one file:
   - Auth & Session
   - Navigation
   - Toast & Modals
   - Usage Tracking
   - Accounts Manager
   - Search Tools
   - Results History
   - Support Chat
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    plan: 'Pro',
    analysesIncluded: 100,
    questionsIncluded: 25,
    overageAnalysis: 0.08,
    overageQuestion: 0.04,
    maxAccounts: 15
};

// =============================================================================
// DEMO DATA
// =============================================================================
const DemoData = {
    accounts: [
        { id: 1, platform: 'twitter', username: '@mybusiness', nickname: 'Business Account', status: 'healthy', score: 12, lastCheck: '2 hours ago' },
        { id: 2, platform: 'instagram', username: '@mybrand', nickname: 'Brand IG', status: 'warning', score: 45, lastCheck: '1 hour ago' },
        { id: 3, platform: 'tiktok', username: '@mytiktok', nickname: 'TikTok Main', status: 'healthy', score: 8, lastCheck: '30 min ago' }
    ],
    
    results: [
        { id: 1, type: 'power', query: 'https://twitter.com/user/status/123', platform: 'twitter', score: 23, status: 'warning', timestamp: new Date(Date.now() - 3600000) },
        { id: 2, type: 'account', query: '@testuser', platform: 'instagram', score: 8, status: 'healthy', timestamp: new Date(Date.now() - 7200000) },
        { id: 3, type: 'hashtag', query: '#fitness #health', platform: 'all', score: 0, status: 'healthy', timestamp: new Date(Date.now() - 10800000) },
        { id: 4, type: 'url', query: 'https://instagram.com/p/ABC123', platform: 'instagram', score: 67, status: 'danger', timestamp: new Date(Date.now() - 14400000) }
    ],
    
    usage: {
        analyses: 47,
        questions: 12,
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
// MODALS
// =============================================================================
function openModal(id) {
    document.getElementById(id)?.classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
}

window.openModal = openModal;
window.closeModal = closeModal;

function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay')?.classList.add('hidden');
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
        }
    });
}

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
    
    document.querySelector('.dashboard-sidebar')?.classList.remove('open');
    
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
    const sidebar = document.querySelector('.dashboard-sidebar');
    
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
    
    update() {
        const usage = DemoData.usage;
        const daysLeft = this.getDaysUntilReset();
        
        const analysesEl = document.getElementById('usage-analyses');
        const questionsEl = document.getElementById('usage-questions');
        const estimateEl = document.querySelector('.usage-estimate');
        
        if (analysesEl) analysesEl.textContent = `${usage.analyses} / ${CONFIG.analysesIncluded}`;
        if (questionsEl) questionsEl.textContent = `${usage.questions} / ${CONFIG.questionsIncluded}`;
        
        const overageAnalyses = Math.max(0, usage.analyses - CONFIG.analysesIncluded);
        const overageQuestions = Math.max(0, usage.questions - CONFIG.questionsIncluded);
        const overageCost = (overageAnalyses * CONFIG.overageAnalysis) + (overageQuestions * CONFIG.overageQuestion);
        
        if (estimateEl) {
            if (overageCost > 0) {
                estimateEl.innerHTML = `<span class="usage-overage-warning">⚠️ Overage charges: <strong>$${overageCost.toFixed(2)}</strong></span> • Resets in ${daysLeft} days`;
            } else {
                estimateEl.innerHTML = `You're within your included limits • Resets in ${daysLeft} days`;
            }
        }
        
        // Progress bars
        const analysisBar = document.querySelector('.usage-item:first-child .usage-bar-fill');
        const questionBar = document.querySelector('.usage-item:last-child .usage-bar-fill');
        
        if (analysisBar) {
            const pct = (usage.analyses / CONFIG.analysesIncluded) * 100;
            analysisBar.style.width = `${Math.min(100, pct)}%`;
            analysisBar.classList.remove('warning', 'danger');
            if (pct >= 100) analysisBar.classList.add('danger');
            else if (pct >= 80) analysisBar.classList.add('warning');
        }
        
        if (questionBar) {
            const pct = (usage.questions / CONFIG.questionsIncluded) * 100;
            questionBar.style.width = `${Math.min(100, pct)}%`;
            questionBar.classList.remove('warning', 'danger');
            if (pct >= 100) questionBar.classList.add('danger');
            else if (pct >= 80) questionBar.classList.add('warning');
        }
    },
    
    incrementAnalysis() {
        DemoData.usage.analyses++;
        this.update();
    }
};

// =============================================================================
// ACCOUNTS MANAGER
// =============================================================================
const AccountsManager = {
    getPlatformEmoji(platform) {
        const emojis = { twitter: '🐦', instagram: '📸', tiktok: '🎵', reddit: '🤖', facebook: '📘', youtube: '📺', linkedin: '💼' };
        return emojis[platform] || '🌐';
    },
    
    getPlatformName(platform) {
        const names = { twitter: 'Twitter/X', instagram: 'Instagram', tiktok: 'TikTok', reddit: 'Reddit', facebook: 'Facebook', youtube: 'YouTube', linkedin: 'LinkedIn' };
        return names[platform] || platform;
    },
    
    add(platform, username, nickname) {
        if (DemoData.accounts.length >= CONFIG.maxAccounts) {
            showToast('⚠️', `Maximum ${CONFIG.maxAccounts} accounts allowed`);
            return null;
        }
        
        const account = {
            id: DemoData.accounts.length + 1,
            platform,
            username: username.startsWith('@') ? username : `@${username}`,
            nickname: nickname || username,
            status: 'pending',
            score: null,
            lastCheck: 'Never'
        };
        
        DemoData.accounts.push(account);
        this.render();
        this.updateStats();
        return account;
    },
    
    remove(id) {
        const index = DemoData.accounts.findIndex(a => a.id === id);
        if (index > -1) {
            DemoData.accounts.splice(index, 1);
            this.render();
            this.updateStats();
        }
    },
    
    check(id) {
        const account = DemoData.accounts.find(a => a.id === id);
        if (account) {
            showToast('🔍', `Checking ${account.username}...`);
            setTimeout(() => {
                account.score = Math.floor(Math.random() * 100);
                account.status = account.score < 30 ? 'healthy' : account.score < 60 ? 'warning' : 'danger';
                account.lastCheck = 'Just now';
                UsageTracker.incrementAnalysis();
                this.render();
                this.updateStats();
                showToast('✅', `${account.username}: ${account.score}% probability`);
            }, 1500);
        }
    },
    
    render() {
        const container = document.getElementById('accounts-list');
        if (!container) return;
        
        if (DemoData.accounts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">👤</span>
                    <h3>No Accounts Yet</h3>
                    <p>Add your first account to start monitoring.</p>
                    <button class="primary-btn" onclick="openModal('add-account-modal')">➕ Add Account</button>
                </div>`;
            return;
        }
        
        container.innerHTML = DemoData.accounts.map(acc => `
            <div class="result-item" data-account-id="${acc.id}">
                <div class="result-icon ${acc.status}">${this.getPlatformEmoji(acc.platform)}</div>
                <div class="result-content">
                    <div class="result-title">${acc.nickname}</div>
                    <div class="result-meta">
                        <span>${acc.username}</span> • <span>${this.getPlatformName(acc.platform)}</span> • <span>Last: ${acc.lastCheck}</span>
                    </div>
                    <div class="result-actions">
                        <button class="action-btn" onclick="AccountsManager.check(${acc.id})">🔍 Check</button>
                        <button class="action-btn" onclick="AccountsManager.remove(${acc.id})">🗑️ Remove</button>
                    </div>
                </div>
                <div class="result-score">
                    ${acc.score !== null ? `<span class="score-value ${acc.status}">${acc.score}%</span><span class="score-label">probability</span>` : `<span class="score-value" style="color: var(--text-muted)">--</span><span class="score-label">not checked</span>`}
                </div>
            </div>
        `).join('');
    },
    
    updateStats() {
        const accounts = DemoData.accounts;
        const healthy = accounts.filter(a => a.status === 'healthy').length;
        const warning = accounts.filter(a => a.status === 'warning').length;
        const danger = accounts.filter(a => a.status === 'danger').length;
        
        const els = {
            healthy: document.getElementById('stat-healthy'),
            issues: document.getElementById('stat-issues'),
            banned: document.getElementById('stat-banned'),
            total: document.getElementById('stat-total'),
            count: document.getElementById('accounts-count')
        };
        
        if (els.healthy) els.healthy.textContent = healthy;
        if (els.issues) els.issues.textContent = warning;
        if (els.banned) els.banned.textContent = danger;
        if (els.total) els.total.textContent = accounts.length;
        if (els.count) els.count.textContent = accounts.length;
    }
};

window.AccountsManager = AccountsManager;

// =============================================================================
// RESULTS MANAGER
// =============================================================================
const ResultsManager = {
    getTypeEmoji(type) {
        const emojis = { power: '⚡', account: '👤', url: '📝', hashtag: '#️⃣' };
        return emojis[type] || '🔍';
    },
    
    getTypeLabel(type) {
        const labels = { power: 'Power Check (3-in-1)', account: 'Account Check', url: 'URL Check', hashtag: 'Hashtag Check' };
        return labels[type] || 'Check';
    },
    
    formatTime(date) {
        const hours = Math.floor((new Date() - date) / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    },
    
    add(type, query, platform, score) {
        const status = score < 30 ? 'healthy' : score < 60 ? 'warning' : 'danger';
        DemoData.results.unshift({
            id: DemoData.results.length + 1,
            type, query, platform, score, status,
            timestamp: new Date()
        });
        this.render();
    },
    
    render(filter = 'all') {
        const container = document.getElementById('results-list');
        if (!container) return;
        
        const results = filter === 'all' ? DemoData.results : DemoData.results.filter(r => r.type === filter);
        
        if (results.length === 0) {
            container.innerHTML = `<div class="empty-state-small"><span>📊</span><p>No results yet. Run a search to see history.</p></div>`;
            return;
        }
        
        container.innerHTML = results.map(r => `
            <div class="result-item">
                <div class="result-icon ${r.status}">${this.getTypeEmoji(r.type)}</div>
                <div class="result-content">
                    <div class="result-title">${this.getTypeLabel(r.type)}</div>
                    <div class="result-meta">
                        <span>${r.query.length > 40 ? r.query.substring(0, 40) + '...' : r.query}</span> • <span>${r.platform}</span> • <span>${this.formatTime(r.timestamp)}</span>
                    </div>
                </div>
                <div class="result-score">
                    <span class="score-value ${r.status}">${r.score}%</span>
                    <span class="score-label">probability</span>
                </div>
            </div>
        `).join('');
    }
};

window.ResultsManager = ResultsManager;

// =============================================================================
// SEARCH TOOLS
// =============================================================================
const SearchTools = {
    detectPlatform(url) {
        if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
        if (url.includes('instagram.com')) return 'instagram';
        if (url.includes('tiktok.com')) return 'tiktok';
        if (url.includes('reddit.com')) return 'reddit';
        if (url.includes('facebook.com')) return 'facebook';
        if (url.includes('youtube.com')) return 'youtube';
        if (url.includes('linkedin.com')) return 'linkedin';
        return 'unknown';
    },
    
    runPowerCheck(url) {
        if (!url) { showToast('⚠️', 'Please enter a URL'); return; }
        showToast('🔍', 'Running Power Check...');
        setTimeout(() => {
            const score = Math.floor(Math.random() * 100);
            ResultsManager.add('power', url, this.detectPlatform(url), score);
            UsageTracker.incrementAnalysis();
            showToast('✅', `Power Check: ${score}% probability`);
            switchSection('results');
        }, 2000);
    },
    
    runURLCheck(url) {
        if (!url) { showToast('⚠️', 'Please enter a URL'); return; }
        showToast('🔍', 'Analyzing post...');
        setTimeout(() => {
            const score = Math.floor(Math.random() * 100);
            ResultsManager.add('url', url, this.detectPlatform(url), score);
            UsageTracker.incrementAnalysis();
            showToast('✅', `URL Check: ${score}% probability`);
            switchSection('results');
        }, 1500);
    },
    
    runHashtagCheck(hashtags) {
        if (!hashtags) { showToast('⚠️', 'Please enter hashtags'); return; }
        showToast('🔍', 'Checking hashtags...');
        setTimeout(() => {
            const score = Math.floor(Math.random() * 30);
            ResultsManager.add('hashtag', hashtags, 'all', score);
            UsageTracker.incrementAnalysis();
            showToast('✅', `Hashtag Check: ${score}% risk`);
            switchSection('results');
        }, 1500);
    },
    
    runAccountCheck(platform, username) {
        if (!platform || !username) { showToast('⚠️', 'Please select platform and enter username'); return; }
        showToast('🔍', 'Checking account...');
        setTimeout(() => {
            const score = Math.floor(Math.random() * 100);
            ResultsManager.add('account', username, platform, score);
            UsageTracker.incrementAnalysis();
            showToast('✅', `Account Check: ${score}% probability`);
            switchSection('results');
        }, 1500);
    }
};

window.SearchTools = SearchTools;

// =============================================================================
// SUPPORT CHAT
// =============================================================================
const SupportChat = {
    messages: [
        { from: 'system', text: 'Welcome to ShadowBanCheck support! How can we help?', time: 'Just now' }
    ],
    
    render() {
        const container = document.querySelector('.chat-widget-body');
        if (!container) return;
        
        container.innerHTML = this.messages.map(msg => {
            if (msg.from === 'system') {
                return `<div class="chat-message system"><div class="chat-message-content"><div class="chat-message-bubble system-bubble">${msg.text}</div></div></div>`;
            }
            return `<div class="chat-message ${msg.from}"><div class="chat-message-avatar">${msg.from === 'admin' ? '👤' : '😊'}</div><div class="chat-message-content"><div class="chat-message-bubble">${msg.text}</div><div class="chat-message-time">${msg.time}</div></div></div>`;
        }).join('');
        
        container.scrollTop = container.scrollHeight;
    },
    
    send(text) {
        if (!text.trim()) return;
        this.messages.push({ from: 'user', text: text.trim(), time: 'Just now' });
        this.render();
        
        setTimeout(() => {
            this.messages.push({ from: 'admin', text: 'Thanks for reaching out! An admin will respond shortly. Try Shadow AI for instant help.', time: 'Just now' });
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
    console.log('🚀 Pro Dashboard v1.0 initializing...');
    
    initNavigation();
    initModals();
    
    // Logout
    document.querySelectorAll('.logout-btn, #logout-btn').forEach(btn => {
        btn.addEventListener('click', () => { if (confirm('Logout?')) Auth.logout(); });
    });
    
    // Search forms
    document.getElementById('power-check-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        SearchTools.runPowerCheck(document.getElementById('power-url')?.value);
    });
    
    document.getElementById('url-check-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        SearchTools.runURLCheck(document.getElementById('url-input')?.value);
    });
    
    document.getElementById('hashtag-check-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        SearchTools.runHashtagCheck(document.getElementById('hashtag-input')?.value);
    });
    
    document.getElementById('account-check-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        SearchTools.runAccountCheck(
            document.getElementById('account-platform')?.value,
            document.getElementById('account-username')?.value
        );
    });
    
    // Add account modal
    document.getElementById('modal-add-account')?.addEventListener('click', () => {
        const platform = document.getElementById('new-platform')?.value;
        const username = document.getElementById('new-username')?.value;
        const nickname = document.getElementById('new-nickname')?.value;
        
        if (!platform || !username) { showToast('⚠️', 'Select platform and enter username'); return; }
        
        AccountsManager.add(platform, username, nickname);
        closeModal('add-account-modal');
        showToast('✅', `Added ${username}!`);
        
        document.getElementById('new-platform').value = '';
        document.getElementById('new-username').value = '';
        document.getElementById('new-nickname').value = '';
    });
    
    // Results filter tabs
    document.querySelectorAll('.results-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.results-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            ResultsManager.render(tab.dataset.filter);
        });
    });
    
    // Support form
    document.getElementById('support-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('✅', 'Message sent!');
        e.target.reset();
    });
    
    // Initial renders
    UsageTracker.update();
    AccountsManager.render();
    AccountsManager.updateStats();
    ResultsManager.render();
    SupportChat.init();
    
    console.log('✅ Pro Dashboard ready');
}

// Run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
