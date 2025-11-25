/* =============================================================================
   DASHBOARD.JS - User Dashboard Functionality
   ShadowBanCheck.io
   ============================================================================= */

(function() {
'use strict';

// ============================================
// USER DATA & STATE
// ============================================
window.userData = {
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@test.com',
    plan: {
        name: 'Pro',
        price: '$9.99/mo',
        accounts: 10,
        aiPerDay: 10
    },
    accounts: [
        { id: 1, platform: 'instagram', username: '@myprofile', nickname: 'Main Account', status: 'healthy' },
        { id: 2, platform: 'tiktok', username: '@tiktoker', nickname: 'TikTok', status: 'issues' },
        { id: 3, platform: 'twitter', username: '@tweets', nickname: 'Twitter Main', status: 'healthy' }
    ]
};

// Load from session if available
function loadUserData() {
    const session = localStorage.getItem('shadowban_session') || sessionStorage.getItem('shadowban_session');
    if (session) {
        try {
            const data = JSON.parse(session);
            if (data.firstName) userData.firstName = data.firstName;
            if (data.lastName) userData.lastName = data.lastName;
            if (data.email) userData.email = data.email;
            if (data.plan) userData.plan = { ...userData.plan, ...data.plan };
        } catch (e) {
            console.error('Error loading user data:', e);
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initUI();
    initNavigation();
    initMobileMenu();
    initTabs();
    initModal();
    initForms();
    initLiveChat();
    renderAccounts();
    updateStats();
});

// ============================================
// UI INITIALIZATION
// ============================================
function initUI() {
    // Update user info displays
    const firstName = document.getElementById('user-first-name');
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarEmail = document.getElementById('sidebar-user-email');
    const sidebarPlan = document.getElementById('sidebar-plan-name');
    const profileFname = document.getElementById('profile-fname');
    const profileLname = document.getElementById('profile-lname');
    const profileEmail = document.getElementById('profile-email');
    
    if (firstName) firstName.textContent = userData.firstName;
    if (sidebarName) sidebarName.textContent = `${userData.firstName} ${userData.lastName}`;
    if (sidebarEmail) sidebarEmail.textContent = userData.email;
    if (sidebarPlan) sidebarPlan.textContent = userData.plan.name;
    if (profileFname) profileFname.value = userData.firstName;
    if (profileLname) profileLname.value = userData.lastName;
    if (profileEmail) profileEmail.value = userData.email;
    
    // Sidebar stats
    const sidebarAccounts = document.getElementById('sidebar-accounts');
    const sidebarAI = document.getElementById('sidebar-ai');
    if (sidebarAccounts) sidebarAccounts.textContent = `${userData.accounts.length}/${userData.plan.accounts}`;
    if (sidebarAI) sidebarAI.textContent = `${userData.plan.aiPerDay}/day`;
    
    // Current plan display
    const planName = document.getElementById('current-plan-name');
    const planPrice = document.getElementById('current-plan-price');
    if (planName) planName.textContent = userData.plan.name;
    if (planPrice) planPrice.textContent = userData.plan.price;
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(s => s.classList.remove('active'));
            const target = document.getElementById(targetId);
            if (target) target.classList.add('active');
            
            // Update top bar title
            const topTitle = document.querySelector('.top-bar-title');
            if (topTitle) {
                topTitle.textContent = this.querySelector('span:not(.icon)').textContent;
            }
            
            // Close mobile menu
            closeMobileMenu();
        });
    });
    
    // Quick action buttons
    document.querySelectorAll('.quick-actions .btn-primary, .quick-actions .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            if (action.includes('Add Account')) {
                showModal();
            } else if (action.includes('Run Check') || action.includes('Check')) {
                navigateTo('tools');
            } else if (action.includes('Reports')) {
                navigateTo('reports');
            } else if (action.includes('Shadow AI')) {
                // Trigger Shadow AI open
                const aiBtn = document.getElementById('open-ai');
                if (aiBtn) aiBtn.click();
            }
        });
    });
}

