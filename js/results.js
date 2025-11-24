// Results Page JavaScript - DEBUG VERSION

let checkResults = null;

// Load and display results
function loadResults() {
    console.log('======================');
    console.log('🔍 RESULTS PAGE LOADED');
    console.log('======================');
    
    // Check if localStorage is available
    if (typeof(Storage) === "undefined") {
        console.error('❌ localStorage not supported!');
        alert('Your browser does not support localStorage. Please use a modern browser.');
        return;
    }
    
    console.log('✅ localStorage is supported');
    
    // List ALL localStorage keys
    console.log('📋 All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`   ${key}:`, value.substring(0, 100) + '...');
    }
    
    // Get results from localStorage
    const resultsData = localStorage.getItem('checkResults');
    
    console.log('📦 Looking for key: "checkResults"');
    console.log('📦 Raw data from localStorage:', resultsData);
    
    if (!resultsData) {
        console.error('❌ NO RESULTS FOUND!');
        console.log('⚠️ This means either:');
        console.log('   1. You visited results.html directly (without running a check)');
        console.log('   2. The checker page did not save data');
        console.log('   3. localStorage was cleared');
        console.log('');
        console.log('💡 TESTING: Creating dummy data...');
        
        // Create test data
        const testData = {
            platform: 'twitter',
            identifier: 'testuser',
            timestamp: new Date().toISOString(),
            status: 'clean',
            checks: {
                searchBan: {
                    status: 'passed',
                    description: 'Your tweets appear in search results'
                },
                searchSuggestion: {
                    status: 'passed',
                    description: 'Your profile appears in search suggestions'
                },
                ghostBan: {
                    status: 'passed',
                    description: 'Your replies are visible to others'
                },
                replyDeboosting: {
                    status: 'passed',
                    description: 'Your replies are not being suppressed'
                }
            },
            details: {
                accountAge: '2 years',
                followers: '1,234',
                lastTweet: '2 hours ago',
                engagementRate: 'Normal'
            }
        };
        
        console.log('📝 Test data created:', testData);
        console.log('');
        console.log('🚨 SHOWING TEST RESULTS (not real data)');
        console.log('   To run a real check, go to checker.html first!');
        
        checkResults = testData;
        displayResults();
        
        // Show warning banner
        showTestWarning();
        
        return;
    }
    
    try {
        checkResults = JSON.parse(resultsData);
        console.log('✅ Successfully parsed results:', checkResults);
        console.log('   Platform:', checkResults.platform);
        console.log('   Identifier:', checkResults.identifier);
        console.log('   Status:', checkResults.status);
        displayResults();
    } catch (error) {
        console.error('❌ Failed to parse results:', error);
        console.error('   Raw data was:', resultsData);
        alert('Error loading results. Data is corrupted. Please try again.');
        setTimeout(() => {
            window.location.href = 'checker.html';
        }, 2000);
    }
}

