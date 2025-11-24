/* =============================================================================
   CHECKER.JS - Shadow Ban Checker Page Functionality
   ============================================================================= */

/* =============================================================================
   FORM HANDLING
   ============================================================================= */
function initCheckerForm() {
    const postUrlInput = document.getElementById('post-url-input');
    const checkPostBtn = document.getElementById('check-post-btn');
    
    if (!postUrlInput || !checkPostBtn) return;
    
    // Form submission
    checkPostBtn.addEventListener('click', handlePostCheck);
    
    // Enter key submission
    postUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handlePostCheck();
        }
    });
    
    // Input validation
    postUrlInput.addEventListener('input', function() {
        const isValid = validateUrl(this.value);
        checkPostBtn.disabled = !isValid && this.value.length > 0;
    });
}

function validateUrl(url) {
    if (!url) return false;
    
    // Basic URL pattern check
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlPattern.test(url)) return false;
    
    // Check for supported platforms
    const supportedDomains = [
        'instagram.com', 'tiktok.com', 'twitter.com', 'x.com',
        'facebook.com', 'fb.com', 'linkedin.com', 'youtube.com',
        'youtu.be', 'pinterest.com', 'reddit.com', 'threads.net'
    ];
    
    const urlLower = url.toLowerCase();
    return supportedDomains.some(domain => urlLower.includes(domain));
}

function handlePostCheck() {
    const postUrlInput = document.getElementById('post-url-input');
    const url = postUrlInput?.value.trim();
    
    if (!url) {
        showError('Please enter a post URL');
        return;
    }
    
    if (!validateUrl(url)) {
        showError('Please enter a valid URL from a supported platform');
        return;
    }
    
    // Check remaining searches
    const remaining = window.ShadowBan?.getRemainingSearches() || 0;
    if (remaining <= 0) {
        showUpgradeModal();
        return;
    }
    
    // Increment search count
    window.ShadowBan?.incrementSearchCount();
    
    // Detect platform
    const platform = detectPlatform(url);
    
    // Run check
    runShadowBanCheck(url, platform);
}

function detectPlatform(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('instagram.com')) return 'Instagram';
    if (urlLower.includes('tiktok.com')) return 'TikTok';
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'Twitter/X';
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) return 'Facebook';
    if (urlLower.includes('linkedin.com')) return 'LinkedIn';
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'YouTube';
    if (urlLower.includes('pinterest.com')) return 'Pinterest';
    if (urlLower.includes('reddit.com')) return 'Reddit';
    if (urlLower.includes('threads.net')) return 'Threads';
    
    return 'Unknown';
}

/* =============================================================================
   SHADOW BAN CHECK SIMULATION
   ============================================================================= */
function runShadowBanCheck(url, platform) {
    // Show loading state
    showCheckingState(platform);
    
    // Simulate API call with random results
    setTimeout(() => {
        const results = generateMockResults(platform);
        
        // Store results in sessionStorage
        sessionStorage.setItem('shadowban_results', JSON.stringify({
            url,
            platform,
            results,
            timestamp: Date.now()
        }));
        
        // Redirect to results page
        window.location.href = 'results.html';
    }, 2500);
}

function generateMockResults(platform) {
    // Generate semi-random results for demo
    const random = Math.random();
    
    let status, probability;
    
    if (random < 0.6) {
        status = 'clean';
        probability = Math.floor(Math.random() * 15) + 85; // 85-100
    } else if (random < 0.85) {
        status = 'issues';
        probability = Math.floor(Math.random() * 30) + 50; // 50-80
    } else {
        status = 'restricted';
        probability = Math.floor(Math.random() * 40) + 10; // 10-50
    }
    
    return {
        platform,
        status,
        probability,
        checks: [
            {
                name: 'Search Visibility',
                status: random < 0.7 ? 'passed' : (random < 0.9 ? 'warning' : 'failed'),
                description: random < 0.7 
                    ? 'Your content appears normally in search results'
                    : 'Some content may have reduced search visibility'
            },
            {
                name: 'Hashtag Reach',
                status: random < 0.65 ? 'passed' : (random < 0.85 ? 'warning' : 'failed'),
                description: random < 0.65 
                    ? 'Hashtags are working correctly'
                    : 'Some hashtags may be suppressed'
            },
            {
                name: 'Explore/FYP',
                status: random < 0.6 ? 'passed' : (random < 0.9 ? 'warning' : 'failed'),
                description: random < 0.6 
                    ? 'Content eligible for recommendations'
                    : 'Limited recommendation distribution detected'
            },
            {
                name: 'Account Standing',
                status: random < 0.8 ? 'passed' : 'warning',
                description: random < 0.8 
                    ? 'No violations or strikes detected'
                    : 'Minor policy notices on file'
            },
            {
                name: 'Engagement Rate',
                status: random < 0.7 ? 'passed' : (random < 0.9 ? 'warning' : 'failed'),
                description: random < 0.7 
                    ? 'Engagement metrics are healthy'
                    : 'Lower than expected engagement detected'
            },
            {
                name: 'Follower Visibility',
                status: random < 0.75 ? 'passed' : 'warning',
                description: random < 0.75 
                    ? 'Your followers can see all your content'
                    : 'Some content may not reach all followers'
            }
        ],
        recommendations: generateRecommendations(status)
    };
}

