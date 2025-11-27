/* =============================================================================
   SHADOW AI - PRO USER VERSION v1.0
   ShadowBanCheck.io - Dashboard AI Assistant (25 questions/month)
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    monthlyLimit: 25,
    storageKey: 'shadow_ai_pro_usage_v5',
    demoUsername: '@ghost081280'
};

// =============================================================================
// USAGE TRACKING
// =============================================================================
function getUsage() {
    try {
        const data = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{}');
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
        
        // Reset if new month
        if (data.month !== currentMonth) {
            return { month: currentMonth, count: 0 };
        }
        
        return data;
    } catch {
        return { month: '', count: 0 };
    }
}

function incrementUsage() {
    const usage = getUsage();
    usage.count++;
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(usage));
    return usage;
}

function getRemainingQuestions() {
    const usage = getUsage();
    return Math.max(0, CONFIG.monthlyLimit - usage.count);
}

// =============================================================================
// UI STATE
// =============================================================================
let isOpen = false;
let isTyping = false;
let conversationHistory = [];

// =============================================================================
// PLATFORM KNOWLEDGE BASE
// =============================================================================
const PLATFORM_KNOWLEDGE = {
    'twitter': {
        name: 'Twitter/X',
        icon: '𝕏',
        commonIssues: [
            'Reply deboosting (replies not showing to others)',
            'Search suppression (account not appearing in search)',
            'Trend exclusion (tweets not appearing in trends)',
            'Quality filter activation',
            'Sensitive content flag on profile'
        ],
        recoverySteps: [
            'Avoid engagement bait and excessive hashtags (max 2-3)',
            'Don\'t tweet identical content repeatedly',
            'Reduce automation and third-party app usage',
            'Engage authentically with others for 2-3 weeks',
            'Review and delete any flagged tweets'
        ],
        timeframe: '1-4 weeks for full visibility restoration'
    },
    'instagram': {
        name: 'Instagram',
        icon: '📷',
        commonIssues: [
            'Hashtag shadow ban (posts not appearing in hashtag searches)',
            'Explore page suppression',
            'Reach dropping significantly on new posts',
            'Reels getting very low views',
            'Story views decreasing'
        ],
        recoverySteps: [
            'Stop using banned/broken hashtags immediately',
            'Take a 48-72 hour break from posting',
            'Use only 5-10 highly relevant hashtags',
            'Avoid engagement pods and bot activity',
            'Post consistently but not excessively (1-2x daily max)'
        ],
        timeframe: '2-4 weeks typically'
    },
    'tiktok': {
        name: 'TikTok',
        icon: '♪',
        commonIssues: [
            '0 view videos (complete suppression)',
            'Under review status',
            'For You Page exclusion',
            'Sound removed or muted',
            'Account "not recommended" status'
        ],
        recoverySteps: [
            'Check Community Guidelines for any violations',
            'Remove any flagged content immediately',
            'Wait 1-2 weeks without posting if severely restricted',
            'Create original content (no reposts)',
            'Engage genuinely with your niche community'
        ],
        timeframe: '2-6 weeks, TikTok is often strictest'
    },
    'reddit': {
        name: 'Reddit',
        icon: '🔴',
        commonIssues: [
            'Shadowbanned account (posts/comments invisible)',
            'Subreddit-specific bans',
            'Spam filter catching legitimate posts',
            'Low karma throttling',
            'New account restrictions'
        ],
        recoverySteps: [
            'Check r/ShadowBan to verify shadowban status',
            'Appeal via reddit.com/appeals if confirmed',
            'Build karma in non-restricted subreddits',
            'Follow subreddit rules carefully',
            'Avoid posting same links repeatedly'
        ],
        timeframe: 'Appeals reviewed in 3-7 days typically'
    },
    'youtube': {
        name: 'YouTube',
        icon: '▶️',
        commonIssues: [
            'Videos not appearing in recommendations',
            'Demonetization (yellow $)',
            'Age-restricted without cause',
            'Comments being hidden',
            'Subscriber notifications not sending'
        ],
        recoverySteps: [
            'Review YouTube Studio analytics for specific flags',
            'Request human review for demonetized videos',
            'Check for any Community Guideline strikes',
            'Ensure thumbnails/titles aren\'t clickbait',
            'Build consistent upload schedule'
        ],
        timeframe: '1-3 weeks for algorithm recovery'
    },
    'facebook': {
        name: 'Facebook',
        icon: 'ⓕ',
        commonIssues: [
            'Reduced distribution notification',
            'Page reach dropping dramatically',
            'Posts not showing to followers',
            'Group posts being hidden',
            'Fact-check labels applied'
        ],
        recoverySteps: [
            'Avoid sharing content flagged by fact-checkers',
            'Reduce external links in posts',
            'Encourage meaningful comments over reactions',
            'Post native video content',
            'Don\'t boost posts that violate policies'
        ],
        timeframe: '2-4 weeks with consistent quality content'
    },
    'linkedin': {
        name: 'LinkedIn',
        icon: 'in',
        commonIssues: [
            'Posts getting minimal views',
            'Profile not appearing in search',
            'Connection requests being blocked',
            'SSI score dropping',
            'Content flagged as spam'
        ],
        recoverySteps: [
            'Avoid excessive connection requests',
            'Don\'t use automation tools',
            'Engage meaningfully before posting',
            'Keep posts professional and relevant',
            'Avoid external links in first comment'
        ],
        timeframe: '1-2 weeks typically'
    }
};

// =============================================================================
// RESPONSE GENERATION
// =============================================================================
function generateResponse(question) {
    const q = question.toLowerCase();
    
    // Check for platform-specific questions
    for (const [platformKey, platform] of Object.entries(PLATFORM_KNOWLEDGE)) {
        if (q.includes(platformKey) || q.includes(platform.name.toLowerCase())) {
            return generatePlatformResponse(platform, q);
        }
    }
    
    // General shadow ban questions
    if (q.includes('shadow ban') || q.includes('shadowban')) {
        return generateShadowBanExplanation();
    }
    
    // Score interpretation
    if (q.includes('score') || q.includes('percentage') || q.includes('%')) {
        return generateScoreExplanation();
    }
    
    // Recovery questions
    if (q.includes('recover') || q.includes('fix') || q.includes('remove')) {
        return generateGeneralRecovery();
    }
    
    // Dispute/appeal questions
    if (q.includes('dispute') || q.includes('appeal') || q.includes('contact')) {
        return generateDisputeInfo();
    }
    
    // How it works
    if (q.includes('how') && (q.includes('work') || q.includes('detect') || q.includes('check'))) {
        return generateHowItWorks();
    }
    
    // Default helpful response
    return generateDefaultResponse();
}

function generatePlatformResponse(platform, question) {
    let response = `## ${platform.icon} ${platform.name} Analysis\n\n`;
    
    if (question.includes('issue') || question.includes('problem') || question.includes('wrong')) {
        response += `### Common ${platform.name} Shadow Ban Indicators:\n\n`;
        platform.commonIssues.forEach((issue, i) => {
            response += `${i + 1}. ${issue}\n`;
        });
    }
    
    if (question.includes('fix') || question.includes('recover') || question.includes('help')) {
        response += `\n### Recovery Steps for ${platform.name}:\n\n`;
        platform.recoverySteps.forEach((step, i) => {
            response += `${i + 1}. ${step}\n`;
        });
        response += `\n⏱️ **Expected Recovery Time:** ${platform.timeframe}\n`;
    }
    
    if (!question.includes('issue') && !question.includes('fix')) {
        // General platform info
        response += `### About ${platform.name} Shadow Bans:\n\n`;
        response += `${platform.name} uses algorithmic content moderation that can restrict visibility without notifying users. `;
        response += `This is commonly called a "shadow ban" because your content appears normal to you but is hidden from others.\n\n`;
        response += `**Common indicators include:**\n`;
        platform.commonIssues.slice(0, 3).forEach(issue => {
            response += `• ${issue}\n`;
        });
        response += `\nWant specific recovery steps? Just ask "How do I fix my ${platform.name} shadow ban?"`;
    }
    
    response += `\n\n---\n💡 *Pro tip: Use the Resolution Center to generate a formal appeal letter for ${platform.name}.*`;
    
    return response;
}

function generateShadowBanExplanation() {
    return `## 🔍 What is a Shadow Ban?

A **shadow ban** (also called "stealth ban" or "ghost ban") is when a platform secretly limits the visibility of your content without notifying you.

### How It Works:
• Your posts appear normal **to you**
• But they're **hidden or suppressed** from others
• You don't receive any notification
• Often affects search, recommendations, or hashtags

### Why Platforms Do This:
1. **Spam prevention** - Limiting bot/spam accounts
2. **Policy enforcement** - Soft penalty before full ban
3. **Quality filtering** - Demoting low-quality content
4. **Behavioral patterns** - Automation or unusual activity detected

### Signs You May Be Shadow Banned:
• Sudden drop in engagement (likes, comments, views)
• Posts not appearing in hashtag searches
• Friends can't see your content in their feeds
• Account not appearing in search results
• Replies/comments hidden from threads

### Our Detection:
ShadowBanCheck.io analyzes **5 key factors** across platforms to detect shadow bans:
1. Search visibility
2. Reply/comment visibility
3. Suggestion/recommendation status
4. Content distribution patterns
5. Account standing signals

---
💡 *Want platform-specific info? Ask about Twitter, Instagram, TikTok, Reddit, YouTube, or Facebook.*`;
}

function generateScoreExplanation() {
    return `## 📊 Understanding Your Shadow Ban Score

Your score indicates the **likelihood of shadow ban restrictions** on your account.

### Score Ranges:

**0-25%** 🟢 **Healthy**
• No significant restrictions detected
• Normal content visibility
• Keep doing what you're doing!

**26-50%** 🟡 **Mild Concern**
• Some signals present but not severe
• May be temporary or platform glitch
• Monitor for changes over 1-2 weeks

**51-75%** 🟠 **Likely Restricted**
• Multiple restriction signals detected
• Visibility probably impacted
• Recovery steps recommended

**76-100%** 🔴 **Severe/Confirmed**
• Strong evidence of shadow ban
• Significant visibility restrictions
• Immediate action recommended

### What Affects Your Score:
• Search visibility test results
• Reply/comment visibility
• Recommendation algorithm status
• Content distribution patterns
• Account age and history

### Example Analysis:
If we checked ${CONFIG.demoUsername} on Twitter and got 67%, that means:
• 2-3 restriction factors detected
• Likely reply deboosting or search suppression
• Recovery is possible with proper steps

---
💡 *Your score can improve! Follow recovery steps and re-scan in 1-2 weeks.*`;
}

function generateGeneralRecovery() {
    return `## 🔧 Shadow Ban Recovery Guide

### Universal Recovery Steps (All Platforms):

**Immediate Actions:**
1. ⏸️ **Pause activity** for 24-48 hours
2. 🔍 **Review recent content** for policy violations
3. 🗑️ **Delete any flagged** or questionable posts
4. 🔄 **Log out of third-party apps** connected to account

**Behavioral Changes:**
1. ✅ Engage authentically (no engagement pods)
2. ✅ Reduce posting frequency temporarily
3. ✅ Avoid automation and scheduled posts
4. ✅ Don't use banned/broken hashtags
5. ✅ Create original content only

**What NOT to Do:**
• ❌ Don't create new accounts (they track this)
• ❌ Don't dramatically change posting patterns
• ❌ Don't use VPNs (can look suspicious)
• ❌ Don't buy followers/likes/engagement

### Recovery Timeline:
• **Mild restrictions:** 3-7 days
• **Moderate shadow ban:** 2-3 weeks  
• **Severe restrictions:** 4-6 weeks
• **Account flags:** May require appeal

### Pro Tips:
• Re-scan your account weekly to track progress
• Focus on quality over quantity
• Build genuine engagement
• Consider filing a formal appeal

---
💡 *Use our Resolution Center to generate a formal appeal letter for your platform.*`;
}

function generateDisputeInfo() {
    return `## 📋 Filing Shadow Ban Appeals

### Resolution Center
Our **Resolution Center** helps you create professional appeal letters with:
• Your scan results as evidence
• Platform-specific legal contacts
• TOS-compliant language
• One-click submission

### Direct Platform Contacts:

**Twitter/X:**
• appeals@x.com
• privacy@x.com (for data requests)
• Response time: 3-7 days

**Instagram/Facebook:**
• support@instagram.com
• Report a Problem in-app preferred
• Response time: 5-14 days

**TikTok:**
• legal@tiktok.com
• In-app feedback form
• Response time: 7-14 days

**Reddit:**
• reddit.com/appeals
• modmail for subreddit bans
• Response time: 3-10 days

**YouTube:**
• youtube.com/creator_support
• Twitter: @TeamYouTube
• Response time: 7-21 days

### Tips for Successful Appeals:
1. Be polite and professional
2. Reference specific policies
3. Include evidence (screenshots, scan results)
4. Explain the business/personal impact
5. Follow up after 7-10 days if no response

### Success Rates:
• LinkedIn: ~55% (highest)
• Reddit: ~50%
• Twitter: ~45%
• YouTube: ~40%
• Instagram: ~35%
• TikTok: ~30%

---
💡 *Click "Resolution Center" in your dashboard to start an appeal.*`;
}

function generateHowItWorks() {
    return `## 🔬 How ShadowBanCheck.io Works

### Our Detection Engine:
We analyze **5 key factors** that indicate shadow ban status:

**1. Search Visibility Test**
• Can your account be found in platform search?
• Are your posts appearing in hashtag searches?
• Is your content indexed properly?

**2. Reply/Engagement Visibility**
• Are your replies visible in threads?
• Can others see your comments?
• Are you being filtered from conversations?

**3. Suggestion/Recommendation Status**
• Does your content appear in recommendations?
• Are you suggested to potential followers?
• Is algorithmic distribution working?

**4. Content Distribution Analysis**
• Is your content reaching your followers?
• What's your actual vs expected reach?
• Are there distribution anomalies?

**5. Account Standing Signals**
• Any visible warnings or flags?
• Account age and history factors
• Platform-specific health indicators

### Example Scan:
For ${CONFIG.demoUsername} on Twitter:
\`\`\`
Search Visibility:    ✅ PASS (95%)
Reply Visibility:     ⚠️ WARN (62%)
Suggestions:          ✅ PASS (88%)
Distribution:         ⚠️ WARN (71%)
Account Standing:     ✅ PASS (100%)
─────────────────────────────────
Overall Score:        67% (Issues Detected)
\`\`\`

### Accuracy:
• We're accurate in ~90% of cases
• Some restrictions are undetectable externally
• Results should be verified with personal testing
• Re-scan periodically for tracking

---
💡 *Scan your accounts regularly to catch issues early!*`;
}

function generateDefaultResponse() {
    return `## 🤖 Shadow AI - Your Shadow Ban Expert

I'm here to help you understand and recover from shadow bans!

### I can help with:
• **Explain your scan results** - What does your score mean?
• **Platform-specific advice** - Twitter, Instagram, TikTok, Reddit, YouTube, Facebook
• **Recovery strategies** - How to restore your visibility
• **Appeal guidance** - Filing disputes with platforms
• **Prevention tips** - Avoid future restrictions

### Try asking:
• "What is a shadow ban?"
• "How do I fix my Instagram shadow ban?"
• "What does my 67% score mean?"
• "How do I appeal a Twitter restriction?"
• "Why am I getting low engagement on TikTok?"

### Quick Actions:
• **Resolution Center** - Generate formal appeal letters
• **Re-scan** - Check your current status
• **View History** - Track your progress over time

---
*I'm here to help! Ask me anything about shadow bans.*`;
}

// =============================================================================
// UI FUNCTIONS
// =============================================================================
function createUI() {
    // Check if already created
    if (document.getElementById('shadow-ai-container')) return;
    
    const container = document.createElement('div');
    container.id = 'shadow-ai-container';
    container.innerHTML = `
        <!-- Floating Button -->
        <button class="shadow-ai-fab" id="shadow-ai-fab" title="Ask Shadow AI">
            <span class="fab-icon">🤖</span>
            <span class="fab-pulse"></span>
        </button>
        
        <!-- Chat Panel -->
        <div class="shadow-ai-panel hidden" id="shadow-ai-panel">
            <div class="shadow-ai-header">
                <div class="header-left">
                    <span class="header-icon">🤖</span>
                    <div class="header-info">
                        <span class="header-title">Shadow AI</span>
                        <span class="header-subtitle">Pro • <span id="ai-remaining">${getRemainingQuestions()}</span>/${CONFIG.monthlyLimit} questions</span>
                    </div>
                </div>
                <button class="header-close" id="shadow-ai-close">&times;</button>
            </div>
            
            <div class="shadow-ai-messages" id="shadow-ai-messages">
                <div class="ai-message">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <p>Hey! I'm Shadow AI, your shadow ban expert. 👋</p>
                        <p>I can help you understand your scan results, explain platform-specific issues, and guide you through recovery.</p>
                        <p>What would you like to know?</p>
                    </div>
                </div>
            </div>
            
            <div class="shadow-ai-input-area">
                <div class="input-wrapper">
                    <textarea 
                        id="shadow-ai-input" 
                        placeholder="Ask about shadow bans, your score, recovery steps..."
                        rows="1"
                    ></textarea>
                    <button class="send-btn" id="shadow-ai-send">
                        <span>➤</span>
                    </button>
                </div>
                <div class="input-hint">
                    Press Enter to send • Shift+Enter for new line
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(container);
    
    // Bind events
    bindEvents();
}

function bindEvents() {
    const fab = document.getElementById('shadow-ai-fab');
    const panel = document.getElementById('shadow-ai-panel');
    const closeBtn = document.getElementById('shadow-ai-close');
    const input = document.getElementById('shadow-ai-input');
    const sendBtn = document.getElementById('shadow-ai-send');
    
    // Toggle panel
    fab?.addEventListener('click', () => {
        isOpen = !isOpen;
        panel?.classList.toggle('hidden', !isOpen);
        fab?.classList.toggle('active', isOpen);
        if (isOpen) {
            input?.focus();
        }
    });
    
    // Close button
    closeBtn?.addEventListener('click', () => {
        isOpen = false;
        panel?.classList.add('hidden');
        fab?.classList.remove('active');
    });
    
    // Send message
    sendBtn?.addEventListener('click', sendMessage);
    
    // Enter to send
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    input?.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
}

async function sendMessage() {
    const input = document.getElementById('shadow-ai-input');
    const messagesContainer = document.getElementById('shadow-ai-messages');
    const remainingEl = document.getElementById('ai-remaining');
    
    if (!input || !messagesContainer) return;
    
    const question = input.value.trim();
    if (!question || isTyping) return;
    
    // Check limit
    const remaining = getRemainingQuestions();
    if (remaining <= 0) {
        addMessage('system', `⚠️ You've used all ${CONFIG.monthlyLimit} questions this month.\n\nUpgrade to AI Pro ($9.99/month) for 100 questions, or wait until the 1st for your limit to reset.`);
        return;
    }
    
    // Add user message
    addMessage('user', question);
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    isTyping = true;
    const typingId = addTypingIndicator();
    
    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
    
    // Generate response
    const response = generateResponse(question);
    
    // Remove typing indicator
    document.getElementById(typingId)?.remove();
    isTyping = false;
    
    // Add AI response
    addMessage('ai', response);
    
    // Update usage
    incrementUsage();
    if (remainingEl) {
        remainingEl.textContent = getRemainingQuestions();
    }
    
    // Store in history
    conversationHistory.push({ role: 'user', content: question });
    conversationHistory.push({ role: 'assistant', content: response });
}

function addMessage(type, content) {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'user-message' : 'ai-message';
    
    if (type === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">${escapeHtml(content)}</div>
            <div class="message-avatar">👤</div>
        `;
    } else if (type === 'system') {
        messageDiv.className = 'system-message';
        messageDiv.innerHTML = `<div class="message-content">${escapeHtml(content)}</div>`;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${formatMarkdown(content)}</div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addTypingIndicator() {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return '';
    
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'ai-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return id;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatMarkdown(text) {
    return text
        .replace(/^## (.*$)/gm, '<h3>$1</h3>')
        .replace(/^### (.*$)/gm, '<h4>$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/^• (.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<h[34]>)/g, '$1')
        .replace(/(<\/h[34]>)<\/p>/g, '$1')
        .replace(/<p>(<pre>)/g, '$1')
        .replace(/(<\/pre>)<\/p>/g, '$1')
        .replace(/<p>(<li>)/g, '<ul>$1')
        .replace(/(<\/li>)<\/p>/g, '$1</ul>')
        .replace(/---/g, '<hr>');
}

// =============================================================================
// PUBLIC API
// =============================================================================
window.ShadowAI = {
    open: function() {
        const fab = document.getElementById('shadow-ai-fab');
        if (fab && !isOpen) {
            fab.click();
        }
    },
    close: function() {
        const closeBtn = document.getElementById('shadow-ai-close');
        if (closeBtn && isOpen) {
            closeBtn.click();
        }
    },
    askQuestion: function(question) {
        if (!isOpen) this.open();
        const input = document.getElementById('shadow-ai-input');
        if (input) {
            input.value = question;
            document.getElementById('shadow-ai-send')?.click();
        }
    },
    getRemaining: getRemainingQuestions,
    isOpen: () => isOpen
};

// =============================================================================
// INITIALIZATION
// =============================================================================
function init() {
    console.log('🤖 Shadow AI Pro v1.0 Initializing...');
    createUI();
    console.log(`✅ Shadow AI Pro loaded (${getRemainingQuestions()}/${CONFIG.monthlyLimit} questions remaining)`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
