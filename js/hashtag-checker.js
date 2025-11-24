// =============================================================================
// ShadowBanCheck.io - Hashtag Checker JavaScript
// =============================================================================

// Banned hashtags database
const BANNED_HASHTAGS = {
    instagram: ['ass', 'assday', 'adulting', 'alone', 'attractive', 'beautyblogger', 'bikinibody', 'boho', 'brain', 'costumes', 'curvygirls', 'dating', 'desk', 'dm', 'elevator', 'eggplant', 'fitnessgirls', 'fitfam', 'girlsonly', 'gloves', 'happythanksgiving', 'hardsummer', 'humpday', 'hustler', 'ilovemyjob', 'instamood', 'kansas', 'kissing', 'killingit', 'lavieenrose', 'leaves', 'like', 'likeforlike', 'milf', 'models', 'newyearseve', 'nasty', 'nudeart', 'overnight', 'petite', 'pornfood', 'popular', 'pushup', 'rate', 'saltwater', 'selfharm', 'sexy', 'single', 'skateboarding', 'skype', 'snap', 'stranger', 'snowstorm', 'streetphoto', 'sunbathing', 'swole', 'tanlines', 'teenagers', 'tgif', 'thinspo', 'todayimwearing', 'twerk', 'undies', 'valentinesday', 'woman', 'workflow', 'wrongway'],
    tiktok: ['porn', 'sex', 'nudity', 'sexy', 'hot', 'underwear', 'lingerie', 'plottwist', 'xyzbca', 'foryou', 'pov', 'acne', 'weightloss', 'eatingdisorder', 'selfharm', 'depression', 'anxiety'],
    twitter: ['covid', 'coronavirus', 'vaccine', 'election', 'fraud', 'rigged', 'porn', 'sex', 'nsfw', 'onlyfans']
};

const RESTRICTED_HASHTAGS = {
    instagram: ['bacak', 'beautyblogger', 'books', 'boobs', 'brain', 'bra', 'costumes', 'dating', 'direct', 'edm', 'fishnets', 'goddess', 'hipster', 'hotweather', 'ice', 'italiano', 'kissing', 'legs', 'master', 'models', 'mustfollow', 'parties', 'publicrelations', 'russian', 'saltwater', 'sexy', 'skateboarding', 'snap', 'southern', 'swingers', 'teens', 'thought', 'undies', 'weed'],
    tiktok: ['fyp', 'foryou', 'foryoupage', 'viral', 'xyzbca'],
    twitter: []
};

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
const pricingCta = document.getElementById('pricing-cta');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChecksRemaining();
    
    hashtagInput?.addEventListener('input', updateHashtagCount);
    checkBtn?.addEventListener('click', checkHashtags);
    clearBtn?.addEventListener('click', clearInput);
    exampleBtn?.addEventListener('click', loadExample);
    copySafeBtn?.addEventListener('click', copySafeHashtags);
    exportBtn?.addEventListener('click', exportResults);
});

function loadChecksRemaining() {
    const lastDate = localStorage.getItem('hashtag_last_check_date');
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
        checksRemaining = 5;
        localStorage.setItem('hashtag_checks_remaining', '5');
        localStorage.setItem('hashtag_last_check_date', today);
    } else {
        checksRemaining = parseInt(localStorage.getItem('hashtag_checks_remaining') || '5');
    }
    
    updateChecksDisplay();
}

function updateChecksDisplay() {
    const el = document.getElementById('hashtag-searches-remaining');
    if (el) {
        el.innerHTML = checksRemaining > 0 
            ? `${checksRemaining} / 5 available`
            : `<span style="color: #ef4444;">0 / 5 - <a href="index.html#pricing" style="color: var(--primary);">Upgrade</a></span>`;
    }
    if (checksRemainingDisplay) {
        checksRemainingDisplay.textContent = checksRemaining > 0 ? `${checksRemaining} free checks left today` : 'Out of free checks';
    }
    if (checkBtn) checkBtn.disabled = checksRemaining <= 0;
}

