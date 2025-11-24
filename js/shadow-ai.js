/* =============================================================================
   SHADOW-AI.JS - AI Chatbot Widget
   ============================================================================= */

/* =============================================================================
   CHATBOT STATE
   ============================================================================= */
let chatState = {
    isOpen: false,
    messages: [],
    isTyping: false
};

/* =============================================================================
   PREDEFINED RESPONSES
   ============================================================================= */
const responses = {
    greetings: [
        "Hey there! 👋 I'm Shadow AI, your visibility assistant. How can I help you today?",
        "Hi! 🔍 Ready to help you understand shadow bans and protect your online presence!",
        "Hello! 👋 I'm here to help with shadow ban questions, hashtag advice, and visibility tips."
    ],
    
    shadowban: {
        what: "A shadow ban (also called stealth ban or ghost ban) is when a platform secretly restricts your content's visibility without notifying you. Your posts might not appear in hashtag searches, explore pages, or your followers' feeds. It's frustrating because everything looks normal from your end! 👻",
        
        why: "Platforms shadow ban accounts for various reasons:\n\n• Using banned or restricted hashtags\n• Posting too frequently (spam-like behavior)\n• Getting reported by other users\n• Violating community guidelines\n• Using automation tools or bots\n• Sudden spikes in follower growth\n• Posting controversial content\n\nThe tricky part is platforms rarely tell you exactly what triggered it!",
        
        how_long: "Shadow bans typically last anywhere from 24 hours to 2-4 weeks, depending on the platform and severity. Here's a rough guide:\n\n• Minor violations: 24-48 hours\n• Moderate issues: 1-2 weeks\n• Serious violations: 2-4 weeks\n• Repeat offenders: Can be permanent\n\nThe best approach is to pause suspicious activities and wait it out while following best practices.",
        
        fix: "Here's how to potentially lift a shadow ban:\n\n1️⃣ Stop all suspicious activity immediately\n2️⃣ Remove any banned hashtags from recent posts\n3️⃣ Avoid using automation tools\n4️⃣ Take a 24-48 hour break from posting\n5️⃣ Engage authentically with others\n6️⃣ Review and follow community guidelines\n7️⃣ Consider reaching out to platform support\n\nPatience is key - most bans lift within 1-2 weeks!"
    },
    
    platforms: {
        instagram: "Instagram is notorious for shadow bans! 📸 They primarily target:\n\n• Banned hashtags (there are hundreds!)\n• Repetitive comments or DMs\n• Mass following/unfollowing\n• Third-party apps\n• Posting too frequently\n\nUse our Hashtag Checker to verify your tags are safe!",
        
        tiktok: "TikTok's algorithm is complex! 🎵 Shadow bans on TikTok often result from:\n\n• Posting content that violates guidelines\n• Using banned sounds/hashtags\n• Spam-like behavior\n• Sudden engagement drops\n\nIf your FYP reach drops suddenly, you might be affected.",
        
        twitter: "Twitter/X shadow bans work differently. 🐦 They use \"quality filters\" that can hide your replies and reduce visibility. Common triggers:\n\n• Aggressive behavior\n• Mass messaging\n• Sensitive content without labels\n• Bot-like patterns\n\nSearch for your username in an incognito browser to test visibility."
    },
    
    hashtags: {
        general: "Hashtags are a double-edged sword! 🏷️\n\n✅ DO: Use relevant, niche hashtags (10-15 per post)\n✅ DO: Mix popular and less competitive tags\n✅ DO: Check if tags are banned before using\n\n❌ DON'T: Use the same hashtags every post\n❌ DON'T: Use banned/restricted hashtags\n❌ DON'T: Use irrelevant popular hashtags\n\nTry our Hashtag Checker to verify yours!",
        
        banned: "Banned hashtags can trigger shadow bans! Some surprising examples:\n\n• #adulting\n• #elevator  \n• #humpday\n• #valentinesday\n• #popular\n\nPlatforms ban hashtags that attract spam, inappropriate content, or violate guidelines. Always check before posting!"
    },
    
    fallback: [
        "That's a great question! While I specialize in shadow bans and visibility, let me point you to our tools:\n\n🔍 Use our Shadow Ban Checker to test your account\n🏷️ Try our Hashtag Checker to verify your tags\n\nIs there something specific about shadow bans I can help with?",
        
        "Hmm, I'm not 100% sure about that specific topic, but I'm an expert in:\n\n• Shadow ban detection\n• Platform-specific visibility issues\n• Hashtag safety\n• Account recovery tips\n\nWhat would you like to know about these?",
        
        "I want to make sure I give you accurate info! My expertise is in social media visibility and shadow bans. Try asking me about:\n\n• How to detect shadow bans\n• Why accounts get restricted\n• How to fix visibility issues\n• Safe hashtag practices"
    ]
};

