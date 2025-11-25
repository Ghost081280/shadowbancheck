/* =============================================================================
   SHADOW AI DASHBOARD - v2.0
   ShadowBanCheck.io - Dashboard Chatbot with Plan Limits
   ============================================================================= */

(function() {
'use strict';

// ============================================
// CONFIGURATION
// ============================================
const PLAN_LIMITS = {
    'Free': 3,
    'Starter': 3,
    'Pro': 10,
    'Premium': 25,
    'AI Pro': 100,
    'Power': 200,
    'Unlimited': 500
};

const STORAGE_KEY = 'shadowai_dashboard_usage';

// ============================================
// STATE
// ============================================
let chatOpen = false;
let isTyping = false;
let conversationHistory = [];

// ============================================
// USAGE TRACKING
// ============================================
function getUsageData() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
        try {
            const data = JSON.parse(stored);
            // Reset if different day
            if (data.date !== today) {
                return { date: today, questionsUsed: 0 };
            }
            return data;
        } catch (e) {
            return { date: today, questionsUsed: 0 };
        }
    }
    
    return { date: today, questionsUsed: 0 };
}

function saveUsageData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function incrementUsage() {
    const data = getUsageData();
    data.questionsUsed++;
    saveUsageData(data);
    updateUsageDisplay();
    return data.questionsUsed;
}

function getCurrentUsage() {
    return getUsageData().questionsUsed;
}

function getPlanLimit() {
    // Try to get from userData (set by dashboard.js)
    if (window.userData && window.userData.plan && window.userData.plan.aiPerDay) {
        return window.userData.plan.aiPerDay;
    }
    // Fallback to plan name lookup
    if (window.userData && window.userData.plan && window.userData.plan.name) {
        return PLAN_LIMITS[window.userData.plan.name] || 3;
    }
    return 3; // Default free limit
}

function getPlanName() {
    if (window.userData && window.userData.plan && window.userData.plan.name) {
        return window.userData.plan.name;
    }
    return 'Free';
}

function canAskQuestion() {
    return getCurrentUsage() < getPlanLimit();
}

function getRemainingQuestions() {
    return Math.max(0, getPlanLimit() - getCurrentUsage());
}

// ============================================
// UPDATE DISPLAYS
// ============================================
function updateUsageDisplay() {
    const used = getCurrentUsage();
    const limit = getPlanLimit();
    
    // Update chat header counter
    const counter = document.getElementById('shadow-ai-counter');
    if (counter) {
        counter.textContent = `${used}/${limit} today`;
        
        // Color code based on usage
        if (used >= limit) {
            counter.classList.add('limit-reached');
            counter.classList.remove('limit-warning');
        } else if (used >= limit * 0.8) {
            counter.classList.add('limit-warning');
            counter.classList.remove('limit-reached');
        } else {
            counter.classList.remove('limit-reached', 'limit-warning');
        }
    }
    
    // Update sidebar AI counter
    const sidebarAI = document.getElementById('sidebar-ai');
    if (sidebarAI) {
        sidebarAI.textContent = `${used}/${limit}`;
    }
    
    // Sync with userData if available
    if (window.userData && window.userData.usage) {
        window.userData.usage.aiUsed = used;
    }
    
    // Dispatch event for dashboard to listen
    window.dispatchEvent(new CustomEvent('shadowai-usage-updated', { 
        detail: { used, limit, remaining: Math.max(0, limit - used) }
    }));
}