function extractHashtags(text) {
    const cleaned = text.replace(/#/g, '').toLowerCase();
    const hashtags = cleaned.split(/[\s,\n]+/).filter(h => h.trim().length > 0);
    return [...new Set(hashtags)];
}

function updateHashtagCount() {
    const hashtags = extractHashtags(hashtagInput.value);
    if (hashtagCount) hashtagCount.textContent = `${hashtags.length} hashtag${hashtags.length !== 1 ? 's' : ''}`;
}

function checkHashtags() {
    const hashtags = extractHashtags(hashtagInput.value);
    if (hashtags.length === 0) { alert('Please enter at least one hashtag'); return; }
    if (checksRemaining <= 0) { pricingCta?.classList.remove('hidden'); pricingCta?.scrollIntoView({ behavior: 'smooth' }); return; }
    
    currentResults = hashtags.map(analyzeHashtag);
    checksRemaining--;
    localStorage.setItem('hashtag_checks_remaining', checksRemaining.toString());
    updateChecksDisplay();
    displayResults();
    if (checksRemaining === 0) pricingCta?.classList.remove('hidden');
    resultsSection?.scrollIntoView({ behavior: 'smooth' });
}

function analyzeHashtag(tag) {
    const result = { tag, status: 'safe', platforms: { instagram: 'safe', tiktok: 'safe', twitter: 'safe' }, message: 'Safe to use' };
    
    if (BANNED_HASHTAGS.instagram.includes(tag)) { result.platforms.instagram = 'banned'; result.status = 'banned'; }
    else if (RESTRICTED_HASHTAGS.instagram.includes(tag)) { result.platforms.instagram = 'restricted'; result.status = result.status === 'banned' ? 'banned' : 'restricted'; }
    
    if (BANNED_HASHTAGS.tiktok.includes(tag)) { result.platforms.tiktok = 'banned'; result.status = 'banned'; }
    else if (RESTRICTED_HASHTAGS.tiktok.includes(tag)) { result.platforms.tiktok = 'restricted'; result.status = result.status === 'banned' ? 'banned' : 'restricted'; }
    
    if (BANNED_HASHTAGS.twitter.includes(tag)) { result.platforms.twitter = 'banned'; result.status = 'banned'; }
    
    if (result.status === 'banned') {
        const banned = [];
        if (result.platforms.instagram === 'banned') banned.push('Instagram');
        if (result.platforms.tiktok === 'banned') banned.push('TikTok');
        if (result.platforms.twitter === 'banned') banned.push('Twitter');
        result.message = `Banned on ${banned.join(', ')}`;
    } else if (result.status === 'restricted') {
        const restricted = [];
        if (result.platforms.instagram === 'restricted') restricted.push('Instagram');
        if (result.platforms.tiktok === 'restricted') restricted.push('TikTok');
        result.message = `Restricted on ${restricted.join(', ')}`;
    }
    
    return result;
}

function displayResults() {
    resultsSection?.classList.remove('hidden');
    
    const safe = currentResults.filter(r => r.status === 'safe').length;
    const banned = currentResults.filter(r => r.status === 'banned').length;
    const restricted = currentResults.filter(r => r.status === 'restricted').length;
    
    if (safeCountEl) safeCountEl.textContent = safe;
    if (bannedCountEl) bannedCountEl.textContent = banned;
    if (restrictedCountEl) restrictedCountEl.textContent = restricted;
    
    if (resultsList) {
        resultsList.innerHTML = currentResults.map(result => {
            const icon = result.status === 'safe' ? '✅' : result.status === 'banned' ? '🚫' : '⚠️';
            return `
                <div class="result-item ${result.status}">
                    <div class="result-left">
                        <div class="result-icon">${icon}</div>
                        <div class="result-info">
                            <div class="result-hashtag">#${result.tag}</div>
                            <div class="result-status">${result.message}</div>
                            <div class="result-platforms">
                                <span class="platform-status ${result.platforms.instagram}">📸 IG: ${result.platforms.instagram}</span>
                                <span class="platform-status ${result.platforms.tiktok}">🎵 TT: ${result.platforms.tiktok}</span>
                                <span class="platform-status ${result.platforms.twitter}">🐦 X: ${result.platforms.twitter}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function clearInput() {
    if (hashtagInput) hashtagInput.value = '';
    updateHashtagCount();
    resultsSection?.classList.add('hidden');
}

function loadExample() {
    if (hashtagInput) hashtagInput.value = '#fitness #motivation #gains #workout #fitfam #love #instagood #sexy #viral #fyp';
    updateHashtagCount();
}

function copySafeHashtags() {
    const safe = currentResults.filter(r => r.status === 'safe').map(r => '#' + r.tag).join(' ');
    if (safe) {
        navigator.clipboard.writeText(safe).then(() => alert('Safe hashtags copied!'));
    } else {
        alert('No safe hashtags to copy.');
    }
}

function exportResults() {
    let text = 'HASHTAG CHECK RESULTS\n====================\n\n';
    text += `Checked: ${new Date().toLocaleString()}\nTotal: ${currentResults.length}\n\n`;
    
    text += 'SAFE:\n' + currentResults.filter(r => r.status === 'safe').map(r => `#${r.tag}`).join(', ') + '\n\n';
    text += 'BANNED:\n' + currentResults.filter(r => r.status === 'banned').map(r => `#${r.tag} (${r.message})`).join('\n') + '\n\n';
    text += 'RESTRICTED:\n' + currentResults.filter(r => r.status === 'restricted').map(r => `#${r.tag} (${r.message})`).join('\n') + '\n\n';
    text += '--\nGenerated by ShadowBanCheck.io';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hashtag-check-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
