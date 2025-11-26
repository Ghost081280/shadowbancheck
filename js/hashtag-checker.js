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
   SEARCH COUNTER - HASHTAG SPECIFIC
   ============================================================================= */
const HASHTAG_STORAGE_KEY = 'shadowban_hashtag_searches';
const MAX_FREE_HASHTAG_SEARCHES = 1;

function getHashtagSearchCount() {
    const data = JSON.parse(localStorage.getItem(HASHTAG_STORAGE_KEY) || '{}');
    const today = new Date().toDateString();
    
    if (data.date !== today) {
        return 0;
    }
    
    return data.count || 0;
}

function getRemainingHashtagSearches() {
    return Math.max(0, MAX_FREE_HASHTAG_SEARCHES - getHashtagSearchCount());
}

function incrementHashtagSearchCount() {
    const data = JSON.parse(localStorage.getItem(HASHTAG_STORAGE_KEY) || '{}');
    const today = new Date().toDateString();
    
    if (data.date !== today) {
        localStorage.setItem(HASHTAG_STORAGE_KEY, JSON.stringify({
            date: today,
            count: 1
        }));
    } else {
        localStorage.setItem(HASHTAG_STORAGE_KEY, JSON.stringify({
            date: today,
            count: (data.count || 0) + 1
        }));
    }
    
    updateHashtagCounterDisplay();
}

function updateHashtagCounterDisplay() {
    const remaining = getRemainingHashtagSearches();
    
    const checksDisplay = document.getElementById('checks-remaining-display');
    if (checksDisplay) {
        checksDisplay.textContent = `${remaining} free checks left today`;
    }
}

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
    
    // Update summary counts
    if (safeCount) safeCount.textContent = counts.safe;
    if (bannedCount) bannedCount.textContent = counts.banned;
    if (restrictedCount) restrictedCount.textContent = counts.restricted;
    
    // Build results grid - compact items
    resultsList.innerHTML = '';
    
    // Sort: banned first, then restricted, then safe
    const sortedResults = [...results].sort((a, b) => {
        const order = { banned: 0, restricted: 1, safe: 2 };
        return order[a.status] - order[b.status];
    });
    
    sortedResults.forEach(result => {
        const item = document.createElement('div');
        item.className = `result-item ${result.status}`;
        
        const icon = result.status === 'safe' ? '✅' : 
                     result.status === 'banned' ? '🚫' : '⚠️';
        
        // Build compact platform badges (only show non-safe platforms)
        let platformBadges = '';
        const flaggedPlatforms = Object.entries(result.platforms)
            .filter(([_, status]) => status !== 'safe')
            .slice(0, 3); // Limit to 3 for compactness
        
        if (flaggedPlatforms.length > 0) {
            platformBadges = flaggedPlatforms
                .map(([platform, status]) => {
                    const shortName = platform.slice(0, 2).toUpperCase();
                    return `<span class="platform-status ${status}" title="${platform}: ${status}">${shortName}</span>`;
                })
                .join('');
        }
        
        item.innerHTML = `
            <span class="result-icon">${icon}</span>
            <div class="result-info">
                <div class="result-hashtag">${result.hashtag}</div>
                ${platformBadges ? `<div class="result-platforms">${platformBadges}</div>` : ''}
            </div>
        `;
        
        resultsList.appendChild(item);
    });
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Scroll to results smoothly
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* =============================================================================
   LIMIT MODAL
   ============================================================================= */
function showLimitModal() {
    const modal = document.getElementById('limit-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hideLimitModal() {
    const modal = document.getElementById('limit-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
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
        input.value = '#fitness #healthy #motivation #likeforlike #travel #food #photography #love #instagood #fyp';
        updateHashtagCount();
    });
}

function handleHashtagCheck() {
    const input = document.getElementById('hashtag-input');
    const value = input?.value.trim();
    
    if (!value) {
        showToast('Please enter at least one hashtag');
        return;
    }
    
    const hashtags = parseHashtags(value);
    
    if (hashtags.length === 0) {
        showToast('No valid hashtags found');
        return;
    }
    
    // Check remaining searches for free users
    const remaining = getRemainingHashtagSearches();
    if (remaining <= 0) {
        showLimitModal();
        return;
    }
    
    // Show loading state
    const checkBtn = document.getElementById('check-hashtags-btn');
    if (checkBtn) {
        checkBtn.disabled = true;
        checkBtn.innerHTML = '<span>Analyzing...</span><span>⏳</span>';
    }
    
    // Simulate analysis delay
    setTimeout(() => {
        // Increment search count
        incrementHashtagSearchCount();
        
        // Check hashtags
        const rawResults = checkAllHashtags(hashtags);
        
        // Build results for results page
        const results = buildHashtagResults(hashtags, rawResults);
        
        // Store results and redirect
        sessionStorage.setItem('checkResults', JSON.stringify(results));
        window.location.href = 'results.html';
    }, 1500);
}

