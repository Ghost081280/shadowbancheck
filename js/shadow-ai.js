/**
 * =============================================================================
 * SHADOW AI - UNIFIED CHATBOT v3.0
 * ShadowBanCheck.io - Website & Dashboard (Identical Behavior)
 * 
 * Features:
 * - Question counter (3 free/day for website, configurable for dashboard)
 * - Dynamic widget creation
 * - Keyboard handler for mobile
 * - Demo chat animation
 * - Responsive design support
 * =============================================================================
 */

(function() {
    'use strict';
    
    // ==========================================================================
    // CONFIGURATION
    // ==========================================================================
    const CONFIG = {
        // Detect if we're on dashboard
        isDashboard: window.location.pathname.includes('dashboard'),
        
        // Question limits
        freeQuestionsPerDay: 3,
        proQuestionsPerDay: 10,
        
        // Storage keys
        storageKey: 'shadowAI_questions',
        
        // Title based on context
        get title() {
            return this.isDashboard ? 'Shadow AI Pro' : 'Shadow AI';
        },
        
        // Tooltip text
        get tooltip() {
            return this.isDashboard ? 'Ask Shadow AI Pro' : 'Ask Shadow AI';
        },
        
        // Questions per day based on context
        get dailyLimit() {
            return this.isDashboard ? this.proQuestionsPerDay : this.freeQuestionsPerDay;
        }
    };
    
    // State
    let conversationHistory = [];
    let isTyping = false;
    let questionsUsed = 0;
    
    // ==========================================================================
    // QUESTION TRACKING
    // ==========================================================================
    function getQuestionData() {
        try {
            const data = localStorage.getItem(CONFIG.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                // Check if it's a new day
                const today = new Date().toDateString();
                if (parsed.date !== today) {
                    // Reset for new day
                    return { date: today, count: 0 };
                }
                return parsed;
            }
        } catch (e) {
            console.warn('Could not read question data:', e);
        }
        return { date: new Date().toDateString(), count: 0 };
    }
    
    function saveQuestionData(count) {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify({
                date: new Date().toDateString(),
                count: count
            }));
        } catch (e) {
            console.warn('Could not save question data:', e);
        }
    }
    
    function updateUsageCounter() {
        const usage = document.getElementById('shadow-ai-usage');
        if (usage) {
            const data = getQuestionData();
            questionsUsed = data.count;
            usage.textContent = `${questionsUsed}/${CONFIG.dailyLimit} today`;
        }
    }
    
    function canAskQuestion() {
        const data = getQuestionData();
        return data.count < CONFIG.dailyLimit;
    }
    
    function incrementQuestionCount() {
        const data = getQuestionData();
        data.count++;
        saveQuestionData(data.count);
        updateUsageCounter();
    }
    
    // ==========================================================================
    // INITIALIZE
    // ==========================================================================
    function init() {
        console.log(`🤖 Shadow AI v3.0 Initializing (${CONFIG.isDashboard ? 'Dashboard' : 'Website'})...`);
        
        createWidget();
        initDemoChat();
        initExternalTriggers();
        
        console.log('✅ Shadow AI initialized');
    }
    
    // ==========================================================================
    // CREATE WIDGET DYNAMICALLY
    // ==========================================================================
    function createWidget() {
        const widget = document.createElement('div');
        widget.className = 'shadow-ai-container';
        widget.id = 'shadow-ai-container';
        
        widget.innerHTML = `
            <!-- Glow Effect -->
            <div class="shadow-ai-glow"></div>
            
            <!-- Tooltip -->
            <div class="shadow-ai-tooltip">${CONFIG.tooltip}</div>
            
            <!-- Floating Button -->
            <button class="copilot-btn" id="shadow-ai-btn">
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
                            <p class="copilot-usage" id="shadow-ai-usage">0/${CONFIG.dailyLimit} today</p>
                        </div>
                    </div>
                    <div class="copilot-header-right">
                        <span class="copilot-status">
                            <span class="copilot-status-dot online"></span>
                            Online
                        </span>
                        <button class="copilot-close" id="shadow-ai-close">×</button>
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
        
        // Bind events
        bindEvents();
        
        // Update usage counter
        updateUsageCounter();
        
        // Initialize keyboard handler
        initKeyboardHandler();
    }
    
    // ==========================================================================
    // EVENT BINDING
    // ==========================================================================
    function bindEvents() {
        // Toggle button
        const btn = document.getElementById('shadow-ai-btn');
        btn?.addEventListener('click', toggleChat);
        
        // Close button
        const closeBtn = document.getElementById('shadow-ai-close');
        closeBtn?.addEventListener('click', closeChat);
        
        // Send button
        const sendBtn = document.getElementById('shadow-ai-send');
        sendBtn?.addEventListener('click', sendMessage);
        
        // Input enter key
        const input = document.getElementById('shadow-ai-input');
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
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
                }, 2000);
            }
        }, { passive: true });
    }
    
    // ==========================================================================
    // CHAT TOGGLE
    // ==========================================================================
    function toggleChat() {
        const chat = document.getElementById('shadow-ai-chat');
        const container = document.getElementById('shadow-ai-container');
        
        if (chat?.classList.contains('hidden')) {
            openChat();
        } else {
            closeChat();
        }
    }
    
    function openChat() {
        const chat = document.getElementById('shadow-ai-chat');
        const container = document.getElementById('shadow-ai-container');
        const messagesContainer = document.getElementById('shadow-ai-messages');
        
        chat?.classList.remove('hidden');
        chat?.classList.add('active');
        container?.classList.add('chat-open');
        
        // Add welcome message if empty
        if (messagesContainer && messagesContainer.children.length === 0) {
            addWelcomeMessage();
        }
        
        // Focus input
        setTimeout(() => {
            document.getElementById('shadow-ai-input')?.focus();
        }, 300);
    }
    
    function closeChat() {
        const chat = document.getElementById('shadow-ai-chat');
        const container = document.getElementById('shadow-ai-container');
        const input = document.getElementById('shadow-ai-input');
        
        chat?.classList.add('hidden');
        chat?.classList.remove('active');
        chat?.classList.remove('keyboard-visible');
        container?.classList.remove('chat-open');
        
        // Blur input to close keyboard
        input?.blur();
        
        // Show tooltip after close
        showTooltipAfterClose();
    }
    
    function showTooltipAfterClose() {
        const tooltip = document.querySelector('.shadow-ai-tooltip');
        if (tooltip) {
            tooltip.classList.remove('scrolled');
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 300);
        }
    }
    
    // ==========================================================================
    // WELCOME MESSAGE
    // ==========================================================================
    function addWelcomeMessage() {
        const greeting = CONFIG.isDashboard 
            ? "👋 Welcome back! I'm Shadow AI Pro, your dedicated shadow ban assistant. How can I help you today?"
            : "👋 Hi! I'm Shadow AI, your personal shadow ban detective. I can help you understand shadow banning, check your accounts, and provide recovery strategies. What would you like to know?";
        
        addMessage(greeting, 'assistant');
    }
    
    // ==========================================================================
    // SEND MESSAGE
    // ==========================================================================
    function sendMessage() {
        const input = document.getElementById('shadow-ai-input');
        const message = input?.value?.trim();
        
        if (!message) {
            input?.classList.add('blink-empty');
            setTimeout(() => input?.classList.remove('blink-empty'), 1200);
            return;
        }
        
        // Check question limit
        if (!canAskQuestion()) {
            showLimitReachedMessage();
            return;
        }
        
        if (isTyping) return;
        
        // Add user message
        addMessage(message, 'user');
        input.value = '';
        
        // Increment counter
        incrementQuestionCount();
        
        // Add to history
        conversationHistory.push({ role: 'user', content: message });
        
        // Show typing indicator
        showTypingIndicator();
        isTyping = true;
        
        // Disable input
        input.disabled = true;
        document.getElementById('shadow-ai-send').disabled = true;
        
        // Generate response (simulate for now)
        setTimeout(() => {
            hideTypingIndicator();
            const response = generateResponse(message);
            addMessage(response, 'assistant');
            conversationHistory.push({ role: 'assistant', content: response });
            
            input.disabled = false;
            document.getElementById('shadow-ai-send').disabled = false;
            isTyping = false;
        }, 1000 + Math.random() * 1000);
    }
    
    // ==========================================================================
    // MESSAGE HANDLING
    // ==========================================================================
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
    
    // ==========================================================================
    // TYPING INDICATOR
    // ==========================================================================
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
    
    // ==========================================================================
    // LIMIT REACHED MESSAGE
    // ==========================================================================
    function showLimitReachedMessage() {
        const messagesContainer = document.getElementById('shadow-ai-messages');
        if (!messagesContainer) return;
        
        // Check if already showing
        if (messagesContainer.querySelector('.limit-reached-message')) return;
        
        const limitDiv = document.createElement('div');
        limitDiv.className = 'limit-reached-message';
        limitDiv.innerHTML = `
            <h4>🚫 Daily Limit Reached</h4>
            <p>You've used all ${CONFIG.dailyLimit} free questions for today. Upgrade to Shadow AI Pro for more!</p>
            <a href="#shadow-ai-pro">Get Shadow AI Pro →</a>
        `;
        
        messagesContainer.appendChild(limitDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // ==========================================================================
    // RESPONSE GENERATION (Placeholder - replace with API)
    // ==========================================================================
    function generateResponse(message) {
        const lower = message.toLowerCase();
        
        if (lower.includes('shadow ban') || lower.includes('shadowban')) {
            return "Shadow banning is when a platform limits your content's visibility without notifying you. Your posts appear normal to you, but others can't see them in searches, feeds, or recommendations. I can help you check if you're affected!";
        }
        
        if (lower.includes('check') || lower.includes('test')) {
            return "To check for a shadow ban, I analyze multiple factors including:\n\n✓ Search visibility\n✓ Engagement patterns\n✓ Hashtag reach\n✓ Profile accessibility\n\nWould you like me to check a specific platform for you?";
        }
        
        if (lower.includes('twitter') || lower.includes('x.com')) {
            return "For Twitter/X shadow bans, I check:\n\n• Search suggestion ban\n• Search ban\n• Ghost ban (replies hidden)\n• Reply deboosting\n\nPaste your Twitter username or post URL and I'll analyze it!";
        }
        
        if (lower.includes('instagram') || lower.includes('tiktok')) {
            return "I can help with Instagram and TikTok shadow ban detection! Common signs include:\n\n• Sudden engagement drop\n• Hashtags not working\n• Content not showing in Explore/For You\n\nWant me to explain how to check your account?";
        }
        
        if (lower.includes('fix') || lower.includes('recover')) {
            return "Here are general recovery strategies:\n\n1. **Take a break** - Stop posting for 24-48 hours\n2. **Review content** - Remove anything potentially violating guidelines\n3. **Avoid spam behavior** - Don't mass-like, follow, or use bots\n4. **Diversify hashtags** - Don't use the same ones repeatedly\n5. **Engage authentically** - Focus on genuine interactions\n\nWant platform-specific advice?";
        }
        
        if (lower.includes('pro') || lower.includes('upgrade') || lower.includes('premium')) {
            return "**Shadow AI Pro** gives you:\n\n✓ 100 AI questions/day\n✓ Live platform checks\n✓ Personalized recovery strategies\n✓ 24/7 availability\n\nStart your 7-day free trial at just $9.99/mo!";
        }
        
        return "I understand you're concerned about your online visibility. As a Pro user, I can provide detailed analysis of your accounts and personalized recovery strategies. What specific platform or issue would you like to discuss?";
    }
    
    // ==========================================================================
    // KEYBOARD HANDLER
    // ==========================================================================
    function initKeyboardHandler() {
        const input = document.getElementById('shadow-ai-input');
        const chat = document.getElementById('shadow-ai-chat');
        
        if (!input || !chat) return;
        
        // Focus handler
        input.addEventListener('focus', () => {
            // Only apply keyboard class in landscape mobile
            if (window.innerWidth <= 926 && window.innerHeight <= 500 && 
                window.matchMedia('(orientation: landscape)').matches) {
                chat.classList.add('keyboard-visible');
            }
        });
        
        // Blur handler
        input.addEventListener('blur', () => {
            setTimeout(() => {
                chat.classList.remove('keyboard-visible');
            }, 100);
        });
        
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                chat.classList.remove('keyboard-visible');
                if (document.activeElement === input) {
                    input.blur();
                }
            }, 300);
        });
        
        // Resize handler
        let lastHeight = window.innerHeight;
        let lastOrientation = window.matchMedia('(orientation: landscape)').matches;
        
        window.addEventListener('resize', () => {
            const currentOrientation = window.matchMedia('(orientation: landscape)').matches;
            
            if (currentOrientation !== lastOrientation) {
                chat.classList.remove('keyboard-visible');
                if (document.activeElement === input) {
                    input.blur();
                }
            }
            
            lastHeight = window.innerHeight;
            lastOrientation = currentOrientation;
        }, { passive: true });
        
        console.log('✅ Keyboard handler initialized');
    }
    
    // ==========================================================================
    // DEMO CHAT ANIMATION
    // ==========================================================================
    function initDemoChat() {
        const demoChat = document.getElementById('demo-chat-messages');
        if (!demoChat) return;
        
        let hasPlayed = false;
        
        const chatSequence = [
            { type: 'user', text: "Am I shadow banned on Twitter?", delay: 800 },
            { type: 'ai', text: "I can check that for you! What's your Twitter username?", delay: 1200 },
            { type: 'user', text: "@myusername", delay: 600 },
            { type: 'ai', text: "I'm analyzing your account now...", delay: 1000 },
            { type: 'ai', text: "✓ Search visibility: Normal\n✓ Reply visibility: Normal\n✓ Profile access: Public\n\n**Result:** No shadow ban detected! Your account appears healthy.", delay: 1500 }
        ];
        
        let currentIndex = 0;
        let isAnimating = false;
        
        function showDemoTypingIndicator() {
            const typing = document.createElement('div');
            typing.className = 'demo-typing-indicator';
            typing.style.cssText = 'display:flex !important;flex-direction:row !important;gap:12px !important;align-items:flex-start !important;';
            typing.innerHTML = `
                <div class="demo-avatar" style="width:36px;height:36px;min-width:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">🤖</div>
                <div class="demo-dots">
                    <span></span><span></span><span></span>
                </div>
            `;
            demoChat.appendChild(typing);
            demoChat.scrollTop = demoChat.scrollHeight;
            return typing;
        }
        
        function showUserTypingIndicator() {
            const typing = document.createElement('div');
            typing.className = 'demo-msg user demo-user-typing';
            typing.style.cssText = 'opacity: 0.7;';
            typing.innerHTML = '<span class="typing-cursor">|</span>';
            demoChat.appendChild(typing);
            demoChat.scrollTop = demoChat.scrollHeight;
            return typing;
        }
        
        // Typewriter effect - types words one at a time
        function typewriterEffect(element, text, isUser, callback) {
            const words = text.split(' ');
            let currentWord = 0;
            let displayText = '';
            
            // Speed: AI types faster (50ms), user types slower (80ms)
            const speed = isUser ? 80 : 50;
            
            function typeNextWord() {
                if (currentWord < words.length) {
                    displayText += (currentWord > 0 ? ' ' : '') + words[currentWord];
                    
                    if (isUser) {
                        element.textContent = displayText;
                    } else {
                        // For AI messages, handle line breaks and bold
                        const formattedText = displayText
                            .replace(/\n/g, '<br>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        element.querySelector('.demo-text').innerHTML = formattedText;
                    }
                    
                    currentWord++;
                    demoChat.scrollTop = demoChat.scrollHeight;
                    setTimeout(typeNextWord, speed);
                } else {
                    if (callback) callback();
                }
            }
            
            typeNextWord();
        }
        
        function addDemoMessageWithTypewriter(message, callback) {
            const msgEl = document.createElement('div');
            msgEl.className = `demo-msg ${message.type}`;
            
            if (message.type === 'ai') {
                msgEl.innerHTML = `
                    <div class="demo-avatar" style="width:36px;height:36px;min-width:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;box-shadow:0 4px 12px rgba(99,102,241,0.3);">🤖</div>
                    <div class="demo-text" style="flex:1;padding:6px 0;line-height:1.6;"></div>
                `;
                msgEl.style.cssText = 'display:flex !important;flex-direction:row !important;gap:12px !important;align-items:flex-start !important;background:transparent !important;padding:0 !important;';
            } else {
                msgEl.textContent = '';
            }
            
            demoChat.appendChild(msgEl);
            demoChat.scrollTop = demoChat.scrollHeight;
            
            // Start typewriter effect
            typewriterEffect(msgEl, message.text, message.type === 'user', callback);
            
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
                // Show typing dots first
                const typing = showDemoTypingIndicator();
                setTimeout(() => {
                    typing.remove();
                    // Then typewriter the message
                    addDemoMessageWithTypewriter(message, () => {
                        setTimeout(playNextMessage, message.delay || 800);
                    });
                }, 500 + Math.random() * 300);
            } else {
                // For user: show brief typing indicator then typewriter
                const userTyping = showUserTypingIndicator();
                setTimeout(() => {
                    userTyping.remove();
                    addDemoMessageWithTypewriter(message, () => {
                        setTimeout(playNextMessage, message.delay || 600);
                    });
                }, 300);
            }
        }
        
        function startAnimation() {
            if (hasPlayed || isAnimating) return;
            hasPlayed = true;
            isAnimating = true;
            demoChat.innerHTML = '';
            currentIndex = 0;
            // Start almost immediately when section is visible
            setTimeout(playNextMessage, 100);
        }
        
        // Start when section becomes visible - trigger earlier (20% visible)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasPlayed) {
                    startAnimation();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(demoChat);
    }
    
    // ==========================================================================
    // EXTERNAL TRIGGERS
    // ==========================================================================
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
    
    // ==========================================================================
    // INIT ON DOM READY
    // ==========================================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
