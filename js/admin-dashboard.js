/* =============================================================================
   ADMIN-DASHBOARD.JS v1.0
   ShadowBanCheck.io - Admin Dashboard (All-in-One)
   
   Everything the Admin dashboard needs in one file:
   - Auth & Session
   - Navigation
   - Toast & Modals
   - Messages Inbox
   - Live Chats
   - User Management (display)
   - Stats
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// DEMO DATA
// =============================================================================
const DemoData = {
    messages: [
        { id: 1, name: 'Sarah Mitchell', email: 'sarah.m@gmail.com', avatar: '👩', preview: 'Hi, I think my Instagram account is shadow banned...', time: '10 min ago', unread: true, messages: [
            { from: 'user', text: 'Hi, I think my Instagram account is shadow banned. My posts are getting no engagement.', time: '10 min ago' },
            { from: 'user', text: 'I ran a check and got 67% probability. What should I do?', time: '9 min ago' }
        ]},
        { id: 2, name: 'Mike Johnson', email: 'mike.j@outlook.com', avatar: '👨', preview: 'Thanks for the help yesterday! My TikTok account is back...', time: '1 hour ago', unread: true, messages: [
            { from: 'user', text: 'Thanks for the help yesterday!', time: '1 hour ago' },
            { from: 'user', text: 'My TikTok account is back to normal after following your advice.', time: '1 hour ago' }
        ]},
        { id: 3, name: 'Emma Davis', email: 'emma.d@yahoo.com', avatar: '👩‍🦰', preview: 'I upgraded to Pro but I can\'t see the new features...', time: '2 hours ago', unread: false, messages: [
            { from: 'user', text: 'I upgraded to Pro but I can\'t see the new features.', time: '2 hours ago' },
            { from: 'admin', text: 'Hi Emma! Let me check your account. What email did you use?', time: '1 hour 45 min ago' },
            { from: 'user', text: 'emma.d@yahoo.com', time: '1 hour 30 min ago' }
        ]}
    ],
    
    liveChats: [
        { id: 1, name: 'Sarah Mitchell', email: 'sarah.m@gmail.com', avatar: '👩', online: true, typing: true, preview: 'Typing...', time: 'now', messages: [
            { from: 'user', text: 'Hi, I\'m still having issues with my Instagram.', time: '2 min ago' },
            { from: 'admin', text: 'I see. Let me pull up your account details.', time: '1 min ago' }
        ]},
        { id: 2, name: 'David Park', email: 'david.p@gmail.com', avatar: '👨‍🎤', online: true, typing: false, preview: 'How long does recovery usually take?', time: '5 min ago', messages: [
            { from: 'user', text: 'I got a warning on my Twitter account.', time: '10 min ago' },
            { from: 'admin', text: 'What kind of warning are you seeing?', time: '8 min ago' },
            { from: 'user', text: 'It says my replies may be limited.', time: '6 min ago' },
            { from: 'user', text: 'How long does recovery usually take?', time: '5 min ago' }
        ]}
    ],
    
    stats: {
        users: 156,
        checksToday: 1234,
        revenue: 1247,
        aiQueries: 89
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
    
    document.querySelectorAll('.admin-section').forEach(section => {
        const sectionId = section.id.replace('section-', '');
        section.classList.toggle('active', sectionId === sectionName);
    });
    
    document.querySelector('.admin-sidebar')?.classList.remove('open');
    
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
    const sidebar = document.querySelector('.admin-sidebar');
    
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
// CHAT MANAGER
// =============================================================================
const ChatManager = {
    currentChat: null,
    
    // Render messages list in sidebar
    renderMessagesList() {
        const container = document.getElementById('messages-list');
        if (!container) return;
        
        container.innerHTML = DemoData.messages.map(msg => `
            <div class="message-item ${msg.unread ? 'unread' : ''}" data-message-id="${msg.id}">
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
        
        container.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', () => {
                this.openMessage(parseInt(item.dataset.messageId));
            });
        });
    },
    
    // Render live chats list
    renderChatsList() {
        const container = document.getElementById('chats-list');
        if (!container) return;
        
        container.innerHTML = DemoData.liveChats.map(chat => `
            <div class="chat-item" data-chat-id="${chat.id}">
                <div class="chat-avatar" style="position: relative;">
                    ${chat.avatar}
                    ${chat.online ? '<span class="online-dot"></span>' : ''}
                </div>
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-preview">${chat.typing ? '<em>Typing...</em>' : chat.preview}</div>
                </div>
                <span class="chat-time">${chat.time}</span>
            </div>
        `).join('');
        
        container.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => {
                this.openLiveChat(parseInt(item.dataset.chatId));
            });
        });
    },
    
    // Render dashboard preview cards
    renderDashboardPreviews() {
        const messagesContainer = document.getElementById('dashboard-messages');
        const chatsContainer = document.getElementById('dashboard-chats');
        
        if (messagesContainer) {
            messagesContainer.innerHTML = DemoData.messages.slice(0, 3).map(msg => `
                <div class="message-item ${msg.unread ? 'unread' : ''}" onclick="switchSection('messages')">
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
        
        if (chatsContainer) {
            chatsContainer.innerHTML = DemoData.liveChats.map(chat => `
                <div class="chat-item" onclick="switchSection('chats')">
                    <div class="chat-avatar" style="position: relative;">
                        ${chat.avatar}
                        ${chat.online ? '<span class="online-dot"></span>' : ''}
                    </div>
                    <div class="chat-info">
                        <div class="chat-name">${chat.name}</div>
                        <div class="chat-preview">${chat.typing ? '<em>Typing...</em>' : chat.preview}</div>
                    </div>
                    <span class="chat-time">${chat.time}</span>
                </div>
            `).join('');
        }
    },
    
    // Open a message conversation
    openMessage(id) {
        const msg = DemoData.messages.find(m => m.id === id);
        if (!msg) return;
        
        // Mark as read
        msg.unread = false;
        this.renderMessagesList();
        this.updateUnreadCount();
        
        // Update detail panel
        const chatArea = document.getElementById('message-chat-area');
        const titleEl = document.getElementById('message-detail-title');
        
        if (titleEl) titleEl.textContent = `📧 ${msg.name}`;
        
        if (chatArea) {
            chatArea.innerHTML = msg.messages.map(m => `
                <div class="chat-message ${m.from === 'admin' ? 'admin' : 'user'}">
                    <div class="chat-message-avatar">${m.from === 'admin' ? '👤' : msg.avatar}</div>
                    <div class="chat-message-content">
                        <div class="chat-message-bubble">${m.text}</div>
                        <div class="chat-message-time">${m.time}</div>
                    </div>
                </div>
            `).join('');
            chatArea.scrollTop = chatArea.scrollHeight;
        }
        
        // Enable input
        const input = document.getElementById('message-reply-input');
        const btn = document.getElementById('message-reply-btn');
        if (input) { input.disabled = false; input.placeholder = 'Type your reply...'; }
        if (btn) btn.disabled = false;
        
        this.currentChat = { type: 'message', id };
    },
    
    // Open a live chat
    openLiveChat(id) {
        const chat = DemoData.liveChats.find(c => c.id === id);
        if (!chat) return;
        
        const chatArea = document.getElementById('live-chat-area');
        const titleEl = document.getElementById('chat-detail-title');
        
        if (titleEl) titleEl.textContent = `💬 ${chat.name}`;
        
        if (chatArea) {
            chatArea.innerHTML = chat.messages.map(m => `
                <div class="chat-message ${m.from === 'admin' ? 'admin' : 'user'}">
                    <div class="chat-message-avatar">${m.from === 'admin' ? '👤' : chat.avatar}</div>
                    <div class="chat-message-content">
                        <div class="chat-message-bubble">${m.text}</div>
                        <div class="chat-message-time">${m.time}</div>
                    </div>
                </div>
            `).join('');
            chatArea.scrollTop = chatArea.scrollHeight;
        }
        
        // Enable input
        const input = document.getElementById('chat-reply-input');
        const btn = document.getElementById('chat-reply-btn');
        if (input) { input.disabled = false; input.placeholder = 'Type your reply...'; }
        if (btn) btn.disabled = false;
        
        this.currentChat = { type: 'live', id };
    },
    
    // Send a message
    sendMessage(text) {
        if (!this.currentChat || !text.trim()) return;
        
        const { type, id } = this.currentChat;
        const chat = type === 'live' 
            ? DemoData.liveChats.find(c => c.id === id)
            : DemoData.messages.find(m => m.id === id);
        
        if (!chat) return;
        
        chat.messages.push({ from: 'admin', text: text.trim(), time: 'Just now' });
        
        if (type === 'live') {
            this.openLiveChat(id);
        } else {
            this.openMessage(id);
        }
        
        showToast('✅', 'Message sent');
    },
    
    // Update unread badge
    updateUnreadCount() {
        const unread = DemoData.messages.filter(m => m.unread).length;
        const badge = document.getElementById('nav-unread');
        const inboxBadge = document.getElementById('unread-badge');
        
        if (badge) badge.textContent = unread;
        if (inboxBadge) inboxBadge.textContent = `${unread} unread`;
    },
    
    // Bind reply inputs
    bindReplyInputs() {
        // Message reply
        const msgInput = document.getElementById('message-reply-input');
        const msgBtn = document.getElementById('message-reply-btn');
        
        if (msgBtn) {
            msgBtn.addEventListener('click', () => {
                if (msgInput?.value) {
                    this.sendMessage(msgInput.value);
                    msgInput.value = '';
                }
            });
        }
        
        if (msgInput) {
            msgInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage(msgInput.value);
                    msgInput.value = '';
                }
            });
        }
        
        // Live chat reply
        const chatInput = document.getElementById('chat-reply-input');
        const chatBtn = document.getElementById('chat-reply-btn');
        
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                if (chatInput?.value) {
                    this.sendMessage(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
    },
    
    init() {
        this.renderMessagesList();
        this.renderChatsList();
        this.renderDashboardPreviews();
        this.updateUnreadCount();
        this.bindReplyInputs();
    }
};

window.ChatManager = ChatManager;

// =============================================================================
// PASSWORD TOGGLE
// =============================================================================
function togglePassword(id) {
    const input = document.getElementById(id);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

window.togglePassword = togglePassword;

// =============================================================================
// INIT
// =============================================================================
function init() {
    console.log('🚀 Admin Dashboard v1.0 initializing...');
    
    initNavigation();
    ChatManager.init();
    
    // Logout
    document.querySelectorAll('.logout-btn, #admin-logout-btn').forEach(btn => {
        btn.addEventListener('click', () => { if (confirm('Logout?')) Auth.logout(); });
    });
    
    // Update stats display
    const statsEls = {
        users: document.getElementById('stat-users'),
        checks: document.getElementById('stat-checks'),
        revenue: document.getElementById('stat-revenue'),
        ai: document.getElementById('stat-ai')
    };
    
    if (statsEls.users) statsEls.users.textContent = DemoData.stats.users;
    if (statsEls.checks) statsEls.checks.textContent = DemoData.stats.checksToday.toLocaleString();
    if (statsEls.revenue) statsEls.revenue.textContent = `$${DemoData.stats.revenue.toLocaleString()}`;
    if (statsEls.ai) statsEls.ai.textContent = DemoData.stats.aiQueries;
    
    console.log('✅ Admin Dashboard ready');
}

// Run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