function buildHashtagResults(hashtags, rawResults) {
    // Count statuses
    const counts = { safe: 0, restricted: 0, banned: 0 };
    rawResults.forEach(r => counts[r.status]++);
    
    // Calculate probability (higher = worse)
    const totalChecked = rawResults.length;
    const probability = Math.round(
        ((counts.banned * 100) + (counts.restricted * 50)) / totalChecked
    );
    
    // Determine overall status
    let status, statusClass;
    if (counts.banned > 0) {
        status = 'Banned Hashtags Found';
        statusClass = 'bad';
    } else if (counts.restricted > 0) {
        status = 'Restricted Hashtags Found';
        statusClass = 'warning';
    } else {
        status = 'All Hashtags Safe';
        statusClass = 'good';
    }
    
    // Build checks from raw results
    const checks = rawResults.map(r => {
        let checkStatus = r.status === 'safe' ? 'pass' : r.status === 'restricted' ? 'warning' : 'fail';
        let detail = '';
        
        // Build platform-specific detail
        const platformStatuses = Object.entries(r.platforms)
            .filter(([_, s]) => s !== 'safe')
            .map(([p, s]) => `${p}: ${s}`)
            .join(', ');
        
        if (r.status === 'banned') {
            detail = `Banned on: ${platformStatuses || 'multiple platforms'}`;
        } else if (r.status === 'restricted') {
            detail = `Restricted on: ${platformStatuses || 'some platforms'}`;
        } else {
            detail = 'Safe to use on all platforms';
        }
        
        return {
            name: r.hashtag,
            status: checkStatus,
            icon: r.status === 'banned' ? '🚫' : r.status === 'restricted' ? '⚠️' : '✅',
            detail: detail
        };
    });
    
    // Build recommendations
    const recommendations = [];
    if (counts.banned > 0) {
        recommendations.push(`Remove ${counts.banned} banned hashtag${counts.banned > 1 ? 's' : ''} to avoid shadow bans.`);
    }
    if (counts.restricted > 0) {
        recommendations.push(`Consider replacing ${counts.restricted} restricted hashtag${counts.restricted > 1 ? 's' : ''} for better reach.`);
    }
    if (counts.safe > 0) {
        recommendations.push(`${counts.safe} hashtag${counts.safe > 1 ? 's are' : ' is'} safe to use.`);
    }
    recommendations.push('Check your account status with our Account Checker.');
    recommendations.push('Verify specific posts with our Post URL Checker.');
    
    return {
        type: 'hashtag',
        platform: 'Multi-Platform',
        platformIcon: '#️⃣',
        platformKey: 'hashtag',
        query: hashtags.map(h => `#${h}`).join(' '),
        timestamp: new Date().toISOString(),
        probability: probability,
        status: status,
        statusClass: statusClass,
        factors: {
            platformAPI: false,
            webAnalysis: true,
            historicalData: true,
            hashtagDatabase: true,
            ipAnalysis: false
        },
        factorsUsed: '3/5',
        ipData: null,
        checks: checks,
        recommendations: recommendations,
        summary: {
            total: totalChecked,
            safe: counts.safe,
            restricted: counts.restricted,
            banned: counts.banned
        }
    };
}

/* =============================================================================
   TOAST NOTIFICATIONS
   ============================================================================= */
function showToast(message, type = '') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast visible ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 4000);
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
        
        let text = 'Hashtag Check Results - ShadowBanCheck.io\n';
        text += '==========================================\n\n';
        text += `Generated: ${new Date().toLocaleString()}\n\n`;
        
        const items = results.querySelectorAll('.result-item');
        
        // Group by status
        const safe = [];
        const banned = [];
        const restricted = [];
        
        items.forEach(item => {
            const hashtag = item.querySelector('.result-hashtag')?.textContent || '';
            if (item.classList.contains('safe')) {
                safe.push(hashtag);
            } else if (item.classList.contains('banned')) {
                banned.push(hashtag);
            } else if (item.classList.contains('restricted')) {
                restricted.push(hashtag);
            }
        });
        
        text += `✅ SAFE (${safe.length}):\n`;
        text += safe.join(' ') + '\n\n';
        
        text += `🚫 BANNED (${banned.length}):\n`;
        text += banned.join(' ') + '\n\n';
        
        text += `⚠️ RESTRICTED (${restricted.length}):\n`;
        text += restricted.join(' ') + '\n\n';
        
        text += '---\n';
        text += 'Check your hashtags at: https://shadowbancheck.io/hashtag-checker.html\n';
        
        // Download as text file
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hashtag-results.txt';
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('Results exported!');
    });
}

/* =============================================================================
   INITIALIZE
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    initHashtagForm();
    initResultsActions();
    updateHashtagCount();
    updateHashtagCounterDisplay();
    
    console.log('✅ Hashtag Checker initialized');
});

/* =============================================================================
   EXPORTS
   ============================================================================= */
window.HashtagChecker = {
    getRemainingHashtagSearches,
    incrementHashtagSearchCount,
    updateHashtagCounterDisplay,
    showLimitModal,
    hideLimitModal
};