function showTestWarning() {
    const main = document.querySelector('.main');
    if (main) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            background: #f59e0b;
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.75rem;
            margin-bottom: 2rem;
            text-align: center;
            font-weight: 600;
            border: 2px solid #d97706;
        `;
        warning.innerHTML = '⚠️ SHOWING TEST DATA - This is not a real check result. Go to checker.html to run a real check!';
        main.insertBefore(warning, main.firstChild);
    }
}

function displayResults() {
    console.log('🎨 Displaying results...');
    
    // Display header
    displayHeader();
    
    // Display overall status
    displayOverallStatus();
    
    // Display detailed checks
    displayDetailedChecks();
    
    // Display account details
    displayAccountDetails();
    
    // Display recommendations
    displayRecommendations();
    
    console.log('✅ Results displayed successfully!');
}

function displayHeader() {
    const headerEl = document.getElementById('results-header');
    if (!headerEl) {
        console.error('❌ Could not find #results-header element!');
        return;
    }
    
    const platformEmoji = getPlatformEmoji(checkResults.platform);
    const platformName = getPlatformName(checkResults.platform);
    
    headerEl.innerHTML = `
        <div class="platform-badge-large">
            <span>${platformEmoji}</span>
            <span>${platformName}</span>
        </div>
        <h1>Shadow Ban Check Results</h1>
        <div class="results-meta">
            <span>Account: <strong>${checkResults.identifier}</strong></span>
            <span> • </span>
            <span>Checked: ${new Date(checkResults.timestamp).toLocaleString()}</span>
        </div>
    `;
    console.log('✅ Header displayed');
}

function displayOverallStatus() {
    const statusEl = document.getElementById('overall-status');
    if (!statusEl) {
        console.error('❌ Could not find #overall-status element!');
        return;
    }
    
    const status = checkResults.status;
    
    let icon, title, description;
    
    if (status === 'clean') {
        icon = '✅';
        title = 'All Clear!';
        description = 'No shadow ban detected. Your content is reaching your audience.';
    } else if (status === 'restricted') {
        icon = '🚫';
        title = 'Shadow Ban Detected';
        description = 'Your account has visibility restrictions. See details below.';
    } else if (status === 'issues') {
        icon = '⚠️';
        title = 'Issues Found';
        description = 'Some problems detected that may affect your visibility.';
    } else {
        icon = '❓';
        title = 'Status Unknown';
        description = 'Unable to determine shadow ban status.';
    }
    
    statusEl.innerHTML = `
        <span class="status-icon">${icon}</span>
        <h2 class="status-title ${status}">${title}</h2>
        <p class="status-description">${description}</p>
    `;
    console.log('✅ Overall status displayed');
}

function displayDetailedChecks() {
    const checksGrid = document.getElementById('checks-grid');
    if (!checksGrid) {
        console.error('❌ Could not find #checks-grid element!');
        return;
    }
    
    checksGrid.innerHTML = '';
    
    if (!checkResults.checks) {
        console.warn('⚠️ No checks data found');
        return;
    }
    
    console.log('📊 Displaying checks:', Object.keys(checkResults.checks));
    
    for (const [checkName, checkData] of Object.entries(checkResults.checks)) {
        const checkCard = createCheckCard(checkName, checkData);
        checksGrid.appendChild(checkCard);
    }
    console.log('✅ Detailed checks displayed');
}

function createCheckCard(checkName, checkData) {
    const card = document.createElement('div');
    const status = checkData.status || 'unknown';
    
    let icon;
    if (status === 'passed') {
        icon = '✅';
    } else if (status === 'failed') {
        icon = '❌';
    } else {
        icon = '⚠️';
    }
    
    card.className = `check-card ${status}`;
    card.innerHTML = `
        <div class="check-header">
            <span class="check-name">${formatCheckName(checkName)}</span>
            <span class="check-status-icon">${icon}</span>
        </div>
        <p class="check-description">${checkData.description || 'No description'}</p>
        ${checkData.found !== undefined ? `<p class="check-detail">Found: ${checkData.found}</p>` : ''}
        ${checkData.score !== undefined ? `<p class="check-detail">Score: ${checkData.score}/100</p>` : ''}
    `;
    
    return card;
}

function formatCheckName(name) {
    // Convert camelCase to Title Case
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

function displayAccountDetails() {
    const detailsEl = document.getElementById('account-details');
    if (!detailsEl) {
        console.error('❌ Could not find #account-details element!');
        return;
    }
    
    if (!checkResults.details) {
        console.log('ℹ️ No account details found');
        detailsEl.style.display = 'none';
        return;
    }
    
    console.log('📋 Displaying account details:', Object.keys(checkResults.details));
    
    const detailsGrid = document.createElement('div');
    detailsGrid.className = 'details-grid';
    
    for (const [key, value] of Object.entries(checkResults.details)) {
        const detailItem = document.createElement('div');
        detailItem.className = 'detail-item';
        detailItem.innerHTML = `
            <span class="detail-label">${formatCheckName(key)}</span>
            <span class="detail-value">${value}</span>
        `;
        detailsGrid.appendChild(detailItem);
    }
    
    detailsEl.innerHTML = '<h3>Account Details</h3>';
    detailsEl.appendChild(detailsGrid);
    console.log('✅ Account details displayed');
}

function displayRecommendations() {
    const recommendationsContent = document.getElementById('recommendations-content');
    if (!recommendationsContent) {
        console.error('❌ Could not find #recommendations-content element!');
        return;
    }
    
    const recommendations = generateRecommendations();
    
    console.log('💡 Displaying recommendations:', recommendations.length);
    
    recommendationsContent.innerHTML = '';
    
    recommendations.forEach(rec => {
        const recItem = document.createElement('div');
        recItem.className = `recommendation-item ${rec.type}`;
        recItem.innerHTML = `
            <div class="recommendation-title">${rec.icon} ${rec.title}</div>
            <p class="recommendation-text">${rec.text}</p>
        `;
        recommendationsContent.appendChild(recItem);
    });
    console.log('✅ Recommendations displayed');
}

function generateRecommendations() {
    const recommendations = [];
    
    if (checkResults.status === 'clean') {
        recommendations.push({
            type: 'success',
            icon: '✅',
            title: 'Keep Up the Good Work',
            text: 'Your account is healthy. Continue following platform guidelines and engaging authentically with your audience.'
        });
        
        recommendations.push({
            type: 'success',
            icon: '📊',
            title: 'Monitor Regularly',
            text: 'Check your shadow ban status weekly to catch any issues early. Upgrade to Pro for automated monitoring.'
        });
    }
    
    if (checkResults.status === 'restricted' || checkResults.status === 'issues') {
        recommendations.push({
            type: 'danger',
            icon: '⚠️',
            title: 'Take Immediate Action',
            text: 'Stop all posting and engagement for 48-72 hours. Review your recent content for any potential policy violations.'
        });
        
        recommendations.push({
            type: 'warning',
            icon: '🔍',
            title: 'Review Recent Activity',
            text: 'Check for: rapid following/unfollowing, repetitive content, third-party automation tools, or potential spam behavior.'
        });
        
        recommendations.push({
            type: 'warning',
            icon: '⏰',
            title: 'Wait and Monitor',
            text: 'Most shadow bans lift within 48-72 hours. Use our checker daily to track your recovery progress.'
        });
    }
    
    // Platform-specific recommendations
    if (checkResults.platform === 'twitter') {
        if (checkResults.checks?.searchBan?.status === 'failed') {
            recommendations.push({
                type: 'warning',
                icon: '🔎',
                title: 'Search Ban Detected',
                text: 'Your tweets are hidden from search. Avoid hashtag spam, reduce posting frequency, and focus on quality engagement.'
            });
        }
    }
    
    if (checkResults.platform === 'email') {
        if (checkResults.checks?.blacklists?.found > 0) {
            recommendations.push({
                type: 'danger',
                icon: '📧',
                title: 'Email Blacklisted',
                text: `You're on ${checkResults.checks.blacklists.found} blacklists. Request removal immediately and audit your sending practices.`
            });
        }
        
        if (checkResults.checks?.spfRecord?.status === 'failed') {
            recommendations.push({
                type: 'warning',
                icon: '🔧',
                title: 'Fix SPF Record',
                text: 'Your SPF record is missing or invalid. Configure proper email authentication to improve deliverability.'
            });
        }
    }
    
    // Always add upgrade CTA
    recommendations.push({
        type: 'success',
        icon: '🚀',
        title: 'Upgrade for More Features',
        text: 'Get unlimited checks, historical tracking, automated monitoring, and priority support with our Pro plan.'
    });
    
    return recommendations;
}