// ============================================
// WIDGET HTML
// ============================================
function createWidget() {
    console.log('📍 createWidget called');
    
    // Check if widget already exists
    if (document.querySelector('.shadow-ai-container')) {
        console.log('📍 Widget already exists, skipping');
        return;
    }
    
    const used = getCurrentUsage();
    const limit = getPlanLimit();
    const plan = getPlanName();
    
    console.log('📍 Creating widget with plan:', plan, 'usage:', used + '/' + limit);
    
    const widgetHTML = `
        <!-- Shadow AI Button Container -->
        <div class="shadow-ai-container ready">
            <div class="shadow-ai-glow"></div>
            <button id="shadow-ai-btn" class="copilot-btn" aria-label="Open Shadow AI Assistant">
                <span class="copilot-emoji">🤖</span>
            </button>
            <div class="shadow-ai-tooltip">Ask Shadow AI</div>
        </div>

        <!-- Shadow AI Chat Window -->
        <div id="shadow-ai-chat" class="copilot-chat hidden">
            <div class="copilot-header">
                <div class="copilot-header-left">
                    <span class="copilot-header-emoji">🤖</span>
                    <div class="copilot-header-text">
                        <h3>Shadow AI ${plan !== 'Free' ? plan : ''}</h3>
                        <p class="copilot-status">
                            <span class="copilot-status-dot"></span>
                            <span id="shadow-ai-counter">${used}/${limit} today</span>
                        </p>
                    </div>
                </div>
                <button id="shadow-ai-close" class="copilot-close" aria-label="Close chat">×</button>
            </div>
            <div id="shadow-ai-messages" class="copilot-messages"></div>
            <div class="copilot-input-area">
                <input type="text" id="shadow-ai-input" placeholder="Ask about shadow bans..." autocomplete="off">
                <button id="shadow-ai-send" class="copilot-send">Send</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    console.log('📍 Widget HTML inserted into body');
}

// ============================================
// OPEN / CLOSE / TOGGLE
// ============================================
function openChat() {
    const chat = document.getElementById('shadow-ai-chat');
    const tooltip = document.querySelector('.shadow-ai-tooltip');
    
    console.log('📍 openChat called, chat element:', !!chat);
    
    if (!chat) return;
    
    // Remove hidden AND add active
    chat.classList.remove('hidden');
    chat.classList.add('active');
    chatOpen = true;
    
    console.log('📍 Chat classes now:', chat.className);
    
    // Hide tooltip when chat is open
    if (tooltip) tooltip.style.opacity = '0';
    
    // Focus input
    setTimeout(() => {
        document.getElementById('shadow-ai-input')?.focus();
    }, 100);
    
    // Show welcome message if first time
    const messages = document.getElementById('shadow-ai-messages');
    if (messages && messages.children.length === 0) {
        showWelcomeMessage();
    }
    
    updateUsageDisplay();
}

function closeChat() {
    const chat = document.getElementById('shadow-ai-chat');
    const tooltip = document.querySelector('.shadow-ai-tooltip');
    
    if (!chat) return;
    
    // Remove active AND add hidden
    chat.classList.remove('active');
    chat.classList.add('hidden');
    chatOpen = false;
    
    // Show tooltip again
    if (tooltip) tooltip.style.opacity = '1';
}

function toggleChat() {
    if (chatOpen) {
        closeChat();
    } else {
        openChat();
    }
}

// ============================================
// MESSAGES
// ============================================
function addMessage(content, type = 'ai', isHTML = false) {
    const container = document.getElementById('shadow-ai-messages');
    if (!container) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `copilot-message ${type}`;
    
    const avatar = document.createElement('span');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'user' ? '👤' : '🤖';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    if (isHTML) {
        bubble.innerHTML = content;
    } else {
        bubble.textContent = content;
    }
    
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    container.appendChild(msgDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    
    return bubble;
}

function showTypingIndicator() {
    const container = document.getElementById('shadow-ai-messages');
    if (!container) return null;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'copilot-message ai typing-message';
    typingDiv.innerHTML = `
        <span class="message-avatar">🤖</span>
        <div class="message-bubble">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
    
    return typingDiv;
}

function removeTypingIndicator(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function showWelcomeMessage() {
    const plan = getPlanName();
    const limit = getPlanLimit();
    const remaining = getRemainingQuestions();
    
    const welcomeHTML = `
        <strong>Welcome back! 👋</strong><br><br>
        I'm your Shadow AI assistant on the <strong>${plan}</strong> plan.<br><br>
        You have <strong>${remaining} of ${limit}</strong> questions remaining today.<br><br>
        I can help you:
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem;">
            <li>Analyze your account status</li>
            <li>Explain shadow ban alerts</li>
            <li>Suggest recovery strategies</li>
            <li>Check hashtags & content</li>
        </ul>
        <br>What would you like to know?
    `;
    
    // Show typing first
    const typing = showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator(typing);
        addMessage(welcomeHTML, 'ai', true);
    }, 800);
}

function showLimitReachedMessage() {
    const plan = getPlanName();
    const limit = getPlanLimit();
    
    const upgradeHTML = `
        <strong>Daily Limit Reached 🔒</strong><br><br>
        You've used all <strong>${limit} questions</strong> for today on the <strong>${plan}</strong> plan.<br><br>
        <strong>Want more?</strong><br>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem;">
            <li>Pro Plan: 10 questions/day - $9.99/mo</li>
            <li>Premium: 25 questions/day - $14.99/mo</li>
            <li>AI Pro Add-on: 100 questions/day - +$9.99/mo</li>
        </ul>
        <br>
        <a href="#settings" onclick="navigateTo('settings')" style="color: var(--primary-light); font-weight: 600;">
            ⬆️ Upgrade Your Plan
        </a>
        <br><br>
        <em style="font-size: 0.85em; color: var(--text-muted);">Your questions reset at midnight.</em>
    `;
    
    addMessage(upgradeHTML, 'ai', true);
}

