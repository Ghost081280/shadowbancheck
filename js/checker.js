/* =============================================================================
   CHECKER.JS - Shadow Ban Checker Page Functionality
   ============================================================================= */

/* =============================================================================
   PLATFORM GRID - BUILD FROM SHARED DATA
   ============================================================================= */
function buildPlatformGrid() {
    const grid = document.getElementById('platform-grid');
    if (!grid || !window.platformData) return;
    
    const platforms = window.platformData;
    
    platforms.forEach(platform => {
        const item = document.createElement('div');
        item.className = 'platform-item';
        item.dataset.platform = platform.name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');
        item.dataset.status = platform.status;
        
        const badgeClass = platform.status === 'live' ? 'badge-live' : 'badge-soon';
        const badgeText = platform.status === 'live' ? 'Live' : 'Soon';
        
        item.innerHTML = `
            <span class="platform-icon">${platform.icon}</span>
            <span class="platform-name">${platform.name}</span>
            <span class="badge ${badgeClass}">${badgeText}</span>
        `;
        
        grid.appendChild(item);
    });
}

/* =============================================================================
   SEARCH COUNTER
   ============================================================================= */
const STORAGE_KEY = 'shadowban_searches';
const MAX_FREE_SEARCHES = 3;

function getRemainingSearches() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const today = new Date().toDateString();
    
    if (data.date !== today) {
        // Reset for new day
        return MAX_FREE_SEARCHES;
    }
    
    return Math.max(0, MAX_FREE_SEARCHES - (data.count || 0));
}

function incrementSearchCount() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const today = new Date().toDateString();
    
    if (data.date !== today) {
        // New day
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            date: today,
            count: 1
        }));
    } else {
        // Increment
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            date: today,
            count: (data.count || 0) + 1
        }));
    }
    
    updateSearchCounter();
}

function updateSearchCounter() {
    const remaining = getRemainingSearches();
    const counterEl = document.getElementById('searches-remaining');
    if (counterEl) {
        counterEl.textContent = `${remaining}/${MAX_FREE_SEARCHES}`;
    }
}

/* =============================================================================
   PLATFORM MODAL SYSTEM
   ============================================================================= */
function showPlatformModal(platformKey) {
    const platform = window.platformData?.find(p => 
        p.name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-') === platformKey
    );
    
    if (!platform) return;
    
    if (platform.status !== 'live') {
        showComingSoonModal(platform.name, platform.icon);
        return;
    }
    
    // Show appropriate modal based on platform
    if (platform.name === 'Twitter/X') {
        showTwitterModal();
    } else if (platform.name === 'Reddit') {
        showRedditModal();
    } else if (platform.name === 'Email') {
        showEmailModal();
    }
}

