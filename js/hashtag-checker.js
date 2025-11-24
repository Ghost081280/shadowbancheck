/* =============================================================================
   HASHTAG CHECKER - Full Functionality
   ============================================================================= */

// Banned Hashtags Database
const BANNED_HASHTAGS = {
    instagram: {
        banned: [
            'adult', 'adulting', 'alone', 'armparty', 'asiangirl', 'ass', 'babe', 'bbc',
            'beautyblogger', 'bikinibody', 'boobs', 'curvy', 'dating', 'desk', 'dm',
            'eggplant', 'elevator', 'fitfam', 'goddess', 'hustler', 'killingit', 'lean',
            'like', 'likeforlike', 'loseweight', 'master', 'models', 'nasty', 'nudity',
            'petite', 'pornfood', 'prettygirl', 'sexy', 'single', 'skateboarding', 'snap',
            'snapchat', 'stranger', 'sunbathing', 'swole', 'tag4like', 'tagsforlikes',
            'teen', 'teens', 'twerking', 'underage', 'valentinesday', 'weed', 'workflow',
            'wtf', 'thought', 'shit', 'instasport', 'iphonegraphy', 'italiano', 'kansas',
            'kissing', 'lingerie', 'brain', 'besties', 'beyonce', 'hardworkpaysoff'
        ],
        restricted: [
            'beautyblogger', 'dating', 'dm', 'followme', 'goddess', 'hotgirl', 'instababe',
            'killingit', 'like4like', 'lingerie', 'loseweight', 'model', 'models', 'ootd',
            'petite', 'sexy', 'single', 'skateboarding', 'skinny', 'snap', 'snapchat',
            'sunbathing', 'swole', 'teen', 'teens', 'thighs', 'thinspiration',
            'todayimwearing', 'underage', 'workflow', 'pushups', 'parties', 'publicrelations'
        ]
    },
    tiktok: {
        banned: [
            'foryou', 'fyp', 'foryoupage', 'viral', 'porn', 'sex', 'nude', 'naked',
            'selfharm', 'suicide', 'cutting', 'anorexia', 'bulimia', 'proed', 'thinspo',
            'depression', 'anxiety', 'die', 'dead', 'kill', 'blood', 'gore', 'drugs',
            'cocaine', 'heroin', 'meth', 'xanax', 'pills'
        ],
        restricted: [
            'fyp', 'foryoupage', 'viral', 'trending', 'xyzbca', 'blowup', 'goviral',
            'makemefamous', 'famous'
        ]
    },
    twitter: {
        banned: [
            'porn', 'nsfw', 'xxx', 'nude', 'naked', 'sex', 'covid', 'vaccine',
            'election', 'fraud', 'stolen', 'rigged'
        ],
        restricted: [
            'maga', 'resist', 'woke', 'cancel', 'boycott'
        ]
    },
    facebook: {
        banned: [
            'porn', 'nude', 'escort', 'hookup', 'dating', 'sex', 'crypto', 'bitcoin',
            'forex', 'mlm', 'pyramid', 'getrichquick'
        ],
        restricted: [
            'mlm', 'workfromhome', 'bossbabe', 'hunlife', 'sidehustle'
        ]
    }
};

