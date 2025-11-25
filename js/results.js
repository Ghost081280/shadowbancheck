/* =============================================================================
   RESULTS.JS - Results Page Functionality
   ============================================================================= */

/* =============================================================================
   DEMO DATA - FOR TESTING/EDITING
   ============================================================================= */
function loadDemoData() {
    // Check if URL has ?demo=platform parameter
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
            timestamp: Date.now(),
            results: {
                probability: 23,
                status: 'clean',
                statusText: 'No Shadow Ban Detected',
                checks: [
                    {
                        name: 'Search Visibility',
                        description: 'Account appears in search results normally',
                        status: 'passed',
                        citation: 'Twitter/X API v2 search endpoint'
                    },
                    {
                        name: 'Reply Visibility (QFD)',
                        description: 'Replies visible without quality filter restrictions',
                        status: 'passed',
                        citation: 'Third-party QFD detection API'
                    },
                    {
                        name: 'Hashtag Reach',
                        description: 'Posts appear in hashtag search results',
                        status: 'passed',
                        citation: 'Hashtag search crawl + API comparison'
                    },
                    {
                        name: 'Engagement Rate',
                        description: 'Engagement aligns with historical baseline',
                        status: 'passed',
                        citation: 'Historical baseline comparison'
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
            timestamp: Date.now(),
            results: {
                probability: 8,
                status: 'clean',
                statusText: 'No Shadow Ban Detected',
                checks: [
                    {
                        name: 'Site-wide Shadowban',
                        description: 'Account is not shadow banned site-wide',
                        status: 'passed',
                        citation: 'Reddit API + /r/ShadowBan verification'
                    },
                    {
                        name: 'Subreddit Bans',
                        description: 'No active subreddit-specific bans detected',
                        status: 'passed',
                        citation: 'Subreddit API queries'
                    },
                    {
                        name: 'Post Visibility',
                        description: 'Recent posts visible in subreddit feeds',
                        status: 'passed',
                        citation: 'New post crawl test'
                    },
                    {
                        name: 'Karma Status',
                        description: 'Karma accumulation functioning normally',
                        status: 'passed',
                        citation: 'Reddit API user endpoint'
                    }
                ],
                recommendations: [
                    { text: 'Your Reddit account is in excellent standing.', type: 'success' },
                    { text: 'Continue following community guidelines to maintain good status.', type: 'info' },
                    { text: 'Review subreddit-specific rules before posting to avoid issues.', type: 'info' }
                ]
            }
        },
        'email': {
            platform: 'Email',
            identifier: 'contact@example.com',
            timestamp: Date.now(),
            results: {
                probability: 72,
                status: 'warning',
                statusText: 'Potential Issues Detected',
                checks: [
                    {
                        name: 'Blacklist Status',
                        description: 'Domain found on 2 minor blacklists',
                        status: 'warning',
                        citation: 'Spamhaus ZEN + SURBL multi query'
                    },
                    {
                        name: 'IP Reputation',
                        description: 'Sending IP has moderate reputation score',
                        status: 'warning',
                        citation: 'Sender Score + Talos Intelligence'
                    },
                    {
                        name: 'Authentication Setup',
                        description: 'SPF and DKIM configured, DMARC missing',
                        status: 'warning',
                        citation: 'DNS TXT record lookup'
                    },
                    {
                        name: 'Deliverability',
                        description: 'Estimated 68% inbox delivery rate',
                        status: 'warning',
                        citation: 'GlockApps deliverability test'
                    }
                ],
                recommendations: [
                    { text: 'Request removal from detected blacklists through their removal portals.', type: 'warning' },
                    { text: 'Add DMARC record to improve email authentication: v=DMARC1; p=quarantine', type: 'warning' },
                    { text: 'Monitor your sender reputation weekly to catch issues early.', type: 'info' },
                    { text: 'Consider using a dedicated sending IP with proper warm-up.', type: 'info' }
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
    // Try demo data first
    if (loadDemoData()) {
        return;
    }
    
    // Get results from sessionStorage
    const storedData = sessionStorage.getItem('shadowban_results');
    
    if (!storedData) {
        // No results - redirect to checker
        window.location.href = 'checker.html';
        return;
    }
    
    const data = JSON.parse(storedData);
    
    // Check if results are too old (1 hour)
    const timestamp = new Date(data.timestamp).getTime();
    if (Date.now() - timestamp > 3600000) {
        sessionStorage.removeItem('shadowban_results');
        window.location.href = 'checker.html';
        return;
    }
    
    displayResults(data);
}

function displayResults(data) {
    const { platform, identifier, results } = data;
    
    // Platform icons
    const platformIcons = {
        'Instagram': '📸',
        'TikTok': '🎵',
        'Twitter/X': '🐦',
        'Facebook': '📘',
        'LinkedIn': '💼',
        'YouTube': '📺',
        'Pinterest': '📌',
        'Reddit': '🤖',
        'Threads': '🧵',
        'Email': '📧',
        'Unknown': '🔍'
    };
    
    // Update header
    const header = document.getElementById('results-header');
    if (header) {
        header.innerHTML = `
            <div class="platform-badge-large">
                <span>${platformIcons[platform] || '🔍'}</span>
                <span>${platform}</span>
            </div>
            <h1>Shadow Ban Analysis Results</h1>
            <p class="results-meta">Checked: ${new Date(data.timestamp).toLocaleString()} • Account: ${identifier}</p>
        `;
    }
    
    // Update overall status
    const overallStatus = document.getElementById('overall-status');
    if (overallStatus) {
        const statusConfig = {
            'clean': {
                icon: '✅',
                title: 'No Shadow Ban Detected',
                description: 'Your account appears to be in good standing. Your content is being distributed normally.',
                class: 'clean'
            },
            'warning': {
                icon: '⚠️',
                title: 'Potential Issues Found',
                description: 'Some aspects of your account may have reduced visibility. Review the recommendations below.',
                class: 'issues'
            },
            'restricted': {
                icon: '🚫',
                title: 'Restrictions Detected',
                description: 'Your account appears to have significant visibility restrictions. Immediate action recommended.',
                class: 'restricted'
            }
        };
        
        const config = statusConfig[results.status] || statusConfig.clean;
        
        overallStatus.innerHTML = `
            <span class="status-icon">${config.icon}</span>
            <h2 class="status-title ${config.class}">${config.title}</h2>
            <p class="status-description">${config.description}</p>
            <div class="probability-score">
                <span class="score-value">${results.probability}%</span>
                <span class="score-label">Visibility Score</span>
            </div>
        `;
    }
    
    // Update checks grid with citations
    const checksGrid = document.getElementById('checks-grid');
    if (checksGrid && results.checks) {
        checksGrid.innerHTML = results.checks.map(check => {
            const statusIcon = check.status === 'passed' ? '✅' : 
                              check.status === 'warning' ? '⚠️' : '❌';
            
            return `
                <div class="check-card ${check.status}">
                    <div class="check-header">
                        <span class="check-name">${check.name}</span>
                        <span class="check-status-icon">${statusIcon}</span>
                    </div>
                    <p class="check-description">${check.description}</p>
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
}

/* =============================================================================
   ACTIONS
   ============================================================================= */
function initActions() {
    // Download report
    const downloadBtn = document.getElementById('download-report');
    downloadBtn?.addEventListener('click', downloadReport);
    
    // Share buttons
    initShareButtons();
}

function downloadReport() {
    const storedData = sessionStorage.getItem('shadowban_results');
    if (!storedData) return;
    
    const data = JSON.parse(storedData);
    const { platform, identifier, results } = data;
    
    let report = `SHADOW BAN CHECK REPORT
========================
Platform: ${platform}
Account: ${identifier}
Date: ${new Date(data.timestamp).toLocaleString()}
Overall Status: ${results.statusText}
Visibility Score: ${results.probability}%

DETAILED CHECKS
---------------
`;
    
    results.checks.forEach(check => {
        report += `\n${check.name}: ${check.status.toUpperCase()}\n`;
        report += `  ${check.description}\n`;
        if (check.citation) {
            report += `  Citation: ${check.citation}\n`;
        }
    });
    
    report += `\nRECOMMENDATIONS
---------------
`;
    
    results.recommendations.forEach((rec, index) => {
        report += `\n${index + 1}. ${rec.text}\n`;
    });
    
    report += `\n------------------------\nGenerated by ShadowBanCheck.io\n${window.location.origin}`;
    
    // Download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowban-report-${platform.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function initShareButtons() {
    const storedData = sessionStorage.getItem('shadowban_results');
    if (!storedData) {
        // Use generic share messages if no data
        setupGenericShare();
        return;
    }
    
    const data = JSON.parse(storedData);
    const status = data.results.status;
    const score = data.results.probability;
    const platform = data.platform;
    
    // Create share messages with platform and score
    const shareText = status === 'clean'
        ? `✅ Just checked my ${platform} account for shadow bans - got a ${score}% visibility score! Check yours at`
        : status === 'warning'
        ? `⚠️ My ${platform} account has a ${score}% visibility score - some potential issues detected. Check your account at`
        : `🚫 My ${platform} account has a ${score}% visibility score - restrictions detected. Check your account at`;
    
    setupShare(shareText);
}

function setupGenericShare() {
    const shareText = 'Check if your social media accounts are shadow banned with AI-powered detection:';
    setupShare(shareText);
}

function setupShare(shareText) {
    const shareUrl = window.location.origin;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    // Twitter/X
    document.getElementById('share-twitter')?.addEventListener('click', function() {
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank', 'width=600,height=400');
    });
    
    // Facebook
    document.getElementById('share-facebook')?.addEventListener('click', function() {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank', 'width=600,height=400');
    });
    
    // Telegram
    document.getElementById('share-telegram')?.addEventListener('click', function() {
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank', 'width=600,height=400');
    });
    
    // LinkedIn
    document.getElementById('share-linkedin')?.addEventListener('click', function() {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'width=600,height=400');
    });
}

/* =============================================================================
   INITIALIZE
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    loadResults();
    initActions();
    
    console.log('✅ Results page initialized');
});
