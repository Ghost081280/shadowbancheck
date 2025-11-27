/**
 * =============================================================================
 * SHADOW AI - UNIFIED CHATBOT v4.0 (RESTORED)
 * ShadowBanCheck.io - Works on ALL pages
 * 
 * Same style everywhere. Only permissions change:
 * - Website (index.html): 3 lookups/day, "Shadow AI"
 * - User Dashboard: 25/month, "Shadow AI Pro"
 * - Agency Dashboard: Unlimited, "Shadow AI Agency"
 * - Admin Dashboard: Unlimited + commands, "Shadow AI Admin"
 * 
 * Uses @ghost081280 for Twitter/X examples
 * =============================================================================
 */

(function() {
    'use strict';
    
    // ==========================================================================
    // PAGE DETECTION & CONFIGURATION
    // ==========================================================================
    const PAGE_TYPE = detectPageType();
    
    function detectPageType() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('admin-dashboard') || path.includes('admin.html')) return 'admin';
        if (path.includes('agency-dashboard') || path.includes('agency.html')) return 'agency';
        if (path.includes('dashboard')) return 'dashboard';
        return 'website';
    }
    
    const CONFIG = {
        website: {
            title: 'Shadow AI',
            tooltip: 'Ask Shadow AI',
            usageText: (remaining, limit) => `${remaining}/${limit} lookups left`,
            lookupLimit: 3,
            messageLimit: 20,
            welcomeMessage: "👋 Hi! I'm Shadow AI, your personal shadow ban detective. I can help you understand shadow banning, check your accounts, and provide recovery strategies. What would you like to know?"
        },
        dashboard: {
            title: 'Shadow AI Pro',
            tooltip: 'Ask Shadow AI Pro',
            usageText: (remaining, limit) => `${remaining}/${limit} this month`,
            lookupLimit: 25,
            messageLimit: 200,
            welcomeMessage: "👋 Welcome back! I'm Shadow AI Pro, your dedicated shadow ban assistant. You have **{remaining}** questions remaining this month. How can I help?"
        },
        agency: {
            title: 'Shadow AI Agency',
            tooltip: 'Ask Shadow AI Agency',
            usageText: () => '∞ Unlimited',
            lookupLimit: Infinity,
            messageLimit: Infinity,
            welcomeMessage: "👋 Welcome to Shadow AI Agency! I can help you manage client accounts, run bulk checks, and generate dispute letters. Ask me anything or type **help** for commands."
        },
        admin: {
            title: 'Shadow AI Admin',
            tooltip: 'Admin AI Command Center',
            usageText: () => '∞ Unlimited',
            lookupLimit: Infinity,
            messageLimit: Infinity,
            welcomeMessage: "👋 Welcome back Andrew! I'm your AI Command Center.\n\n**Quick Commands:**\n• `check @username on twitter` - Run engine scan\n• `lookup user@email.com` - View user's scan history\n• `stats` - Dashboard statistics\n\nOr just ask me anything!"
        }
    };
    
    const CURRENT_CONFIG = CONFIG[PAGE_TYPE];
    const DEMO_USERNAME = '@ghost081280';
    
    // Storage keys
    const STORAGE_KEYS = {
        lookups: `shadowAI_lookups_${PAGE_TYPE}`,
        messages: `shadowAI_messages_${PAGE_TYPE}`,
        powerCheck: `shadowAI_powerCheck_${PAGE_TYPE}`,
        monthly: `shadowAI_monthly_${PAGE_TYPE}`
    };
    
    // State
    let conversationHistory = [];
    let isTyping = false;
    let lookupsUsed = 0;
    let messagesUsed = 0;
    let usedPowerCheck = false;
    
    // ==========================================================================
    // STORAGE HELPERS
    // ==========================================================================
    function getStorageData(key, resetPeriod = 'daily') {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                const now = new Date();
                let shouldReset = false;
                
                if (resetPeriod === 'daily') {
                    shouldReset = parsed.date !== now.toDateString();
                } else if (resetPeriod === 'monthly') {
                    const currentMonth = now.toISOString().slice(0, 7);
                    shouldReset = parsed.month !== currentMonth;
                }
                
                if (shouldReset) {
                    return { date: now.toDateString(), month: now.toISOString().slice(0, 7), count: 0 };
                }
                return parsed;
            }
        } catch (e) {
            console.warn('Storage read error:', e);
        }
        const now = new Date();
        return { date: now.toDateString(), month: now.toISOString().slice(0, 7), count: 0 };
    }
    
    function saveStorageData(key, count) {
        try {
            const now = new Date();
            localStorage.setItem(key, JSON.stringify({
                date: now.toDateString(),
                month: now.toISOString().slice(0, 7),
                count: count
            }));
        } catch (e) {
            console.warn('Storage write error:', e);
        }
    }
    
    // Determine reset period based on page type
    function getResetPeriod() {
        return PAGE_TYPE === 'dashboard' ? 'monthly' : 'daily';
    }
    
    function updateUsageCounter() {
        const usage = document.getElementById('shadow-ai-usage');
        if (!usage) return;
        
        if (CURRENT_CONFIG.lookupLimit === Infinity) {
            usage.textContent = CURRENT_CONFIG.usageText();
        } else {
            const data = getStorageData(STORAGE_KEYS.lookups, getResetPeriod());
            lookupsUsed = data.count;
            const remaining = Math.max(0, CURRENT_CONFIG.lookupLimit - lookupsUsed);
            usage.textContent = CURRENT_CONFIG.usageText(remaining, CURRENT_CONFIG.lookupLimit);
        }
    }
    
    function canDoLookup() {
        if (CURRENT_CONFIG.lookupLimit === Infinity) return true;
        const data = getStorageData(STORAGE_KEYS.lookups, getResetPeriod());
        return data.count < CURRENT_CONFIG.lookupLimit;
    }
    
    function canSendMessage() {
        if (CURRENT_CONFIG.messageLimit === Infinity) return true;
        const data = getStorageData(STORAGE_KEYS.messages, getResetPeriod());
        return data.count < CURRENT_CONFIG.messageLimit;
    }
    
    function incrementLookupCount() {
        if (CURRENT_CONFIG.lookupLimit === Infinity) return;
        const data = getStorageData(STORAGE_KEYS.lookups, getResetPeriod());
        data.count++;
        saveStorageData(STORAGE_KEYS.lookups, data.count);
        updateUsageCounter();
    }
    
    function incrementMessageCount() {
        if (CURRENT_CONFIG.messageLimit === Infinity) return;
        const data = getStorageData(STORAGE_KEYS.messages, getResetPeriod());
        data.count++;
        saveStorageData(STORAGE_KEYS.messages, data.count);
    }
    
    // ==========================================================================
    // DETECT REQUEST TYPES
    // ==========================================================================
    function isLookupRequest(message) {
        const lower = message.toLowerCase();
        const lookupPatterns = [
            /@[a-zA-Z0-9_]+/,
            /check\s+(my\s+)?(account|profile|username)/i,
            /am\s+i\s+(shadow\s*)?banned/i,
            /is\s+@?[a-zA-Z0-9_]+\s+(shadow\s*)?banned/i,
            /https?:\/\/(twitter|x|instagram|tiktok|reddit|facebook|youtube|linkedin|threads)/i,
            /check\s+(this\s+)?(post|url|link)/i,
            /check\s+(these\s+)?hashtag/i,
            /#[a-zA-Z0-9_]+.*#[a-zA-Z0-9_]+/,
            /power\s*check/i,
            /3[\s-]?in[\s-]?1/i,
            /full\s+(analysis|check|scan)/i
        ];
        return lookupPatterns.some(pattern => pattern.test(lower));
    }
    
    function isAdminCommand(message) {
        if (PAGE_TYPE !== 'admin') return false;
        const lower = message.toLowerCase().trim();
        return lower.startsWith('check ') || 
               lower.startsWith('lookup ') || 
               lower.startsWith('scan ') || 
               lower === 'stats' || 
               lower === 'messages' ||
               lower === 'help';
    }
    
    // ==========================================================================
    // INITIALIZE
    // ==========================================================================
    function init() {
        console.log(`🤖 Shadow AI v4.0 (${PAGE_TYPE}) Initializing...`);
        
        // Add dashboard-page class for CSS if on any dashboard
        if (PAGE_TYPE !== 'website') {
            document.body.classList.add('dashboard-page');
        }
        
        createWidget();
        initDemoChat();
        initExternalTriggers();
        
        console.log(`✅ Shadow AI initialized as "${CURRENT_CONFIG.title}"`);
    }
    
    // ==========================================================================
    // CREATE WIDGET
    // ==========================================================================
    function createWidget() {
        // Don't create duplicate
        if (document.querySelector('.shadow-ai-container')) {
            console.log('Widget already exists');
            return;
        }
        
        const widget = document.createElement('div');
        widget.className = 'shadow-ai-container';
        widget.id = 'shadow-ai-container';
        
        const usageText = CURRENT_CONFIG.lookupLimit === Infinity 
            ? CURRENT_CONFIG.usageText() 
            : CURRENT_CONFIG.usageText(CURRENT_CONFIG.lookupLimit, CURRENT_CONFIG.lookupLimit);
        
        widget.innerHTML = `
            <!-- Glow Effect -->
            <div class="shadow-ai-glow"></div>
            
            <!-- Tooltip -->
            <div class="shadow-ai-tooltip">${CURRENT_CONFIG.tooltip}</div>
            
            <!-- Floating Button -->
            <button class="copilot-btn" id="shadow-ai-btn" aria-label="Open ${CURRENT_CONFIG.title}">
                <span class="copilot-emoji">🤖</span>
            </button>
            
            <!-- Chat Window -->
            <div class="copilot-chat hidden" id="shadow-ai-chat">
                <!-- Header -->
                <div class="copilot-header">
                    <div class="copilot-header-left">
                        <span class="copilot-header-emoji">🤖</span>
                        <div class="copilot-header-text">
                            <h3>${CURRENT_CONFIG.title}</h3>
                            <p class="copilot-usage" id="shadow-ai-usage">${usageText}</p>
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
                           placeholder="${PAGE_TYPE === 'admin' ? 'Enter command or ask a question...' : 'Ask about shadow bans...'}" 
                           autocomplete="off"
                           enterkeyhint="send">
                    <button class="copilot-send" id="shadow-ai-send">Send</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
        
        // Show after delay
        setTimeout(() => {
            widget.classList.add('ready');
        }, 500);
        
        bindEvents();
        updateUsageCounter();
        initKeyboardHandler();
    }
    
    // ==========================================================================
    // EVENT BINDING
    // ==========================================================================
    function bindEvents() {
        document.getElementById('shadow-ai-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleChat();
        });
        
        document.getElementById('shadow-ai-close')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeChat();
        });
        
        document.getElementById('shadow-ai-send')?.addEventListener('click', (e) => {
            e.preventDefault();
            sendMessage();
        });
        
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
                }, 2000);
            }
        }, { passive: true });
    }
    
    // ==========================================================================
    // CHAT TOGGLE
    // ==========================================================================
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
        const messagesContainer = document.getElementById('shadow-ai-messages');
        
        chat?.classList.remove('hidden');
        chat?.classList.add('active');
        container?.classList.add('chat-open');
        container?.classList.add('chat-active');
        
        // Add welcome message if empty
        if (messagesContainer && messagesContainer.children.length === 0) {
            let welcomeMsg = CURRENT_CONFIG.welcomeMessage;
            if (welcomeMsg.includes('{remaining}')) {
                const remaining = Math.max(0, CURRENT_CONFIG.lookupLimit - lookupsUsed);
                welcomeMsg = welcomeMsg.replace('{remaining}', remaining);
            }
            addMessage(welcomeMsg, 'assistant');
        }
        
        updateUsageCounter();
        
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
        container?.classList.remove('chat-active');
        
        input?.blur();
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
        
        const isLookup = isLookupRequest(message);
        const isCommand = isAdminCommand(message);
        
        // Check limits
        if (isLookup && !canDoLookup()) {
            showLimitMessage(`You've used all ${CURRENT_CONFIG.lookupLimit} lookups. Upgrade to Pro for more!`);
            return;
        }
        
        if (!isLookup && !isCommand && !canSendMessage()) {
            showLimitMessage(`You've reached the daily chat limit. Upgrade to Pro for unlimited!`);
            return;
        }
        
        // Add user message
        addMessage(message, 'user');
        input.value = '';
        
        // Increment counters
        if (isLookup) {
            incrementLookupCount();
        } else if (!isCommand) {
            incrementMessageCount();
        }
        
        conversationHistory.push({ role: 'user', content: message });
        
        // Show typing
        showTypingIndicator();
        isTyping = true;
        
        input.disabled = true;
        document.getElementById('shadow-ai-send').disabled = true;
        
        // Generate response
        const delay = isLookup || isCommand ? 1500 : 800;
        setTimeout(() => {
            hideTypingIndicator();
            const response = generateResponse(message, isLookup, isCommand);
            addMessage(response, 'assistant');
            conversationHistory.push({ role: 'assistant', content: response });
            
            input.disabled = false;
            document.getElementById('shadow-ai-send').disabled = false;
            isTyping = false;
            input.focus();
        }, delay + Math.random() * 500);
    }
    
    function showLimitMessage(text) {
        const messagesContainer = document.getElementById('shadow-ai-messages');
        if (!messagesContainer) return;
        
        messagesContainer.querySelectorAll('.limit-message').forEach(el => el.remove());
        
        const limitDiv = document.createElement('div');
        limitDiv.className = 'chat-message assistant-message limit-message';
        limitDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">🤖</div>
                <div class="message-text">
                    <strong>⏰ Limit Reached</strong><br><br>
                    ${text}<br><br>
                    <a href="#pricing">View Pricing →</a>
                </div>
            </div>
        `;
        messagesContainer.appendChild(limitDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.2);padding:2px 6px;border-radius:4px;">$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="chat-link" target="_blank">$1</a>')
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
        document.querySelector('.typing-indicator')?.remove();
    }
    
    // ==========================================================================
    // RESPONSE GENERATION
    // ==========================================================================
    function generateResponse(message, isLookup = false, isCommand = false) {
        const lower = message.toLowerCase().trim();
        
        // Admin commands
        if (PAGE_TYPE === 'admin' && isCommand) {
            return generateAdminResponse(message);
        }
        
        // Agency-specific responses
        if (PAGE_TYPE === 'agency') {
            if (lower.includes('client') || lower.includes('bulk')) {
                return generateAgencyResponse(message);
            }
        }
        
        // Lookup requests
        if (isLookup) {
            return generateLookupResponse(message);
        }
        
        // General responses (same for all versions)
        return generateGeneralResponse(message);
    }
    
    function generateAdminResponse(message) {
        const lower = message.toLowerCase().trim();
        
        // check @username on platform
        const checkMatch = lower.match(/^(?:check|scan)\s+@?(\w+)\s+(?:on\s+)?(\w+)/);
        if (checkMatch) {
            const username = checkMatch[1];
            const platform = checkMatch[2];
            const score = Math.floor(Math.random() * 60) + 10;
            const status = score < 25 ? '✅ LOW' : score < 50 ? '⚠️ MODERATE' : '🔶 HIGH';
            
            return `**🔍 Engine Scan Complete**\n\n` +
                   `**Platform:** ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n` +
                   `**Username:** @${username}\n` +
                   `**Score:** ${score}% ${status}\n\n` +
                   `**5-Factor Breakdown:**\n` +
                   `• Platform API: ${Math.floor(Math.random() * 30 + 10)}%\n` +
                   `• Web Analysis: ${Math.floor(Math.random() * 30 + 10)}%\n` +
                   `• Historical: ${Math.floor(Math.random() * 20 + 5)}%\n` +
                   `• Hashtag Health: ${Math.floor(Math.random() * 25 + 10)}%\n` +
                   `• IP Analysis: ${Math.floor(Math.random() * 15 + 5)}%`;
        }
        
        // lookup email
        const lookupMatch = lower.match(/^lookup\s+(\S+@\S+)/);
        if (lookupMatch) {
            const email = lookupMatch[1];
            return `**👤 User Lookup: ${email}**\n\n` +
                   `**Status:** Active\n` +
                   `**Plan:** Pro\n` +
                   `**Scans This Month:** 12\n\n` +
                   `**Recent Activity:**\n` +
                   `• Twitter check: ${DEMO_USERNAME} - 28%\n` +
                   `• Instagram check: @user - 15%`;
        }
        
        // stats
        if (lower === 'stats') {
            return `**📊 Dashboard Statistics**\n\n` +
                   `**Users:** 156 total (42 Pro, 8 Agency)\n` +
                   `**Today:** 1,234 scans, 89 AI questions\n` +
                   `**Revenue:** $1,247/mo\n` +
                   `**Support:** 5 unread messages`;
        }
        
        // help
        if (lower === 'help') {
            return `**🤖 Admin Commands:**\n\n` +
                   `• \`check @username on twitter\` - Run scan\n` +
                   `• \`lookup user@email.com\` - User info\n` +
                   `• \`stats\` - Dashboard stats\n` +
                   `• \`messages\` - Support tickets\n\n` +
                   `Or just ask me anything!`;
        }
        
        return generateGeneralResponse(message);
    }
    
    function generateAgencyResponse(message) {
        const lower = message.toLowerCase();
        
        if (lower.includes('client') && (lower.includes('list') || lower.includes('show') || lower.includes('all'))) {
            return `**📋 Your Clients:**\n\n` +
                   `✅ **ACME Corporation** - 3 accounts, 1 warning\n` +
                   `🔶 **Tech Startup Inc** - 2 accounts, issues detected\n` +
                   `🚫 **Local Restaurant** - 2 accounts, 1 banned\n\n` +
                   `Say "select [client name]" to work with a specific client.`;
        }
        
        if (lower.includes('bulk')) {
            return `**⚡ Bulk Operations:**\n\n` +
                   `• **3 clients**, **7 total accounts**\n` +
                   `• Estimated cost: $0.35 (7 × $0.05)\n\n` +
                   `Use the Bulk Check panel in dashboard to run.`;
        }
        
        return generateGeneralResponse(message);
    }
    
    function generateLookupResponse(message) {
        const usernameMatch = message.match(/@([a-zA-Z0-9_]+)/);
        if (usernameMatch) {
            const username = usernameMatch[1];
            const probability = Math.floor(Math.random() * 35) + 5;
            const status = probability < 15 ? 'LOW RISK ✅' : probability < 30 ? 'MODERATE RISK ⚠️' : 'HIGH RISK 🚨';
            
            return `**Account Check: @${username}**\n\n` +
                   `**Shadow Ban Probability: ${probability}%** (${status})\n\n` +
                   `**Quick Summary:**\n` +
                   `✓ Search visibility: ${Math.random() > 0.3 ? 'Visible' : 'Reduced'}\n` +
                   `✓ Profile accessibility: ${Math.random() > 0.2 ? 'Normal' : 'Limited'}\n` +
                   `✓ Engagement analysis: ${Math.random() > 0.4 ? 'Healthy' : 'Below average'}\n\n` +
                   `Want detailed analysis? Use our [full checker](checker.html)!`;
        }
        
        const urlMatch = message.match(/https?:\/\/[^\s]+/i);
        if (urlMatch) {
            const probability = Math.floor(Math.random() * 30) + 5;
            const status = probability < 15 ? 'VISIBLE ✅' : 'REDUCED REACH ⚠️';
            
            return `**Post Visibility Check**\n\n` +
                   `**Suppression Probability: ${probability}%** (${status})\n\n` +
                   `**Analysis:**\n` +
                   `✓ Search indexing: ${Math.random() > 0.3 ? 'Indexed' : 'Not indexed'}\n` +
                   `✓ Feed visibility: ${Math.random() > 0.2 ? 'Normal' : 'Reduced'}\n` +
                   `✓ Hashtag reach: ${Math.random() > 0.4 ? 'Good' : 'Limited'}`;
        }
        
        return "I'd be happy to check! Please provide:\n\n• A **@username** + platform\n• A **post URL**\n• Or **#hashtags** to check";
    }
    
    function generateGeneralResponse(message) {
        const lower = message.toLowerCase();
        
        if (lower.includes('shadow ban') || lower.includes('shadowban')) {
            return "**Shadow banning** is when a platform limits your content's visibility without notifying you.\n\n" +
                   "**Signs you might be shadow banned:**\n" +
                   "• Sudden drop in engagement\n" +
                   "• Posts not appearing in hashtag searches\n" +
                   "• Replies hidden behind \"Show more\"\n\n" +
                   `**Example:** If ${DEMO_USERNAME} suddenly sees 90% less engagement, they might be shadow banned.\n\n` +
                   "Want me to check your account?";
        }
        
        if (lower.includes('fix') || lower.includes('recover') || lower.includes('appeal')) {
            return "**Shadow Ban Recovery:**\n\n" +
                   "1. **Stop posting** for 24-48 hours\n" +
                   "2. **Remove** potentially violating content\n" +
                   "3. **Check hashtags** - remove banned ones\n" +
                   "4. **Disable** automation tools\n\n" +
                   "**Pro tip:** Use our Resolution Center to generate professional appeal letters!";
        }
        
        if (lower.includes('price') || lower.includes('upgrade') || lower.includes('pro')) {
            return "**Plans:**\n\n" +
                   "• **Free:** 3 lookups/day\n" +
                   "• **Pro ($9/mo):** 25 lookups/month + AI Pro\n" +
                   "• **Agency ($29/mo):** Unlimited + client management\n\n" +
                   "[View Pricing](#pricing)";
        }
        
        if (lower.match(/^(hi|hey|hello|yo|sup)/)) {
            return `Hey there! 👋\n\nI'm ${CURRENT_CONFIG.title}, your shadow ban assistant.\n\n` +
                   "**I can help with:**\n" +
                   "• Checking accounts: \"check @username on Twitter\"\n" +
                   "• Explaining shadow bans\n" +
                   "• Recovery strategies\n\n" +
                   "What would you like to know?";
        }
        
        if (lower.includes('thank')) {
            return "You're welcome! 😊 Let me know if you need anything else.";
        }
        
        // Default
        return `I can help with shadow ban detection!\n\n` +
               `**Try:**\n` +
               `• "check @username on Twitter"\n` +
               `• "what is a shadow ban?"\n` +
               `• "how do I recover?"\n\n` +
               `What would you like to know?`;
    }
    
    // ==========================================================================
    // KEYBOARD HANDLER
    // ==========================================================================
    function initKeyboardHandler() {
        const input = document.getElementById('shadow-ai-input');
        const chat = document.getElementById('shadow-ai-chat');
        
        if (!input || !chat) return;
        
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
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                chat.classList.remove('keyboard-visible');
                if (document.activeElement === input) {
                    input.blur();
                }
            }, 300);
        });
    }
    
    // ==========================================================================
    // DEMO CHAT ANIMATION (Website only)
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
        
        function typewriterEffect(element, text, isUser, callback) {
            const words = text.split(' ');
            let currentWord = 0;
            let displayText = '';
            const speed = isUser ? 80 : 50;
            
            function typeNextWord() {
                if (currentWord < words.length) {
                    displayText += (currentWord > 0 ? ' ' : '') + words[currentWord];
                    
                    if (isUser) {
                        element.textContent = displayText;
                    } else {
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
                const typing = showDemoTypingIndicator();
                setTimeout(() => {
                    typing.remove();
                    addDemoMessageWithTypewriter(message, () => {
                        setTimeout(playNextMessage, message.delay || 800);
                    });
                }, 500 + Math.random() * 300);
            } else {
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
            setTimeout(playNextMessage, 100);
        }
        
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
        document.getElementById('try-ai-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            openChat();
        });
        
        document.getElementById('open-shadow-ai')?.addEventListener('click', (e) => {
            e.preventDefault();
            openChat();
        });
    }
    
    // ==========================================================================
    // PUBLIC API
    // ==========================================================================
    window.ShadowAI = {
        open: openChat,
        close: closeChat,
        toggle: toggleChat,
        getPageType: () => PAGE_TYPE,
        getConfig: () => CURRENT_CONFIG
    };
    
    // ==========================================================================
    // INIT
    // ==========================================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