function navigateTo(sectionId) {
    const link = document.querySelector(`.sidebar-nav a[href="#${sectionId}"]`);
    if (link) link.click();
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('open');
        });
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeMobileMenu);
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
}

// ============================================
// TABS (Settings)
// ============================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show target tab content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${tabId}`);
            if (target) target.classList.add('active');
        });
    });
}

// ============================================
// MODAL
// ============================================
function initModal() {
    const modal = document.getElementById('add-account-modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    
    if (closeBtn) closeBtn.addEventListener('click', hideModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const platform = document.getElementById('new-platform').value;
            const username = document.getElementById('new-username').value;
            const nickname = document.getElementById('new-nickname').value;
            
            if (!platform || !username) {
                showToast('⚠️', 'Please fill in platform and username');
                return;
            }
            
            // Add account
            const newAccount = {
                id: Date.now(),
                platform: platform,
                username: username.startsWith('@') ? username : '@' + username,
                nickname: nickname || platform.charAt(0).toUpperCase() + platform.slice(1),
                status: 'healthy'
            };
            
            userData.accounts.push(newAccount);
            renderAccounts();
            updateStats();
            hideModal();
            showToast('✅', 'Account added successfully');
            
            // Clear form
            document.getElementById('new-platform').value = '';
            document.getElementById('new-username').value = '';
            document.getElementById('new-nickname').value = '';
        });
    }
    
    // Click outside to close
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) hideModal();
        });
    }
}

function showModal() {
    const modal = document.getElementById('add-account-modal');
    if (modal) modal.classList.remove('hidden');
}

function hideModal() {
    const modal = document.getElementById('add-account-modal');
    if (modal) modal.classList.add('hidden');
}

// ============================================
// FORMS
// ============================================
function initForms() {
    // Profile form
    const saveProfile = document.getElementById('save-profile');
    if (saveProfile) {
        saveProfile.addEventListener('click', function() {
            userData.firstName = document.getElementById('profile-fname').value;
            userData.lastName = document.getElementById('profile-lname').value;
            userData.email = document.getElementById('profile-email').value;
            initUI();
            showToast('✅', 'Profile saved');
        });
    }
    
    // Support form
    const supportForm = document.getElementById('support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const topic = document.getElementById('support-topic').value;
            const msg = document.getElementById('support-msg').value;
            
            if (!topic || !msg) {
                showToast('⚠️', 'Please fill in all fields');
                return;
            }
            
            showToast('✅', 'Message sent! We\'ll respond within 24 hours.');
            supportForm.reset();
        });
    }
    
    // Tool buttons
    initToolButtons();
    
    // Filter buttons
    initFilterButtons();
}

