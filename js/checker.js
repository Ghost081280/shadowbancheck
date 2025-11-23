// Checker Page JavaScript

// State management
let selectedPlatform = 'twitter';
let checksRemaining = 3;

// Platform selection
const platformButtons = document.querySelectorAll('.platform-option');
const platformForms = document.querySelectorAll('.platform-form');

platformButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.disabled) return;
        
        // Remove active from all buttons
        platformButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Add active to clicked button
        button.classList.add('selected');
        
        // Get selected platform
        selectedPlatform = button.dataset.platform;
        
        // Show corresponding form
        platformForms.forEach(form => {
            form.classList.remove('active');
        });
        
        const activeForm = document.getElementById(`${selectedPlatform}-form`);
        if (activeForm) {
            activeForm.classList.add('active');
        }
    });
});

// Form submissions
document.getElementById('twitter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('twitter-username').value.trim();
    if (username) {
        await performCheck('twitter', username);
    }
});

document.getElementById('reddit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reddit-username').value.trim();
    if (username) {
        await performCheck('reddit', username);
    }
});

document.getElementById('email-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email-address').value.trim();
    if (email) {
        await performCheck('email', email);
    }
});

// Perform shadow ban check
async function performCheck(platform, identifier) {
    // Check if user has checks remaining
    if (checksRemaining <= 0) {
        alert('You\'ve used all your free checks for today. Upgrade to Pro for unlimited checks!');
        window.location.href = 'index.html#pricing';
        return;
    }
    
    // Get submit button
    const form = document.getElementById(`${platform}-form`);
    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    
    // Set loading state
    submitBtn.classList.add('loading');
    btnText.textContent = 'Analyzing';
    
    try {
        // Simulate API call (will be replaced with real API)
        const results = await simulateCheck(platform, identifier);
        
        // Decrement checks
        checksRemaining--;
        updateChecksCounter();
        
        // Store results and redirect
        localStorage.setItem('checkResults', JSON.stringify(results));
        window.location.href = 'results.html';
        
    } catch (error) {
        console.error('Check failed:', error);
        alert('An error occurred during the check. Please try again.');
        submitBtn.classList.remove('loading');
        btnText.textContent = originalText;
    }
}

// Simulate shadow ban check (placeholder for real API)
async function simulateCheck(platform, identifier) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic results based on platform
    const timestamp = new Date().toISOString();
    
    if (platform === 'twitter') {
        return {
            platform: 'twitter',
            identifier: identifier,
            timestamp: timestamp,
            status: Math.random() > 0.3 ? 'clean' : 'restricted',
            checks: {
                searchBan: {
                    status: Math.random() > 0.7 ? 'failed' : 'passed',
                    description: 'Your tweets appear in search results'
                },
                searchSuggestion: {
                    status: Math.random() > 0.8 ? 'failed' : 'passed',
                    description: 'Your profile appears in search suggestions'
                },
                ghostBan: {
                    status: 'passed',
                    description: 'Your replies are visible to others'
                },
                replyDeboosting: {
                    status: 'passed',
                    description: 'Your replies are not being suppressed'
                }
            },
            details: {
                accountAge: '2 years',
                followers: '1,234',
                lastTweet: '2 hours ago',
                engagementRate: 'Normal'
            }
        };
    }
    
    if (platform === 'reddit') {
        return {
            platform: 'reddit',
            identifier: identifier,
            timestamp: timestamp,
            status: Math.random() > 0.8 ? 'restricted' : 'clean',
            checks: {
                sitewideBan: {
                    status: 'passed',
                    description: 'No site-wide shadow ban detected'
                },
                profileVisibility: {
                    status: 'passed',
                    description: 'Your profile is publicly visible'
                },
                postVisibility: {
                    status: Math.random() > 0.9 ? 'failed' : 'passed',
                    description: 'Your posts are visible to others'
                },
                accountStatus: {
                    status: 'passed',
                    description: 'Account is in good standing'
                }
            },
            details: {
                accountAge: '3 years',
                karma: '12,456',
                lastPost: '5 hours ago',
                subredditBans: 0
            }
        };
    }
    
    if (platform === 'email') {
        return {
            platform: 'email',
            identifier: identifier,
            timestamp: timestamp,
            status: Math.random() > 0.4 ? 'clean' : 'issues',
            checks: {
                blacklists: {
                    status: Math.random() > 0.7 ? 'failed' : 'passed',
                    description: 'Checked 25+ spam blacklists',
                    found: Math.random() > 0.7 ? 2 : 0
                },
                spfRecord: {
                    status: Math.random() > 0.5 ? 'failed' : 'passed',
                    description: 'SPF record validation'
                },
                dkimRecord: {
                    status: Math.random() > 0.6 ? 'failed' : 'passed',
                    description: 'DKIM signature present'
                },
                dmarcRecord: {
                    status: Math.random() > 0.5 ? 'failed' : 'passed',
                    description: 'DMARC policy configured'
                },
                reputation: {
                    status: 'passed',
                    score: Math.floor(Math.random() * 30) + 70,
                    description: 'Sender reputation score'
                }
            },
            details: {
                domain: identifier.includes('@') ? identifier.split('@')[1] : identifier,
                mxRecords: 'Valid',
                sslCertificate: 'Valid',
                reverseDNS: 'Configured'
            }
        };
    }
    
    return {
        platform: platform,
        identifier: identifier,
        timestamp: timestamp,
        status: 'error',
        message: 'Platform not yet implemented'
    };
}

