/**
 * Hashtag Checker JavaScript
 * ShadowBanCheck.io
 */

// Banned Hashtags Database (sample - 100 hashtags)
const BANNED_HASHTAGS = {
    instagram: {
        banned: [
            'adulting', 'alone', 'attractive', 'beautyblogger', 'besties', 'bikinibody',
            'brain', 'costumes', 'curvy', 'date', 'dating', 'desk', 'direct', 'dm',
            'easter', 'eggplant', 'elevator', 'goddess', 'graffiti', 'hardworkpaysoff',
            'humpday', 'hustler', 'ice', 'instababy', 'instamood', 'iphone', 'italiano',
            'kansas', 'killingit', 'kissing', 'lean', 'like', 'loseweight', 'master',
            'models', 'mustfollow', 'nasty', 'newyears', 'nudity', 'parties', 'petite',
            'photography', 'popular', 'pornfood', 'prettygirl', 'pushups', 'rate',
            'saltwater', 'selfharm', 'single', 'singlelife', 'skateboarding', 'snap',
            'snapchat', 'snowstorm', 'sopretty', 'stranger', 'streetphoto', 'stud',
            'sunbathing', 'swole', 'tag4like', 'tagsforlikes', 'teen', 'teens', 'thought',
            'todayimwearing', 'twerk', 'underage', 'valentinesday', 'workflow', 'wtf'
        ],
        restricted: [
            'ass', 'assday', 'boho', 'bodypositive', 'booty', 'bootyday', 'curves',
            'fitgirl', 'fitnessmodel', 'followme', 'glutes', 'goals', 'gym', 'hot',
            'instadaily', 'instalike', 'likeforlike', 'likeback', 'sexy', 'thick',
            'thickthighs', 'thinspiration', 'weightloss', 'l4l', 'f4f', 'follow4follow'
        ]
    },
    tiktok: {
        banned: [
            'coronavirus', 'covid', 'pandemic', 'vaccine', 'deadlychallenge', 'blackoutchallenge',
            'milkcratechallenge', 'nyquilchicken', 'tidepodchallenge', 'cinnamon', 'pro-ana',
            'thinspo', 'proana', 'promia', 'suicidal', 'selfharm', 'cutting', 'sh',
            'edtwt', 'anorexia', 'bulimia', 'restrict', 'purge', 'overdose', 'rope',
            'pills', 'hanging', 'asphyxiation', 'choking', 'gore', 'violence', 'murder',
            'shooting', 'terrorism', 'isis', 'fentanyl', 'meth', 'heroin', 'cocaine'
        ],
        restricted: [
            'fyp', 'foryou', 'foryoupage', 'viral', 'blowthisup', 'trending', 'famous',
            'duet', 'stitch', 'live', 'wap', 'adult', 'spicy', 'accountant', '304',
            'corn', 'unalive', 'seggs', 'grippy', 'spicyaccountant', 'le dollar bean'
        ]
    },
    twitter: {
        banned: [
            'nazi', 'whitesupremacy', 'whitepower', 'killall', 'deathto', 'terrorism',
            'isis', 'alqaeda', 'massacre', 'genocide', 'childporn', 'pedophile', 'csam',
            'grooming', 'trafficking', 'slavery', 'doxxing', 'swatting', 'harassment',
            'brigading', 'hacking', 'ddos', 'malware', 'phishing', 'scam', 'pyramid'
        ],
        restricted: [
            'shadowban', 'censored', 'banned', 'suppressed', 'hidden', 'silenced',
            'nsfw', 'adult', 'xxx', 'onlyfans', 'lewd', 'explicit', 'gore', 'blood'
        ]
    },
    facebook: {
        banned: [
            'drugs', 'weapons', 'firearms', 'ammunition', 'explosives', 'trafficking',
            'smuggling', 'illegal', 'contraband', 'blackmarket', 'darkweb', 'hacking',
            'violence', 'terrorism', 'hate', 'discrimination', 'harassment', 'bullying',
            'suicide', 'selfharm', 'eating disorder', 'childabuse', 'exploitation'
        ],
        restricted: [
            'crypto', 'bitcoin', 'investment', 'forex', 'mlm', 'getrichquick', 'passive income',
            'workfromhome', 'sidehustle', 'dropshipping', 'affiliate', 'cbd', 'thc', 'vape'
        ]
    }
};

