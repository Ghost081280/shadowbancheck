/* =============================================================================
   RESULTS.JS - Results Page Functionality
   5-Factor Detection Engine Integration
   ============================================================================= */

/* =============================================================================
   5-FACTOR ENGINE CONFIGURATION
   ============================================================================= */
const ENGINE_FACTORS = [
    {
        id: 'api',
        icon: '🔌',
        name: 'Platform APIs',
        shortName: 'APIs',
        activeDesc: 'Direct API integration verified account status',
        inactiveDesc: 'Not used for this check type'
    },
    {
        id: 'web',
        icon: '🌐',
        name: 'Web Analysis',
        shortName: 'Web',
        activeDesc: 'Live scraping and visibility tests performed',
        inactiveDesc: 'Not applicable for this check'
    },
    {
        id: 'historical',
        icon: '📊',
        name: 'Historical Data',
        shortName: 'History',
        activeDesc: 'Compared against baseline patterns',
        inactiveDesc: 'Not applicable for this check'
    },
    {
        id: 'hashtag',
        icon: '#️⃣',
        name: 'Hashtag Database',
        shortName: 'Hashtags',
        activeDesc: 'Cross-referenced 1,800+ banned/restricted tags',
        inactiveDesc: 'Not applicable for username-only checks'
    },
    {
        id: 'ip',
        icon: '🔍',
        name: 'IP Analysis',
        shortName: 'IP',
        activeDesc: 'VPN/proxy detection and location analysis',
        inactiveDesc: 'Not used for this check type'
    }
];

// Check type configurations
const CHECK_TYPE_FACTORS = {
    'power': {
        name: '3-in-1 Power Check',
        factors: ['api', 'web', 'historical', 'hashtag', 'ip'],
        count: 5
    },
    'username': {
        name: 'Username Check',
        factors: ['api', 'web', 'historical', 'ip'],
        count: 4
    },
    'hashtag': {
        name: 'Hashtag Check',
        factors: ['web', 'historical', 'hashtag'],
        count: 3
    },
    'post': {
        name: 'Post Check',
        factors: ['api', 'web', 'historical', 'hashtag', 'ip'],
        count: 5
    }
};

/* =============================================================================
   DEMO DATA - FOR TESTING/EDITING
   ============================================================================= */
function loadDemoData() {
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get('demo');
    
    if (demoParam) {
        const demoData = getDemoDataForPlatform(demoParam);
        if (demoData) {
            displayResults(demoData);
            return true;
        }
    }
    return false;
}

