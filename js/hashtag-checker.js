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
        alert('You\'ve used all your free checks for today. Upgrade to Creator plan!');
        window.location.href = 'index.html#pricing';
        return;
    }
    
    // Analyze hashtags
    currentResults = hashtags.map(tag => analyzeHashtag(tag));
    
    // Decrement checks
    checksRemaining--;
    updateChecksRemaining();
    
    // Display results
    displayResults();
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
});

function analyzeHashtag(tag) {
    const result = {
        tag: tag,
        status: 'safe',
        platforms: {
            instagram: 'safe',
            tiktok: 'safe',
            twitter: 'safe'
        },
        message: 'This hashtag is safe to use'
    };
    
    // Check if banned on each platform
    if (BANNED_HASHTAGS.instagram.includes(tag)) {
        result.platforms.instagram = 'banned';
        result.status = 'banned';
    } else if (RESTRICTED_HASHTAGS.instagram.includes(tag)) {
        result.platforms.instagram = 'restricted';
        result.status = result.status === 'banned' ? 'banned' : 'restricted';
    }
    
    if (BANNED_HASHTAGS.tiktok.includes(tag)) {
        result.platforms.tiktok = 'banned';
        result.status = 'banned';
    } else if (RESTRICTED_HASHTAGS.tiktok.includes(tag)) {
        result.platforms.tiktok = 'restricted';
        result.status = result.status === 'banned' ? 'banned' : 'restricted';
    }
    
    if (BANNED_HASHTAGS.twitter.includes(tag)) {
        result.platforms.twitter = 'banned';
        result.status = 'banned';
    } else if (RESTRICTED_HASHTAGS.twitter.includes(tag)) {
        result.platforms.twitter = 'restricted';
        result.status = result.status === 'banned' ? 'banned' : 'restricted';
    }
    
    // Update message based on status
    if (result.status === 'banned') {
        const bannedPlatforms = [];
        if (result.platforms.instagram === 'banned') bannedPlatforms.push('Instagram');
        if (result.platforms.tiktok === 'banned') bannedPlatforms.push('TikTok');
        if (result.platforms.twitter === 'banned') bannedPlatforms.push('Twitter');
        result.message = `Banned on ${bannedPlatforms.join(', ')}`;
    } else if (result.status === 'restricted') {
        const restrictedPlatforms = [];
        if (result.platforms.instagram === 'restricted') restrictedPlatforms.push('Instagram');
        if (result.platforms.tiktok === 'restricted') restrictedPlatforms.push('TikTok');
        if (result.platforms.twitter === 'restricted') restrictedPlatforms.push('Twitter');
        result.message = `Restricted on ${restrictedPlatforms.join(', ')}`;
    }
    
    return result;
}

function displayResults() {
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Calculate counts
    const safeCount = currentResults.filter(r => r.status === 'safe').length;
    const bannedCount = currentResults.filter(r => r.status === 'banned').length;
    const restrictedCount = currentResults.filter(r => r.status === 'restricted').length;
    
    // Update summary
    safeCountEl.textContent = safeCount;
    bannedCountEl.textContent = bannedCount;
    restrictedCountEl.textContent = restrictedCount;
    
    // Clear and populate results list
    resultsList.innerHTML = '';
    
    currentResults.forEach(result => {
        const resultItem = createResultItem(result);
        resultsList.appendChild(resultItem);
    });
}

function createResultItem(result) {
    const item = document.createElement('div');
    item.className = `result-item ${result.status}`;
    
    const icon = result.status === 'safe' ? '✅' : 
                 result.status === 'banned' ? '🚫' : '⚠️';
    
    item.innerHTML = `
        <div class="result-left">
            <div class="result-icon">${icon}</div>
            <div class="result-info">
                <div class="result-hashtag">#${result.tag}</div>
                <div class="result-status">${result.message}</div>
                <div class="result-platforms">
                    <span class="platform-status ${result.platforms.instagram}">
                        📸 ${result.platforms.instagram}
                    </span>
                    <span class="platform-status ${result.platforms.tiktok}">
                        🎵 ${result.platforms.tiktok}
                    </span>
                    <span class="platform-status ${result.platforms.twitter}">
                        🐦 ${result.platforms.twitter}
                    </span>
                </div>
            </div>
        </div>
        <div class="result-right">
            <button class="alternatives-btn pro-only" disabled>
                Alternatives (Pro)
            </button>
        </div>
    `;
    
    return item;
}

function updateChecksRemaining() {
    checksRemainingDisplay.textContent = `${checksRemaining} free check${checksRemaining !== 1 ? 's' : ''} left today`;
    
    // Store in localStorage
    localStorage.setItem('hashtagChecksRemaining', checksRemaining);
    localStorage.setItem('hashtagLastCheckDate', new Date().toDateString());
    
    // Disable check button if no checks remaining
    updateHashtagCount();
}

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChecksRemaining();
    updateHashtagCount();
});
