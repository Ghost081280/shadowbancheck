// =============================================================================
// ShadowBanCheck.io - Checker Page JavaScript
// CRITICAL: Modal ALWAYS opens. Search check happens on SUBMIT, not on click.
// =============================================================================

console.log('🔍 Checker.js loaded');

const MAX_SEARCHES = 3;
const STORAGE_KEY = 'shadowban_searches_remaining';
const DATE_KEY = 'shadowban_last_reset_date';

const platformData = {
    twitter: { name: 'Twitter / X', icon: '🐦', placeholder: '@username', description: 'Check if your Twitter/X account is shadow banned', checks: ['Search visibility', 'Reply threading', 'Profile discovery', 'Engagement reach'], live: true },
    reddit: { name: 'Reddit', icon: '🤖', placeholder: 'u/username', description: 'Check if your Reddit account is shadow banned', checks: ['Post visibility', 'Comment appearance', 'Profile access', 'Subreddit status'], live: true },
    email: { name: 'Email', icon: '📧', placeholder: 'your@email.com', description: 'Check if your email domain is blacklisted', checks: ['Spam blacklists', 'Domain reputation', 'SPF/DKIM records', 'Deliverability score'], live: true },
    instagram: { name: 'Instagram', icon: '📸', placeholder: '@username', description: 'Instagram shadow ban detection coming soon!', checks: ['Post visibility', 'Hashtag reach', 'Story views', 'Explore page'], live: false },
    tiktok: { name: 'TikTok', icon: '🎵', placeholder: '@username', description: 'TikTok shadow ban detection coming soon!', checks: ['For You Page', 'Video reach', 'Hashtag performance'], live: false },
    facebook: { name: 'Facebook', icon: '📘', placeholder: 'username', description: 'Coming soon!', checks: ['Post reach', 'Page visibility'], live: false },
    linkedin: { name: 'LinkedIn', icon: '💼', placeholder: 'profile URL', description: 'Coming soon!', checks: ['Post visibility', 'Profile views'], live: false },
    threads: { name: 'Threads', icon: '🧵', placeholder: '@username', description: 'Coming soon!', checks: ['Feed visibility', 'Reply reach'], live: false },
    bluesky: { name: 'Bluesky', icon: '🦋', placeholder: '@handle.bsky.social', description: 'Coming soon!', checks: ['Feed presence', 'Reply visibility'], live: false },
    youtube: { name: 'YouTube', icon: '📺', placeholder: 'channel name', description: 'Coming soon!', checks: ['Video visibility', 'Search ranking'], live: false },
    pinterest: { name: 'Pinterest', icon: '📌', placeholder: 'username', description: 'Coming soon!', checks: ['Pin visibility', 'Board reach'], live: false },
    discord: { name: 'Discord', icon: '🎮', placeholder: 'username#1234', description: 'Coming soon!', checks: ['Server bans', 'Message delivery'], live: false },
    twitch: { name: 'Twitch', icon: '🟣', placeholder: 'channel name', description: 'Coming soon!', checks: ['Stream visibility', 'Chat access'], live: false },
    kick: { name: 'Kick', icon: '⚡', placeholder: 'channel name', description: 'Coming soon!', checks: ['Stream reach', 'Chat status'], live: false },
    snapchat: { name: 'Snapchat', icon: '👻', placeholder: 'username', description: 'Coming soon!', checks: ['Story views', 'Snap delivery'], live: false },
    truth: { name: 'Truth Social', icon: '🇺🇸', placeholder: '@username', description: 'Coming soon!', checks: ['Post visibility', 'Feed presence'], live: false },
    rumble: { name: 'Rumble', icon: '📹', placeholder: 'channel name', description: 'Coming soon!', checks: ['Video reach', 'Search visibility'], live: false },
    telegram: { name: 'Telegram', icon: '✈️', placeholder: '@username', description: 'Coming soon!', checks: ['Channel visibility', 'Message delivery'], live: false },
    etsy: { name: 'Etsy', icon: '🛍️', placeholder: 'shop name', description: 'Coming soon!', checks: ['Listing visibility', 'Search ranking'], live: false },
    amazon: { name: 'Amazon', icon: '📦', placeholder: 'seller ID', description: 'Coming soon!', checks: ['Listing visibility', 'Buy Box eligibility'], live: false },
    ebay: { name: 'eBay', icon: '🏷️', placeholder: 'seller username', description: 'Coming soon!', checks: ['Listing reach', 'Search ranking'], live: false },
    phone: { name: 'Phone', icon: '📱', placeholder: '+1 555 123 4567', description: 'Coming soon!', checks: ['Spam lists', 'Carrier status'], live: false },
    domain: { name: 'Domain', icon: '🌐', placeholder: 'example.com', description: 'Coming soon!', checks: ['Blacklists', 'DNS health'], live: false },
    ip: { name: 'IP Address', icon: '🖥️', placeholder: '192.168.1.1', description: 'Coming soon!', checks: ['Blacklists', 'Spam databases'], live: false },
    google: { name: 'Google Business', icon: '📍', placeholder: 'business name', description: 'Coming soon!', checks: ['Listing visibility', 'Map presence'], live: false },
    website: { name: 'Website', icon: '🔗', placeholder: 'https://yoursite.com', description: 'Coming soon!', checks: ['Search indexing', 'Blacklists'], live: false }
};

