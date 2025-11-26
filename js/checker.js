/* =============================================================================
   ACCOUNT CHECKER PAGE - JAVASCRIPT
   ShadowBanCheck.io
   Analyzes user accounts for shadow ban status
   ============================================================================= */

(function() {
'use strict';

// ============================================
// CONFIGURATION
// ============================================
const DAILY_FREE_CHECKS = 1;
const STORAGE_KEY = 'accountChecks';
const DATE_KEY = 'accountCheckDate';

// ============================================
// STATE
// ============================================
let selectedPlatform = null;
let userIPData = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initAccountChecker();
    initPlatformSelect();
    initSupportedPlatforms();
    initInfoModals();
    updateChecksDisplay();
    detectIP();
    
    // Check for pre-selected platform from URL
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedPlatform = urlParams.get('platform');
    if (preselectedPlatform) {
        const select = document.getElementById('platform-select');
        if (select) {
            select.value = preselectedPlatform;
            handlePlatformChange(preselectedPlatform);
        }
    }
});

function initAccountChecker() {
    const usernameInput = document.getElementById('username-input');
    const checkBtn = document.getElementById('check-account-btn');
    const clearBtn = document.getElementById('clear-btn');
    const platformSelect = document.getElementById('platform-select');
    
    if (!usernameInput || !checkBtn) return;
    
    // Username input
    usernameInput.addEventListener('input', function() {
        updateCheckButton();
    });
    
    // Platform select
    platformSelect?.addEventListener('change', function() {
        handlePlatformChange(this.value);
    });
    
    // Check button
    checkBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        if (username && selectedPlatform) {
            checkAccount(username);
        }
    });
    
    // Enter key submits
    usernameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkBtn.click();
        }
    });
    
    // Clear button
    clearBtn?.addEventListener('click', function() {
        usernameInput.value = '';
        platformSelect.value = '';
        selectedPlatform = null;
        updateCheckButton();
        updatePlatformStatus();
    });
}

function initPlatformSelect() {
    const select = document.getElementById('platform-select');
    if (!select || typeof PLATFORMS === 'undefined') return;
    
    // Clear existing options except first
    select.innerHTML = '<option value="">Select Platform</option>';
    
    // Add live platforms first
    const livePlatforms = PLATFORMS.filter(p => p.status === 'live');
    const comingSoon = PLATFORMS.filter(p => p.status !== 'live');
    
    if (livePlatforms.length > 0) {
        const liveGroup = document.createElement('optgroup');
        liveGroup.label = '✓ Available Now';
        livePlatforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform.id;
            option.textContent = `${platform.icon} ${platform.name}`;
            option.dataset.icon = platform.icon;
            liveGroup.appendChild(option);
        });
        select.appendChild(liveGroup);
    }
    
    if (comingSoon.length > 0) {
        const soonGroup = document.createElement('optgroup');
        soonGroup.label = '● Coming Soon';
        comingSoon.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform.id;
            option.textContent = `${platform.icon} ${platform.name}`;
            option.dataset.icon = platform.icon;
            option.disabled = true;
            soonGroup.appendChild(option);
        });
        select.appendChild(soonGroup);
    }
}

function initSupportedPlatforms() {
    const container = document.getElementById('supported-platform-icons');
    if (!container || typeof PLATFORMS === 'undefined') return;
    
    // Get live and coming soon platforms from platforms.js
    const livePlatforms = PLATFORMS.filter(p => p.status === 'live');
    const comingSoonCount = PLATFORMS.filter(p => p.status !== 'live').length;
    
    // Sort live platforms - prioritize Twitter/X and Reddit
    const priorityOrder = ['twitter', 'reddit'];
    livePlatforms.sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.id);
        const bIndex = priorityOrder.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
    });
    
    // Show all live platforms + "+X more" for coming soon
    let html = livePlatforms.map(p => `
        <span class="platform-chip" data-platform="${p.id}" title="${p.name}">${p.icon}</span>
    `).join('');
    
    if (comingSoonCount > 0) {
        html += `<span class="platform-chip coming" id="show-more-platforms" title="View all platforms">+${comingSoonCount}</span>`;
    }
    
    container.innerHTML = html;
    
    // Add click handlers
    container.querySelectorAll('.platform-chip[data-platform]').forEach(chip => {
        chip.addEventListener('click', () => {
            showPlatformInfoModal(chip.dataset.platform);
        });
    });
    
    // Show more platforms handler
    const showMore = document.getElementById('show-more-platforms');
    showMore?.addEventListener('click', showAllPlatformsModal);
}