function getDemoDataForPlatform(platform) {
    const demos = {
        'twitter': {
            platform: 'Twitter/X',
            identifier: '@elonmusk',
            checkType: 'username',
            timestamp: Date.now(),
            ipData: {
                ip: '192.168.1.42',
                type: 'residential',
                typeLabel: 'Residential',
                location: 'San Francisco, CA'
            },
            results: {
                probability: 23,
                status: 'clean',
                statusText: 'No Shadow Ban Detected',
                engineFactors: {
                    api: { active: true, detail: 'Twitter API v2 verified' },
                    web: { active: true, detail: 'Search visibility confirmed' },
                    historical: { active: true, detail: 'Engagement baseline normal' },
                    hashtag: { active: false, detail: 'N/A for username checks' },
                    ip: { active: true, detail: 'Residential IP verified' }
                },
                checks: [
                    {
                        name: 'Search Visibility',
                        description: 'Account appears in search results normally',
                        status: 'passed',
                        citation: 'Twitter/X API v2 search endpoint',
                        factor: 'api'
                    },
                    {
                        name: 'Reply Visibility (QFD)',
                        description: 'Replies visible without quality filter restrictions',
                        status: 'passed',
                        citation: 'Third-party QFD detection API',
                        factor: 'web'
                    },
                    {
                        name: 'Engagement Rate',
                        description: 'Engagement aligns with historical baseline',
                        status: 'passed',
                        citation: 'Historical baseline comparison',
                        factor: 'historical'
                    },
                    {
                        name: 'Account Status',
                        description: 'No flags or restrictions detected on account',
                        status: 'passed',
                        citation: 'Twitter/X API v2 user lookup',
                        factor: 'api'
                    },
                    {
                        name: 'IP Risk Assessment',
                        description: 'Your IP shows no VPN/proxy indicators',
                        status: 'passed',
                        citation: 'IP geolocation & reputation check',
                        factor: 'ip'
                    }
                ],
                recommendations: [
                    { text: 'Your account is performing well. Continue posting quality content.', type: 'success' },
                    { text: 'Monitor engagement trends to catch any future issues early.', type: 'info' },
                    { text: 'Set up monitoring alerts to get notified of any changes.', type: 'info' }
                ]
            }
        },
        'reddit': {
            platform: 'Reddit',
            identifier: 'u/spez',
            checkType: 'username',
            timestamp: Date.now(),
            ipData: {
                ip: '10.0.0.55',
                type: 'residential',
                typeLabel: 'Residential',
                location: 'New York, NY'
            },
            results: {
                probability: 8,
                status: 'clean',
                statusText: 'No Shadow Ban Detected',
                engineFactors: {
                    api: { active: true, detail: 'Reddit API verified' },
                    web: { active: true, detail: 'Profile visibility confirmed' },
                    historical: { active: true, detail: 'Karma patterns analyzed' },
                    hashtag: { active: false, detail: 'N/A for Reddit' },
                    ip: { active: true, detail: 'Residential IP verified' }
                },
                checks: [
                    {
                        name: 'Site-wide Shadowban',
                        description: 'Account is not shadow banned site-wide',
                        status: 'passed',
                        citation: 'Reddit API + /r/ShadowBan verification',
                        factor: 'api'
                    },
                    {
                        name: 'Subreddit Bans',
                        description: 'No active subreddit-specific bans detected',
                        status: 'passed',
                        citation: 'Subreddit API queries',
                        factor: 'web'
                    },
                    {
                        name: 'Post Visibility',
                        description: 'Recent posts visible in subreddit feeds',
                        status: 'passed',
                        citation: 'New post crawl test',
                        factor: 'web'
                    },
                    {
                        name: 'Karma Status',
                        description: 'Karma accumulation functioning normally',
                        status: 'passed',
                        citation: 'Reddit API user endpoint',
                        factor: 'historical'
                    }
                ],
                recommendations: [
                    { text: 'Your Reddit account is in excellent standing.', type: 'success' },
                    { text: 'Continue following community guidelines to maintain good status.', type: 'info' },
                    { text: 'Review subreddit-specific rules before posting to avoid issues.', type: 'info' }
                ]
            }
        },
        'power': {
            platform: 'Twitter/X',
            identifier: '@example_user',
            checkType: 'power',
            timestamp: Date.now(),
            ipData: {
                ip: '203.45.67.89',
                type: 'vpn',
                typeLabel: 'VPN/Proxy',
                location: 'Unknown'
            },
            results: {
                probability: 67,
                status: 'warning',
                statusText: 'Potential Issues Detected',
                engineFactors: {
                    api: { active: true, detail: 'API access confirmed' },
                    web: { active: true, detail: 'Visibility tests run' },
                    historical: { active: true, detail: 'Baseline compared' },
                    hashtag: { active: true, detail: '2 restricted tags found' },
                    ip: { active: true, detail: 'VPN detected (+15% risk)' }
                },
                checks: [
                    {
                        name: 'Search Visibility',
                        description: 'Account appears in search with reduced ranking',
                        status: 'warning',
                        citation: 'Twitter/X API v2 search endpoint',
                        factor: 'api'
                    },
                    {
                        name: 'Post Reach',
                        description: 'Recent posts showing 40% below baseline engagement',
                        status: 'warning',
                        citation: 'Historical engagement comparison',
                        factor: 'historical'
                    },
                    {
                        name: 'Hashtag Analysis',
                        description: 'Found 2 restricted hashtags in recent posts: #crypto, #viral',
                        status: 'warning',
                        citation: 'Hashtag database cross-reference',
                        factor: 'hashtag'
                    },
                    {
                        name: 'IP Risk Assessment',
                        description: 'VPN/Proxy detected - adds risk to account trust score',
                        status: 'warning',
                        citation: 'IP reputation analysis',
                        factor: 'ip'
                    },
                    {
                        name: 'Account Standing',
                        description: 'No permanent restrictions on account',
                        status: 'passed',
                        citation: 'Twitter/X API v2 user lookup',
                        factor: 'api'
                    }
                ],
                recommendations: [
                    { text: 'Remove restricted hashtags (#crypto, #viral) from recent posts.', type: 'warning' },
                    { text: 'Consider disabling VPN when posting to improve trust score.', type: 'warning' },
                    { text: 'Engagement is below baseline - avoid posting for 24-48 hours.', type: 'info' },
                    { text: 'Set up monitoring to track when visibility improves.', type: 'info' }
                ]
            }
        },
        'hashtag': {
            platform: 'Instagram',
            identifier: '#fitness #health...',
            checkType: 'hashtag',
            timestamp: Date.now(),
            ipData: null,
            results: {
                probability: 35,
                status: 'warning',
                statusText: 'Some Hashtags Restricted',
                engineFactors: {
                    api: { active: false, detail: 'Not needed for hashtag checks' },
                    web: { active: true, detail: 'Live visibility tests run' },
                    historical: { active: true, detail: 'Restriction patterns analyzed' },
                    hashtag: { active: true, detail: '1,800+ tags cross-referenced' },
                    ip: { active: false, detail: 'Not needed for hashtag checks' }
                },
                checks: [
                    {
                        name: 'Hashtag Database',
                        description: 'Cross-referenced against 1,800+ known banned/restricted tags',
                        status: 'passed',
                        citation: 'ShadowBanCheck hashtag database',
                        factor: 'hashtag'
                    },
                    {
                        name: 'Instagram Visibility',
                        description: '#likeforlike is restricted on Instagram',
                        status: 'warning',
                        citation: 'Live Instagram search test',
                        factor: 'web'
                    },
                    {
                        name: 'TikTok Visibility',
                        description: '#fyp is over-saturated and may reduce reach',
                        status: 'warning',
                        citation: 'TikTok hashtag analysis',
                        factor: 'web'
                    }
                ],
                recommendations: [
                    { text: 'Remove #likeforlike - it\'s restricted on Instagram.', type: 'warning' },
                    { text: 'Consider alternatives to #fyp for better TikTok reach.', type: 'info' },
                    { text: 'Other hashtags in your set are safe to use.', type: 'success' }
                ]
            }
        }
    };
    
    return demos[platform.toLowerCase()];
}

