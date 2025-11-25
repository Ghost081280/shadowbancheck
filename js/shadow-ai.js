/* =============================================================================
   SHADOW AI CHATBOT - Website Version v2.1
   ShadowBanCheck.io - Premium Copilot Experience
   
   INCLUDES:
   - Floating chat button & widget
   - Demo chat animation (spotlight section)
   ============================================================================= */

/* =============================================================================
   SERVICE STATUS - Default to Online
   ============================================================================= */
const serviceStatus = {
    online: true,
    message: ''
};

/* =============================================================================
   UPDATE STATUS DISPLAY
   ============================================================================= */
function updateStatus(online = true) {
    serviceStatus.online = online;
    const statusDot = document.querySelector('.copilot-status-dot');
    const statusText = document.querySelector('.copilot-status-text');
    
    if (statusDot) {
        if (online) {
            statusDot.classList.add('online');
        } else {
            statusDot.classList.remove('online');
        }
    }
    
    if (statusText) {
        statusText.textContent = online ? 'Online' : 'Offline';
    }
}

/* =============================================================================
   INITIALIZE SHADOW AI CHATBOT
   ============================================================================= */
function initShadowAI() {
    // Load the widget HTML
    loadChatWidget();
    
    // Initialize tooltip scroll behavior
    initTooltipScroll();
    
    // Initialize demo chat animation
    initDemoChatAnimation();
}

/* =============================================================================
   LOAD CHAT WIDGET
   ============================================================================= */
async function loadChatWidget() {
    const container = document.querySelector('.shadow-ai-container');
    if (!container) return;
    
    try {
        // Try to load widget HTML
        const response = await fetch('shared/shadow-ai-widget.html');
        if (response.ok) {
            const widgetHTML = await response.text();
            
            // Insert widget HTML after the button
            const btn = container.querySelector('.copilot-btn');
            if (btn) {
                btn.insertAdjacentHTML('afterend', widgetHTML);
            }
        }
    } catch (e) {
        console.log('Widget HTML not found, using inline fallback');
    }
    
    // Initialize chat functionality
    initChatFunctionality();
    
    // Show container after small delay
    setTimeout(() => {
        container.classList.add('ready');
    }, 500);
}

/* =============================================================================
   INITIALIZE CHAT FUNCTIONALITY
   ============================================================================= */