// Trending Banned Hashtags (100 items)
const TRENDING_BANNED = [
    { tag: 'adulting', platforms: ['instagram'], reason: 'Associated with spam' },
    { tag: 'alone', platforms: ['instagram'], reason: 'Mental health concerns' },
    { tag: 'beautyblogger', platforms: ['instagram'], reason: 'Spam/bot activity' },
    { tag: 'bikinibody', platforms: ['instagram'], reason: 'Body image concerns' },
    { tag: 'curvy', platforms: ['instagram'], reason: 'Misuse/inappropriate content' },
    { tag: 'eggplant', platforms: ['instagram'], reason: 'Inappropriate use' },
    { tag: 'goddess', platforms: ['instagram'], reason: 'Spam association' },
    { tag: 'humpday', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'instamood', platforms: ['instagram'], reason: 'Bot activity' },
    { tag: 'killingit', platforms: ['instagram'], reason: 'Violence keywords' },
    { tag: 'lean', platforms: ['instagram'], reason: 'Drug references' },
    { tag: 'master', platforms: ['instagram'], reason: 'Inappropriate use' },
    { tag: 'mustfollow', platforms: ['instagram'], reason: 'Spam/engagement bait' },
    { tag: 'nasty', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'petite', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'popular', platforms: ['instagram'], reason: 'Engagement bait' },
    { tag: 'single', platforms: ['instagram'], reason: 'Dating spam' },
    { tag: 'snap', platforms: ['instagram'], reason: 'Cross-platform promotion' },
    { tag: 'sopretty', platforms: ['instagram'], reason: 'Spam association' },
    { tag: 'sunbathing', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'swole', platforms: ['instagram'], reason: 'Steroid association' },
    { tag: 'tag4like', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'teen', platforms: ['instagram'], reason: 'Safety concerns' },
    { tag: 'twerk', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'wtf', platforms: ['instagram'], reason: 'Profanity' },
    { tag: 'likeforlike', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'follow4follow', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'l4l', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'f4f', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'followback', platforms: ['instagram'], reason: 'Engagement manipulation' },
    { tag: 'deadlychallenge', platforms: ['tiktok'], reason: 'Dangerous content' },
    { tag: 'blackoutchallenge', platforms: ['tiktok'], reason: 'Life-threatening' },
    { tag: 'milkcratechallenge', platforms: ['tiktok'], reason: 'Dangerous activity' },
    { tag: 'nyquilchicken', platforms: ['tiktok'], reason: 'Dangerous activity' },
    { tag: 'tidepodchallenge', platforms: ['tiktok'], reason: 'Dangerous activity' },
    { tag: 'proana', platforms: ['tiktok', 'instagram'], reason: 'Eating disorders' },
    { tag: 'thinspo', platforms: ['tiktok', 'instagram'], reason: 'Eating disorders' },
    { tag: 'promia', platforms: ['tiktok'], reason: 'Eating disorders' },
    { tag: 'edtwt', platforms: ['tiktok', 'twitter'], reason: 'Eating disorders' },
    { tag: 'selfharm', platforms: ['tiktok', 'instagram'], reason: 'Self-harm content' },
    { tag: 'sh', platforms: ['tiktok'], reason: 'Self-harm code' },
    { tag: 'unalive', platforms: ['tiktok'], reason: 'Suicide reference' },
    { tag: 'seggs', platforms: ['tiktok'], reason: 'Sexual content code' },
    { tag: 'corn', platforms: ['tiktok'], reason: 'Adult content code' },
    { tag: 'accountant', platforms: ['tiktok'], reason: 'Adult content code' },
    { tag: '304', platforms: ['tiktok'], reason: 'Inappropriate code' },
    { tag: 'grippy', platforms: ['tiktok'], reason: 'Mental health code' },
    { tag: 'spicyaccountant', platforms: ['tiktok'], reason: 'Adult content' },
    { tag: 'shadowban', platforms: ['twitter'], reason: 'Platform criticism' },
    { tag: 'censored', platforms: ['twitter'], reason: 'Platform criticism' },
    { tag: 'suppressed', platforms: ['twitter'], reason: 'Platform criticism' },
    { tag: 'nsfw', platforms: ['twitter', 'facebook'], reason: 'Adult content' },
    { tag: 'onlyfans', platforms: ['twitter', 'instagram'], reason: 'Adult platform' },
    { tag: 'crypto', platforms: ['facebook'], reason: 'Financial spam' },
    { tag: 'bitcoin', platforms: ['facebook'], reason: 'Financial spam' },
    { tag: 'forex', platforms: ['facebook'], reason: 'Financial scams' },
    { tag: 'mlm', platforms: ['facebook'], reason: 'Pyramid schemes' },
    { tag: 'getrichquick', platforms: ['facebook'], reason: 'Scam association' },
    { tag: 'passiveincome', platforms: ['facebook'], reason: 'Scam association' },
    { tag: 'dropshipping', platforms: ['facebook'], reason: 'Spam/scams' },
    { tag: 'cbd', platforms: ['facebook', 'instagram'], reason: 'Restricted products' },
    { tag: 'vape', platforms: ['facebook', 'instagram'], reason: 'Restricted products' },
    { tag: 'ass', platforms: ['instagram'], reason: 'Inappropriate' },
    { tag: 'booty', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'bootyday', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'glutes', platforms: ['instagram'], reason: 'Misuse' },
    { tag: 'thick', platforms: ['instagram'], reason: 'Inappropriate use' },
    { tag: 'thickthighs', platforms: ['instagram'], reason: 'Inappropriate content' },
    { tag: 'sexy', platforms: ['instagram'], reason: 'Adult content' },
    { tag: 'hot', platforms: ['instagram'], reason: 'Misuse' },
    { tag: 'wap', platforms: ['tiktok'], reason: 'Explicit reference' },
    { tag: 'adult', platforms: ['tiktok', 'twitter'], reason: 'Adult content' },
    { tag: 'spicy', platforms: ['tiktok'], reason: 'Adult content code' },
    { tag: 'fyp', platforms: ['tiktok'], reason: 'Does not boost reach' },
    { tag: 'foryou', platforms: ['tiktok'], reason: 'Does not boost reach' },
    { tag: 'foryoupage', platforms: ['tiktok'], reason: 'Does not boost reach' },
    { tag: 'viral', platforms: ['tiktok'], reason: 'Engagement bait' },
    { tag: 'blowthisup', platforms: ['tiktok'], reason: 'Engagement bait' },
    { tag: 'trending', platforms: ['tiktok'], reason: 'Engagement bait' },
    { tag: 'coronavirus', platforms: ['tiktok'], reason: 'Misinformation concerns' },
    { tag: 'covid', platforms: ['tiktok'], reason: 'Misinformation concerns' },
    { tag: 'vaccine', platforms: ['tiktok'], reason: 'Misinformation concerns' },
    { tag: 'violence', platforms: ['twitter', 'facebook'], reason: 'Violent content' },
    { tag: 'gore', platforms: ['twitter'], reason: 'Graphic content' },
    { tag: 'blood', platforms: ['twitter'], reason: 'Graphic content' },
    { tag: 'drugs', platforms: ['facebook'], reason: 'Illegal substances' },
    { tag: 'weapons', platforms: ['facebook'], reason: 'Restricted items' },
    { tag: 'firearms', platforms: ['facebook'], reason: 'Restricted items' },
    { tag: 'hacking', platforms: ['facebook', 'twitter'], reason: 'Illegal activity' },
    { tag: 'scam', platforms: ['twitter', 'facebook'], reason: 'Fraud' },
    { tag: 'pyramid', platforms: ['twitter', 'facebook'], reason: 'Illegal schemes' },
    { tag: 'harassment', platforms: ['twitter', 'facebook'], reason: 'Abuse' },
    { tag: 'doxxing', platforms: ['twitter'], reason: 'Privacy violation' },
    { tag: 'swatting', platforms: ['twitter'], reason: 'Dangerous activity' },
    { tag: 'instadaily', platforms: ['instagram'], reason: 'Spam association' },
    { tag: 'instalike', platforms: ['instagram'], reason: 'Engagement bait' },
    { tag: 'likeback', platforms: ['instagram'], reason: 'Engagement bait' },
    { tag: 'followme', platforms: ['instagram'], reason: 'Engagement bait' },
    { tag: 'goals', platforms: ['instagram'], reason: 'Overused/spam' },
    { tag: 'thinspiration', platforms: ['instagram'], reason: 'Eating disorders' }
];

