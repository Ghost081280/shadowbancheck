/* =============================================================================
   HASHTAG-CHECKER.JS - Hashtag Checker Page Functionality
   ============================================================================= */

/* =============================================================================
   BANNED HASHTAGS DATABASE
   ============================================================================= */
const bannedHashtags = {
    instagram: {
        banned: [
            'adulting', 'alone', 'attractive', 'beautyblogger', 'bikinibody',
            'costumes', 'dating', 'dm', 'elevator', 'girlsonly', 'humpday',
            'hustler', 'killingit', 'models', 'nasty', 'petite', 'pushup',
            'sexy', 'single', 'sunbathing', 'tanlines', 'teenagers', 'thinspo',
            'twerk', 'undies', 'valentinesday', 'woman', 'women'
        ],
        restricted: [
            'fitfam', 'likeforlike', 'popular', 'snap', 'tgif', 'followforfollow',
            'like4like', 'follow4follow', 'l4l', 'f4f', 'fitness', 'gym'
        ]
    },
    tiktok: {
        banned: [
            'porn', 'sex', 'nudity', 'sexy', 'hot', 'underwear', 'lingerie',
            'acne', 'weightloss', 'eatingdisorder', 'selfharm', 'depression',
            'anxiety', 'suicide', 'drugs', 'weed', 'cocaine'
        ],
        restricted: [
            'fyp', 'foryou', 'foryoupage', 'viral', 'xyzbca', 'plottwist',
            'trending', 'blowthisup', 'makemefamous'
        ]
    },
    twitter: {
        banned: [
            'porn', 'sex', 'nsfw', 'onlyfans', 'fraud', 'rigged'
        ],
        restricted: [
            'covid', 'coronavirus', 'vaccine', 'election', 'qanon', 'stopthesteal'
        ]
    },
    facebook: {
        banned: [
            'porn', 'sex', 'nude', 'drugs', 'weed', 'cannabis', 'gambling', 'betting'
        ],
        restricted: [
            'vaccine', 'covid', 'crypto', 'bitcoin', 'nft'
        ]
    },
    linkedin: {
        banned: [
            'porn', 'sex', 'mlm', 'getrichquick', 'scam'
        ],
        restricted: [
            'hiring', 'jobsearch', 'opentowork', 'follow', 'like', 'crypto',
            'nft', 'viral', 'hustle'
        ]
    }
};

// Export for potential use elsewhere
window.bannedHashtags = bannedHashtags;

/* =============================================================================
   HASHTAG PARSING
   ============================================================================= */
