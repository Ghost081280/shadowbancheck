/* =============================================================================
   SHADOW AI CHATBOT - Website Version v2.2
   ShadowBanCheck.io - Premium Copilot Experience
   
   CREATES WIDGET DYNAMICALLY (like dashboard version)
   INCLUDES:
   - Floating chat button with glow & tooltip
   - Chat widget
   - Demo chat animation (spotlight section)
   ============================================================================= */

(function() {
    'use strict';
    
    // State
    let isOpen = false;
    let conversationHistory = [];
    let hasShownWelcome = false;
    
    /* =========================================================================
       INITIALIZE
       ========================================================================= */
    function init() {
        createWidget();
        initTooltipScroll();
        initDemoChatAnimation();
        initExternalTriggers();
        console.log('✅ Shadow AI Chatbot v2.2 initialized');
    }
    
    /* =========================================================================
       CREATE WIDGET DYNAMICALLY
       ========================================================================= */
    function createWidget() {
        const widget = document.createElement('div');
        widget.className = 'shadow-ai-container';
        widget.id = 'shadow-ai-container';
        
        widget.innerHTML = `
            <!-- Glow Effect -->
            <div class="shadow-ai-glow"></div>
            
            <!-- Tooltip -->
            <div class="shadow-ai-tooltip">Ask Shadow AI</div>
            
            <!-- Floating Button -->
            <button class="copilot-btn" id="shadow-ai-btn" aria-label="Open Shadow AI Chat">
                <span class="copilot-emoji">🤖</span>
            </button>
            
            <!-- Chat Window -->
            <div class="copilot-chat hidden" id="shadow-ai-chat" role="dialog" aria-label="Shadow AI Chat">
                <!-- Header: Title left, Status + Close right -->
                <div class="copilot-header">
                    <div class="copilot-header-left">
                        <span class="copilot-header-emoji">🤖</span>
                        <div class="copilot-header-text">
                            <h3>Shadow AI</h3>
                        </div>
                    </div>
                    <div class="copilot-header-right">
                        <p class="copilot-status">
                            <span class="copilot-status-dot online"></span>
                            <span class="copilot-status-text">Online</span>
                        </p>
                        <button class="copilot-close" aria-label="Close chat">&times;</button>
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
        
        // Show container with animation
        setTimeout(() => {
            widget.classList.add('ready');
        }, 500);
        
        // Bind events
        bindEvents();
    }
    
    /* =========================================================================
       BIND EVENTS
       ========================================================================= */
    function bindEvents() {
        const container = document.getElementById('shadow-ai-container');
        const btn = document.getElementById('shadow-ai-btn');
        const chat = document.getElementById('shadow-ai-chat');
        const closeBtn = container.querySelector('.copilot-close');
        const input = document.getElementById('shadow-ai-input');
        const sendBtn = document.getElementById('shadow-ai-send');
        
        // Toggle chat
        btn.addEventListener('click', toggleChat);
        
        // Close button
        closeBtn.addEventListener('click', closeChat);
        
        // Send message
        sendBtn.addEventListener('click', sendMessage);
        
        // Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
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
        input.addEventListener('focus', () => {
            setTimeout(() => {
                chat.classList.add('keyboard-visible');
            }, 300);
        });
        
        input.addEventListener('blur', () => {
            chat.classList.remove('keyboard-visible');
        });
    }
    
    /* =========================================================================
       TOGGLE/OPEN/CLOSE CHAT
       ========================================================================= */
    function toggleChat() {
        isOpen ? closeChat() : openChat();
    }
    
    function openChat() {
        isOpen = true;
        const container = document.getElementById('shadow-ai-container');
        const chat = document.getElementById('shadow-ai-chat');
        const input = document.getElementById('shadow-ai-input');
        
        chat.classList.remove('hidden');
        chat.classList.add('active');
        container.classList.add('chatbot-active');
        
        if (!hasShownWelcome) {
            showWelcomeMessage();
            hasShownWelcome = true;
        }
        
        setTimeout(() => input?.focus(), 300);
    }
    
    function closeChat() {
        isOpen = false;
        const container = document.getElementById('shadow-ai-container');
        const chat = document.getElementById('shadow-ai-chat');
        
        chat.classList.remove('active');
        chat.classList.add('hidden');
        container.classList.remove('chatbot-active');
    }
    
    /* =========================================================================
       WELCOME MESSAGE
       ========================================================================= */
    function showWelcomeMessage() {
        setTimeout(() => {
            addMessage("👋 Hi! I'm Shadow AI, your personal shadow ban detective. I can help you understand shadow banning, check your accounts, and provide recovery strategies. What would you like to know?", 'assistant');
        }, 500);
    }
    
    /* =========================================================================
       SEND MESSAGE
       ========================================================================= */
    function sendMessage() {
        const input = document.getElementById('shadow-ai-input');
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
    
    /* =========================================================================
       ADD MESSAGE TO CHAT
       ========================================================================= */
    function addMessage(text, role) {
        const messagesContainer = document.getElementById('shadow-ai-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}-message`;
        
        // Only show avatar for AI messages
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
                    <div class="message-text">${formatMessage(text)}</div>
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
    
    /* =========================================================================
       TYPING INDICATOR
       ========================================================================= */
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
        const typing = document.querySelector('.typing-indicator');
        typing?.remove();
    }
    
    /* =========================================================================
       GENERATE RESPONSE (Demo - replace with actual AI)
       ========================================================================= */
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
    
    /* =========================================================================
       TOOLTIP SCROLL BEHAVIOR
       ========================================================================= */
    function initTooltipScroll() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            const tooltip = document.querySelector('.shadow-ai-tooltip');
            if (!tooltip) return;
            
            tooltip.classList.add('scrolled');
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                tooltip.classList.remove('scrolled');
            }, 2000);
        }, { passive: true });
    }
    
    /* =========================================================================
       DEMO CHAT ANIMATION (Spotlight Section)
       ========================================================================= */
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
        
        function showDemoTypingIndicator() {
            const typing = document.createElement('div');
            typing.className = 'demo-typing-indicator';
            typing.innerHTML = `
                <div class="demo-avatar">🤖</div>
                <div class="demo-dots">
                    <span></span><span></span><span></span>
                </div>
            `;
            demoChat.appendChild(typing);
            demoChat.scrollTop = demoChat.scrollHeight;
            return typing;
        }
        
        function addDemoMessage(message) {
            const msgEl = document.createElement('div');
            msgEl.className = `demo-msg ${message.type}`;
            
            if (message.type === 'ai') {
                // AI messages with avatar
                msgEl.innerHTML = `
                    <div class="demo-avatar">🤖</div>
                    <div class="demo-text">${message.text.replace(/\n/g, '<br>')}</div>
                `;
            } else {
                // User messages - just text, no avatar
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
                const typing = showDemoTypingIndicator();
                
                setTimeout(() => {
                    typing.remove();
                    addDemoMessage(message);
                    
                    setTimeout(playNextMessage, message.delay || 1000);
                }, 800 + Math.random() * 400);
            } else {
                // User messages appear after a delay
                setTimeout(() => {
                    addDemoMessage(message);
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
    
    /* =========================================================================
       EXTERNAL TRIGGERS (buttons that open Shadow AI)
       ========================================================================= */
    function initExternalTriggers() {
        // Try AI button in spotlight section
        const tryAiBtn = document.getElementById('try-ai-btn');
        tryAiBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            openChat();
        });
        
        // Open Shadow AI button
        const openBtn = document.getElementById('open-shadow-ai');
        openBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            openChat();
        });
    }
    
    /* =========================================================================
       INIT ON DOM READY
       ========================================================================= */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
