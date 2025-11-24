/* =============================================================================
   SHADOW AI CHATBOT - v2.0 PREMIUM EDITION
   ShadowBanCheck.io - Premium Copilot Experience
   ============================================================================= */

(function() {
'use strict';

// ============================================
// CONFIGURATION
// ============================================
const ShadowAI = {
    name: 'Shadow AI',
    version: '2.0.0',
    welcomeMessage: `<strong>Welcome to ShadowBanCheck.io!</strong><br><br>
I'm Shadow AI, your shadow ban detection assistant. I can help you:

<ul>
<li>Check if you're shadow banned</li>
<li>Analyze engagement drops</li>
<li>Get recovery strategies</li>
<li>Understand platform algorithms</li>
</ul>

<strong>Free users:</strong> 3 questions per day<br>
<a href="#shadow-ai-pro" onclick="closeShadowAI();">Upgrade to Pro for 100 questions/day →</a>`,
    
    offlineMessage: `<strong>Welcome to ShadowBanCheck.io!</strong><br><br>
I'm Shadow AI, your shadow ban detection assistant.<br><br>
<em style="color: var(--warning);">⚠️ AI services are currently connecting. I'll be fully operational shortly!</em><br><br>
In the meantime, try our <a href="checker.html">free shadow ban checker</a> or explore our <a href="#pricing">pricing plans</a>.`
};

// Service status tracking
let serviceStatus = {
    online: false
};

// Chat state
let conversationHistory = [];
let isTyping = false;
let scrollTimeout = null;
let tooltipVisible = true;

// ============================================
// COOKIE CONSENT INTEGRATION
// ============================================
function checkCookieConsent() {
    const consent = localStorage.getItem('shadowban_cookie_consent');
    return consent !== null;
}

function showChatbotButton() {
    const container = document.querySelector('.shadow-ai-container');
    if (container) {
        container.classList.add('ready');
        console.log('✅ Shadow AI button shown');
        initializeTooltipScrollHandler();
    }
}

// Hook into existing cookie popup
function hookCookieConsent() {
    // Check if already consented
    if (checkCookieConsent()) {
        showChatbotButton();
        return;
    }
    
    // Watch for cookie popup dismissal
    const cookieAccept = document.getElementById('cookie-accept');
    const cookieDismiss = document.getElementById('cookie-dismiss');
    
    if (cookieAccept) {
        cookieAccept.addEventListener('click', () => {
            localStorage.setItem('shadowban_cookie_consent', 'accepted');
            setTimeout(showChatbotButton, 400);
        });
    }
    
    if (cookieDismiss) {
        cookieDismiss.addEventListener('click', () => {
            localStorage.setItem('shadowban_cookie_consent', 'declined');
            setTimeout(showChatbotButton, 400);
        });
    }
    
    // Fallback: show after delay if no cookie popup
    setTimeout(() => {
        const container = document.querySelector('.shadow-ai-container');
        if (container && !container.classList.contains('ready')) {
            console.log('🔄 No cookie popup detected - showing chatbot');
            showChatbotButton();
        }
    }, 2000);
}

// ============================================
// TOOLTIP SCROLL HANDLER
// ============================================
function initializeTooltipScrollHandler() {
    const tooltip = document.querySelector('.shadow-ai-tooltip');
    if (!tooltip) return;
    
    let scrollTimer = null;
    tooltipVisible = true;
    
    const handleScroll = () => {
        // Hide tooltip when scrolling
        if (tooltipVisible) {
            tooltip.classList.add('scrolled');
            tooltipVisible = false;
        }
        
        // Clear existing timer
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }
        
        // Show tooltip again after scrolling stops (1.5s delay)
        scrollTimer = setTimeout(() => {
            const container = document.querySelector('.shadow-ai-container');
            // Only show if chat is not active
            if (container && !container.classList.contains('chatbot-active')) {
                tooltip.classList.remove('scrolled');
                tooltipVisible = true;
            }
        }, 1500);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    console.log('✅ Tooltip scroll handler initialized');
}

function showTooltipAfterClose() {
    const tooltip = document.querySelector('.shadow-ai-tooltip');
    if (tooltip) {
        // Small delay before showing tooltip
        setTimeout(() => {
            tooltip.classList.remove('scrolled');
            tooltipVisible = true;
        }, 300);
    }
}

// ============================================
// CHATBOT TOGGLE
// ============================================
function toggleChatbot() {
    const chatWindow = document.getElementById('shadow-ai-chat');
    const container = document.querySelector('.shadow-ai-container');
    
    if (!chatWindow || !container) return;
    
    const isActive = chatWindow.classList.contains('active');
    
    if (isActive) {
        closeShadowAI();
    } else {
        openShadowAI();
    }
}

function openShadowAI() {
    const chatWindow = document.getElementById('shadow-ai-chat');
    const container = document.querySelector('.shadow-ai-container');
    const messagesContainer = document.getElementById('shadow-ai-messages');
    
    if (!chatWindow || !container) return;
    
    // Remove hidden class if present (for initial state)
    chatWindow.classList.remove('hidden');
    
    // Add active states
    chatWindow.classList.add('active');
    container.classList.add('chatbot-active');
    
    // Show welcome message if first time
    if (messagesContainer && messagesContainer.children.length === 0) {
        showWelcomeMessage();
    }
    
    console.log('✅ Shadow AI opened');
}

function closeShadowAI() {
    const chatWindow = document.getElementById('shadow-ai-chat');
    const container = document.querySelector('.shadow-ai-container');
    const input = document.getElementById('shadow-ai-input');
    
    if (!chatWindow || !container) return;
    
    // Remove active states
    chatWindow.classList.remove('active');
    chatWindow.classList.remove('keyboard-visible');
    container.classList.remove('chatbot-active');
    
    // Blur input to close keyboard
    if (input) {
        input.blur();
    }
    
    // Show tooltip again
    showTooltipAfterClose();
    
    console.log('✅ Shadow AI closed');
}

// Global close function for onclick handlers
window.closeShadowAI = closeShadowAI;

// ============================================
// STATUS UPDATE
// ============================================
function updateStatus() {
    const statusElement = document.querySelector('.copilot-status');
    if (!statusElement) return;
    
    const isOnline = serviceStatus.online;
    const dotClass = isOnline ? 'copilot-status-dot online' : 'copilot-status-dot';
    const statusText = isOnline ? 'Online' : 'Connecting...';
    
    statusElement.innerHTML = `<span class="${dotClass}"></span>${statusText}`;
}

// ============================================
// WELCOME MESSAGE WITH TYPING EFFECT
// ============================================
async function showWelcomeMessage() {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return;
    
    // Show typing indicator first
    showTypingIndicator();
    
    // Wait for typing effect
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Determine message based on service status
    const message = serviceStatus.online ? ShadowAI.welcomeMessage : ShadowAI.offlineMessage;
    
    // Stream the welcome message
    await streamMessage(message);
}

// ============================================
// MESSAGE FUNCTIONS
// ============================================
function addUserMessage(content) {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">${escapeHtml(content)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

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
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Stream message with typing effect
async function streamMessage(fullText) {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return;
    
    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message assistant-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    
    messageContent.appendChild(avatar);
    messageContent.appendChild(textDiv);
    messageDiv.appendChild(messageContent);
    
    // Append container BEFORE streaming
    messagesContainer.appendChild(messageDiv);
    
    // Check if content is HTML (has tags)
    const isHTML = /<[^>]+>/.test(fullText);
    
    if (isHTML) {
        // For HTML content, display progressively by chunks
        const chunks = fullText.split(/(<[^>]+>)/);
        let currentHTML = '';
        
        for (let i = 0; i < chunks.length; i++) {
            currentHTML += chunks[i];
            textDiv.innerHTML = currentHTML + '<span class="streaming-cursor"></span>';
            scrollToBottom();
            
            // Faster for tags, slower for text
            const delay = chunks[i].startsWith('<') ? 10 : 30;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    } else {
        // For plain text, stream word by word
        const words = fullText.split(' ');
        let currentText = '';
        const batchSize = 3;
        
        for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? ' ' : '') + words[i];
            
            if (i % batchSize === 0 || i === words.length - 1) {
                textDiv.innerHTML = escapeHtml(currentText) + '<span class="streaming-cursor"></span>';
                scrollToBottom();
                await new Promise(resolve => setTimeout(resolve, 40));
            }
        }
    }
    
    // Remove cursor and finalize
    textDiv.innerHTML = isHTML ? fullText : formatMessage(fullText);
    scrollToBottom();
}

function addAssistantMessage(content) {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message assistant-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-avatar">🤖</div>
            <div class="message-text">${formatMessage(content)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (messagesContainer) {
        requestAnimationFrame(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    }
}

// ============================================
// MESSAGE FORMATTING
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatMessage(text) {
    let formatted = escapeHtml(text);
    // Bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}

// ============================================
// SEND MESSAGE
// ============================================
async function sendMessage() {
    const input = document.getElementById('shadow-ai-input');
    const sendBtn = document.getElementById('shadow-ai-send');
    
    if (!input || !sendBtn) return;
    
    const message = input.value.trim();
    
    // Blink if empty
    if (!message) {
        input.classList.add('blink-empty');
        setTimeout(() => {
            input.classList.remove('blink-empty');
        }, 1200);
        return;
    }
    
    if (isTyping) return;
    
    // Add user message
    addUserMessage(message);
    input.value = '';
    
    // Disable inputs
    input.disabled = true;
    sendBtn.disabled = true;
    isTyping = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get AI response
        const reply = await getAIResponse(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Store in history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: reply }
        );
        
        // Stream the response
        await streamMessage(reply);
        
    } catch (error) {
        console.error('Shadow AI Error:', error);
        removeTypingIndicator();
        addAssistantMessage('❌ Sorry, I encountered an error. Please try again.');
    } finally {
        input.disabled = false;
        sendBtn.disabled = false;
        isTyping = false;
        input.focus();
    }
}

// ============================================
// AI RESPONSE (Simulated - replace with actual API)
// ============================================
async function getAIResponse(question) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const lowerQuestion = question.toLowerCase();
    
    // Check for common questions
    if (lowerQuestion.includes('shadow ban') && lowerQuestion.includes('what')) {
        serviceStatus.online = true;
        updateStatus();
        return `A **shadow ban** (also called stealth ban or ghost ban) is when a platform limits your content's visibility without telling you.

Your posts appear normal to you, but they may not show up in:
• Search results
• Hashtag feeds  
• Recommendations
• Other users' feeds

Want me to check if you're shadow banned? Share your username or post URL!`;
    }
    
    if (lowerQuestion.includes('check') || lowerQuestion.includes('am i')) {
        serviceStatus.online = true;
        updateStatus();
        return `To check if you're shadow banned, I'll need:

1. **Your username** on the platform
2. **The platform** (Twitter, Instagram, TikTok, etc.)

Or you can paste a **post URL** and I'll analyze its visibility.

💡 **Pro tip:** <a href="#shadow-ai-pro" onclick="closeShadowAI();">Shadow AI Pro users</a> get 100 checks per day with detailed probability scores!`;
    }
    
    if (lowerQuestion.includes('price') || lowerQuestion.includes('cost') || lowerQuestion.includes('plan')) {
        serviceStatus.online = true;
        updateStatus();
        return `Our plans are designed for different needs:

**Starter** - $4.99/mo
• 5 accounts monitored
• 3 AI questions/day

**Pro** - $9.99/mo ⭐ Most Popular
• 15 accounts monitored
• 10 AI questions/day

**Premium** - $14.99/mo
• 50 accounts monitored
• 25 AI questions/day

All plans include hashtag checker and recovery recommendations!

<a href="#pricing" onclick="closeShadowAI();">View full pricing →</a>`;
    }
    
    if (lowerQuestion.includes('fix') || lowerQuestion.includes('recover') || lowerQuestion.includes('help')) {
        serviceStatus.online = true;
        updateStatus();
        return `Here are general recovery steps for shadow bans:

1. **Stop posting** for 24-48 hours
2. **Remove** recently used hashtags
3. **Disconnect** third-party apps
4. **Check** for community guideline violations
5. **Report** the issue to platform support

Want personalized recovery strategies? <a href="#shadow-ai-pro" onclick="closeShadowAI();">Shadow AI Pro</a> provides custom recovery plans based on your specific situation!`;
    }
    
    // Default response
    serviceStatus.online = true;
    updateStatus();
    return `Thanks for your question! I can help with:

• **Shadow ban detection** - Check if you're being suppressed
• **Platform analysis** - 26 platforms supported
• **Recovery strategies** - Get back your reach
• **Hashtag verification** - Avoid banned hashtags

What would you like to know more about?

💡 Get unlimited help with <a href="#shadow-ai-pro" onclick="closeShadowAI();">Shadow AI Pro →</a>`;
}

// ============================================
// KEYBOARD HANDLER (Mobile Landscape)
// ============================================
function initializeKeyboardHandler() {
    const input = document.getElementById('shadow-ai-input');
    const chatWindow = document.getElementById('shadow-ai-chat');
    
    if (!input || !chatWindow) return;
    
    // Detect keyboard on mobile landscape
    input.addEventListener('focus', () => {
        if (window.innerWidth <= 926 && window.innerHeight <= 500 && window.matchMedia('(orientation: landscape)').matches) {
            chatWindow.classList.add('keyboard-visible');
            console.log('📱 Keyboard visible (landscape)');
        }
    });
    
    input.addEventListener('blur', () => {
        setTimeout(() => {
            chatWindow.classList.remove('keyboard-visible');
            console.log('📱 Keyboard hidden');
        }, 100);
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            chatWindow.classList.remove('keyboard-visible');
            if (document.activeElement === input) {
                input.blur();
            }
        }, 300);
    });
    
    console.log('✅ Keyboard handler initialized');
}

