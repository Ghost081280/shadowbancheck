// =============================================================================
// HASHTAG CHECKER - FULL FUNCTIONALITY
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initHashtagChecker();
    initTrendingHashtags();
    initSearchCounter();
    updateTrendingDate();
});

// =============================================================================
// BANNED HASHTAGS DATABASE
// =============================================================================
const BANNED_HASHTAGS = {
    // Completely banned on multiple platforms
    banned: {
        instagram: ['adult', 'adulting', 'alone', 'armparty', 'asiangirl', 'ass', 'assday', 'attractivegirl', 'babe', 'bbc', 'beautyblogger', 'besties', 'bikinibody', 'boho', 'boobs', 'brain', 'costumes', 'curvy', 'date', 'dating', 'desk', 'direct', 'dm', 'dogsofinstagram', 'eggplant', 'elevator', 'fishnets', 'fitfam', 'girlsonly', 'gloves', 'goddess', 'graffitiigers', 'happythanksgiving', 'hardworkpaysoff', 'hawks', 'hotweather', 'hustler', 'ig', 'instababy', 'instamood', 'iphone', 'italiano', 'kansas', 'kickoff', 'killingit', 'kissing', 'lean', 'like', 'likeforlike', 'likes', 'loseweight', 'master', 'mileycyrus', 'models', 'mustfollow', 'nasty', 'newyearsday', 'nudity', 'overnight', 'petite', 'pornfood', 'prettygirl', 'pushups', 'rate', 'saltwater', 'selfharm', 'sexy', 'single', 'singlelife', 'skateboarding', 'skype', 'snap', 'snapchat', 'snowstorm', 'sopretty', 'stranger', 'streetphoto', 'stud', 'sunbathing', 'swole', 'tag4like', 'tagsforlikes', 'teen', 'teens', 'thought', 'todayimwearing', 'twerking', 'underage', 'valentinesday', 'weed', 'workflow', 'wtf'],
        tiktok: ['foryou', 'fyp', 'foryoupage', 'viral', 'porn', 'sex', 'nude', 'naked', 'selfharm', 'suicide', 'cutting', 'anorexia', 'bulimia', 'proed', 'thinspo', 'depression', 'anxiety', 'die', 'dead', 'kill'],
        twitter: ['porn', 'nsfw', 'xxx', 'nude', 'naked', 'sex', 'covid', 'vaccine', 'election', 'fraud', 'stolen', 'rigged'],
        facebook: ['porn', 'nude', 'escort', 'hookup', 'dating', 'sex', 'crypto', 'bitcoin', 'forex', 'mlm', 'pyramid', 'getrichquick']
    },
    
    // Restricted/suppressed but not fully banned
    restricted: {
        instagram: ['beautyblogger', 'dating', 'dm', 'followme', 'goddess', 'hotgirl', 'instababe', 'killingit', 'like4like', 'likeforfollow', 'lingerie', 'loseweight', 'model', 'models', 'mustfollow', 'ootd', 'petite', 'popular', 'sexy', 'single', 'skateboarding', 'skinny', 'snap', 'snapchat', 'sunbathing', 'swole', 'teen', 'teens', 'thighs', 'thinspiration', 'todayimwearing', 'underage', 'workflow'],
        tiktok: ['fyp', 'foryoupage', 'viral', 'trending', 'xyzbca', 'blowup', 'goviral', 'makemefamous', 'famous'],
        twitter: ['maga', 'resist', 'woke', 'cancel', 'boycott'],
        facebook: ['mlm', 'workfromhome', 'bossbabe', 'hunlife', 'sidehustle']
    }
};