/* =============================================================================
   LOAD AND DISPLAY RESULTS
   ============================================================================= */
function loadResults() {
    // Check for demo mode first
    if (loadDemoData()) {
        return;
    }
    
    // Try multiple storage keys (different pages use different keys)
    let storedData = sessionStorage.getItem('shadowban_results') || 
                     sessionStorage.getItem('checkResults');
    
    if (!storedData) {
        console.log('No stored results, loading Power Check demo for preview');
        const powerDemo = getDemoDataForPlatform('power');
        if (powerDemo) {
            displayResults(powerDemo);
            showDemoNotice();
            return;
        }
        window.location.href = 'checker.html';
        return;
    }
    
    const data = JSON.parse(storedData);
    
    // Convert new format to old format if needed
    const normalizedData = normalizeResultsData(data);
    
    // Check timestamp - expire after 1 hour
    const timestamp = new Date(normalizedData.timestamp).getTime();
    if (Date.now() - timestamp > 3600000) {
        sessionStorage.removeItem('shadowban_results');
        sessionStorage.removeItem('checkResults');
        window.location.href = 'checker.html';
        return;
    }
    
    displayResults(normalizedData);
}

// Normalize data from different sources into consistent format
function normalizeResultsData(data) {
    // If it's already in the old format, return as-is
    if (data.results && data.results.probability !== undefined) {
        return data;
    }
    
    // Convert new post-checker format to results format
    if (data.type === 'post' || data.type === 'username' || data.type === 'hashtag') {
        return {
            platform: data.platform || 'Unknown',
            identifier: data.query || data.username || 'Unknown',
            checkType: data.type || 'post',
            timestamp: data.timestamp || Date.now(),
            ipData: data.ipData || null,
            results: {
                probability: data.probability || 0,
                status: data.statusClass || 'clean',
                statusText: data.status || 'Analysis Complete',
                engineFactors: convertFactors(data.factors),
                checks: data.checks || [],
                recommendations: (data.recommendations || []).map(r => 
                    typeof r === 'string' ? { text: r, type: 'info' } : r
                )
            }
        };
    }
    
    return data;
}

