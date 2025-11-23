// Main JavaScript for ShadowBanCheck.io Landing Page

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Claude Co-Pilot functionality
const copilotBtn = document.getElementById('claude-copilot-btn');
const copilotChat = document.getElementById('claude-copilot');
const copilotClose = document.getElementById('copilot-close');
const copilotInput = document.getElementById('copilot-input-field');
const copilotSend = document.getElementById('copilot-send');
const copilotMessages = document.getElementById('copilot-messages');

// Toggle copilot chat
copilotBtn.addEventListener('click', () => {
    copilotChat.classList.remove('hidden');
    copilotBtn.style.display = 'none';
    copilotInput.focus();
});

copilotClose.addEventListener('click', () => {
    copilotChat.classList.add('hidden');
    copilotBtn.style.display = 'flex';
});

// Send message function
async function sendMessage() {
    const message = copilotInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    copilotInput.value = '';

    // Show typing indicator
    const typingId = addTypingIndicator();

    // Get AI response
    try {
        const response = await getCopilotResponse(message);
        removeTypingIndicator(typingId);
        addMessage(response, 'assistant');
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    }

    // Scroll to bottom
    copilotMessages.scrollTop = copilotMessages.scrollHeight;
}

// Send message on button click
copilotSend.addEventListener('click', sendMessage);

// Send message on Enter key
copilotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Add message to chat
function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `copilot-message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Convert markdown-like formatting to HTML
    const formattedContent = formatMessage(content);
    contentDiv.innerHTML = formattedContent;
    
    messageDiv.appendChild(contentDiv);
    copilotMessages.appendChild(messageDiv);
    
    copilotMessages.scrollTop = copilotMessages.scrollHeight;
}

// Format message with basic markdown support
function formatMessage(text) {
    // Convert newlines to <br>
    text = text.replace(/\n/g, '<br>');
    
    // Convert **bold**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert bullet points
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return text;
}

// Add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'copilot-message assistant typing-indicator';
    typingDiv.id = 'typing-' + Date.now();
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<span>•</span> <span>•</span> <span>•</span>';
    
    typingDiv.appendChild(contentDiv);
    copilotMessages.appendChild(typingDiv);
    copilotMessages.scrollTop = copilotMessages.scrollHeight;
    
    return typingDiv.id;
}

// Remove typing indicator
function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

// Get copilot response (integrates with Claude API)
async function getCopilotResponse(message) {
    // This will be connected to the Claude API
    // For now, return intelligent responses based on keywords
    
    const lowerMessage = message.toLowerCase();
    
    // Shadow ban explanations
    if (lowerMessage.includes('shadow ban') || lowerMessage.includes('shadowban')) {
        return `A shadow ban is when a platform restricts your content's visibility without notifying you. Your account appears normal to you, but others can't see your posts, or they're hidden from searches and feeds.\n\n**Common types:**\n- Search ban (posts don't appear in searches)\n- Reply ban (replies hidden from others)\n- Engagement suppression (lower reach)\n\nWhat platform are you concerned about?`;
    }
    
    // Twitter specific
    if (lowerMessage.includes('twitter') || lowerMessage.includes('x.com')) {
        return `**Twitter/X Shadow Bans:**\n\nThere are several types:\n- **Search Ban**: Tweets don't appear in searches\n- **Ghost Ban**: Replies hidden from non-followers\n- **Reply Deboosting**: Replies behind "Show more" button\n\nOur tool checks all of these! Try our Twitter checker to see your current status.`;
    }
    
    // Reddit specific
    if (lowerMessage.includes('reddit')) {
        return `**Reddit Shadow Bans:**\n\nReddit has two types:\n- **Site-wide**: Your profile/posts are invisible to everyone\n- **Subreddit**: Hidden only in specific subreddits\n\nUse our Reddit checker to verify your status. It's usually quick to detect!`;
    }
    
    // Email specific
    if (lowerMessage.includes('email') || lowerMessage.includes('deliverability')) {
        return `**Email Deliverability Issues:**\n\nYour emails might be going to spam if:\n- Domain is on a blacklist\n- Poor sender reputation\n- Missing SPF/DKIM records\n- High spam complaint rate\n\nOur email checker tests all of these factors and gives you specific fixes!`;
    }
    
    // Recovery help
    if (lowerMessage.includes('fix') || lowerMessage.includes('recover') || lowerMessage.includes('remove')) {
        return `**Shadow Ban Recovery:**\n\n1. **Stop violating policies** - Review platform guidelines\n2. **Reduce activity** - Slow down posting/engaging for 48-72hrs\n3. **Remove automation** - Stop using third-party posting tools\n4. **Delete violations** - Remove content that might have triggered it\n5. **Appeal** - Contact platform support if it persists\n\nRecovery usually takes 48-72 hours. Want platform-specific advice?`;
    }
    
    // Pricing questions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('free')) {
        return `**Pricing:**\n- **Free**: 3 checks/month, basic reports\n- **Pro ($19.99/mo)**: Unlimited checks, all platforms, alerts\n- **Business ($49.99/mo)**: Team features, API access\n\nStart with free checks to see if it's helpful!`;
    }
    
    // How it works
    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('check'))) {
        return `**How Shadow Ban Checking Works:**\n\n1. You provide your username/email/phone\n2. We test visibility across multiple signals:\n   - Search result appearance\n   - Profile suggestions\n   - Content reachability\n   - Engagement patterns\n3. You get a detailed report with:\n   - Current status (✅ or ⚠️)\n   - Specific issues found\n   - Recovery recommendations\n\nTakes about 30 seconds per check!`;
    }
    
    // Platforms
    if (lowerMessage.includes('platform') || lowerMessage.includes('support')) {
        return `**Supported Platforms:**\n\n**Live Now:**\n✅ Twitter/X\n✅ Reddit\n✅ Email\n\n**Coming Soon:**\n🔜 Instagram\n🔜 TikTok\n🔜 LinkedIn\n🔜 Phone Numbers\n🔜 Domain Reputation\n\nWant updates when new platforms launch?`;
    }
    
    // Default helpful response
    return `I can help you with:\n- Understanding shadow bans\n- Platform-specific restrictions\n- Recovery strategies\n- Using our checker tools\n- Pricing and features\n\nWhat would you like to know more about?`;
}

// Analytics tracking (placeholder for future implementation)
function trackEvent(category, action, label) {
    // Will integrate with analytics service
    console.log('Event:', category, action, label);
}

// Track CTA clicks
document.querySelectorAll('.btn-hero, .btn-primary, .btn-pricing').forEach(btn => {
    btn.addEventListener('click', (e) => {
        trackEvent('CTA', 'click', e.target.textContent);
    });
});

// Scroll animations (simple fade-in on scroll)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all platform cards and pricing cards
document.querySelectorAll('.platform-card, .pricing-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Mobile menu toggle (if we add hamburger menu later)
// Placeholder for future mobile navigation