function getPlatformEmoji(platform) {
    const emojis = {
        'twitter': '🐦',
        'reddit': '🤖',
        'email': '📧',
        'instagram': '📸',
        'tiktok': '🎵',
        'linkedin': '💼'
    };
    return emojis[platform] || '🔍';
}

function getPlatformName(platform) {
    const names = {
        'twitter': 'Twitter / X',
        'reddit': 'Reddit',
        'email': 'Email',
        'instagram': 'Instagram',
        'tiktok': 'TikTok',
        'linkedin': 'LinkedIn'
    };
    return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
}

// Share results
document.getElementById('share-results')?.addEventListener('click', () => {
    const shareText = `I just checked my ${getPlatformName(checkResults.platform)} account for shadow bans! Status: ${checkResults.status}. Check yours at ShadowBanCheck.io`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Shadow Ban Check Results',
            text: shareText,
            url: window.location.origin
        }).catch(err => console.log('Share cancelled', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Results link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Could not copy to clipboard');
        });
    }
});

// Download report
document.getElementById('download-report')?.addEventListener('click', () => {
    const reportContent = generateReportText();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowban-report-${checkResults.platform}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

function generateReportText() {
    let report = `SHADOW BAN CHECK REPORT\n`;
    report += `========================\n\n`;
    report += `Platform: ${getPlatformName(checkResults.platform)}\n`;
    report += `Account: ${checkResults.identifier}\n`;
    report += `Status: ${checkResults.status.toUpperCase()}\n`;
    report += `Checked: ${new Date(checkResults.timestamp).toLocaleString()}\n\n`;
    
    report += `DETAILED CHECKS:\n`;
    report += `----------------\n`;
    for (const [checkName, checkData] of Object.entries(checkResults.checks || {})) {
        report += `${formatCheckName(checkName)}: ${checkData.status.toUpperCase()}\n`;
        report += `  ${checkData.description}\n\n`;
    }
    
    if (checkResults.details) {
        report += `ACCOUNT DETAILS:\n`;
        report += `----------------\n`;
        for (const [key, value] of Object.entries(checkResults.details)) {
            report += `${formatCheckName(key)}: ${value}\n`;
        }
    }
    
    report += `\n--\nGenerated by ShadowBanCheck.io`;
    return report;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Results page loaded - starting debug mode');
    loadResults();
});