/* =============================================================================
   MESSAGE HANDLING
   ============================================================================= */
function processMessage(input) {
    const text = input.toLowerCase().trim();
    
    // Greetings
    if (text.match(/^(hi|hello|hey|howdy|sup|yo)[\s!?]*$/)) {
        return randomResponse(responses.greetings);
    }
    
    // Shadow ban questions
    if (text.includes('shadow') || text.includes('shadowban')) {
        if (text.includes('what') || text.includes('mean')) {
            return responses.shadowban.what;
        }
        if (text.includes('why') || text.includes('cause') || text.includes('reason')) {
            return responses.shadowban.why;
        }
        if (text.includes('how long') || text.includes('duration') || text.includes('last')) {
            return responses.shadowban.how_long;
        }
        if (text.includes('fix') || text.includes('remove') || text.includes('lift') || text.includes('get rid')) {
            return responses.shadowban.fix;
        }
        // Default shadow ban response
        return responses.shadowban.what;
    }
    
    // Platform specific
    if (text.includes('instagram') || text.includes('insta') || text.includes('ig')) {
        return responses.platforms.instagram;
    }
    if (text.includes('tiktok') || text.includes('tik tok')) {
        return responses.platforms.tiktok;
    }
    if (text.includes('twitter') || text.includes('x.com')) {
        return responses.platforms.twitter;
    }
    
    // Hashtag questions
    if (text.includes('hashtag') || text.includes('#')) {
        if (text.includes('banned') || text.includes('restricted')) {
            return responses.hashtags.banned;
        }
        return responses.hashtags.general;
    }
    
    // Help
    if (text.match(/^(help|assist|support)[\s!?]*$/)) {
        return "I can help you with:\n\n🔍 **Shadow Ban Detection** - Learn if you're affected\n❓ **Why It Happens** - Understand the causes\n🔧 **How To Fix** - Get recovery tips\n📱 **Platform Specific** - Instagram, TikTok, Twitter advice\n🏷️ **Hashtag Safety** - Avoid banned tags\n\nJust ask me anything about these topics!";
    }
    
    // Gratitude
    if (text.match(/(thanks|thank you|thx|ty)/)) {
        return "You're welcome! 😊 Feel free to ask if you have more questions about shadow bans or visibility. Good luck with your account!";
    }
    
    // Fallback
    return randomResponse(responses.fallback);
}

function randomResponse(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/* =============================================================================
   UI FUNCTIONS
   ============================================================================= */
function initChatbot() {
    const chatBtn = document.getElementById('shadow-ai-btn');
    const chatWindow = document.getElementById('shadow-ai-chat');
    const closeBtn = document.getElementById('shadow-ai-close');
    const sendBtn = document.getElementById('shadow-ai-send');
    const input = document.getElementById('shadow-ai-input');
    const messagesContainer = document.getElementById('shadow-ai-messages');
    
    if (!chatBtn || !chatWindow) return;
    
    // Toggle chat
    chatBtn.addEventListener('click', function() {
        chatWindow.classList.toggle('hidden');
        chatState.isOpen = !chatWindow.classList.contains('hidden');
        
        if (chatState.isOpen && chatState.messages.length === 0) {
            // Show welcome message
            setTimeout(() => {
                addMessage('ai', randomResponse(responses.greetings));
            }, 300);
        }
        
        if (chatState.isOpen) {
            input?.focus();
        }
    });
    
    // Close button
    closeBtn?.addEventListener('click', function() {
        chatWindow.classList.add('hidden');
        chatState.isOpen = false;
    });
    
    // Send message
    function sendMessage() {
        const text = input?.value.trim();
        if (!text || chatState.isTyping) return;
        
        // Add user message
        addMessage('user', text);
        input.value = '';
        
        // Show typing indicator
        showTyping();
        
        // Process and respond
        setTimeout(() => {
            hideTyping();
            const response = processMessage(text);
            addMessage('ai', response);
        }, 1000 + Math.random() * 1000);
    }
    
    sendBtn?.addEventListener('click', sendMessage);
    
    input?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function addMessage(type, text) {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return;
    
    const msg = document.createElement('div');
    msg.className = `copilot-message ${type}`;
    
    // Simple markdown-like formatting
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    
    msg.innerHTML = formattedText;
    messagesContainer.appendChild(msg);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store message
    chatState.messages.push({ type, text });
}

function showTyping() {
    const messagesContainer = document.getElementById('shadow-ai-messages');
    if (!messagesContainer) return;
    
    chatState.isTyping = true;
    
    const typingEl = document.createElement('div');
    typingEl.className = 'copilot-message ai typing';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTyping() {
    const typingEl = document.getElementById('typing-indicator');
    typingEl?.remove();
    chatState.isTyping = false;
}

/* =============================================================================
   INITIALIZE
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    initChatbot();
    console.log('✅ Shadow AI chatbot initialized');
});
