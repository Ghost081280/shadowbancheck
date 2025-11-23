// Hashtag Checker JavaScript

// Real banned/restricted hashtags database
// This is a starter list - you'll expand this
const BANNED_HASHTAGS = {
    // Instagram banned hashtags
    instagram: [
        'ass', 'assday', 'adulting', 'alone', 'attractive', 'beautyblogger',
        'bikinibody', 'boho', 'brain', 'costumes', 'curvygirls', 'dating',
        'desk', 'dm', 'elevator', 'eggplant', 'fitnessgirls', 'fitfam',
        'girlsonly', 'gloves', 'graffitiigers', 'happythanksgiving', 'hardsummer',
        'humpday', 'hustler', 'ilovemyjob', 'instamood', 'kansas', 'kissing',
        'killingit', 'lavieenrose', 'leaves', 'like', 'likeforlike', 'milf',
        'models', 'newyearseve', 'nasty', 'nudeart', 'overnight', 'petite',
        'pornfood', 'popular', 'pushup', 'rate', 'saltwater', 'selfharm',
        'sexy', 'single', 'skateboarding', 'skype', 'snap', 'stranger',
        'snowstorm', 'streetphoto', 'sunbathing', 'supplementsthatwork',
        'swole', 'tanlines', 'teenagers', 'tgif', 'thinspo', 'todayimwearing',
        'twerk', 'undies', 'valentinesday', 'woman', 'workflow', 'wrongway'
    ],
    
    // TikTok restricted
    tiktok: [
        'porn', 'sex', 'nudity', 'sexy', 'hot', 'underwear', 'lingerie',
        'plottwist', 'xyzbca', 'foryou', 'pov', 'acne', 'weightloss',
        'eatingdisorder', 'selfharm', 'depression', 'anxiety'
    ],
    
    // Twitter/X (mostly algorithmically suppressed)
    twitter: [
        'covid', 'coronavirus', 'vaccine', 'election', 'fraud', 'rigged',
        'porn', 'sex', 'nsfw', 'onlyfans'
    ]
};

// Restricted hashtags (not banned, but suppressed)
const RESTRICTED_HASHTAGS = {
    instagram: [
        'bacak', 'beautyblogger', 'books', 'boobs', 'brain', 'bra',
        'costumes', 'dating', 'direct', 'edm', 'fishnets', 'goddess',
        'graffitiigers', 'hipster', 'hotweather', 'ice', 'italiano',
        'kissing', 'legs', 'master', 'models', 'mustfollow', 'parties',
        'publicrelations', 'russian', 'saltwater', 'sexy', 'skateboarding',
        'snap', 'southern', 'swingers', 'teens', 'thought', 'undies', 'weed'
    ],
    tiktok: [
        'fyp', 'foryou', 'foryoupage', 'viral', 'xyzbca'
    ],
    twitter: []
};

// State
let checksRemaining = 5;
let currentResults = [];

// DOM Elements
const hashtagInput = document.getElementById('hashtag-input');
const hashtagCount = document.getElementById('hashtag-count');
const checksRemainingDisplay = document.getElementById('checks-remaining-display');
const checkBtn = document.getElementById('check-hashtags-btn');
const clearBtn = document.getElementById('clear-btn');
const exampleBtn = document.getElementById('example-btn');
const resultsSection = document.getElementById('results-section');
const resultsList = document.getElementById('results-list');
const safeCountEl = document.getElementById('safe-count');
const bannedCountEl = document.getElementById('banned-count');
const restrictedCountEl = document.getElementById('restricted-count');
const copySafeBtn = document.getElementById('copy-safe-btn');
const exportBtn = document.getElementById('export-btn');

// Update hashtag count as user types
hashtagInput.addEventListener('input', updateHashtagCount);