function initSearchCounter() {
    const today = new Date().toDateString();
    const lastResetDate = localStorage.getItem(DATE_KEY);
    if (lastResetDate !== today) {
        localStorage.setItem(STORAGE_KEY, MAX_SEARCHES.toString());
        localStorage.setItem(DATE_KEY, today);
    }
    updateSearchCounterDisplay();
}

function updateSearchCounterDisplay() {
    const remaining = getSearchesRemaining();
    const el = document.getElementById('searches-remaining');
    if (el) {
        el.innerHTML = remaining === 0 
            ? `<span style="color: #ef4444;">0 / ${MAX_SEARCHES} - <a href="index.html#pricing" style="color: var(--primary);">Upgrade</a></span>`
            : `${remaining} / ${MAX_SEARCHES} available`;
    }
}

function getSearchesRemaining() { return parseInt(localStorage.getItem(STORAGE_KEY) || MAX_SEARCHES); }
function hasSearchesRemaining() { return getSearchesRemaining() > 0; }
function decrementSearchCounter() {
    const remaining = getSearchesRemaining();
    if (remaining > 0) { localStorage.setItem(STORAGE_KEY, (remaining - 1).toString()); updateSearchCounterDisplay(); return true; }
    return false;
}

// ALWAYS opens modal - doesn't check search count here
function openPlatformModal(platform) {
    const modal = document.getElementById('platform-modal');
    const modalBody = document.getElementById('modal-body');
    const data = platformData[platform];
    if (!data) return;

    if (!data.live) {
        modalBody.innerHTML = `
            <div class="modal-coming-soon">
                <div class="coming-soon-icon">${data.icon}</div>
                <h2>${data.name}</h2>
                <p class="coming-soon-text">Coming Soon!</p>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${data.description}</p>
                <div class="coming-soon-checks"><h4>What We'll Check:</h4><ul>${data.checks.map(c => `<li>✓ ${c}</li>`).join('')}</ul></div>
                <p style="color: var(--text-muted); font-size: 0.875rem; margin: 1.5rem 0;">Currently live: Twitter/X, Reddit, and Email</p>
                <a href="index.html#pricing" class="btn-modal-cta">Get Notified When Live</a>
            </div>`;
        modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; return;
    }

    const remaining = getSearchesRemaining();
    const searchNote = remaining > 0 ? `${remaining} free check${remaining !== 1 ? 's' : ''} remaining today` : `<span style="color: #f59e0b;">0 checks remaining - submit to see upgrade options</span>`;

    modalBody.innerHTML = `
        <div class="modal-header-custom"><span class="modal-icon">${data.icon}</span><div><h2>${data.name} Check</h2><span class="badge live">Live</span></div></div>
        <p class="modal-description">${data.description}</p>
        <div class="modal-checks"><h4>What We Check:</h4><ul>${data.checks.map(c => `<li>✓ ${c}</li>`).join('')}</ul></div>
        <form id="check-form" class="modal-form">
            <input type="hidden" name="platform" value="${platform}">
            <div class="form-group">
                <label for="username-input">${platform === 'email' ? 'Email Address' : 'Username'}</label>
                <input type="${platform === 'email' ? 'email' : 'text'}" id="username-input" name="username" placeholder="${data.placeholder}" required class="form-input" autocomplete="off">
            </div>
            <button type="submit" class="btn-check" id="submit-btn"><span class="btn-text">Check for Shadow Ban</span><span class="btn-icon">🔍</span></button>
            <p class="modal-note">${searchNote}</p>
        </form>`;
    
    modal.classList.remove('hidden'); document.body.style.overflow = 'hidden';
    document.getElementById('check-form').addEventListener('submit', handleFormSubmit);
    setTimeout(() => { document.getElementById('username-input')?.focus(); }, 100);
}

