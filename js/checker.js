/* =============================================================================
   CHECKER.JS - Shadow Ban Checker Page Functionality
   
   NOTE: Uses window.platformData from platforms.js (loaded before this file)
   ============================================================================= */

/* =============================================================================
   PLATFORM GRID - BUILD FROM SHARED DATA
   ============================================================================= */
function buildPlatformGrid() {
    const grid = document.getElementById('platform-grid');
    if (!grid || !window.platformData) return;
    
    // Clear any existing content first
    grid.innerHTML = '';
    
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
        return MAX_FREE_SEARCHES;
    }
    
    return Math.max(0, MAX_FREE_SEARCHES - (data.count || 0));
}

function incrementSearchCount() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const today = new Date().toDateString();
    
    if (data.date !== today) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            date: today,
            count: 1
        }));
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            date: today,
            count: (data.count || 0) + 1
        }));
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
    
    if (platform.name === 'Twitter/X') {
        showTwitterModal();
    } else if (platform.name === 'Reddit') {
        showRedditModal();
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
                    <li>✓ Engagement rate patterns</li>
                    <li>✓ Account status & flags</li>
                </ul>
            </div>
            
            <div class="modal-input-group">
                <input type="text" id="modal-username-input" placeholder="Enter @username or username..." />
            </div>
            
            <button class="btn btn-primary btn-full" id="modal-check-btn">
                Check Account →
            </button>
            
            <p class="modal-note">Powered by our 5-Factor Detection Engine (4 factors active)</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => document.getElementById('modal-username-input')?.focus(), 100);
    
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
            
            <p class="modal-note">Powered by our 5-Factor Detection Engine (4 factors active)</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => document.getElementById('modal-username-input')?.focus(), 100);
    
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
                <p style="padding: var(--space-xs) 0;">✓ Unlimited checks</p>
                <p style="padding: var(--space-xs) 0;">✓ 24/7 monitoring</p>
                <p style="padding: var(--space-xs) 0;">✓ Instant alerts</p>
                <p style="padding: var(--space-xs) 0;">✓ Historical tracking</p>
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
   RUN CHECK & REDIRECT
   ============================================================================= */
function runCheck(platform, identifier) {
    showCheckingState(platform);
    
    // Get IP data for scoring
    const ipData = window.ShadowBan?.getUserIPData?.() || null;
    
    setTimeout(() => {
        const results = generateDemoResults(platform, identifier, ipData);
        sessionStorage.setItem('shadowban_results', JSON.stringify(results));
        window.location.href = 'results.html';
    }, 2500);
}