function handlePlatformChange(platformId) {
    if (!platformId) {
        selectedPlatform = null;
        updatePlatformStatus();
        updateCheckButton();
        return;
    }
    
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;
    
    if (platform.status !== 'live') {
        showComingSoonToast(platform.name);
        document.getElementById('platform-select').value = '';
        selectedPlatform = null;
    } else {
        selectedPlatform = platform;
    }
    
    updatePlatformStatus();
    updateCheckButton();
}

function updatePlatformStatus() {
    const statusEl = document.getElementById('platform-status');
    if (!statusEl) return;
    
    if (selectedPlatform) {
        statusEl.textContent = `${selectedPlatform.icon} ${selectedPlatform.name} selected`;
        statusEl.classList.add('ready');
    } else {
        statusEl.textContent = 'Select a platform to continue';
        statusEl.classList.remove('ready');
    }
}

function updateCheckButton() {
    const btn = document.getElementById('check-account-btn');
    const usernameInput = document.getElementById('username-input');
    
    if (!btn || !usernameInput) return;
    
    const hasUsername = usernameInput.value.trim().length > 0;
    const hasPlatform = selectedPlatform !== null;
    
    btn.disabled = !hasUsername || !hasPlatform;
}

// ============================================
// IP DETECTION
// ============================================
async function detectIP() {
    const ipAddress = document.getElementById('ip-address');
    const ipType = document.getElementById('ip-type');
    const ipFlag = document.getElementById('ip-flag');
    
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.ip) {
            userIPData = data;
            
            // Display IP
            if (ipAddress) {
                ipAddress.textContent = `Your IP: ${data.ip}`;
            }
            
            // Determine IP type
            if (ipType) {
                const orgLower = (data.org || '').toLowerCase();
                let type = 'residential';
                let typeClass = '';
                
                if (orgLower.includes('vpn') || orgLower.includes('proxy') || orgLower.includes('tunnel')) {
                    type = 'VPN';
                    typeClass = 'vpn';
                } else if (orgLower.includes('hosting') || orgLower.includes('cloud') || orgLower.includes('amazon') || orgLower.includes('google') || orgLower.includes('microsoft') || orgLower.includes('digital ocean')) {
                    type = 'Datacenter';
                    typeClass = 'datacenter';
                }
                
                ipType.textContent = type.toUpperCase();
                ipType.className = 'ip-type' + (typeClass ? ' ' + typeClass : '');
                
                userIPData.type = type;
                userIPData.typeClass = typeClass;
            }
            
            // Country flag
            if (ipFlag && data.country_code) {
                const flag = countryCodeToFlag(data.country_code);
                ipFlag.textContent = flag;
                ipFlag.title = data.country_name || data.country_code;
                userIPData.flag = flag;
            }
        }
    } catch (error) {
        console.log('IP detection failed:', error);
        if (ipAddress) {
            ipAddress.textContent = 'IP: Unable to detect';
        }
    }
}

function countryCodeToFlag(countryCode) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// ============================================
// CHECK ACCOUNT
// ============================================
async function checkAccount(username) {
    // Clean username
    username = username.replace(/^@/, '').trim();
    
    if (!username || !selectedPlatform) {
        showToast('Please select a platform and enter a username');
        return;
    }
    
    // Check limits
    if (!canCheck()) {
        showLimitReachedModal();
        return;
    }
    
    const checkBtn = document.getElementById('check-account-btn');
    checkBtn.classList.add('loading');
    checkBtn.disabled = true;
    
    try {
        // Simulate analysis (replace with real API call)
        await simulateAnalysis();
        
        // Increment check count
        incrementCheckCount();
        
        // Build results and redirect
        const results = buildResults(username);
        
        // Store results and redirect to results page
        sessionStorage.setItem('checkResults', JSON.stringify(results));
        window.location.href = 'results.html';
        
    } catch (error) {
        console.error('Check failed:', error);
        showToast('Analysis failed. Please try again.');
    } finally {
        checkBtn.classList.remove('loading');
        checkBtn.disabled = false;
    }
}