// ============================================
// SCROLL ISOLATION (Prevent page scroll when in chat)
// ============================================
function initializeScrollIsolation() {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return;
    
    messagesContainer.addEventListener('wheel', (e) => {
        const isScrollable = messagesContainer.scrollHeight > messagesContainer.clientHeight;
        
        if (!isScrollable) {
            e.preventDefault();
            return;
        }
        
        const scrollTop = messagesContainer.scrollTop;
        const scrollHeight = messagesContainer.scrollHeight;
        const clientHeight = messagesContainer.clientHeight;
        const delta = e.deltaY;
        
        if ((delta < 0 && scrollTop <= 0) || (delta > 0 && scrollTop + clientHeight >= scrollHeight)) {
            e.preventDefault();
        }
    }, { passive: false });
    
    messagesContainer.addEventListener('touchmove', (e) => {
        e.stopPropagation();
    }, { passive: true });
    
    console.log('✅ Scroll isolation initialized');
}

// ============================================
// INITIALIZATION
// ============================================
function initializeShadowAI() {
    console.log('🤖 Shadow AI v2.0 Initializing...');
    
    // Get elements
    const btn = document.getElementById('shadow-ai-btn');
    const closeBtn = document.getElementById('shadow-ai-close');
    const sendBtn = document.getElementById('shadow-ai-send');
    const input = document.getElementById('shadow-ai-input');
    
    // Button click - toggle chat
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleChatbot();
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleChatbot();
        }, { passive: false });
    }
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeShadowAI();
        });
        
        closeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeShadowAI();
        }, { passive: false });
    }
    
    // Send button
    if (sendBtn) {
        sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendMessage();
        });
        
        sendBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sendMessage();
        }, { passive: false });
    }
    
    // Input enter key
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Initialize handlers
    initializeKeyboardHandler();
    initializeScrollIsolation();
    
    // Hook into cookie consent
    hookCookieConsent();
    
    // Update status
    updateStatus();
    
    // Also hook "Open Shadow AI" button in contact section
    const openShadowAIBtn = document.getElementById('open-shadow-ai');
    if (openShadowAIBtn) {
        openShadowAIBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openShadowAI();
        });
    }
    
    // Hook "Try Free" button in spotlight section
    const tryAIBtn = document.getElementById('try-ai-btn');
    if (tryAIBtn) {
        tryAIBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openShadowAI();
        });
    }
    
    console.log('✅ Shadow AI v2.0 Ready');
}

// ============================================
// DOM READY
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShadowAI);
} else {
    initializeShadowAI();
}

// Export for global access
window.ShadowAI = {
    open: openShadowAI,
    close: closeShadowAI,
    toggle: toggleChatbot,
    sendMessage: sendMessage
};

})();
