/* =============================================================================
   SHADOW AI ADMIN - Unlimited Version v3.0
   ShadowBanCheck.io - Admin Dashboard AI Assistant
   
   IDENTICAL to regular Shadow AI Pro, just with NO daily limits.
   Uses same CSS classes from shadow-ai.css
   ============================================================================= */

(function() {
'use strict';

// ============================================
// CONFIGURATION - Admin version, unlimited
// ============================================
const CONFIG = {
    title: 'Shadow AI Admin',
    tooltip: 'Ask Shadow AI Admin',
    storageKey: 'shadow_ai_admin_usage',
    welcomeMessage: "👋 Welcome Andrew! I'm your Shadow AI Admin assistant. What can I help you look up today?"
};

// State
let conversationHistory = [];
let isTyping = false;

// ============================================
// UNLIMITED ACCESS - No limits for admin
// ============================================
function canAskQuestion() {
    return true; // Always allowed
}

function getRemainingDisplay() {
    return '∞ Unlimited';
}

// ============================================
// INITIALIZE
// ============================================
function init() {
    console.log('🤖 Shadow AI Admin v3.0 Initializing...');
    
    // Add dashboard-page class to body for CSS targeting
    document.body.classList.add('dashboard-page');
    
    createWidget();
    bindEvents();
    initKeyboardHandler();
    initScrollIsolation();
    
    console.log('✅ Shadow AI Admin initialized - Unlimited Access');
}

// ============================================
// CREATE WIDGET - Same structure as regular version
// ============================================
function createWidget() {
    // Check if widget already exists
    if (document.querySelector('.shadow-ai-container')) {
        console.log('Widget already exists, skipping');
        return;
    }
    
    const widget = document.createElement('div');
    widget.className = 'shadow-ai-container';
    widget.id = 'shadow-ai-container';
    
    widget.innerHTML = `
        <!-- Glow Effect -->
        <div class="shadow-ai-glow"></div>
        
        <!-- Tooltip -->
        <div class="shadow-ai-tooltip">${CONFIG.tooltip}</div>
        
        <!-- Floating Button -->
        <button class="copilot-btn" id="shadow-ai-btn" aria-label="Open Shadow AI Admin">
            <span class="copilot-emoji">🤖</span>
        </button>
        
        <!-- Chat Window -->
        <div class="copilot-chat hidden" id="shadow-ai-chat">
            <!-- Header -->
            <div class="copilot-header">
                <div class="copilot-header-left">
                    <span class="copilot-header-emoji">🤖</span>
                    <div class="copilot-header-text">
                        <h3>${CONFIG.title}</h3>
                        <p class="copilot-usage" id="shadow-ai-usage">${getRemainingDisplay()}</p>
                    </div>
                </div>
                <div class="copilot-header-right">
                    <span class="copilot-status">
                        <span class="copilot-status-dot online"></span>
                        Online
                    </span>
                    <button class="copilot-close" id="shadow-ai-close" aria-label="Close chat">×</button>
                </div>
            </div>
            
            <!-- Messages -->
            <div class="copilot-messages" id="shadow-ai-messages">
                <!-- Messages injected here -->
            </div>
            
            <!-- Input -->
            <div class="copilot-input-area">
                <input type="text" 
                       id="shadow-ai-input" 
                       placeholder="Ask about shadow bans..." 
                       autocomplete="off"
                       enterkeyhint="send">
                <button class="copilot-send" id="shadow-ai-send">Send</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(widget);
    
    // Show widget after small delay
    setTimeout(() => {
        widget.classList.add('ready');
    }, 500);
    
    // Show welcome message
    setTimeout(() => {
        addMessage(CONFIG.welcomeMessage, 'assistant');
    }, 800);
}

// ============================================
// EVENT BINDING
// ============================================
function bindEvents() {
    // Toggle button
    document.getElementById('shadow-ai-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleChat();
    });
    
    // Close button
    document.getElementById('shadow-ai-close')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeChat();
    });
    
    // Send button
    document.getElementById('shadow-ai-send')?.addEventListener('click', (e) => {
        e.preventDefault();
        sendMessage();
    });
    
    // Enter key
    document.getElementById('shadow-ai-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        const container = document.getElementById('shadow-ai-container');
        const chat = document.getElementById('shadow-ai-chat');
        if (container && chat && !chat.classList.contains('hidden')) {
            if (!container.contains(e.target)) {
                closeChat();
            }
        }
    });
    
    // Scroll-based tooltip hiding
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        const tooltip = document.querySelector('.shadow-ai-tooltip');
        if (tooltip) {
            tooltip.classList.add('scrolled');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                tooltip.classList.remove('scrolled');
            }, 1500);
        }
    }, { passive: true });
}

// ============================================
// CHAT TOGGLE
// ============================================
function toggleChat() {
    const chat = document.getElementById('shadow-ai-chat');
    if (chat?.classList.contains('hidden')) {
        openChat();
    } else {
        closeChat();
    }
}

function openChat() {
    const chat = document.getElementById('shadow-ai-chat');
    const container = document.getElementById('shadow-ai-container');
    const input = document.getElementById('shadow-ai-input');
    
    if (chat) {
        chat.classList.remove('hidden');
        chat.classList.add('active');
    }
    if (container) {
        container.classList.add('chat-active');
    }
    
    // Focus input after animation
    setTimeout(() => {
        input?.focus();
    }, 300);
}

function closeChat() {
    const chat = document.getElementById('shadow-ai-chat');
    const container = document.getElementById('shadow-ai-container');
    const input = document.getElementById('shadow-ai-input');
    
    if (chat) {
        chat.classList.remove('active');
        chat.classList.add('hidden');
        chat.classList.remove('keyboard-visible');
    }
    if (container) {
        container.classList.remove('chat-active');
    }
    
    // Blur input to close keyboard
    input?.blur();
}

// ============================================
// SEND MESSAGE
// ============================================
function sendMessage() {
    const input = document.getElementById('shadow-ai-input');
    const message = input?.value?.trim();
    
    if (!message) {
        input?.classList.add('blink-empty');
        setTimeout(() => input?.classList.remove('blink-empty'), 1200);
        return;
    }
    
    if (isTyping) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Add to history
    conversationHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    showTypingIndicator();
    isTyping = true;
    
    // Disable input while processing
    input.disabled = true;
    document.getElementById('shadow-ai-send').disabled = true;
    
    // Generate response (replace with actual API call)
    setTimeout(() => {
        hideTypingIndicator();
        isTyping = false;
        
        const response = generateResponse(message);
        addMessage(response, 'assistant');
        conversationHistory.push({ role: 'assistant', content: response });
        
        input.disabled = false;
        document.getElementById('shadow-ai-send').disabled = false;
        input.focus();
    }, 800 + Math.random() * 800);
}

// ============================================
// MESSAGE HANDLING
// ============================================
function addMessage(text, role) {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}-message`;
    
    if (role === 'assistant') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">🤖</div>
                <div class="message-text">${formatMessage(text)}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${escapeHtml(text)}</div>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// TYPING INDICATOR
// ============================================
function showTypingIndicator() {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="message-avatar">🤖</div>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
}

// ============================================
// KEYBOARD HANDLER (for mobile landscape)
// ============================================
function initKeyboardHandler() {
    const input = document.getElementById('shadow-ai-input');
    const chat = document.getElementById('shadow-ai-chat');
    
    if (!input || !chat) return;
    
    // Detect keyboard on mobile landscape
    input.addEventListener('focus', () => {
        if (window.innerWidth <= 926 && window.innerHeight <= 500 && 
            window.matchMedia('(orientation: landscape)').matches) {
            chat.classList.add('keyboard-visible');
        }
    });
    
    input.addEventListener('blur', () => {
        setTimeout(() => {
            chat.classList.remove('keyboard-visible');
        }, 100);
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            chat.classList.remove('keyboard-visible');
            if (document.activeElement === input) {
                input.blur();
            }
        }, 300);
    });
    
    // Handle resize
    let lastHeight = window.innerHeight;
    window.addEventListener('resize', () => {
        const isLandscape = window.matchMedia('(orientation: landscape)').matches;
        if (window.innerWidth <= 926 && window.innerHeight <= 500 && isLandscape) {
            if (lastHeight - window.innerHeight > 100 && document.activeElement === input) {
                chat.classList.add('keyboard-visible');
            } else if (window.innerHeight - lastHeight > 100) {
                chat.classList.remove('keyboard-visible');
            }
        } else {
            chat.classList.remove('keyboard-visible');
        }
        lastHeight = window.innerHeight;
    }, { passive: true });
}

// ============================================
// SCROLL ISOLATION
// ============================================
function initScrollIsolation() {
    const messages = document.getElementById('shadow-ai-messages');
    if (!messages) return;
    
    messages.addEventListener('wheel', (e) => {
        const { scrollTop, scrollHeight, clientHeight } = messages;
        const atTop = scrollTop === 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
        
        if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
            e.preventDefault();
        }
    }, { passive: false });
}

