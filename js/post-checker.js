/* =============================================================================
   POST CHECKER PAGE - JAVASCRIPT
   ShadowBanCheck.io
   Analyzes individual posts for shadow ban/limited reach status
   ============================================================================= */

(function() {
'use strict';

// ============================================
// CONFIGURATION
// ============================================
const DAILY_FREE_CHECKS = 1;
const STORAGE_KEY = 'postChecks';
const DATE_KEY = 'postCheckDate';

// Platform detection patterns
const PLATFORM_PATTERNS = {
    'twitter': /(?:twitter\.com|x\.com)\/\w+\/status\/\d+/i,
    'instagram': /instagram\.com\/(?:p|reel)\/[\w-]+/i,
    'tiktok': /tiktok\.com\/@[\w.]+\/video\/\d+/i,
    'reddit': /reddit\.com\/r\/\w+\/comments\/\w+/i,
    'facebook': /facebook\.com\/(?:\w+\/)?(?:posts|videos)\/\d+/i,
    'linkedin': /linkedin\.com\/(?:posts|feed\/update)/i,
    'youtube': /(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/i,
    'threads': /threads\.net\/@[\w.]+\/post\/[\w]+/i
};

const PLATFORM_NAMES = {
    'twitter': 'Twitter/X',
    'instagram': 'Instagram',
    'tiktok': 'TikTok',
    'reddit': 'Reddit',
    'facebook': 'Facebook',
    'linkedin': 'LinkedIn',
    'youtube': 'YouTube',
    'threads': 'Threads'
};

const PLATFORM_ICONS = {
    'twitter': '𝕏',
    'instagram': '📷',
    'tiktok': '🎵',
    'reddit': '🤖',
    'facebook': '👤',
    'linkedin': '💼',
    'youtube': '▶️',
    'threads': '🧵'
};

// ============================================
// STATE
// ============================================
let detectedPlatform = null;
let userIPData = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initPostChecker();
    initInfoModal();
    initSupportedPlatforms();
    initEngineModal();
    updateChecksDisplay();
    detectIP();
});

function initPostChecker() {
    const urlInput = document.getElementById('post-url-input');
    const checkBtn = document.getElementById('check-post-btn');
    const clearBtn = document.getElementById('clear-btn');
    const exampleBtn = document.getElementById('example-btn');
    
    if (!urlInput || !checkBtn) return;
    
    // URL input - detect platform as user types
    urlInput.addEventListener('input', function() {
        const url = this.value.trim();
        detectPlatform(url);
    });
    
    // Check button
    checkBtn.addEventListener('click', function() {
        const url = urlInput.value.trim();
        if (url) {
            checkPost(url);
        }
    });
    
    // Enter key submits
    urlInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkBtn.click();
        }
    });
    
    // Clear button
    clearBtn?.addEventListener('click', function() {
        urlInput.value = '';
        detectedPlatform = null;
        updatePlatformDisplay();
    });
    
    // Example button
    exampleBtn?.addEventListener('click', function() {
        urlInput.value = 'https://twitter.com/elonmusk/status/1234567890123456789';
        detectPlatform(urlInput.value);
    });
}

// ============================================
// PLATFORM DETECTION
// ============================================
function detectPlatform(url) {
    detectedPlatform = null;
    
    for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
        if (pattern.test(url)) {
            detectedPlatform = platform;
            break;
        }
    }
    
    updatePlatformDisplay();
    return detectedPlatform;
}

function updatePlatformDisplay() {
    const platformDisplay = document.getElementById('platform-detected');
    if (!platformDisplay) return;
    
    if (detectedPlatform) {
        const icon = PLATFORM_ICONS[detectedPlatform] || '🔗';
        const name = PLATFORM_NAMES[detectedPlatform] || detectedPlatform;
        platformDisplay.innerHTML = `Platform: <strong>${icon} ${name}</strong>`;
        platformDisplay.style.color = 'var(--success)';
    } else {
        platformDisplay.innerHTML = 'Platform: Auto-detect';
        platformDisplay.style.color = '';
    }
}

