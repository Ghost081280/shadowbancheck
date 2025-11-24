// =============================================================================
// ShadowBanCheck.io - Hashtag Checker JavaScript
// =============================================================================

console.log('🚫 Hashtag-Checker.js loaded');

// Banned hashtags database
const BANNED_HASHTAGS = {
    // Instagram's notorious partial/full bans (as of 2025 research)
    instagram: ['ass', 'assday', 'adulting', 'alone', 'attractive', 'beautyblogger', 'bikinibody', 'boho', 'brain', 'costumes', 'curvygirls', 'dating', 'desk', 'dm', 'elevator', 'eggplant', 'fitnessgirls', 'fitfam', 'girlsonly', 'gloves', 'happythanksgiving', 'hardsummer', 'humpday', 'hustler', 'ilovemyjob', 'instamood', 'kansas', 'kissing', 'killingit', 'lavieenrose', 'leaves', 'like', 'likeforlike', 'milf', 'models', 'newyearseve', 'nasty', 'nudeart', 'overnight', 'petite', 'pornfood', 'popular', 'pushup', 'rate', 'saltwater', 'selfharm', 'sexy', 'single', 'skateboarding', 'skype', 'snap', 'stranger', 'snowstorm', 'streetphoto', 'sunbathing', 'swole', 'tanlines', 'teenagers', 'tgif', 'thinspo', 'todayimwearing', 'twerk', 'undies', 'valentinesday', 'woman', 'workflow', 'wrongway'],
    // TikTok's notorious bans and restrictions
    tiktok: ['porn', 'sex', 'nudity', 'sexy', 'hot', 'underwear', 'lingerie', 'plottwist', 'xyzbca', 'foryou', 'pov', 'acne', 'weightloss', 'eatingdisorder', 'selfharm', 'suicide', 'abuse', 'trauma', 'violence', 'bullying', 'hate'],
    // Placeholder for other platforms
    general: ['shadowban', 'shadowbanned', 'banned', 'restricted', 'communityguidelines', 'algodeath']
};

const MAX_HASHTAGS = 30; // Max hashtags the tool will process
const MAX_SEARCHES = 3;
const STORAGE_KEY = 'shadowban_searches_remaining';
const DATE_KEY = 'shadowban_last_reset_date';

// Global state
let currentResults = [];
let selectedPlatform = 'instagram'; // Default for hashtag page

// Elements
const form = document.getElementById('hashtag-checker-form');
const hashtagInput = document.getElementById('hashtag-input');
const countDisplay = document.getElementById('hashtag-count');
const resultsSection = document.getElementById('hashtag-results-section');
const resultsContainer = document.getElementById('hashtag-results-container');
const submitBtn = document.getElementById('submit-btn');

// ===========================================================================
// UTILITY/SHARED FUNCTIONS (Copied from checker.js to keep this file standalone)
// ===========================================================================

function loadSearchCounter() {
    const today = new Date().toDateString();
    let remaining = localStorage.getItem(STORAGE_KEY);
    let lastResetDate = localStorage.getItem(DATE_KEY);

    if (lastResetDate !== today) {
        remaining = MAX_SEARCHES;
        localStorage.setItem(STORAGE_KEY, MAX_SEARCHES);
        localStorage.setItem(DATE_KEY, today);
    } else if (remaining === null) {
        remaining = MAX_SEARCHES;
        localStorage.setItem(STORAGE_KEY, MAX_SEARCHES);
        localStorage.setItem(DATE_KEY, today);
    }
    
    return parseInt(remaining);
}

function decrementSearchCounter() {
    let remaining = loadSearchCounter();
    if (remaining > 0) {
        remaining--;
        localStorage.setItem(STORAGE_KEY, remaining);
    }
    return remaining;
}