function generateRecommendations(status) {
    const recommendations = [];
    
    if (status === 'clean') {
        recommendations.push({
            type: 'success',
            title: '✅ Keep up the good work!',
            text: 'Your account is performing well. Continue following platform guidelines.'
        });
        recommendations.push({
            type: 'info',
            title: '💡 Pro tip',
            text: 'Consider setting up monitoring alerts to catch any issues early.'
        });
    } else if (status === 'issues') {
        recommendations.push({
            type: 'warning',
            title: '⚠️ Review your recent posts',
            text: 'Check if any recent content might be triggering filters.'
        });
        recommendations.push({
            type: 'warning',
            title: '🔍 Audit your hashtags',
            text: 'Some hashtags may be restricted. Use our Hashtag Checker to verify.'
        });
        recommendations.push({
            type: 'info',
            title: '📊 Monitor engagement',
            text: 'Track your metrics over the next 48 hours for changes.'
        });
    } else {
        recommendations.push({
            type: 'danger',
            title: '🚨 Take immediate action',
            text: 'Review and remove any content that may violate guidelines.'
        });
        recommendations.push({
            type: 'warning',
            title: '📝 Appeal if needed',
            text: 'If you believe this is an error, submit an appeal through the platform.'
        });
        recommendations.push({
            type: 'info',
            title: '⏰ Wait period',
            text: 'Most restrictions lift within 14-28 days if no further violations occur.'
        });
    }
    
    return recommendations;
}

/* =============================================================================
   UI HELPERS
   ============================================================================= */
function showCheckingState(platform) {
    const modal = document.getElementById('platform-modal');
    if (!modal) {
        // Create simple loading overlay
        const overlay = document.createElement('div');
        overlay.id = 'checking-overlay';
        overlay.className = 'checking-overlay';
        overlay.innerHTML = `
            <div class="checking-content">
                <div class="checking-spinner"></div>
                <h3>Checking ${platform}...</h3>
                <p>Analyzing visibility, reach, and account standing</p>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Add styles if not already present
        if (!document.getElementById('checking-styles')) {
            const styles = document.createElement('style');
            styles.id = 'checking-styles';
            styles.textContent = `
                .checking-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(10, 15, 26, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s ease;
                }
                .checking-content {
                    text-align: center;
                    padding: 2rem;
                }
                .checking-spinner {
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(99, 102, 241, 0.2);
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1.5rem;
                }
                .checking-content h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                .checking-content p {
                    color: #94a3b8;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styles);
        }
    } else {
        // Use existing modal
        modal.classList.add('active');
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="checking-content">
                    <div class="checking-spinner"></div>
                    <h3>Checking ${platform}...</h3>
                    <p>Analyzing visibility, reach, and account standing</p>
                </div>
            `;
        }
    }
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
    const modal = document.getElementById('platform-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    const modalContent = modal.querySelector('.modal-content');
    
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="upgrade-modal-content">
                <span class="upgrade-icon">🔒</span>
                <h3>Daily Limit Reached</h3>
                <p>You've used all your free checks for today. Upgrade for unlimited access!</p>
                <div class="upgrade-options">
                    <a href="index.html#pricing" class="btn btn-primary">View Plans - From $4.99/mo</a>
                    <button class="btn btn-secondary" onclick="document.getElementById('platform-modal').classList.remove('active')">Maybe Later</button>
                </div>
            </div>
        `;
    }
    
    // Close handlers
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    function closeModal() {
        modal.classList.remove('active');
    }
    
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
}

/* =============================================================================
   PLATFORM GRID CLICK HANDLERS (Override for checker page)
   ============================================================================= */
function initCheckerPlatformGrid() {
    const platformGrid = document.getElementById('platform-grid');
    if (!platformGrid) return;
    
    // Platform items click - show check form
    platformGrid.addEventListener('click', function(e) {
        const item = e.target.closest('.platform-item');
        if (!item) return;
        
        const status = item.dataset.status;
        const platformName = item.querySelector('.platform-name')?.textContent;
        
        if (status === 'soon') {
            window.ShadowBan?.showComingSoonToast(platformName);
            return;
        }
        
        // Show platform-specific modal
        showPlatformCheckModal(platformName, item.querySelector('.platform-icon')?.textContent);
    });
}

function showPlatformCheckModal(platformName, icon) {
    const modal = document.getElementById('platform-modal');
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="modal-platform-check">
                <span class="modal-platform-icon">${icon || '🔍'}</span>
                <h3>Check ${platformName}</h3>
                <p>Enter your ${platformName} profile URL or username to check for shadow bans</p>
                <div class="modal-input-group">
                    <input type="text" id="modal-url-input" placeholder="Paste profile URL or @username...">
                </div>
                <button id="modal-check-btn" class="btn btn-primary btn-full">Check Now</button>
                <p class="modal-note">We'll analyze visibility, reach, and account standing</p>
            </div>
        `;
        
        // Handle check button
        const checkBtn = modalContent.querySelector('#modal-check-btn');
        const urlInput = modalContent.querySelector('#modal-url-input');
        
        checkBtn?.addEventListener('click', function() {
            const value = urlInput?.value.trim();
            if (!value) {
                showError('Please enter a URL or username');
                return;
            }
            
            // Check remaining searches
            const remaining = window.ShadowBan?.getRemainingSearches() || 0;
            if (remaining <= 0) {
                modal.classList.remove('active');
                showUpgradeModal();
                return;
            }
            
            // Increment and run check
            window.ShadowBan?.incrementSearchCount();
            modal.classList.remove('active');
            document.body.style.overflow = '';
            runShadowBanCheck(value, platformName);
        });
        
        // Enter key
        urlInput?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkBtn?.click();
            }
        });
        
        // Focus input
        setTimeout(() => urlInput?.focus(), 100);
    }
    
    // Close handlers
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
}

/* =============================================================================
   INITIALIZE
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    initCheckerForm();
    initCheckerPlatformGrid();
    
    console.log('✅ Checker page initialized');
});