function convertFactors(factors) {
    if (!factors) return {};
    
    return {
        api: { active: factors.platformAPI || false, detail: 'Platform API analysis' },
        web: { active: factors.webAnalysis || false, detail: 'Web visibility tests' },
        historical: { active: factors.historicalData || false, detail: 'Historical pattern comparison' },
        hashtag: { active: factors.hashtagDatabase || false, detail: 'Hashtag database check' },
        ip: { active: factors.ipAnalysis || false, detail: 'IP and location analysis' }
    };
}

function showDemoNotice() {
    const hero = document.querySelector('.hero .container');
    if (hero) {
        const notice = document.createElement('div');
        notice.className = 'demo-notice';
        notice.style.cssText = 'background: rgba(99, 102, 241, 0.1); border: 1px solid var(--primary); border-radius: 8px; padding: 12px 16px; margin-top: 16px; text-align: center; font-size: 0.875rem; color: var(--text-secondary);';
        notice.innerHTML = '📊 <strong>Demo Data</strong> - Try different check types: <a href="?demo=twitter" style="color: var(--primary-light); margin: 0 8px;">Username</a> | <a href="?demo=power" style="color: var(--primary-light); margin: 0 8px;">Power Check</a> | <a href="?demo=hashtag" style="color: var(--primary-light); margin: 0 8px;">Hashtag</a>';
        hero.appendChild(notice);
    }
}

