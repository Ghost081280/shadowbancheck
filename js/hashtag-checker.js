// =============================================================================
// HASHTAG CHECKER JAVASCRIPT - Full Functionality
// =============================================================================

// Real banned/restricted hashtags database (expanded)
const BANNED_HASHTAGS = {
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
    tiktok: [
        'porn', 'sex', 'nudity', 'sexy', 'hot', 'underwear', 'lingerie',
        'plottwist', 'xyzbca', 'foryou', 'pov', 'acne', 'weightloss',
        'eatingdisorder', 'selfharm', 'depression', 'anxiety', 'suicide',
        'proed', 'thinspo', 'bones', 'starving'
    ],
    twitter: [
        'covid', 'coronavirus', 'vaccine', 'election', 'fraud', 'rigged',
        'porn', 'sex', 'nsfw', 'onlyfans', 'leaked', 'nude'
    ],
    facebook: [
        'porn', 'sex', 'nude', 'naked', 'xxx', 'escort', 'hookup',
        'dating', 'singles', 'meetup', 'crypto', 'bitcoin', 'invest'
    ]
};

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
        'fyp', 'foryou', 'foryoupage', 'viral', 'xyzbca', 'trending',
        'blowup', 'famous', 'clout'
    ],
    twitter: [
        'maga', 'resist', 'woke', 'cancel', 'boycott'
    ],
    facebook: [
        'mlm', 'workfromhome', 'bossbabe', 'hunlife', 'sidehustle'
    ]
};

