/* =============================================================================
   DASHBOARD.JS - ShadowBanCheck.io User Dashboard
   Matching Admin Dashboard Theme
   ============================================================================= */

// =============================================================================
// USER DATA - Global for Shadow AI integration
// =============================================================================
window.userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    plan: { 
        name: 'Pro', 
        price: 9.99, 
        accountLimit: 15, 
        aiPerDay: 10 
    },
    usage: { 
        accounts: 8, 
        aiUsed: 0
    }
};

// Demo accounts data
const accounts = [
    { id: 1, platform: 'instagram', icon: '📸', username: '@johndoe', nickname: 'Personal', status: 'healthy', score: 95, lastCheck: '2h ago' },
    { id: 2, platform: 'tiktok', icon: '🎵', username: '@johndoe_tiktok', nickname: 'TikTok Main', status: 'banned', score: 15, lastCheck: '2h ago' },
    { id: 3, platform: 'twitter', icon: '🐦', username: '@johndoe_x', nickname: 'Twitter', status: 'healthy', score: 92, lastCheck: '2h ago' },
    { id: 4, platform: 'youtube', icon: '▶️', username: 'JohnDoeChannel', nickname: 'YouTube', status: 'healthy', score: 88, lastCheck: '3h ago' },
    { id: 5, platform: 'facebook', icon: '📘', username: 'john.doe', nickname: 'Facebook', status: 'healthy', score: 90, lastCheck: '3h ago' },
    { id: 6, platform: 'linkedin', icon: '💼', username: 'johndoe', nickname: 'Professional', status: 'healthy', score: 100, lastCheck: '4h ago' },
    { id: 7, platform: 'instagram', icon: '📸', username: '@mybrand', nickname: 'Business IG', status: 'issues', score: 62, lastCheck: '1h ago' },
    { id: 8, platform: 'threads', icon: '🧵', username: '@johndoe', nickname: 'Threads', status: 'healthy', score: 85, lastCheck: '4h ago' }
];

// Platform icons
const platformIcons = {
    instagram: '📸', tiktok: '🎵', twitter: '🐦', facebook: '📘', youtube: '▶️',
    linkedin: '💼', reddit: '🤖', pinterest: '📌', snapchat: '👻', threads: '🧵',
    mastodon: '🐘', bluesky: '🦋', truth: '🗽', telegram: '✈️', discord: '🎮'
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
    initModal();
    initForms();
    initLiveChat();
    populateDashboard();
    detectUserIP();
    updateAIQuestionsDisplay();
    
    // Check URL hash
    const hash = window.location.hash.slice(1);
    if (hash) {
        const sectionId = hash.replace('section-', '');
        navigateTo(sectionId);
    }
    
    // Listen for Shadow AI usage updates
    window.addEventListener('shadowai-usage-updated', updateAIQuestionsDisplay);
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

window.navigateTo = function(sectionId) {
    window.location.hash = sectionId;
    
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    
    // Show/hide sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`section-${sectionId}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
};

// =============================================================================
// SIDEBAR (Mobile)
// =============================================================================
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('menu-toggle');
    
    toggle?.addEventListener('click', () => sidebar?.classList.add('open'));
    
    document.addEventListener('click', (e) => {
        if (sidebar?.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            !toggle?.contains(e.target)) {
            closeSidebar();
        }
    });
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        if (confirm('Log out of your account?')) {
            localStorage.removeItem('shadowban_session');
            sessionStorage.removeItem('shadowban_session');
            showToast('👋', 'Logging out...');
            setTimeout(() => window.location.href = 'login.html', 1000);
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
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(t => {
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
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
            switch (action) {
                case 'check-all':
                    navigateTo('tools');
                    setTimeout(() => document.getElementById('run-bulk')?.click(), 100);
                    break;
                case 'add-account':
                    openModal();
                    break;
                case 'check-hashtags':
                    navigateTo('tools');
                    document.getElementById('hashtag-input')?.focus();
                    break;
                case 'ask-ai':
                    if (window.ShadowAI && window.ShadowAI.open) {
                        window.ShadowAI.open();
                    }
                    break;
            }
        });
    });
}