// Platform icons
const PLATFORM_ICONS = {
    instagram: '📸',
    tiktok: '🎵',
    twitter: '🐦',
    facebook: '📘'
};

// Store last results for export
let lastResults = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initHashtagChecker();
    initTrendingHashtags();
    initSearchCounter();
});

function initHashtagChecker() {
    const form = document.getElementById('hashtag-form');
    const input = document.getElementById('hashtag-input');
    const countDisplay = document.getElementById('hashtag-count');
    const exampleBtn = document.getElementById('example-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    if (!form) return;
    
    // Update count on input
    input.addEventListener('input', function() {
        const hashtags = parseHashtags(this.value);
        countDisplay.textContent = `${hashtags.length} hashtag${hashtags.length !== 1 ? 's' : ''} detected`;
    });
    
    // Load examples
    exampleBtn.addEventListener('click', function() {
        input.value = '#fitness #motivation #gym #workout #fitfam #love #instagood #photooftheday #beautiful #fashion #like4like #follow4follow #selfie #me #cute #tbt #instadaily #girl #fun #smile #food #amazing #style #happy #travel #photography #nature #life #friends #family';
        input.dispatchEvent(new Event('input'));
    });
    
    // Clear
    clearBtn.addEventListener('click', function() {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        document.getElementById('results-section').style.display = 'none';
    });
    
    // Form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        analyzeHashtags(parseHashtags(input.value));
    });
}