function initToolButtons() {
    // Account Check
    const runCheck = document.getElementById('run-check');
    if (runCheck) {
        runCheck.addEventListener('click', function() {
            const platform = document.getElementById('tool-platform').value;
            const username = document.getElementById('tool-username').value;
            if (!platform || !username) {
                showToast('⚠️', 'Select platform and enter username');
                return;
            }
            showResults('Account Check', `Checking ${username} on ${platform}...`, true);
        });
    }
    
    // Hashtag Check
    const runHashtag = document.getElementById('run-hashtag-check');
    if (runHashtag) {
        runHashtag.addEventListener('click', function() {
            const platform = document.getElementById('hashtag-platform').value;
            const hashtag = document.getElementById('hashtag-input').value;
            if (!platform || !hashtag) {
                showToast('⚠️', 'Select platform and enter hashtag');
                return;
            }
            showResults('Hashtag Check', `Analyzing #${hashtag.replace('#', '')} on ${platform}...`, true);
        });
    }
    
    // IP Check
    const runIP = document.getElementById('run-ip-check');
    if (runIP) {
        runIP.addEventListener('click', function() {
            const useOwn = document.getElementById('user-ip').checked;
            const customIP = document.getElementById('custom-ip').value;
            const ip = useOwn ? 'Your IP' : customIP;
            if (!useOwn && !customIP) {
                showToast('⚠️', 'Enter an IP address or check "Use my IP"');
                return;
            }
            showResults('IP Check', `Analyzing IP: ${ip}...`, true);
        });
    }
    
    // Email Check
    const runEmail = document.getElementById('run-email-check');
    if (runEmail) {
        runEmail.addEventListener('click', function() {
            const email = document.getElementById('check-email').value;
            if (!email) {
                showToast('⚠️', 'Enter an email address');
                return;
            }
            showResults('Email Check', `Checking ${email}...`, true);
        });
    }
    
    // Phone Check
    const runPhone = document.getElementById('run-phone-check');
    if (runPhone) {
        runPhone.addEventListener('click', function() {
            const phone = document.getElementById('check-phone').value;
            if (!phone) {
                showToast('⚠️', 'Enter a phone number');
                return;
            }
            showResults('Phone Check', `Checking ${phone}...`, true);
        });
    }
    
    // Website Check
    const runWebsite = document.getElementById('run-website-check');
    if (runWebsite) {
        runWebsite.addEventListener('click', function() {
            const website = document.getElementById('check-website').value;
            if (!website) {
                showToast('⚠️', 'Enter a website URL');
                return;
            }
            showResults('Website Check', `Analyzing ${website}...`, true);
        });
    }
    
    // Bulk Check
    const runBulk = document.getElementById('run-bulk');
    if (runBulk) {
        runBulk.addEventListener('click', function() {
            showResults('Bulk Check', `Running checks on all ${userData.accounts.length} accounts...`, true);
        });
    }
    
    // Close results
    const closeResults = document.getElementById('close-results');
    if (closeResults) {
        closeResults.addEventListener('click', function() {
            const resultsBox = document.getElementById('results-box');
            if (resultsBox) resultsBox.classList.add('hidden');
        });
    }
}

function showResults(title, content, simulate) {
    const resultsBox = document.getElementById('results-box');
    const resultsTitle = document.getElementById('results-title');
    const resultsContent = document.getElementById('results-content');
    
    if (resultsBox) resultsBox.classList.remove('hidden');
    if (resultsTitle) resultsTitle.textContent = title;
    if (resultsContent) resultsContent.innerHTML = `<p>${content}</p>`;
    
    if (simulate) {
        setTimeout(() => {
            if (resultsContent) {
                resultsContent.innerHTML = `
                    <div style="padding: 1rem; background: var(--bg); border-radius: 8px;">
                        <p style="color: var(--success); font-weight: 600;">✅ Check Complete</p>
                        <p style="margin-top: 0.5rem;">No issues detected. Account appears healthy.</p>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">Last checked: ${new Date().toLocaleTimeString()}</p>
                    </div>
                `;
            }
        }, 2000);
    }
}

function initFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            renderAccounts(filter);
        });
    });
}

// ============================================
// ACCOUNTS
// ============================================
function renderAccounts(filter = 'all') {
    const grid = document.getElementById('accounts-grid');
    const miniList = document.getElementById('mini-accounts');
    const countEl = document.getElementById('accounts-count');
    const limitEl = document.getElementById('accounts-limit');
    
    let accounts = userData.accounts;
    if (filter !== 'all') {
        accounts = accounts.filter(a => a.status === filter);
    }
    
    // Platform icons
    const icons = {
        instagram: '📸', tiktok: '🎵', twitter: '🐦', facebook: '👤',
        youtube: '▶️', linkedin: '💼', pinterest: '📌', snapchat: '👻',
        threads: '🧵', bluesky: '🦋', mastodon: '🐘', reddit: '🤖',
        discord: '💬', whatsapp: '💬', telegram: '✈️', twitch: '🎮',
        kick: '🎮', amazon: '📦', ebay: '🛒', etsy: '🧶', shopify: '🛍️',
        medium: '📝', quora: '❓', rumble: '📺'
    };
    
    if (grid) {
        grid.innerHTML = accounts.map(acc => `
            <div class="account-card" data-id="${acc.id}">
                <div class="platform-icon">${icons[acc.platform] || '🌐'}</div>
                <div class="account-info">
                    <div class="account-name">${acc.nickname}</div>
                    <div class="account-username">${acc.username}</div>
                </div>
                <span class="status-badge ${acc.status}">${acc.status.charAt(0).toUpperCase() + acc.status.slice(1)}</span>
            </div>
        `).join('');
    }
    
    if (miniList) {
        miniList.innerHTML = userData.accounts.slice(0, 3).map(acc => `
            <li>
                <span class="mini-account">${icons[acc.platform] || '🌐'} ${acc.username}</span>
                <span class="status-badge ${acc.status}">${acc.status}</span>
            </li>
        `).join('');
    }
    
    if (countEl) countEl.textContent = userData.accounts.length;
    if (limitEl) limitEl.textContent = userData.plan.accounts;
}