async function simulateAnalysis() {
    return new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
}

function buildResults(username) {
    // Generate mock probability score (replace with real analysis)
    const probability = Math.floor(Math.random() * 35) + 5; // 5-40%
    
    // Determine status based on probability
    let status, statusClass;
    if (probability < 15) {
        status = 'Account in Good Standing';
        statusClass = 'good';
    } else if (probability < 40) {
        status = 'Possible Visibility Issues';
        statusClass = 'warning';
    } else {
        status = 'Likely Restricted';
        statusClass = 'bad';
    }
    
    return {
        type: 'username',
        platform: selectedPlatform.name,
        platformIcon: selectedPlatform.icon,
        platformKey: selectedPlatform.id,
        query: `@${username}`,
        timestamp: new Date().toISOString(),
        probability: probability,
        status: status,
        statusClass: statusClass,
        factors: {
            platformAPI: true,
            webAnalysis: true,
            historicalData: true,
            hashtagDatabase: false,
            ipAnalysis: true
        },
        factorsUsed: '4/5',
        ipData: userIPData ? {
            ip: userIPData.ip,
            type: userIPData.type || 'Residential',
            country: userIPData.country_name,
            countryCode: userIPData.country_code,
            flag: userIPData.flag || countryCodeToFlag(userIPData.country_code || 'US')
        } : null,
        checks: [
            {
                name: 'Account Status',
                status: probability < 20 ? 'pass' : 'warning',
                icon: '👤',
                detail: probability < 20 
                    ? 'Account is active and accessible' 
                    : 'Account may have some restrictions'
            },
            {
                name: 'Search Visibility',
                status: probability < 25 ? 'pass' : 'warning',
                icon: '🔍',
                detail: probability < 25 
                    ? 'Account appears in search results' 
                    : 'Limited visibility in search'
            },
            {
                name: 'Profile Accessibility',
                status: 'pass',
                icon: '🌐',
                detail: 'Profile is publicly accessible'
            },
            {
                name: 'Engagement Baseline',
                status: probability < 30 ? 'pass' : 'info',
                icon: '📊',
                detail: probability < 30 
                    ? 'Engagement metrics within normal range' 
                    : 'Engagement below expected baseline'
            },
            {
                name: 'IP/Location Risk',
                status: userIPData?.type === 'VPN' ? 'warning' : 'pass',
                icon: '🌐',
                detail: userIPData 
                    ? `${userIPData.country_name || 'Unknown'} • ${userIPData.type || 'Residential'} IP` 
                    : 'IP analysis unavailable'
            }
        ],
        recommendations: [
            probability < 20 
                ? 'Your account appears to be in good standing. Continue following platform guidelines.' 
                : 'Review recent activity for potential policy violations.',
            'Avoid using VPNs when posting content for better reach.',
            'Check your posts individually using our Post URL Checker.',
            'Verify your hashtags with our Hashtag Checker before posting.'
        ]
    };
}

// ============================================
// RATE LIMITING
// ============================================
function getCheckCount() {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(DATE_KEY);
    
    if (storedDate !== today) {
        localStorage.setItem(DATE_KEY, today);
        localStorage.setItem(STORAGE_KEY, '0');
        return 0;
    }
    
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
}

function canCheck() {
    return getCheckCount() < DAILY_FREE_CHECKS;
}

function incrementCheckCount() {
    const count = getCheckCount() + 1;
    localStorage.setItem(STORAGE_KEY, count.toString());
    updateChecksDisplay();
}

function updateChecksDisplay() {
    const display = document.getElementById('checks-remaining-display');
    if (display) {
        const remaining = DAILY_FREE_CHECKS - getCheckCount();
        display.textContent = `${remaining} free check${remaining !== 1 ? 's' : ''} left today`;
    }
}

