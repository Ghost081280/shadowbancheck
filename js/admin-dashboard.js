/* =============================================================================
   ADMIN DASHBOARD - JavaScript v2.0
   ShadowBanCheck.io - Admin Panel Functionality
   
   Features:
   - Section navigation
   - Messages with reply functionality
   - Live chat management
   - User management
   - Stripe integration
   - API key configuration
   - Analytics
   - Settings
   ============================================================================= */

(function() {
'use strict';

// ============================================
// DEMO DATA
// ============================================
const messages = [
    {
        id: 1,
        name: 'Sarah Mitchell',
        email: 'sarah.m@gmail.com',
        avatar: '👩',
        preview: 'Hi, I think my Instagram account is shadow banned. My reach dropped by 80% last week...',
        time: '10 min ago',
        unread: true,
        fullMessage: 'Hi, I think my Instagram account is shadow banned. My reach dropped by 80% last week and none of my posts are showing up in hashtag searches. I\'ve been using the same hashtags for months. Can you help me figure out what\'s going on?'
    },
    {
        id: 2,
        name: 'Mike Johnson',
        email: 'mike.j@outlook.com',
        avatar: '👨',
        preview: 'Thanks for the help yesterday! My TikTok account is back to normal now...',
        time: '1 hour ago',
        unread: true,
        fullMessage: 'Thanks for the help yesterday! My TikTok account is back to normal now. The recovery tips worked perfectly. I\'ll definitely recommend your service to other creators.'
    },
    {
        id: 3,
        name: 'Emma Davis',
        email: 'emma.d@yahoo.com',
        avatar: '👩‍🦰',
        preview: 'I upgraded to Pro but I can\'t see the new features in my dashboard...',
        time: '2 hours ago',
        unread: true,
        fullMessage: 'I upgraded to Pro but I can\'t see the new features in my dashboard. It still shows I\'m on the free plan. I have the receipt from Stripe. Can you check my account?'
    },
    {
        id: 4,
        name: 'James Wilson',
        email: 'james.w@gmail.com',
        avatar: '👨‍💼',
        preview: 'Question about monitoring multiple Twitter accounts...',
        time: '3 hours ago',
        unread: false,
        fullMessage: 'Question about monitoring multiple Twitter accounts. I manage social media for 5 different clients. Can I add all their accounts under one subscription or do I need separate plans?'
    },
    {
        id: 5,
        name: 'Lisa Chen',
        email: 'lisa.c@company.com',
        avatar: '👩‍💻',
        preview: 'We\'re interested in the white-label solution for our agency...',
        time: '5 hours ago',
        unread: false,
        fullMessage: 'We\'re interested in the white-label solution for our agency. We have about 200 clients and would need custom branding. Can we schedule a call to discuss enterprise pricing?'
    }
];

const activeChats = [
    {
        id: 1,
        name: 'Sarah Mitchell',
        avatar: '👩',
        online: true,
        preview: 'Typing...',
        unreadCount: 2,
        lastTime: 'now',
        messages: [
            { from: 'user', text: 'Hi, my Instagram reach dropped suddenly', time: '2 min ago' },
            { from: 'user', text: 'Is there a way to check if I\'m shadow banned?', time: '1 min ago' }
        ]
    },
    {
        id: 2,
        name: 'David Park',
        avatar: '👨‍🎤',
        online: true,
        preview: 'How long does recovery usually take?',
        unreadCount: 0,
        lastTime: '5 min ago',
        messages: [
            { from: 'user', text: 'I got a shadow ban warning on my dashboard', time: '10 min ago' },
            { from: 'admin', text: 'I see your TikTok account is flagged. Let me check the details.', time: '8 min ago' },
            { from: 'admin', text: 'It looks like you used a restricted hashtag in your last post.', time: '7 min ago' },
            { from: 'user', text: 'Oh no, which one?', time: '6 min ago' },
            { from: 'admin', text: 'The #viral hashtag has been restricted. Remove it and wait 24 hours.', time: '5 min ago' },
            { from: 'user', text: 'How long does recovery usually take?', time: '5 min ago' }
        ]
    }
];

const users = [
    { id: 1, name: 'Sarah Mitchell', email: 'sarah.m@gmail.com', plan: 'pro', joined: 'Nov 20, 2025', status: 'active' },
    { id: 2, name: 'Mike Johnson', email: 'mike.j@outlook.com', plan: 'starter', joined: 'Nov 18, 2025', status: 'active' },
    { id: 3, name: 'Emma Davis', email: 'emma.d@yahoo.com', plan: 'premium', joined: 'Nov 15, 2025', status: 'active' },
    { id: 4, name: 'James Wilson', email: 'james.w@gmail.com', plan: 'pro', joined: 'Nov 12, 2025', status: 'active' },
    { id: 5, name: 'Lisa Chen', email: 'lisa.c@company.com', plan: 'free', joined: 'Nov 10, 2025', status: 'active' },
    { id: 6, name: 'Alex Turner', email: 'alex.t@email.com', plan: 'pro', joined: 'Nov 8, 2025', status: 'inactive' },
    { id: 7, name: 'Maria Garcia', email: 'maria.g@email.com', plan: 'starter', joined: 'Nov 5, 2025', status: 'active' },
    { id: 8, name: 'John Smith', email: 'john.s@email.com', plan: 'free', joined: 'Nov 1, 2025', status: 'active' }
];

const transactions = [
    { id: 1, customer: 'Sarah Mitchell', amount: '$9.99', plan: 'Pro', status: 'succeeded', date: 'Nov 24' },
    { id: 2, customer: 'Emma Davis', amount: '$14.99', plan: 'Premium', status: 'succeeded', date: 'Nov 24' },
    { id: 3, customer: 'Mike Johnson', amount: '$4.99', plan: 'Starter', status: 'succeeded', date: 'Nov 23' },
    { id: 4, customer: 'Alex Turner', amount: '$9.99', plan: 'Pro', status: 'failed', date: 'Nov 22' },
    { id: 5, customer: 'Maria Garcia', amount: '$4.99', plan: 'Starter', status: 'succeeded', date: 'Nov 21' }
];

// State
let currentChat = null;
let currentMessage = null;
let currentSection = 'dashboard';
let isOnline = localStorage.getItem('admin_online') !== 'false';
let apiKeys = JSON.parse(localStorage.getItem('admin_api_keys') || '{}');

// Set initial online status
localStorage.setItem('admin_online', isOnline ? 'true' : 'false');
localStorage.setItem('admin_last_seen', Date.now().toString());

// ============================================
// SECTION NAVIGATION
// ============================================
window.switchSection = function(section) {
    console.log('Switching to section:', section);
    currentSection = section;
    
    // Update nav active state
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });
    
    // Show/hide sections
    document.querySelectorAll('.admin-section').forEach(s => {
        s.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Close mobile sidebar
    document.getElementById('admin-sidebar')?.classList.remove('open');
    
    // Refresh section data
    if (section === 'messages') renderMessages();
    if (section === 'chats') renderChats();
    if (section === 'users') renderUsers();
    if (section === 'stripe') renderStripeData();
    if (section === 'api-keys') updateApiStatusCards();
};

function initNavigation() {
    // Sidebar navigation
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
        });
    });
    
    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('admin-sidebar');
    
    if (mobileBtn && sidebar) {
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                !mobileBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderMessages() {
    const listContainer = document.getElementById('messages-list');
    const previewContainer = document.getElementById('dashboard-messages-preview');
    
    if (listContainer) {
        listContainer.innerHTML = messages.map(msg => `
            <div class="message-item ${msg.unread ? 'unread' : ''} ${currentMessage === msg.id ? 'active' : ''}" 
                 data-id="${msg.id}" onclick="selectMessage(${msg.id})">
                <div class="message-avatar">${msg.avatar}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-name">${msg.name}</span>
                        <span class="message-time">${msg.time}</span>
                    </div>
                    <p class="message-preview">${msg.preview}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Dashboard preview (first 3)
    if (previewContainer) {
        previewContainer.innerHTML = messages.slice(0, 3).map(msg => `
            <div class="message-item ${msg.unread ? 'unread' : ''}" onclick="switchSection('messages'); selectMessage(${msg.id});">
                <div class="message-avatar">${msg.avatar}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-name">${msg.name}</span>
                        <span class="message-time">${msg.time}</span>
                    </div>
                    <p class="message-preview">${msg.preview}</p>
                </div>
            </div>
        `).join('');
    }
    
    updateUnreadBadge();
}

function renderChats() {
    const listContainer = document.getElementById('chats-list');
    const previewContainer = document.getElementById('dashboard-chats-preview');
    
    const chatHTML = activeChats.map(chat => `
        <div class="chat-item ${currentChat === chat.id ? 'active' : ''}" onclick="selectChat(${chat.id})">
            <div class="chat-avatar">
                ${chat.avatar}
                ${chat.online ? '<span class="online-dot"></span>' : ''}
            </div>
            <div class="chat-info">
                <div class="chat-name">${chat.name}</div>
                <div class="chat-preview">${chat.preview}</div>
            </div>
            <div class="chat-meta">
                <div class="chat-time">${chat.lastTime}</div>
                ${chat.unreadCount > 0 ? `<div class="chat-unread">${chat.unreadCount}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    if (listContainer) listContainer.innerHTML = chatHTML;
    if (previewContainer) previewContainer.innerHTML = chatHTML;
    
    updateOnlineBadge();
}

function renderChatWindow() {
    const messagesContainer = document.getElementById('admin-chat-messages');
    const titleEl = document.getElementById('chat-window-title');
    const statusEl = document.getElementById('chat-online-status');
    const inputEl = document.getElementById('admin-chat-input');
    const sendBtn = document.getElementById('admin-send-btn');
    const emptyState = document.getElementById('chat-empty');
    
    if (!currentChat) {
        if (emptyState) emptyState.style.display = 'flex';
        if (inputEl) inputEl.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
        if (titleEl) titleEl.textContent = '💬 Select a chat';
        if (statusEl) statusEl.textContent = '';
        return;
    }
    
    const chat = activeChats.find(c => c.id === currentChat);
    if (!chat) return;
    
    if (emptyState) emptyState.style.display = 'none';
    if (inputEl) inputEl.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    if (titleEl) titleEl.textContent = `💬 ${chat.name}`;
    if (statusEl) {
        statusEl.textContent = chat.online ? '● Online' : '○ Offline';
        statusEl.className = chat.online ? 'online-indicator' : 'online-indicator offline';
    }
    
    const messagesHTML = chat.messages.map(msg => `
        <div class="chat-bubble ${msg.from}">
            ${msg.text}
            <div class="chat-bubble-time">${msg.time}</div>
        </div>
    `).join('');
    
    messagesContainer.innerHTML = messagesHTML;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderMessageWindow() {
    const contentArea = document.getElementById('message-content-area');
    const titleEl = document.getElementById('message-window-title');
    const emailEl = document.getElementById('message-email');
    const inputEl = document.getElementById('message-reply-input');
    const sendBtn = document.getElementById('message-send-btn');
    const emptyState = document.getElementById('message-empty');
    
    if (!currentMessage) {
        if (emptyState) emptyState.style.display = 'flex';
        if (inputEl) inputEl.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
        if (titleEl) titleEl.textContent = '📧 Select a message';
        if (emailEl) emailEl.textContent = '';
        return;
    }
    
    const msg = messages.find(m => m.id === currentMessage);
    if (!msg) return;
    
    if (emptyState) emptyState.style.display = 'none';
    if (inputEl) inputEl.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    if (titleEl) titleEl.textContent = `📧 ${msg.name}`;
    if (emailEl) emailEl.textContent = msg.email;
    
    contentArea.innerHTML = `
        <div class="message-full">
            <div class="message-full-header">
                <div class="message-avatar">${msg.avatar}</div>
                <div>
                    <div class="message-name">${msg.name}</div>
                    <div class="message-time">${msg.time}</div>
                </div>
            </div>
            <div class="message-full-text">${msg.fullMessage}</div>
        </div>
    `;
}

function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="user-row-avatar">
                    <div class="user-avatar">👤</div>
                    <span>${user.name}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="plan-badge ${user.plan}">${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</span></td>
            <td>${user.joined}</td>
            <td><span class="status-badge ${user.status}">${user.status}</span></td>
            <td>
                <button class="btn-secondary btn-small" onclick="viewUser(${user.id})">View</button>
                <button class="btn-secondary btn-small" onclick="emailUser(${user.id})">Email</button>
            </td>
        </tr>
    `).join('');
}

function renderStripeData() {
    const transactionsContainer = document.getElementById('stripe-transactions');
    if (!transactionsContainer) return;
    
    transactionsContainer.innerHTML = transactions.map(tx => `
        <div class="transaction-item">
            <div class="transaction-info">
                <span>${tx.customer}</span>
                <span style="color: var(--text-muted);">${tx.plan}</span>
            </div>
            <div class="transaction-info">
                <span>${tx.amount}</span>
                <span class="transaction-status ${tx.status}">${tx.status}</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// SELECTION FUNCTIONS
// ============================================
window.selectMessage = function(id) {
    currentMessage = id;
    
    // Mark as read
    const msg = messages.find(m => m.id === id);
    if (msg) msg.unread = false;
    
    renderMessages();
    renderMessageWindow();
};

window.selectChat = function(id) {
    currentChat = id;
    
    // Clear unread
    const chat = activeChats.find(c => c.id === id);
    if (chat) chat.unreadCount = 0;
    
    renderChats();
    renderChatWindow();
};

// ============================================
// SEND FUNCTIONS
// ============================================
function sendChatMessage() {
    const input = document.getElementById('admin-chat-input');
    if (!input || !currentChat) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    const chat = activeChats.find(c => c.id === currentChat);
    if (!chat) return;
    
    chat.messages.push({
        from: 'admin',
        text: text,
        time: 'just now'
    });
    
    chat.preview = text.substring(0, 30) + '...';
    chat.lastTime = 'now';
    
    input.value = '';
    renderChats();
    renderChatWindow();
    showToast('✅', 'Message sent');
}

function sendMessageReply() {
    const input = document.getElementById('message-reply-input');
    if (!input || !currentMessage) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    const msg = messages.find(m => m.id === currentMessage);
    if (!msg) return;
    
    // In production, this would send an email
    showToast('✅', `Reply sent to ${msg.email}`);
    input.value = '';
}

// ============================================
// USER FUNCTIONS
// ============================================
window.viewUser = function(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        showToast('👤', `Viewing ${user.name}`);
    }
};

window.emailUser = function(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        window.location.href = `mailto:${user.email}`;
    }
};

// ============================================
// API KEY MANAGEMENT
// ============================================
window.toggleKeyVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
};

window.copyToClipboard = function(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        navigator.clipboard.writeText(input.value);
        showToast('📋', 'Copied to clipboard');
    }
};

window.saveApiKey = function(service) {
    let keyData = {};
    
    switch(service) {
        case 'anthropic':
            keyData = {
                apiKey: document.getElementById('api-anthropic')?.value,
                model: document.getElementById('anthropic-model')?.value
            };
            break;
        case 'twitter':
            keyData = {
                bearer: document.getElementById('api-twitter-bearer')?.value,
                apiKey: document.getElementById('api-twitter-key')?.value,
                apiSecret: document.getElementById('api-twitter-secret')?.value
            };
            break;
        case 'reddit':
            keyData = {
                clientId: document.getElementById('api-reddit-client')?.value,
                clientSecret: document.getElementById('api-reddit-secret')?.value
            };
            break;
        case 'email':
            keyData = {
                service: document.getElementById('email-service')?.value,
                apiKey: document.getElementById('api-email')?.value,
                from: document.getElementById('email-from')?.value
            };
            break;
        case 'twilio':
            keyData = {
                sid: document.getElementById('api-twilio-sid')?.value,
                token: document.getElementById('api-twilio-token')?.value,
                from: document.getElementById('twilio-from')?.value
            };
            break;
        case 'database':
            keyData = {
                type: document.getElementById('db-type')?.value,
                url: document.getElementById('api-db-url')?.value
            };
            break;
    }
    
    apiKeys[service] = keyData;
    localStorage.setItem('admin_api_keys', JSON.stringify(apiKeys));
    
    updateApiStatusCards();
    updateEnvPreview();
    showToast('✅', `${service} API key saved`);
};

function updateApiStatusCards() {
    const services = ['anthropic', 'twitter', 'reddit', 'email'];
    
    services.forEach(service => {
        const card = document.getElementById(`api-status-${service}`);
        if (card) {
            const badge = card.querySelector('.api-status-badge');
            const hasKey = apiKeys[service] && Object.values(apiKeys[service]).some(v => v && v.length > 0);
            
            if (badge) {
                if (hasKey) {
                    badge.textContent = 'Configured';
                    badge.className = 'api-status-badge configured';
                } else {
                    badge.textContent = 'Not Configured';
                    badge.className = 'api-status-badge not-configured';
                }
            }
        }
    });
    
    // Load saved values into inputs
    Object.keys(apiKeys).forEach(service => {
        const data = apiKeys[service];
        if (!data) return;
        
        switch(service) {
            case 'anthropic':
                if (document.getElementById('api-anthropic')) {
                    document.getElementById('api-anthropic').value = data.apiKey || '';
                }
                if (document.getElementById('anthropic-model') && data.model) {
                    document.getElementById('anthropic-model').value = data.model;
                }
                break;
            case 'twitter':
                if (document.getElementById('api-twitter-bearer')) {
                    document.getElementById('api-twitter-bearer').value = data.bearer || '';
                }
                if (document.getElementById('api-twitter-key')) {
                    document.getElementById('api-twitter-key').value = data.apiKey || '';
                }
                if (document.getElementById('api-twitter-secret')) {
                    document.getElementById('api-twitter-secret').value = data.apiSecret || '';
                }
                break;
            case 'reddit':
                if (document.getElementById('api-reddit-client')) {
                    document.getElementById('api-reddit-client').value = data.clientId || '';
                }
                if (document.getElementById('api-reddit-secret')) {
                    document.getElementById('api-reddit-secret').value = data.clientSecret || '';
                }
                break;
            case 'email':
                if (document.getElementById('email-service') && data.service) {
                    document.getElementById('email-service').value = data.service;
                }
                if (document.getElementById('api-email')) {
                    document.getElementById('api-email').value = data.apiKey || '';
                }
                if (document.getElementById('email-from')) {
                    document.getElementById('email-from').value = data.from || '';
                }
                break;
        }
    });
}

function updateEnvPreview() {
    const preview = document.getElementById('env-preview');
    if (!preview) return;
    
    let envContent = '# ShadowBanCheck.io Environment Variables\n# Generated from Admin Dashboard\n\n';
    
    if (apiKeys.anthropic?.apiKey) {
        envContent += `# Anthropic (Claude AI)\nANTHROPIC_API_KEY=${apiKeys.anthropic.apiKey}\nANTHROPIC_MODEL=${apiKeys.anthropic.model || 'claude-3-sonnet-20240229'}\n\n`;
    }
    
    if (apiKeys.twitter?.bearer) {
        envContent += `# Twitter/X API\nTWITTER_BEARER_TOKEN=${apiKeys.twitter.bearer}\n`;
        if (apiKeys.twitter.apiKey) envContent += `TWITTER_API_KEY=${apiKeys.twitter.apiKey}\n`;
        if (apiKeys.twitter.apiSecret) envContent += `TWITTER_API_SECRET=${apiKeys.twitter.apiSecret}\n`;
        envContent += '\n';
    }
    
    if (apiKeys.reddit?.clientId) {
        envContent += `# Reddit API\nREDDIT_CLIENT_ID=${apiKeys.reddit.clientId}\n`;
        if (apiKeys.reddit.clientSecret) envContent += `REDDIT_CLIENT_SECRET=${apiKeys.reddit.clientSecret}\n`;
        envContent += '\n';
    }
    
    if (apiKeys.email?.apiKey) {
        envContent += `# Email Service (${apiKeys.email.service || 'SendGrid'})\nEMAIL_API_KEY=${apiKeys.email.apiKey}\n`;
        if (apiKeys.email.from) envContent += `EMAIL_FROM=${apiKeys.email.from}\n`;
        envContent += '\n';
    }
    
    if (apiKeys.twilio?.sid) {
        envContent += `# Twilio SMS\nTWILIO_ACCOUNT_SID=${apiKeys.twilio.sid}\n`;
        if (apiKeys.twilio.token) envContent += `TWILIO_AUTH_TOKEN=${apiKeys.twilio.token}\n`;
        if (apiKeys.twilio.from) envContent += `TWILIO_FROM_NUMBER=${apiKeys.twilio.from}\n`;
        envContent += '\n';
    }
    
    if (apiKeys.database?.url) {
        envContent += `# Database\nDATABASE_URL=${apiKeys.database.url}\n`;
        envContent += '\n';
    }
    
    if (apiKeys.stripe?.pk) {
        envContent += `# Stripe\nSTRIPE_PUBLISHABLE_KEY=${apiKeys.stripe.pk}\n`;
        if (apiKeys.stripe.sk) envContent += `STRIPE_SECRET_KEY=${apiKeys.stripe.sk}\n`;
        if (apiKeys.stripe.webhook) envContent += `STRIPE_WEBHOOK_SECRET=${apiKeys.stripe.webhook}\n`;
        envContent += '\n';
    }
    
    preview.textContent = envContent || '# No API keys configured yet';
}

window.exportEnvVars = function() {
    updateEnvPreview();
    const content = document.getElementById('env-preview')?.textContent || '';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('📥', 'Environment file downloaded');
};

// ============================================
// STRIPE CONFIGURATION
// ============================================
window.saveStripeConfig = function() {
    apiKeys.stripe = {
        pk: document.getElementById('stripe-pk')?.value,
        sk: document.getElementById('stripe-sk')?.value,
        webhook: document.getElementById('stripe-webhook')?.value,
        webhookUrl: document.getElementById('stripe-webhook-url')?.value
    };
    
    localStorage.setItem('admin_api_keys', JSON.stringify(apiKeys));
    updateEnvPreview();
    
    // Update status badge
    const statusEl = document.getElementById('stripe-config-status');
    if (statusEl && apiKeys.stripe.pk) {
        if (apiKeys.stripe.pk.startsWith('pk_live')) {
            statusEl.textContent = '✅ Live Mode';
            statusEl.className = 'config-status live';
        } else {
            statusEl.textContent = '⚠️ Test Mode';
            statusEl.className = 'config-status';
        }
    }
    
    showToast('✅', 'Stripe configuration saved');
};

window.testStripeConnection = function() {
    const pk = document.getElementById('stripe-pk')?.value;
    
    if (!pk) {
        showToast('❌', 'Please enter a publishable key first');
        return;
    }
    
    // In production, this would make a test API call
    showToast('🔌', 'Testing Stripe connection...');
    
    setTimeout(() => {
        if (pk.startsWith('pk_')) {
            showToast('✅', 'Stripe connection successful!');
        } else {
            showToast('❌', 'Invalid key format');
        }
    }, 1000);
};

// ============================================
// SETTINGS FUNCTIONS
// ============================================
window.saveAdminProfile = function() {
    showToast('✅', 'Profile saved');
};

window.saveSiteSettings = function() {
    showToast('✅', 'Site settings saved');
};

window.clearCache = function() {
    if (confirm('Clear all cached data?')) {
        showToast('🗑️', 'Cache cleared');
    }
};

window.resetDemo = function() {
    if (confirm('Reset all demo data?')) {
        localStorage.removeItem('admin_api_keys');
        apiKeys = {};
        showToast('🔄', 'Demo data reset');
        location.reload();
    }
};

window.exportData = function() {
    showToast('📥', 'Preparing data export...');
};

// ============================================
// STATUS & BADGES
// ============================================
function updateUnreadBadge() {
    const badge = document.getElementById('unread-badge');
    const stat = document.getElementById('stat-messages');
    const unreadCount = messages.filter(m => m.unread).length;
    
    if (badge) badge.textContent = `${unreadCount} unread`;
    if (stat) stat.textContent = unreadCount;
}

function updateOnlineBadge() {
    const badge = document.getElementById('online-badge');
    const stat = document.getElementById('stat-chats');
    const onlineCount = activeChats.filter(c => c.online).length;
    
    if (badge) badge.textContent = `${onlineCount} online`;
    if (stat) stat.textContent = activeChats.length;
}

// ============================================
// STATUS TOGGLE
// ============================================
function toggleStatus() {
    isOnline = !isOnline;
    
    localStorage.setItem('admin_online', isOnline ? 'true' : 'false');
    localStorage.setItem('admin_last_seen', Date.now().toString());
    
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    const btn = document.getElementById('toggle-status');
    
    if (dot) dot.className = isOnline ? 'status-dot' : 'status-dot offline';
    if (text) text.textContent = isOnline ? "You're Online" : "You're Offline";
    if (btn) btn.textContent = isOnline ? 'Go Offline' : 'Go Online';
    
    showToast(isOnline ? '🟢' : '🔴', isOnline ? 'You are now online' : 'You are now offline');
}

// ============================================
// TOAST
// ============================================
function showToast(icon, message) {
    const toast = document.getElementById('toast');
    const iconEl = document.getElementById('toast-icon');
    const msgEl = document.getElementById('toast-message');
    
    if (!toast) return;
    
    if (iconEl) iconEl.textContent = icon;
    if (msgEl) msgEl.textContent = message;
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

window.showToast = showToast;

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('🔧 Admin Dashboard v2.0 Initializing...');
    
    // Initialize navigation
    initNavigation();
    
    // Render initial data
    renderMessages();
    renderChats();
    renderChatWindow();
    renderUsers();
    renderStripeData();
    updateApiStatusCards();
    updateEnvPreview();
    
    // Status toggle
    document.getElementById('toggle-status')?.addEventListener('click', toggleStatus);
    
    // Chat send
    document.getElementById('admin-send-btn')?.addEventListener('click', sendChatMessage);
    document.getElementById('admin-chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
    
    // Message reply send
    document.getElementById('message-send-btn')?.addEventListener('click', sendMessageReply);
    
    // User search
    document.getElementById('user-search')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = users.filter(u => 
            u.name.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query)
        );
        
        const tbody = document.getElementById('users-table-body');
        if (tbody) {
            tbody.innerHTML = filtered.map(user => `
                <tr>
                    <td>
                        <div class="user-row-avatar">
                            <div class="user-avatar">👤</div>
                            <span>${user.name}</span>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td><span class="plan-badge ${user.plan}">${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</span></td>
                    <td>${user.joined}</td>
                    <td><span class="status-badge ${user.status}">${user.status}</span></td>
                    <td>
                        <button class="btn-secondary btn-small" onclick="viewUser(${user.id})">View</button>
                        <button class="btn-secondary btn-small" onclick="emailUser(${user.id})">Email</button>
                    </td>
                </tr>
            `).join('');
        }
    });
    
    // Load saved Stripe config
    if (apiKeys.stripe) {
        if (document.getElementById('stripe-pk')) {
            document.getElementById('stripe-pk').value = apiKeys.stripe.pk || '';
        }
        if (document.getElementById('stripe-sk')) {
            document.getElementById('stripe-sk').value = apiKeys.stripe.sk || '';
        }
        if (document.getElementById('stripe-webhook')) {
            document.getElementById('stripe-webhook').value = apiKeys.stripe.webhook || '';
        }
        if (document.getElementById('stripe-webhook-url')) {
            document.getElementById('stripe-webhook-url').value = apiKeys.stripe.webhookUrl || '';
        }
    }
    
    console.log('✅ Admin Dashboard Ready');
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
