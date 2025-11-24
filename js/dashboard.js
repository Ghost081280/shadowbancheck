/* =============================================================================
   DASHBOARD.JS - Clean Dashboard Functionality
   ============================================================================= */

// Mock Data
const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    plan: { name: 'Pro', price: 9.99, accountLimit: 15, aiPerDay: 10 },
    usage: { accounts: 8, aiUsed: 7 }
};

const accounts = [
    { id: 1, platform: 'instagram', icon: '📸', username: '@johndoe', nickname: 'Personal', status: 'healthy', score: 95, lastCheck: '2h ago' },
    { id: 2, platform: 'tiktok', icon: '🎵', username: '@johndoe_tiktok', nickname: 'TikTok', status: 'banned', score: 15, lastCheck: '2h ago' },
    { id: 3, platform: 'twitter', icon: '🐦', username: '@johndoe_x', nickname: 'Twitter', status: 'healthy', score: 92, lastCheck: '2h ago' },
    { id: 4, platform: 'youtube', icon: '▶️', username: 'JohnDoeChannel', nickname: 'YouTube', status: 'healthy', score: 88, lastCheck: '3h ago' },
    { id: 5, platform: 'facebook', icon: '📘', username: 'john.doe', nickname: 'Facebook', status: 'healthy', score: 90, lastCheck: '3h ago' },
    { id: 6, platform: 'linkedin', icon: '💼', username: 'johndoe', nickname: 'Professional', status: 'healthy', score: 100, lastCheck: '4h ago' },
    { id: 7, platform: 'instagram', icon: '📸', username: '@mybrand', nickname: 'Business', status: 'issues', score: 62, lastCheck: '1h ago' },
    { id: 8, platform: 'threads', icon: '🧵', username: '@johndoe', nickname: 'Threads', status: 'healthy', score: 85, lastCheck: '4h ago' }
];

// AI Hashtag Alternatives (placeholder for backend)
const hashtagAlternatives = {
    '#fitness': ['#fitnessjourney', '#fitlife', '#workoutmotivation'],
    '#gym': ['#gymlife', '#gymmotivation', '#strengthtraining'],
    '#weightloss': ['#weightlossjourney', '#healthylifestyle', '#transformation'],
    '#diet': ['#healthyeating', '#nutrition', '#cleaneating'],
    '#money': ['#personalfinance', '#financialfreedom', '#investing'],
    '#crypto': ['#cryptocurrency', '#blockchain', '#web3'],
    '#adult': ['No alternatives - content policy violation'],
    '#follow4follow': ['#communitybuilding', '#engagement', '#connectwithme'],
    '#likeforlike': ['#engagementtips', '#growthtips', '#socialmediatips']
};

// Platform icons
const platformIcons = {
    instagram: '📸',
    tiktok: '🎵',
    twitter: '🐦',
    facebook: '📘',
    youtube: '▶️',
    linkedin: '💼',
    reddit: '🤖',
    threads: '🧵'
};

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSidebar();
    initTabs();
    initQuickActions();
    initAccountsPage();
    initTools();
    initAI();
    initForms();
    populateDashboard();
    
    // Check hash
    const hash = window.location.hash.slice(1);
    if (hash) navigateTo(hash);
});

// =============================================================================
// NAVIGATION
// =============================================================================
function initNavigation() {
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.section);
            closeSidebar();
        });
    });
}

function navigateTo(sectionId) {
    // Update URL
    window.location.hash = sectionId;
    
    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    // Scroll to top
    document.querySelector('.content-scroll').scrollTop = 0;
}

// =============================================================================
// SIDEBAR (Mobile)
// =============================================================================
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('menu-toggle');
    const close = document.getElementById('sidebar-close');
    
    toggle?.addEventListener('click', () => sidebar.classList.add('open'));
    close?.addEventListener('click', closeSidebar);
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            !toggle.contains(e.target)) {
            closeSidebar();
        }
    });
}

function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
}

// =============================================================================
// TABS (Settings)
// =============================================================================
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.toggle('active', t.dataset.tab === tabId);
            });
            
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.toggle('active', panel.id === `panel-${tabId}`);
            });
        });
    });
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================
function initQuickActions() {
    document.querySelectorAll('.action-btn, [data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
            switch (action) {
                case 'check-all':
                    runBulkCheck();
                    break;
                case 'add-account':
                    openAddAccountModal();
                    break;
                case 'check-hashtags':
                    navigateTo('tools');
                    break;
            }
        });
    });
}

