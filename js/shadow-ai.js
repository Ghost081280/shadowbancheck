/**
 * =============================================================================
 * SHADOW AI - UNIFIED CHATBOT v3.1
 * ShadowBanCheck.io - Website & Dashboard (Identical Behavior)
 * 
 * Features:
 * - Lookup counter (3 single lookups/day OR 1 power check/day)
 * - Message limit (20 general messages/day to prevent bot abuse)
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
        
        // Lookup limits (actual shadow ban checks)
        freeLookupsPerDay: 3,         // Single lookups (username, post, hashtag)
        freePowerCheckPerDay: 1,      // 3-in-1 Power Check (uses ALL daily lookups)
        proLookupsPerDay: 50,
        proPowerChecksPerDay: 25,
        
        // Message limits (general chat - prevents bot abuse)
        freeMessagesPerDay: 20,
        proMessagesPerDay: 200,
        
        // Storage keys
        lookupKey: 'shadowAI_lookups',
        messageKey: 'shadowAI_messages',
        powerCheckKey: 'shadowAI_usedPowerCheck',
        
        // Title based on context
        get title() {
            return this.isDashboard ? 'Shadow AI Pro' : 'Shadow AI';
        },
        
        // Tooltip text
        get tooltip() {
            return this.isDashboard ? 'Ask Shadow AI Pro' : 'Ask Shadow AI';
        },
        
        // Limits based on context
        get lookupLimit() {
            return this.isDashboard ? this.proLookupsPerDay : this.freeLookupsPerDay;
        },
        
        get messageLimit() {
            return this.isDashboard ? this.proMessagesPerDay : this.freeMessagesPerDay;
        }
    };
    
    // State
    let conversationHistory = [];
    let isTyping = false;
    let lookupsUsed = 0;
    let messagesUsed = 0;
    let usedPowerCheck = false;
    
    // ==========================================================================
    // LOOKUP & MESSAGE TRACKING
    // ==========================================================================
    function getStorageData(key) {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                const today = new Date().toDateString();
                if (parsed.date !== today) {
                    return { date: today, count: 0 };
                }
                return parsed;
            }
        } catch (e) {
            console.warn('Could not read storage data:', e);
        }
        return { date: new Date().toDateString(), count: 0 };
    }
    
    function saveStorageData(key, count) {
        try {
            localStorage.setItem(key, JSON.stringify({
                date: new Date().toDateString(),
                count: count
            }));
        } catch (e) {
            console.warn('Could not save storage data:', e);
        }
    }
    
    function getPowerCheckStatus() {
        try {
            const data = localStorage.getItem(CONFIG.powerCheckKey);
            if (data) {
                const parsed = JSON.parse(data);
                const today = new Date().toDateString();
                if (parsed.date !== today) {
                    return false; // New day, reset
                }
                return parsed.used;
            }
        } catch (e) {
            console.warn('Could not read power check status:', e);
        }
        return false;
    }
    
    function setPowerCheckUsed() {
        try {
            localStorage.setItem(CONFIG.powerCheckKey, JSON.stringify({
                date: new Date().toDateString(),
                used: true
            }));
            usedPowerCheck = true;
        } catch (e) {
            console.warn('Could not save power check status:', e);
        }
    }
    
    function updateUsageCounter() {
        const usage = document.getElementById('shadow-ai-usage');
        if (usage) {
            const lookupData = getStorageData(CONFIG.lookupKey);
            lookupsUsed = lookupData.count;
            usedPowerCheck = getPowerCheckStatus();
            
            if (usedPowerCheck) {
                usage.textContent = `Power Check used today`;
            } else {
                const remaining = CONFIG.lookupLimit - lookupsUsed;
                usage.textContent = `${remaining}/${CONFIG.lookupLimit} lookups left`;
            }
        }
    }
    
    function canDoLookup() {
        if (usedPowerCheck || getPowerCheckStatus()) return false;
        const data = getStorageData(CONFIG.lookupKey);
        return data.count < CONFIG.lookupLimit;
    }
    
    function canDoPowerCheck() {
        if (getPowerCheckStatus()) return false;
        const lookupData = getStorageData(CONFIG.lookupKey);
        return lookupData.count === 0; // Can only do power check if no single lookups used
    }
    
    function canSendMessage() {
        const data = getStorageData(CONFIG.messageKey);
        return data.count < CONFIG.messageLimit;
    }
    
    function incrementLookupCount() {
        const data = getStorageData(CONFIG.lookupKey);
        data.count++;
        saveStorageData(CONFIG.lookupKey, data.count);
        updateUsageCounter();
    }
    
    function incrementMessageCount() {
        const data = getStorageData(CONFIG.messageKey);
        data.count++;
        saveStorageData(CONFIG.messageKey, data.count);
    }
    
    // ==========================================================================
    // DETECT LOOKUP REQUESTS
    // ==========================================================================
    function isLookupRequest(message) {
        const lower = message.toLowerCase();
        
        // Patterns that indicate a lookup request
        const lookupPatterns = [
            // Direct check requests with username
            /@[a-zA-Z0-9_]+/,                           // @username
            /check\s+(my\s+)?(account|profile|username)/i,
            /am\s+i\s+(shadow\s*)?banned/i,
            /is\s+@?[a-zA-Z0-9_]+\s+(shadow\s*)?banned/i,
            
            // URL patterns
            /https?:\/\/(twitter|x|instagram|tiktok|reddit|facebook|youtube|linkedin|threads)/i,
            /check\s+(this\s+)?(post|url|link)/i,
            
            // Hashtag check requests
            /check\s+(these\s+)?hashtag/i,
            /are\s+(these\s+)?hashtag/i,
            /#[a-zA-Z0-9_]+.*#[a-zA-Z0-9_]+/,          // Multiple hashtags
            
            // Power check / 3-in-1 requests
            /power\s*check/i,
            /3[\s-]?in[\s-]?1/i,
            /full\s+(analysis|check|scan)/i
        ];
        
        return lookupPatterns.some(pattern => pattern.test(lower));
    }
    
    function isPowerCheckRequest(message) {
        const lower = message.toLowerCase();
        return /power\s*check/i.test(lower) || 
               /3[\s-]?in[\s-]?1/i.test(lower) || 
               /full\s+(analysis|check|scan)/i.test(lower);
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
                            <p class="copilot-usage" id="shadow-ai-usage">${CONFIG.lookupLimit}/${CONFIG.lookupLimit} lookups left</p>
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
        
        // Check if this is a lookup request
        const isLookup = isLookupRequest(message);
        const isPowerCheck = isPowerCheckRequest(message);
        
        // Check limits based on request type
        if (isPowerCheck) {
            if (!canDoPowerCheck()) {
                if (getPowerCheckStatus()) {
                    showLimitMessage("You've already used your daily Power Check. Try again tomorrow or upgrade to Pro!");
                } else {
                    showLimitMessage("Power Check requires no prior lookups today. You've already used single lookups. Try again tomorrow!");
                }
                return;
            }
        } else if (isLookup) {
            if (!canDoLookup()) {
                if (usedPowerCheck || getPowerCheckStatus()) {
                    showLimitMessage("You've used your Power Check today, which includes all lookups. Try again tomorrow or upgrade to Pro!");
                } else {
                    showLimitMessage(`You've used all ${CONFIG.lookupLimit} lookups for today. Upgrade to Pro for more!`);
                }
                return;
            }
        } else {
            // General chat message
            if (!canSendMessage()) {
                showLimitMessage(`You've reached the daily chat limit (${CONFIG.messageLimit} messages). Upgrade to Pro for unlimited chat!`);
                return;
            }
        }
        
        if (isTyping) return;
        
        // Add user message
        addMessage(message, 'user');
        input.value = '';
        
        // Increment appropriate counter
        if (isPowerCheck) {
            setPowerCheckUsed();
        } else if (isLookup) {
            incrementLookupCount();
        } else {
            incrementMessageCount();
        }
        
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
            const response = generateResponse(message, isLookup, isPowerCheck);
            addMessage(response, 'assistant');
            conversationHistory.push({ role: 'assistant', content: response });
            
            input.disabled = false;
            document.getElementById('shadow-ai-send').disabled = false;
            isTyping = false;
        }, isLookup ? 2000 + Math.random() * 1000 : 800 + Math.random() * 500);
    }
    
    function showLimitMessage(text) {
        const messagesContainer = document.getElementById('shadow-ai-messages');
        if (!messagesContainer) return;
        
        // Remove existing limit messages
        messagesContainer.querySelectorAll('.limit-message').forEach(el => el.remove());
        
        const limitDiv = document.createElement('div');
        limitDiv.className = 'chat-message assistant-message limit-message';
        limitDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">🤖</div>
                <div class="message-text">
                    <strong>⏰ Daily Limit Reached</strong><br><br>
                    ${text}<br><br>
                    <a href="#pricing" onclick="document.getElementById('shadow-ai-chat').classList.remove('open');">View Pricing →</a>
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
            // Bold **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic _text_
            .replace(/_(.*?)_/g, '<em>$1</em>')
            // Links [text](url) - convert to clickable links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="chat-link" target="_blank">$1</a>')
            // Line breaks
            .replace(/\n/g, '<br>');
    }
    
    // Get platform info from platforms.js
    function getPlatformData() {
        if (typeof PLATFORMS !== 'undefined') return PLATFORMS;
        if (typeof window.platformData !== 'undefined') return window.platformData;
        // Fallback
        return [
            { id: 'twitter', name: 'Twitter/X', icon: '𝕏', status: 'live' },
            { id: 'reddit', name: 'Reddit', icon: '🔴', status: 'live' }
        ];
    }
    
    function getLivePlatforms() {
        return getPlatformData().filter(p => p.status === 'live');
    }
    
    function getPlatformByIdOrName(identifier) {
        const platforms = getPlatformData();
        const lower = identifier.toLowerCase();
        return platforms.find(p => 
            p.id === lower || 
            p.name.toLowerCase().includes(lower) ||
            (lower.includes('twitter') && p.id === 'twitter') ||
            (lower.includes('x.com') && p.id === 'twitter')
        );
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
    // RESPONSE GENERATION (Placeholder - replace with API)
    // ==========================================================================
    function generateResponse(message, isLookup = false, isPowerCheck = false) {
        const lower = message.toLowerCase();
        
        // Handle Power Check requests
        if (isPowerCheck) {
            return generatePowerCheckResponse(message);
        }
        
        // Handle lookup requests (username, post URL, hashtag)
        if (isLookup) {
            return generateLookupResponse(message);
        }
        
        // General chat responses - use platforms.js
        const livePlatforms = getLivePlatforms();
        const platformList = livePlatforms.map(p => `${p.icon} **${p.name}**`).join('\n');
        
        if (lower.includes('shadow ban') || lower.includes('shadowban')) {
            return "Shadow banning is when a platform limits your content's visibility without notifying you. Your posts appear normal to you, but others can't see them in searches, feeds, or recommendations.\n\nI can help you check if you're affected! Just tell me:\n• Your **@username** and which **platform** to check\n• Or paste a **post URL**";
        }
        
        if (lower.includes('how') && (lower.includes('check') || lower.includes('test'))) {
            return "To check for a shadow ban, I analyze:\n\n✓ Search visibility\n✓ Engagement patterns\n✓ Hashtag reach\n✓ Profile accessibility\n\nJust tell me your **@username** and which **platform** (Twitter/X or Reddit), and I'll give you a quick summary!\n\nWant detailed analysis? Use our [full checker tools](checker.html).";
        }
        
        if (lower.includes('what') && lower.includes('platform')) {
            return `I currently support:\n\n${platformList}\n\nMore platforms coming soon! Which one would you like to check?`;
        }
        
        if (lower.includes('fix') || lower.includes('recover') || lower.includes('appeal')) {
            return "Here are general recovery strategies:\n\n1. **Take a break** - Stop posting for 24-48 hours\n2. **Review content** - Remove anything potentially violating guidelines\n3. **Avoid spam behavior** - Don't mass-like, follow, or use bots\n4. **Diversify hashtags** - Don't use the same ones repeatedly\n5. **Engage authentically** - Focus on genuine interactions\n\nWant platform-specific advice? Tell me which platform!";
        }
        
        if (lower.includes('price') || lower.includes('cost') || lower.includes('pro') || lower.includes('upgrade') || lower.includes('premium')) {
            return "**Shadow AI Pro** gives you:\n\n✓ 50 lookups/day (vs 3 free)\n✓ 25 Power Checks/day\n✓ Detailed analysis in chat\n✓ Priority processing\n✓ Personalized recovery strategies\n\n[View Pro Plans](index.html#pricing)";
        }
        
        if (lower.includes('power check') || lower.includes('3-in-1') || lower.includes('3 in 1')) {
            return "⚡ **Power Check** is our 3-in-1 analysis that checks:\n\n• Account health\n• Post visibility\n• Hashtag status\n\nIt uses your entire daily lookup allowance but gives you a complete picture!\n\nTo run a Power Check, say: **\"power check @username on Twitter\"** or paste a post URL.";
        }
        
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return `Hey there! 👋 I'm Shadow AI, your shadow ban detection assistant.\n\n**What I can do:**\n• Check accounts: \"check @username on Twitter\"\n• Check posts: paste any post URL\n• Check hashtags: \"are #fitness #health safe?\"\n• Power Check (3-in-1): \"power check @username\"\n\n**Currently supporting:** ${livePlatforms.map(p => p.icon).join(' ')}\n\nWhat would you like to check?`;
        }
        
        if (lower.includes('thank')) {
            return "You're welcome! 😊 Let me know if you need anything else.\n\nWant more lookups? [Check out Pro](index.html#pricing)";
        }
        
        // Default helpful response
        return `I can help with shadow ban detection!\n\n**Quick commands:**\n• \"check @username on Twitter\"\n• \"check @username on Reddit\"\n• Paste a post URL\n• \"power check @username\" (3-in-1)\n\n**Supporting:** ${livePlatforms.map(p => `${p.icon} ${p.name}`).join(', ')}\n\nWhat would you like to check?`;
    }
    
    function generateLookupResponse(message) {
        const lower = message.toLowerCase();
        const livePlatforms = getLivePlatforms();
        
        // Check for username
        const usernameMatch = message.match(/@([a-zA-Z0-9_]+)/);
        if (usernameMatch) {
            // Check if platform is specified
            const platform = detectPlatformFromMessage(message);
            if (!platform) {
                // Ask which platform
                const platformOptions = livePlatforms.map(p => `${p.icon} ${p.name}`).join('\n');
                return `I found **@${usernameMatch[1]}** - which platform should I check?\n\n${platformOptions}\n\nJust say \"Twitter\" or \"Reddit\" and I'll run the check!`;
            }
            return generateUsernameCheckResponse(usernameMatch[1], message, platform);
        }
        
        // Check for URL - platform detected from URL
        const urlMatch = message.match(/https?:\/\/[^\s]+/i);
        if (urlMatch) {
            return generatePostCheckResponse(urlMatch[0]);
        }
        
        // Check for hashtags
        const hashtags = message.match(/#[a-zA-Z0-9_]+/g);
        if (hashtags && hashtags.length > 0) {
            // Check if platform is specified for hashtag check
            const platform = detectPlatformFromMessage(message);
            if (!platform) {
                const platformOptions = livePlatforms.map(p => `${p.icon} ${p.name}`).join('\n');
                return `I found hashtags: ${hashtags.join(' ')}\n\nWhich platform should I check them for?\n\n${platformOptions}\n\nJust say \"Twitter\" or \"Reddit\"!`;
            }
            return generateHashtagCheckResponse(hashtags, platform);
        }
        
        // Generic check request
        return "I'd be happy to run a check! Please provide:\n\n• A **@username** + platform (e.g., \"@yourname on Twitter\")\n• A **post URL** from Twitter or Reddit\n• Or **#hashtags** + platform\n\nWhat would you like me to analyze?";
    }
    
    function detectPlatformFromMessage(message) {
        const lower = message.toLowerCase();
        const livePlatforms = getLivePlatforms();
        
        for (const platform of livePlatforms) {
            if (lower.includes(platform.id) || lower.includes(platform.name.toLowerCase())) {
                return platform;
            }
            // Special handling for "x" vs "twitter"
            if (platform.id === 'twitter' && (lower.includes('twitter') || lower.includes(' x ') || lower.includes(' x.com'))) {
                return platform;
            }
        }
        return null;
    }
    
    function generateUsernameCheckResponse(username, fullMessage, platform = null) {
        // Use provided platform or try to detect
        if (!platform) {
            platform = detectPlatformFromMessage(fullMessage);
        }
        
        // Fallback to Twitter if still no platform (shouldn't happen with new flow)
        if (!platform) {
            const livePlatforms = getLivePlatforms();
            platform = livePlatforms[0] || { name: 'Twitter/X', icon: '𝕏', id: 'twitter' };
        }
        
        // Generate mock results
        const probability = Math.floor(Math.random() * 35) + 5;
        const status = probability < 15 ? 'LOW RISK ✅' : probability < 30 ? 'MODERATE RISK ⚠️' : 'HIGH RISK 🚨';
        
        return `${platform.icon} **${platform.name} Account Check: @${username}**\n\n` +
               `**Shadow Ban Probability: ${probability}%** (${status})\n\n` +
               `**Quick Summary:**\n` +
               `✓ Search visibility: ${Math.random() > 0.3 ? 'Visible' : 'Reduced'}\n` +
               `✓ Profile accessibility: ${Math.random() > 0.2 ? 'Normal' : 'Limited'}\n` +
               `✓ Engagement analysis: ${Math.random() > 0.4 ? 'Healthy' : 'Below average'}\n` +
               `✓ Content flags: ${Math.random() > 0.8 ? '1 warning' : 'None detected'}\n\n` +
               `This used 1 of your ${CONFIG.lookupLimit} daily lookups.\n\n` +
               `**Want detailed analysis?** Use our [full checker](checker.html?platform=${platform.id}) for comprehensive results with recovery tips!\n\n` +
               `**Pro users** get detailed analysis right here in chat. [Learn more](index.html#pricing)`;
    }
    
    function generatePostCheckResponse(url) {
        // Detect platform from URL using platforms.js
        const platforms = getPlatformData();
        let platform = null;
        
        if (url.includes('twitter.com') || url.includes('x.com')) {
            platform = platforms.find(p => p.id === 'twitter');
        } else if (url.includes('reddit.com')) {
            platform = platforms.find(p => p.id === 'reddit');
        } else if (url.includes('instagram.com')) {
            platform = platforms.find(p => p.id === 'instagram');
        } else if (url.includes('tiktok.com')) {
            platform = platforms.find(p => p.id === 'tiktok');
        }
        
        // Check if platform is supported (live)
        if (!platform || platform.status !== 'live') {
            const detectedName = platform ? platform.name : 'this platform';
            return `I detected a link from **${detectedName}**, but it's not supported yet.\n\n**Currently supporting:**\n${getLivePlatforms().map(p => `${p.icon} ${p.name}`).join('\n')}\n\nPaste a Twitter/X or Reddit URL to check!`;
        }
        
        const probability = Math.floor(Math.random() * 30) + 5;
        const status = probability < 15 ? 'VISIBLE ✅' : probability < 25 ? 'REDUCED REACH ⚠️' : 'SUPPRESSED 🚨';
        
        return `${platform.icon} **Post Visibility Check**\n\n` +
               `**Platform:** ${platform.name}\n` +
               `**Suppression Probability: ${probability}%** (${status})\n\n` +
               `**Quick Analysis:**\n` +
               `✓ Search indexing: ${Math.random() > 0.3 ? 'Indexed' : 'Not indexed'}\n` +
               `✓ Feed visibility: ${Math.random() > 0.2 ? 'Normal' : 'Reduced'}\n` +
               `✓ Hashtag reach: ${Math.random() > 0.4 ? 'Good' : 'Limited'}\n` +
               `✓ Engagement rate: ${Math.random() > 0.3 ? 'Normal' : 'Below expected'}\n\n` +
               `This used 1 of your ${CONFIG.lookupLimit} daily lookups.\n\n` +
               `**Want full analysis?** Use our [Post URL Checker](post-checker.html) for detailed breakdown!\n\n` +
               `[Upgrade to Pro](index.html#pricing) for detailed analysis in chat.`;
    }
    
    function generateHashtagCheckResponse(hashtags, platform = null) {
        // Use provided platform or first live platform
        if (!platform) {
            platform = getLivePlatforms()[0];
        }
        
        const cleanHashtags = hashtags.map(h => h.replace('#', ''));
        const results = cleanHashtags.map(tag => {
            const rand = Math.random();
            if (rand < 0.15) return { tag, status: 'BANNED 🚫', class: 'banned' };
            if (rand < 0.35) return { tag, status: 'RESTRICTED ⚠️', class: 'restricted' };
            return { tag, status: 'SAFE ✅', class: 'safe' };
        });
        
        const banned = results.filter(r => r.class === 'banned').length;
        const restricted = results.filter(r => r.class === 'restricted').length;
        const safe = results.filter(r => r.class === 'safe').length;
        
        let summary = banned > 0 ? '🚨 **Warning:** Some hashtags are problematic!' : 
                      restricted > 0 ? '⚠️ **Caution:** Some hashtags have restrictions.' :
                      '✅ **All clear!** Your hashtags look safe.';
        
        let response = `${platform.icon} **Hashtag Check for ${platform.name}**\n\n${summary}\n\n`;
        response += `**Summary:** ${safe} Safe, ${restricted} Restricted, ${banned} Banned\n\n`;
        response += `**Details:**\n`;
        results.forEach(r => {
            response += `• #${r.tag}: ${r.status}\n`;
        });
        response += `\nThis used 1 of your ${CONFIG.lookupLimit} daily lookups.\n\n`;
        response += `**Want full analysis?** Use our [Hashtag Checker](hashtag-checker.html) for comprehensive results!\n\n`;
        response += `[Upgrade to Pro](index.html#pricing) for detailed analysis in chat.`;
        
        return response;
    }
    
    function generatePowerCheckResponse(message) {
        // Try to extract URL or detect platform from message
        const urlMatch = message.match(/https?:\/\/[^\s]+/i);
        const platforms = getPlatformData();
        let platform = null;
        
        // Try to detect platform from URL
        if (urlMatch) {
            const url = urlMatch[0];
            if (url.includes('twitter.com') || url.includes('x.com')) {
                platform = platforms.find(p => p.id === 'twitter');
            } else if (url.includes('reddit.com')) {
                platform = platforms.find(p => p.id === 'reddit');
            }
        }
        
        // Try to detect platform from message text
        if (!platform) {
            platform = detectPlatformFromMessage(message);
        }
        
        // Fallback to first live platform
        if (!platform) {
            platform = getLivePlatforms()[0] || { name: 'Twitter/X', icon: '𝕏', id: 'twitter' };
        }
        
        // Check if platform is supported
        if (platform.status !== 'live') {
            return `⚡ **Power Check** isn't available for ${platform.name} yet.\n\n**Currently supporting:**\n${getLivePlatforms().map(p => `${p.icon} ${p.name}`).join('\n')}\n\nTry: \"power check @username on Twitter\"`;
        }
        
        const accountProb = Math.floor(Math.random() * 25) + 5;
        const postProb = Math.floor(Math.random() * 30) + 5;
        const hashtagProb = Math.floor(Math.random() * 20) + 5;
        const overallProb = Math.floor((accountProb + postProb + hashtagProb) / 3);
        
        const status = overallProb < 15 ? 'LOW RISK ✅' : overallProb < 25 ? 'MODERATE RISK ⚠️' : 'HIGH RISK 🚨';
        
        return `⚡ **Power Check Complete** (3-in-1 Analysis)\n\n` +
               `${platform.icon} **Platform:** ${platform.name}\n` +
               `**Overall Shadow Ban Probability: ${overallProb}%** (${status})\n\n` +
               `**━━━ Breakdown ━━━**\n\n` +
               `👤 **Account Health:** ${accountProb}%\n` +
               `• Profile visibility: ${accountProb < 20 ? 'Normal' : 'Reduced'}\n` +
               `• Search appearance: ${accountProb < 15 ? 'Good' : 'Limited'}\n\n` +
               `📝 **Post Visibility:** ${postProb}%\n` +
               `• Feed distribution: ${postProb < 20 ? 'Normal' : 'Suppressed'}\n` +
               `• Engagement rate: ${postProb < 25 ? 'Healthy' : 'Below average'}\n\n` +
               `#️⃣ **Hashtag Status:** ${hashtagProb}%\n` +
               `• All hashtags: ${hashtagProb < 15 ? 'Safe' : 'Some restrictions'}\n\n` +
               `**━━━━━━━━━━━━━━━━**\n\n` +
               `This is a quick summary. Power Check uses your entire daily lookup allowance.\n\n` +
               `**Want detailed analysis + recovery tips?** Use our [full 3-in-1 Power Check](index.html#power-check) or [upgrade to Pro](index.html#pricing) for in-chat details!`;
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
