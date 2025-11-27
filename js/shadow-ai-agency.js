/* =============================================================================
   SHADOW AI - AGENCY VERSION v1.0
   ShadowBanCheck.io - Agency AI Assistant (Unlimited, Usage-Based)
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    storageKey: 'shadow_ai_agency_v1',
    demoUsername: '@ghost081280'
};

// Demo clients
const CLIENTS = {
    'acme-corp': {
        id: 'acme-corp',
        name: 'ACME Corporation',
        icon: '🏭',
        contact: 'marketing@acmecorp.com',
        accounts: [
            { platform: 'twitter', username: '@acmecorp', status: 'healthy', score: 15 },
            { platform: 'instagram', username: '@acme.corp', status: 'warning', score: 42 },
            { platform: 'linkedin', username: 'acme-corporation', status: 'healthy', score: 8 }
        ]
    },
    'tech-startup': {
        id: 'tech-startup',
        name: 'Tech Startup Inc',
        icon: '🚀',
        contact: 'social@techstartup.io',
        accounts: [
            { platform: 'twitter', username: '@techstartup', status: 'issues', score: 67 },
            { platform: 'tiktok', username: '@techstartup', status: 'healthy', score: 22 }
        ]
    },
    'local-restaurant': {
        id: 'local-restaurant',
        name: 'Local Restaurant',
        icon: '🍕',
        contact: 'owner@localrestaurant.com',
        accounts: [
            { platform: 'instagram', username: '@localfood', status: 'banned', score: 85 },
            { platform: 'facebook', username: 'localrestaurant', status: 'warning', score: 38 }
        ]
    }
};

// =============================================================================
// STATE
// =============================================================================
let isOpen = false;
let isTyping = false;
let currentClient = null;
let conversationHistory = [];

// =============================================================================
// CLIENT CONTEXT
// =============================================================================
function setClient(clientId) {
    currentClient = CLIENTS[clientId] || null;
    updateContextBanner();
}

function clearClient() {
    currentClient = null;
    updateContextBanner();
}

function updateContextBanner() {
    const banner = document.getElementById('client-context-banner');
    if (!banner) return;
    
    if (currentClient) {
        banner.classList.remove('hidden');
        banner.innerHTML = `
            <span>${currentClient.icon} ${currentClient.name}</span>
            <button onclick="window.ShadowAI.clearClient()" title="Clear context">&times;</button>
        `;
    } else {
        banner.classList.add('hidden');
    }
}

// =============================================================================
// COMMAND PROCESSING
// =============================================================================
function processInput(input) {
    const cmd = input.toLowerCase().trim();
    
    // Client commands
    if (cmd === 'clients' || cmd === 'show clients' || cmd === 'list clients') {
        return generateClientsResponse();
    }
    
    if (cmd.startsWith('select ')) {
        const clientName = cmd.substring(7).trim();
        return selectClientByName(clientName);
    }
    
    if (cmd === 'clear' || cmd === 'clear client' || cmd === 'deselect') {
        clearClient();
        return '✅ Client context cleared. Responses will now be general.';
    }
    
    // Status commands
    if (cmd === 'status' || cmd === 'overview') {
        if (currentClient) {
            return generateClientStatusResponse(currentClient);
        }
        return generateOverviewResponse();
    }
    
    // Accounts command
    if (cmd === 'accounts' || cmd === 'list accounts') {
        if (currentClient) {
            return generateAccountsResponse(currentClient);
        }
        return generateAllAccountsResponse();
    }
    
    // Issues command
    if (cmd === 'issues' || cmd === 'problems') {
        return generateIssuesResponse();
    }
    
    // Recovery command
    if (cmd === 'recovery' || cmd === 'recover' || cmd.includes('recovery plan')) {
        if (currentClient) {
            return generateRecoveryPlanResponse(currentClient);
        }
        return '⚠️ Select a client first with `select [client name]` to generate a recovery plan.';
    }
    
    // Bulk check command
    if (cmd === 'check all' || cmd === 'bulk check' || cmd === 'scan all') {
        return generateBulkCheckResponse();
    }
    
    // Report command
    if (cmd === 'report' || cmd.includes('generate report')) {
        if (currentClient) {
            return generateReportResponse(currentClient);
        }
        return 'Select a client first with `select [client name]` to generate a report.';
    }
    
    // Help command
    if (cmd === 'help' || cmd === 'commands' || cmd === '?') {
        return generateHelpResponse();
    }
    
    // Otherwise, treat as AI question
    return generateAIResponse(input);
}

function selectClientByName(name) {
    const nameLower = name.toLowerCase();
    
    for (const [id, client] of Object.entries(CLIENTS)) {
        if (client.name.toLowerCase().includes(nameLower) || id.includes(nameLower)) {
            setClient(id);
            return `✅ **Client Selected: ${client.icon} ${client.name}**\n\nAll responses will now be in the context of this client.\n\n**Quick Actions:**\n• \`status\` - View client status\n• \`accounts\` - List monitored accounts\n• \`recovery\` - Generate recovery plan\n• \`report\` - Generate client report\n• \`clear\` - Deselect client`;
        }
    }
    
    return `⚠️ Client not found: "${name}"\n\nAvailable clients:\n${Object.values(CLIENTS).map(c => `• ${c.icon} ${c.name}`).join('\n')}\n\nTry: \`select ACME\` or \`select restaurant\``;
}

// =============================================================================
// RESPONSE GENERATORS
// =============================================================================
function generateClientsResponse() {
    let response = '## 👥 Your Clients\n\n';
    
    for (const client of Object.values(CLIENTS)) {
        const statusCounts = {
            healthy: client.accounts.filter(a => a.status === 'healthy').length,
            warning: client.accounts.filter(a => a.status === 'warning').length,
            issues: client.accounts.filter(a => a.status === 'issues' || a.status === 'banned').length
        };
        
        const overallStatus = statusCounts.issues > 0 ? '🔴' : statusCounts.warning > 0 ? '🟡' : '🟢';
        
        response += `### ${client.icon} ${client.name}\n`;
        response += `${overallStatus} ${client.accounts.length} accounts • `;
        response += `${statusCounts.healthy} healthy`;
        if (statusCounts.warning) response += ` • ${statusCounts.warning} warning`;
        if (statusCounts.issues) response += ` • ${statusCounts.issues} issues`;
        response += `\n\n`;
    }
    
    response += `---\n*Select a client: \`select ACME\` or \`select restaurant\`*`;
    
    return response;
}

function generateClientStatusResponse(client) {
    const accounts = client.accounts;
    const healthy = accounts.filter(a => a.status === 'healthy').length;
    const warning = accounts.filter(a => a.status === 'warning').length;
    const issues = accounts.filter(a => a.status === 'issues' || a.status === 'banned').length;
    
    let response = `## ${client.icon} ${client.name} Status\n\n`;
    response += `**Contact:** ${client.contact}\n`;
    response += `**Accounts:** ${accounts.length} monitored\n\n`;
    
    response += `### Account Health:\n`;
    response += `\`\`\`\n`;
    response += `Healthy:  ${'🟢'.repeat(healthy)} ${healthy}\n`;
    response += `Warning:  ${'🟡'.repeat(warning)} ${warning}\n`;
    response += `Issues:   ${'🔴'.repeat(issues)} ${issues}\n`;
    response += `\`\`\`\n\n`;
    
    response += `### Accounts:\n`;
    for (const account of accounts) {
        const statusIcon = account.status === 'healthy' ? '✅' : 
                          account.status === 'warning' ? '⚠️' : '❌';
        response += `${statusIcon} **${account.username}** (${account.platform}) - ${account.score}%\n`;
    }
    
    if (issues > 0) {
        response += `\n---\n⚠️ *This client has ${issues} account(s) needing attention. Type \`recovery\` for a recovery plan.*`;
    }
    
    return response;
}

function generateAccountsResponse(client) {
    let response = `## ${client.icon} ${client.name} - Accounts\n\n`;
    
    for (const account of client.accounts) {
        const statusIcon = account.status === 'healthy' ? '🟢' : 
                          account.status === 'warning' ? '🟡' : '🔴';
        const statusText = account.status === 'healthy' ? 'Healthy' :
                          account.status === 'warning' ? 'Warning' : 'Issues';
        
        const platformName = {
            twitter: 'Twitter/X 𝕏',
            instagram: 'Instagram 📷',
            tiktok: 'TikTok ♪',
            facebook: 'Facebook ⓕ',
            linkedin: 'LinkedIn in',
            youtube: 'YouTube ▶️',
            reddit: 'Reddit 🔴'
        }[account.platform] || account.platform;
        
        response += `### ${platformName}\n`;
        response += `**Username:** ${account.username}\n`;
        response += `**Status:** ${statusIcon} ${statusText}\n`;
        response += `**Score:** ${account.score}%\n\n`;
    }
    
    return response;
}

function generateAllAccountsResponse() {
    let response = '## 📊 All Client Accounts\n\n';
    
    let totalAccounts = 0;
    let totalHealthy = 0;
    let totalIssues = 0;
    
    for (const client of Object.values(CLIENTS)) {
        response += `### ${client.icon} ${client.name}\n`;
        
        for (const account of client.accounts) {
            totalAccounts++;
            if (account.status === 'healthy') totalHealthy++;
            if (account.status === 'issues' || account.status === 'banned') totalIssues++;
            
            const statusIcon = account.status === 'healthy' ? '✅' : 
                              account.status === 'warning' ? '⚠️' : '❌';
            response += `${statusIcon} ${account.username} (${account.platform}) - ${account.score}%\n`;
        }
        response += '\n';
    }
    
    response += `---\n`;
    response += `**Total:** ${totalAccounts} accounts • ${totalHealthy} healthy • ${totalIssues} need attention`;
    
    return response;
}

function generateIssuesResponse() {
    let response = '## ⚠️ Accounts Needing Attention\n\n';
    
    let hasIssues = false;
    
    for (const client of Object.values(CLIENTS)) {
        const issueAccounts = client.accounts.filter(a => a.status !== 'healthy');
        
        if (issueAccounts.length > 0) {
            hasIssues = true;
            response += `### ${client.icon} ${client.name}\n`;
            
            for (const account of issueAccounts) {
                const statusIcon = account.status === 'warning' ? '🟡' : '🔴';
                const statusText = account.status === 'warning' ? 'Warning' : 
                                  account.status === 'banned' ? 'BANNED' : 'Issues';
                
                response += `${statusIcon} **${account.username}** (${account.platform})\n`;
                response += `   Score: ${account.score}% • Status: ${statusText}\n\n`;
            }
        }
    }
    
    if (!hasIssues) {
        response = '## ✅ All Clear!\n\nNo accounts currently need attention. All clients have healthy status.';
    } else {
        response += `---\n*Use \`select [client]\` then \`recovery\` for a detailed recovery plan.*`;
    }
    
    return response;
}

function generateRecoveryPlanResponse(client) {
    const issueAccounts = client.accounts.filter(a => a.status !== 'healthy');
    
    if (issueAccounts.length === 0) {
        return `## ✅ ${client.icon} ${client.name} - All Healthy\n\nNo recovery plan needed! All accounts are in good standing.`;
    }
    
    let response = `## 🔧 Recovery Plan: ${client.icon} ${client.name}\n\n`;
    
    for (const account of issueAccounts) {
        const platformTips = {
            twitter: [
                'Reduce hashtag usage to 2-3 per tweet',
                'Avoid engagement bait patterns',
                'Engage authentically for 2-3 weeks',
                'Review and delete any flagged content'
            ],
            instagram: [
                'Take a 48-72 hour posting break',
                'Remove any banned hashtags',
                'Use only 5-10 relevant hashtags',
                'Post Reels for better algorithm favor'
            ],
            facebook: [
                'Avoid fact-checker flagged content',
                'Reduce external links',
                'Post native video content',
                'Encourage meaningful comments'
            ],
            tiktok: [
                'Check for Community Guideline violations',
                'Wait 1-2 weeks before posting',
                'Create 100% original content',
                'Engage in your niche community'
            ]
        }[account.platform] || [
            'Review content for policy violations',
            'Reduce posting frequency',
            'Engage authentically',
            'Consider filing an appeal'
        ];
        
        const severity = account.score >= 70 ? 'SEVERE' : account.score >= 50 ? 'MODERATE' : 'MILD';
        const timeline = account.score >= 70 ? '4-6 weeks' : account.score >= 50 ? '2-3 weeks' : '1-2 weeks';
        
        response += `### ${account.username} (${account.platform})\n`;
        response += `**Severity:** ${severity} (${account.score}%)\n`;
        response += `**Expected Recovery:** ${timeline}\n\n`;
        response += `**Action Plan:**\n`;
        platformTips.forEach((tip, i) => {
            response += `${i + 1}. ${tip}\n`;
        });
        response += '\n';
    }
    
    response += `---\n💡 *Use the Resolution Center to file formal appeals for these accounts.*`;
    
    return response;
}

function generateBulkCheckResponse() {
    const totalAccounts = Object.values(CLIENTS).reduce((sum, c) => sum + c.accounts.length, 0);
    const cost = (totalAccounts * 0.05).toFixed(2);
    
    return `## ⚡ Bulk Check - All Clients

**Total Accounts:** ${totalAccounts}
**Estimated Cost:** $${cost} (${totalAccounts} × $0.05)

### Clients to Check:
${Object.values(CLIENTS).map(c => `• ${c.icon} ${c.name} (${c.accounts.length} accounts)`).join('\n')}

---
*To run bulk check, click "⚡ Bulk Check" in the dashboard, or use the Bulk Check section.*`;
}

function generateReportResponse(client) {
    return `## 📄 Report: ${client.icon} ${client.name}

**Generated:** ${new Date().toLocaleDateString()}

### Summary:
• **Total Accounts:** ${client.accounts.length}
• **Healthy:** ${client.accounts.filter(a => a.status === 'healthy').length}
• **Need Attention:** ${client.accounts.filter(a => a.status !== 'healthy').length}

### Account Details:
${client.accounts.map(a => `• ${a.username} (${a.platform}): ${a.score}% - ${a.status}`).join('\n')}

### Recommendations:
${client.accounts.filter(a => a.status !== 'healthy').length > 0 ?
    'Action required on flagged accounts. See recovery plan for details.' :
    'All accounts healthy. Continue current practices.'}

---
*Click "📄 Reports" in dashboard to generate PDF/CSV exports.*`;
}

function generateOverviewResponse() {
    const allAccounts = Object.values(CLIENTS).flatMap(c => c.accounts);
    const healthy = allAccounts.filter(a => a.status === 'healthy').length;
    const warning = allAccounts.filter(a => a.status === 'warning').length;
    const issues = allAccounts.filter(a => a.status === 'issues' || a.status === 'banned').length;
    
    return `## 📊 Agency Overview

### Clients: ${Object.keys(CLIENTS).length}
### Total Accounts: ${allAccounts.length}

### Health Breakdown:
\`\`\`
Healthy:  ${'█'.repeat(healthy)} ${healthy}
Warning:  ${'█'.repeat(warning)} ${warning}
Issues:   ${'█'.repeat(issues)} ${issues}
\`\`\`

### Quick Stats:
• **Healthy Rate:** ${Math.round(healthy / allAccounts.length * 100)}%
• **Needs Attention:** ${warning + issues} accounts
• **Urgent (Banned):** ${allAccounts.filter(a => a.status === 'banned').length}

---
*Commands: \`clients\`, \`issues\`, \`bulk check\`*`;
}

function generateHelpResponse() {
    return `## 🏢 Agency AI Commands

### Client Management:
• \`clients\` - List all clients
• \`select [name]\` - Select a client
• \`clear\` - Deselect client
• \`status\` - Client/overall status

### Account Operations:
• \`accounts\` - List accounts
• \`issues\` - Show problem accounts
• \`bulk check\` - Check all accounts
• \`recovery\` - Generate recovery plan

### Reporting:
• \`report\` - Generate client report

### Examples:
\`\`\`
clients
select ACME
status
recovery
clear
issues
\`\`\`

---
*You can also ask me anything about shadow bans!*`;
}

function generateAIResponse(question) {
    const q = question.toLowerCase();
    
    // Context-aware responses
    if (currentClient) {
        if (q.includes('help') || q.includes('what') || q.includes('how')) {
            return `## ${currentClient.icon} ${currentClient.name} - Help

I'm here to help manage ${currentClient.name}'s social accounts.

**Quick Commands:**
• \`status\` - Current account health
• \`accounts\` - List all accounts
• \`recovery\` - Get recovery plan
• \`report\` - Generate report

**Account Summary:**
${currentClient.accounts.map(a => `• ${a.username}: ${a.status} (${a.score}%)`).join('\n')}

What would you like to know about ${currentClient.name}?`;
        }
    }
    
    // General responses
    if (q.includes('shadow ban') || q.includes('shadowban')) {
        return `## Understanding Shadow Bans for Agencies

Shadow bans affect your clients' visibility without warning. As an agency, you need to:

1. **Monitor proactively** - Check accounts weekly
2. **Act fast** - Early detection = faster recovery
3. **Document everything** - Keep scan history for clients
4. **Use Resolution Center** - Professional appeals get better results

**Your Current Status:**
${Object.values(CLIENTS).map(c => {
    const issues = c.accounts.filter(a => a.status !== 'healthy').length;
    return `• ${c.icon} ${c.name}: ${issues ? `${issues} issues` : 'All healthy'}`;
}).join('\n')}

Type \`issues\` to see accounts needing attention.`;
    }
    
    return generateOverviewResponse();
}

// =============================================================================
// UI FUNCTIONS
// =============================================================================
function createUI() {
    if (document.getElementById('shadow-ai-agency-container')) return;
    
    const container = document.createElement('div');
    container.id = 'shadow-ai-agency-container';
    container.innerHTML = `
        <!-- Floating Button -->
        <button class="shadow-ai-fab agency-fab" id="shadow-ai-fab" title="Agency AI Assistant">
            <span class="fab-icon">🏢</span>
            <span class="fab-pulse"></span>
        </button>
        
        <!-- Chat Panel -->
        <div class="shadow-ai-panel agency-panel hidden" id="shadow-ai-panel">
            <div class="shadow-ai-header agency-header">
                <div class="header-left">
                    <span class="header-icon">🏢</span>
                    <div class="header-info">
                        <span class="header-title">Agency AI</span>
                        <span class="header-subtitle">Unlimited • Usage-Based</span>
                    </div>
                </div>
                <button class="header-close" id="shadow-ai-close">&times;</button>
            </div>
            
            <!-- Client Context Banner -->
            <div class="client-context-banner hidden" id="client-context-banner"></div>
            
            <div class="shadow-ai-messages" id="shadow-ai-messages">
                <div class="ai-message">
                    <div class="message-avatar">🏢</div>
                    <div class="message-content">
                        <p><strong>Agency AI Assistant</strong></p>
                        <p>I'll help you manage your clients' social accounts.</p>
                        <p><strong>Quick commands:</strong></p>
                        <ul>
                            <li><code>clients</code> - List your clients</li>
                            <li><code>select ACME</code> - Select a client</li>
                            <li><code>issues</code> - Show problem accounts</li>
                            <li><code>help</code> - All commands</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="shadow-ai-input-area">
                <div class="input-wrapper">
                    <textarea 
                        id="shadow-ai-input" 
                        placeholder="Ask about clients or enter a command..."
                        rows="1"
                    ></textarea>
                    <button class="send-btn" id="shadow-ai-send">
                        <span>➤</span>
                    </button>
                </div>
                <div class="input-hint">
                    Enter to send • Try: clients, issues, help
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
    
    await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
    
    const response = processInput(question);
    
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
            <div class="message-avatar">👤</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">🏢</div>
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
        <div class="message-avatar">🏢</div>
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
    setClient: setClient,
    clearClient: clearClient,
    getClient: () => currentClient,
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
    console.log('🏢 Shadow AI Agency v1.0 Initializing...');
    createUI();
    console.log('✅ Agency AI loaded');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
