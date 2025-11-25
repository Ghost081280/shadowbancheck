/* =============================================================================
   SHADOW AI ADMIN - Unlocked Research Tool v2.0
   ShadowBanCheck.io - Admin Dashboard AI Assistant
   
   This version has NO limits - designed for admin use as a research tool
   to help answer customer questions quickly.
   
   Uses the same CSS as website/dashboard chatbot (shadow-ai.css)
   ============================================================================= */

(function() {
'use strict';

// ============================================
// STATE
// ============================================
let chatOpen = false;
let isTyping = false;
let conversationHistory = [];

// ============================================
// NO LIMITS FOR ADMIN
// ============================================
function canAskQuestion() {
    return true;
}

function getRemainingQuestions() {
    return '∞';
}

// ============================================
// WIDGET HTML - Uses same classes as main shadow-ai.css
// ============================================
function createWidget() {
    console.log('🔮 Creating Admin Shadow AI widget...');
    
    if (document.querySelector('.shadow-ai-container')) {
        console.log('Widget already exists, skipping');
        return;
    }
    
    const widgetHTML = `
        <div class="shadow-ai-container ready" id="shadow-ai-container">
            <div class="shadow-ai-glow"></div>
            <div class="shadow-ai-tooltip">Research Tool 🔮</div>
            <button id="shadow-ai-btn" class="copilot-btn" aria-label="Open Shadow AI Research Tool">
                <span class="copilot-emoji">🔮</span>
            </button>
        </div>

        <div id="shadow-ai-chat" class="copilot-chat hidden">
            <div class="copilot-header">
                <div class="copilot-header-left">
                    <span class="copilot-header-emoji">🔮</span>
                    <div class="copilot-header-text">
                        <h3>Shadow AI <span style="font-size: 0.7em; opacity: 0.8; background: var(--accent); padding: 2px 6px; border-radius: 4px; margin-left: 4px;">ADMIN</span></h3>
                        <p class="copilot-usage" id="shadow-ai-usage">∞ Unlimited Access</p>
                    </div>
                </div>
                <div class="copilot-header-right">
                    <span class="copilot-status">
                        <span class="copilot-status-dot online" style="background: #a855f7;"></span>
                        Research Mode
                    </span>
                    <button id="shadow-ai-close" class="copilot-close" aria-label="Close chat">×</button>
                </div>
            </div>
            <div id="shadow-ai-messages" class="copilot-messages"></div>
            <div class="copilot-input-area">
                <input type="text" id="shadow-ai-input" placeholder="Research any shadow ban question..." autocomplete="off" enterkeyhint="send">
                <button id="shadow-ai-send" class="copilot-send">Ask</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    
    // Bind events after creation
    bindEvents();
    
    console.log('✅ Admin Shadow AI widget created');
}

// ============================================
// EVENT BINDING
// ============================================
function bindEvents() {
    const btn = document.getElementById('shadow-ai-btn');
    const closeBtn = document.getElementById('shadow-ai-close');
    const sendBtn = document.getElementById('shadow-ai-send');
    const input = document.getElementById('shadow-ai-input');
    
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleChat();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeChat();
        });
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
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

// ============================================
// OPEN / CLOSE / TOGGLE
// ============================================
function openChat() {
    const chat = document.getElementById('shadow-ai-chat');
    const container = document.getElementById('shadow-ai-container');
    
    if (!chat) return;
    
    chat.classList.remove('hidden');
    chat.classList.add('active');
    container?.classList.add('chat-open');
    chatOpen = true;
    
    setTimeout(() => {
        document.getElementById('shadow-ai-input')?.focus();
    }, 100);
    
    const messages = document.getElementById('shadow-ai-messages');
    if (messages && messages.children.length === 0) {
        showWelcomeMessage();
    }
}

function closeChat() {
    const chat = document.getElementById('shadow-ai-chat');
    const container = document.getElementById('shadow-ai-container');
    
    if (!chat) return;
    
    chat.classList.remove('active');
    chat.classList.add('hidden');
    container?.classList.remove('chat-open');
    chatOpen = false;
}

function toggleChat() {
    if (chatOpen) {
        closeChat();
    } else {
        openChat();
    }
}

// ============================================
// MESSAGES - Using same structure as main chatbot
// ============================================
function addMessage(content, type = 'assistant', isHTML = false) {
    const container = document.getElementById('shadow-ai-messages');
    if (!container) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${type}-message`;
    
    if (type === 'assistant') {
        msgDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">🔮</div>
                <div class="message-text">${isHTML ? content : escapeHtml(content)}</div>
            </div>
        `;
    } else {
        msgDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${escapeHtml(content)}</div>
            </div>
        `;
    }
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    
    return msgDiv;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showTypingIndicator() {
    const container = document.getElementById('shadow-ai-messages');
    if (!container) return null;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="message-avatar">🔮</div>
            <div class="typing-dots">
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
    const welcomeHTML = `
        <strong>Shadow AI Research Tool 🔮</strong><br><br>
        Hey Andrew! I'm here to help you research answers for customer questions.<br><br>
        <strong>Quick commands:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li><strong>"shadow ban [platform]"</strong> - Get platform-specific info</li>
            <li><strong>"recovery tips"</strong> - General recovery strategies</li>
            <li><strong>"hashtag [topic]"</strong> - Hashtag safety info</li>
            <li><strong>"explain [alert type]"</strong> - Alert explanations</li>
        </ul>
        <br>
        <em style="color: var(--text-muted);">Unlimited access • No daily limits</em>
    `;
    
    const typing = showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator(typing);
        addMessage(welcomeHTML, 'assistant', true);
    }, 500);
}

// ============================================
// SEND MESSAGE
// ============================================
function sendMessage() {
    const input = document.getElementById('shadow-ai-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) {
        input.classList.add('blink-empty');
        setTimeout(() => input.classList.remove('blink-empty'), 300);
        return;
    }
    
    addMessage(message, 'user');
    input.value = '';
    
    conversationHistory.push({ role: 'user', content: message });
    
    isTyping = true;
    const typing = showTypingIndicator();
    
    // Disable input while typing
    input.disabled = true;
    document.getElementById('shadow-ai-send').disabled = true;
    
    setTimeout(() => {
        removeTypingIndicator(typing);
        isTyping = false;
        
        const response = getAIResponse(message);
        addMessage(response, 'assistant', true);
        
        conversationHistory.push({ role: 'assistant', content: response });
        
        input.disabled = false;
        document.getElementById('shadow-ai-send').disabled = false;
        input.focus();
    }, 800 + Math.random() * 800);
}

// ============================================
// AI RESPONSES - Admin Research Tool
// ============================================
function getAIResponse(message) {
    const msg = message.toLowerCase();
    
    // Platform-specific shadow ban info
    if (msg.includes('instagram') || msg.includes('ig')) {
        return `<strong>Instagram Shadow Ban - Research Summary 📸</strong><br><br>
        <strong>What it is:</strong> Instagram limits content visibility without notification. Posts won't appear in hashtag feeds, Explore, or Reels tab for non-followers.<br><br>
        <strong>Common causes:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Using banned/restricted hashtags</li>
            <li>Excessive actions (likes, follows, comments)</li>
            <li>Third-party app access</li>
            <li>Multiple reports from users</li>
            <li>Violating community guidelines</li>
        </ul>
        <strong>Duration:</strong> Usually 24 hours to 2 weeks<br><br>
        <strong>Recovery steps:</strong>
        <ol style="margin: 0.5rem 0; padding-left: 1.25rem;">
            <li>Stop posting for 48 hours</li>
            <li>Remove last 3-5 posts with hashtags</li>
            <li>Revoke third-party app access</li>
            <li>Switch to Business/Creator account</li>
            <li>Report problem via Settings > Help</li>
        </ol>
        <em style="color: var(--text-muted);">Copy/paste relevant parts for customer reply</em>`;
    }
    
    if (msg.includes('tiktok')) {
        return `<strong>TikTok Shadow Ban - Research Summary 🎵</strong><br><br>
        <strong>What it is:</strong> TikTok restricts video distribution - content gets 0 views or won't appear on FYP.<br><br>
        <strong>Common causes:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Community guideline violations</li>
            <li>Copyright/music issues</li>
            <li>Spam behavior (mass liking/following)</li>
            <li>Under 16 age restrictions</li>
            <li>VPN usage (some regions)</li>
            <li>Posting NSFW-adjacent content</li>
        </ul>
        <strong>Duration:</strong> Usually 1-2 weeks<br><br>
        <strong>Recovery steps:</strong>
        <ol style="margin: 0.5rem 0; padding-left: 1.25rem;">
            <li>Delete any flagged/0-view videos</li>
            <li>Wait 1 week before posting new content</li>
            <li>Avoid trending sounds initially</li>
            <li>Post 100% original content</li>
            <li>Re-verify age in settings</li>
            <li>Disable VPN if using one</li>
        </ol>
        <em style="color: var(--text-muted);">TikTok is strictest - recommend patience to customers</em>`;
    }
    
    if (msg.includes('twitter') || msg.includes('x.com') || msg.includes(' x ')) {
        return `<strong>Twitter/X Shadow Ban - Research Summary 🐦</strong><br><br>
        <strong>Types of restrictions:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li><strong>Search Ban:</strong> Tweets don't appear in search results</li>
            <li><strong>Search Suggestion Ban:</strong> Account doesn't appear in search</li>
            <li><strong>Reply Deboosting:</strong> Replies hidden behind "Show more"</li>
            <li><strong>Ghost Ban:</strong> Tweets invisible to non-followers</li>
        </ul>
        <strong>Common causes:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Aggressive/harassing behavior</li>
            <li>Spam patterns (identical tweets)</li>
            <li>New account + high activity</li>
            <li>Multiple user reports</li>
            <li>Using automation tools</li>
        </ul>
        <strong>Duration:</strong> Usually 12-48 hours<br><br>
        <strong>Check tools:</strong> hisubway.online, shadowban.yuzurisa.com<br><br>
        <em style="color: var(--text-muted);">Twitter bans usually lift fastest</em>`;
    }
    
    if (msg.includes('youtube')) {
        return `<strong>YouTube Visibility Issues - Research Summary 📺</strong><br><br>
        <strong>Note:</strong> YouTube doesn't technically "shadow ban" but they can:<br>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li><strong>Demonetize:</strong> Remove ads from specific videos</li>
            <li><strong>Age-restrict:</strong> Limit who can view</li>
            <li><strong>Limited ads:</strong> Yellow $ icon</li>
            <li><strong>Not recommend:</strong> Excluded from suggestions/browse</li>
        </ul>
        <strong>Causes for reduced visibility:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Controversial/sensitive topics</li>
            <li>Misleading metadata</li>
            <li>Reused content</li>
            <li>Copyright strikes</li>
            <li>Community guideline strikes</li>
        </ul>
        <strong>What to tell customers:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Check YouTube Studio analytics for "Limited" labels</li>
            <li>Request human review for demonetized videos</li>
            <li>Avoid click-bait titles/thumbnails</li>
            <li>Consistent posting schedule helps</li>
        </ul>`;
    }
    
    if (msg.includes('facebook') || msg.includes('fb')) {
        return `<strong>Facebook Reach Issues - Research Summary 👤</strong><br><br>
        <strong>What happens:</strong> Posts get limited distribution in Feed, may not reach followers.<br><br>
        <strong>Common causes:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Engagement bait ("Like if you agree")</li>
            <li>Misinformation flags from fact-checkers</li>
            <li>External links (FB prefers native content)</li>
            <li>Community standards violations</li>
            <li>Reported content</li>
        </ul>
        <strong>Page vs Profile:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li><strong>Pages:</strong> Check Page Quality tab for restrictions</li>
            <li><strong>Profiles:</strong> Less transparent - check Support Inbox</li>
        </ul>
        <strong>Recovery tips:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Post more video content (especially Live)</li>
            <li>Avoid external links</li>
            <li>Encourage meaningful comments</li>
            <li>Join relevant Groups</li>
        </ul>`;
    }
    
    if (msg.includes('linkedin')) {
        return `<strong>LinkedIn Visibility Issues - Research Summary 💼</strong><br><br>
        <strong>What happens:</strong> Posts get limited reach, may not appear in connections' feeds.<br><br>
        <strong>Common causes:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>External links in posts (LinkedIn deprioritizes)</li>
            <li>Editing posts after publishing</li>
            <li>Using banned/flagged hashtags</li>
            <li>Too many posts per day (>2-3)</li>
            <li>Low engagement on recent posts</li>
        </ul>
        <strong>Tips for customers:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Put links in comments, not post body</li>
            <li>Don't edit within first hour</li>
            <li>Use 3-5 relevant hashtags max</li>
            <li>Engage with comments quickly</li>
            <li>Post during business hours</li>
        </ul>`;
    }
    
    if (msg.includes('reddit')) {
        return `<strong>Reddit Shadow Ban - Research Summary 🔴</strong><br><br>
        <strong>What it is:</strong> Reddit shadow bans are site-wide account restrictions. Your posts/comments are only visible to you.<br><br>
        <strong>How to check:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Log out and view your profile</li>
            <li>Use r/ShadowBan to post and check</li>
            <li>Check at reddit.com/user/[username]/about.json</li>
        </ul>
        <strong>Common causes:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Self-promotion without participation</li>
            <li>Vote manipulation</li>
            <li>Brigading other subreddits</li>
            <li>Ban evasion</li>
            <li>Spammy behavior patterns</li>
        </ul>
        <strong>Recovery:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Submit appeal at reddit.com/appeals</li>
            <li>Be polite and honest in appeal</li>
            <li>If denied, only option is new account</li>
        </ul>`;
    }
    
    // Recovery tips
    if (msg.includes('recovery') || msg.includes('fix') || msg.includes('restore')) {
        return `<strong>Universal Recovery Strategy 🔧</strong><br><br>
        <strong>Immediate actions (first 48 hours):</strong>
        <ol style="margin: 0.5rem 0; padding-left: 1.25rem;">
            <li><strong>STOP</strong> all posting immediately</li>
            <li><strong>REMOVE</strong> recent posts with hashtags</li>
            <li><strong>REVOKE</strong> third-party app access</li>
            <li><strong>DON'T</strong> like, comment, or follow anyone</li>
        </ol>
        <strong>After 48 hours:</strong>
        <ol style="margin: 0.5rem 0; padding-left: 1.25rem;">
            <li>Post ONE piece of original content</li>
            <li>Use only 3-5 small/medium hashtags</li>
            <li>Engage naturally with existing followers</li>
            <li>Wait 24 hours before posting again</li>
        </ol>
        <strong>What to tell customers:</strong><br>
        "Recovery usually takes 1-2 weeks. The algorithm needs time to 'forget' the flagged behavior. Patience is key - rushing back to normal activity can extend the ban."`;
    }
    
    // Hashtag help
    if (msg.includes('hashtag')) {
        return `<strong>Hashtag Best Practices 🏷️</strong><br><br>
        <strong>What to avoid:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>🚫 Banned tags: #adulting, #sexy, #beautyblogger, #followforfollow</li>
            <li>⚠️ Risky tags: #viral, #fyp, #explorepage (overused, low value)</li>
            <li>⚠️ Very large tags: >10M posts (too competitive)</li>
        </ul>
        <strong>What works:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>✅ Niche-specific tags (10K-500K posts)</li>
            <li>✅ Mix of sizes: 2 small, 2 medium, 1 large</li>
            <li>✅ Rotate hashtags between posts</li>
            <li>✅ Instagram: 5-15 hashtags (not 30)</li>
            <li>✅ TikTok: 3-5 hashtags max</li>
        </ul>
        <strong>How to check if banned:</strong><br>
        Search the hashtag on the platform. If it shows "content hidden" or no recent posts, it's restricted.`;
    }
    
    // Alert explanations
    if (msg.includes('alert') || msg.includes('explain')) {
        return `<strong>Alert Types Explained 🚨</strong><br><br>
        <strong>🚫 Shadow Ban (Red):</strong><br>
        Content is hidden from non-followers. Posts don't appear in hashtag feeds, Explore, or recommendations. Only existing followers can see new posts.<br><br>
        <strong>⚠️ Reduced Reach (Yellow):</strong><br>
        Content is being shown to fewer people than normal. Not a full ban, but algorithm is limiting distribution. Usually caused by low engagement or minor violations.<br><br>
        <strong>✅ Restored (Green):</strong><br>
        Account visibility returned to normal. The restriction has been lifted and content should now reach the full audience again.<br><br>
        <strong>What to tell customers:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Red = Take immediate action, follow recovery steps</li>
            <li>Yellow = Monitor closely, reduce activity slightly</li>
            <li>Green = Good news! Resume normal posting</li>
        </ul>`;
    }
    
    // Help / what can you do
    if (msg.includes('help') || msg.includes('what can')) {
        return `<strong>Research Tool Commands 🔮</strong><br><br>
        <strong>Platform info:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>"instagram shadow ban"</li>
            <li>"tiktok shadow ban"</li>
            <li>"twitter shadow ban"</li>
            <li>"youtube visibility"</li>
            <li>"facebook reach"</li>
            <li>"linkedin visibility"</li>
            <li>"reddit shadow ban"</li>
        </ul>
        <strong>General topics:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>"recovery tips"</li>
            <li>"hashtag best practices"</li>
            <li>"explain alerts"</li>
        </ul>
        <strong>Customer scenarios:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>"customer says [issue]"</li>
            <li>"how to explain [topic]"</li>
        </ul>
        <em>Ask anything - I'll give you copy-paste ready responses!</em>`;
    }
    
    // Customer scenario helper
    if (msg.includes('customer says') || msg.includes('customer asking') || msg.includes('user says')) {
        return `<strong>Customer Response Template 💬</strong><br><br>
        Based on the customer's question, here's a suggested response:<br><br>
        <div style="background: rgba(99,102,241,0.1); padding: 1rem; border-radius: 8px; margin: 0.5rem 0;">
        "Thanks for reaching out! I've looked into your account and here's what I found:<br><br>
        [INSERT SPECIFIC FINDING]<br><br>
        Here's what I recommend:<br>
        1. [FIRST STEP]<br>
        2. [SECOND STEP]<br>
        3. [THIRD STEP]<br><br>
        This usually resolves within [TIMEFRAME]. Let me know if you have any questions!"
        </div>
        <br>
        <strong>Need specific platform info?</strong> Ask me about the platform they're having issues with.`;
    }
    
    // Pricing / plans
    if (msg.includes('pricing') || msg.includes('plan') || msg.includes('price')) {
        return `<strong>ShadowBanCheck.io Pricing 💰</strong><br><br>
        <strong>Monitoring Plans:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li><strong>Starter:</strong> $4.99/mo - 5 accounts, 3 AI/day</li>
            <li><strong>Pro:</strong> $9.99/mo - 15 accounts, 10 AI/day</li>
            <li><strong>Premium:</strong> $14.99/mo - 50 accounts, 25 AI/day</li>
        </ul>
        <strong>AI Pro Add-on:</strong> +$9.99/mo for 100 AI questions/day<br><br>
        <strong>All plans include:</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
            <li>Text + Email alerts</li>
            <li>Hashtag checker access</li>
            <li>Recovery recommendations</li>
            <li>7-day free trial</li>
        </ul>`;
    }
    
    // Default - helpful suggestions
    return `<strong>Research Assistant Ready 🔮</strong><br><br>
    I can help you research answers for customer questions. Try asking about:<br><br>
    <strong>Platforms:</strong> Instagram, TikTok, Twitter, YouTube, Facebook, LinkedIn, Reddit<br>
    <strong>Topics:</strong> Shadow bans, recovery tips, hashtag safety, alert explanations, pricing<br><br>
    <strong>Example queries:</strong>
    <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">
        <li>"Instagram shadow ban causes"</li>
        <li>"How to explain reduced reach to customer"</li>
        <li>"TikTok recovery steps"</li>
        <li>"Customer says their views dropped suddenly"</li>
    </ul>
    <br>
    <em>What would you like to research?</em>`;
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
// INITIALIZATION
// ============================================
function initializeAdminAI() {
    console.log('🔮 Shadow AI Admin Tool v2.0 Initializing...');
    
    createWidget();
    initScrollIsolation();
    
    // Export API for external use
    window.ShadowAI = {
        open: openChat,
        close: closeChat,
        toggle: toggleChat,
        canAsk: canAskQuestion
    };
    
    console.log('✅ Shadow AI Admin Tool Ready - Unlimited Access');
}

// ============================================
// RUN ON DOM READY
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminAI);
} else {
    initializeAdminAI();
}

})();
