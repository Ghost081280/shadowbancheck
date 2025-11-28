/* =============================================================================
   AGENCY-DASHBOARD.JS v1.0
   ShadowBanCheck.io - Agency Dashboard (All-in-One)
   
   Everything the Agency dashboard needs in one file:
   - Auth & Session
   - Navigation
   - Toast & Modals
   - Usage Tracking (pay-per-use)
   - Clients Manager (multiple clients with accounts)
   - Search Tools
   - Results History
   - Disputes Manager
   - Support Chat
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    plan: 'Agency',
    baseFee: 29,
    perClient: 5,
    perAnalysis: 0.05,
    perQuestion: 0.02,
    perDispute: 1.00
};

// =============================================================================
// DEMO DATA
// =============================================================================
const DemoData = {
    clients: [
        { id: 1, name: 'ACME Corporation', icon: '🏭', status: 'warning', contact: 'marketing@acmecorp.com', accounts: [
            { platform: 'twitter', username: '@acmecorp', status: 'healthy', score: 12 },
            { platform: 'instagram', username: '@acme.corp', status: 'warning', score: 45 },
            { platform: 'linkedin', username: 'ACME Corp', status: 'healthy', score: 8 }
        ]},
        { id: 2, name: 'Tech Startup Inc', icon: '🚀', status: 'issues', contact: 'social@techstartup.io', accounts: [
            { platform: 'twitter', username: '@techstartup', status: 'issues', score: 67 },
            { platform: 'tiktok', username: '@techstartup', status: 'healthy', score: 15 }
        ]},
        { id: 3, name: 'Local Restaurant', icon: '🍕', status: 'issues', contact: 'owner@localrestaurant.com', accounts: [
            { platform: 'instagram', username: '@localfood', status: 'issues', score: 85 },
            { platform: 'facebook', username: 'localrestaurant', status: 'warning', score: 42 }
        ]}
    ],
    
    disputes: [
        { id: 1, client: 'Local Restaurant', platform: 'instagram', account: '@localfood', type: 'Shadow Ban Appeal', status: 'pending', submitted: '2 days ago' },
        { id: 2, client: 'Tech Startup', platform: 'twitter', account: '@techstartup', type: 'Reply Deboosting', status: 'draft', submitted: 'Draft' },
        { id: 3, client: 'ACME Corp', platform: 'instagram', account: '@acme.corp', type: 'Hashtag Restriction', status: 'resolved', submitted: 'Nov 15, 2025' }
    ],
    
    results: [
        { id: 1, type: 'power', query: 'https://twitter.com/acmecorp/status/123', platform: 'twitter', score: 23, status: 'warning', timestamp: new Date(Date.now() - 3600000) },
        { id: 2, type: 'account', query: '@localfood', platform: 'instagram', score: 85, status: 'danger', timestamp: new Date(Date.now() - 7200000) }
    ],
    
    usage: {
        scans: 247,
        questions: 89,
        disputes: 2,
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
    
    document.querySelectorAll('.agency-section').forEach(section => {
        const sectionId = section.id.replace('section-', '');
        section.classList.toggle('active', sectionId === sectionName);
    });
    
    document.querySelector('.agency-sidebar')?.classList.remove('open');
    
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
    const sidebar = document.querySelector('.agency-sidebar');
    
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
            scans: u.scans * CONFIG.perAnalysis,
            questions: u.questions * CONFIG.perQuestion,
            disputes: u.disputes * CONFIG.perDispute,
            clients: DemoData.clients.length * CONFIG.perClient,
            get total() { return this.scans + this.questions + this.disputes; },
            get grandTotal() { return CONFIG.baseFee + this.clients + this.total; }
        };
    },
    
    update() {
        const usage = DemoData.usage;
        const cost = this.calculateCost();
        const daysLeft = this.getDaysUntilReset();
        
        const scansEl = document.getElementById('usage-scans');
        const aiEl = document.getElementById('usage-ai');
        const estimateEl = document.querySelector('.usage-estimate');
        
        if (scansEl) scansEl.textContent = `${usage.scans} scans`;
        if (aiEl) aiEl.textContent = `${usage.questions} questions`;
        if (estimateEl) {
            estimateEl.innerHTML = `Estimated bill: <strong>$${cost.total.toFixed(2)}</strong> (${usage.scans} × $0.05 + ${usage.questions} × $0.02) • Resets in ${daysLeft} days`;
        }
        
        // Progress bars (visual only - agency is unlimited)
        const scanBar = document.querySelector('.usage-item:first-child .usage-bar-fill');
        const aiBar = document.querySelector('.usage-item:last-child .usage-bar-fill');
        if (scanBar) scanBar.style.width = `${Math.min(100, (usage.scans / 500) * 100)}%`;
        if (aiBar) aiBar.style.width = `${Math.min(100, (usage.questions / 250) * 100)}%`;
    },
    
    incrementScan() {
        DemoData.usage.scans++;
        this.update();
    }
};

// =============================================================================
// CLIENTS MANAGER
// =============================================================================
const ClientsManager = {
    getPlatformIcon(platform) {
        const icons = { twitter: '𝕏', instagram: '📷', tiktok: '♪', reddit: '🤖', facebook: 'ⓕ', youtube: '▶', linkedin: 'in' };
        return icons[platform] || '🌐';
    },
    
    getStatusBadge(status) {
        const badges = { healthy: '✅ Healthy', warning: '⚠️ Warning', issues: '🔶 Issues' };
        return badges[status] || status;
    },
    
    add(name, contact, icon = '🏢') {
        const client = {
            id: DemoData.clients.length + 1,
            name, icon, contact,
            status: 'healthy',
            accounts: []
        };
        DemoData.clients.push(client);
        this.render();
        this.updateStats();
        UsageTracker.update();
        return client;
    },
    
    remove(id) {
        const index = DemoData.clients.findIndex(c => c.id === id);
        if (index > -1) {
            DemoData.clients.splice(index, 1);
            this.render();
            this.updateStats();
            UsageTracker.update();
        }
    },
    
    checkAll(id) {
        const client = DemoData.clients.find(c => c.id === id);
        if (!client) return;
        
        showToast('🔍', `Checking ${client.accounts.length} accounts for ${client.name}...`);
        
        setTimeout(() => {
            let worstStatus = 'healthy';
            client.accounts.forEach(acc => {
                acc.score = Math.floor(Math.random() * 100);
                acc.status = acc.score < 30 ? 'healthy' : acc.score < 60 ? 'warning' : 'issues';
                if (acc.status === 'issues') worstStatus = 'issues';
                else if (acc.status === 'warning' && worstStatus !== 'issues') worstStatus = 'warning';
            });
            client.status = worstStatus;
            
            UsageTracker.incrementScan();
            this.render();
            this.updateStats();
            showToast('✅', `Checked ${client.accounts.length} accounts for ${client.name}`);
        }, 2000);
    },
    
    render() {
        const container = document.getElementById('clients-grid');
        if (!container) return;
        
        if (DemoData.clients.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <span class="empty-icon">👥</span>
                    <h3>No Clients Yet</h3>
                    <p>Add your first client to start managing their accounts.</p>
                    <button class="primary-btn" onclick="openModal('add-client-modal')">➕ Add Client</button>
                </div>`;
            return;
        }
        
        container.innerHTML = DemoData.clients.map(client => `
            <div class="client-card" data-client-id="${client.id}">
                <div class="client-card-header">
                    <h3>${client.icon} ${client.name}</h3>
                    <span class="client-status ${client.status}">${this.getStatusBadge(client.status)}</span>
                </div>
                <div class="client-card-body">
                    <div class="client-accounts">
                        ${client.accounts.map(acc => `
                            <div class="client-account-chip">
                                <span class="status-dot ${acc.status}"></span>
                                <span>${this.getPlatformIcon(acc.platform)} ${acc.username}</span>
                            </div>
                        `).join('')}
                        ${client.accounts.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.8125rem;">No accounts yet</p>' : ''}
                    </div>
                    <p style="font-size: 0.8125rem; color: var(--text-muted);">Contact: ${client.contact}</p>
                </div>
                <div class="client-card-footer">
                    <button class="secondary-btn btn-sm" onclick="ClientsManager.checkAll(${client.id})">🔍 Check All</button>
                    <button class="secondary-btn btn-sm" onclick="showToast('👁️', 'Viewing ${client.name}')">👁️ Details</button>
                    <button class="secondary-btn btn-sm" onclick="DisputesManager.start(${client.id})">📋 Dispute</button>
                </div>
            </div>
        `).join('');
    },
    
    updateStats() {
        const clients = DemoData.clients;
        const totalAccounts = clients.reduce((sum, c) => sum + c.accounts.length, 0);
        const healthy = clients.reduce((sum, c) => sum + c.accounts.filter(a => a.status === 'healthy').length, 0);
        const issues = clients.reduce((sum, c) => sum + c.accounts.filter(a => a.status === 'issues' || a.status === 'warning').length, 0);
        
        const els = {
            clients: document.getElementById('stat-clients'),
            accounts: document.getElementById('stat-accounts'),
            healthy: document.getElementById('stat-healthy'),
            issues: document.getElementById('stat-issues'),
            navCount: document.getElementById('nav-client-count')
        };
        
        if (els.clients) els.clients.textContent = clients.length;
        if (els.accounts) els.accounts.textContent = totalAccounts;
        if (els.healthy) els.healthy.textContent = healthy;
        if (els.issues) els.issues.textContent = issues;
        if (els.navCount) els.navCount.textContent = clients.length;
    }
};

window.ClientsManager = ClientsManager;

// =============================================================================
// DISPUTES MANAGER
// =============================================================================
const DisputesManager = {
    getStatusClass(status) {
        const classes = { draft: 'warning', pending: 'info', resolved: 'success', rejected: 'danger' };
        return classes[status] || '';
    },
    
    getStatusLabel(status) {
        const labels = { draft: 'Draft', pending: 'Awaiting Response', resolved: 'Resolved ✓', rejected: 'Rejected' };
        return labels[status] || status;
    },
    
    getPlatformIcon(platform) {
        const icons = { twitter: '𝕏', instagram: '📷', tiktok: '♪', facebook: 'ⓕ' };
        return icons[platform] || '🌐';
    },
    
    start(clientId) {
        const client = DemoData.clients.find(c => c.id === clientId);
        if (!client) return;
        showToast('📋', `Starting dispute for ${client.name}...`);
        switchSection('resolution');
    },
    
    render() {
        const container = document.getElementById('disputes-list');
        if (!container) return;
        
        if (DemoData.disputes.length === 0) {
            container.innerHTML = `<div class="empty-state-small"><span>📋</span><p>No disputes yet.</p></div>`;
            return;
        }
        
        container.innerHTML = DemoData.disputes.map(d => `
            <div class="client-list-item">
                <div class="client-avatar" style="background: linear-gradient(135deg, ${d.status === 'resolved' ? '#22c55e, #10b981' : d.status === 'pending' ? '#3b82f6, #6366f1' : '#f59e0b, #eab308'});">
                    ${this.getPlatformIcon(d.platform)}
                </div>
                <div class="client-info">
                    <div class="client-name">${d.client} - ${d.type}</div>
                    <div class="client-meta">${d.account} • ${d.submitted}</div>
                </div>
                <span class="badge ${this.getStatusClass(d.status)}">${this.getStatusLabel(d.status)}</span>
            </div>
        `).join('');
    }
};

window.DisputesManager = DisputesManager;

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
        DemoData.results.unshift({ id: DemoData.results.length + 1, type, query, platform, score, status, timestamp: new Date() });
        this.render();
    },
    
    render(filter = 'all') {
        const container = document.getElementById('results-list');
        if (!container) return;
        
        const results = filter === 'all' ? DemoData.results : DemoData.results.filter(r => r.type === filter);
        
        if (results.length === 0) {
            container.innerHTML = `<div class="empty-state-small"><span>📊</span><p>No results yet.</p></div>`;
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
        showToast('🔍', 'Running Power Check ($0.05)...');
        setTimeout(() => {
            const score = Math.floor(Math.random() * 100);
            ResultsManager.add('power', url, this.detectPlatform(url), score);
            UsageTracker.incrementScan();
            showToast('✅', `Power Check: ${score}% probability`);
            switchSection('results');
        }, 2000);
    },
    
    runURLCheck(url) {
        if (!url) { showToast('⚠️', 'Please enter a URL'); return; }
        showToast('🔍', 'Analyzing post ($0.05)...');
        setTimeout(() => {
            const score = Math.floor(Math.random() * 100);
            ResultsManager.add('url', url, this.detectPlatform(url), score);
            UsageTracker.incrementScan();
            showToast('✅', `URL Check: ${score}% probability`);
        }, 1500);
    },
    
    runHashtagCheck(hashtags) {
        if (!hashtags) { showToast('⚠️', 'Please enter hashtags'); return; }
        showToast('🔍', 'Checking hashtags ($0.05)...');
        setTimeout(() => {
            const score = Math.floor(Math.random() * 30);
            ResultsManager.add('hashtag', hashtags, 'all', score);
            UsageTracker.incrementScan();
            showToast('✅', `Hashtag Check: ${score}% risk`);
        }, 1500);
    },
    
    runAccountCheck(platform, username) {
        if (!platform || !username) { showToast('⚠️', 'Please select platform and enter username'); return; }
        showToast('🔍', 'Checking account ($0.05)...');
        setTimeout(() => {
            const score = Math.floor(Math.random() * 100);
            ResultsManager.add('account', username, platform, score);
            UsageTracker.incrementScan();
            showToast('✅', `Account Check: ${score}% probability`);
        }, 1500);
    }
};

window.SearchTools = SearchTools;

// =============================================================================
// SUPPORT CHAT
// =============================================================================
const SupportChat = {
    messages: [
        { from: 'system', text: 'Welcome to Agency support! How can we help?', time: 'Just now' }
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
            this.messages.push({ from: 'admin', text: 'Thanks for reaching out! An admin will respond shortly.', time: 'Just now' });
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
    console.log('🚀 Agency Dashboard v1.0 initializing...');
    
    initNavigation();
    initModals();
    
    // Logout
    document.querySelectorAll('.logout-btn, #agency-logout-btn').forEach(btn => {
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
    
    // Add client modal
    document.getElementById('modal-add-client')?.addEventListener('click', () => {
        const name = document.getElementById('new-client-name')?.value;
        const email = document.getElementById('new-client-email')?.value;
        
        if (!name) { showToast('⚠️', 'Enter client name'); return; }
        
        ClientsManager.add(name, email || 'No contact');
        closeModal('add-client-modal');
        showToast('✅', `Added ${name}! (+$5/mo)`);
        
        document.getElementById('new-client-name').value = '';
        document.getElementById('new-client-email').value = '';
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
    ClientsManager.render();
    ClientsManager.updateStats();
    ResultsManager.render();
    DisputesManager.render();
    SupportChat.init();
    
    console.log('✅ Agency Dashboard ready');
}

// Run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
