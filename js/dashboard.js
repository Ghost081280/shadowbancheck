/* =============================================================================
   DASHBOARD.JS - ShadowBanCheck.io Dashboard
   Complete Rebuild with Live Chat & Stripe Integration
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
        aiUsed: 0  // Will be synced from localStorage by Shadow AI
    }
};

// Plan configurations for reference
const PLAN_CONFIG = {
    'Free':      { price: 0,     accounts: 2,   ai: 3,   alerts: false },
    'Starter':   { price: 4.99,  accounts: 5,   ai: 3,   alerts: true },
    'Pro':       { price: 9.99,  accounts: 15,  ai: 10,  alerts: true },
    'Premium':   { price: 14.99, accounts: 50,  ai: 25,  alerts: true },
    'AI Pro':    { price: 9.99,  accounts: 0,   ai: 100, alerts: false }, // Add-on
    'Power':     { price: 14.99, accounts: 100, ai: 200, alerts: true },
    'Unlimited': { price: 19.99, accounts: 200, ai: 500, alerts: true }
};

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
    mastodon: '🐘', bluesky: '🦋', truth: '🇺🇸', telegram: '✈️', discord: '🎮',
    whatsapp: '💬', signal: '📶', amazon: '📦', ebay: '🛒', etsy: '🎨',
    shopify: '🛍️', twitch: '🎮', kick: '🟢', rumble: '📺', medium: '✍️', quora: '❓'
};

// Platform names for display
const platformNames = {
    instagram: 'Instagram', tiktok: 'TikTok', twitter: 'Twitter/X', facebook: 'Facebook',
    youtube: 'YouTube', linkedin: 'LinkedIn', reddit: 'Reddit', pinterest: 'Pinterest',
    snapchat: 'Snapchat', threads: 'Threads', mastodon: 'Mastodon', bluesky: 'Bluesky',
    truth: 'Truth Social', telegram: 'Telegram', discord: 'Discord', whatsapp: 'WhatsApp',
    signal: 'Signal', amazon: 'Amazon', ebay: 'eBay', etsy: 'Etsy', shopify: 'Shopify',
    twitch: 'Twitch', kick: 'Kick', rumble: 'Rumble', medium: 'Medium', quora: 'Quora'
};

// Hashtag alternatives (AI placeholder)
const hashtagAlternatives = {
    '#fitness': ['#fitnessjourney', '#fitlife', '#workoutmotivation'],
    '#gym': ['#gymlife', '#gymmotivation', '#strengthtraining'],
    '#weightloss': ['#healthylifestyle', '#transformation', '#fitnessgoals'],
    '#diet': ['#healthyeating', '#nutrition', '#cleaneating'],
    '#money': ['#personalfinance', '#financialfreedom', '#investing'],
    '#crypto': ['#cryptocurrency', '#blockchain', '#web3'],
    '#follow4follow': ['#communitybuilding', '#engagement', '#connectwithme'],
    '#likeforlike': ['#engagementtips', '#growthtips', '#socialmedia']
};

// =============================================================================
// LIVE CHAT STATE
// =============================================================================
let adminOnline = true; // Demo: admin is online
let chatMessages = [
    { sender: 'admin', text: 'Hi! How can I help you today?', time: 'Just now' }
];

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
    
    // Auto-fill support email from user data
    const supportEmail = document.getElementById('support-email');
    if (supportEmail && window.userData.email) {
        supportEmail.value = window.userData.email;
    }
    
    // Auto-fill alert email
    const alertEmail = document.getElementById('alert-email');
    if (alertEmail && window.userData.email) {
        alertEmail.value = window.userData.email;
    }
    
    // Check URL hash
    const hash = window.location.hash.slice(1);
    if (hash) navigateTo(hash);
    
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

// Make navigateTo global for Shadow AI links
window.navigateTo = function(sectionId) {
    window.location.hash = sectionId;
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    document.querySelector('.content-scroll').scrollTop = 0;
};

// =============================================================================
// SIDEBAR (Mobile)
// =============================================================================
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('menu-toggle');
    const close = document.getElementById('sidebar-close');
    
    toggle?.addEventListener('click', () => sidebar.classList.add('open'));
    close?.addEventListener('click', closeSidebar);
    
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
    document.querySelectorAll('.filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
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
    alert(`Account Details\n\n${acc.icon} ${acc.username}\nPlatform: ${acc.platform}\nNickname: ${acc.nickname}\nStatus: ${acc.status}\nScore: ${acc.score}%\nLast Check: ${acc.lastCheck}`);
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
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    confirmBtn?.addEventListener('click', addAccount);
    
    // Close on overlay click
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
            closeModal();
        }
    });
}

function openModal() {
    document.getElementById('add-account-modal')?.classList.remove('hidden');
    document.getElementById('new-platform').value = '';
    document.getElementById('new-username').value = '';
    document.getElementById('new-nickname').value = '';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('add-account-modal')?.classList.add('hidden');
    document.body.style.overflow = '';
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

// Detect user IP
function detectUserIP() {
    const ipEl = document.getElementById('user-ip');
    if (!ipEl) return;
    
    // Demo IP
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
        const statusIcon = status === 'healthy' ? '✅' : status === 'issues' ? '⚠️' : '🚫';
        
        const now = new Date();
        const timeStr = now.toLocaleString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true 
        });
        
        let html = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">${statusIcon}</div>
                <h3 style="margin: 0 0 0.5rem;">${statusText}</h3>
            </div>
            
            <div class="result-details">
                <div class="result-details-grid">
                    <div class="result-detail-item">
                        <span>Platform</span>
                        <span>${platformIcons[platform]} ${platformNames[platform] || platform}</span>
                    </div>
                    <div class="result-detail-item">
                        <span>Username</span>
                        <span>${username}</span>
                    </div>
                    <div class="result-detail-item">
                        <span>Visibility Score</span>
                        <span style="color: ${score > 70 ? '#22c55e' : score > 40 ? '#eab308' : '#ef4444'}">${score}%</span>
                    </div>
                    <div class="result-detail-item">
                        <span>Checked</span>
                        <span>${timeStr}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add recovery tips if not healthy
        if (status !== 'healthy') {
            html += `
                <div class="recovery-tips">
                    <h4>💡 Recovery Tips:</h4>
                    <ul>
                        <li>Stop posting for 24-48 hours to let the algorithm reset</li>
                        <li>Remove any posts with banned hashtags</li>
                        <li>Post only original content when you return</li>
                        <li>Avoid mass following/unfollowing or engagement pods</li>
                    </ul>
                </div>
            `;
        }
        
        showResults('Account Check Results', html);
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
            status: Math.random() > 0.25 ? 'safe' : 'banned',
            alternatives: hashtagAlternatives[tag.toLowerCase()] || 
                         ['#' + tag.slice(1) + 'life', '#' + tag.slice(1) + 'daily', '#' + tag.slice(1) + 'tips']
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
                html += `<div class="hashtag-alt">💡 <strong>Try instead:</strong> ${r.alternatives.slice(0, 3).join(', ')}</div>`;
            }
        });
        
        html += '</div>';
        showResults(`Hashtag Check - ${platformNames[platform]}`, html);
    }, 1500);
}

function runIPCheck() {
    const customIP = document.getElementById('custom-ip').value.trim();
    const userIP = document.getElementById('user-ip').textContent;
    const ip = customIP || userIP;
    
    showToast('🌐', `Checking IP ${ip}...`);
    
    setTimeout(() => {
        const isFlagged = Math.random() > 0.85;
        const now = new Date();
        const timeStr = now.toLocaleString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true 
        });
        
        let html = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">${isFlagged ? '⚠️' : '✅'}</div>
                <h3 style="margin: 0 0 0.5rem;">${isFlagged ? 'IP May Be Flagged' : 'IP Looks Clean'}</h3>
            </div>
            
            <div class="result-details">
                <div class="result-details-grid">
                    <div class="result-detail-item">
                        <span>IP Address</span>
                        <span style="font-family: monospace;">${ip}</span>
                    </div>
                    <div class="result-detail-item">
                        <span>Checked</span>
                        <span>${timeStr}</span>
                    </div>
                </div>
            </div>
        `;
        
        if (isFlagged) {
            html += `
                <div class="recovery-tips">
                    <h4>💡 Recommendations:</h4>
                    <ul>
                        <li>Try using a VPN to get a new IP address</li>
                        <li>Contact your ISP about getting a new IP</li>
                        <li>Wait 24-48 hours before heavy platform use</li>
                    </ul>
                </div>
            `;
        }
        
        showResults('IP Address Check', html);
    }, 1500);
}

function runEmailCheck() {
    const email = document.getElementById('check-email').value.trim();
    
    if (!email) {
        showToast('⚠️', 'Enter an email address');
        return;
    }
    
    showToast('📧', `Checking ${email}...`);
    
    setTimeout(() => {
        const isBlacklisted = Math.random() > 0.9;
        showResults('Email Check', `
            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">${isBlacklisted ? '🚫' : '✅'}</div>
                <h3 style="margin: 0 0 0.5rem;">${isBlacklisted ? 'Email May Be Blacklisted' : 'Email Looks Good'}</h3>
                <p style="color: var(--text-muted); margin: 0;">${email}</p>
            </div>
        `);
    }, 1500);
}

function runPhoneCheck() {
    const phone = document.getElementById('check-phone').value.trim();
    
    if (!phone) {
        showToast('⚠️', 'Enter a phone number');
        return;
    }
    
    showToast('📱', `Checking phone...`);
    
    setTimeout(() => {
        const isFlagged = Math.random() > 0.9;
        showResults('Phone Check', `
            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">${isFlagged ? '⚠️' : '✅'}</div>
                <h3 style="margin: 0 0 0.5rem;">${isFlagged ? 'Phone May Be Flagged' : 'Phone Looks Clean'}</h3>
                <p style="color: var(--text-muted); margin: 0;">${phone}</p>
            </div>
        `);
    }, 1500);
}

function runWebsiteCheck() {
    const website = document.getElementById('check-website').value.trim();
    
    if (!website) {
        showToast('⚠️', 'Enter a website URL');
        return;
    }
    
    showToast('🔗', `Checking domain...`);
    
    setTimeout(() => {
        const isBlocked = Math.random() > 0.85;
        let html = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 0.75rem;">${isBlocked ? '🚫' : '✅'}</div>
                <h3 style="margin: 0 0 0.5rem;">${isBlocked ? 'Domain May Be Blocked' : 'Domain Looks Safe'}</h3>
                <p style="color: var(--text-muted); margin: 0; word-break: break-all;">${website}</p>
            </div>
        `;
        
        if (isBlocked) {
            html += `
                <div class="recovery-tips">
                    <h4>💡 This means:</h4>
                    <ul>
                        <li>Some platforms may block links to this domain</li>
                        <li>Posts with this URL may get reduced reach</li>
                        <li>Consider using a link shortener or landing page</li>
                    </ul>
                </div>
            `;
        }
        
        showResults('Website Check', html);
    }, 1500);
}

function runBulkCheck() {
    showToast('⚡', `Checking ${accounts.length} accounts...`);
    
    setTimeout(() => {
        // Update all accounts with new check time
        accounts.forEach(acc => {
            acc.lastCheck = 'Just now';
            // Randomly adjust scores slightly
            acc.score = Math.max(0, Math.min(100, acc.score + (Math.random() > 0.5 ? 2 : -2)));
        });
        
        renderAccounts();
        
        const healthy = accounts.filter(a => a.status === 'healthy').length;
        const issues = accounts.filter(a => a.status === 'issues').length;
        const banned = accounts.filter(a => a.status === 'banned').length;
        
        // Show bulk results
        let html = `
            <div style="margin-bottom: 1rem;">
                <span style="color: #22c55e;">✅ ${healthy} Healthy</span> • 
                <span style="color: #eab308;">⚠️ ${issues} Issues</span> • 
                <span style="color: #ef4444;">🚫 ${banned} Banned</span>
            </div>
            <div class="bulk-results">
        `;
        
        accounts.forEach(acc => {
            html += `
                <div class="bulk-result-row">
                    <span class="platform-icon">${acc.icon}</span>
                    <span class="username">${acc.username}</span>
                    <span class="score">${acc.score}%</span>
                    <span class="status ${acc.status}">${acc.status === 'healthy' ? '✓' : acc.status === 'issues' ? '!' : '✕'} ${acc.status}</span>
                </div>
            `;
        });
        
        html += '</div>';
        showResults('Bulk Check Results', html);
        showToast('✅', 'All accounts checked!');
    }, 2500);
}

function showResults(title, html) {
    document.getElementById('results-title').textContent = title;
    document.getElementById('results-content').innerHTML = html;
    document.getElementById('results-box').classList.remove('hidden');
    
    // Scroll to results
    document.getElementById('results-box').scrollIntoView({ behavior: 'smooth' });
}

function hideResults() {
    document.getElementById('results-box').classList.add('hidden');
}

// =============================================================================
// LIVE CHAT
// =============================================================================
function initLiveChat() {
    const sendBtn = document.getElementById('live-chat-send');
    const input = document.getElementById('live-chat-input');
    
    sendBtn?.addEventListener('click', sendLiveChatMessage);
    
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendLiveChatMessage();
        }
    });
    
    // Demo: Toggle admin status randomly for demo purposes
    updateAdminStatus();
}

function updateAdminStatus() {
    const indicator = document.getElementById('admin-status-indicator');
    const text = document.getElementById('admin-status-text');
    const miniChat = document.getElementById('mini-chat');
    const offlineMsg = document.getElementById('chat-offline');
    
    if (adminOnline) {
        indicator?.classList.add('online');
        indicator?.classList.remove('offline');
        if (text) text.textContent = 'Admin Online - Chat now for instant help!';
        miniChat?.classList.remove('hidden');
        offlineMsg?.classList.add('hidden');
    } else {
        indicator?.classList.remove('online');
        indicator?.classList.add('offline');
        if (text) text.textContent = 'Admin Offline - We\'ll reply via email';
        miniChat?.classList.add('hidden');
        offlineMsg?.classList.remove('hidden');
    }
}

function sendLiveChatMessage() {
    const input = document.getElementById('live-chat-input');
    const message = input?.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage('You', message);
    input.value = '';
    
    // Demo: Auto-reply after a delay
    setTimeout(() => {
        const replies = [
            "Thanks for reaching out! I'll look into that for you.",
            "Got it! Let me check on that real quick.",
            "I understand. Can you tell me more about the issue?",
            "No problem! I can help with that.",
            "Thanks for the details. I'll get back to you shortly."
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        addChatMessage('Admin', reply);
    }, 1000 + Math.random() * 2000);
}

function addChatMessage(sender, text) {
    const container = document.getElementById('live-chat-messages');
    if (!container) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender === 'You' ? 'user' : 'admin'}`;
    msgDiv.innerHTML = `
        <span class="msg-sender">${sender}</span>
        <span class="msg-text">${text}</span>
        <span class="msg-time">${timeStr}</span>
    `;
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
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
        // Re-fill email
        const emailField = document.getElementById('support-email');
        if (emailField && window.userData.email) {
            emailField.value = window.userData.email;
        }
    });
    
    // Save profile
    document.getElementById('save-profile')?.addEventListener('click', () => {
        const fname = document.getElementById('profile-fname')?.value;
        const lname = document.getElementById('profile-lname')?.value;
        const email = document.getElementById('profile-email')?.value;
        
        if (fname && lname && email) {
            window.userData.firstName = fname;
            window.userData.lastName = lname;
            window.userData.email = email;
            populateDashboard();
            showToast('✅', 'Profile saved!');
        }
    });
    
    // Save alert channels
    document.getElementById('save-channels')?.addEventListener('click', () => {
        showToast('✅', 'Notification settings saved!');
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
    
    // Cancel subscription
    document.getElementById('cancel-btn')?.addEventListener('click', () => {
        if (confirm('Cancel your subscription? You\'ll keep access until your billing period ends.')) {
            showToast('😢', 'Subscription cancelled');
        }
    });
    
    // Open Shadow AI
    document.getElementById('open-ai')?.addEventListener('click', () => {
        if (window.ShadowAI && window.ShadowAI.open) {
            window.ShadowAI.open();
        }
    });
    
    // Report downloads
    document.getElementById('download-pdf')?.addEventListener('click', () => {
        showToast('📄', 'Generating PDF report...');
        setTimeout(() => showToast('✅', 'Report downloaded!'), 1500);
    });
    
    document.getElementById('download-csv')?.addEventListener('click', () => {
        showToast('📊', 'Generating CSV export...');
        setTimeout(() => showToast('✅', 'Export downloaded!'), 1500);
    });
    
    document.getElementById('export-history')?.addEventListener('click', () => {
        showToast('📥', 'Exporting history...');
        setTimeout(() => showToast('✅', 'History exported!'), 1500);
    });
}

// =============================================================================
// AI QUESTIONS DISPLAY
// =============================================================================
function updateAIQuestionsDisplay() {
    const limit = window.userData.plan.aiPerDay;
    let used = 0;
    
    // Get usage from Shadow AI if available
    if (window.ShadowAI && window.ShadowAI.getUsage) {
        used = window.ShadowAI.getUsage();
    }
    
    const remaining = Math.max(0, limit - used);
    
    // Update sidebar
    setText('sidebar-ai', `${used}/${limit}`);
    
    // Update support section
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
    
    // Sync to userData
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