// Update checks counter
function updateChecksCounter() {
    const counterElement = document.getElementById('checks-remaining');
    if (counterElement) {
        counterElement.textContent = checksRemaining;
        
        // Store in localStorage
        localStorage.setItem('checksRemaining', checksRemaining);
        localStorage.setItem('lastCheckDate', new Date().toDateString());
    }
}

// Load checks counter from localStorage
function loadChecksCounter() {
    const lastCheckDate = localStorage.getItem('lastCheckDate');
    const today = new Date().toDateString();
    
    // Reset if it's a new day
    if (lastCheckDate !== today) {
        checksRemaining = 3;
        localStorage.setItem('checksRemaining', checksRemaining);
        localStorage.setItem('lastCheckDate', today);
    } else {
        const stored = localStorage.getItem('checksRemaining');
        checksRemaining = stored ? parseInt(stored) : 3;
    }
    
    updateChecksCounter();
}

// Claude Co-Pilot (reuse from main.js)
const copilotBtn = document.getElementById('claude-copilot-btn');
const copilotChat = document.getElementById('claude-copilot');
const copilotClose = document.getElementById('copilot-close');
const copilotInput = document.getElementById('copilot-input-field');
const copilotSend = document.getElementById('copilot-send');
const copilotMessages = document.getElementById('copilot-messages');

copilotBtn.addEventListener('click', () => {
    copilotChat.classList.remove('hidden');
    copilotBtn.style.display = 'none';
    copilotInput.focus();
});

copilotClose.addEventListener('click', () => {
    copilotChat.classList.add('hidden');
    copilotBtn.style.display = 'flex';
});

async function sendMessage() {
    const message = copilotInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    copilotInput.value = '';
    
    const typingId = addTypingIndicator();
    
    try {
        const response = await getCopilotResponse(message);
        removeTypingIndicator(typingId);
        addMessage(response, 'assistant');
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    }
    
    copilotMessages.scrollTop = copilotMessages.scrollHeight;
}

copilotSend.addEventListener('click', sendMessage);
copilotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `copilot-message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(content);
    
    messageDiv.appendChild(contentDiv);
    copilotMessages.appendChild(messageDiv);
    copilotMessages.scrollTop = copilotMessages.scrollHeight;
}

function formatMessage(text) {
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    return text;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'copilot-message assistant typing-indicator';
    typingDiv.id = 'typing-' + Date.now();
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = '...';
    
    typingDiv.appendChild(contentDiv);
    copilotMessages.appendChild(typingDiv);
    copilotMessages.scrollTop = copilotMessages.scrollHeight;
    
    return typingDiv.id;
}

function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) indicator.remove();
}

async function getCopilotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('which platform') || lowerMessage.includes('choose')) {
        return `**Choosing a Platform:**\n\n- **Twitter/X**: If you're seeing low engagement or suspect search/reply bans\n- **Reddit**: If your posts aren't getting votes or comments\n- **Email**: If your emails are going to spam\n\nAll three are live now. Instagram, TikTok, and LinkedIn coming soon!\n\nWhich one are you concerned about?`;
    }
    
    if (lowerMessage.includes('username') || lowerMessage.includes('what enter')) {
        return `**What to Enter:**\n\n- **Twitter**: Just your username (no @)\n- **Reddit**: Your username (no u/)\n- **Email**: Your email address or domain\n\nMake sure it's exactly as it appears on the platform!`;
    }
    
    if (lowerMessage.includes('how long') || lowerMessage.includes('time')) {
        return `Checks usually take **20-30 seconds**. We're testing multiple signals:\n\n- Search visibility\n- Profile suggestions\n- Content reachability\n- Engagement patterns\n\nYou'll get detailed results showing exactly what we found!`;
    }
    
    if (lowerMessage.includes('free checks') || lowerMessage.includes('limit')) {
        return `**Free Plan:**\n- 3 checks per day\n- Resets every 24 hours\n- Basic reports\n\n**Pro Plan ($19.99/mo):**\n- Unlimited checks\n- All platforms\n- Historical tracking\n- Email alerts\n\nWant to upgrade?`;
    }
    
    return `I can help you:\n- Choose the right platform\n- Understand what to enter\n- Explain the checks we perform\n- Interpret results\n\nWhat would you like to know?`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadChecksCounter();
    
    // Select first active platform by default
    const firstActive = document.querySelector('.platform-option.active');
    if (firstActive) {
        firstActive.click();
    }
});