// =============================================================================
// ACCOUNTS PAGE
// =============================================================================
function initAccountsPage() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAccounts(btn.dataset.filter);
        });
    });
    
    document.getElementById('add-account-btn')?.addEventListener('click', openModal);
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

// Account actions (global)
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
    showToast('📊', `${acc.username} - Score: ${acc.score}%`);
};

window.removeAccount = function(id) {
    if (!confirm('Remove this account from monitoring?')) return;
    const idx = accounts.findIndex(a => a.id === id);
    if (idx > -1) {
        accounts.splice(idx, 1);
        window.userData.usage.accounts--;
        renderAccounts();
        populateDashboard();
        showToast('✅', 'Account removed');
    }
};

// =============================================================================
// MODAL
// =============================================================================
function initModal() {
    const modal = document.getElementById('add-account-modal');
    
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
    document.getElementById('modal-confirm')?.addEventListener('click', addAccount);
    
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function openModal() {
    document.getElementById('add-account-modal')?.classList.remove('hidden');
    document.getElementById('new-platform').value = '';
    document.getElementById('new-username').value = '';
    document.getElementById('new-nickname').value = '';
}

function closeModal() {
    document.getElementById('add-account-modal')?.classList.add('hidden');
}

function addAccount() {
    const platform = document.getElementById('new-platform').value;
    const username = document.getElementById('new-username').value.trim();
    const nickname = document.getElementById('new-nickname').value.trim();
    
    if (!platform || !username) {
        showToast('⚠️', 'Please select platform and enter username');
        return;
    }
    
    if (accounts.length >= window.userData.plan.accountLimit) {
        showToast('⚠️', 'Account limit reached. Upgrade to add more!');
        closeModal();
        return;
    }
    
    const newAcc = {
        id: Date.now(),
        platform,
        icon: platformIcons[platform] || '📱',
        username: username.startsWith('@') ? username : '@' + username,
        nickname: nickname || platform.charAt(0).toUpperCase() + platform.slice(1),
        status: 'healthy',
        score: 80 + Math.floor(Math.random() * 20),
        lastCheck: 'Just now'
    };
    
    accounts.push(newAcc);
    window.userData.usage.accounts++;
    
    renderAccounts();
    renderMiniAccounts();
    populateDashboard();
    closeModal();
    showToast('✅', `${newAcc.username} added successfully!`);
}

// =============================================================================
// TOOLS
// =============================================================================
function initTools() {
    document.getElementById('run-check')?.addEventListener('click', runAccountCheck);
    document.getElementById('run-hashtag-check')?.addEventListener('click', runHashtagCheck);
    document.getElementById('run-ip-check')?.addEventListener('click', runIPCheck);
    document.getElementById('run-email-check')?.addEventListener('click', runEmailCheck);
    document.getElementById('run-phone-check')?.addEventListener('click', runPhoneCheck);
    document.getElementById('run-website-check')?.addEventListener('click', runWebsiteCheck);
    document.getElementById('run-bulk')?.addEventListener('click', runBulkCheck);
    document.getElementById('close-results')?.addEventListener('click', hideResults);
}

function detectUserIP() {
    const ipEl = document.getElementById('user-ip');
    if (!ipEl) return;
    setTimeout(() => {
        ipEl.textContent = '192.168.1.' + Math.floor(Math.random() * 255);
    }, 500);
}

function runAccountCheck() {
    const platform = document.getElementById('tool-platform').value;
    const username = document.getElementById('tool-username').value.trim();
    
    if (!platform || !username) {
        showToast('⚠️', 'Select platform and enter username');
        return;
    }
    
    showToast('🔍', `Checking ${username}...`);
    
    setTimeout(() => {
        const score = Math.floor(Math.random() * 100);
        const status = score > 70 ? 'healthy' : score > 40 ? 'issues' : 'banned';
        const statusText = status === 'healthy' ? '✅ No Shadow Ban Detected' : 
                          status === 'issues' ? '⚠️ Possible Restrictions' : '🚫 Shadow Ban Likely';
        
        showResults('Account Check Results', `
            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">${status === 'healthy' ? '✅' : status === 'issues' ? '⚠️' : '🚫'}</div>
                <h3 style="margin: 0 0 0.5rem;">${statusText}</h3>
                <p style="color: var(--text-muted); margin: 0 0 1rem;">
                    ${platformIcons[platform] || '📱'} ${username} • Visibility Score: ${score}%
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
        const results = hashtags.map(tag => ({
            tag,
            status: Math.random() > 0.25 ? 'safe' : 'banned'
        }));
        
        const safe = results.filter(r => r.status === 'safe').length;
        const banned = results.filter(r => r.status === 'banned').length;
        
        let html = `<div style="margin-bottom: 1rem;"><span style="color: #22c55e;">✅ ${safe} Safe</span> • <span style="color: #ef4444;">🚫 ${banned} Banned</span></div>`;
        results.forEach(r => {
            html += `<div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: var(--bg); border-radius: 6px; margin-bottom: 0.5rem;">
                <span>${r.tag}</span>
                <span style="margin-left: auto; font-size: 0.8rem; padding: 0.25rem 0.5rem; border-radius: 4px; ${r.status === 'safe' ? 'background: rgba(34, 197, 94, 0.2); color: #22c55e;' : 'background: rgba(239, 68, 68, 0.2); color: #ef4444;'}">${r.status === 'safe' ? '✅ Safe' : '🚫 Banned'}</span>
            </div>`;
        });
        
        showResults(`Hashtag Check - ${platform}`, html);
    }, 1500);
}

function runIPCheck() {
    const customIP = document.getElementById('custom-ip').value.trim();
    const userIP = document.getElementById('user-ip').textContent;
    const ip = customIP || userIP;
    
    showToast('🌐', `Checking IP ${ip}...`);
    
    setTimeout(() => {
        const isFlagged = Math.random() > 0.85;
        showResults('IP Address Check', `
            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">${isFlagged ? '⚠️' : '✅'}</div>
                <h3 style="margin: 0 0 0.5rem;">${isFlagged ? 'IP May Be Flagged' : 'IP Looks Clean'}</h3>
                <p style="color: var(--text-muted); margin: 0; font-family: monospace;">${ip}</p>
            </div>
        `);
    }, 1500);
}

function runEmailCheck() {
    const email = document.getElementById('check-email').value.trim();
    if (!email) { showToast('⚠️', 'Enter an email address'); return; }
    
    showToast('📧', `Checking ${email}...`);
    setTimeout(() => {
        const isBlacklisted = Math.random() > 0.9;
        showResults('Email Check', `
            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">${isBlacklisted ? '🚫' : '✅'}</div>
                <h3 style="margin: 0 0 0.5rem;">${isBlacklisted ? 'Email May Be Blacklisted' : 'Email Looks Good'}</h3>
            </div>
        `);
    }, 1500);
}

function runPhoneCheck() {
    const phone = document.getElementById('check-phone').value.trim();
    if (!phone) { showToast('⚠️', 'Enter a phone number'); return; }
    
    showToast('📱', `Checking phone...`);
    setTimeout(() => {
        const isFlagged = Math.random() > 0.9;
        showResults('Phone Check', `
            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">${isFlagged ? '⚠️' : '✅'}</div>
                <h3 style="margin: 0 0 0.5rem;">${isFlagged ? 'Phone May Be Flagged' : 'Phone Looks Clean'}</h3>
            </div>
        `);
    }, 1500);
}

function runWebsiteCheck() {
    const website = document.getElementById('check-website').value.trim();
    if (!website) { showToast('⚠️', 'Enter a website URL'); return; }
    
    showToast('🔗', `Checking domain...`);
    setTimeout(() => {
        const isBlocked = Math.random() > 0.85;
        showResults('Website Check', `
            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">${isBlocked ? '🚫' : '✅'}</div>
                <h3 style="margin: 0 0 0.5rem;">${isBlocked ? 'Domain May Be Blocked' : 'Domain Looks Safe'}</h3>
            </div>
        `);
    }, 1500);
}

function runBulkCheck() {
    showToast('⚡', `Checking ${accounts.length} accounts...`);
    
    setTimeout(() => {
        accounts.forEach(acc => {
            acc.lastCheck = 'Just now';
            acc.score = Math.max(0, Math.min(100, acc.score + (Math.random() > 0.5 ? 2 : -2)));
        });
        
        renderAccounts();
        
        let html = `<div style="margin-bottom: 1rem;">
            <span style="color: #22c55e;">✅ ${accounts.filter(a => a.status === 'healthy').length} Healthy</span> • 
            <span style="color: #eab308;">⚠️ ${accounts.filter(a => a.status === 'issues').length} Issues</span> • 
            <span style="color: #ef4444;">🚫 ${accounts.filter(a => a.status === 'banned').length} Banned</span>
        </div>`;
        
        accounts.forEach(acc => {
            html += `<div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--bg); border-radius: 6px; margin-bottom: 0.5rem;">
                <span>${acc.icon}</span>
                <span style="flex: 1;">${acc.username}</span>
                <span style="color: var(--text-muted); font-size: 0.8rem;">${acc.score}%</span>
                <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; ${acc.status === 'healthy' ? 'background: rgba(34, 197, 94, 0.2); color: #22c55e;' : acc.status === 'issues' ? 'background: rgba(234, 179, 8, 0.2); color: #eab308;' : 'background: rgba(239, 68, 68, 0.2); color: #ef4444;'}">${acc.status}</span>
            </div>`;
        });
        
        showResults('Bulk Check Results', html);
        showToast('✅', 'All accounts checked!');
    }, 2500);
}

function showResults(title, html) {
    document.getElementById('results-title').textContent = title;
    document.getElementById('results-content').innerHTML = html;
    document.getElementById('results-box').classList.remove('hidden');
    document.getElementById('results-box').scrollIntoView({ behavior: 'smooth' });
}

function hideResults() {
    document.getElementById('results-box').classList.add('hidden');
}

// =============================================================================
// LIVE CHAT - Syncs with Admin Dashboard
// =============================================================================
function initLiveChat() {
    const openBtn = document.getElementById('open-live-chat');
    const chatWindow = document.getElementById('live-chat-window');
    const sendBtn = document.getElementById('live-chat-send');
    const input = document.getElementById('live-chat-input');
    
    openBtn?.addEventListener('click', () => {
        chatWindow?.classList.remove('hidden');
        openBtn.textContent = 'Chat Open';
        openBtn.disabled = true;
        
        // Store that user opened chat (for admin to see)
        storeLiveChatSession();
    });
    
    sendBtn?.addEventListener('click', sendLiveChatMessage);
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendLiveChatMessage();
    });
}

function storeLiveChatSession() {
    // Store in localStorage so admin can see this user is online
    const chatSession = {
        id: Date.now(),
        user: window.userData.firstName + ' ' + window.userData.lastName,
        email: window.userData.email,
        startTime: new Date().toISOString(),
        online: true
    };
    localStorage.setItem('user_live_chat', JSON.stringify(chatSession));
}

function sendLiveChatMessage() {
    const input = document.getElementById('live-chat-input');
    const messagesContainer = document.getElementById('live-chat-messages');
    const text = input?.value?.trim();
    
    if (!text) return;
    
    // Add user message to chat
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-bubble user';
    messageDiv.innerHTML = `
        <span class="bubble-text">${escapeHtml(text)}</span>
        <span class="bubble-time">Just now</span>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store message for admin to see
    const messages = JSON.parse(localStorage.getItem('user_chat_messages') || '[]');
    messages.push({
        id: Date.now(),
        from: 'user',
        user: window.userData.firstName,
        text: text,
        time: new Date().toISOString()
    });
    localStorage.setItem('user_chat_messages', JSON.stringify(messages));
    
    input.value = '';
    
    // Simulate admin response after delay
    setTimeout(() => {
        const responses = [
            "Thanks for reaching out! Let me look into that for you.",
            "I understand. Can you tell me more about the issue?",
            "I'm checking our system now. One moment please.",
            "That's a great question! Here's what I can tell you..."
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        const adminMsg = document.createElement('div');
        adminMsg.className = 'chat-bubble admin';
        adminMsg.innerHTML = `
            <span class="bubble-text">${response}</span>
            <span class="bubble-time">Just now</span>
        `;
        messagesContainer.appendChild(adminMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1500);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =============================================================================
// FORMS
// =============================================================================
function initForms() {
    // Support form - sends to admin Messages
    document.getElementById('support-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const topic = document.getElementById('support-topic').value;
        const message = document.getElementById('support-msg').value.trim();
        
        if (!topic || !message) {
            showToast('⚠️', 'Please select a topic and enter a message');
            return;
        }
        
        // Store message for admin to see
        const messages = JSON.parse(localStorage.getItem('user_support_messages') || '[]');
        messages.push({
            id: Date.now(),
            name: window.userData.firstName + ' ' + window.userData.lastName,
            email: window.userData.email,
            topic: topic,
            message: message,
            time: new Date().toISOString(),
            unread: true
        });
        localStorage.setItem('user_support_messages', JSON.stringify(messages));
        
        showToast('✅', 'Message sent! We\'ll respond within 24 hours.');
        e.target.reset();
    });
    
    // Open Shadow AI
    document.getElementById('open-ai')?.addEventListener('click', () => {
        if (window.ShadowAI && window.ShadowAI.open) {
            window.ShadowAI.open();
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
// AI QUESTIONS DISPLAY
// =============================================================================
function updateAIQuestionsDisplay() {
    const limit = window.userData.plan.aiPerDay;
    let used = 0;
    
    if (window.ShadowAI && window.ShadowAI.getUsage) {
        used = window.ShadowAI.getUsage();
    }
    
    const remaining = Math.max(0, limit - used);
    
    setText('sidebar-ai', `${used}/${limit}`);
    
    const aiQuestionsEl = document.getElementById('ai-questions-left');
    if (aiQuestionsEl) {
        if (remaining === 0) {
            aiQuestionsEl.textContent = '0 questions remaining today';
            aiQuestionsEl.style.color = '#ef4444';
        } else {
            aiQuestionsEl.textContent = `${remaining} questions/day remaining`;
            aiQuestionsEl.style.color = '';
        }
    }
    
    window.userData.usage.aiUsed = used;
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
    setText('sidebar-accounts', `${window.userData.usage.accounts}/${window.userData.plan.accountLimit}`);
    setText('sidebar-plan-name', `⭐ ${window.userData.plan.name} Plan`);
    setText('sidebar-user-name', `${window.userData.firstName} ${window.userData.lastName}`);
    setText('sidebar-user-email', window.userData.email);
    
    // User name
    setText('user-first-name', window.userData.firstName);
    
    // Accounts page
    setText('accounts-count', accounts.length);
    setText('accounts-limit', window.userData.plan.accountLimit);
    setText('bulk-count', accounts.length);
    
    // Settings - current plan
    setText('current-plan-name', `⭐ ${window.userData.plan.name} Plan`);
    setText('current-plan-price', `$${window.userData.plan.price.toFixed(2)}/mo`);
    setText('current-plan-features', `${window.userData.plan.accountLimit} accounts • ${window.userData.plan.aiPerDay} AI questions/day • Email + SMS alerts`);
    
    // Render
    renderAccounts();
    renderMiniAccounts();
    updateAIQuestionsDisplay();
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
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
