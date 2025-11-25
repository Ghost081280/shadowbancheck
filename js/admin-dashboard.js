/* =============================================================================
   ADMIN DASHBOARD - JavaScript
   ShadowBanCheck.io - Admin Panel Functionality
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
        unread: false,
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

// State
let currentChat = null;
let isOnline = localStorage.getItem('admin_online') !== 'false'; // Default to true

// Set initial online status in localStorage
localStorage.setItem('admin_online', isOnline ? 'true' : 'false');
localStorage.setItem('admin_last_seen', Date.now().toString());

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderMessages() {
    const container = document.getElementById('messages-list');
    if (!container) return;
    
    container.innerHTML = messages.map(msg => `
        <div class="message-item ${msg.unread ? 'unread' : ''}" data-id="${msg.id}">
            <div class="message-avatar">${msg.avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-name">${msg.name}</span>
                    <span class="message-time">${msg.time}</span>
                </div>
                <p class="message-preview">${msg.preview}</p>
                <div class="message-actions">
                    <button class="btn-reply" onclick="replyToMessage(${msg.id})">Reply</button>
                    <button class="btn-mark-read" onclick="markAsRead(${msg.id})">${msg.unread ? 'Mark Read' : 'Unread'}</button>
                    <button class="btn-delete" onclick="deleteMessage(${msg.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    updateUnreadBadge();
}

function renderChats() {
    const container = document.getElementById('chats-list');
    if (!container) return;
    
    container.innerHTML = activeChats.map(chat => `
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
    
    // Render messages
    const messagesHTML = chat.messages.map(msg => `
        <div class="chat-bubble ${msg.from}">
            ${msg.text}
            <div class="chat-bubble-time">${msg.time}</div>
        </div>
    `).join('');
    
    messagesContainer.innerHTML = messagesHTML;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

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
// ACTION FUNCTIONS
// ============================================
window.replyToMessage = function(id) {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    
    // Create a new chat or switch to existing
    const existingChat = activeChats.find(c => c.name === msg.name);
    
    if (existingChat) {
        selectChat(existingChat.id);
    } else {
        // Create new chat
        const newChat = {
            id: Date.now(),
            name: msg.name,
            avatar: msg.avatar,
            online: true,
            preview: msg.preview.substring(0, 30) + '...',
            unreadCount: 1,
            lastTime: 'now',
            messages: [
                { from: 'user', text: msg.fullMessage, time: 'just now' }
            ]
        };
        activeChats.unshift(newChat);
        renderChats();
        selectChat(newChat.id);
    }
    
    showToast('✅', 'Chat opened');
};

window.markAsRead = function(id) {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    
    msg.unread = !msg.unread;
    renderMessages();
    showToast('✅', msg.unread ? 'Marked as unread' : 'Marked as read');
};

window.deleteMessage = function(id) {
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return;
    
    messages.splice(index, 1);
    renderMessages();
    showToast('🗑️', 'Message deleted');
};

window.selectChat = function(id) {
    currentChat = id;
    
    // Clear unread count
    const chat = activeChats.find(c => c.id === id);
    if (chat) chat.unreadCount = 0;
    
    renderChats();
    renderChatWindow();
};

function sendAdminMessage() {
    const input = document.getElementById('admin-chat-input');
    if (!input || !currentChat) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    const chat = activeChats.find(c => c.id === currentChat);
    if (!chat) return;
    
    // Add message
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
}

// ============================================
// STATUS TOGGLE
// ============================================
function toggleStatus() {
    isOnline = !isOnline;
    
    // Save to localStorage so user dashboard can check
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
// NAVIGATION
// ============================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const section = link.dataset.section;
            showToast('📍', `Navigating to ${section}`);
        });
    });
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

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('🔧 Admin Dashboard Initializing...');
    
    // Render initial data
    renderMessages();
    renderChats();
    renderChatWindow();
    
    // Init navigation
    initNavigation();
    
    // Status toggle
    const toggleBtn = document.getElementById('toggle-status');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleStatus);
    }
    
    // Chat send button
    const sendBtn = document.getElementById('admin-send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendAdminMessage);
    }
    
    // Chat input enter key
    const chatInput = document.getElementById('admin-chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAdminMessage();
            }
        });
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