function showTwitterModal() {
    const modal = document.getElementById('platform-modal');
    if (!modal) return;
    
    const modalBody = modal.querySelector('#modal-body');
    modalBody.innerHTML = `
        <div class="modal-platform-check">
            <span class="modal-platform-icon">🐦</span>
            <h3>Check Twitter / X Account</h3>
            <p>Enter your Twitter/X username to check for shadow bans</p>
            
            <div class="modal-checks-preview">
                <h4>What we'll check:</h4>
                <ul>
                    <li>✓ Search visibility status</li>
                    <li>✓ Reply deboosting (QFD)</li>
                    <li>✓ Hashtag reach analysis</li>
                    <li>✓ Profile accessibility</li>
                    <li>✓ Engagement rate patterns</li>
                </ul>
            </div>
            
            <div class="modal-input-group">
                <input type="text" id="modal-username-input" placeholder="Enter @username or username..." />
            </div>
            
            <button class="btn btn-primary btn-full" id="modal-check-btn">
                Check Account →
            </button>
            
            <p class="modal-note">Analysis uses Twitter/X API v2 + third-party detection APIs</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Focus input
    setTimeout(() => {
        document.getElementById('modal-username-input')?.focus();
    }, 100);
    
    // Handle form submission
    const checkBtn = document.getElementById('modal-check-btn');
    const usernameInput = document.getElementById('modal-username-input');
    
    const handleCheck = () => {
        const username = usernameInput?.value.trim().replace('@', '');
        if (!username) {
            alert('Please enter a username');
            return;
        }
        
        if (getRemainingSearches() <= 0) {
            modal.classList.add('hidden');
            showUpgradeModal();
            return;
        }
        
        incrementSearchCount();
        runCheck('Twitter/X', username);
    };
    
    checkBtn?.addEventListener('click', handleCheck);
    usernameInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleCheck();
    });
    
    setupModalCloseHandlers(modal);
}

function showRedditModal() {
    const modal = document.getElementById('platform-modal');
    if (!modal) return;
    
    const modalBody = modal.querySelector('#modal-body');
    modalBody.innerHTML = `
        <div class="modal-platform-check">
            <span class="modal-platform-icon">🤖</span>
            <h3>Check Reddit Account</h3>
            <p>Enter your Reddit username to check for shadow bans</p>
            
            <div class="modal-checks-preview">
                <h4>What we'll check:</h4>
                <ul>
                    <li>✓ Site-wide shadowban status</li>
                    <li>✓ Subreddit-specific bans</li>
                    <li>✓ AutoModerator filters</li>
                    <li>✓ Post/comment visibility</li>
                    <li>✓ Karma restrictions</li>
                </ul>
            </div>
            
            <div class="modal-input-group">
                <input type="text" id="modal-username-input" placeholder="Enter u/username or username..." />
            </div>
            
            <button class="btn btn-primary btn-full" id="modal-check-btn">
                Check Account →
            </button>
            
            <p class="modal-note">Analysis uses Reddit API + shadowban detection services</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        document.getElementById('modal-username-input')?.focus();
    }, 100);
    
    const checkBtn = document.getElementById('modal-check-btn');
    const usernameInput = document.getElementById('modal-username-input');
    
    const handleCheck = () => {
        const username = usernameInput?.value.trim().replace('u/', '');
        if (!username) {
            alert('Please enter a username');
            return;
        }
        
        if (getRemainingSearches() <= 0) {
            modal.classList.add('hidden');
            showUpgradeModal();
            return;
        }
        
        incrementSearchCount();
        runCheck('Reddit', username);
    };
    
    checkBtn?.addEventListener('click', handleCheck);
    usernameInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleCheck();
    });
    
    setupModalCloseHandlers(modal);
}

function showEmailModal() {
    const modal = document.getElementById('platform-modal');
    if (!modal) return;
    
    const modalBody = modal.querySelector('#modal-body');
    modalBody.innerHTML = `
        <div class="modal-platform-check">
            <span class="modal-platform-icon">📧</span>
            <h3>Check Email Deliverability</h3>
            <p>Enter your email address or domain to check for blacklisting</p>
            
            <div class="modal-checks-preview">
                <h4>What we'll check:</h4>
                <ul>
                    <li>✓ Spamhaus blacklist status</li>
                    <li>✓ SURBL database check</li>
                    <li>✓ IP reputation score</li>
                    <li>✓ DKIM/SPF/DMARC setup</li>
                    <li>✓ Deliverability probability</li>
                </ul>
            </div>
            
            <div class="modal-input-group">
                <input type="email" id="modal-email-input" placeholder="Enter email@domain.com or domain.com..." />
            </div>
            
            <button class="btn btn-primary btn-full" id="modal-check-btn">
                Check Deliverability →
            </button>
            
            <p class="modal-note">Analysis uses RBL services + reputation databases</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        document.getElementById('modal-email-input')?.focus();
    }, 100);
    
    const checkBtn = document.getElementById('modal-check-btn');
    const emailInput = document.getElementById('modal-email-input');
    
    const handleCheck = () => {
        const email = emailInput?.value.trim();
        if (!email) {
            alert('Please enter an email or domain');
            return;
        }
        
        if (getRemainingSearches() <= 0) {
            modal.classList.add('hidden');
            showUpgradeModal();
            return;
        }
        
        incrementSearchCount();
        runCheck('Email', email);
    };
    
    checkBtn?.addEventListener('click', handleCheck);
    emailInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleCheck();
    });
    
    setupModalCloseHandlers(modal);
}

function showComingSoonModal(platformName, icon) {
    const modal = document.getElementById('platform-modal');
    if (!modal) return;
    
    const modalBody = modal.querySelector('#modal-body');
    modalBody.innerHTML = `
        <div class="modal-platform-check">
            <span class="modal-platform-icon">${icon}</span>
            <h3>${platformName} Coming Soon</h3>
            <p>We're working on adding ${platformName} support. Want early access?</p>
            
            <a href="index.html#pricing" class="btn btn-primary btn-full">
                Get Early Access with Pro
            </a>
            
            <p class="modal-note" style="margin-top: var(--space-lg);">Pro members get first access to new platforms</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    setupModalCloseHandlers(modal);
}