// Trending Banned Hashtags (100 hashtags with metadata)
const TRENDING_BANNED = [
    { tag: 'thinspo', platforms: ['instagram', 'tiktok', 'twitter'], reason: 'Promotes eating disorders' },
    { tag: 'proed', platforms: ['instagram', 'tiktok'], reason: 'Pro-eating disorder content' },
    { tag: 'bones', platforms: ['instagram'], reason: 'Associated with eating disorders' },
    { tag: 'starving', platforms: ['instagram', 'tiktok'], reason: 'Eating disorder content' },
    { tag: 'anorexia', platforms: ['instagram', 'tiktok', 'twitter'], reason: 'Mental health safety' },
    { tag: 'bulimia', platforms: ['instagram', 'tiktok'], reason: 'Mental health safety' },
    { tag: 'thinspiration', platforms: ['instagram'], reason: 'Promotes unhealthy body image' },
    { tag: 'skinny', platforms: ['instagram'], reason: 'Body image concerns' },
    { tag: 'selfharm', platforms: ['instagram', 'tiktok', 'twitter'], reason: 'Self-harm content' },
    { tag: 'suicide', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Safety concern' },
    { tag: 'cutting', platforms: ['instagram', 'tiktok'], reason: 'Self-harm content' },
    { tag: 'depression', platforms: ['tiktok'], reason: 'Mental health content restrictions' },
    { tag: 'porn', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Adult content' },
    { tag: 'nsfw', platforms: ['instagram', 'twitter'], reason: 'Not safe for work' },
    { tag: 'nude', platforms: ['instagram', 'tiktok', 'twitter', 'facebook'], reason: 'Nudity' },
    { tag: 'naked', platforms: ['instagram', 'tiktok', 'twitter'], reason: 'Nudity' },
    { tag: 'escort', platforms: ['instagram', 'facebook'], reason: 'Adult services' },
    { tag: 'hookup', platforms: ['instagram', 'facebook'], reason: 'Adult content' },
    { tag: 'milf', platforms: ['instagram'], reason: 'Adult content' },
    { tag: 'onlyfans', platforms: ['instagram', 'tiktok'], reason: 'Adult platform promotion' },
    { tag: 'sexy', platforms: ['instagram'], reason: 'Sexualized content' },
    { tag: 'ass', platforms: ['instagram'], reason: 'Explicit content' },
    { tag: 'boobs', platforms: ['instagram'], reason: 'Explicit content' },
    { tag: 'curvy', platforms: ['instagram'], reason: 'Sexualized content' },
    { tag: 'bikinibody', platforms: ['instagram'], reason: 'Body image/sexualization' },
    { tag: 'lingerie', platforms: ['instagram'], reason: 'Adult content' },
    { tag: 'twerking', platforms: ['instagram'], reason: 'Sexualized content' },
    { tag: 'weed', platforms: ['instagram'], reason: 'Drug content' },
    { tag: 'cannabis', platforms: ['instagram', 'facebook'], reason: 'Drug content' },
    { tag: 'marijuana', platforms: ['instagram', 'facebook'], reason: 'Drug content' },
    { tag: 'mdma', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'cocaine', platforms: ['instagram', 'tiktok'], reason: 'Drug content' },
    { tag: 'pills', platforms: ['tiktok'], reason: 'Drug content' },
    { tag: 'xanax', platforms: ['tiktok'], reason: 'Drug content' },
    { tag: 'lean', platforms: ['instagram'], reason: 'Drug reference' },
    { tag: 'likeforlike', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'followforfollow', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'follow4follow', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'like4like', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'tagsforlikes', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'instalike', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'foryou', platforms: ['tiktok'], reason: 'Spam trigger' },
    { tag: 'fyp', platforms: ['tiktok'], reason: 'Spam trigger' },
    { tag: 'foryoupage', platforms: ['tiktok'], reason: 'Spam trigger' },
    { tag: 'viral', platforms: ['tiktok'], reason: 'Spam trigger' },
    { tag: 'xyzbca', platforms: ['tiktok'], reason: 'Spam trigger' },
    { tag: 'blowup', platforms: ['tiktok'], reason: 'Spam trigger' },
    { tag: 'teen', platforms: ['instagram'], reason: 'Child safety' },
    { tag: 'teens', platforms: ['instagram'], reason: 'Child safety' },
    { tag: 'teenager', platforms: ['instagram'], reason: 'Child safety' },
    { tag: 'underage', platforms: ['instagram'], reason: 'Child safety' },
    { tag: 'preteen', platforms: ['instagram', 'tiktok'], reason: 'Child safety' },
    { tag: 'minor', platforms: ['instagram', 'tiktok'], reason: 'Child safety' },
    { tag: 'crypto', platforms: ['facebook'], reason: 'Financial scam concerns' },
    { tag: 'bitcoin', platforms: ['facebook'], reason: 'Financial scam concerns' },
    { tag: 'forex', platforms: ['facebook'], reason: 'Financial scam concerns' },
    { tag: 'mlm', platforms: ['facebook'], reason: 'Pyramid scheme' },
    { tag: 'pyramid', platforms: ['facebook'], reason: 'Pyramid scheme' },
    { tag: 'getrichquick', platforms: ['facebook'], reason: 'Financial scam' },
    { tag: 'bossbabe', platforms: ['facebook'], reason: 'MLM association' },
    { tag: 'hunlife', platforms: ['facebook'], reason: 'MLM association' },
    { tag: 'sidehustle', platforms: ['facebook'], reason: 'Spam trigger' },
    { tag: 'workfromhome', platforms: ['facebook'], reason: 'Spam trigger' },
    { tag: 'guns', platforms: ['instagram', 'facebook'], reason: 'Weapons content' },
    { tag: 'rifle', platforms: ['instagram'], reason: 'Weapons content' },
    { tag: 'ammo', platforms: ['instagram'], reason: 'Weapons content' },
    { tag: 'ar15', platforms: ['instagram', 'facebook'], reason: 'Weapons content' },
    { tag: 'nazi', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Hate speech' },
    { tag: 'whitepride', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Hate speech' },
    { tag: 'kkk', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Hate speech' },
    { tag: 'isis', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Terrorism' },
    { tag: 'alqaeda', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Terrorism' },
    { tag: 'jihad', platforms: ['instagram', 'twitter', 'facebook'], reason: 'Terrorism' },
    { tag: 'antivax', platforms: ['instagram', 'facebook'], reason: 'Misinformation' },
    { tag: 'plandemic', platforms: ['instagram', 'facebook'], reason: 'Misinformation' },
    { tag: 'fraud', platforms: ['twitter'], reason: 'Election misinformation' },
    { tag: 'rigged', platforms: ['twitter'], reason: 'Election misinformation' },
    { tag: 'adulting', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'alone', platforms: ['instagram'], reason: 'Mental health concern' },
    { tag: 'desk', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'direct', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'eggplant', platforms: ['instagram'], reason: 'Sexual innuendo' },
    { tag: 'elevator', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'hardworkpaysoff', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'hustler', platforms: ['instagram'], reason: 'Adult content association' },
    { tag: 'killingit', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'loseweight', platforms: ['instagram'], reason: 'Body image concerns' },
    { tag: 'master', platforms: ['instagram'], reason: 'Potential exploitation' },
    { tag: 'models', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'nasty', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'prettygirl', platforms: ['instagram'], reason: 'Exploitation concern' },
    { tag: 'single', platforms: ['instagram'], reason: 'Dating spam' },
    { tag: 'singlelife', platforms: ['instagram'], reason: 'Dating spam' },
    { tag: 'stranger', platforms: ['instagram'], reason: 'Safety concern' },
    { tag: 'sunbathing', platforms: ['instagram'], reason: 'Sexualized content' },
    { tag: 'swole', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'valentinesday', platforms: ['instagram'], reason: 'Seasonal spam' },
    { tag: 'workflow', platforms: ['instagram'], reason: 'Spam trigger' },
    { tag: 'dm', platforms: ['instagram'], reason: 'Spam/scam trigger' },
    { tag: 'snapchat', platforms: ['instagram'], reason: 'Cross-platform spam' },
    { tag: 'kik', platforms: ['instagram'], reason: 'Cross-platform spam' },
    { tag: 'whatsapp', platforms: ['instagram'], reason: 'Cross-platform spam' },
    { tag: 'telegram', platforms: ['instagram'], reason: 'Cross-platform spam' }
];

// Platform icons for display
const PLATFORM_ICONS = {
    instagram: '📸',
    tiktok: '🎵',
    twitter: '🐦',
    facebook: '📘'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initHashtagChecker();
    initTrendingHashtags();
    initSearchCounter();
    updateTrendingDate();
});

// Initialize hashtag checker functionality
function initHashtagChecker() {
    const form = document.getElementById('hashtag-form');
    const input = document.getElementById('hashtag-input');
    const countDisplay = document.getElementById('hashtag-count');
    const exampleBtn = document.getElementById('example-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    if (!form || !input) return;
    
    // Update count on input
    input.addEventListener('input', function() {
        const hashtags = parseHashtags(this.value);
        countDisplay.textContent = `${hashtags.length} hashtag${hashtags.length !== 1 ? 's' : ''} detected`;
    });
    
    // Load examples
    if (exampleBtn) {
        exampleBtn.addEventListener('click', function() {
            input.value = '#fitness #motivation #gains #workout #fitfam #love #instagood #photooftheday #fashion #beautiful #happy #cute #tbt #like4like #followme #picoftheday #selfie #summer #art #instadaily';
            input.dispatchEvent(new Event('input'));
        });
    }
    
    // Clear
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            input.value = '';
            input.dispatchEvent(new Event('input'));
            document.getElementById('results-section').style.display = 'none';
        });
    }
    
    // Form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const hashtags = parseHashtags(input.value);
        
        if (hashtags.length === 0) {
            alert('Please enter at least one hashtag to check.');
            return;
        }
        
        // Check search limit
        if (!decrementHashtagSearch()) {
            alert('You\'ve used all your free hashtag checks for today!\n\nUpgrade to Shadow AI Pro for unlimited checks.');
            return;
        }
        
        analyzeHashtags(hashtags);
    });
}

// Parse hashtags from text
function parseHashtags(text) {
    const matches = text.match(/#?\w+/g) || [];
    return matches
        .map(tag => tag.replace(/^#/, '').toLowerCase())
        .filter(tag => tag.length > 0);
}

// Analyze hashtags
function analyzeHashtags(hashtags) {
    const btn = document.getElementById('check-hashtags-btn');
    btn.classList.add('loading');
    
    // Simulate API delay
    setTimeout(() => {
        const results = hashtags.map(tag => checkHashtag(tag));
        displayResults(results);
        btn.classList.remove('loading');
    }, 1500);
}

// Check single hashtag
function checkHashtag(tag) {
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
    
    // Check each platform
    for (const platform of ['instagram', 'tiktok', 'twitter', 'facebook']) {
        const data = BANNED_HASHTAGS[platform];
        
        if (data.banned.includes(tag)) {
            result.platforms[platform] = 'banned';
            result.status = 'banned';
        } else if (data.restricted.includes(tag)) {
            result.platforms[platform] = 'restricted';
            if (result.status !== 'banned') {
                result.status = 'restricted';
            }
        }
    }
    
    // Get reason from trending list
    const trending = TRENDING_BANNED.find(t => t.tag === tag);
    if (trending) {
        result.reason = trending.reason;
    }
    
    return result;
}

// Display results
function displayResults(results) {
    const section = document.getElementById('results-section');
    const content = document.getElementById('results-content');
    
    const safe = results.filter(r => r.status === 'safe');
    const banned = results.filter(r => r.status === 'banned');
    const restricted = results.filter(r => r.status === 'restricted');
    
    let html = `
        <div class="results-summary">
            <span class="stat-pill safe">✓ ${safe.length} Safe</span>
            <span class="stat-pill banned">✕ ${banned.length} Banned</span>
            <span class="stat-pill warning">⚠ ${restricted.length} Restricted</span>
        </div>
        <div class="results-grid">
    `;
    
    // Show banned first, then restricted, then safe
    [...banned, ...restricted, ...safe].forEach(r => {
        const statusIcon = r.status === 'safe' ? '✓' : r.status === 'banned' ? '✕' : '⚠';
        const platformIcons = Object.entries(r.platforms)
            .filter(([_, status]) => status !== 'safe')
            .map(([platform, _]) => PLATFORM_ICONS[platform])
            .join('');
        
        html += `
            <div class="result-tag ${r.status}" title="${r.reason || 'No issues detected'}">
                <span class="status-icon">${statusIcon}</span>
                <span class="tag-name">#${r.tag}</span>
                ${platformIcons ? `<span class="platforms">${platformIcons}</span>` : ''}
            </div>
        `;
    });
    
    html += `</div>`;
    
    // Action buttons
    html += `
        <div class="results-actions">
            <button class="btn-action" onclick="copySafeHashtags()">📋 Copy Safe Only</button>
            <button class="btn-action" onclick="exportResults()">📥 Export Results</button>
            <button class="btn-action" onclick="checkAgain()">🔄 New Check</button>
        </div>
    `;
    
    // CTA if issues found
    if (banned.length > 0 || restricted.length > 0) {
        html += `
            <div class="result-cta" style="margin-top: var(--space-lg);">
                <h4>🚨 Issues Detected!</h4>
                <p>Get AI-powered suggestions for safe alternative hashtags with Shadow AI Pro</p>
                <a href="index.html#shadow-ai-pro" class="btn btn-large">Get Shadow AI Pro →</a>
            </div>
        `;
    }
    
    content.innerHTML = html;
    section.style.display = 'block';
    
    // Store for export
    window.lastResults = results;
}

// Copy safe hashtags
function copySafeHashtags() {
    const safe = (window.lastResults || [])
        .filter(r => r.status === 'safe')
        .map(r => '#' + r.tag)
        .join(' ');
    
    if (safe) {
        navigator.clipboard.writeText(safe).then(() => {
            alert('Safe hashtags copied to clipboard!');
        });
    } else {
        alert('No safe hashtags to copy.');
    }
}

// Export results
function exportResults() {
    const results = window.lastResults || [];
    if (results.length === 0) return;
    
    let text = 'HASHTAG ANALYSIS RESULTS\n';
    text += '========================\n';
    text += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    const safe = results.filter(r => r.status === 'safe');
    const banned = results.filter(r => r.status === 'banned');
    const restricted = results.filter(r => r.status === 'restricted');
    
    text += `SAFE (${safe.length}):\n`;
    safe.forEach(r => text += `  #${r.tag}\n`);
    
    text += `\nBANNED (${banned.length}):\n`;
    banned.forEach(r => text += `  #${r.tag} - ${r.reason || 'Unknown reason'}\n`);
    
    text += `\nRESTRICTED (${restricted.length}):\n`;
    restricted.forEach(r => text += `  #${r.tag} - ${r.reason || 'Limited reach'}\n`);
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hashtag-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Check again
function checkAgain() {
    document.getElementById('hashtag-input').value = '';
    document.getElementById('hashtag-input').dispatchEvent(new Event('input'));
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('hashtag-input').focus();
}

// Initialize trending hashtags
function initTrendingHashtags() {
    const grid = document.getElementById('trending-grid');
    const showMoreBtn = document.getElementById('show-more-trending');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    if (!grid) return;
    
    let showAll = false;
    let currentFilter = 'all';
    
    function renderTags() {
        let filtered = TRENDING_BANNED;
        
        if (currentFilter !== 'all') {
            filtered = TRENDING_BANNED.filter(t => t.platforms.includes(currentFilter));
        }
        
        const toShow = showAll ? filtered : filtered.slice(0, 30);
        
        grid.innerHTML = toShow.map(t => {
            const icons = t.platforms.map(p => PLATFORM_ICONS[p]).join('');
            return `
                <span class="trending-tag" title="${t.reason}">
                    #${t.tag}
                    <span class="tag-platforms">${icons}</span>
                </span>
            `;
        }).join('');
        
        if (showMoreBtn) {
            showMoreBtn.textContent = showAll ? 'Show Less ' : `Show All ${filtered.length} `;
            showMoreBtn.innerHTML += '<span class="arrow">▼</span>';
            showMoreBtn.classList.toggle('expanded', showAll);
        }
    }
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.platform;
            showAll = false;
            renderTags();
        });
    });
    
    // Show more button
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function() {
            showAll = !showAll;
            renderTags();
        });
    }
    
    renderTags();
}