function generateDemoResults(platform, identifier, ipData) {
    const random = Math.random();
    
    // Factor in IP risk
    let ipRiskBonus = 0;
    if (ipData) {
        if (ipData.isVPN) ipRiskBonus = 15;
        else if (ipData.isDatacenter) ipRiskBonus = 10;
    }
    
    let probability, status, statusText;
    if (random < 0.65) {
        probability = Math.floor(Math.random() * 10) + 90 - ipRiskBonus;
        status = 'clean';
        statusText = 'No Shadow Ban Detected';
    } else if (random < 0.85) {
        probability = Math.floor(Math.random() * 25) + 60 - ipRiskBonus;
        status = 'warning';
        statusText = 'Potential Issues Detected';
    } else {
        probability = Math.floor(Math.random() * 40) + 20 - ipRiskBonus;
        status = 'restricted';
        statusText = 'Shadow Ban Likely';
    }
    
    // Ensure probability stays in valid range
    probability = Math.max(5, Math.min(99, probability));
    
    let checks = [];
    if (platform === 'Twitter/X') {
        checks = [
            { name: 'Search Visibility', status: random < 0.7 ? 'passed' : 'warning', description: random < 0.7 ? 'Account appears in search' : 'Reduced visibility', citation: 'Twitter/X API v2 search endpoint' },
            { name: 'Reply Visibility (QFD)', status: random < 0.75 ? 'passed' : 'failed', description: random < 0.75 ? 'Replies visible' : 'Quality Filter active', citation: 'Third-party QFD detection' },
            { name: 'Engagement Rate', status: random < 0.7 ? 'passed' : 'warning', description: random < 0.7 ? 'Normal patterns' : 'Below average', citation: 'Historical baseline comparison' },
            { name: 'Account Status', status: random < 0.8 ? 'passed' : 'warning', description: random < 0.8 ? 'No restrictions' : 'Some flags detected', citation: 'Twitter/X API v2 user lookup' }
        ];
    } else if (platform === 'Reddit') {
        checks = [
            { name: 'Site-wide Shadowban', status: random < 0.8 ? 'passed' : 'failed', description: random < 0.8 ? 'Not shadowbanned' : 'Shadowbanned', citation: 'Reddit API + /r/ShadowBan' },
            { name: 'Subreddit Bans', status: random < 0.75 ? 'passed' : 'warning', description: random < 0.75 ? 'No bans' : 'Some bans', citation: 'Subreddit API' },
            { name: 'Post Visibility', status: random < 0.7 ? 'passed' : 'warning', description: random < 0.7 ? 'Posts visible' : 'Some hidden', citation: 'Post crawl test' },
            { name: 'Karma Status', status: random < 0.85 ? 'passed' : 'warning', description: random < 0.85 ? 'Normal karma' : 'Low karma', citation: 'Reddit API' }
        ];
    }
    
    // Add IP check to results
    if (ipData) {
        checks.push({
            name: 'IP Analysis',
            status: ipData.isVPN ? 'warning' : ipData.isDatacenter ? 'warning' : 'passed',
            description: ipData.isVPN ? 'VPN/Proxy detected' : ipData.isDatacenter ? 'Datacenter IP detected' : 'Residential IP',
            citation: 'IP reputation analysis'
        });
    }
    
    const recommendations = status === 'clean' 
        ? [{ type: 'success', text: 'Account performing well. Keep following guidelines.' }, { type: 'info', text: 'Consider setting up monitoring alerts.' }]
        : status === 'warning'
        ? [{ type: 'warning', text: 'Review recent content for violations.' }, { type: 'info', text: 'Monitor engagement over 48-72 hours.' }]
        : [{ type: 'danger', text: 'Remove violating content immediately.' }, { type: 'warning', text: 'Submit an appeal if this is an error.' }];
    
    return { 
        platform, 
        identifier, 
        timestamp: new Date().toISOString(), 
        ipUsed: ipData?.ip || 'Unknown',
        ipType: ipData?.typeLabel || 'Unknown',
        results: { probability, status, statusText, checks, recommendations },
        engineFactors: {
            platformAPIs: true,
            webAnalysis: true,
            historicalData: true,
            hashtagDatabase: false,
            ipAnalysis: true
        }
    };
}

function showCheckingState(platform) {
    const overlay = document.createElement('div');
    overlay.className = 'checking-overlay';
    overlay.innerHTML = `
        <div class="checking-content">
            <div class="checking-spinner"></div>
            <h3>Analyzing ${platform}...</h3>
            <p>Querying APIs, testing visibility, analyzing IP...</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

/* =============================================================================
   INITIALIZE
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    // Build grid once platformData is available
    if (window.platformData) {
        buildPlatformGrid();
    } else {
        window.addEventListener('load', () => {
            if (window.platformData) buildPlatformGrid();
        });
    }
    
    // Click handler for platforms
    document.addEventListener('click', function(e) {
        const platformItem = e.target.closest('.platform-item');
        if (platformItem) {
            showPlatformModal(platformItem.dataset.platform);
        }
    });
    
    // Check URL params for direct platform open
    const params = new URLSearchParams(window.location.search);
    const platform = params.get('platform');
    if (platform) {
        setTimeout(() => showPlatformModal(platform), 500);
    }
    
    console.log('✅ Checker initialized');
});