function showUpgradeModal() {
    const modal = document.getElementById('platform-modal');
    if (!modal) return;
    
    const modalBody = modal.querySelector('#modal-body');
    modalBody.innerHTML = `
        <div class="modal-platform-check">
            <span class="modal-platform-icon">🔒</span>
            <h3>Daily Limit Reached</h3>
            <p>You've used all 3 free checks for today. Upgrade for unlimited access!</p>
            
            <div class="upgrade-benefits" style="background: var(--bg); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; text-align: left;">
                <h4 style="margin-bottom: var(--space-md);">Pro Benefits:</h4>
                <p style="padding: var(--space-xs) 0;">✓ Unlimited shadow ban checks</p>
                <p style="padding: var(--space-xs) 0;">✓ 24/7 account monitoring</p>
                <p style="padding: var(--space-xs) 0;">✓ Instant email alerts</p>
                <p style="padding: var(--space-xs) 0;">✓ Historical tracking</p>
                <p style="padding: var(--space-xs) 0;">✓ Priority support</p>
            </div>
            
            <a href="index.html#pricing" class="btn btn-primary btn-full">
                View Plans - From $4.99/mo
            </a>
            
            <button class="btn btn-ghost" style="margin-top: var(--space-md); width: 100%;" onclick="document.getElementById('platform-modal').classList.add('hidden'); document.body.style.overflow = '';">
                Maybe Later
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    setupModalCloseHandlers(modal);
}

function setupModalCloseHandlers(modal) {
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };
    
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

/* =============================================================================
   RUN CHECK & REDIRECT TO RESULTS
   ============================================================================= */
function runCheck(platform, identifier) {
    // Show checking overlay
    showCheckingState(platform);
    
    // Generate demo results
    setTimeout(() => {
        const results = generateDemoResults(platform, identifier);
        
        // Store in sessionStorage
        sessionStorage.setItem('shadowban_results', JSON.stringify(results));
        
        // Redirect to results page
        window.location.href = 'results.html';
    }, 2500);
}

function generateDemoResults(platform, identifier) {
    const random = Math.random();
    
    // Generate probability score
    let probability, status, statusText;
    if (random < 0.65) {
        // Clean
        probability = Math.floor(Math.random() * 10) + 90; // 90-100
        status = 'clean';
        statusText = 'No Shadow Ban Detected';
    } else if (random < 0.85) {
        // Warning
        probability = Math.floor(Math.random() * 25) + 60; // 60-85
        status = 'warning';
        statusText = 'Potential Issues Detected';
    } else {
        // Restricted
        probability = Math.floor(Math.random() * 40) + 20; // 20-60
        status = 'restricted';
        statusText = 'Shadow Ban Likely';
    }
    
    // Platform-specific checks
    let checks = [];
    if (platform === 'Twitter/X') {
        checks = [
            {
                name: 'Search Visibility',
                status: random < 0.7 ? 'passed' : 'warning',
                description: random < 0.7 ? 'Account appears in search results' : 'Reduced search visibility detected',
                citation: 'Twitter/X API v2 search endpoint'
            },
            {
                name: 'Reply Visibility (QFD)',
                status: random < 0.75 ? 'passed' : 'failed',
                description: random < 0.75 ? 'Replies visible to all users' : 'Quality Filter restriction active',
                citation: 'Third-party QFD detection API'
            },
            {
                name: 'Hashtag Reach',
                status: random < 0.65 ? 'passed' : 'warning',
                description: random < 0.65 ? 'Hashtags working normally' : 'Some hashtags may be suppressed',
                citation: 'Hashtag search crawl + API comparison'
            },
            {
                name: 'Engagement Rate',
                status: random < 0.7 ? 'passed' : 'warning',
                description: random < 0.7 ? 'Normal engagement patterns' : 'Below-average engagement detected',
                citation: 'Historical baseline comparison'
            }
        ];
    } else if (platform === 'Reddit') {
        checks = [
            {
                name: 'Site-wide Shadowban',
                status: random < 0.8 ? 'passed' : 'failed',
                description: random < 0.8 ? 'Account is not site-wide shadowbanned' : 'Site-wide shadowban detected',
                citation: 'Reddit API + /r/ShadowBan verification'
            },
            {
                name: 'Subreddit Bans',
                status: random < 0.75 ? 'passed' : 'warning',
                description: random < 0.75 ? 'No subreddit bans detected' : 'Banned from some subreddits',
                citation: 'Subreddit API queries'
            },
            {
                name: 'Post Visibility',
                status: random < 0.7 ? 'passed' : 'warning',
                description: random < 0.7 ? 'Posts visible normally' : 'Some posts may be auto-hidden',
                citation: 'New post crawl test'
            },
            {
                name: 'Karma Status',
                status: random < 0.85 ? 'passed' : 'warning',
                description: random < 0.85 ? 'Karma is within normal range' : 'Low karma may trigger filters',
                citation: 'Reddit API user endpoint'
            }
        ];
    } else if (platform === 'Email') {
        checks = [
            {
                name: 'Blacklist Status',
                status: random < 0.8 ? 'passed' : 'failed',
                description: random < 0.8 ? 'Not listed on major blacklists' : 'Found on Spamhaus or SURBL',
                citation: 'Spamhaus ZEN + SURBL multi query'
            },
            {
                name: 'IP Reputation',
                status: random < 0.75 ? 'passed' : 'warning',
                description: random < 0.75 ? 'Good sender reputation score' : 'Moderate reputation concerns',
                citation: 'Sender Score + Talos Intelligence'
            },
            {
                name: 'Authentication Setup',
                status: random < 0.85 ? 'passed' : 'warning',
                description: random < 0.85 ? 'DKIM, SPF, DMARC configured' : 'Missing authentication records',
                citation: 'DNS TXT record lookup'
            },
            {
                name: 'Deliverability',
                status: random < 0.7 ? 'passed' : 'warning',
                description: random < 0.7 ? 'High inbox placement probability' : 'May land in spam folders',
                citation: 'GlockApps deliverability test'
            }
        ];
    }
    
    return {
        platform,
        identifier,
        timestamp: new Date().toISOString(),
        probability,
        status,
        statusText,
        checks,
        recommendations: generateRecommendations(status)
    };
}

function generateRecommendations(status) {
    if (status === 'clean') {
        return [
            { type: 'success', text: 'Your account is performing well. Keep following platform guidelines.' },
            { type: 'info', text: 'Consider setting up monitoring alerts to catch future issues early.' }
        ];
    } else if (status === 'warning') {
        return [
            { type: 'warning', text: 'Review recent content for potential guideline violations.' },
            { type: 'warning', text: 'Audit your hashtags and links for restricted content.' },
            { type: 'info', text: 'Monitor engagement over the next 48-72 hours for improvements.' }
        ];
    } else {
        return [
            { type: 'danger', text: 'Remove any content that may violate platform guidelines immediately.' },
            { type: 'warning', text: 'Submit an appeal through the platform if you believe this is an error.' },
            { type: 'info', text: 'Most restrictions lift within 14-28 days with good behavior.' }
        ];
    }
}

function showCheckingState(platform) {
    const overlay = document.createElement('div');
    overlay.className = 'checking-overlay';
    overlay.innerHTML = `
        <div class="checking-content">
            <div class="checking-spinner"></div>
            <h3>Analyzing ${platform}...</h3>
            <p>Querying APIs, testing visibility, calculating probability score...</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

/* =============================================================================
   AUTO-OPEN MODAL FROM URL PARAMETER
   ============================================================================= */
function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get('platform');
    
    if (platform) {
        // Wait for DOM and platform data to load
        setTimeout(() => {
            showPlatformModal(platform);
        }, 500);
    }
}

/* =============================================================================
   INITIALIZE
   ============================================================================= */
let gridBuilt = false; // Prevent double initialization

document.addEventListener('DOMContentLoaded', function() {
    // Build platform grid from shared data
    if (window.platformData && !gridBuilt) {
        buildPlatformGrid();
        gridBuilt = true;
    } else if (!window.platformData) {
        // Wait for shared data to load
        document.addEventListener('sharedComponentsLoaded', function() {
            if (!gridBuilt) {
                buildPlatformGrid();
                gridBuilt = true;
            }
        });
    }
    
    // Update search counter
    updateSearchCounter();
    
    // Platform grid click handlers
    document.addEventListener('click', function(e) {
        const platformItem = e.target.closest('.platform-item');
        if (platformItem) {
            const platform = platformItem.dataset.platform;
            showPlatformModal(platform);
        }
    });
    
    // Check for URL parameters (from index page)
    checkUrlParams();
    
    console.log('✅ Checker page initialized');
});