// Update trending date
function updateTrendingDate() {
    const dateEl = document.getElementById('trending-date');
    if (dateEl) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

// Search counter management
function initSearchCounter() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('shadowban_hashtag_last_reset');
    
    if (lastReset !== today) {
        localStorage.setItem('shadowban_hashtag_searches', '5');
        localStorage.setItem('shadowban_hashtag_last_reset', today);
    }
    
    updateSearchDisplay();
}

function updateSearchDisplay() {
    const remaining = parseInt(localStorage.getItem('shadowban_hashtag_searches') || '5');
    
    const heroDisplay = document.getElementById('hashtag-searches-remaining');
    const moduleDisplay = document.getElementById('searches-display');
    
    if (heroDisplay) {
        heroDisplay.textContent = `${remaining} / 5`;
        heroDisplay.style.color = remaining === 0 ? '#ef4444' : '';
    }
    
    if (moduleDisplay) {
        moduleDisplay.textContent = `${remaining} / 5 checks available today`;
        moduleDisplay.style.color = remaining === 0 ? '#ef4444' : '';
    }
}

function decrementHashtagSearch() {
    const remaining = parseInt(localStorage.getItem('shadowban_hashtag_searches') || '5');
    
    if (remaining <= 0) {
        return false;
    }
    
    localStorage.setItem('shadowban_hashtag_searches', String(remaining - 1));
    updateSearchDisplay();
    return true;
}