// ============================================
// STATS
// ============================================
function updateStats() {
    const healthy = userData.accounts.filter(a => a.status === 'healthy').length;
    const issues = userData.accounts.filter(a => a.status === 'issues').length;
    const banned = userData.accounts.filter(a => a.status === 'banned').length;
    const total = userData.accounts.length;
    
    const statHealthy = document.getElementById('stat-healthy');
    const statIssues = document.getElementById('stat-issues');
    const statBanned = document.getElementById('stat-banned');
    const statTotal = document.getElementById('stat-total');
    
    if (statHealthy) statHealthy.textContent = healthy;
    if (statIssues) statIssues.textContent = issues;
    if (statBanned) statBanned.textContent = banned;
    if (statTotal) statTotal.textContent = total;
}

// ============================================
// LIVE CHAT - Admin Status Check
// ============================================
function initLiveChat() {
    checkAdminStatus();
    
    // Check admin status every 30 seconds
    setInterval(checkAdminStatus, 30000);
    
    // Live chat send button
    const sendBtn = document.getElementById('live-chat-send');
    const chatInput = document.getElementById('live-chat-input');
    
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', sendLiveMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendLiveMessage();
        });
    }
}

function checkAdminStatus() {
    const indicator = document.getElementById('admin-status-indicator');
    const statusText = document.getElementById('admin-status-text');
    const miniChat = document.getElementById('mini-chat');
    const chatOffline = document.getElementById('chat-offline');
    
    // Check localStorage for admin online status
    const adminOnline = localStorage.getItem('admin_online') === 'true';
    const lastSeen = localStorage.getItem('admin_last_seen');
    
    // Consider admin offline if last seen was more than 5 minutes ago
    let isOnline = adminOnline;
    if (lastSeen) {
        const timeSince = Date.now() - parseInt(lastSeen);
        if (timeSince > 5 * 60 * 1000) { // 5 minutes
            isOnline = false;
        }
    }
    
    if (indicator) {
        indicator.classList.toggle('online', isOnline);
    }
    
    if (statusText) {
        statusText.textContent = isOnline ? '🟢 Support is Online' : '🔴 Support is Offline';
    }
    
    if (miniChat && chatOffline) {
        if (isOnline) {
            miniChat.classList.remove('hidden');
            chatOffline.classList.add('hidden');
        } else {
            miniChat.classList.add('hidden');
            chatOffline.classList.remove('hidden');
        }
    }
}

function sendLiveMessage() {
    const chatInput = document.getElementById('live-chat-input');
    const chatMessages = document.getElementById('live-chat-messages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-message user';
    msgEl.innerHTML = `
        <span class="msg-sender">You</span>
        <span class="msg-text">${escapeHtml(message)}</span>
        <span class="msg-time">Just now</span>
    `;
    chatMessages.appendChild(msgEl);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Store message for admin to see (in localStorage for demo)
    const pendingMessages = JSON.parse(localStorage.getItem('pending_support_messages') || '[]');
    pendingMessages.push({
        id: Date.now(),
        from: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        text: message,
        time: new Date().toISOString()
    });
    localStorage.setItem('pending_support_messages', JSON.stringify(pendingMessages));
    
    showToast('📤', 'Message sent to support');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// TOAST
// ============================================
function showToast(icon, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastIcon && toastMessage) {
        toastIcon.textContent = icon;
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// Make showToast globally available
window.showToast = showToast;

})();