// ============================================
// SEND MESSAGE
// ============================================
function sendMessage() {
    const input = document.getElementById('shadow-ai-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) {
        // Blink input if empty
        input.classList.add('blink');
        setTimeout(() => input.classList.remove('blink'), 300);
        return;
    }
    
    // Check if user can ask more questions
    if (!canAskQuestion()) {
        addMessage(message, 'user');
        input.value = '';
        showLimitReachedMessage();
        return;
    }
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Increment usage
    incrementUsage();
    
    // Store in conversation history
    conversationHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    isTyping = true;
    const typing = showTypingIndicator();
    
    // Get AI response
    setTimeout(() => {
        removeTypingIndicator(typing);
        isTyping = false;
        
        const response = getAIResponse(message);
        addMessage(response, 'ai', true);
        
        conversationHistory.push({ role: 'assistant', content: response });
        
        // Check if this was their last question
        if (!canAskQuestion()) {
            setTimeout(() => {
                addMessage(`<em style="color: var(--text-muted);">⚠️ That was your last question for today. <a href="#settings" onclick="navigateTo('settings')" style="color: var(--primary-light);">Upgrade</a> for more!</em>`, 'ai', true);
            }, 1000);
        }
    }, 1000 + Math.random() * 1000);
}

// ============================================
// AI RESPONSES (Simulated - Replace with API)
// ============================================
function getAIResponse(message) {
    const msg = message.toLowerCase();
    const remaining = getRemainingQuestions();
    
    // Dashboard-specific responses
    if (msg.includes('alert') || msg.includes('notification')) {
        return `<strong>About Your Alerts 🔔</strong><br><br>
        I see you have some recent alerts. Here's what they mean:<br><br>
        <strong>Shadow Ban (Red):</strong> Your content is being hidden from non-followers.<br>
        <strong>Reduced Reach (Yellow):</strong> Your content is being shown to fewer people.<br>
        <strong>Restored (Green):</strong> Your account visibility is back to normal!<br><br>
        Would you like me to explain any specific alert?`;
    }
    
    if (msg.includes('tiktok') || msg.includes('banned')) {
        return `<strong>TikTok Shadow Ban Recovery 🎵</strong><br><br>
        Based on your account status, here's my recommendation:<br><br>
        <ol style="margin: 0.5rem 0; padding-left: 1.25rem;">
            <li><strong>Stop posting for 24-48 hours</strong> - Let the algorithm reset</li>
            <li><strong>Remove flagged content</strong> - Delete posts with banned hashtags</li>
            <li><strong>Check your hashtags</strong> - Use our hashtag checker tool</li>
            <li><strong>Post original content</strong> - Avoid reposts when you return</li>
        </ol>
        <br>
        Want me to check your TikTok hashtags?`;
    }
    
    if (msg.includes('instagram') || msg.includes('reach')) {
        return `<strong>Instagram Reach Issues 📸</strong><br><br>
        Reduced reach on Instagram can be caused by:<br><br>
        • Using banned or restricted hashtags<br>
        • Posting too frequently (>5 posts/day)<br>
        • Getting reported by other users<br>
        • Violating community guidelines<br><br>
        <strong>Tip:</strong> Try posting at different times and use fresh hashtags. Your "Business IG" account shows issues - want me to analyze it?`;
    }
    
    if (msg.includes('check') || msg.includes('status') || msg.includes('account')) {
        return `<strong>Account Status Summary 📊</strong><br><br>
        Based on your dashboard:<br><br>
        ✅ <strong>6 Healthy</strong> - No issues detected<br>
        ⚠️ <strong>1 Issues</strong> - Reduced reach detected<br>
        🚫 <strong>1 Banned</strong> - Shadow ban likely<br><br>
        Your TikTok account needs attention. Would you like recovery tips?`;
    }
    
    if (msg.includes('upgrade') || msg.includes('plan') || msg.includes('limit')) {
        return `<strong>Your Current Plan 💎</strong><br><br>
        You're on the <strong>${getPlanName()}</strong> plan with <strong>${getPlanLimit()}</strong> AI questions per day.<br><br>
        <strong>Upgrade Options:</strong><br>
        • <strong>Premium ($14.99/mo)</strong> - 25 questions/day + 50 accounts<br>
        • <strong>AI Pro Add-on ($9.99/mo)</strong> - 100 questions/day<br>
        • <strong>Unlimited ($19.99/mo)</strong> - 500 questions/day<br><br>
        <a href="#settings" onclick="navigateTo('settings')" style="color: var(--primary-light);">View plans in Settings →</a>`;
    }
    
    if (msg.includes('hashtag')) {
        return `<strong>Hashtag Analysis 🏷️</strong><br><br>
        I can help you check hashtags! Here's what to avoid:<br><br>
        🚫 <strong>Banned:</strong> #sexy, #adult, #followforfollow<br>
        ⚠️ <strong>Risky:</strong> #viral, #fyp (overused, low value)<br>
        ✅ <strong>Safe:</strong> Niche-specific, under 1M posts<br><br>
        Use the <strong>Hashtag Check</strong> tool in your dashboard, or paste hashtags here and I'll analyze them!`;
    }
    
    if (msg.includes('help') || msg.includes('what can you')) {
        return `<strong>How I Can Help 🤖</strong><br><br>
        As your Shadow AI assistant, I can:<br><br>
        • <strong>Explain alerts</strong> - What your notifications mean<br>
        • <strong>Recovery tips</strong> - Platform-specific advice<br>
        • <strong>Hashtag help</strong> - Check if hashtags are safe<br>
        • <strong>Account analysis</strong> - Review your status<br>
        • <strong>Best practices</strong> - Avoid future bans<br><br>
        You have <strong>${remaining}</strong> questions remaining today. What's on your mind?`;
    }
    
    // Default response
    return `Thanks for your question! 🤖<br><br>
    Based on your dashboard data, I can see you're monitoring <strong>8 accounts</strong> across multiple platforms.<br><br>
    To give you the best advice, could you tell me:<br>
    • Which specific account or platform are you asking about?<br>
    • Are you seeing any specific issues or alerts?<br><br>
    <em style="font-size: 0.85em; color: var(--text-muted);">${remaining} questions remaining today</em>`;
}

