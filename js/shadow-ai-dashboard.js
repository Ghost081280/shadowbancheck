/* =============================================================================
   SHADOW AI PRO - DASHBOARD CHATBOT v4.0
   ShadowBanCheck.io - Premium Copilot for Dashboard
   
   Uses same HTML structure and class names as website chatbot
   Differences from website version:
   - Title: "Shadow AI Pro" 
   - Counter: 10/day limit
   - Tooltip: "Ask Shadow AI Pro"
   
   Include shadow-ai.css (and optionally shadow-ai-dashboard.css) for styles
   ============================================================================= */

(function() {
    'use strict';
    
    // ==========================================================================
    // CONFIGURATION
    // ==========================================================================
    const CONFIG = {
        title: 'Shadow AI Pro',
        tooltip: 'Ask Shadow AI Pro',
        dailyLimit: 10, // Pro users get 10 questions/day
        storageKey: 'shadow_ai_pro_usage',
        welcomeMessage: "👋 Welcome back! I'm Shadow AI Pro, your dedicated shadow ban assistant. How can I help you today?"
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
                const today = new Date().toDateString();
                if (parsed.date !== today) {
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
        console.log('🤖 Shadow AI Pro v4.0 (Dashboard) Initializing...');
        
        // Add dashboard-page class to body for CSS targeting
        document.body.classList.add('dashboard-page');
        
        createWidget();
        bindEvents();
        initKeyboardHandler();
        
        console.log('✅ Shadow AI Pro initialized');
    }
    
    // ==========================================================================
    // CREATE WIDGET (Same structure as website)
    // ==========================================================================
    function createWidget() {
        const widget = document.createElement('div');
        widget.className = 'shadow-ai-container';
        widget.id = 'shadow-ai-container';
        
        const data = getQuestionData();
        questionsUsed = data.count;
        
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
                            <p class="copilot-usage" id="shadow-ai-usage">${questionsUsed}/${CONFIG.dailyLimit} today</p>
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
        
        // Show welcome message
        setTimeout(() => {
            addMessage(CONFIG.welcomeMessage, 'assistant');
        }, 800);
    }
    
    // ==========================================================================
    // BIND EVENTS
    // ==========================================================================
    function bindEvents() {
        // Toggle button
        document.getElementById('shadow-ai-btn')?.addEventListener('click', toggleChat);
        
        // Close button
        document.getElementById('shadow-ai-close')?.addEventListener('click', closeChat);
        
        // Send button
        document.getElementById('shadow-ai-send')?.addEventListener('click', sendMessage);
        
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
        
        // Scroll handler for tooltip
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
        
        updateUsageCounter();
    }
    
    function closeChat() {
        const chat = document.getElementById('shadow-ai-chat');
        const container = document.getElementById('shadow-ai-container');
        
        if (chat) {
            chat.classList.remove('active');
            chat.classList.add('hidden');
        }
        if (container) {
            container.classList.remove('chat-active');
        }
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
        
        if (isTyping) return;
        
        // Check question limit
        if (!canAskQuestion()) {
            addMessage("You've reached your daily limit of " + CONFIG.dailyLimit + " questions. Your limit resets at midnight!", 'assistant');
            return;
        }
        
        // Add user message
        addMessage(message, 'user');
        input.value = '';
        
        // Add to history
        conversationHistory.push({ role: 'user', content: message });
        
        // Increment counter
        incrementQuestionCount();
        
        // Show typing indicator
        showTypingIndicator();
        isTyping = true;
        
        // Generate response (replace with actual API call)
        setTimeout(() => {
            hideTypingIndicator();
            isTyping = false;
            
            const response = generateResponse(message);
            addMessage(response, 'assistant');
            conversationHistory.push({ role: 'assistant', content: response });
        }, 1000 + Math.random() * 1000);
    }
    
    // ==========================================================================
    // ADD MESSAGE
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
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) indicator.remove();
    }
    
    // ==========================================================================
    // KEYBOARD HANDLER (for mobile landscape)
    // ==========================================================================
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
    
    // ==========================================================================
    // RESPONSE GENERATOR (Replace with actual API)
    // ==========================================================================
    function generateResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        // Pro-specific responses
        if (lowerMsg.includes('shadow') && lowerMsg.includes('ban')) {
            return "I understand you're concerned about your online visibility. As a Pro user, I can provide detailed analysis of your accounts and personalized recovery strategies. What specific platform or issue would you like to discuss?";
        }
        
        if (lowerMsg.includes('check') || lowerMsg.includes('account')) {
            return "I can check your accounts across multiple platforms. To start, please tell me:\n\n1. Which platform (Twitter/X, Instagram, TikTok, etc.)?\n2. Your username or profile URL\n\nI'll analyze visibility factors and give you a probability score.";
        }
        
        if (lowerMsg.includes('help') || lowerMsg.includes('what can you')) {
            return "As Shadow AI Pro, I can help you with:\n\n**Account Analysis**\n• Check if you're shadow banned\n• Analyze engagement patterns\n• Identify visibility issues\n\n**Recovery Strategies**\n• Platform-specific advice\n• Content recommendations\n• Appeal guidance\n\n**Monitoring**\n• Track your accounts\n• Alert you to changes\n• Historical data analysis\n\nWhat would you like to explore?";
        }
        
        if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
            return "Hello! I'm here to help you understand and resolve any shadow ban issues. What platform are you concerned about?";
        }
        
        // Default response
        return "I'm here to help with shadow ban detection and recovery. Could you tell me more about your situation? For example:\n\n• Which platform are you using?\n• What visibility issues have you noticed?\n• How long has this been happening?";
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