// Trending Banned Hashtags (placeholder data - to be replaced with AI-fetched data)
const TRENDING_BANNED = [
    { tag: 'thinspo', platforms: ['instagram', 'tiktok'], reason: 'Promotes eating disorders' },
    { tag: 'proed', platforms: ['instagram', 'tiktok', 'facebook'], reason: 'Pro-eating disorder content' },
    { tag: 'selfharm', platforms: ['instagram', 'tiktok', 'twitter'], reason: 'Self-harm promotion' },
    { tag: 'suicide', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Suicide-related content' },
    { tag: 'bikinibody', platforms: ['instagram'], reason: 'Body shaming concerns' },
    { tag: 'fitfam', platforms: ['instagram'], reason: 'Spam/engagement manipulation' },
    { tag: 'likeforlike', platforms: ['instagram', 'tiktok'], reason: 'Engagement manipulation' },
    { tag: 'followforfollow', platforms: ['instagram', 'tiktok'], reason: 'Engagement manipulation' },
    { tag: 'eggplant', platforms: ['instagram'], reason: 'Sexual innuendo' },
    { tag: 'humpday', platforms: ['instagram'], reason: 'Sexual content association' },
    { tag: 'milf', platforms: ['instagram', 'tiktok', 'facebook'], reason: 'Adult content' },
    { tag: 'sexy', platforms: ['instagram', 'tiktok'], reason: 'Adult content' },
    { tag: 'porn', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Adult content' },
    { tag: 'nsfw', platforms: ['instagram', 'tiktok', 'facebook'], reason: 'Adult content flag' },
    { tag: 'onlyfans', platforms: ['instagram', 'tiktok'], reason: 'Adult platform promotion' },
    { tag: 'escort', platforms: ['instagram', 'facebook'], reason: 'Illegal services' },
    { tag: 'hookup', platforms: ['instagram', 'facebook'], reason: 'Dating/adult services' },
    { tag: 'weed', platforms: ['instagram', 'facebook'], reason: 'Drug-related content' },
    { tag: 'cannabis', platforms: ['instagram', 'facebook'], reason: 'Drug-related content' },
    { tag: 'edibles', platforms: ['instagram', 'facebook'], reason: 'Drug-related content' },
    { tag: 'depression', platforms: ['tiktok'], reason: 'Mental health sensitivity' },
    { tag: 'anxiety', platforms: ['tiktok'], reason: 'Mental health sensitivity' },
    { tag: 'weightloss', platforms: ['tiktok'], reason: 'Body image concerns' },
    { tag: 'skinny', platforms: ['instagram', 'tiktok'], reason: 'Body image concerns' },
    { tag: 'bones', platforms: ['tiktok'], reason: 'Eating disorder association' },
    { tag: 'starving', platforms: ['tiktok'], reason: 'Eating disorder association' },
    { tag: 'curvy', platforms: ['instagram'], reason: 'Spam/adult content' },
    { tag: 'curvygirls', platforms: ['instagram'], reason: 'Spam/adult content' },
    { tag: 'models', platforms: ['instagram'], reason: 'High spam volume' },
    { tag: 'beautyblogger', platforms: ['instagram'], reason: 'High spam volume' },
    { tag: 'single', platforms: ['instagram'], reason: 'Dating spam' },
    { tag: 'dating', platforms: ['instagram', 'facebook'], reason: 'Dating spam' },
    { tag: 'snap', platforms: ['instagram'], reason: 'Cross-platform spam' },
    { tag: 'skype', platforms: ['instagram'], reason: 'Cross-platform spam' },
    { tag: 'dm', platforms: ['instagram'], reason: 'Spam/solicitation' },
    { tag: 'tgif', platforms: ['instagram'], reason: 'Alcohol content association' },
    { tag: 'parties', platforms: ['instagram'], reason: 'Alcohol/drug association' },
    { tag: 'rave', platforms: ['instagram'], reason: 'Drug association' },
    { tag: 'mdma', platforms: ['instagram', 'tiktok', 'facebook'], reason: 'Drug content' },
    { tag: 'molly', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'lsd', platforms: ['instagram', 'tiktok', 'facebook'], reason: 'Drug content' },
    { tag: 'shrooms', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'cocaine', platforms: ['instagram', 'tiktok', 'facebook'], reason: 'Drug content' },
    { tag: 'heroin', platforms: ['instagram', 'tiktok', 'facebook'], reason: 'Drug content' },
    { tag: 'meth', platforms: ['instagram', 'tiktok', 'facebook'], reason: 'Drug content' },
    { tag: 'pills', platforms: ['instagram'], reason: 'Drug/pharma content' },
    { tag: 'xanax', platforms: ['instagram', 'tiktok'], reason: 'Controlled substance' },
    { tag: 'lean', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'crypto', platforms: ['facebook'], reason: 'Financial scam association' },
    { tag: 'bitcoin', platforms: ['facebook'], reason: 'Financial scam association' },
    { tag: 'forex', platforms: ['instagram', 'facebook'], reason: 'Financial scam association' },
    { tag: 'mlm', platforms: ['facebook'], reason: 'Multi-level marketing' },
    { tag: 'bossbabe', platforms: ['facebook'], reason: 'MLM association' },
    { tag: 'hunlife', platforms: ['facebook'], reason: 'MLM association' },
    { tag: 'teenager', platforms: ['instagram'], reason: 'Child safety concerns' },
    { tag: 'teenagers', platforms: ['instagram'], reason: 'Child safety concerns' },
    { tag: 'teens', platforms: ['instagram'], reason: 'Child safety concerns' },
    { tag: 'youngmodel', platforms: ['instagram'], reason: 'Child safety concerns' },
    { tag: 'preteen', platforms: ['instagram', 'tiktok', 'facebook'], reason: 'Child safety' },
    { tag: 'underage', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Child safety' },
    { tag: 'girlsonly', platforms: ['instagram'], reason: 'Spam/adult content' },
    { tag: 'boysonly', platforms: ['instagram'], reason: 'Spam/adult content' },
    { tag: 'adulting', platforms: ['instagram'], reason: 'Spam volume' },
    { tag: 'workflow', platforms: ['instagram'], reason: 'Spam volume' },
    { tag: 'desk', platforms: ['instagram'], reason: 'Spam volume' },
    { tag: 'elevator', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'overnight', platforms: ['instagram'], reason: 'Spam/adult content' },
    { tag: 'newyearseve', platforms: ['instagram'], reason: 'Spam volume' },
    { tag: 'valentinesday', platforms: ['instagram'], reason: 'Spam volume' },
    { tag: 'happythanksgiving', platforms: ['instagram'], reason: 'Spam volume' },
    { tag: 'hardsummer', platforms: ['instagram'], reason: 'Drug/festival association' },
    { tag: 'edm', platforms: ['instagram'], reason: 'Drug association' },
    { tag: 'rave', platforms: ['instagram'], reason: 'Drug association' },
    { tag: 'graffiti', platforms: ['instagram'], reason: 'Vandalism' },
    { tag: 'tagging', platforms: ['instagram'], reason: 'Vandalism/spam' },
    { tag: 'bombing', platforms: ['instagram', 'twitter'], reason: 'Violence/vandalism' },
    { tag: 'gunsforsale', platforms: ['instagram', 'facebook'], reason: 'Weapons' },
    { tag: 'guns', platforms: ['instagram'], reason: 'Weapons content' },
    { tag: 'rifle', platforms: ['instagram', 'facebook'], reason: 'Weapons content' },
    { tag: 'ammo', platforms: ['instagram', 'facebook'], reason: 'Weapons content' },
    { tag: 'ar15', platforms: ['instagram', 'facebook'], reason: 'Weapons content' },
    { tag: 'fraud', platforms: ['twitter'], reason: 'Misinformation' },
    { tag: 'rigged', platforms: ['twitter'], reason: 'Election misinformation' },
    { tag: 'stolen', platforms: ['twitter'], reason: 'Election misinformation' },
    { tag: 'antivax', platforms: ['instagram', 'facebook'], reason: 'Medical misinformation' },
    { tag: 'plandemic', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Medical misinformation' },
    { tag: 'scamdemic', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Medical misinformation' },
    { tag: 'ivermectin', platforms: ['facebook'], reason: 'Medical misinformation' },
    { tag: 'hydroxychloroquine', platforms: ['facebook'], reason: 'Medical misinformation' },
    { tag: 'bleach', platforms: ['facebook'], reason: 'Dangerous content' },
    { tag: 'killallmen', platforms: ['twitter'], reason: 'Hate speech' },
    { tag: 'killall', platforms: ['twitter', 'facebook'], reason: 'Violence' },
    { tag: 'nazi', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Hate speech' },
    { tag: 'whitepride', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Hate speech' },
    { tag: 'whitepower', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Hate speech' },
    { tag: 'kkk', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Hate group' },
    { tag: 'isis', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Terrorism' },
    { tag: 'alqaeda', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Terrorism' },
    { tag: 'jihad', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Terrorism' }
];

// State
let checksRemaining = 5;
let currentResults = [];
let showAllTrending = false;
let currentFilter = 'all';

// DOM Elements
const hashtagInput = document.getElementById('hashtag-input');
const hashtagCount = document.getElementById('hashtag-count');
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
const checkAgainBtn = document.getElementById('check-again-btn');
const pricingCta = document.getElementById('pricing-cta');
const searchesRemainingEl = document.getElementById('hashtag-searches-remaining');
const trendingGrid = document.getElementById('trending-grid');
const showMoreTrendingBtn = document.getElementById('show-more-trending');
const trendingDateEl = document.getElementById('trending-date');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChecksRemaining();
    updateHashtagCount();
    renderTrendingHashtags();
    setupEventListeners();
    updateTrendingDate();
});

function setupEventListeners() {
    // Form submission
    document.getElementById('hashtag-form').addEventListener('submit', handleCheck);
    
    // Input changes
    hashtagInput.addEventListener('input', updateHashtagCount);
    
    // Buttons
    clearBtn.addEventListener('click', handleClear);
    exampleBtn.addEventListener('click', handleExample);
    copySafeBtn.addEventListener('click', handleCopySafe);
    exportBtn.addEventListener('click', handleExport);
    checkAgainBtn.addEventListener('click', handleCheckAgain);
    showMoreTrendingBtn.addEventListener('click', toggleShowAllTrending);
    
    // Platform filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => handleFilterChange(btn.dataset.platform));
    });
}

function updateHashtagCount() {
    const hashtags = extractHashtags(hashtagInput.value);
    const count = hashtags.length;
    hashtagCount.textContent = `${count} hashtag${count !== 1 ? 's' : ''}`;
    checkBtn.disabled = count === 0 || checksRemaining <= 0;
}

function extractHashtags(text) {
    const cleaned = text.replace(/#/g, '').toLowerCase();
    const hashtags = cleaned.split(/[\s,\n]+/).filter(h => h.trim().length > 0);
    return [...new Set(hashtags)];
}

async function handleCheck(e) {
    e.preventDefault();
    
    const hashtags = extractHashtags(hashtagInput.value);
    
    if (hashtags.length === 0) {
        alert('Please enter at least one hashtag');
        return;
    }
    
    if (checksRemaining <= 0) {
        pricingCta.classList.remove('hidden');
        pricingCta.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // Show loading state
    checkBtn.classList.add('loading');
    checkBtn.disabled = true;
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Analyze hashtags
    currentResults = hashtags.map(tag => analyzeHashtag(tag));
    
    // Decrement checks
    checksRemaining--;
    updateChecksRemaining();
    
    // Remove loading state
    checkBtn.classList.remove('loading');
    checkBtn.disabled = false;
    
    // Display results
    displayResults();
    
    // Show pricing CTA if out of checks
    if (checksRemaining === 0) {
        pricingCta.classList.remove('hidden');
    }
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function analyzeHashtag(tag) {
    const result = {
        tag: tag,
        status: 'safe',
        platforms: {
            instagram: 'safe',
            tiktok: 'safe',
            twitter: 'safe',
            facebook: 'safe'
        },
        message: 'This hashtag is safe to use on all platforms'
    };
    
    // Check each platform
    ['instagram', 'tiktok', 'twitter', 'facebook'].forEach(platform => {
        if (BANNED_HASHTAGS[platform]?.includes(tag)) {
            result.platforms[platform] = 'banned';
            result.status = 'banned';
        } else if (RESTRICTED_HASHTAGS[platform]?.includes(tag)) {
            result.platforms[platform] = 'restricted';
            if (result.status !== 'banned') {
                result.status = 'restricted';
            }
        }
    });
    
    // Update message based on status
    if (result.status === 'banned') {
        const bannedPlatforms = Object.entries(result.platforms)
            .filter(([_, status]) => status === 'banned')
            .map(([platform]) => platform.charAt(0).toUpperCase() + platform.slice(1));
        result.message = `Banned on ${bannedPlatforms.join(', ')}`;
    } else if (result.status === 'restricted') {
        const restrictedPlatforms = Object.entries(result.platforms)
            .filter(([_, status]) => status === 'restricted')
            .map(([platform]) => platform.charAt(0).toUpperCase() + platform.slice(1));
        result.message = `Restricted on ${restrictedPlatforms.join(', ')}`;
    }
    
    return result;
}

function displayResults() {
    resultsSection.classList.remove('hidden');
    
    const safeCount = currentResults.filter(r => r.status === 'safe').length;
    const bannedCount = currentResults.filter(r => r.status === 'banned').length;
    const restrictedCount = currentResults.filter(r => r.status === 'restricted').length;
    
    safeCountEl.textContent = safeCount;
    bannedCountEl.textContent = bannedCount;
    restrictedCountEl.textContent = restrictedCount;
    
    resultsList.innerHTML = '';
    
    // Sort: banned first, then restricted, then safe
    const sortedResults = [...currentResults].sort((a, b) => {
        const order = { banned: 0, restricted: 1, safe: 2 };
        return order[a.status] - order[b.status];
    });
    
    sortedResults.forEach(result => {
        resultsList.appendChild(createResultItem(result));
    });
}

function createResultItem(result) {
    const item = document.createElement('div');
    item.className = `result-item ${result.status}`;
    
    const icon = result.status === 'safe' ? '✅' : 
                 result.status === 'banned' ? '🚫' : '⚠️';
    
    const platformIcons = {
        instagram: '📸',
        tiktok: '🎵',
        twitter: '🐦',
        facebook: '📘'
    };
    
    const platformsHTML = Object.entries(result.platforms).map(([platform, status]) => {
        return `<span class="platform-status ${status}">${platformIcons[platform]} ${platform}: ${status}</span>`;
    }).join('');
    
    item.innerHTML = `
        <div class="result-left">
            <div class="result-icon">${icon}</div>
            <div class="result-info">
                <div class="result-hashtag">#${result.tag}</div>
                <div class="result-status">${result.message}</div>
                <div class="result-platforms">${platformsHTML}</div>
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
    if (checksRemaining > 0) {
        searchesRemainingEl.textContent = `${checksRemaining} / 5 searches available today`;
    } else {
        searchesRemainingEl.textContent = '0 / 5 searches available today';
        searchesRemainingEl.style.color = '#ef4444';
    }
    
    localStorage.setItem('hashtagChecksRemaining', checksRemaining);
    localStorage.setItem('hashtagLastCheckDate', new Date().toDateString());
    
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

function handleClear() {
    hashtagInput.value = '';
    updateHashtagCount();
    resultsSection.classList.add('hidden');
}

function handleExample() {
    hashtagInput.value = '#fitness #motivation #gains #workout #fitfam #love #instagood #sexy #dating #beautyblogger';
    updateHashtagCount();
}

function handleCopySafe() {
    const safeHashtags = currentResults
        .filter(r => r.status === 'safe')
        .map(r => '#' + r.tag)
        .join(' ');
    
    if (safeHashtags) {
        navigator.clipboard.writeText(safeHashtags).then(() => {
            alert('✅ Safe hashtags copied to clipboard!');
        });
    } else {
        alert('No safe hashtags to copy.');
    }
}

function handleExport() {
    const exportText = generateExportText();
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hashtag-check-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function generateExportText() {
    let text = '═══════════════════════════════════════════\n';
    text += '       HASHTAG SAFETY CHECK RESULTS\n';
    text += '         ShadowBanCheck.io\n';
    text += '═══════════════════════════════════════════\n\n';
    text += `Checked: ${new Date().toLocaleString()}\n`;
    text += `Total Hashtags: ${currentResults.length}\n\n`;
    
    text += '───────────────────────────────────────────\n';
    text += '✅ SAFE HASHTAGS\n';
    text += '───────────────────────────────────────────\n';
    currentResults.filter(r => r.status === 'safe').forEach(r => {
        text += `#${r.tag}\n`;
    });
    
    text += '\n───────────────────────────────────────────\n';
    text += '🚫 BANNED HASHTAGS\n';
    text += '───────────────────────────────────────────\n';
    currentResults.filter(r => r.status === 'banned').forEach(r => {
        const banned = Object.entries(r.platforms)
            .filter(([_, status]) => status === 'banned')
            .map(([platform]) => platform);
        text += `#${r.tag} → ${banned.join(', ')}\n`;
    });
    
    text += '\n───────────────────────────────────────────\n';
    text += '⚠️ RESTRICTED HASHTAGS\n';
    text += '───────────────────────────────────────────\n';
    currentResults.filter(r => r.status === 'restricted').forEach(r => {
        const restricted = Object.entries(r.platforms)
            .filter(([_, status]) => status === 'restricted')
            .map(([platform]) => platform);
        text += `#${r.tag} → ${restricted.join(', ')}\n`;
    });
    
    text += '\n═══════════════════════════════════════════\n';
    text += 'Generated by ShadowBanCheck.io\n';
    text += 'https://shadowbancheck.io\n';
    return text;
}

function handleCheckAgain() {
    hashtagInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================================
// TRENDING BANNED HASHTAGS
// =============================================================================

function renderTrendingHashtags() {
    if (!trendingGrid) return;
    
    trendingGrid.innerHTML = '';
    
    const filteredHashtags = currentFilter === 'all' 
        ? TRENDING_BANNED 
        : TRENDING_BANNED.filter(h => h.platforms.includes(currentFilter));
    
    const displayCount = showAllTrending ? filteredHashtags.length : 30;
    
    filteredHashtags.slice(0, displayCount).forEach((hashtag, index) => {
        const item = document.createElement('div');
        item.className = 'trending-item';
        if (!showAllTrending && index >= 30) {
            item.classList.add('hidden-item');
        }
        
        const platformBadges = ['instagram', 'tiktok', 'twitter', 'facebook'].map(platform => {
            const isActive = hashtag.platforms.includes(platform);
            const icons = { instagram: '📸', tiktok: '🎵', twitter: '🐦', facebook: '📘' };
            return `<span class="platform-badge-mini ${isActive ? '' : 'inactive'}" title="${platform}">${icons[platform]}</span>`;
        }).join('');
        
        item.innerHTML = `
            <span class="trending-tag">#${hashtag.tag}</span>
            <div class="trending-platforms">${platformBadges}</div>
        `;
        
        item.title = hashtag.reason;
        
        trendingGrid.appendChild(item);
    });
    
    // Update button text
    if (showMoreTrendingBtn) {
        if (showAllTrending) {
            showMoreTrendingBtn.innerHTML = '<span>Show Less</span><span class="expand-icon">▲</span>';
            showMoreTrendingBtn.classList.add('expanded');
        } else {
            const remaining = filteredHashtags.length - 30;
            showMoreTrendingBtn.innerHTML = `<span>Show All ${filteredHashtags.length} Banned Hashtags</span><span class="expand-icon">▼</span>`;
            showMoreTrendingBtn.classList.remove('expanded');
        }
        
        // Hide button if 30 or fewer items
        showMoreTrendingBtn.style.display = filteredHashtags.length <= 30 ? 'none' : 'inline-flex';
    }
}

function toggleShowAllTrending() {
    showAllTrending = !showAllTrending;
    renderTrendingHashtags();
}

function handleFilterChange(platform) {
    currentFilter = platform;
    showAllTrending = false;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.platform === platform);
    });
    
    renderTrendingHashtags();
}

function updateTrendingDate() {
    if (trendingDateEl) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        trendingDateEl.textContent = today.toLocaleDateString('en-US', options);
    }
}
