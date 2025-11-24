// =============================================================================
// ShadowBanCheck.io - Checker Page JavaScript
// =============================================================================

console.log('🔍 Checker.js loaded');

const MAX_SEARCHES = 3;
const STORAGE_KEY = 'shadowban_searches_remaining';
const DATE_KEY = 'shadowban_last_reset_date';

const platformData = {
    twitter: { name: 'Twitter / X', icon: '🐦', placeholder: '@username or post URL', description: 'Check if your Twitter/X account is shadow banned', checks: ['Search visibility', 'Reply threading', 'Profile discovery', 'Engagement reach'], live: true },
    reddit: { name: 'Reddit', icon: '🤖', placeholder: 'u/username or post URL', description: 'Check if your Reddit account is shadow banned', checks: ['Post visibility', 'Comment appearance', 'Profile access', 'Subreddit status'], live: true },
    email: { name: 'Email', icon: '📧', placeholder: 'your@email.com or domain', description: 'Check if your email domain is blacklisted', checks: ['Spam blacklists', 'Domain reputation', 'SPF/DKIM records', 'Deliverability score'], live: true },
    instagram: { name: 'Instagram', icon: '📸', placeholder: '@username or post URL', description: 'Instagram shadow ban detection coming soon!', checks: ['Post visibility', 'Hashtag reach', 'Story views', 'Explore page'], live: false },
    tiktok: { name: 'TikTok', icon: '🎵', placeholder: '@username or post URL', description: 'TikTok shadow ban detection coming soon!', checks: ['For You Page (FYP) visibility', 'Searchability', 'Comment filtering', 'Content review'], live: false },
    // Add more platforms as needed
};

// ===========================================================================
// SEARCH COUNTER LOGIC
// ===========================================================================

function loadSearchCounter() {
    const today = new Date().toDateString();
    let remaining = localStorage.getItem(STORAGE_KEY);
    let lastResetDate = localStorage.getItem(DATE_KEY);

    if (lastResetDate !== today) {
        // New day: reset counter
        remaining = MAX_SEARCHES;
        localStorage.setItem(STORAGE_KEY, MAX_SEARCHES);
        localStorage.setItem(DATE_KEY, today);
    } else if (remaining === null) {
        // First load: initialize
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
    const submitBtn = document.getElementById('submit-btn');
    const upgradeCta = document.getElementById('upgrade-cta-section');

    if (counterText) {
        counterText.textContent = remaining;
    }

    // Handle UI visibility and button state
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
            submitBtn.innerHTML = '<span class="btn-text">Check Now</span><span class="btn-icon">🚀</span>';
        }
        upgradeCta?.classList.add('hidden');
    }
}

function initSearchCounter() {
    updateSearchCounterDisplay();

    // Attach event listener to the form to handle counter update on success
    const form = document.getElementById('platform-checker-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            // Prevent default submission to handle everything in JavaScript
            e.preventDefault(); 
            
            // Check counter before submission
            if (loadSearchCounter() > 0) {
                // If we submit the form successfully, the counter will be decremented in handlePostCheck
            } else {
                // Should be disabled, but a final check
                alert('You have reached your free search limit for today. Please wait until tomorrow or get Shadow AI Pro!');
                return;
            }
            
            handlePostCheck(form);
        });
    }
}

// ===========================================================================
// PLATFORM MODAL AND SELECTION
// ===========================================================================

const platformModal = document.getElementById('platform-modal');
const modalBody = document.getElementById('modal-body');
const formInput = document.getElementById('content-input');
const formPlaceholder = document.getElementById('content-input-placeholder');
const platformDisplay = document.getElementById('platform-display');
let selectedPlatform = 'twitter'; // Default selection