// ============================================
// IP DETECTION
// ============================================
async function detectIP() {
    const ipAddress = document.getElementById('ip-address');
    const ipType = document.getElementById('ip-type');
    const ipFlag = document.getElementById('ip-flag');
    
    try {
        // Use ipapi.co for IP detection (free tier)
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
            }
            
            // Country flag
            if (ipFlag && data.country_code) {
                const flag = countryCodeToFlag(data.country_code);
                ipFlag.textContent = flag;
                ipFlag.title = data.country_name || data.country_code;
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
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// ============================================
// CHECK POST
// ============================================
async function checkPost(url) {
    // Validate URL
    if (!url || !isValidUrl(url)) {
        showToast('Please enter a valid URL');
        return;
    }
    
    // Detect platform
    if (!detectedPlatform) {
        detectPlatform(url);
    }
    
    if (!detectedPlatform) {
        showToast('Unsupported platform. Please use a supported social media URL.');
        return;
    }
    
    // Check limits
    if (!canCheck()) {
        showLimitReachedModal();
        return;
    }
    
    const checkBtn = document.getElementById('check-post-btn');
    checkBtn.classList.add('loading');
    checkBtn.disabled = true;
    
    try {
        // Simulate analysis (replace with real API call)
        await simulateAnalysis();
        
        // Increment check count
        incrementCheckCount();
        
        // Build results and redirect
        const results = buildResults(url);
        
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

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function simulateAnalysis() {
    // Simulate API call delay
    return new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
}

function buildResults(url) {
    const platformName = PLATFORM_NAMES[detectedPlatform] || detectedPlatform;
    const platformIcon = PLATFORM_ICONS[detectedPlatform] || '🔗';
    
    // Generate mock probability score (replace with real analysis)
    const probability = Math.floor(Math.random() * 40) + 10; // 10-50%
    
    // Determine status based on probability
    let status, statusClass;
    if (probability < 20) {
        status = 'Likely Visible';
        statusClass = 'good';
    } else if (probability < 50) {
        status = 'Possibly Limited';
        statusClass = 'warning';
    } else {
        status = 'Likely Restricted';
        statusClass = 'bad';
    }
    
    return {
        type: 'post',
        platform: platformName,
        platformIcon: platformIcon,
        platformKey: detectedPlatform,
        query: url,
        timestamp: new Date().toISOString(),
        probability: probability,
        status: status,
        statusClass: statusClass,
        factors: {
            platformAPI: true,
            webAnalysis: true,
            historicalData: false,
            hashtagDatabase: true,
            ipAnalysis: true
        },
        factorsUsed: '4/5',
        ipData: userIPData ? {
            ip: userIPData.ip,
            type: userIPData.org?.toLowerCase().includes('vpn') ? 'VPN' : 
                  userIPData.org?.toLowerCase().includes('hosting') ? 'Datacenter' : 'Residential',
            country: userIPData.country_name,
            countryCode: userIPData.country_code,
            flag: countryCodeToFlag(userIPData.country_code || 'US')
        } : null,
        checks: [
            {
                name: 'Content Analysis',
                status: probability < 30 ? 'pass' : 'warning',
                icon: '📄',
                detail: probability < 30 
                    ? 'No flagged content detected' 
                    : 'Some content may trigger filters'
            },
            {
                name: 'Hashtag Health',
                status: 'pass',
                icon: '#️⃣',
                detail: 'Hashtags appear safe'
            },
            {
                name: 'Search Visibility',
                status: probability < 40 ? 'pass' : 'warning',
                icon: '🔍',
                detail: probability < 40 
                    ? 'Post appears in search results' 
                    : 'Limited search visibility detected'
            },
            {
                name: 'Engagement Signals',
                status: 'info',
                icon: '📊',
                detail: 'Engagement within expected range'
            },
            {
                name: 'IP/Location Factor',
                status: userIPData?.org?.toLowerCase().includes('vpn') ? 'warning' : 'pass',
                icon: '🌐',
                detail: userIPData 
                    ? `${userIPData.country_name || 'Unknown'} • ${userIPData.org?.toLowerCase().includes('vpn') ? 'VPN detected' : 'Residential IP'}` 
                    : 'IP analysis unavailable'
            }
        ],
        recommendations: [
            probability < 30 
                ? 'Your post appears to be in good standing. Continue monitoring engagement.' 
                : 'Consider reviewing your content for potentially flagged keywords.',
            'Check your hashtags individually using our Hashtag Checker.',
            'Run an account check to see if your profile has any restrictions.',
            'If using a VPN, try posting from your regular network.'
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
        // New day, reset count
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
    // Use the existing toast for now
    showToast('Daily limit reached! Upgrade to Pro for unlimited checks.');
}

// ============================================
// INFO MODAL
// ============================================
function initInfoModal() {
    const infoBtn = document.getElementById('post-info-btn');
    const modal = document.getElementById('post-info-modal');
    
    if (!infoBtn || !modal) return;
    
    infoBtn.addEventListener('click', function() {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    // Close handlers
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };
    
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
    // Use the global showToast if available
    if (typeof window.ShadowBan?.showToast === 'function') {
        window.ShadowBan.showToast(message);
        return;
    }
    
    // Fallback
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

// ============================================
// SUPPORTED PLATFORMS
// ============================================
function initSupportedPlatforms() {
    const container = document.querySelector('.platform-icons');
    if (!container || typeof PLATFORMS === 'undefined') return;
    
    // Get live platforms - show Twitter/X and Reddit first
    const livePlatforms = PLATFORMS.filter(p => p.status === 'live');
    const priorityOrder = ['twitter', 'reddit'];
    
    livePlatforms.sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.id);
        const bIndex = priorityOrder.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
    });
    
    // Show first 7 platforms + "more" chip
    const displayPlatforms = livePlatforms.slice(0, 7);
    const remainingCount = PLATFORMS.length - 7;
    
    let html = displayPlatforms.map(p => `
        <span class="platform-chip" data-platform="${p.id}" title="${p.name}">${p.icon}</span>
    `).join('');
    
    if (remainingCount > 0) {
        html += `<span class="platform-chip coming" id="show-more-platforms" title="View all platforms">+${remainingCount}</span>`;
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

// ============================================
// PLATFORM INFO MODAL
// ============================================
function showPlatformInfoModal(platformId) {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;
    
    const modal = document.getElementById('platform-info-modal');
    const iconEl = document.getElementById('platform-modal-icon');
    const titleEl = document.getElementById('platform-modal-title');
    const bodyEl = document.getElementById('platform-modal-body');
    
    if (!modal || !bodyEl) return;
    
    iconEl.textContent = platform.icon;
    titleEl.textContent = `${platform.name} - What We Check`;
    
    if (platform.status === 'live' && platform.checks) {
        bodyEl.innerHTML = `
            <p class="modal-intro">For ${platform.name} posts, our 5-Factor Engine analyzes:</p>
            <ul class="platform-checks-list">
                ${platform.checks.map(check => `<li>✓ ${check}</li>`).join('')}
            </ul>
            <p style="margin-top: var(--space-md); color: var(--text-muted); font-size: 0.875rem;">
                Results include probability score with detailed breakdown and citations.
            </p>
        `;
    } else {
        bodyEl.innerHTML = `
            <p class="modal-intro">${platform.name} support is coming soon!</p>
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

// ============================================
// ENGINE INFO MODAL
// ============================================
function initEngineModal() {
    const engineInfoBtn = document.getElementById('engine-info-btn');
    const engineModal = document.getElementById('engine-info-modal');
    
    if (!engineInfoBtn || !engineModal) return;
    
    engineInfoBtn.addEventListener('click', function() {
        engineModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    // Close handlers
    const closeBtn = engineModal.querySelector('.modal-close');
    const overlay = engineModal.querySelector('.modal-overlay');
    
    const closeModal = () => {
        engineModal.classList.add('hidden');
        document.body.style.overflow = '';
    };
    
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !engineModal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // Also handle platform info modal close
    const platformModal = document.getElementById('platform-info-modal');
    if (platformModal) {
        const pCloseBtn = platformModal.querySelector('.modal-close');
        const pOverlay = platformModal.querySelector('.modal-overlay');
        
        pCloseBtn?.addEventListener('click', closePlatformInfoModal);
        pOverlay?.addEventListener('click', closePlatformInfoModal);
    }
}

})();
