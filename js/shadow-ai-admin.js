/* =============================================================================
   SHADOW AI - ADMIN VERSION v1.0
   ShadowBanCheck.io - Admin Command Center (Unlimited)
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    demoUsername: '@ghost081280',
    storageKey: 'shadow_ai_admin_v1'
};

// Demo users database for lookup
const DEMO_USERS = {
    'john@example.com': {
        name: 'John Smith',
        plan: 'Pro',
        joined: '2025-09-15',
        scans: 47,
        lastScan: '2025-11-26',
        accounts: ['@johnsmith (Twitter)', '@john.smith (Instagram)']
    },
    'sarah@agency.com': {
        name: 'Sarah Marketing',
        plan: 'Agency',
        joined: '2025-08-01',
        scans: 312,
        lastScan: '2025-11-27',
        accounts: ['Multiple agency clients']
    },
    'demo@test.com': {
        name: 'Demo User',
        plan: 'Pro',
        joined: '2025-11-01',
        scans: 12,
        lastScan: '2025-11-27',
        accounts: [`${CONFIG.demoUsername} (Twitter)`]
    }
};

// =============================================================================
// UI STATE
// =============================================================================
let isOpen = false;
let isTyping = false;
let conversationHistory = [];

// =============================================================================
// COMMAND PROCESSING
// =============================================================================
function processCommand(input) {
    const cmd = input.toLowerCase().trim();
    
    // Engine check command
    if (cmd.startsWith('check ')) {
        return processCheckCommand(input.substring(6));
    }
    
    // User lookup command
    if (cmd.startsWith('lookup ')) {
        return processLookupCommand(input.substring(7));
    }
    
    // Stats command
    if (cmd === 'stats' || cmd === 'dashboard' || cmd === 'status') {
        return generateStatsResponse();
    }
    
    // Messages/support command
    if (cmd === 'messages' || cmd === 'support' || cmd === 'tickets') {
        return generateMessagesResponse();
    }
    
    // Help command
    if (cmd === 'help' || cmd === 'commands' || cmd === '?') {
        return generateHelpResponse();
    }
    
    // Users command
    if (cmd === 'users' || cmd === 'subscribers') {
        return generateUsersResponse();
    }
    
    // Revenue command
    if (cmd === 'revenue' || cmd === 'billing' || cmd === 'mrr') {
        return generateRevenueResponse();
    }
    
    // Otherwise, treat as regular AI question
    return generateAIResponse(input);
}

function processCheckCommand(query) {
    // Parse: @username on platform
    const match = query.match(/@?(\w+)\s+(?:on\s+)?(\w+)/i);
    
    if (!match) {
        return `⚠️ **Invalid check command format**\n\nUsage: \`check @username on platform\`\n\nExamples:\n• \`check ${CONFIG.demoUsername} on twitter\`\n• \`check @acmecorp on instagram\``;
    }
    
    const username = match[1];
    const platform = match[2].toLowerCase();
    
    // Simulate engine scan
    return simulateEngineScan(username, platform);
}

function simulateEngineScan(username, platform) {
    // Generate realistic scores
    const factors = {
        search: Math.floor(Math.random() * 30) + 70,
        reply: Math.floor(Math.random() * 50) + 50,
        suggestion: Math.floor(Math.random() * 25) + 75,
        distribution: Math.floor(Math.random() * 40) + 60,
        standing: Math.floor(Math.random() * 15) + 85
    };
    
    const overall = Math.floor((factors.search + factors.reply + factors.suggestion + factors.distribution + factors.standing) / 5);
    const score = 100 - overall;
    
    const getStatus = (val) => {
        if (val >= 90) return '✅ PASS';
        if (val >= 70) return '⚠️ WARN';
        return '❌ FAIL';
    };
    
    const getOverallStatus = (s) => {
        if (s <= 25) return { emoji: '🟢', text: 'HEALTHY', color: 'healthy' };
        if (s <= 50) return { emoji: '🟡', text: 'MILD ISSUES', color: 'warning' };
        if (s <= 75) return { emoji: '🟠', text: 'RESTRICTED', color: 'issues' };
        return { emoji: '🔴', text: 'SEVERE', color: 'critical' };
    };
    
    const status = getOverallStatus(score);
    const platformNames = {
        twitter: 'Twitter/X',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        reddit: 'Reddit',
        youtube: 'YouTube',
        facebook: 'Facebook',
        linkedin: 'LinkedIn'
    };
    
    return `## 🔍 Engine Scan Results

**Account:** @${username}
**Platform:** ${platformNames[platform] || platform}
**Scanned:** ${new Date().toLocaleString()}

---

### Factor Analysis:

\`\`\`
Search Visibility:    ${getStatus(factors.search)} (${factors.search}%)
Reply Visibility:     ${getStatus(factors.reply)} (${factors.reply}%)
Suggestions:          ${getStatus(factors.suggestion)} (${factors.suggestion}%)
Distribution:         ${getStatus(factors.distribution)} (${factors.distribution}%)
Account Standing:     ${getStatus(factors.standing)} (${factors.standing}%)
─────────────────────────────────────────
Overall Score:        ${score}% ${status.emoji} ${status.text}
\`\`\`

### Diagnosis:
${score <= 25 ? 
    'No significant restrictions detected. Account appears to have normal visibility.' :
score <= 50 ?
    'Minor signals detected. Could be temporary algorithm fluctuation. Recommend monitoring.' :
score <= 75 ?
    'Multiple restriction indicators present. Likely experiencing reduced visibility. Recovery steps recommended.' :
    'Severe restrictions detected. Account appears to be heavily suppressed. Immediate action required.'
}

### Admin Actions:
• \`lookup user@email.com\` - Find user by email
• \`messages\` - View support tickets for this issue
• \`stats\` - View platform-wide statistics`;
}

function processLookupCommand(email) {
    const user = DEMO_USERS[email.toLowerCase().trim()];
    
    if (!user) {
        return `⚠️ **User not found:** ${email}\n\nTry one of these demo users:\n• john@example.com\n• sarah@agency.com\n• demo@test.com`;
    }
    
    return `## 👤 User Lookup: ${email}

**Name:** ${user.name}
**Plan:** ${user.plan}
**Joined:** ${user.joined}
**Total Scans:** ${user.scans}
**Last Scan:** ${user.lastScan}

### Monitored Accounts:
${user.accounts.map(a => `• ${a}`).join('\n')}

### Admin Actions:
• View full scan history
• Modify subscription
• Send direct message
• Reset usage limits`;
}

function generateStatsResponse() {
    return `## 📊 Dashboard Stats

### Users
• **Total Users:** 1,247
• **Pro Subscribers:** 312
• **Agency Accounts:** 28
• **Free Users:** 907

### Activity (Today)
• **Scans Run:** 847
• **AI Questions:** 234
• **New Signups:** 18
• **Disputes Filed:** 7

### Activity (This Month)
• **Total Scans:** 24,891
• **AI Questions:** 6,432
• **New Signups:** 412
• **Disputes Filed:** 89
• **Successful Appeals:** 41 (46%)

### Revenue
• **MRR:** $4,891
• **Pro Revenue:** $2,808 (312 × $9)
• **Agency Revenue:** $1,820 (28 × $29 + clients)
• **Overage:** $263

---
*Type \`revenue\` for detailed breakdown*`;
}

function generateMessagesResponse() {
    return `## 📬 Recent Support Messages

### Priority Tickets:

**🔴 HIGH** - 2 hours ago
*From: enterprise@bigcorp.com*
"Our agency account scans are failing. Need immediate assistance."
→ **Action:** Investigate API limits

**🟡 MEDIUM** - 5 hours ago
*From: john@example.com*
"My Pro subscription didn't renew correctly. Being charged twice."
→ **Action:** Check Stripe webhook

**🟡 MEDIUM** - 8 hours ago
*From: creator@youtube.com*
"False positive on my YouTube scan. I'm definitely not shadow banned."
→ **Action:** Review detection algorithm

### Resolved Today: 12
### Open Tickets: 7
### Avg Response Time: 2.4 hours

---
*Reply to ticket: \`reply <ticket-id> <message>\`*`;
}

function generateUsersResponse() {
    return `## 👥 User Overview

### By Plan:
\`\`\`
Free Users:     907  (72.8%)
Pro ($9/mo):    312  (25.0%)
Agency ($29+):   28  (2.2%)
─────────────────────────
Total:        1,247
\`\`\`

### Growth (Last 30 Days):
• New signups: 412
• Upgrades to Pro: 47
• Upgrades to Agency: 3
• Churned: 18
• Net growth: +394

### Top Users by Scans:
1. sarah@agency.com - 312 scans (Agency)
2. marketing@acme.com - 189 scans (Agency)
3. social@brand.com - 156 scans (Agency)
4. john@example.com - 47 scans (Pro)
5. demo@test.com - 12 scans (Pro)

---
*Use \`lookup email@domain.com\` for user details*`;
}

function generateRevenueResponse() {
    return `## 💰 Revenue Dashboard

### Monthly Recurring Revenue:
\`\`\`
Pro Subscriptions:    $2,808  (312 × $9)
Agency Base:          $  812  (28 × $29)
Agency Per-Client:    $  420  (84 clients × $5)
─────────────────────────────────────────
Subscription MRR:     $4,040
\`\`\`

### Usage Revenue (This Month):
\`\`\`
Overage Scans:        $  156  (1,950 × $0.08)
Overage AI:           $   48  (1,200 × $0.04)
Agency Usage:         $  587  (scans + AI)
Dispute Submissions:  $   89  (89 × $1)
─────────────────────────────────────────
Usage Revenue:        $  880
\`\`\`

### Total MRR: $4,920

### Month-over-Month:
• Revenue: +12.3%
• Users: +8.7%
• Scans: +15.2%

### Stripe Status:
• ✅ All webhooks healthy
• ✅ No failed charges today
• ⚠️ 3 cards expiring this week`;
}

function generateHelpResponse() {
    return `## 🛠️ Admin Command Center

### Engine Commands:
• \`check @username on platform\` - Run shadow ban scan
  *Example: check ${CONFIG.demoUsername} on twitter*

### User Commands:
• \`lookup email@domain.com\` - Find user by email
• \`users\` - View user statistics

### Dashboard Commands:
• \`stats\` - View dashboard overview
• \`revenue\` or \`mrr\` - Revenue breakdown
• \`messages\` - Support ticket queue

### Examples:
\`\`\`
check @acmecorp on instagram
lookup john@example.com
stats
revenue
messages
\`\`\`

---
*You can also ask me anything about shadow bans, the platform, or users!*`;
}

function generateAIResponse(question) {
    const q = question.toLowerCase();
    
    // Platform questions
    if (q.includes('twitter') || q.includes('instagram') || q.includes('tiktok')) {
        return `## Platform Intelligence\n\nAs an admin, you have full access to all platform detection algorithms.\n\n**Quick Engine Check:**\n\`check @username on twitter\`\n\n**View Aggregate Data:**\n\`stats\`\n\nWhat specific platform data do you need?`;
    }
    
    // User questions
    if (q.includes('user') || q.includes('subscriber') || q.includes('customer')) {
        return generateUsersResponse();
    }
    
    // Revenue questions
    if (q.includes('revenue') || q.includes('money') || q.includes('earning')) {
        return generateRevenueResponse();
    }
    
    // Default
    return `## 🤖 Admin AI Assistant

I'm your admin command center assistant. I can help with:

**Engine Operations:**
• Run shadow ban scans on any account
• View detection algorithm results
• Analyze platform-specific signals

**User Management:**
• Look up user accounts
• View subscription status
• Check scan history

**Business Intelligence:**
• Revenue analytics
• User growth metrics
• Support ticket management

**Try these commands:**
• \`check ${CONFIG.demoUsername} on twitter\`
• \`lookup demo@test.com\`
• \`stats\`
• \`revenue\`
• \`messages\`

---
*Type \`help\` for full command list*`;
}

// =============================================================================
// UI FUNCTIONS
// =============================================================================
function createUI() {
    if (document.getElementById('shadow-ai-admin-container')) return;
    
    const container = document.createElement('div');
    container.id = 'shadow-ai-admin-container';
    container.innerHTML = `
        <!-- Floating Button -->
        <button class="shadow-ai-fab admin-fab" id="shadow-ai-fab" title="Admin Command Center">
            <span class="fab-icon">🛠️</span>
            <span class="fab-pulse"></span>
        </button>
        
        <!-- Chat Panel -->
        <div class="shadow-ai-panel admin-panel hidden" id="shadow-ai-panel">
            <div class="shadow-ai-header admin-header">
                <div class="header-left">
                    <span class="header-icon">🛠️</span>
                    <div class="header-info">
                        <span class="header-title">Command Center</span>
                        <span class="header-subtitle">Admin • Unlimited Access</span>
                    </div>
                </div>
                <button class="header-close" id="shadow-ai-close">&times;</button>
            </div>
            
            <div class="shadow-ai-messages" id="shadow-ai-messages">
                <div class="ai-message">
                    <div class="message-avatar">🛠️</div>
                    <div class="message-content">
                        <p><strong>Admin Command Center Online</strong></p>
                        <p>Quick commands:</p>
                        <ul>
                            <li><code>check @user on platform</code> - Engine scan</li>
                            <li><code>lookup email</code> - User lookup</li>
                            <li><code>stats</code> - Dashboard metrics</li>
                            <li><code>help</code> - All commands</li>
                        </ul>
                        <p>Try: <code>check ${CONFIG.demoUsername} on twitter</code></p>
                    </div>
                </div>
            </div>
            
            <div class="shadow-ai-input-area">
                <div class="input-wrapper">
                    <textarea 
                        id="shadow-ai-input" 
                        placeholder="Enter command or ask a question..."
                        rows="1"
                    ></textarea>
                    <button class="send-btn" id="shadow-ai-send">
                        <span>➤</span>
                    </button>
                </div>
                <div class="input-hint">
                    Enter to send • Try: stats, revenue, messages
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(container);
    bindEvents();
}

function bindEvents() {
    const fab = document.getElementById('shadow-ai-fab');
    const panel = document.getElementById('shadow-ai-panel');
    const closeBtn = document.getElementById('shadow-ai-close');
    const input = document.getElementById('shadow-ai-input');
    const sendBtn = document.getElementById('shadow-ai-send');
    
    fab?.addEventListener('click', () => {
        isOpen = !isOpen;
        panel?.classList.toggle('hidden', !isOpen);
        fab?.classList.toggle('active', isOpen);
        if (isOpen) input?.focus();
    });
    
    closeBtn?.addEventListener('click', () => {
        isOpen = false;
        panel?.classList.add('hidden');
        fab?.classList.remove('active');
    });
    
    sendBtn?.addEventListener('click', sendMessage);
    
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    input?.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
}

async function sendMessage() {
    const input = document.getElementById('shadow-ai-input');
    const messagesContainer = document.getElementById('shadow-ai-messages');
    
    if (!input || !messagesContainer) return;
    
    const question = input.value.trim();
    if (!question || isTyping) return;
    
    addMessage('user', question);
    input.value = '';
    input.style.height = 'auto';
    
    isTyping = true;
    const typingId = addTypingIndicator();
    
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
    
    const response = processCommand(question);
    
    document.getElementById(typingId)?.remove();
    isTyping = false;
    
    addMessage('ai', response);
    
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
            <div class="message-avatar">👑</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">🛠️</div>
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
        <div class="message-avatar">🛠️</div>
        <div class="message-content">
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return id;
}

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
    open: () => { 
        const fab = document.getElementById('shadow-ai-fab');
        if (fab && !isOpen) fab.click();
    },
    close: () => {
        const closeBtn = document.getElementById('shadow-ai-close');
        if (closeBtn && isOpen) closeBtn.click();
    },
    runCommand: (cmd) => {
        if (!isOpen) window.ShadowAI.open();
        const input = document.getElementById('shadow-ai-input');
        if (input) {
            input.value = cmd;
            document.getElementById('shadow-ai-send')?.click();
        }
    },
    isOpen: () => isOpen
};

// =============================================================================
// INITIALIZATION
// =============================================================================
function init() {
    console.log('🛠️ Shadow AI Admin v1.0 Initializing...');
    createUI();
    console.log('✅ Admin Command Center loaded');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