function initChatFunctionality() {
    const container = document.querySelector('.shadow-ai-container');
    const btn = container?.querySelector('.copilot-btn');
    const chat = document.querySelector('.copilot-chat');
    const closeBtn = document.querySelector('.copilot-close');
    const input = document.querySelector('.copilot-input-area input');
    const sendBtn = document.querySelector('.copilot-send');
    const messagesContainer = document.querySelector('.copilot-messages');
    
    if (!btn || !chat) return;
    
    let isOpen = false;
    let conversationHistory = [];
    let hasShownWelcome = false;
    
    // Toggle chat
    function toggleChat() {
        isOpen = !isOpen;
        chat.classList.toggle('active', isOpen);
        container.classList.toggle('chatbot-active', isOpen);
        
        if (isOpen) {
            if (!hasShownWelcome) {
                showWelcomeMessage();
                hasShownWelcome = true;
            }
            setTimeout(() => input?.focus(), 300);
        }
    }
    
    // Close chat
    function closeChat() {
        isOpen = false;
        chat.classList.remove('active');
        container.classList.remove('chatbot-active');
    }
    
    // Button click
    btn.addEventListener('click', toggleChat);
    
    // Close button
    closeBtn?.addEventListener('click', closeChat);
    
    // Send message
    function sendMessage() {
        const message = input?.value?.trim();
        if (!message) {
            input?.classList.add('blink-empty');
            setTimeout(() => input?.classList.remove('blink-empty'), 1200);
            return;
        }
        
        // Add user message
        addMessage(message, 'user');
        input.value = '';
        
        // Add to history
        conversationHistory.push({ role: 'user', content: message });
        
        // Show typing indicator
        showTypingIndicator();
        
        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            hideTypingIndicator();
            const response = generateResponse(message);
            addMessage(response, 'assistant');
            conversationHistory.push({ role: 'assistant', content: response });
        }, 1000 + Math.random() * 1000);
    }
    
    // Send button click
    sendBtn?.addEventListener('click', sendMessage);
    
    // Enter key
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Welcome message - always use main message since we default to online
    function showWelcomeMessage() {
        const welcomeMsg = "👋 Hi! I'm Shadow AI, your personal shadow ban detective. I can help you understand shadow banning, check your accounts, and provide recovery strategies. What would you like to know?";
        
        setTimeout(() => {
            addMessage(welcomeMsg, 'assistant');
        }, 500);
    }
    
    // Add message to chat
    function addMessage(text, role) {
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}-message`;
        
        const avatar = role === 'assistant' ? '🤖' : '👤';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">${avatar}</div>
                <div class="message-text">${formatMessage(text)}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Format message (convert markdown-like syntax)
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }
    
    // Show typing indicator
    function showTypingIndicator() {
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
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typing = messagesContainer?.querySelector('.typing-indicator');
        typing?.remove();
    }
    
    // Generate response (demo - replace with actual AI)
    function generateResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('shadow ban') || lowerMsg.includes('shadowban')) {
            return "A shadow ban is when a platform secretly limits your content's visibility without notifying you. Your posts appear normal to you, but others can't see them in feeds, searches, or recommendations. Would you like me to check a specific platform for you?";
        }
        
        if (lowerMsg.includes('twitter') || lowerMsg.includes('x.com')) {
            return "For Twitter/X, I can check for: search suggestion bans, reply deboosting, ghost bans, and quality filter restrictions. Want me to analyze your account? Just share your username or a post URL!";
        }
        
        if (lowerMsg.includes('instagram')) {
            return "Instagram shadow bans typically affect hashtag visibility and Explore page reach. Common triggers include: banned hashtags, aggressive engagement, and rapid following/unfollowing. Would you like tips on how to check if you're affected?";
        }
        
        if (lowerMsg.includes('tiktok')) {
            return "TikTok shadow bans usually result in videos getting 0 views on the For You Page. This can be caused by: community guideline violations, copyrighted content, or spam-like behavior. Shall I explain how to detect and recover from a TikTok shadow ban?";
        }
        
        if (lowerMsg.includes('reddit')) {
            return "Reddit shadow bans make your posts and comments invisible to everyone except you. I can check if your Reddit account is shadowbanned. Just share your username and I'll analyze your visibility!";
        }
        
        if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('subscription')) {
            return "Our Shadow AI Pro subscription is **$4.99/month** and includes:\n\n• 100 AI questions per day\n• Live platform checks\n• Recovery strategies\n• Priority support\n\nWe also offer a **7-day free trial**! Check out our pricing section for more details.";
        }
        
        if (lowerMsg.includes('help') || lowerMsg.includes('what can you do')) {
            return "I can help you with:\n\n• **Checking** if you're shadow banned\n• **Explaining** how shadow bans work\n• **Recovery** strategies for each platform\n• **Prevention** tips to avoid future bans\n\nWhich platform are you concerned about?";
        }
        
        return "I'd be happy to help with that! I specialize in shadow ban detection and recovery across 26+ platforms including Twitter/X, Instagram, TikTok, Reddit, and more. What specific platform or issue would you like to discuss?";
    }
    
    // Set status to online by default
    updateStatus(true);
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeChat();
        }
    });
    
    // Prevent body scroll when chat is open on mobile
    chat.addEventListener('touchmove', (e) => {
        e.stopPropagation();
    }, { passive: true });
    
    // Handle keyboard on mobile
    if (input) {
        input.addEventListener('focus', () => {
            setTimeout(() => {
                chat.classList.add('keyboard-visible');
            }, 300);
        });
        
        input.addEventListener('blur', () => {
            chat.classList.remove('keyboard-visible');
        });
    }
}

/* =============================================================================
   TOOLTIP SCROLL BEHAVIOR
   ============================================================================= */
function initTooltipScroll() {
    const tooltip = document.querySelector('.shadow-ai-tooltip');
    if (!tooltip) return;
    
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
        tooltip.classList.add('scrolled');
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            tooltip.classList.remove('scrolled');
        }, 2000);
    }, { passive: true });
}

/* =============================================================================
   DEMO CHAT ANIMATION - TYPEWRITER EFFECT (Spotlight Section)
   ============================================================================= */
function initDemoChatAnimation() {
    const demoChat = document.getElementById('demo-chat-messages');
    if (!demoChat) return;
    
    let hasPlayed = false;
    
    const chatSequence = [
        { 
            type: 'ai', 
            text: "👋 Hi! I'm Shadow AI, your personal shadow ban detective.",
            delay: 500
        },
        { 
            type: 'ai', 
            text: "I can check if you're being suppressed on Twitter/X, Reddit, Instagram, TikTok, and 22+ other platforms.",
            delay: 1500
        },
        { 
            type: 'ai', 
            text: "I analyze engagement patterns, visibility signals, and platform-specific indicators to give you a probability score.",
            delay: 1500
        },
        { 
            type: 'ai', 
            text: "Would you like to learn more about our Pro subscription? 🚀",
            delay: 1500
        },
        { 
            type: 'user', 
            text: "Yes, tell me more!",
            delay: 2000,
            clickable: true
        },
        { 
            type: 'ai', 
            text: "Great choice! With Shadow AI Pro you get:",
            delay: 1000
        },
        { 
            type: 'ai', 
            text: "✓ 100 AI questions/day\n✓ Live platform checks\n✓ Recovery strategies\n✓ 24/7 availability",
            delay: 1200
        },
        { 
            type: 'ai', 
            text: '👉 <a href="#pricing">View pricing plans</a> to get started with a 7-day free trial!',
            delay: 1500
        }
    ];
    
    let currentIndex = 0;
    let isAnimating = false;
    
    function showTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'demo-typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        demoChat.appendChild(typing);
        demoChat.scrollTop = demoChat.scrollHeight;
        return typing;
    }
    
    function addMessage(message) {
        const msgEl = document.createElement('div');
        msgEl.className = `demo-msg ${message.type}`;
        
        if (message.type === 'ai') {
            // For AI messages, use innerHTML to support links and formatting
            msgEl.innerHTML = message.text.replace(/\n/g, '<br>');
        } else {
            msgEl.textContent = message.text;
        }
        
        if (message.clickable) {
            msgEl.style.cursor = 'pointer';
            msgEl.title = 'Click to continue';
        }
        
        demoChat.appendChild(msgEl);
        demoChat.scrollTop = demoChat.scrollHeight;
        
        return msgEl;
    }
    
    function playNextMessage() {
        if (currentIndex >= chatSequence.length) {
            isAnimating = false;
            return;
        }
        
        const message = chatSequence[currentIndex];
        currentIndex++;
        
        if (message.type === 'ai') {
            // Show typing indicator for AI messages
            const typing = showTypingIndicator();
            
            setTimeout(() => {
                typing.remove();
                addMessage(message);
                
                setTimeout(playNextMessage, message.delay || 1000);
            }, 800 + Math.random() * 400);
        } else {
            // User messages appear after a delay
            setTimeout(() => {
                addMessage(message);
                setTimeout(playNextMessage, message.delay || 1000);
            }, message.delay || 1000);
        }
    }
    
    function startAnimation() {
        if (hasPlayed || isAnimating) return;
        
        hasPlayed = true;
        isAnimating = true;
        demoChat.innerHTML = '';
        currentIndex = 0;
        
        setTimeout(playNextMessage, 500);
    }
    
    // Start animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasPlayed) {
                startAnimation();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(demoChat);
}

/* =============================================================================
   HANDLE EXTERNAL TRIGGERS (buttons that open Shadow AI)
   ============================================================================= */
function initExternalTriggers() {
    // Try AI button in spotlight section
    const tryAiBtn = document.getElementById('try-ai-btn');
    tryAiBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        const btn = document.querySelector('.copilot-btn');
        btn?.click();
    });
    
    // Open Shadow AI button
    const openBtn = document.getElementById('open-shadow-ai');
    openBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        const btn = document.querySelector('.copilot-btn');
        btn?.click();
    });
}

/* =============================================================================
   INITIALIZE ON DOM READY
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    initShadowAI();
    initExternalTriggers();
    console.log('✅ Shadow AI Chatbot v2.1 initialized');
});