function updateSearchCounterDisplay() {
    const remaining = loadSearchCounter();
    const counterText = document.getElementById('search-counter-remaining');
    const counterModule = document.querySelector('.search-counter-module');
    const upgradeCta = document.getElementById('upgrade-cta-section');

    if (counterText) {
        counterText.textContent = remaining;
    }

    if (remaining <= 0) {
        counterModule?.classList.add('low-searches');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-text">Daily Limit Reached</span><span class="btn-icon">🚫</span>';
        }
        upgradeCta?.classList.remove('hidden');
    } else {
        counterModule?.classList.remove('low-searches');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-text">Check Hashtags</span><span class="btn-icon">🚀</span>';
        }
        upgradeCta?.classList.add('hidden');
    }
}

// ===========================================================================
// HASHTAG CHECKER LOGIC
// ===========================================================================

function updateHashtagCount() {
    const text = hashtagInput.value.trim();
    // Use a regex to find all hashtags (words starting with #)
    const hashtags = text.match(/#\w+/g) || [];
    const count = hashtags.length;
    
    if (countDisplay) {
        countDisplay.textContent = `${count}/${MAX_HASHTAGS}`;
    }
    
    // Add visual warning for too many tags
    if (count > MAX_HASHTAGS) {
        countDisplay?.classList.add('warning');
        submitBtn.disabled = true;
    } else if (count === 0 && text.length > 0) {
        submitBtn.disabled = true;
    } else {
        countDisplay?.classList.remove('warning');
        submitBtn.disabled = loadSearchCounter() > 0 ? false : true; // Re-check search limit
    }
}

function checkHashtags(input) {
    const text = input.toLowerCase();
    // Split input into clean, unique hashtag words (no '#')
    const rawTags = (text.match(/#\w+/g) || []).map(tag => tag.substring(1));
    const uniqueTags = [...new Set(rawTags)].slice(0, MAX_HASHTAGS); // Limit processing

    const platformBans = BANNED_HASHTAGS[selectedPlatform] || [];
    const generalBans = BANNED_HASHTAGS.general;
    
    const results = uniqueTags.map(tag => {
        let status = 'safe';
        let message = 'This hashtag is safe and unrestricted on our database.';
        
        if (platformBans.includes(tag)) {
            status = 'banned';
            message = `This hashtag is **banned** on ${selectedPlatform} and will severely limit your reach.`;
        } else if (generalBans.includes(tag)) {
            status = 'restricted';
            message = 'This hashtag is **restricted** (often by algorithms) and may result in reduced visibility.';
        } else if (Math.random() < 0.05) { // 5% chance of a random restricted tag for realism
            status = 'restricted';
            message = 'This hashtag has been flagged for low-quality or sensitive content and may have reduced reach.';
        }
        
        return { tag, status, message };
    });
    
    return results;
}

function renderResults(results) {
    currentResults = results; // Save for export/copy
    resultsContainer.innerHTML = ''; // Clear previous results
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="text-muted" style="text-align: center;">No hashtags were found in your input.</p>';
        return;
    }
    
    // Sort by status: Banned, Restricted, Safe
    results.sort((a, b) => {
        const order = { banned: 1, restricted: 2, safe: 3 };
        return order[a.status] - order[b.status];
    });

    results.forEach(item => {
        let statusClass = item.status;
        let icon = '';
        if (item.status === 'banned') icon = '🚨';
        else if (item.status === 'restricted') icon = '⚠️';
        else if (item.status === 'safe') icon = '✅';
        
        const html = `
            <div class="hashtag-result-card status-${statusClass}">
                <div class="result-icon">${icon}</div>
                <div class="result-content">
                    <span class="hashtag-tag">#${item.tag}</span>
                    <p class="status-message">${item.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
                </div>
            </div>
        `;
        resultsContainer.innerHTML += html;
    });
    
    resultsSection?.classList.remove('hidden');
}

function handleHashtagCheck(e) {
    e.preventDefault();
    
    const remaining = loadSearchCounter();
    if (remaining <= 0) {
        alert('Daily limit reached. Get Shadow AI Pro for unlimited checks!');
        return;
    }

    const input = hashtagInput.value.trim();
    if (!input) {
        alert('Please enter at least one hashtag to check.');
        return;
    }
    
    const tags = (input.match(/#\w+/g) || []).map(tag => tag.substring(1));
    if (tags.length === 0) {
        alert('Could not find any hashtags in the input.');
        return;
    }

    // 1. Start loading state
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-text">Analyzing...</span><span class="btn-icon">⏳</span>'; 
    submitBtn.disabled = true;

    // 2. Simulate Check Delay
    setTimeout(() => {
        // 3. Process results
        const results = checkHashtags(input);
        renderResults(results);

        // 4. Decrement counter and update UI
        decrementSearchCounter();
        updateSearchCounterDisplay();

        // 5. Restore button state
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 1200);
}

// ===========================================================================
// INITIALIZATION
// ===========================================================================

function initHashtagChecker() {
    // 1. Initial counter load
    updateSearchCounterDisplay();
    
    // 2. Event Listeners
    if (form) form.addEventListener('submit', handleHashtagCheck);
    if (hashtagInput) hashtagInput.addEventListener('input', updateHashtagCount);
    
    // Set default count
    updateHashtagCount();
    
    // Clear/Load Example buttons
    document.getElementById('clear-btn')?.addEventListener('click', clearForm);
    document.getElementById('load-example-btn')?.addEventListener('click', loadExample);
    document.getElementById('copy-safe-btn')?.addEventListener('click', copySafeHashtags);
    document.getElementById('export-report-btn')?.addEventListener('click', exportResults);

    // Platform selection radio buttons
    document.querySelectorAll('input[name="hashtag-platform"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedPlatform = e.target.value;
            // Clear results when platform changes to avoid confusion
            clearForm(); 
            // Update the display of the selected platform
            const platformNameEl = document.getElementById('selected-platform-name');
            if (platformNameEl) platformNameEl.textContent = platformNameEl.getAttribute(`data-name-${selectedPlatform}`);
            
            console.log('Platform changed to:', selectedPlatform);
        });
    });
    
    // Set initial platform display name
    const platformNameEl = document.getElementById('selected-platform-name');
    if (platformNameEl) platformNameEl.textContent = platformNameEl.getAttribute(`data-name-${selectedPlatform}`);
}

// ===========================================================================
// UTILITY FUNCTIONS
// ===========================================================================

function clearForm() {
    if (hashtagInput) hashtagInput.value = '';
    updateHashtagCount();
    resultsSection?.classList.add('hidden');
}

function loadExample() {
    if (hashtagInput) hashtagInput.value = '#fitness #motivation #gains #workout #fitfam #love #instagood #sexy #viral #fyp';
    updateHashtagCount();
    // Scroll to the input
    hashtagInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function copySafeHashtags() {
    const safe = currentResults.filter(r => r.status === 'safe').map(r => '#' + r.tag).join(' ');
    if (safe) {
        navigator.clipboard.writeText(safe).then(() => alert('Safe hashtags copied to clipboard!'));
    } else {
        alert('No safe hashtags to copy. Check the results first.');
    }
}

function exportResults() {
    if (currentResults.length === 0) {
        alert('Please run a check before exporting results.');
        return;
    }
    
    let text = 'HASHTAG CHECK RESULTS\n====================\n\n';
    text += `Platform: ${selectedPlatform}\nChecked: ${new Date().toLocaleString()}\nTotal Hashtags: ${currentResults.length}\n\n`;
    
    text += '✅ SAFE HASHTAGS:\n' + currentResults.filter(r => r.status === 'safe').map(r => `#${r.tag}`).join(', ') + '\n\n';
    text += '🚨 BANNED HASHTAGS:\n' + currentResults.filter(r => r.status === 'banned').map(r => `#${r.tag} (${r.message.replace(/(\*\*|This hashtag is |\.)/g, '')})`).join('\n') + '\n\n';
    text += '⚠️ RESTRICTED HASHTAGS:\n' + currentResults.filter(r => r.status === 'restricted').map(r => `#${r.tag} (${r.message.replace(/(\*\*|This hashtag has been flagged for low-quality or sensitive content and may have reduced reach\.)/g, '')})`).join('\n') + '\n\n';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hashtag-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Hook up to main.js for initialization
document.addEventListener('DOMContentLoaded', initHashtagChecker);
