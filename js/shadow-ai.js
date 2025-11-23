/**
 * Shadow AI - Centralized Chat Component
 * Free: Educational hardcoded responses
 * Paid: Real-time Claude API lookups with rate limiting
 */

class ShadowAI {
    constructor(options = {}) {
        this.userPlan = options.userPlan || 'free'; // 'free', 'paid'
        this.apiKey = options.apiKey || null;
        this.rateLimits = {
            free: { maxMessages: 10, resetHours: 24 },
            paid: { maxMessages: 100, resetHours: 1 }
        };
        
        this.init();
    }

    init() {
        // Check rate limits
        this.checkRateLimits();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Add initial greeting
        this.addInitialGreeting();
    }

    setupEventListeners() {
        const copilotBtn = document.getElementById('shadow-ai-btn');
        const copilotChat = document.getElementById('shadow-ai-chat');
        const copilotClose = document.getElementById('shadow-ai-close');
        const copilotInput = document.getElementById('shadow-ai-input');
        const copilotSend = document.getElementById('shadow-ai-send');

        if (copilotBtn) {
            copilotBtn.addEventListener('click', () => {
                copilotChat.classList.remove('hidden');
                copilotBtn.style.display = 'none';
                copilotInput.focus();
            });
        }

        if (copilotClose) {
            copilotClose.addEventListener('click', () => {
                copilotChat.classList.add('hidden');
                copilotBtn.style.display = 'flex';
            });
        }

        if (copilotSend) {
            copilotSend.addEventListener('click', () => this.sendMessage());
        }

        if (copilotInput) {
            copilotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    }

    addInitialGreeting() {
        const messagesContainer = document.getElementById('shadow-ai-messages');
        if (!messagesContainer) return;

        const greeting = this.userPlan === 'free' 
            ? this.getFreeGreeting()
            : this.getPaidGreeting();

        this.addMessage(greeting, 'assistant');
    }

    getFreeGreeting() {
        return `👋 **Hi! I'm Shadow AI** - your shadow ban assistant (Free version)\n\nI can help you:\n• Understand shadow bans\n• Learn platform policies\n• Get recovery tips\n• Explain our tools\n\n🔓 **Upgrade to Pro** to unlock:\n✓ Real-time domain checks\n✓ Live blacklist lookups\n✓ Web searches for your status\n✓ IP & email verification\n\nWhat would you like to know?`;
    }

    getPaidGreeting() {
        return `👋 **Hi! I'm Shadow AI** - your AI shadow ban investigator (Pro)\n\nI can:\n✓ Check domains in real-time\n✓ Search web for your status\n✓ Verify blacklists live\n✓ Analyze your reputation\n✓ Investigate specific issues\n\n**Try asking:**\n• "Check if mysite.com is blacklisted"\n• "Why is my Instagram engagement low?"\n• "Is my email domain on spam lists?"\n\nWhat can I help you investigate?`;
    }

    async sendMessage() {
        const input = document.getElementById('shadow-ai-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Check rate limits
        if (!this.canSendMessage()) {
            this.showRateLimitMessage();
            return;
        }

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        const typingId = this.addTypingIndicator();

        try {
            let response;
            
            if (this.userPlan === 'free') {
                response = await this.getFreeResponse(message);
            } else {
                response = await this.getPaidResponse(message);
            }

            this.removeTypingIndicator(typingId);
            this.addMessage(response, 'assistant');
            
            // Increment message count
            this.incrementMessageCount();

        } catch (error) {
            console.error('Shadow AI Error:', error);
            this.removeTypingIndicator(typingId);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    }

    // FREE TIER: Hardcoded educational responses
    async getFreeResponse(message) {
        // Simulate thinking delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const lowerMessage = message.toLowerCase();

        // Shadow ban explanations
        if (lowerMessage.includes('shadow ban') || lowerMessage.includes('shadowban')) {
            return `**What is a Shadow Ban?**\n\nA shadow ban is when a platform restricts your content's visibility without notifying you. You can post normally, but:\n\n• Your posts don't appear in searches\n• Your replies are hidden from others\n• Your engagement drops significantly\n• You're invisible to non-followers\n\n**Common Types:**\n1. Search Ban - Posts excluded from search results\n2. Reply Ban - Replies hidden from others\n3. Engagement Suppression - Algorithmic reach reduction\n\nWant to check if you're shadow banned? Try our free checker tools!\n\n🔓 **Upgrade to Pro** for real-time investigations with live data.`;
        }

        // Platform-specific questions
        if (lowerMessage.includes('twitter') || lowerMessage.includes('x.com')) {
            return `**Twitter/X Shadow Bans**\n\nTwitter has several types of restrictions:\n\n**Search Ban:**\n• Your tweets don't appear in searches\n• Usually from spam-like behavior\n\n**Ghost Ban:**\n• Replies hidden from non-followers\n• Often from aggressive engagement\n\n**Reply Deboosting:**\n• Replies behind "Show more replies"\n• Can happen to anyone randomly\n\n**How to Check:**\nUse our free Twitter checker - it tests all these signals!\n\n**Recovery Tips:**\n1. Slow down posting/engagement for 48-72 hours\n2. Remove any automated tools\n3. Delete potentially violating content\n4. Appeal to Twitter Support if needed\n\nWant me to explain more about a specific type?`;
        }

        if (lowerMessage.includes('instagram')) {
            return `**Instagram Shadow Bans**\n\nInstagram is notoriously strict with shadow bans:\n\n**Causes:**\n• Using banned hashtags\n• Aggressive following/unfollowing\n• Third-party automation tools\n• Posting inappropriate content\n• Too many reports against you\n\n**Signs:**\n• Hashtags don't work (0 reach)\n• Posts invisible to non-followers\n• Explore page disappearance\n• Dramatic engagement drop\n\n**Recovery:**\n1. Stop using ALL hashtags for 7 days\n2. Check hashtags with our Hashtag Checker\n3. Only post organic content\n4. Don't use third-party apps\n5. Wait 7-14 days for full recovery\n\nOur Instagram checker (coming soon) will scan your account status!\n\n🔓 **Upgrade to Pro** for real-time hashtag verification.`;
        }

        if (lowerMessage.includes('reddit')) {
            return `**Reddit Shadow Bans**\n\nReddit has two types of shadow bans:\n\n**Site-Wide Shadow Ban:**\n• Your entire profile is invisible\n• Usually from spam or ban evasion\n• Only admins can remove it\n\n**Subreddit Shadow Ban:**\n• Hidden only in specific subreddits\n• Set by moderators\n• Varies by subreddit\n\n**How to Check:**\nUse our free Reddit checker - it tests your profile visibility!\n\n**If Shadow Banned:**\n1. Message Reddit admins (for site-wide)\n2. Message subreddit mods (for subreddit bans)\n3. Create new account if permanent\n4. Follow rules carefully on new account\n\nWant to check your Reddit status now?`;
        }

        if (lowerMessage.includes('tiktok')) {
            return `**TikTok Shadow Bans**\n\nTikTok calls it "suppression" but it's the same thing:\n\n**Causes:**\n• Community guideline violations\n• Copyrighted music/content\n• Spam-like behavior\n• Multiple reports\n\n**Signs:**\n• Videos stuck at 200-300 views\n• 0 views on new posts\n• Not appearing in For You page\n• Follower feeds only\n\n**Recovery:**\n1. Delete violating content\n2. Stop posting for 7 days\n3. When you return, post high-quality content\n4. Engage authentically (no spam comments)\n5. Wait 2-4 weeks for full recovery\n\nOur TikTok checker (coming soon) will verify your status!\n\n🔓 **Upgrade to Pro** for instant status checks.`;
        }

        if (lowerMessage.includes('email') || lowerMessage.includes('spam')) {
            return `**Email Deliverability Issues**\n\nYour emails might be going to spam if:\n\n**Technical Issues:**\n• Domain on blacklists (25+ lists)\n• Missing SPF/DKIM/DMARC records\n• Poor sender reputation\n• Shared IP with spammers\n\n**Content Issues:**\n• Spam trigger words\n• Poor engagement rates\n• High unsubscribe/complaint rates\n\n**How to Check:**\nUse our free Email Checker - we test:\n✓ 25+ blacklists\n✓ DNS records (SPF/DKIM/DMARC)\n✓ Sender reputation\n✓ IP reputation\n\n**Quick Fixes:**\n1. Set up SPF, DKIM, DMARC\n2. Use dedicated sending IP\n3. Warm up new IPs slowly\n4. Monitor bounce/complaint rates\n5. Remove inactive subscribers\n\n🔓 **Upgrade to Pro** for real-time blacklist monitoring + live DNS checks.`;
        }

        // Recovery advice
        if (lowerMessage.includes('fix') || lowerMessage.includes('recover') || lowerMessage.includes('remove')) {
            return `**Shadow Ban Recovery Guide**\n\n**Universal Steps (All Platforms):**\n\n1️⃣ **Stop Activity (48-72 hours)**\n   • No posts, likes, comments, follows\n   • Let the algorithm cool down\n\n2️⃣ **Remove Violations**\n   • Delete content that violated policies\n   • Remove banned hashtags\n   • Disconnect third-party tools\n\n3️⃣ **Clean Up Profile**\n   • Remove spam-like links\n   • Update bio/profile properly\n   • Add legitimate contact info\n\n4️⃣ **Return Slowly**\n   • Post once every 24 hours\n   • Engage authentically\n   • Use only safe hashtags\n\n5️⃣ **Appeal (If Needed)**\n   • Contact platform support\n   • Be professional and brief\n   • Acknowledge mistakes\n\n**Timeline:**\n• Light restrictions: 48-72 hours\n• Moderate bans: 7-14 days\n• Severe bans: 30+ days or permanent\n\nWhich platform are you trying to recover on?`;
        }

        // Pricing questions
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('upgrade') || lowerMessage.includes('pro')) {
            return `**Shadow AI Pricing**\n\n**Free (Current Plan):**\n• Educational responses\n• 10 questions per day\n• Platform explanations\n• Recovery strategies\n• Access to free checkers\n\n**Pro - $9.99/mo (or included in Pro/Complete plans):**\n• Real-time Claude AI lookups\n• Live domain/IP verification\n• Blacklist checking (25+ lists)\n• Web searches for your status\n• DNS record validation\n• 100 questions per hour\n• Priority responses\n\n**Complete Plan - $29.99/mo:**\n• Everything in Pro\n• Shadow AI Pro included\n• All 26 platforms monitored\n• Text/email alerts\n• API access\n\n**Want to upgrade?**\nHead to our pricing section to unlock real-time investigations!\n\n[View Pricing Plans →](#pricing)`;
        }

        // How it works
        if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('check'))) {
            return `**How Shadow Ban Checking Works**\n\n**Our Process:**\n\n1️⃣ **Input Collection**\n   You provide: username, email, phone, domain, or IP\n\n2️⃣ **Multi-Signal Testing**\n   We check:\n   • Search visibility\n   • Profile suggestions\n   • Content reachability\n   • Engagement patterns\n   • Blacklist presence\n   • DNS configuration\n\n3️⃣ **AI Analysis**\n   Our system analyzes:\n   • Historical patterns\n   • Platform-specific signals\n   • Reputation scores\n   • Known ban indicators\n\n4️⃣ **Detailed Report**\n   You get:\n   • ✅ or ⚠️ status per platform\n   • Specific issues found\n   • Recovery recommendations\n   • Monitoring options\n\n**Speed:** Most checks complete in 30-60 seconds\n\n**Accuracy:** We test multiple signals to reduce false positives\n\nWant to run a check now?`;
        }

        // Hashtag checker
        if (lowerMessage.includes('hashtag')) {
            return `**Hashtag Safety Checker**\n\nOur free hashtag checker helps you avoid banned hashtags that cause shadow bans!\n\n**What We Check:**\n• Instagram banned hashtags (1000s)\n• TikTok restricted hashtags\n• Twitter suppressed hashtags\n\n**Features:**\n• Free: 5 hashtags per day\n• Pro: Unlimited checks + bulk checker (30 at once)\n• Get alternative suggestions\n• Real-time ban status\n\n**Why It Matters:**\nUsing even ONE banned hashtag can trigger an Instagram shadow ban and make ALL your hashtags invisible.\n\n**Try it now:**\n[Check Hashtags →](hashtag-checker.html)\n\n**Pro Tip:**\nCheck hashtags BEFORE every post to stay safe!\n\nWant to learn more about hashtag bans?`;
        }

        // Default helpful response
        return `I can help you with:\n\n**Learn About:**\n• Shadow bans (what they are)\n• Platform-specific restrictions\n• Recovery strategies\n• How our tools work\n\n**Use Our Tools:**\n• Hashtag checker (free)\n• Platform checkers (Twitter, Reddit, Email)\n• Full spectrum scan ($97)\n\n**Get Help:**\n• Understanding results\n• Recovery advice\n• Prevention tips\n\n**Upgrade:**\n🔓 Shadow AI Pro - Real-time investigations\n\nWhat would you like to know more about?\n\n*Tip: Ask specific questions like "How does Twitter shadow ban?" or "Why is my email going to spam?"*`;
    }