// Trending banned hashtags with metadata
const TRENDING_BANNED = [
    { tag: 'thinspo', platforms: ['instagram', 'tiktok'], reason: 'Promotes eating disorders' },
    { tag: 'proed', platforms: ['instagram', 'tiktok'], reason: 'Pro-eating disorder content' },
    { tag: 'selfharm', platforms: ['instagram', 'tiktok', 'twitter'], reason: 'Self-harm promotion' },
    { tag: 'suicide', platforms: ['instagram', 'tiktok', 'twitter'], reason: 'Suicide-related content' },
    { tag: 'porn', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Adult content' },
    { tag: 'nsfw', platforms: ['instagram', 'tiktok', 'twitter'], reason: 'Adult content' },
    { tag: 'nude', platforms: ['instagram', 'tiktok', 'facebook'], reason: 'Nudity' },
    { tag: 'escort', platforms: ['instagram', 'facebook'], reason: 'Solicitation' },
    { tag: 'hookup', platforms: ['instagram', 'facebook'], reason: 'Dating solicitation' },
    { tag: 'likeforlike', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'followforfollow', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'follow4follow', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'like4like', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'tagsforlikes', platforms: ['instagram'], reason: 'Spam behavior' },
    { tag: 'instalike', platforms: ['instagram'], reason: 'Spam behavior' },
    { tag: 'weed', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'cannabis', platforms: ['instagram', 'facebook'], reason: 'Drug content' },
    { tag: 'marijuana', platforms: ['instagram', 'facebook'], reason: 'Drug content' },
    { tag: 'mdma', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'cocaine', platforms: ['instagram', 'tiktok', 'twitter'], reason: 'Drug content' },
    { tag: 'pills', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'xanax', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'percocet', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'lean', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'fitfam', platforms: ['instagram'], reason: 'Spam/engagement bait' },
    { tag: 'sexy', platforms: ['instagram'], reason: 'Adult content' },
    { tag: 'ass', platforms: ['instagram'], reason: 'Adult content' },
    { tag: 'boobs', platforms: ['instagram'], reason: 'Adult content' },
    { tag: 'curvy', platforms: ['instagram'], reason: 'Sexualized content' },
    { tag: 'bikinibody', platforms: ['instagram'], reason: 'Body image issues' },
    { tag: 'skinny', platforms: ['instagram', 'tiktok'], reason: 'Body image issues' },
    { tag: 'anorexia', platforms: ['instagram', 'tiktok'], reason: 'Eating disorder' },
    { tag: 'bulimia', platforms: ['instagram', 'tiktok'], reason: 'Eating disorder' },
    { tag: 'bones', platforms: ['instagram', 'tiktok'], reason: 'Pro-ED content' },
    { tag: 'starving', platforms: ['instagram', 'tiktok'], reason: 'Pro-ED content' },
    { tag: 'teen', platforms: ['instagram'], reason: 'Child safety' },
    { tag: 'teens', platforms: ['instagram'], reason: 'Child safety' },
    { tag: 'teenager', platforms: ['instagram'], reason: 'Child safety' },
    { tag: 'underage', platforms: ['instagram', 'tiktok'], reason: 'Child safety' },
    { tag: 'preteen', platforms: ['instagram'], reason: 'Child safety' },
    { tag: 'minor', platforms: ['instagram'], reason: 'Child safety' },
    { tag: 'crypto', platforms: ['facebook'], reason: 'Scam prevention' },
    { tag: 'bitcoin', platforms: ['facebook'], reason: 'Scam prevention' },
    { tag: 'forex', platforms: ['facebook'], reason: 'Scam prevention' },
    { tag: 'mlm', platforms: ['facebook'], reason: 'Pyramid scheme' },
    { tag: 'pyramid', platforms: ['facebook'], reason: 'Pyramid scheme' },
    { tag: 'getrichquick', platforms: ['facebook', 'instagram'], reason: 'Scam prevention' },
    { tag: 'fraud', platforms: ['twitter'], reason: 'Misinformation' },
    { tag: 'rigged', platforms: ['twitter'], reason: 'Election misinformation' },
    { tag: 'stolen', platforms: ['twitter'], reason: 'Election misinformation' },
    { tag: 'guns', platforms: ['instagram'], reason: 'Weapons' },
    { tag: 'rifle', platforms: ['instagram'], reason: 'Weapons' },
    { tag: 'ammo', platforms: ['instagram'], reason: 'Weapons' },
    { tag: 'ar15', platforms: ['instagram'], reason: 'Weapons' },
    { tag: 'nazi', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Hate speech' },
    { tag: 'whitepride', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Hate speech' },
    { tag: 'kkk', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Hate speech' },
    { tag: 'isis', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Terrorism' },
    { tag: 'alqaeda', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Terrorism' },
    { tag: 'jihad', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Terrorism' },
    { tag: 'antivax', platforms: ['instagram', 'facebook'], reason: 'Misinformation' },
    { tag: 'plandemic', platforms: ['instagram', 'facebook', 'twitter'], reason: 'Misinformation' },
    { tag: 'milf', platforms: ['instagram'], reason: 'Adult content' },
    { tag: 'dilf', platforms: ['instagram'], reason: 'Adult content' },
    { tag: 'onlyfans', platforms: ['instagram', 'tiktok'], reason: 'Adult content promotion' },
    { tag: 'linkinbio', platforms: ['instagram'], reason: 'Spam behavior' },
    { tag: 'dm', platforms: ['instagram'], reason: 'Spam/scam behavior' },
    { tag: 'snapchat', platforms: ['instagram'], reason: 'Cross-platform spam' },
    { tag: 'kik', platforms: ['instagram'], reason: 'Cross-platform spam' },
    { tag: 'whatsapp', platforms: ['instagram'], reason: 'Cross-platform spam' },
    { tag: 'telegram', platforms: ['instagram'], reason: 'Cross-platform spam' },
    { tag: 'foryou', platforms: ['tiktok'], reason: 'Engagement manipulation' },
    { tag: 'fyp', platforms: ['tiktok'], reason: 'Engagement manipulation' },
    { tag: 'foryoupage', platforms: ['tiktok'], reason: 'Engagement manipulation' },
    { tag: 'viral', platforms: ['tiktok'], reason: 'Engagement manipulation' },
    { tag: 'xyzbca', platforms: ['tiktok'], reason: 'Engagement manipulation' },
    { tag: 'blowup', platforms: ['tiktok'], reason: 'Engagement manipulation' },
    { tag: 'goviral', platforms: ['tiktok'], reason: 'Engagement manipulation' },
    { tag: 'adulting', platforms: ['instagram'], reason: 'Shadowban trigger' },
    { tag: 'alone', platforms: ['instagram'], reason: 'Mental health' },
    { tag: 'beautyblogger', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'desk', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'direct', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'eggplant', platforms: ['instagram'], reason: 'Sexual innuendo' },
    { tag: 'elevator', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'hardworkpaysoff', platforms: ['instagram'], reason: 'MLM spam' },
    { tag: 'hustler', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'killingit', platforms: ['instagram'], reason: 'Violent language' },
    { tag: 'loseweight', platforms: ['instagram'], reason: 'Body image' },
    { tag: 'master', platforms: ['instagram'], reason: 'Sensitive term' },
    { tag: 'models', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'nasty', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'prettygirl', platforms: ['instagram'], reason: 'Exploitation risk' },
    { tag: 'single', platforms: ['instagram'], reason: 'Dating spam' },
    { tag: 'singlelife', platforms: ['instagram'], reason: 'Dating spam' },
    { tag: 'stranger', platforms: ['instagram'], reason: 'Safety concern' },
    { tag: 'sunbathing', platforms: ['instagram'], reason: 'Nudity risk' },
    { tag: 'swole', platforms: ['instagram'], reason: 'Steroid association' },
    { tag: 'twerking', platforms: ['instagram'], reason: 'Sexual content' },
    { tag: 'valentinesday', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'workflow', platforms: ['instagram'], reason: 'MLM spam' }
];

// =============================================================================
// HASHTAG CHECKER FUNCTIONALITY
// =============================================================================
function initHashtagChecker() {
    const form = document.getElementById('hashtag-form');
    const input = document.getElementById('hashtag-input');
    const countDisplay = document.getElementById('hashtag-count');
    const exampleBtn = document.getElementById('example-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    if (!form || !input) return;
    
    // Update hashtag count on input
    input.addEventListener('input', () => {
        const hashtags = parseHashtags(input.value);
        countDisplay.textContent = `${hashtags.length} hashtag${hashtags.length !== 1 ? 's' : ''} detected`;
    });
    
    // Load examples
    exampleBtn?.addEventListener('click', () => {
        input.value = '#fitness #motivation #gains #workout #fitfam #love #instagood #photooftheday #beautiful #happy #cute #tbt #like4like #followme #picoftheday #follow #selfie #summer #art #instadaily';
        input.dispatchEvent(new Event('input'));
    });
    
    // Clear
    clearBtn?.addEventListener('click', () => {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        document.getElementById('results-section').style.display = 'none';
    });
    
    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const hashtags = parseHashtags(input.value);
        
        if (hashtags.length === 0) {
            alert('Please enter at least one hashtag');
            return;
        }
        
        if (!decrementHashtagSearch()) {
            if (confirm('You\'ve used all your free hashtag checks today. Would you like to get more?')) {
                window.location.href = 'index.html#pricing';
            }
            return;
        }
        
        analyzeHashtags(hashtags);
    });
}

function parseHashtags(text) {
    // Match hashtags or words, clean them up
    const matches = text.match(/#?\w+/g) || [];
    return matches.map(tag => tag.replace(/^#/, '').toLowerCase()).filter(tag => tag.length > 0);
}

function analyzeHashtags(hashtags) {
    const btn = document.getElementById('check-hashtags-btn');
    btn.classList.add('loading');
    btn.disabled = true;
    
    setTimeout(() => {
        const results = hashtags.map(tag => checkHashtag(tag));
        displayResults(results);
        
        btn.classList.remove('loading');
        btn.disabled = false;
    }, 1500);
}

function checkHashtag(tag) {
    const lowerTag = tag.toLowerCase();
    const result = {
        tag: tag,
        status: 'safe',
        platforms: {
            instagram: 'safe',
            tiktok: 'safe',
            twitter: 'safe',
            facebook: 'safe'
        },
        reason: null
    };
    
    // Check banned
    Object.entries(BANNED_HASHTAGS.banned).forEach(([platform, tags]) => {
        if (tags.includes(lowerTag)) {
            result.platforms[platform] = 'banned';
            result.status = 'banned';
        }
    });
    
    // Check restricted
    Object.entries(BANNED_HASHTAGS.restricted).forEach(([platform, tags]) => {
        if (tags.includes(lowerTag) && result.platforms[platform] === 'safe') {
            result.platforms[platform] = 'restricted';
            if (result.status === 'safe') result.status = 'restricted';
        }
    });
    
    // Check trending banned
    const trending = TRENDING_BANNED.find(t => t.tag === lowerTag);
    if (trending) {
        result.reason = trending.reason;
        trending.platforms.forEach(platform => {
            if (result.platforms[platform] === 'safe') {
                result.platforms[platform] = 'banned';
                result.status = 'banned';
            }
        });
    }
    
    return result;
}

function displayResults(results) {
    const section = document.getElementById('results-section');
    const content = document.getElementById('results-content');
    
    const safe = results.filter(r => r.status === 'safe');
    const banned = results.filter(r => r.status === 'banned');
    const restricted = results.filter(r => r.status === 'restricted');
    
    content.innerHTML = `
        <div class="results-summary">
            <span class="stat-pill safe">${safe.length} Safe</span>
            <span class="stat-pill banned">${banned.length} Banned</span>
            <span class="stat-pill warning">${restricted.length} Restricted</span>
        </div>
        
        <div class="results-grid">
            ${results.map(r => `
                <div class="result-tag ${r.status}">
                    <span class="status-icon">${r.status === 'safe' ? '✅' : r.status === 'banned' ? '🚫' : '⚠️'}</span>
                    <span class="tag-name">#${r.tag}</span>
                    <span class="platforms">
                        <span title="Instagram" ${r.platforms.instagram !== 'safe' ? 'style="opacity:1"' : ''}>📸</span>
                        <span title="TikTok" ${r.platforms.tiktok !== 'safe' ? 'style="opacity:1"' : ''}>🎵</span>
                        <span title="Twitter" ${r.platforms.twitter !== 'safe' ? 'style="opacity:1"' : ''}>🐦</span>
                        <span title="Facebook" ${r.platforms.facebook !== 'safe' ? 'style="opacity:1"' : ''}>📘</span>
                    </span>
                </div>
            `).join('')}
        </div>
        
        <div class="results-actions">
            <button class="btn-action" onclick="copySafeHashtags()">📋 Copy Safe</button>
            <button class="btn-action" onclick="exportResults()">📥 Export</button>
            <button class="btn-action" onclick="checkAgain()">🔄 New Check</button>
        </div>
        
        ${banned.length > 0 ? `
            <div class="result-cta" style="margin-top: var(--space-lg);">
                <h4>⚠️ Found ${banned.length} Banned Hashtag${banned.length !== 1 ? 's' : ''}!</h4>
                <p>Remove these before posting to avoid shadow bans. Get Shadow AI Pro for alternative hashtag suggestions.</p>
                <a href="index.html#shadow-ai-pro" class="btn" style="margin-top: var(--space-md);">Get AI Suggestions →</a>
            </div>
        ` : ''}
    `;
    
    section.style.display = 'block';
    
    // Store results for export
    window.lastResults = results;
    
    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Global functions for buttons
window.copySafeHashtags = function() {
    if (!window.lastResults) return;
    const safe = window.lastResults.filter(r => r.status === 'safe').map(r => '#' + r.tag).join(' ');
    navigator.clipboard.writeText(safe).then(() => {
        alert('Safe hashtags copied to clipboard!');
    });
};

window.exportResults = function() {
    if (!window.lastResults) return;
    
    const lines = ['HASHTAG ANALYSIS RESULTS', 'Generated by ShadowBanCheck.io', '', ''];
    
    ['safe', 'banned', 'restricted'].forEach(status => {
        const filtered = window.lastResults.filter(r => r.status === status);
        if (filtered.length > 0) {
            lines.push(`=== ${status.toUpperCase()} (${filtered.length}) ===`);
            filtered.forEach(r => {
                const platforms = Object.entries(r.platforms)
                    .filter(([_, v]) => v !== 'safe')
                    .map(([k]) => k)
                    .join(', ');
                lines.push(`#${r.tag}${platforms ? ` - ${platforms}` : ''}`);
            });
            lines.push('');
        }
    });
    
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hashtag-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
};

window.checkAgain = function() {
    document.getElementById('hashtag-input').value = '';
    document.getElementById('hashtag-input').dispatchEvent(new Event('input'));
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('hashtag-input').focus();
};

// =============================================================================
// TRENDING HASHTAGS
// =============================================================================
function initTrendingHashtags() {
    const grid = document.getElementById('trending-grid');
    const showMoreBtn = document.getElementById('show-more-trending');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    if (!grid) return;
    
    let showAll = false;
    let currentFilter = 'all';
    
    function renderTags() {
        const filtered = currentFilter === 'all' 
            ? TRENDING_BANNED 
            : TRENDING_BANNED.filter(t => t.platforms.includes(currentFilter));
        
        const toShow = showAll ? filtered : filtered.slice(0, 30);
        
        grid.innerHTML = toShow.map(t => `
            <span class="trending-tag" title="${t.reason}">
                #${t.tag}
                <span class="tag-platforms">
                    ${t.platforms.includes('instagram') ? '📸' : ''}
                    ${t.platforms.includes('tiktok') ? '🎵' : ''}
                    ${t.platforms.includes('twitter') ? '🐦' : ''}
                    ${t.platforms.includes('facebook') ? '📘' : ''}
                </span>
            </span>
        `).join('');
        
        if (showMoreBtn) {
            showMoreBtn.innerHTML = showAll 
                ? 'Show Less <span class="arrow">▲</span>' 
                : `Show All ${filtered.length} <span class="arrow">▼</span>`;
            showMoreBtn.classList.toggle('expanded', showAll);
        }
    }
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.platform;
            showAll = false;
            renderTags();
        });
    });
    
    // Show more button
    showMoreBtn?.addEventListener('click', () => {
        showAll = !showAll;
        renderTags();
    });
    
    // Initial render
    renderTags();
}

function updateTrendingDate() {
    const dateEl = document.getElementById('trending-date');
    if (dateEl) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = today.toLocaleDateString('en-US', options);
    }
}

// =============================================================================
// SEARCH COUNTER
// =============================================================================
const MAX_HASHTAG_SEARCHES = 5;
const HASHTAG_STORAGE_KEY = 'shadowban_hashtag_searches_remaining';
const DATE_KEY = 'shadowban_last_reset_date';

function initSearchCounter() {
    const today = new Date().toDateString();
    const lastResetDate = localStorage.getItem(DATE_KEY);
    
    if (lastResetDate !== today) {
        localStorage.setItem(HASHTAG_STORAGE_KEY, MAX_HASHTAG_SEARCHES.toString());
        localStorage.setItem(DATE_KEY, today);
    }
    
    updateCounterDisplay();
}

function updateCounterDisplay() {
    const el = document.getElementById('hashtag-searches-remaining');
    if (!el) return;
    
    const remaining = parseInt(localStorage.getItem(HASHTAG_STORAGE_KEY) || MAX_HASHTAG_SEARCHES);
    
    if (remaining === 0) {
        el.innerHTML = `<span style="color: #ef4444;">0 / ${MAX_HASHTAG_SEARCHES}</span>`;
    } else {
        el.textContent = `${remaining} / ${MAX_HASHTAG_SEARCHES}`;
    }
}

function decrementHashtagSearch() {
    const remaining = parseInt(localStorage.getItem(HASHTAG_STORAGE_KEY) || MAX_HASHTAG_SEARCHES);
    
    if (remaining > 0) {
        localStorage.setItem(HASHTAG_STORAGE_KEY, (remaining - 1).toString());
        updateCounterDisplay();
        return true;
    }
    
    return false;
}
