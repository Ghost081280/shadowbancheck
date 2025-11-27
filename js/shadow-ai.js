/**
 * =============================================================================
 * SHADOW AI - WEBSITE CHATBOT v4.0
 * ShadowBanCheck.io - Website Version (Not Dashboard/Admin)
 * 
 * NEW IN v4.0:
 * - 3 questions/day (replaces "lookups" concept)
 * - Reads from window.latestScanResults to analyze free scan results
 * - Recovery/dispute strategies require Shadow AI Pro upgrade
 * - After 3rd question, prompts to upgrade for more questions
 * - Demo chat animation preserved
 * =============================================================================
 */

(function() {
    'use strict';
    
    // ==========================================================================
    // CONFIGURATION
    // ==========================================================================
    const CONFIG = {
        // Questions per day for free users
        freeQuestionsPerDay: 3,
        
        // Storage key for tracking questions
        questionsKey: 'shadowAI_questions_v4',
        
        // Pricing page URL
        pricingUrl: '#pricing',
        
        // Title
        title: 'Shadow AI',
        tooltip: 'Ask Shadow AI'
    };
    
    // State
    let conversationHistory = [];
    let isTyping = false;
    let questionsUsed = 0;
    
    // ==========================================================================
    // QUESTION TRACKING
    // ==========================================================================
    function getQuestionsData() {
        try {
            const data = localStorage.getItem(CONFIG.questionsKey);
            if (data) {
                const parsed = JSON.parse(data);
                const today = new Date().toDateString();
                if (parsed.date !== today) {
                    // New day, reset counter
                    return { date: today, count: 0 };
                }
                return parsed;
            }
        } catch (e) {
            console.warn('Could not read questions data:', e);
        }
        return { date: new Date().toDateString(), count: 0 };
    }
    
    function saveQuestionsData(count) {
        try {
            localStorage.setItem(CONFIG.questionsKey, JSON.stringify({
                date: new Date().toDateString(),
                count: count
            }));
        } catch (e) {
            console.warn('Could not save questions data:', e);
        }
    }
    
    function getQuestionsRemaining() {
        const data = getQuestionsData();
        return Math.max(0, CONFIG.freeQuestionsPerDay - data.count);
    }
    
    function canAskQuestion() {
        return getQuestionsRemaining() > 0;
    }
    
    function incrementQuestionCount() {
        const data = getQuestionsData();
        data.count++;
        saveQuestionsData(data.count);
        questionsUsed = data.count;
        updateUsageDisplay();
    }
    
    function updateUsageDisplay() {
        const usage = document.getElementById('shadow-ai-usage');
        if (usage) {
            const remaining = getQuestionsRemaining();
            usage.textContent = `${remaining}/${CONFIG.freeQuestionsPerDay} questions left today`;
        }
    }
    
    // ==========================================================================
    // ACCESS SCAN RESULTS FROM MAIN.JS
    // ==========================================================================
    function getScanResults() {
        // First check window.latestScanResults (set by main.js)
        if (window.latestScanResults) {
            return window.latestScanResults;
        }
        
        // Fallback: try localStorage
        try {
            const stored = localStorage.getItem('shadowban_latest_results');
            if (stored) {
                const results = JSON.parse(stored);
                // Check if results are from today (within 24 hours)
                if (results.timestamp && (Date.now() - results.timestamp) < 24 * 60 * 60 * 1000) {
                    return results;
                }
            }
        } catch (e) {
            console.warn('Could not load stored results:', e);
        }
        
        return null;
    }
    
    function getSearchType() {
        if (window.lastSearchType) return window.lastSearchType;
        
        try {
            const storedType = localStorage.getItem('shadowban_last_search_type');
            if (storedType) return storedType;
        } catch (e) {}
        
        // Infer from results
        const results = getScanResults();
        if (results) {
            return results.searchType || 'power';
        }
        
        return null;
    }
    
    function hasScanResults() {
        return getScanResults() !== null;
    }
    
    function getSearchTypeFriendlyName(type) {
        const names = {
            'power': 'Power Check (3-in-1)',
            'account': 'Account Check',
            'post': 'Post URL Check',
            'hashtag': 'Hashtag Check'
        };
        return names[type] || 'scan';
    }
    
    // ==========================================================================
    // DETECT REQUEST TYPES
    // ==========================================================================
    function isRecoveryRequest(message) {
        const lower = message.toLowerCase();
        const recoveryKeywords = [
            'recover', 'recovery', 'fix', 'appeal', 'dispute', 
            'remove ban', 'get unbanned', 'lift ban', 'unban',
            'what should i do', 'how do i fix', 'help me fix',
            'strategy', 'strategies', 'action plan', 'next steps',
            'how to get', 'how can i get', 'restore', 'reinstate'
        ];
        return recoveryKeywords.some(kw => lower.includes(kw));
    }
    
    function isAskingAboutResults(message) {
        const lower = message.toLowerCase();
        const resultsKeywords = [
            'my results', 'my scan', 'my score', 'my check',
            'what does', 'explain', 'mean', 'why',
            'breakdown', 'details', 'tell me about',
            'analyze', 'analysis', 'understand'
        ];
        return resultsKeywords.some(kw => lower.includes(kw));
    }
    
    // ==========================================================================
    // INITIALIZE
    // ==========================================================================
    function init() {
        console.log('🤖 Shadow AI v4.0 Initializing (Website - Questions Mode)...');
        
        createWidget();
        initDemoChat();
        initExternalTriggers();
        
        // Initialize question count from storage
        questionsUsed = getQuestionsData().count;
        
        console.log('✅ Shadow AI initialized');
    }
    
    // ==========================================================================
    // CREATE WIDGET DYNAMICALLY
    // ==========================================================================
    function createWidget() {
        const widget = document.createElement('div');
        widget.className = 'shadow-ai-container';
        widget.id = 'shadow-ai-container';
        
        const remaining = getQuestionsRemaining();
        
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
                            <p class="copilot-usage" id="shadow-ai-usage">${remaining}/${CONFIG.freeQuestionsPerDay} questions left today</p>
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
                           placeholder="Ask about your results..." 
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
        
        // Update usage display
        updateUsageDisplay();
        
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
        const results = getScanResults();
        const searchType = getSearchType();
        const remaining = getQuestionsRemaining();
        
        let greeting;
        
        if (results) {
            // User has scan results - ask if they want help with them
            const typeName = getSearchTypeFriendlyName(searchType);
            
            if (searchType === 'power') {
                greeting = `👋 Hi! I noticed you just ran a **${typeName}** on **${results.platform.name}** for **${results.username}**.\n\n` +
                          `Your overall shadow ban probability was **${results.scores.overall}%**.\n\n` +
                          `**Would you like me to answer questions about your results?**\n\n` +
                          `I can explain what each score means, why certain factors were flagged, and give you tips for improving visibility.\n\n` +
                          `_You have **${remaining} free questions** today._`;
            } else if (searchType === 'account') {
                greeting = `👋 Hi! I see you just ran an **Account Check** for **${results.username}** on **${results.platform.name}**.\n\n` +
                          `Your account risk score was **${results.scores.account}%**.\n\n` +
                          `**Would you like me to explain your results?**\n\n` +
                          `_You have **${remaining} free questions** today._`;
            } else if (searchType === 'post') {
                greeting = `👋 Hi! I see you just ran a **Post URL Check** on **${results.platform.name}**.\n\n` +
                          `Your post visibility score was **${results.scores.post}%**.\n\n` +
                          `**Would you like me to explain what this means?**\n\n` +
                          `_You have **${remaining} free questions** today._`;
            } else if (searchType === 'hashtag') {
                greeting = `👋 Hi! I see you just ran a **Hashtag Check** on **${results.platform.name}**.\n\n` +
                          `Your hashtag health score was **${results.scores.hashtag}%**.\n\n` +
                          `**Would you like me to explain which hashtags are safe vs. risky?**\n\n` +
                          `_You have **${remaining} free questions** today._`;
            } else {
                greeting = `👋 Hi! I can see you ran a scan on **${results.platform.name}** for **${results.username}**.\n\n` +
                          `**Would you like me to answer questions about your results?**\n\n` +
                          `_You have **${remaining} free questions** today._`;
            }
        } else {
            // No scan results yet - show options
            greeting = `👋 Hi! I'm Shadow AI, your shadow ban detection assistant.\n\n` +
                      `**💡 Pro Tip:** Run a [Power Check (3-in-1)](#power-check) first for the most comprehensive analysis!\n\n` +
                      `**Or check individually (3 free/day):**\n` +
                      `• [👤 Account Check](checker.html) - Is your account restricted?\n` +
                      `• [📝 Post URL Check](post-checker.html) - Is a specific post hidden?\n` +
                      `• [#️⃣ Hashtag Check](hashtag-checker.html) - Are your hashtags safe?\n\n` +
                      `Once you run a check, come back and I can analyze your specific results!\n\n` +
                      `_You have **${remaining} free questions** today._`;
        }
        
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
        
        // Check if this requires Pro (recovery/dispute strategies)
        if (isRecoveryRequest(message)) {
            addMessage(message, 'user');
            input.value = '';
            showProRequiredMessage('recovery');
            return;
        }
        
        // Check question limit
        if (!canAskQuestion()) {
            addMessage(message, 'user');
            input.value = '';
            showLimitReachedMessage();
            return;
        }
        
        if (isTyping) return;
        
        // Add user message
        addMessage(message, 'user');
        input.value = '';
        
        // Increment question count
        incrementQuestionCount();
        
        // Add to history
        conversationHistory.push({ role: 'user', content: message });
        
        // Show typing indicator
        showTypingIndicator();
        isTyping = true;
        
        // Disable input
        input.disabled = true;
        document.getElementById('shadow-ai-send').disabled = true;
        
        // Generate response
        setTimeout(() => {
            hideTypingIndicator();
            const response = generateResponse(message);
            addMessage(response, 'assistant');
            conversationHistory.push({ role: 'assistant', content: response });
            
            input.disabled = false;
            document.getElementById('shadow-ai-send').disabled = false;
            isTyping = false;
            
            // Check if this was their last question
            checkAndShowUpgradePrompt();
        }, 800 + Math.random() * 500);
    }
    
    function showLimitReachedMessage() {
        const messagesContainer = document.getElementById('shadow-ai-messages');
        if (!messagesContainer) return;
        
        const limitDiv = document.createElement('div');
        limitDiv.className = 'chat-message assistant-message limit-message';
        limitDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">🤖</div>
                <div class="message-text">
                    <strong>⏰ Daily Limit Reached</strong><br><br>
                    You've used all 3 free questions for today!<br><br>
                    <strong>Want unlimited questions?</strong><br>
                    Upgrade to <strong>Shadow AI Pro</strong> for unlimited questions, detailed recovery strategies, and personalized action plans.<br><br>
                    <a href="${CONFIG.pricingUrl}" class="chat-link" onclick="document.getElementById('shadow-ai-chat')?.classList.add('hidden');">View Pro Plans →</a>
                </div>
            </div>
        `;
        messagesContainer.appendChild(limitDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function showProRequiredMessage(type) {
        const messagesContainer = document.getElementById('shadow-ai-messages');
        if (!messagesContainer) return;
        
        let content = '';
        
        if (type === 'recovery') {
            content = `
                <strong>🔒 Shadow AI Pro Feature</strong><br><br>
                Recovery strategies, dispute assistance, and personalized action plans require <strong>Shadow AI Pro</strong>.<br><br>
                <strong>With Pro you get:</strong><br>
                ✓ Unlimited questions<br>
                ✓ Step-by-step recovery strategies<br>
                ✓ Platform-specific dispute templates<br>
                ✓ Personalized action plans<br>
                ✓ Direct analysis of your results<br><br>
                <a href="${CONFIG.pricingUrl}" class="chat-link" onclick="document.getElementById('shadow-ai-chat')?.classList.add('hidden');">Unlock Shadow AI Pro →</a>
            `;
        }
        
        const proDiv = document.createElement('div');
        proDiv.className = 'chat-message assistant-message pro-required-message';
        proDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">🤖</div>
                <div class="message-text">${content}</div>
            </div>
        `;
        messagesContainer.appendChild(proDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function checkAndShowUpgradePrompt() {
        const remaining = getQuestionsRemaining();
        
        // Show upgrade prompt after last question
        if (remaining === 0) {
            setTimeout(() => {
                addMessage(
                    `💡 **That was your last free question today!**\n\n` +
                    `Want unlimited questions + recovery strategies?\n\n` +
                    `[Upgrade to Shadow AI Pro](${CONFIG.pricingUrl}) for full access.`,
                    'assistant'
                );
            }, 1500);
        }
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
            // Links [text](url)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="chat-link" target="_blank">$1</a>')
            // Line breaks
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
    // RESPONSE GENERATION
    // ==========================================================================
    function generateResponse(message) {
        const lower = message.toLowerCase();
        const results = getScanResults();
        const remaining = getQuestionsRemaining();
        
        // If asking about their results and we have them
        if (isAskingAboutResults(message) && results) {
            return generateResultsAnalysis(message, results);
        }
        
        // Questions about specific scores
        if (results && (lower.includes('score') || lower.includes('percent') || lower.includes('%'))) {
            return generateScoreExplanation(message, results);
        }
        
        // Questions about hashtags
        if (results && (lower.includes('hashtag') || lower.includes('#'))) {
            return generateHashtagAnalysis(results);
        }
        
        // Questions about account
        if (results && (lower.includes('account') || lower.includes('profile'))) {
            return generateAccountAnalysis(results);
        }
        
        // Questions about post
        if (results && (lower.includes('post') || lower.includes('visibility'))) {
            return generatePostAnalysis(results);
        }
        
        // General shadow ban questions
        if (lower.includes('shadow ban') || lower.includes('shadowban')) {
            return generateShadowBanExplanation();
        }
        
        // What can you do / help
        if (lower.includes('what can you') || lower.includes('help')) {
            return generateHelpResponse(results);
        }
        
        // Greetings
        if (lower.match(/^(hi|hey|hello|howdy)/)) {
            return generateGreeting(results, remaining);
        }
        
        // Thanks
        if (lower.includes('thank')) {
            return `You're welcome! 😊\n\nYou have **${remaining} questions** remaining today. Let me know if you have more questions about your results!`;
        }
        
        // Pricing questions
        if (lower.includes('price') || lower.includes('cost') || lower.includes('pro') || lower.includes('upgrade')) {
            return `**Shadow AI Pro** includes:\n\n` +
                   `✓ Unlimited questions per day\n` +
                   `✓ Recovery & dispute strategies\n` +
                   `✓ Personalized action plans\n` +
                   `✓ Platform-specific advice\n` +
                   `✓ Priority support\n\n` +
                   `[View Pro Plans](${CONFIG.pricingUrl})`;
        }
        
        // Default response
        if (results) {
            const searchType = getSearchType();
            const typeName = getSearchTypeFriendlyName(searchType);
            return `I'm here to help analyze your **${typeName}** results!\n\n` +
                   `Your **${results.platform.name}** scan showed a **${results.scores.overall}%** shadow ban probability.\n\n` +
                   `Try asking me:\n` +
                   `• "What does my score mean?"\n` +
                   `• "Why are my hashtags flagged?"\n` +
                   `• "Is my account okay?"\n\n` +
                   `_${remaining} questions remaining today._`;
        } else {
            return `I can help you understand shadow banning and analyze your scan results!\n\n` +
                   `**💡 Pro Tip:** Run a [Power Check (3-in-1)](#power-check) for the most comprehensive analysis!\n\n` +
                   `**Or check individually (3 free/day):**\n` +
                   `• [👤 Account Check](checker.html)\n` +
                   `• [📝 Post URL Check](post-checker.html)\n` +
                   `• [#️⃣ Hashtag Check](hashtag-checker.html)\n\n` +
                   `Or ask me general questions like:\n` +
                   `• "What is a shadow ban?"\n` +
                   `• "How do shadow bans work?"\n\n` +
                   `_${remaining} questions remaining today._`;
        }
    }
    
    function generateResultsAnalysis(message, results) {
        const overall = results.scores.overall;
        let riskLevel, interpretation;
        
        if (overall < 25) {
            riskLevel = 'LOW';
            interpretation = 'Your account appears to be in good standing with minimal restrictions detected.';
        } else if (overall < 50) {
            riskLevel = 'MODERATE';
            interpretation = 'Some potential restrictions detected. This could be temporary or platform-specific.';
        } else if (overall < 75) {
            riskLevel = 'HIGH';
            interpretation = 'Multiple signals indicate your content may be restricted. Visibility is likely reduced.';
        } else {
            riskLevel = 'CRITICAL';
            interpretation = 'Strong indicators of shadow ban detected. Your content is likely heavily restricted.';
        }
        
        return `📊 **Your Results Analysis**\n\n` +
               `**Platform:** ${results.platform.icon} ${results.platform.name}\n` +
               `**Account:** ${results.username}\n` +
               `**Overall Score:** ${overall}% (${riskLevel} Risk)\n\n` +
               `**What this means:**\n${interpretation}\n\n` +
               `**Breakdown:**\n` +
               `• Post Visibility: ${results.scores.post}%\n` +
               `• Account Status: ${results.scores.account}%\n` +
               `• Hashtag Health: ${results.scores.hashtag}%\n\n` +
               `Ask me about any specific area for more details!`;
    }
    
    function generateScoreExplanation(message, results) {
        const overall = results.scores.overall;
        
        return `📈 **Understanding Your Scores**\n\n` +
               `Your **${overall}% overall score** is calculated from three factors:\n\n` +
               `**1. Post Visibility (${results.scores.post}%)**\n` +
               `How visible your content is in feeds and search.\n\n` +
               `**2. Account Status (${results.scores.account}%)**\n` +
               `Whether your profile has restrictions applied.\n\n` +
               `**3. Hashtag Health (${results.scores.hashtag}%)**\n` +
               `If any hashtags you used are restricted.\n\n` +
               `_Lower scores = better. Higher scores = more likely restricted._\n\n` +
               `Want recovery tips? [Upgrade to Pro](${CONFIG.pricingUrl}) for personalized strategies.`;
    }
    
    function generateHashtagAnalysis(results) {
        if (!results.hashtags || results.hashtags.length === 0) {
            return `No hashtags were detected in your scanned post.\n\nHashtags can significantly impact reach. Want to check specific hashtags? Use our [Hashtag Checker](hashtag-checker.html).`;
        }
        
        const safe = results.hashtags.filter(h => h.status === 'safe');
        const warning = results.hashtags.filter(h => h.status === 'warning');
        const danger = results.hashtags.filter(h => h.status === 'danger');
        
        let response = `#️⃣ **Hashtag Analysis**\n\n`;
        response += `We detected **${results.hashtags.length} hashtags** in your post:\n\n`;
        
        if (safe.length > 0) {
            response += `✅ **Safe (${safe.length}):** ${safe.map(h => h.tag).join(', ')}\n`;
        }
        if (warning.length > 0) {
            response += `⚠️ **Low-Reach (${warning.length}):** ${warning.map(h => h.tag).join(', ')}\n`;
        }
        if (danger.length > 0) {
            response += `🚫 **Restricted (${danger.length}):** ${danger.map(h => h.tag).join(', ')}\n`;
        }
        
        response += `\n**Hashtag Score: ${results.scores.hashtag}%**\n\n`;
        
        if (danger.length > 0 || warning.length > 0) {
            response += `_Some hashtags may be limiting your reach. Consider using different tags in future posts._`;
        } else {
            response += `_Your hashtags look good! They shouldn't be limiting your reach._`;
        }
        
        return response;
    }
    
    function generateAccountAnalysis(results) {
        const score = results.scores.account;
        let status, details;
        
        if (score < 25) {
            status = 'Good Standing';
            details = 'No significant account-level restrictions detected.';
        } else if (score < 50) {
            status = 'Minor Concerns';
            details = 'Some signals detected but likely not a full shadow ban.';
        } else {
            status = 'Potential Issues';
            details = 'Multiple signals indicate possible account restrictions.';
        }
        
        let response = `👤 **Account Status: ${results.username}**\n\n`;
        response += `**Status:** ${status}\n`;
        response += `**Score:** ${score}%\n\n`;
        response += `**Analysis:** ${details}\n\n`;
        response += `**Factors Checked:**\n`;
        
        results.factors.account.forEach(f => {
            const icon = f.status === 'good' ? '✓' : f.status === 'warning' ? '⚠' : '✗';
            response += `${icon} ${f.text}\n`;
        });
        
        return response;
    }
    
    function generatePostAnalysis(results) {
        const score = results.scores.post;
        
        let response = `📝 **Post Visibility Analysis**\n\n`;
        response += `**Score:** ${score}%\n\n`;
        response += `**Factors Checked:**\n`;
        
        results.factors.post.forEach(f => {
            const icon = f.status === 'good' ? '✓' : f.status === 'warning' ? '⚠' : '✗';
            response += `${icon} ${f.text}\n`;
        });
        
        response += `\n`;
        
        if (score < 30) {
            response += `_Your post appears to have normal visibility._`;
        } else if (score < 60) {
            response += `_Some visibility limitations may be affecting this post._`;
        } else {
            response += `_This post may have significantly reduced visibility._`;
        }
        
        return response;
    }
    
    function generateShadowBanExplanation() {
        return `🔍 **What is a Shadow Ban?**\n\n` +
               `A shadow ban (also called "stealth ban" or "ghost ban") is when a platform limits your content's visibility **without notifying you**.\n\n` +
               `**How it works:**\n` +
               `• Your posts look normal to YOU\n` +
               `• But others can't see them in search/feeds\n` +
               `• You get no notification or warning\n` +
               `• Engagement drops mysteriously\n\n` +
               `**Common causes:**\n` +
               `• Posting content flagged by algorithms\n` +
               `• Using restricted hashtags\n` +
               `• Spam-like behavior (mass liking/following)\n` +
               `• Receiving many reports\n\n` +
               `Run a [Power Check](#power-check) to see if you're affected!`;
    }
    
    function generateHelpResponse(results) {
        const searchType = getSearchType();
        
        if (results) {
            const typeName = getSearchTypeFriendlyName(searchType);
            return `I can help you understand your **${typeName}** results!\n\n` +
                   `**Try asking:**\n` +
                   `• "Explain my results"\n` +
                   `• "What does my score mean?"\n` +
                   `• "Tell me about my hashtags"\n` +
                   `• "Is my account okay?"\n\n` +
                   `**For recovery strategies**, you'll need [Shadow AI Pro](${CONFIG.pricingUrl}).`;
        } else {
            return `I can help you understand shadow banning!\n\n` +
                   `**💡 Pro Tip:** Run a [Power Check (3-in-1)](#power-check) for the most comprehensive analysis!\n\n` +
                   `**Or check individually (3 free/day):**\n` +
                   `• [👤 Account Check](checker.html)\n` +
                   `• [📝 Post URL Check](post-checker.html)\n` +
                   `• [#️⃣ Hashtag Check](hashtag-checker.html)\n\n` +
                   `Once you run a check, I can:\n` +
                   `• Explain what your results mean\n` +
                   `• Analyze your scores\n` +
                   `• Answer questions about shadow bans\n\n` +
                   `**For recovery strategies**, upgrade to [Shadow AI Pro](${CONFIG.pricingUrl}).`;
        }
    }
    
    function generateGreeting(results, remaining) {
        if (results) {
            return `Hey there! 👋\n\n` +
                   `I see you ran a scan on **${results.platform.name}** (${results.username}).\n\n` +
                   `Your shadow ban probability: **${results.scores.overall}%**\n\n` +
                   `What would you like to know about your results?\n\n` +
                   `_${remaining} questions remaining today._`;
        } else {
            return `Hey! 👋 I'm Shadow AI.\n\n` +
                   `Run a [Power Check](#power-check) first, then I can analyze your specific results!\n\n` +
                   `Or ask me general questions about shadow banning.\n\n` +
                   `_${remaining} questions remaining today._`;
        }
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
    }
    
    // ==========================================================================
    // DEMO CHAT ANIMATION
    // ==========================================================================
    function initDemoChat() {
        const demoChat = document.getElementById('demo-chat-messages');
        if (!demoChat) return;
        
        let hasPlayed = false;
        
        const chatSequence = [
            { type: 'user', text: "What does my 28% score mean?", delay: 800 },
            { type: 'ai', text: "Your 28% shadow ban probability is LOW RISK ✅\n\nThis means your content appears to have good visibility with no major restrictions detected.", delay: 1200 },
            { type: 'user', text: "Why was one hashtag flagged?", delay: 600 },
            { type: 'ai', text: "The hashtag #followforfollow is marked as \"low-reach\" because it's commonly associated with spam behavior.\n\nTip: Avoid engagement-bait hashtags for better reach!", delay: 1500 }
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