    // PAID TIER: Real Claude API with tools
    async getPaidResponse(message) {
        if (!this.apiKey) {
            return `⚠️ **API Key Missing**\n\nShadow AI Pro requires an API connection. Please contact support.\n\nIn the meantime, I can still help with:\n• General shadow ban advice\n• Platform explanations\n• Recovery strategies\n\nWhat would you like to know?`;
        }

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [
                        {
                            role: 'user',
                            content: `You are Shadow AI, an expert shadow ban investigator. The user has a Pro account and can use real-time lookups.

User question: ${message}

If they're asking you to check something (domain, IP, email, blacklist, etc.), you can actually perform those checks using your tools. Otherwise, provide expert advice about shadow bans, platform policies, and recovery strategies.

Keep responses concise (2-3 paragraphs max) and actionable. Use markdown formatting for readability.`
                        }
                    ]
                })
            });

            const data = await response.json();
            return data.content[0].text;

        } catch (error) {
            console.error('Claude API Error:', error);
            return `⚠️ I encountered an error connecting to the AI service. Let me try to help based on my knowledge:\n\n${await this.getFreeResponse(message)}`;
        }
    }

    // Rate limiting
    checkRateLimits() {
        const now = new Date();
        const stored = localStorage.getItem('shadowAI_usage');
        
        if (!stored) {
            this.resetUsage();
            return;
        }

        const usage = JSON.parse(stored);
        const lastReset = new Date(usage.lastReset);
        const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
        
        const limit = this.rateLimits[this.userPlan];
        
        if (hoursSinceReset >= limit.resetHours) {
            this.resetUsage();
        }
    }

    canSendMessage() {
        const usage = JSON.parse(localStorage.getItem('shadowAI_usage') || '{}');
        const limit = this.rateLimits[this.userPlan];
        
        return (usage.messageCount || 0) < limit.maxMessages;
    }

    incrementMessageCount() {
        const usage = JSON.parse(localStorage.getItem('shadowAI_usage') || '{}');
        usage.messageCount = (usage.messageCount || 0) + 1;
        localStorage.setItem('shadowAI_usage', JSON.stringify(usage));
    }

    resetUsage() {
        const usage = {
            messageCount: 0,
            lastReset: new Date().toISOString()
        };
        localStorage.setItem('shadowAI_usage', JSON.stringify(usage));
    }

    showRateLimitMessage() {
        const limit = this.rateLimits[this.userPlan];
        let message;

        if (this.userPlan === 'free') {
            message = `⚠️ **Rate Limit Reached**\n\nYou've used your ${limit.maxMessages} free messages for today.\n\n🔓 **Upgrade to Pro** for:\n✓ 100 messages per hour\n✓ Real-time lookups\n✓ Priority responses\n\n[Upgrade Now →](#pricing)`;
        } else {
            message = `⚠️ **Rate Limit Reached**\n\nYou've used your ${limit.maxMessages} messages this hour. Your limit will reset soon.\n\nCheck back in a bit!`;
        }

        this.addMessage(message, 'assistant');
    }

    // UI helpers
    addMessage(content, type) {
        const messagesContainer = document.getElementById('shadow-ai-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `copilot-message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.formatMessage(content);
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(text) {
        // Convert markdown to HTML
        text = text.replace(/\n/g, '<br>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/^• (.+)$/gm, '<li>$1</li>');
        text = text.replace(/^✓ (.+)$/gm, '<li class="check">✓ $1</li>');
        text = text.replace(/^[0-9]️⃣ (.+)$/gm, '<li class="numbered">$1</li>');
        
        // Wrap consecutive list items in ul tags
        text = text.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
        text = text.replace(/<\/ul><br><ul>/g, '');
        
        return text;
    }

    addTypingIndicator() {
        const messagesContainer = document.getElementById('shadow-ai-messages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'copilot-message assistant typing-indicator';
        typingDiv.id = 'typing-' + Date.now();
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content typing-dots';
        contentDiv.innerHTML = '<span></span><span></span><span></span>';
        
        typingDiv.appendChild(contentDiv);
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return typingDiv.id;
    }

    removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) indicator.remove();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is on a paid plan (you'll replace this with real auth check)
    const userPlan = localStorage.getItem('userPlan') || 'free';
    const apiKey = localStorage.getItem('apiKey') || null;
    
    // Initialize Shadow AI
    window.shadowAI = new ShadowAI({
        userPlan: userPlan,
        apiKey: apiKey
    });
});
