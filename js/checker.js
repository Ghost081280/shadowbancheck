// Checker Page JavaScript
console.log('🔍 Checker.js loaded');

// Search counter management
const MAX_SEARCHES = 3;
const STORAGE_KEY = 'shadowban_searches_remaining';
const DATE_KEY = 'shadowban_last_reset_date';

// Initialize or reset search counter
function initSearchCounter() {
    const today = new Date().toDateString();
    const lastResetDate = localStorage.getItem(DATE_KEY);
    
    // Reset counter if it's a new day
    if (lastResetDate !== today) {
        localStorage.setItem(STORAGE_KEY, MAX_SEARCHES.toString());
        localStorage.setItem(DATE_KEY, today);
    }
    
    updateSearchCounterDisplay();
}

// Update the search counter display
function updateSearchCounterDisplay() {
    const remaining = parseInt(localStorage.getItem(STORAGE_KEY) || MAX_SEARCHES);
    const counterElement = document.getElementById('searches-remaining');
    
    if (counterElement) {
        counterElement.textContent = `${remaining} / ${MAX_SEARCHES} searches available today`;
        
        if (remaining === 0) {
            counterElement.innerHTML = `<span style="color: #ef4444;">No searches remaining today.</span> <a href="index.html#pricing" style="color: var(--primary); text-decoration: underline;">Upgrade for unlimited</a>`;
        }
    }
}

// Decrease search counter
function decrementSearchCounter() {
    const remaining = parseInt(localStorage.getItem(STORAGE_KEY) || MAX_SEARCHES);
    
    if (remaining > 0) {
        localStorage.setItem(STORAGE_KEY, (remaining - 1).toString());
        updateSearchCounterDisplay();
        return true;
    }
    
    return false;
}

// Check if user has searches remaining
function hasSearchesRemaining() {
    const remaining = parseInt(localStorage.getItem(STORAGE_KEY) || MAX_SEARCHES);
    return remaining > 0;
}

// Platform modal functionality
const platformData = {
    twitter: {
        name: 'Twitter / X',
        icon: '🐦',
        placeholder: '@username',
        description: 'Check if your Twitter/X account is shadow banned',
        fields: ['username']
    },
    reddit: {
        name: 'Reddit',
        icon: '🤖',
        placeholder: 'u/username',
        description: 'Check if your Reddit account is shadow banned',
        fields: ['username']
    },
    email: {
        name: 'Email',
        icon: '📧',
        placeholder: 'your@email.com',
        description: 'Check if your email is blacklisted',
        fields: ['email']
    },
    instagram: {
        name: 'Instagram',
        icon: '📸',
        placeholder: '@username',
        description: 'Instagram checks coming soon!',
        fields: ['username'],
        disabled: true
    }
};

// Open platform modal
function openPlatformModal(platform) {
    console.log('🔓 Opening modal for:', platform);
    
    const modal = document.getElementById('platform-modal');
    const modalBody = document.getElementById('modal-body');
    const data = platformData[platform] || platformData.twitter;
    
    if (data.disabled) {
        alert(`${data.name} checks are coming soon! Currently live: Twitter/X, Reddit, and Email.`);
        return;
    }
    
    // Check if user has searches remaining
    if (!hasSearchesRemaining()) {
        if (confirm('You\'ve used all your free searches today. Would you like to upgrade for unlimited checks?')) {
            window.location.href = 'index.html#pricing';
        }
        return;
    }
    
    // Create modal content
    modalBody.innerHTML = `
        <div class="modal-header-custom">
            <span class="modal-icon">${data.icon}</span>
            <h2>${data.name} Check</h2>
        </div>
        <p class="modal-description">${data.description}</p>
        
        <form id="check-form" class="modal-form">
            <input type="hidden" name="platform" value="${platform}">
            
            <div class="form-group">
                <label for="username-input">
                    ${platform === 'email' ? 'Email Address' : 'Username'}
                </label>
                <input 
                    type="text" 
                    id="username-input" 
                    name="username" 
                    placeholder="${data.placeholder}" 
                    required
                    class="form-input"
                >
            </div>
            
            <button type="submit" class="btn-check">
                <span>Check for Shadow Ban</span>
                <span>→</span>
            </button>
        </form>
    `;
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Handle form submission
    const form = document.getElementById('check-form');
    form.addEventListener('submit', handleFormSubmit);
    
    // Focus input
    setTimeout(() => {
        document.getElementById('username-input')?.focus();
    }, 100);
}

// Close modal
function closePlatformModal() {
    console.log('🔒 Closing modal');
    const modal = document.getElementById('platform-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('📝 Form submitted');
    
    const formData = new FormData(e.target);
    const platform = formData.get('platform');
    const username = formData.get('username');
    
    // Decrement search counter
    if (!decrementSearchCounter()) {
        alert('You\'ve used all your free searches today. Please upgrade for unlimited checks.');
        window.location.href = 'index.html#pricing';
        return;
    }
    
    // Prepare results data
    const resultsData = {
        platform: platform,
        username: username,
        timestamp: new Date().toISOString(),
        // Mock data for demonstration
        status: 'clear',
        probability: Math.floor(Math.random() * 30) + 10, // 10-40% (low probability)
        checks: {
            visibility: Math.random() > 0.3 ? 'pass' : 'warning',
            engagement: Math.random() > 0.3 ? 'pass' : 'warning',
            searchability: Math.random() > 0.3 ? 'pass' : 'warning',
            reach: Math.random() > 0.3 ? 'pass' : 'warning'
        }
    };
    
    // Store results in localStorage
    localStorage.setItem('checkResults', JSON.stringify(resultsData));
    
    // Show loading state
    const submitBtn = e.target.querySelector('.btn-check');
    submitBtn.innerHTML = '<span>Analyzing...</span><span>⏳</span>';
    submitBtn.disabled = true;
    
    // Redirect to results page after short delay
    setTimeout(() => {
        window.location.href = 'results.html';
    }, 1500);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Checker page initialized');
    
    // Initialize search counter
    initSearchCounter();
    
    // Add click handlers to platform items
    const platformItems = document.querySelectorAll('.platform-item.clickable');
    platformItems.forEach(item => {
        item.addEventListener('click', () => {
            const platform = item.getAttribute('data-platform');
            const isLive = item.querySelector('.badge.live');
            
            if (isLive) {
                openPlatformModal(platform);
            } else {
                alert('This platform is coming soon! Currently live: Twitter/X, Reddit, and Email.');
            }
        });
    });
    
    // Close modal when clicking close button
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePlatformModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('platform-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closePlatformModal();
            }
        });
    }
    
    // Check if URL has platform parameter (from index page)
    const urlParams = new URLSearchParams(window.location.search);
    const platformParam = urlParams.get('platform');
    
    if (platformParam) {
        console.log('🔗 Auto-opening platform from URL:', platformParam);
        setTimeout(() => {
            openPlatformModal(platformParam);
        }, 500);
    }
});
