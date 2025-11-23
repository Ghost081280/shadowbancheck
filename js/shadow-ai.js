// Shadow AI Chatbot - ShadowBanCheck.io
// Promotes Shadow AI Pro subscription ($9.99/mo)

class ShadowAI {
    constructor() {
        this.chatOpen = false;
        this.messageHistory = [];
        this.freeQuestionsToday = 3;
        this.freeQuestionsUsed = this.loadDailyQuestions();
        
        this.init();
    }
    
    loadDailyQuestions() {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('shadowai_questions');
        
        if (stored) {
            const data = JSON.parse(stored);
            
            // Check if it's the same day
            if (data.date === today) {
                return data.used;
            }
        }
        
        // New day or no data - reset to 0
        this.saveDailyQuestions(0);
        return 0;
    }
    
    saveDailyQuestions(used) {
        const today = new Date().toDateString();
        localStorage.setItem('shadowai_questions', JSON.stringify({
            date: today,
            used: used
        }));
    }
    
    getRemainingQuestions() {
        return Math.max(0, this.freeQuestionsToday - this.freeQuestionsUsed);
    }

    init() {
        // Get elements
        this.btn = document.getElementById('shadow-ai-btn');
        this.chat = document.getElementById('shadow-ai-chat');
        this.closeBtn = document.getElementById('shadow-ai-close');
        this.messagesContainer = document.getElementById('shadow-ai-messages');
        this.input = document.getElementById('shadow-ai-input');
        this.sendBtn = document.getElementById('shadow-ai-send');

        if (!this.btn || !this.chat) return;

        // Event listeners
        this.btn.addEventListener('click', () => this.openChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    openChat() {
        if (this.chatOpen) return; // Already open
        
        this.chatOpen = true;
        this.chat.classList.remove('hidden');
        this.input.focus();
        
        // Show welcome message only if no messages yet
        if (this.messageHistory.length === 0) {
            setTimeout(() => this.showWelcomeMessage(), 500);
        }
    }

    closeChat() {
        this.chatOpen = false;
        this.chat.classList.add('hidden');
    }

    async showWelcomeMessage() {
        const remaining = this.getRemainingQuestions();
        await this.typeMessage(
            `👋 Hi! I'm Shadow AI, your personal shadow ban detective.\n\n` +
            `I use AI to search platforms and analyze multiple online factors to give you:\n` +
            `• Real-time verification across 26 platforms\n` +
            `• Probability scores when platforms aren't transparent\n` +
            `• Personalized recovery strategies\n` +
            `• Instant answers in 60 seconds or less\n\n` +
            `You have **${remaining} free question${remaining !== 1 ? 's' : ''}** today.\n\n` +
            `Want 100 questions/day + full AI analysis? **Shadow AI Pro is only $9.99/mo** with a 7-day free trial!\n\n` +
            `What would you like to check?`,
            'ai'
        );
    }

    async sendMessage() {
        const text = this.input.value.trim();
        if (!text) return;

        // Add user message
        this.addMessage(text, 'user');
        this.input.value = '';

        // Check free questions limit BEFORE incrementing
        if (this.freeQuestionsUsed >= this.freeQuestionsToday) {
            await this.showUpgradeMessage();
            return;
        }

        // Increment and save to localStorage
        this.freeQuestionsUsed++;
        this.saveDailyQuestions(this.freeQuestionsUsed);

        // Show typing indicator
        const typingId = this.showTypingIndicator();

        // Wait a moment for realism
        await this.delay(1000 + Math.random() * 1000);

        // Remove typing indicator
        this.removeTypingIndicator(typingId);

        // Get response
        await this.getResponse(text);
    }

    async getResponse(userMessage) {
        const msg = userMessage.toLowerCase();

        // Check if asking about Shadow AI Pro
        if (msg.includes('shadow ai pro') || msg.includes('unlimited') || msg.includes('upgrade') || msg.includes('pricing') || msg.includes('subscribe')) {
            await this.showShadowAIProPitch();
            return;
        }

        // Check if asking about being shadow banned
        if (msg.includes('shadow ban') || msg.includes('shadowban') || msg.includes('banned') || msg.includes('restricted')) {
            await this.typeMessage(
                `I'd love to help you check that! 🔍\n\n` +
                `With **Shadow AI Pro ($9.99/mo)**, I can:\n` +
                `• Run live checks on your accounts right now\n` +
                `• Search platforms + analyze online factors\n` +
                `• Give you a **probability score** based on multiple data points\n` +
                `• Create a personalized recovery plan\n` +
                `• Check all 26 platforms we support\n\n` +
                `**Free users:** I can give general advice, but I can't run live checks or provide probability scores.\n\n` +
                `Want instant answers with AI analysis? Only $9.99/mo with a 7-day free trial!`,
                'ai'
            );
            return;
        }

        // Check if asking what Shadow AI can do
        if (msg.includes('what can you') || msg.includes('how can you help') || msg.includes('what do you do')) {
            await this.typeMessage(
                `Great question! Here's what I can do:\n\n` +
                `**Free Version (${this.freeQuestionsToday - this.freeQuestionsUsed} questions left today):**\n` +
                `• Answer general questions about shadow bans\n` +
                `• Explain platform policies\n` +
                `• Give basic recovery tips\n\n` +
                `**Shadow AI Pro ($9.99/mo):**\n` +
                `• 100 questions per day (not 3!)\n` +
                `• Live platform checks + web analysis\n` +
                `• **Probability scores** when platforms hide info\n` +
                `• Personalized recovery strategies\n` +
                `• Username & email verification\n` +
                `• Results in 60 seconds or less\n\n` +
                `Most users upgrade immediately because they need real answers with confidence scores, not guesses. Want to try it free for 7 days?`,
                'ai'
            );
            return;
        }

        // Generic helpful response that promotes upgrade
        await this.typeMessage(
            `I can help with that! However, to give you the most accurate answer, I'd need to run live checks on your account.\n\n` +
            `That's a **Shadow AI Pro** feature. For just $9.99/mo, you get:\n` +
            `• Unlimited live platform checks\n` +
            `• Real-time verification\n` +
            `• Personalized recovery plans\n` +
            `• 100 questions per day\n\n` +
            `You've used ${this.freeQuestionsUsed}/${this.freeQuestionsToday} free questions today. Want to upgrade and get instant answers?`,
            'ai'
        );
    }

    async showShadowAIProPitch() {
        await this.typeMessage(
            `🤖 **Shadow AI Pro - Your 24/7 Shadow Ban Expert**\n\n` +
            `Here's what you get for $9.99/month:\n\n` +
            `✓ **100 AI questions per day** (not just 3!)\n` +
            `✓ **Live platform checks** - verify accounts in real-time\n` +
            `✓ **Probability scores** - AI analyzes multiple factors to give you confidence percentages\n` +
            `✓ **All 26 platforms** - Twitter, Instagram, TikTok, and more\n` +
            `✓ **Results in 60 seconds** - instant answers, no waiting\n` +
            `✓ **Personalized recovery plans** - custom strategies for your situation\n\n` +
            `**7-Day Free Trial** - No credit card required\n\n` +
            `When platforms aren't transparent about bans, our AI searches multiple online sources and gives you a probability score so you know what's really happening.\n\n` +
            `Ready to get real answers? [Start Free Trial →](#shadow-ai-pro)`,
            'ai'
        );
    }

    async showUpgradeMessage() {
        await this.typeMessage(
            `⚠️ You've used all **${this.freeQuestionsToday} free questions** today.\n\n` +
            `Want to keep going? Upgrade to **Shadow AI Pro** for just $9.99/mo:\n\n` +
            `✓ 100 questions per day (vs 3 free)\n` +
            `✓ Live platform checks\n` +
            `✓ Real-time verification\n` +
            `✓ Personalized recovery plans\n` +
            `✓ 7-day free trial\n\n` +
            `Your visibility is worth $9.99/mo. [Start Free Trial →](#shadow-ai-pro)`,
            'ai'
        );
    }

    addMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = `copilot-message ${type}`;
        msg.innerHTML = this.formatMessage(text);
        this.messagesContainer.appendChild(msg);
        this.scrollToBottom();
        
        this.messageHistory.push({ text, type });
    }

    async typeMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = `copilot-message ${type}`;
        this.messagesContainer.appendChild(msg);

        // Type out character by character
        let i = 0;
        const speed = 20; // milliseconds per character

        while (i < text.length) {
            // Add next character
            msg.innerHTML = this.formatMessage(text.substring(0, i + 1));
            i++;
            
            // Scroll to bottom
            this.scrollToBottom();
            
            // Wait before next character
            await this.delay(speed);
        }

        // Final formatted version
        msg.innerHTML = this.formatMessage(text);
        this.messageHistory.push({ text, type });
    }

    formatMessage(text) {
        // Convert markdown-style formatting
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        text = text.replace(/\n/g, '<br>'); // Line breaks
        text = text.replace(/• /g, '&nbsp;&nbsp;• '); // Bullets
        
        // Make links clickable
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
        
        return text;
    }

    showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typing = document.createElement('div');
        typing.className = 'copilot-message ai typing';
        typing.id = id;
        typing.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
        this.messagesContainer.appendChild(typing);
        this.scrollToBottom();
        return id;
    }

    removeTypingIndicator(id) {
        const typing = document.getElementById(id);
        if (typing) typing.remove();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.shadowAI = new ShadowAI();
});