function displayResults(data) {
    const { platform, identifier, results, checkType, ipData } = data;
    
    const platformIcons = {
        'Instagram': '📸',
        'TikTok': '🎵',
        'Twitter/X': '𝕏',
        'Facebook': '📘',
        'LinkedIn': '💼',
        'YouTube': '📺',
        'Pinterest': '📌',
        'Reddit': '🤖',
        'Threads': '🧵',
        'Email': '📧',
        'Unknown': '🔍'
    };
    
    const checkTypeConfig = CHECK_TYPE_FACTORS[checkType] || CHECK_TYPE_FACTORS['username'];
    
    // Update hero section
    const heroBadge = document.getElementById('results-badge');
    const heroTitle = document.getElementById('results-title');
    const heroSubtitle = document.getElementById('results-subtitle');
    
    if (heroBadge) {
        const checkTypeName = checkType === 'post' ? 'Post' : checkType === 'hashtag' ? 'Hashtag' : 'Account';
        heroBadge.textContent = `📊 ${checkTypeName} Analysis Complete`;
    }
    if (heroTitle) heroTitle.textContent = `${platform} Results`;
    if (heroSubtitle) heroSubtitle.textContent = `Analyzed with ${checkTypeConfig.count}/5 Detection Factors`;
    
    // Update status card
    const statusIcon = document.getElementById('status-icon');
    const statusPlatform = document.getElementById('status-platform');
    const statusQuery = document.getElementById('status-query');
    const probabilityCircle = document.getElementById('probability-circle');
    const probabilityValue = document.getElementById('probability-value');
    const verdictBadge = document.getElementById('verdict-badge');
    const verdictText = document.getElementById('verdict-text');
    
    if (statusIcon) statusIcon.textContent = platformIcons[platform] || '🔍';
    if (statusPlatform) statusPlatform.textContent = platform;
    if (statusQuery) statusQuery.textContent = identifier;
    
    // Status class based on probability
    let statusClass = 'good';
    let statusLabel = 'Likely Visible';
    let statusDescription = 'Your content appears to be in good standing.';
    
    if (results.probability >= 50) {
        statusClass = 'bad';
        statusLabel = 'Likely Restricted';
        statusDescription = 'Significant visibility issues detected. Review recommendations below.';
    } else if (results.probability >= 20) {
        statusClass = 'warning';
        statusLabel = 'Possibly Limited';
        statusDescription = 'Some factors may be affecting your reach. Review the analysis.';
    }
    
    if (probabilityCircle) {
        probabilityCircle.className = `probability-circle ${statusClass}`;
        probabilityCircle.style.setProperty('--probability', results.probability);
    }
    if (probabilityValue) probabilityValue.textContent = `${results.probability}%`;
    if (verdictBadge) {
        verdictBadge.textContent = statusLabel;
        verdictBadge.className = `verdict-badge ${statusClass}`;
    }
    if (verdictText) verdictText.textContent = statusDescription;
    
    // Update 5-Factor Engine Summary
    displayEngineFactors(results.engineFactors, checkType, ipData);
    
    // Update checks grid
    const checksGrid = document.getElementById('checks-grid');
    if (checksGrid && results.checks) {
        checksGrid.innerHTML = results.checks.map(check => {
            const checkStatus = check.status === 'passed' || check.status === 'pass' ? 'pass' : 
                               check.status === 'warning' ? 'warning' : 
                               check.status === 'info' ? 'info' : 'fail';
            
            const statusLabel = checkStatus === 'pass' ? 'Pass' : 
                               checkStatus === 'warning' ? 'Warning' : 
                               checkStatus === 'info' ? 'Info' : 'Issue';
            
            return `
                <div class="check-card ${checkStatus}">
                    <span class="check-icon">${check.icon || '🔍'}</span>
                    <div class="check-content">
                        <div class="check-name">
                            ${check.name}
                            <span class="check-status ${checkStatus}">${statusLabel}</span>
                        </div>
                        <p class="check-detail">${check.detail || check.description || ''}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Update recommendations
    const recommendationsList = document.getElementById('recommendations-list');
    if (recommendationsList && results.recommendations) {
        recommendationsList.innerHTML = results.recommendations.map((rec, index) => {
            const text = typeof rec === 'string' ? rec : rec.text;
            const icons = ['💡', '🎯', '📋', '🔧', '⚡'];
            return `
                <div class="recommendation-item">
                    <span class="recommendation-icon">${icons[index % icons.length]}</span>
                    <p class="recommendation-text">${text}</p>
                </div>
            `;
        }).join('');
    }
    
    // Store data for sharing/download
    window.currentResults = data;
}
                    <p class="check-description">${check.description}</p>
                    ${factorBadge}
                    ${check.citation ? `
                    <div class="check-citation">
                        <span class="check-citation-icon">📄</span>
                        <span>${check.citation}</span>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
    
    // Update recommendations
    const recommendationsContent = document.getElementById('recommendations-content');
    if (recommendationsContent && results.recommendations) {
        recommendationsContent.innerHTML = results.recommendations.map(rec => `
            <div class="recommendation-item ${rec.type}">
                <p class="recommendation-text">${rec.text}</p>
            </div>
        `).join('');
    }
    
    // Setup engine info modal
    setupEngineInfoModal(results.engineFactors, checkType);
}

/* =============================================================================
   5-FACTOR ENGINE DISPLAY
   ============================================================================= */
function displayEngineFactors(engineFactors, checkType, ipData) {
    const factorsRow = document.getElementById('engine-factors-row');
    const factorsBadge = document.getElementById('factors-badge');
    const ipDisplay = document.getElementById('ip-display');
    
    // Count active factors
    let activeCount = 0;
    if (engineFactors) {
        Object.values(engineFactors).forEach(f => {
            if (f && f.active) activeCount++;
        });
    }
    
    // Update factors badge
    if (factorsBadge) {
        factorsBadge.textContent = `${activeCount}/5 Factors`;
    }
    
    // Display factor chips
    if (factorsRow && engineFactors) {
        factorsRow.innerHTML = ENGINE_FACTORS.map(factor => {
            const factorData = engineFactors[factor.id];
            const isActive = factorData?.active || false;
            
            return `
                <div class="factor-chip ${isActive ? 'active' : 'inactive'}">
                    <span>${factor.icon}</span>
                    <span>${factor.shortName}</span>
                </div>
            `;
        }).join('');
    }
    
    // Display IP if IP analysis was used
    if (ipDisplay && ipData && engineFactors?.ip?.active) {
        const typeClass = (ipData.type || 'residential').toLowerCase();
        ipDisplay.innerHTML = `
            <span class="ip-label">🌐 Your IP:</span>
            <div class="ip-value">
                ${ipData.flag ? `<span class="ip-flag">${ipData.flag}</span>` : ''}
                <span>${ipData.ip || 'Unknown'}</span>
                <span class="ip-type-badge ${typeClass}">${ipData.type || 'Residential'}</span>
            </div>
            ${ipData.country ? `<span class="ip-label">${ipData.country}</span>` : ''}
        `;
    } else if (ipDisplay) {
        ipDisplay.style.display = 'none';
    }
    
    // Setup engine info modal
    setupEngineInfoModal(engineFactors, checkType);
}

function setupEngineInfoModal(engineFactors, checkType) {
    const infoBtn = document.getElementById('engine-info-btn');
    const modal = document.getElementById('engine-info-modal');
    const modalFactors = document.getElementById('modal-engine-factors');
    
    if (modalFactors && engineFactors) {
        const checkTypeConfig = CHECK_TYPE_FACTORS[checkType] || CHECK_TYPE_FACTORS['username'];
        
        modalFactors.innerHTML = ENGINE_FACTORS.map(factor => {
            const factorData = engineFactors[factor.id];
            const isActive = factorData?.active || false;
            const desc = isActive 
                ? (factorData.detail || factor.activeDesc)
                : factor.inactiveDesc;
            
            return `
                <li class="${isActive ? 'factor-active' : 'factor-inactive'}">
                    <span class="factor-check">${isActive ? '✓' : '○'}</span>
                    <span class="factor-icon">${factor.icon}</span>
                    <div class="factor-content">
                        <span class="factor-name">${factor.name}</span>
                        <span class="factor-desc">${desc}</span>
                    </div>
                </li>
            `;
        }).join('');
    }
    
    if (infoBtn && modal) {
        infoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
        
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        };
        
        closeBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', closeModal);
    }
}

/* =============================================================================
   ACTIONS
   ============================================================================= */
function initActions() {
    const downloadBtn = document.getElementById('download-report');
    downloadBtn?.addEventListener('click', downloadReport);
    
    const shareBtn = document.getElementById('share-results-btn');
    shareBtn?.addEventListener('click', openShareModal);
    
    initShareModal();
    
    // ESC key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => {
                m.classList.add('hidden');
            });
            document.body.style.overflow = '';
        }
    });
}

function openShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        setupModalCloseHandlers(modal);
    }
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
}

function initShareModal() {
    const storedData = sessionStorage.getItem('shadowban_results');
    
    let shareText, platform, score, status;
    
    if (storedData) {
        const data = JSON.parse(storedData);
        status = data.results.status;
        score = data.results.probability;
        platform = data.platform;
        
        shareText = status === 'clean'
            ? `✅ Just checked my ${platform} account for shadow bans - only ${score}% probability! Check yours free at`
            : status === 'warning'
            ? `⚠️ My ${platform} account has a ${score}% shadow ban probability - some issues detected. Check your account free at`
            : `🚫 My ${platform} account has a ${score}% shadow ban probability. Check your account free at`;
    } else {
        shareText = '🔍 Just checked my social media for shadow bans with the 5-Factor Detection Engine! Check yours free at';
    }
    
    const shareUrl = window.location.origin;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    document.getElementById('share-modal-twitter')?.addEventListener('click', function() {
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank', 'width=600,height=400');
        document.getElementById('share-modal').classList.add('hidden');
        document.body.style.overflow = '';
    });
    
    document.getElementById('share-modal-facebook')?.addEventListener('click', function() {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank', 'width=600,height=400');
        document.getElementById('share-modal').classList.add('hidden');
        document.body.style.overflow = '';
    });
    
    document.getElementById('share-modal-telegram')?.addEventListener('click', function() {
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank', 'width=600,height=400');
        document.getElementById('share-modal').classList.add('hidden');
        document.body.style.overflow = '';
    });
    
    document.getElementById('share-modal-linkedin')?.addEventListener('click', function() {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'width=600,height=400');
        document.getElementById('share-modal').classList.add('hidden');
        document.body.style.overflow = '';
    });
}