// ============================================
// KEYBOARD HANDLER
// ============================================
function initKeyboardHandler() {
    const input = document.getElementById('shadow-ai-input');
    if (!input) return;
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
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
// TOOLTIP SCROLL HANDLER
// ============================================
function initTooltipScrollHandler() {
    const tooltip = document.querySelector('.shadow-ai-tooltip');
    if (!tooltip) return;
    
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
        if (chatOpen) return;
        
        tooltip.style.opacity = '0';
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (!chatOpen) {
                tooltip.style.opacity = '1';
            }
        }, 1500);
    });
}

// ============================================
// INITIALIZATION
// ============================================
function initializeDashboardAI() {
    console.log('🤖 Shadow AI Dashboard v2.0 Initializing...');
    console.log('📍 Document body exists:', !!document.body);
    
    // Create widget
    createWidget();
    
    console.log('📍 Widget created, checking elements...');
    
    // Get elements
    const btn = document.getElementById('shadow-ai-btn');
    const closeBtn = document.getElementById('shadow-ai-close');
    const sendBtn = document.getElementById('shadow-ai-send');
    const container = document.querySelector('.shadow-ai-container');
    
    console.log('📍 Button found:', !!btn);
    console.log('📍 Container found:', !!container);
    console.log('📍 Container classes:', container ? container.className : 'N/A');
    
    // Button click - toggle chat
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleChat();
        });
    }
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeChat();
        });
    }
    
    // Send button
    if (sendBtn) {
        sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }
    
    // Initialize handlers
    initKeyboardHandler();
    initScrollIsolation();
    initTooltipScrollHandler();
    
    // Update display
    updateUsageDisplay();
    
    // Expose for dashboard.js integration
    window.ShadowAI = {
        open: openChat,
        close: closeChat,
        toggle: toggleChat,
        getUsage: getCurrentUsage,
        getLimit: getPlanLimit,
        canAsk: canAskQuestion
    };
    
    console.log('✅ Shadow AI Dashboard Ready');
    console.log(`📊 Usage: ${getCurrentUsage()}/${getPlanLimit()} questions today`);
}

// ============================================
// RUN ON DOM READY
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboardAI);
} else {
    initializeDashboardAI();
}

})();