// =============================================================================
// ACCOUNTS PAGE
// =============================================================================
function initAccountsPage() {
    // Filters
    document.querySelectorAll('.filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAccounts(btn.dataset.filter);
        });
    });
    
    // Add account button
    document.getElementById('add-account-btn')?.addEventListener('click', openAddAccountModal);
}

function filterAccounts(filter) {
    document.querySelectorAll('.account-card').forEach(card => {
        const status = card.dataset.status;
        card.style.display = (filter === 'all' || status === filter) ? '' : 'none';
    });
}

function renderAccounts() {
    const grid = document.getElementById('accounts-grid');
    if (!grid) return;
    
    grid.innerHTML = accounts.map(acc => `
        <div class="account-card" data-status="${acc.status}" data-id="${acc.id}">
            <div class="account-top">
                <div class="account-info">
                    <h4>${acc.icon} ${acc.username}</h4>
                    <span>${acc.nickname}</span>
                </div>
                <span class="account-badge ${acc.status}">
                    ${acc.status === 'healthy' ? '✓ Healthy' : acc.status === 'issues' ? '! Issues' : '✕ Banned'}
                </span>
            </div>
            <div class="account-meta">
                <span>Score: ${acc.score}%</span>
                <span>Checked: ${acc.lastCheck}</span>
            </div>
            <div class="account-actions">
                <button onclick="checkAccount(${acc.id})">🔍 Check</button>
                <button onclick="viewAccount(${acc.id})">📊 Details</button>
                <button class="btn-remove" onclick="removeAccount(${acc.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderMiniAccounts() {
    const container = document.getElementById('mini-accounts');
    if (!container) return;
    
    container.innerHTML = accounts.slice(0, 5).map(acc => `
        <div class="mini-account">
            <span>${acc.icon}</span>
            <span>${acc.username}</span>
            <span class="status ${acc.status}">${acc.status}</span>
        </div>
    `).join('');
}

// Account actions
window.checkAccount = function(id) {
    const acc = accounts.find(a => a.id === id);
    showToast('🔍', `Checking ${acc.username}...`);
    setTimeout(() => {
        acc.lastCheck = 'Just now';
        renderAccounts();
        showToast('✅', 'Check complete!');
    }, 1500);
};

window.viewAccount = function(id) {
    const acc = accounts.find(a => a.id === id);
    alert(`${acc.username}\n\nPlatform: ${acc.platform}\nStatus: ${acc.status}\nScore: ${acc.score}%\nLast Check: ${acc.lastCheck}`);
};

window.removeAccount = function(id) {
    if (!confirm('Remove this account?')) return;
    const idx = accounts.findIndex(a => a.id === id);
    if (idx > -1) {
        accounts.splice(idx, 1);
        userData.usage.accounts--;
        renderAccounts();
        populateDashboard();
        showToast('✅', 'Account removed');
    }
};

// Add Account Modal
function openAddAccountModal() {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    document.getElementById('modal-title').textContent = 'Add Account';
    
    body.innerHTML = `
        <div class="form-group">
            <label>Platform</label>
            <select id="new-platform" class="input">
                <option value="">Select...</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter/X</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
                <option value="reddit">Reddit</option>
            </select>
        </div>
        <div class="form-group">
            <label>Username</label>
            <input type="text" id="new-username" class="input" placeholder="@username">
        </div>
        <div class="form-group">
            <label>Nickname (optional)</label>
            <input type="text" id="new-nickname" class="input" placeholder="My Account">
        </div>
    `;
    
    footer.innerHTML = `
        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-primary" onclick="addAccount()">Add Account</button>
    `;
    
    modal.classList.remove('hidden');
}

window.addAccount = function() {
    const platform = document.getElementById('new-platform').value;
    const username = document.getElementById('new-username').value;
    const nickname = document.getElementById('new-nickname').value;
    
    if (!platform || !username) {
        showToast('⚠️', 'Please fill in platform and username');
        return;
    }
    
    if (accounts.length >= userData.plan.accountLimit) {
        showToast('⚠️', 'Account limit reached. Upgrade to add more!');
        closeModal();
        return;
    }
    
    const newAcc = {
        id: Date.now(),
        platform,
        icon: platformIcons[platform] || '📱',
        username: username.startsWith('@') ? username : '@' + username,
        nickname: nickname || platform,
        status: 'healthy',
        score: 80 + Math.floor(Math.random() * 20),
        lastCheck: 'Just now'
    };
    
    accounts.push(newAcc);
    userData.usage.accounts++;
    
    renderAccounts();
    populateDashboard();
    closeModal();
    showToast('✅', `${newAcc.username} added!`);
};

window.closeModal = function() {
    document.getElementById('modal').classList.add('hidden');
};

document.getElementById('modal-close')?.addEventListener('click', closeModal);

// =============================================================================
// TOOLS
// =============================================================================
function initTools() {
    // Shadow ban check
    document.getElementById('run-check')?.addEventListener('click', runShadowCheck);
    
    // Hashtag check
    document.getElementById('run-hashtag-check')?.addEventListener('click', runHashtagCheck);
    
    // Bulk check
    document.getElementById('run-bulk')?.addEventListener('click', runBulkCheck);
    
    // Close results
    document.getElementById('close-results')?.addEventListener('click', () => {
        document.getElementById('results-box').classList.add('hidden');
    });
}

function runShadowCheck() {
    const platform = document.getElementById('tool-platform').value;
    const username = document.getElementById('tool-username').value;
    
    if (!platform || !username) {
        showToast('⚠️', 'Select platform and enter username');
        return;
    }
    
    showToast('🔍', `Checking ${username}...`);
    
    setTimeout(() => {
        const score = Math.floor(Math.random() * 100);
        const status = score > 70 ? 'safe' : 'banned';
        
        showResults('Shadow Ban Check', `
            <div style="text-align: center; padding: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">${status === 'safe' ? '✅' : '🚫'}</div>
                <h3 style="margin: 0 0 0.5rem;">${status === 'safe' ? 'No Shadow Ban Detected' : 'Shadow Ban Likely'}</h3>
                <p style="color: var(--text-muted); margin: 0;">
                    ${platformIcons[platform]} ${username} • Visibility Score: ${score}%
                </p>
            </div>
        `);
    }, 2000);
}

function runHashtagCheck() {
    const platform = document.getElementById('hashtag-platform').value;
    const input = document.getElementById('hashtag-input').value;
    
    if (!platform) {
        showToast('⚠️', 'Please select a platform');
        return;
    }
    
    const hashtags = input.match(/#\w+/g) || [];
    
    if (hashtags.length === 0) {
        showToast('⚠️', 'Enter at least one hashtag');
        return;
    }
    
    showToast('🏷️', `Checking ${hashtags.length} hashtags...`);
    
    setTimeout(() => {
        // Simulate results - ~20% banned
        const results = hashtags.map(tag => ({
            tag,
            status: Math.random() > 0.2 ? 'safe' : 'banned',
            alternatives: hashtagAlternatives[tag.toLowerCase()] || ['#' + tag.slice(1) + 'life', '#' + tag.slice(1) + 'community', '#' + tag.slice(1) + 'tips']
        }));
        
        const safe = results.filter(r => r.status === 'safe').length;
        const banned = results.filter(r => r.status === 'banned').length;
        
        let html = `
            <div style="margin-bottom: 1rem; display: flex; gap: 1rem;">
                <span style="color: #22c55e;">✅ ${safe} Safe</span>
                <span style="color: #ef4444;">🚫 ${banned} Banned</span>
            </div>
            <div class="hashtag-results">
        `;
        
        results.forEach(r => {
            html += `
                <div class="hashtag-row">
                    <span class="platform-icon">${platformIcons[platform]}</span>
                    <span class="tag">${r.tag}</span>
                    <span class="status ${r.status}">${r.status === 'safe' ? '✅ Safe' : '🚫 Banned'}</span>
                </div>
            `;
            
            if (r.status === 'banned') {
                html += `
                    <div class="hashtag-alt">
                        💡 <strong>Try instead:</strong> ${r.alternatives.slice(0, 3).join(', ')}
                    </div>
                `;
            }
        });
        
        html += '</div>';
        
        showResults(`Hashtag Check - ${platform}`, html);
    }, 1500);
}

function runBulkCheck() {
    showToast('⚡', `Checking ${accounts.length} accounts...`);
    
    setTimeout(() => {
        accounts.forEach(acc => acc.lastCheck = 'Just now');
        renderAccounts();
        showToast('✅', 'All accounts checked!');
    }, 2000);
}

function showResults(title, html) {
    document.getElementById('results-title').textContent = title;
    document.getElementById('results-content').innerHTML = html;
    document.getElementById('results-box').classList.remove('hidden');
}

// =============================================================================
// AI CHAT
// =============================================================================
function initAI() {
    const fab = document.getElementById('ai-fab');
    const panel = document.getElementById('ai-panel');
    const close = document.getElementById('ai-close');
    const send = document.getElementById('ai-send');
    const input = document.getElementById('ai-input');
    
    // Also support button in Support section
    document.getElementById('open-ai')?.addEventListener('click', () => {
        panel.classList.remove('hidden');
    });
    
    fab?.addEventListener('click', () => {
        panel.classList.toggle('hidden');
    });
    
    close?.addEventListener('click', () => {
        panel.classList.add('hidden');
    });
    
    send?.addEventListener('click', sendAIMessage);
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAIMessage();
    });
}

function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const messages = document.getElementById('ai-messages');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Add user message
    messages.innerHTML += `
        <div style="text-align: right; margin-bottom: 0.75rem;">
            <span style="background: var(--primary); color: white; padding: 0.5rem 0.75rem; border-radius: 12px 12px 0 12px; display: inline-block; max-width: 80%;">
                ${text}
            </span>
        </div>
    `;
    
    input.value = '';
    
    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
    
    // Simulate AI response
    setTimeout(() => {
        const responses = [
            "Shadow bans typically last 14-30 days. Focus on posting original content and avoiding banned hashtags.",
            "To recover from a shadow ban: 1) Take a 48-hour break from posting, 2) Remove any flagged content, 3) Avoid banned hashtags, 4) Engage authentically with your community.",
            "Your account's visibility score indicates how much reach you're getting. A score below 50% suggests potential restrictions.",
            "I recommend checking your hashtags before posting - some hashtags get banned without notice and can trigger restrictions on your account."
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        messages.innerHTML += `
            <div style="text-align: left; margin-bottom: 0.75rem;">
                <span style="background: var(--bg-tertiary); padding: 0.5rem 0.75rem; border-radius: 12px 12px 12px 0; display: inline-block; max-width: 80%;">
                    🤖 ${response}
                </span>
            </div>
        `;
        
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
}

// =============================================================================
// FORMS
// =============================================================================
function initForms() {
    // Support form
    document.getElementById('support-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('✅', 'Message sent! We\'ll respond within 24 hours.');
        e.target.reset();
    });
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        if (confirm('Log out?')) {
            showToast('👋', 'Logging out...');
            setTimeout(() => window.location.href = 'index.html', 1000);
        }
    });
    
    // Cancel subscription
    document.getElementById('cancel-btn')?.addEventListener('click', () => {
        if (confirm('Cancel your subscription? You\'ll keep access until your billing period ends.')) {
            showToast('😢', 'Subscription cancelled');
        }
    });
}

// =============================================================================
// POPULATE DASHBOARD
// =============================================================================
function populateDashboard() {
    const healthy = accounts.filter(a => a.status === 'healthy').length;
    const issues = accounts.filter(a => a.status === 'issues').length;
    const banned = accounts.filter(a => a.status === 'banned').length;
    
    // Stats
    setText('stat-healthy', healthy);
    setText('stat-issues', issues);
    setText('stat-banned', banned);
    setText('stat-total', accounts.length);
    
    // Sidebar
    setText('sidebar-accounts', `${userData.usage.accounts}/${userData.plan.accountLimit}`);
    setText('sidebar-ai', `${userData.usage.aiUsed}/${userData.plan.aiPerDay}`);
    setText('sidebar-user-name', `${userData.firstName} ${userData.lastName}`);
    setText('sidebar-user-email', userData.email);
    
    // User name
    setText('user-first-name', userData.firstName);
    
    // Accounts page
    setText('accounts-count', accounts.length);
    setText('accounts-limit', userData.plan.accountLimit);
    setText('bulk-count', accounts.length);
    
    // AI count
    setText('ai-count', `${userData.usage.aiUsed}/${userData.plan.aiPerDay} today`);
    
    // Render
    renderAccounts();
    renderMiniAccounts();
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// =============================================================================
// TOAST
// =============================================================================
function showToast(icon, message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    document.getElementById('toast-icon').textContent = icon;
    document.getElementById('toast-message').textContent = message;
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
