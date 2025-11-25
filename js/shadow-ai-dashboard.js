/* =============================================================================
   SHADOW AI PRO - DASHBOARD CHATBOT v2.1
   ShadowBanCheck.io - Premium Copilot for Dashboard
   
   Header Layout:
   - Left: Emoji + "Shadow AI Pro" title + usage counter below
   - Right: Status "● Online" + Close button
   ============================================================================= */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        dailyLimit: 10,
        storageKey: 'shadow_ai_pro_usage',
        apiEndpoint: '/api/chat' // Replace with actual endpoint
    };
    
    // State
    let isOpen = false;
    let isProcessing = false;
    let conversationHistory = [];
    let usageToday = 0;
    
    /* =========================================================================
       INITIALIZE
       ========================================================================= */
    function init() {
        loadUsage();
        createWidget();
        bindEvents();
        console.log('✅ Shadow AI Pro Dashboard v2.1 initialized');
    }
    
    /* =========================================================================
       CREATE WIDGET HTML
       ========================================================================= */
    function createWidget() {
        const widget = document.createElement('div');
        widget.className = 'shadow-ai-widget';
        widget.id = 'shadow-ai-pro';
        
        widget.innerHTML = `
            <!-- Floating Button -->
            <button class="shadow-ai-btn" id="shadow-ai-toggle" aria-label="Open Shadow AI Pro">
                <span class="shadow-ai-btn-icon">🤖</span>
            </button>
            
            <!-- Chat Window -->
            <div class="copilot-window" id="shadow-ai-window" role="dialog" aria-label="Shadow AI Pro Chat">
                <!-- Header: Title + Usage left, Status + Close right -->
                <div class="copilot-header">
                    <div class="copilot-header-left">
                        <span class="copilot-header-emoji">🤖</span>
                        <div class="copilot-header-text">
                            <h3>Shadow AI Pro</h3>
                            <p class="copilot-usage" id="shadow-ai-counter">${usageToday}/${CONFIG.dailyLimit} today</p>
                        </div>
                    </div>
                    <div class="copilot-header-right">
                        <div class="copilot-status">
                            <span class="copilot-status-dot online"></span>
                            <span>Online</span>
                        </div>
                        <button class="copilot-close" id="shadow-ai-close" aria-label="Close chat">&times;</button>
                    </div>
                </div>
                
                <!-- Messages -->
                <div class="copilot-messages" id="shadow-ai-messages">
                    <!-- Messages injected here -->
                </div>
                
                <!-- Input -->
                <div class="copilot-input-area">
                    <input type="text" 
                           class="copilot-input" 
                           id="shadow-ai-input" 
                           placeholder="Ask about shadow bans..."
                           autocomplete="off">
                    <button class="copilot-send-btn" id="shadow-ai-send">Send</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
        
        // Show welcome message
        setTimeout(() => {
            addMessage('ai', "👋 Welcome back! I'm Shadow AI Pro, your dedicated shadow ban assistant. How can I help you today?");
        }, 500);
    }
    
    /* =========================================================================
       BIND EVENTS
       ========================================================================= */
    function bindEvents() {
        // Toggle button
        document.getElementById('shadow-ai-toggle').addEventListener('click', toggleChat);
        
        // Close button
        document.getElementById('shadow-ai-close').addEventListener('click', closeChat);
        
        // Send button
        document.getElementById('shadow-ai-send').addEventListener('click', sendMessage);
        
        // Enter key
        document.getElementById('shadow-ai-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeChat();
            }
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            const widget = document.getElementById('shadow-ai-pro');
            if (isOpen && !widget.contains(e.target)) {
                closeChat();
            }
        });
    }
    
    /* =========================================================================
       TOGGLE/OPEN/CLOSE
       ========================================================================= */
    function toggleChat() {
        isOpen ? closeChat() : openChat();
    }
    
    function openChat() {
        isOpen = true;
        document.getElementById('shadow-ai-window').classList.add('active');
        document.getElementById('shadow-ai-input').focus();
    }
    
    function closeChat() {
        isOpen = false;
        document.getElementById('shadow-ai-window').classList.remove('active');
    }
    
    /* =========================================================================
       SEND MESSAGE
       ========================================================================= */
    function sendMessage() {
        const input = document.getElementById('shadow-ai-input');
        const message = input.value.trim();
        
        if (!message || isProcessing) return;
        
        // Check usage limit
        if (usageToday >= CONFIG.dailyLimit) {
            showUpgradePrompt();
            return;
        }
        
        // Add user message
        addMessage('user', message);
        input.value = '';
        
        // Update history
        conversationHistory.push({ role: 'user', content: message });
        
        // Show typing indicator
        showTyping();
        isProcessing = true;
        
        // Process response (demo - replace with actual API call)
        setTimeout(() => {
            hideTyping();
            const response = generateResponse(message);
            addMessage('ai', response);
            conversationHistory.push({ role: 'assistant', content: response });
            
            // Update usage
            incrementUsage();
            isProcessing = false;
        }, 800 + Math.random() * 800);
    }
    
    /* =========================================================================
       ADD MESSAGE TO CHAT
       ========================================================================= */
    function addMessage(role, content) {
        const container = document.getElementById('shadow-ai-messages');
        const avatar = role === 'ai' ? '🤖' : '👤';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `copilot-message ${role}`;
        messageDiv.innerHTML = `
            <div class="copilot-avatar">${avatar}</div>
            <div class="message-bubble">${formatMessage(content)}</div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
    
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }
    
    /* =========================================================================
       TYPING INDICATOR
       ========================================================================= */
    function showTyping() {
        const container = document.getElementById('shadow-ai-messages');
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.id = 'typing-indicator';
        typing.innerHTML = `
            <div class="copilot-avatar">🤖</div>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }
    
    function hideTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }
    
    /* =========================================================================
       USAGE TRACKING
       ========================================================================= */
    function loadUsage() {
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored) {
            const data = JSON.parse(stored);
            const today = new Date().toDateString();
            if (data.date === today) {
                usageToday = data.count;
            }
        }
    }
    
    function incrementUsage() {
        usageToday++;
        localStorage.setItem(CONFIG.storageKey, JSON.stringify({
            date: new Date().toDateString(),
            count: usageToday
        }));
        updateUsageDisplay();
    }
    
    function updateUsageDisplay() {
        const counter = document.getElementById('shadow-ai-counter');
        if (counter) {
            counter.textContent = `${usageToday}/${CONFIG.dailyLimit} today`;
            
            // Update styling based on usage
            counter.classList.remove('limit-warning', 'limit-reached');
            if (usageToday >= CONFIG.dailyLimit) {
                counter.classList.add('limit-reached');
            } else if (usageToday >= CONFIG.dailyLimit - 2) {
                counter.classList.add('limit-warning');
            }
        }
    }
    
    function showUpgradePrompt() {
        const container = document.getElementById('shadow-ai-messages');
        const prompt = document.createElement('div');
        prompt.className = 'upgrade-prompt';
        prompt.innerHTML = `
            <p>You've reached your daily limit of ${CONFIG.dailyLimit} messages.</p>
            <button class="upgrade-btn" onclick="window.location.href='#pricing'">Upgrade for Unlimited</button>
        `;
        container.appendChild(prompt);
        container.scrollTop = container.scrollHeight;
    }
    
    /* =========================================================================
       GENERATE RESPONSE (Demo - Replace with actual AI API)
       ========================================================================= */
    function generateResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        // Account-specific responses
        if (lowerMsg.includes('my account') || lowerMsg.includes('check me')) {
            return "I can analyze your connected accounts for shadow ban indicators. Which platform would you like me to check? You have **Twitter/X** and **Reddit** connected.";
        }
        
        if (lowerMsg.includes('twitter') || lowerMsg.includes('x.com')) {
            return "Based on your Twitter/X account analysis:\n\n✅ **Search visibility**: Normal\n✅ **Reply visibility**: Normal\n⚠️ **Engagement rate**: 2.3% (slightly below average)\n\nNo shadow ban detected, but consider increasing posting frequency to improve engagement.";
        }
        
        if (lowerMsg.includes('reddit')) {
            return "Your Reddit account analysis:\n\n✅ **Shadowban status**: Clear\n✅ **Posts visible**: Yes\n✅ **Comments visible**: Yes\n\nYour Reddit account is in good standing with no restrictions detected.";
        }
        
        if (lowerMsg.includes('recover') || lowerMsg.includes('fix')) {
            return "Here are the top recovery strategies:\n\n1. **Stop all engagement** for 48-72 hours\n2. **Review recent content** for policy violations\n3. **Appeal through official channels** if applicable\n4. **Diversify your content** when you return\n\nWould you like detailed steps for a specific platform?";
        }
        
        if (lowerMsg.includes('why') || lowerMsg.includes('cause') || lowerMsg.includes('reason')) {
            return "Common shadow ban triggers include:\n\n• **Aggressive engagement** (mass following/liking)\n• **Banned hashtags** or keywords\n• **Reported content** by other users\n• **Automation tools** detected\n• **Spam-like behavior** patterns\n\nWhich platform are you concerned about?";
        }
        
        if (lowerMsg.includes('help') || lowerMsg.includes('what can you do')) {
            return "As your Shadow AI Pro assistant, I can:\n\n• **Analyze** your connected accounts\n• **Detect** shadow ban indicators\n• **Monitor** visibility changes\n• **Provide** recovery strategies\n• **Alert** you to new restrictions\n\nWhat would you like to explore first?";
        }
        
        // Default response
        return "I understand you're concerned about your online visibility. As a Pro user, I can provide detailed analysis of your accounts and personalized recovery strategies. What specific platform or issue would you like to discuss?";
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