function updateHashtagCount() {
    const hashtags = extractHashtags(hashtagInput.value);
    const count = hashtags.length;
    hashtagCount.textContent = `${count} hashtag${count !== 1 ? 's' : ''}`;
    
    // Enable/disable check button
    checkBtn.disabled = count === 0 || checksRemaining <= 0;
}

// Extract hashtags from text
function extractHashtags(text) {
    // Remove # symbols and split by whitespace, commas, newlines
    const cleaned = text.replace(/#/g, '').toLowerCase();
    const hashtags = cleaned.split(/[\s,\n]+/).filter(h => h.trim().length > 0);
    return [...new Set(hashtags)]; // Remove duplicates
}

// Check hashtags button
checkBtn.addEventListener('click', async () => {
    const hashtags = extractHashtags(hashtagInput.value);
    
    if (hashtags.length === 0) {
        alert('Please enter at least one hashtag');
        return;
    }
    
    if (checksRemaining <= 0) {
        alert('You\'ve used all your free checks for today! Upgrade to Creator for unlimited checks.');
        window.location.href = 'index.html#pricing';
        return;
    }
    
    // Show loading state
    checkBtn.disabled = true;
    checkBtn.querySelector('.btn-text').textContent = 'Checking...';
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check hashtags
    const results = checkHashtags(hashtags);
    currentResults = results;
    
    // Update checks remaining
    checksRemaining--;
    updateChecksRemaining();
    
    // Display results
    displayResults(results);
    
    // Reset button
    checkBtn.disabled = false;
    checkBtn.querySelector('.btn-text').textContent = 'Check Hashtags';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
});

// Check hashtags against database
function checkHashtags(hashtags) {
    return hashtags.map(tag => {
        const platforms = {
            instagram: checkPlatform(tag, 'instagram'),
            tiktok: checkPlatform(tag, 'tiktok'),
            twitter: checkPlatform(tag, 'twitter')
        };
        
        // Determine overall status
        let status = 'safe';
        if (Object.values(platforms).some(p => p === 'banned')) {
            status = 'banned';
        } else if (Object.values(platforms).some(p => p === 'restricted')) {
            status = 'restricted';
        }
        
        return {
            tag: tag,
            status: status,
            platforms: platforms
        };
    });
}

function checkPlatform(tag, platform) {
    if (BANNED_HASHTAGS[platform] && BANNED_HASHTAGS[platform].includes(tag)) {
        return 'banned';
    }
    if (RESTRICTED_HASHTAGS[platform] && RESTRICTED_HASHTAGS[platform].includes(tag)) {
        return 'restricted';
    }
    return 'safe';
}

// Display results
function displayResults(results) {
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Update summary
    const safeCount = results.filter(r => r.status === 'safe').length;
    const bannedCount = results.filter(r => r.status === 'banned').length;
    const restrictedCount = results.filter(r => r.status === 'restricted').length;
    
    safeCountEl.textContent = safeCount;
    bannedCountEl.textContent = bannedCount;
    restrictedCountEl.textContent = restrictedCount;
    
    // Display individual results
    resultsList.innerHTML = '';
    results.forEach(result => {
        const resultEl = createResultElement(result);
        resultsList.appendChild(resultEl);
    });
}

function createResultElement(result) {
    const div = document.createElement('div');
    div.className = `result-item ${result.status}`;
    
    const statusIcons = {
        safe: '✅',
        banned: '❌',
        restricted: '⚠️'
    };
    
    const statusText = {
        safe: 'Safe to use',
        banned: 'Banned on one or more platforms',
        restricted: 'Restricted - may limit reach'
    };
    
    const platformHTML = `
        <div class="result-platforms">
            <span class="platform-status ${result.platforms.instagram}">
                📸 ${result.platforms.instagram === 'safe' ? '✓' : result.platforms.instagram === 'banned' ? '✗' : '⚠'}
            </span>
            <span class="platform-status ${result.platforms.tiktok}">
                🎵 ${result.platforms.tiktok === 'safe' ? '✓' : result.platforms.tiktok === 'banned' ? '✗' : '⚠'}
            </span>
            <span class="platform-status ${result.platforms.twitter}">
                🐦 ${result.platforms.twitter === 'safe' ? '✓' : result.platforms.twitter === 'banned' ? '✗' : '⚠'}
            </span>
        </div>
    `;
    
    div.innerHTML = `
        <div class="result-left">
            <span class="result-icon">${statusIcons[result.status]}</span>
            <div class="result-info">
                <div class="result-hashtag">#${result.tag}</div>
                <div class="result-status">${statusText[result.status]}</div>
                ${platformHTML}
            </div>
        </div>
        <div class="result-right">
            <button class="alternatives-btn ${result.status === 'safe' ? 'pro-only' : ''}" 
                    ${result.status === 'safe' ? 'disabled' : ''}>
                ${result.status === 'safe' ? 'No alternatives needed' : 'Get Alternatives (Pro)'}
            </button>
        </div>
    `;
    
    return div;
}

// Update checks remaining display
function updateChecksRemaining() {
    checksRemainingDisplay.textContent = `${checksRemaining} free checks left today`;
    localStorage.setItem('hashtagChecksRemaining', checksRemaining);
    localStorage.setItem('hashtagLastCheckDate', new Date().toDateString());
}

// Load checks remaining from localStorage
function loadChecksRemaining() {
    const lastCheckDate = localStorage.getItem('hashtagLastCheckDate');
    const today = new Date().toDateString();
    
    if (lastCheckDate !== today) {
        checksRemaining = 5;
        localStorage.setItem('hashtagChecksRemaining', checksRemaining);
        localStorage.setItem('hashtagLastCheckDate', today);
    } else {
        const stored = localStorage.getItem('hashtagChecksRemaining');
        checksRemaining = stored ? parseInt(stored) : 5;
    }
    
    updateChecksRemaining();
}

// Clear button
clearBtn.addEventListener('click', () => {
    hashtagInput.value = '';
    updateHashtagCount();
    resultsSection.classList.add('hidden');
});

// Example button
exampleBtn.addEventListener('click', () => {
    hashtagInput.value = '#fitness #motivation #gains #workout #fitfam #love #instagood #sexy';
    updateHashtagCount();
});

// Copy safe hashtags
copySafeBtn.addEventListener('click', () => {
    const safeHashtags = currentResults
        .filter(r => r.status === 'safe')
        .map(r => '#' + r.tag)
        .join(' ');
    
    if (safeHashtags) {
        navigator.clipboard.writeText(safeHashtags).then(() => {
            alert('Safe hashtags copied to clipboard!');
        });
    } else {
        alert('No safe hashtags to copy.');
    }
});

// Export results
exportBtn.addEventListener('click', () => {
    const exportText = generateExportText();
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hashtag-check-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

function generateExportText() {
    let text = 'HASHTAG SAFETY CHECK RESULTS\n';
    text += '============================\n\n';
    text += `Checked: ${new Date().toLocaleString()}\n`;
    text += `Total Hashtags: ${currentResults.length}\n\n`;
    
    text += 'SAFE HASHTAGS:\n';
    currentResults.filter(r => r.status === 'safe').forEach(r => {
        text += `#${r.tag}\n`;
    });
    
    text += '\nBANNED HASHTAGS:\n';
    currentResults.filter(r => r.status === 'banned').forEach(r => {
        text += `#${r.tag} - Banned on: `;
        const banned = [];
        if (r.platforms.instagram === 'banned') banned.push('Instagram');
        if (r.platforms.tiktok === 'banned') banned.push('TikTok');
        if (r.platforms.twitter === 'banned') banned.push('Twitter');
        text += banned.join(', ') + '\n';
    });
    
    text += '\nRESTRICTED HASHTAGS:\n';
    currentResults.filter(r => r.status === 'restricted').forEach(r => {
        text += `#${r.tag}\n`;
    });
    
    text += '\n--\nGenerated by ShadowBanCheck.io';
    return text;
}

// Claude Co-Pilot (reuse from other pages)
const copilotBtn = document.getElementById('claude-copilot-btn');
const copilotChat = document.getElementById('claude-copilot');
const copilotClose = document.getElementById('copilot-close');
const copilotInput = document.getElementById('copilot-input-field');
const copilotSend = document.getElementById('copilot-send');
const copilotMessages = document.getElementById('copilot-messages');

copilotBtn?.addEventListener('click', () => {
    copilotChat.classList.remove('hidden');
    copilotBtn.style.display = 'none';
    copilotInput.focus();
});

copilotClose?.addEventListener('click', () => {
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
        addMessage('Sorry, I encountered an error.', 'assistant');
    }
    
    copilotMessages.scrollTop = copilotMessages.scrollHeight;
}

copilotSend?.addEventListener('click', sendMessage);
copilotInput?.addEventListener('keypress', (e) => {
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
    return text;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'copilot-message assistant';
    typingDiv.id = 'typing-' + Date.now();
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = '...';
    
    typingDiv.appendChild(contentDiv);
    copilotMessages.appendChild(typingDiv);
    
    return typingDiv.id;
}

function removeTypingIndicator(id) {
    document.getElementById(id)?.remove();
}

async function getCopilotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('why') && lowerMessage.includes('banned')) {
        return `**Why Hashtags Get Banned:**\n\n- **Spam abuse**: Overused by bots and spammers\n- **Inappropriate content**: Associated with adult/harmful content\n- **Community violations**: Used to spread misinformation\n- **Temporary bans**: Some hashtags are banned then unbanned\n\nHashtags like #sexy, #ass, #porn are permanently banned on Instagram. Others like #fitfam were temporarily banned but are now safe.`;
    }
    
    if (lowerMessage.includes('alternative') || lowerMessage.includes('instead')) {
        return `**Finding Alternative Hashtags:**\n\n1. Use niche variations (e.g., #fitnessjourney instead of #fitfam)\n2. Mix popular + specific (e.g., #weightlifting + #strengthtraining)\n3. Research competitors' hashtags\n4. Use platform-specific trending tags\n\n**Pro tip**: Upgrade to Creator plan to get AI-powered alternative suggestions for every banned hashtag!`;
    }
    
    if (lowerMessage.includes('instagram') || lowerMessage.includes('ig')) {
        return `**Instagram Hashtag Strategy:**\n\n- Use 5-10 hashtags per post (not 30)\n- Mix popularity levels (1 big + 4 medium + 5 niche)\n- Avoid ALL trending hashtags\n- Research your niche specifically\n- Check hashtags BEFORE posting\n\nInstagram has the strictest bans - thousands of hashtags are blocked!`;
    }
    
    if (lowerMessage.includes('tiktok')) {
        return `**TikTok Hashtag Strategy:**\n\n- Use 3-5 relevant hashtags\n- Avoid overused viral tags (#fyp, #foryou)\n- Focus on niche-specific tags\n- Use trending sounds + niche hashtags\n- Mix branded + generic tags\n\nTikTok cares more about video content than hashtags, but banned tags still hurt!`;
    }
    
    if (lowerMessage.includes('how many')) {
        return `**Optimal Hashtag Count:**\n\n- **Instagram**: 5-10 hashtags (quality > quantity)\n- **TikTok**: 3-5 hashtags\n- **Twitter**: 1-2 hashtags max\n\nUsing too many hashtags looks spammy. Focus on relevance!`;
    }
    
    return `I can help you with:\n- Why hashtags get banned\n- Platform-specific strategies\n- How to find alternatives\n- Best practices for engagement\n\nWhat would you like to know?`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChecksRemaining();
    updateHashtagCount();
});