function openPlatformModal(platform) {
    const data = platformData[platform];
    if (!data) return;

    // Save the platform for the form
    selectedPlatform = platform;
    platformDisplay.innerHTML = `<span class="platform-icon-small">${data.icon}</span> ${data.name}`;
    formInput.placeholder = data.placeholder;
    formPlaceholder.textContent = data.description;
    
    // Auto-select the radio button (visual feedback)
    const radio = document.getElementById('platform-' + platform);
    if (radio) radio.checked = true;

    // Scroll to the form
    document.getElementById('platform-checker-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closePlatformModal() {
    platformModal?.classList.add('hidden');
}

function initCheckerPageModals() {
    // 1. Set up platform selection click handlers
    document.querySelectorAll('.platform-item.clickable').forEach(item => {
        item.addEventListener('click', () => {
            const platform = item.getAttribute('data-platform');
            if (platformData[platform]?.live) {
                 openPlatformModal(platform);
            } else {
                // Show 'coming soon' modal for non-live platforms
                const data = platformData[platform];
                modalBody.innerHTML = `
                    <div class="modal-header">
                        <span class="platform-icon-large">${data.icon}</span>
                        <h2>${data.name} Checker: Coming Soon!</h2>
                    </div>
                    <p>We are currently integrating our advanced ${data.name} algorithms. We expect this checker to go live within 2-4 weeks.</p>
                    <p>In the meantime, check out our **Free Twitter/X & Reddit Checkers!**</p>
                    <a href="checker.html" class="btn-primary" style="margin-top: 1rem;">Go to Live Checkers</a>
                `;
                platformModal?.classList.remove('hidden');
            }
        });
    });

    // 2. Set up modal closing listeners
    document.querySelector('.modal-close')?.addEventListener('click', closePlatformModal);
    platformModal?.addEventListener('click', (e) => { 
        if (e.target.id === 'platform-modal') closePlatformModal(); 
    });
    document.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape') closePlatformModal(); 
    });

    // 3. Handle URL parameter selection on load
    const urlParams = new URLSearchParams(window.location.search);
    const platformParam = urlParams.get('platform');
    if (platformParam && platformData[platformParam]?.live) {
        openPlatformModal(platformParam);
    } else {
        // If no parameter, or parameter is invalid, open the default (twitter)
        openPlatformModal('twitter');
    }
}

// ===========================================================================
// POST CHECK LOGIC
// ===========================================================================

function handlePostCheck(form) {
    const input = form.querySelector('#content-input').value.trim();
    if (!input) {
        alert('Please enter a username, URL, or email.');
        return;
    }

    const remaining = loadSearchCounter();
    if (remaining <= 0) {
         // This check should be redundant if the button is disabled, but is a final failsafe
        alert('Daily limit reached. Get Shadow AI Pro for unlimited checks!');
        return;
    }

    // 1. Simulate API call
    const btn = document.getElementById('submit-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span class="btn-text">Analyzing...</span><span class="btn-icon">⏳</span>'; 
    btn.disabled = true;

    // 2. Generate Simulated Results Data
    // Generates a random probability between 5% and 95%
    const probability = Math.floor(Math.random() * 90) + 5; 
    
    // Simulate check results
    const resultsData = {
        platformName: platformData[selectedPlatform].name,
        platformIcon: platformData[selectedPlatform].icon,
        username: input, // Storing the user's input for the results page
        timestamp: new Date().toISOString(),
        probability: probability,
        status: probability > 25 ? 'issues' : 'clean', // 25% is the threshold for 'issues'
        checks: { 
            visibility: Math.random() > (probability / 100) ? 'pass' : 'warning',
            engagement: Math.random() > (probability / 100) ? 'pass' : 'warning',
            searchability: Math.random() > (probability / 100) ? 'pass' : 'warning',
            reach: Math.random() > (probability / 100) ? 'pass' : 'warning'
        }
    };
    
    // 3. Save to localStorage
    localStorage.setItem('checkResults', JSON.stringify(resultsData));

    // 4. Decrement the counter
    decrementSearchCounter();

    // 5. Redirect after a small delay to show 'Analyzing...' state
    setTimeout(() => { 
        window.location.href = 'results.html'; 
    }, 1500);
}

// Global function alias for main.js to call
function initPostChecker() {
    // The main checker logic is attached to the form inside initSearchCounter()
    // but the platform selection and modals need to be initialized too
    initCheckerPageModals();
}

// No need for a separate DOMContentLoaded block here, as main.js handles the loading.