function parseHashtags(text) {
    const matches = text.match(/#[\w\u0080-\uFFFF]+/g) || [];
    // Remove duplicates and # symbol
    const unique = [...new Set(matches.map(h => h.toLowerCase().replace('#', '')))];
    return unique;
}

function analyzeHashtags(hashtags) {
    if (hashtags.length === 0) {
        alert('Please enter at least one hashtag');
        return;
    }
    
    // Check remaining searches
    const remaining = parseInt(localStorage.getItem('shadowban_hashtag_searches') || '5');
    if (remaining <= 0) {
        alert('You\'ve used all your free checks today. Upgrade to Shadow AI Pro for unlimited checks!');
        return;
    }
    
    // Show loading
    const btn = document.getElementById('check-hashtags-btn');
    btn.classList.add('loading');
    
    // Simulate analysis
    setTimeout(() => {
        btn.classList.remove('loading');
        
        // Decrement counter
        localStorage.setItem('shadowban_hashtag_searches', String(remaining - 1));
        updateSearchCounterDisplay();
        
        // Analyze each hashtag
        const results = hashtags.map(tag => checkHashtag(tag));
        lastResults = results;
        
        // Display results
        displayResults(results);
    }, 1500);
}

function checkHashtag(tag) {
    const result = {
        tag: tag,
        status: 'safe',
        reason: null,
        platforms: {
            instagram: 'safe',
            tiktok: 'safe',
            twitter: 'safe',
            facebook: 'safe'
        }
    };
    
    // Check each platform
    for (const platform of ['instagram', 'tiktok', 'twitter', 'facebook']) {
        const db = BANNED_HASHTAGS[platform];
        if (db.banned.includes(tag)) {
            result.platforms[platform] = 'banned';
            result.status = 'banned';
        } else if (db.restricted.includes(tag)) {
            result.platforms[platform] = 'restricted';
            if (result.status !== 'banned') result.status = 'restricted';
        }
    }
    
    // Find reason from trending
    const trendingMatch = TRENDING_BANNED.find(t => t.tag === tag);
    if (trendingMatch) {
        result.reason = trendingMatch.reason;
    } else if (result.status === 'banned') {
        result.reason = 'Banned for policy violations';
    } else if (result.status === 'restricted') {
        result.reason = 'Limited reach on some platforms';
    }
    
    return result;
}

function displayResults(results) {
    const section = document.getElementById('results-section');
    const summary = document.getElementById('results-summary');
    const grid = document.getElementById('results-grid');
    const cta = document.getElementById('results-cta');
    
    // Count stats
    const safe = results.filter(r => r.status === 'safe').length;
    const banned = results.filter(r => r.status === 'banned').length;
    const restricted = results.filter(r => r.status === 'restricted').length;
    
    // Update summary
    summary.innerHTML = `
        <span class="stat-badge safe">✓ ${safe} Safe</span>
        <span class="stat-badge banned">✕ ${banned} Banned</span>
        <span class="stat-badge restricted">⚠ ${restricted} Restricted</span>
    `;
    
    // Build grid
    grid.innerHTML = results.map(r => {
        const statusIcon = r.status === 'safe' ? '✓' : (r.status === 'banned' ? '✕' : '⚠');
        
        // Build platform icons (only show if not safe on that platform)
        let platformsHtml = '';
        for (const [platform, status] of Object.entries(r.platforms)) {
            if (status !== 'safe') {
                platformsHtml += `<span class="platform-icon ${status}" title="${platform}: ${status}">${PLATFORM_ICONS[platform]}</span>`;
            }
        }
        
        return `
            <div class="hashtag-result ${r.status}">
                <span class="hashtag-status">${statusIcon}</span>
                <div class="hashtag-info">
                    <div class="hashtag-name">#${r.tag}</div>
                    ${r.reason ? `<div class="hashtag-reason">${r.reason}</div>` : ''}
                </div>
                ${platformsHtml ? `<div class="hashtag-platforms">${platformsHtml}</div>` : ''}
            </div>
        `;
    }).join('');
    
    // Show/hide CTA
    cta.style.display = (banned > 0 || restricted > 0) ? 'flex' : 'none';
    
    // Show section
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copySafeHashtags() {
    const safe = lastResults.filter(r => r.status === 'safe').map(r => '#' + r.tag);
    if (safe.length === 0) {
        alert('No safe hashtags to copy!');
        return;
    }
    navigator.clipboard.writeText(safe.join(' '));
    alert(`Copied ${safe.length} safe hashtags to clipboard!`);
}

function exportResults() {
    if (lastResults.length === 0) return;
    
    let text = 'Hashtag Analysis Report\n';
    text += '=======================\n';
    text += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    text += `Summary:\n`;
    text += `- Safe: ${lastResults.filter(r => r.status === 'safe').length}\n`;
    text += `- Banned: ${lastResults.filter(r => r.status === 'banned').length}\n`;
    text += `- Restricted: ${lastResults.filter(r => r.status === 'restricted').length}\n\n`;
    
    text += 'Details:\n';
    lastResults.forEach(r => {
        const icon = r.status === 'safe' ? '✓' : (r.status === 'banned' ? '✕' : '⚠');
        text += `${icon} #${r.tag} - ${r.status.toUpperCase()}`;
        if (r.reason) text += ` (${r.reason})`;
        text += '\n';
    });
    
    text += '\nGenerated by ShadowBanCheck.io';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hashtag-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function checkAgain() {
    document.getElementById('hashtag-input').value = '';
    document.getElementById('hashtag-count').textContent = '0 hashtags detected';
    document.getElementById('results-section').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initTrendingHashtags() {
    const grid = document.getElementById('trending-grid');
    const countDisplay = document.getElementById('trending-count');
    const showMoreBtn = document.getElementById('show-more-trending');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    if (!grid) return;
    
    let currentPlatform = 'all';
    let showAll = false;
    
    function renderTrending() {
        let filtered = TRENDING_BANNED;
        
        if (currentPlatform !== 'all') {
            filtered = TRENDING_BANNED.filter(t => t.platforms.includes(currentPlatform));
        }
        
        const displayCount = showAll ? filtered.length : Math.min(30, filtered.length);
        const toShow = filtered.slice(0, displayCount);
        
        grid.innerHTML = toShow.map(t => {
            const platformIcons = t.platforms.map(p => PLATFORM_ICONS[p]).join('');
            return `
                <span class="trending-tag">
                    <span>#${t.tag}</span>
                    <span class="tag-platforms">${platformIcons}</span>
                </span>
            `;
        }).join('');
        
        countDisplay.textContent = `Showing ${displayCount} of ${filtered.length}`;
        showMoreBtn.querySelector('.show-text').textContent = showAll ? 'Show Less' : 'Show All';
        showMoreBtn.classList.toggle('expanded', showAll);
    }
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPlatform = this.dataset.platform;
            showAll = false;
            renderTrending();
        });
    });
    
    // Show more button
    showMoreBtn.addEventListener('click', function() {
        showAll = !showAll;
        renderTrending();
    });
    
    // Initial render
    renderTrending();
    
    // Update date
    const dateEl = document.getElementById('trending-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function initSearchCounter() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('shadowban_hashtag_last_reset');
    
    if (lastReset !== today) {
        localStorage.setItem('shadowban_hashtag_searches', '5');
        localStorage.setItem('shadowban_hashtag_last_reset', today);
    }
    
    updateSearchCounterDisplay();
}

function updateSearchCounterDisplay() {
    const remaining = parseInt(localStorage.getItem('shadowban_hashtag_searches') || '5');
    const display = document.getElementById('searches-display');
    if (display) {
        display.textContent = `${remaining} / 5 checks available today`;
    }
}