function showLimitReachedModal() {
    showToast('Daily limit reached! Upgrade to Pro for unlimited checks.');
}

// ============================================
// MODALS
// ============================================
function initInfoModals() {
    // Checker info button
    const checkerInfoBtn = document.getElementById('checker-info-btn');
    const engineModal = document.getElementById('engine-info-modal');
    
    checkerInfoBtn?.addEventListener('click', () => {
        engineModal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    // Engine info button
    const engineInfoBtn = document.getElementById('engine-info-btn');
    engineInfoBtn?.addEventListener('click', () => {
        engineModal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    // Close handlers for all modals
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        };
        
        closeBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', closeModal);
    });
    
    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
            });
            document.body.style.overflow = '';
        }
    });
}

function showPlatformInfoModal(platformId) {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;
    
    const modal = document.getElementById('platform-info-modal');
    const iconEl = document.getElementById('platform-modal-icon');
    const titleEl = document.getElementById('platform-modal-title');
    const bodyEl = document.getElementById('platform-modal-body');
    
    if (!modal || !bodyEl) return;
    
    iconEl.textContent = platform.icon;
    titleEl.textContent = `${platform.name} - Account Checks`;
    
    if (platform.status === 'live' && platform.checks) {
        bodyEl.innerHTML = `
            <p class="modal-intro">For ${platform.name} accounts, our 5-Factor Engine analyzes:</p>
            <ul class="platform-checks-list">
                ${platform.checks.slice(0, 8).map(check => `<li>✓ ${check}</li>`).join('')}
            </ul>
            <p style="margin-top: var(--space-md); color: var(--text-muted); font-size: 0.875rem;">
                Results include shadow ban probability, detailed breakdown, and recovery tips.
            </p>
        `;
    } else {
        bodyEl.innerHTML = `
            <p class="modal-intro">${platform.name} account checking is coming soon!</p>
            <p style="color: var(--text-muted);">We're working hard to add ${platform.name} to our detection engine. Create an account to get notified when it launches.</p>
        `;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function showAllPlatformsModal() {
    const modal = document.getElementById('platform-info-modal');
    const iconEl = document.getElementById('platform-modal-icon');
    const titleEl = document.getElementById('platform-modal-title');
    const bodyEl = document.getElementById('platform-modal-body');
    
    if (!modal || !bodyEl) return;
    
    iconEl.textContent = '🌐';
    titleEl.textContent = 'All Supported Platforms';
    
    const livePlatforms = PLATFORMS.filter(p => p.status === 'live');
    const comingSoon = PLATFORMS.filter(p => p.status !== 'live');
    
    let html = '<div class="all-platforms-grid">';
    
    if (livePlatforms.length > 0) {
        html += '<div class="platforms-section"><h4>✓ Available Now</h4><div class="platforms-list">';
        html += livePlatforms.map(p => `
            <div class="platform-list-item">
                <span class="platform-list-icon">${p.icon}</span>
                <span class="platform-list-name">${p.name}</span>
            </div>
        `).join('');
        html += '</div></div>';
    }
    
    if (comingSoon.length > 0) {
        html += '<div class="platforms-section"><h4>● Coming Soon</h4><div class="platforms-list">';
        html += comingSoon.map(p => `
            <div class="platform-list-item coming">
                <span class="platform-list-icon">${p.icon}</span>
                <span class="platform-list-name">${p.name}</span>
            </div>
        `).join('');
        html += '</div></div>';
    }
    
    html += '</div>';
    bodyEl.innerHTML = html;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePlatformInfoModal() {
    const modal = document.getElementById('platform-info-modal');
    modal?.classList.add('hidden');
    document.body.style.overflow = '';
}

// Make it globally available
window.closePlatformInfoModal = closePlatformInfoModal;

function showComingSoonToast(platformName) {
    showToast(`${platformName} coming soon! Create an account to get notified.`);
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
    if (typeof window.ShadowBan?.showToast === 'function') {
        window.ShadowBan.showToast(message);
        return;
    }
    
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

})();