function parseHashtags(input) {
    if (!input) return [];
    
    // Clean input - handle various formats
    let cleaned = input
        .toLowerCase()
        .replace(/[,\n\r]/g, ' ')  // Replace commas and newlines with spaces
        .replace(/[^\w\s#]/g, '')  // Remove special chars except # and spaces
        .trim();
    
    // Split by spaces and filter
    let tags = cleaned.split(/\s+/)
        .map(tag => tag.replace(/^#+/, ''))  // Remove leading #
        .filter(tag => tag.length > 0);
    
    // Remove duplicates
    return [...new Set(tags)];
}

/* =============================================================================
   HASHTAG CHECKING
   ============================================================================= */
function checkHashtag(hashtag) {
    const tag = hashtag.toLowerCase().replace(/^#/, '');
    const results = {
        hashtag: `#${tag}`,
        platforms: {}
    };
    
    // Check each platform
    Object.keys(bannedHashtags).forEach(platform => {
        const platformData = bannedHashtags[platform];
        
        if (platformData.banned.includes(tag)) {
            results.platforms[platform] = 'banned';
        } else if (platformData.restricted.includes(tag)) {
            results.platforms[platform] = 'restricted';
        } else {
            results.platforms[platform] = 'safe';
        }
    });
    
    // Determine overall status
    const statuses = Object.values(results.platforms);
    if (statuses.includes('banned')) {
        results.status = 'banned';
    } else if (statuses.includes('restricted')) {
        results.status = 'restricted';
    } else {
        results.status = 'safe';
    }
    
    return results;
}

function checkAllHashtags(hashtags) {
    return hashtags.map(tag => checkHashtag(tag));
}

/* =============================================================================
   UI UPDATES
   ============================================================================= */
function updateHashtagCount() {
    const input = document.getElementById('hashtag-input');
    const countDisplay = document.getElementById('hashtag-count');
    
    if (!input || !countDisplay) return;
    
    const hashtags = parseHashtags(input.value);
    const count = hashtags.length;
    
    countDisplay.textContent = `${count} hashtag${count !== 1 ? 's' : ''}`;
}

function displayResults(results) {
    const resultsSection = document.getElementById('results-section');
    const resultsList = document.getElementById('results-list');
    const safeCount = document.getElementById('safe-count');
    const bannedCount = document.getElementById('banned-count');
    const restrictedCount = document.getElementById('restricted-count');
    
    if (!resultsSection || !resultsList) return;
    
    // Count by status
    const counts = { safe: 0, banned: 0, restricted: 0 };
    results.forEach(r => counts[r.status]++);
    
    // Update summary
    if (safeCount) safeCount.textContent = counts.safe;
    if (bannedCount) bannedCount.textContent = counts.banned;
    if (restrictedCount) restrictedCount.textContent = counts.restricted;
    
    // Build results list
    resultsList.innerHTML = '';
    
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = `result-item ${result.status}`;
        
        const icon = result.status === 'safe' ? '✅' : 
                     result.status === 'banned' ? '🚫' : '⚠️';
        
        const statusText = result.status === 'safe' ? 'Safe to use' :
                          result.status === 'banned' ? 'Banned on some platforms' :
                          'Restricted on some platforms';
        
        // Build platform status badges
        let platformBadges = '';
        Object.entries(result.platforms).forEach(([platform, status]) => {
            if (status !== 'safe') {
                const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
                platformBadges += `<span class="platform-status ${status}">${platformName}: ${status}</span>`;
            }
        });
        
        item.innerHTML = `
            <span class="result-icon">${icon}</span>
            <div class="result-info">
                <div class="result-hashtag">${result.hashtag}</div>
                <div class="result-status">${statusText}</div>
                ${platformBadges ? `<div class="result-platforms">${platformBadges}</div>` : ''}
            </div>
        `;
        
        resultsList.appendChild(item);
    });
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* =============================================================================
   FORM HANDLERS
   ============================================================================= */
function initHashtagForm() {
    const input = document.getElementById('hashtag-input');
    const checkBtn = document.getElementById('check-hashtags-btn');
    const clearBtn = document.getElementById('clear-btn');
    const exampleBtn = document.getElementById('example-btn');
    
    if (!input || !checkBtn) return;
    
    // Update count on input
    input.addEventListener('input', updateHashtagCount);
    
    // Check button
    checkBtn.addEventListener('click', handleHashtagCheck);
    
    // Clear button
    clearBtn?.addEventListener('click', function() {
        input.value = '';
        updateHashtagCount();
        document.getElementById('results-section')?.classList.add('hidden');
    });
    
    // Example button
    exampleBtn?.addEventListener('click', function() {
        input.value = '#fitness #healthy #motivation #likeforlike #travel #food #photography #love #instagood';
        updateHashtagCount();
    });
}

function handleHashtagCheck() {
    const input = document.getElementById('hashtag-input');
    const value = input?.value.trim();
    
    if (!value) {
        showError('Please enter at least one hashtag');
        return;
    }
    
    const hashtags = parseHashtags(value);
    
    if (hashtags.length === 0) {
        showError('No valid hashtags found');
        return;
    }
    
    // Check remaining searches for free users
    const remaining = window.ShadowBan?.getRemainingSearches() || 0;
    if (remaining <= 0) {
        showUpgradeModal();
        return;
    }
    
    // Increment search count
    window.ShadowBan?.incrementSearchCount();
    
    // Check hashtags
    const results = checkAllHashtags(hashtags);
    
    // Display results
    displayResults(results);
}

function showError(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast error';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('visible', 'error');
    
    setTimeout(() => {
        toast.classList.remove('visible', 'error');
    }, 4000);
}

function showUpgradeModal() {
    alert('You\'ve used all your free checks for today. Visit our pricing page to upgrade for unlimited access!');
    // Could be enhanced with a proper modal
}

/* =============================================================================
   RESULTS ACTIONS
   ============================================================================= */
function initResultsActions() {
    const copySafeBtn = document.getElementById('copy-safe-btn');
    const exportBtn = document.getElementById('export-btn');
    
    copySafeBtn?.addEventListener('click', function() {
        const safeItems = document.querySelectorAll('.result-item.safe .result-hashtag');
        const safeTags = Array.from(safeItems).map(el => el.textContent).join(' ');
        
        if (safeTags) {
            navigator.clipboard.writeText(safeTags).then(() => {
                showToast('Safe hashtags copied to clipboard!');
            });
        } else {
            showToast('No safe hashtags to copy');
        }
    });
    
    exportBtn?.addEventListener('click', function() {
        const results = document.getElementById('results-list');
        if (!results) return;
        
        let text = 'Hashtag Check Results\n';
        text += '=====================\n\n';
        
        const items = results.querySelectorAll('.result-item');
        items.forEach(item => {
            const hashtag = item.querySelector('.result-hashtag')?.textContent || '';
            const status = item.querySelector('.result-status')?.textContent || '';
            text += `${hashtag}: ${status}\n`;
        });
        
        // Download as text file
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hashtag-results.txt';
        a.click();
        URL.revokeObjectURL(url);
    });
}

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('visible');
    
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

/* =============================================================================
   INITIALIZE
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    initHashtagForm();
    initResultsActions();
    updateHashtagCount();
    
    console.log('✅ Hashtag Checker initialized');
});