function showUpgradeModal() {
    document.getElementById('modal-body').innerHTML = `
        <div class="modal-upgrade">
            <div class="upgrade-icon">🎯</div>
            <h2>You've Used All Free Searches</h2>
            <p>You've used your 3 free checks for today. Upgrade for unlimited access!</p>
            <div class="upgrade-benefits"><div class="benefit">✓ Unlimited daily checks</div><div class="benefit">✓ All 26 platforms</div><div class="benefit">✓ Real-time monitoring</div><div class="benefit">✓ Email & text alerts</div></div>
            <a href="index.html#pricing" class="btn-upgrade-modal">View Plans - From $4.99/mo</a>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 1rem;">Your free searches reset tomorrow at midnight</p>
            <button class="btn-close-upgrade" onclick="closePlatformModal()">Maybe Later</button>
        </div>`;
}

function closePlatformModal() { document.getElementById('platform-modal').classList.add('hidden'); document.body.style.overflow = ''; }

// Check searches HERE on submit, not on click
function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const platform = formData.get('platform');
    const username = formData.get('username');

    if (!hasSearchesRemaining()) { showUpgradeModal(); return; }
    decrementSearchCounter();

    const data = platformData[platform];
    const probability = Math.floor(Math.random() * 30) + 10;
    const resultsData = {
        platform, platformName: data?.name || platform, platformIcon: data?.icon || '🔍', username,
        timestamp: new Date().toISOString(), probability, status: probability > 25 ? 'issues' : 'clean',
        checks: { visibility: Math.random() > 0.3 ? 'pass' : 'warning', engagement: Math.random() > 0.3 ? 'pass' : 'warning', searchability: Math.random() > 0.3 ? 'pass' : 'warning', reach: Math.random() > 0.3 ? 'pass' : 'warning' }
    };
    localStorage.setItem('checkResults', JSON.stringify(resultsData));

    const btn = document.getElementById('submit-btn');
    btn.innerHTML = '<span class="btn-text">Analyzing...</span><span class="btn-icon">⏳</span>'; btn.disabled = true;
    setTimeout(() => { window.location.href = 'results.html'; }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
    initSearchCounter();
    document.querySelectorAll('.platform-item.clickable').forEach(item => { item.addEventListener('click', () => { openPlatformModal(item.getAttribute('data-platform')); }); });
    document.querySelector('.modal-close')?.addEventListener('click', closePlatformModal);
    document.getElementById('platform-modal')?.addEventListener('click', (e) => { if (e.target.id === 'platform-modal') closePlatformModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePlatformModal(); });
    
    const urlParams = new URLSearchParams(window.location.search);
    const platformParam = urlParams.get('platform');
    if (platformParam && platformData[platformParam]) { setTimeout(() => { openPlatformModal(platformParam); }, 300); }
});