// ============================================
// RESPONSE GENERATOR (Replace with actual API)
// ============================================
function generateResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('shadow') && lowerMsg.includes('ban')) {
        return "Shadow banning is when a platform limits your content's visibility without notifying you. Your posts appear normal to you, but others can't see them in searches, feeds, or recommendations.\n\n**Common signs:**\n• Sudden engagement drop\n• Hashtags not working\n• Posts not appearing in Explore/For You\n\nWould you like me to check a specific platform for you?";
    }
    
    if (lowerMsg.includes('check') || lowerMsg.includes('test') || lowerMsg.includes('account')) {
        return "I can check your accounts across multiple platforms. To start, please tell me:\n\n1. Which platform (Twitter/X, Instagram, TikTok, etc.)?\n2. Your username or profile URL\n\nI'll analyze visibility factors and give you a detailed report.";
    }
    
    if (lowerMsg.includes('twitter') || lowerMsg.includes('x.com') || lowerMsg.includes(' x ')) {
        return "For **Twitter/X** shadow bans, I check:\n\n• Search suggestion ban\n• Search ban\n• Ghost ban (replies hidden)\n• Reply deboosting\n\nPaste your Twitter username and I'll analyze it!";
    }
    
    if (lowerMsg.includes('instagram') || lowerMsg.includes('ig')) {
        return "For **Instagram** shadow bans, I analyze:\n\n• Hashtag reach\n• Explore page visibility\n• Story views vs followers ratio\n• Engagement patterns\n\nWhat's your Instagram username?";
    }
    
    if (lowerMsg.includes('tiktok')) {
        return "For **TikTok** shadow bans, I check:\n\n• For You Page distribution\n• Video view patterns\n• Comment visibility\n• Sound restrictions\n\nWhat's your TikTok username?";
    }
    
    if (lowerMsg.includes('fix') || lowerMsg.includes('recover') || lowerMsg.includes('help')) {
        return "Here are general **recovery strategies**:\n\n1. **Take a break** - Stop posting for 24-48 hours\n2. **Review content** - Remove anything potentially violating guidelines\n3. **Avoid spam behavior** - Don't mass-like, follow, or use bots\n4. **Diversify hashtags** - Don't use the same ones repeatedly\n5. **Engage authentically** - Focus on genuine interactions\n\nWant platform-specific advice?";
    }
    
    if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
        return "Hello Andrew! 👋 I'm here to help you manage shadow ban issues for your users. What platform are you checking today?";
    }
    
    // Default response
    return "I'm here to help with shadow ban detection and recovery. Could you tell me more about your situation?\n\n**I can help with:**\n• Checking if users are shadow banned\n• Platform-specific analysis\n• Recovery strategies\n• Understanding algorithm changes\n\nWhat would you like to know?";
}

// ============================================
// EXPORT API for external use
// ============================================
window.ShadowAI = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    canAsk: canAskQuestion
};

// ============================================
// INIT ON DOM READY
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