function downloadReport() {
    const storedData = sessionStorage.getItem('shadowban_results');
    if (!storedData) return;
    
    const data = JSON.parse(storedData);
    const { platform, identifier, results, checkType, ipData } = data;
    const checkTypeConfig = CHECK_TYPE_FACTORS[checkType] || CHECK_TYPE_FACTORS['username'];
    
    let report = `SHADOW BAN CHECK REPORT
========================
Platform: ${platform}
Account: ${identifier}
Date: ${new Date(data.timestamp).toLocaleString()}
Check Type: ${checkTypeConfig.name}
Overall Status: ${results.statusText}
Shadow Ban Probability: ${results.probability}%

5-FACTOR DETECTION ENGINE
-------------------------
Factors Used: ${checkTypeConfig.count}/5
`;
    
    ENGINE_FACTORS.forEach(factor => {
        const factorData = results.engineFactors?.[factor.id];
        const status = factorData?.active ? '✓ ACTIVE' : '○ Inactive';
        const detail = factorData?.active ? (factorData.detail || factor.activeDesc) : factor.inactiveDesc;
        report += `${factor.icon} ${factor.name}: ${status}\n   ${detail}\n`;
    });
    
    if (ipData && results.engineFactors?.ip?.active) {
        report += `\nIP ANALYSIS\n-----------\nIP: ${ipData.ip}\nType: ${ipData.typeLabel}\n`;
        if (ipData.location) report += `Location: ${ipData.location}\n`;
    }
    
    report += `\nDETAILED CHECKS\n---------------\n`;
    
    results.checks.forEach(check => {
        report += `\n${check.name}: ${check.status.toUpperCase()}\n`;
        report += `  ${check.description}\n`;
        if (check.citation) {
            report += `  Source: ${check.citation}\n`;
        }
    });
    
    report += `\nRECOMMENDATIONS\n---------------\n`;
    
    results.recommendations.forEach((rec, index) => {
        report += `\n${index + 1}. ${rec.text}\n`;
    });
    
    report += `\n------------------------\nPowered by 5-Factor Detection Engine\nGenerated by ShadowBanCheck.io\n${window.location.origin}`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowban-report-${platform.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

/* =============================================================================
   INITIALIZE
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    loadResults();
    initActions();
    
    console.log('✅ Results page initialized with 5-Factor Engine');
});
