// Results Page JavaScript

let checkResults = null;

// Load and display results
function loadResults() {
    console.log('🔍 Loading results...');
    
    // Get results from localStorage
    const resultsData = localStorage.getItem('checkResults');
    
    console.log('📦 Raw data from localStorage:', resultsData);
    
    if (!resultsData) {
        console.error('❌ No results found in localStorage');
        alert('No check results found. Please run a check first.');
        window.location.href = 'checker.html';
        return;
    }
    
    try {
        checkResults = JSON.parse(resultsData);
        console.log('✅ Parsed results:', checkResults);
        displayResults();
    } catch (error) {
        console.error('❌ Failed to parse results:', error);
        alert('Error loading results. Please try again.');
        window.location.href = 'checker.html';
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
}

function displayOverallStatus() {
    const statusEl = document.getElementById('overall-status');
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
}

function displayDetailedChecks() {
    const checksGrid = document.getElementById('checks-grid');
    checksGrid.innerHTML = '';
    
    if (!checkResults.checks) {
        console.warn('⚠️ No checks data found');
        return;
    }
    
    console.log('📊 Displaying checks:', checkResults.checks);
    
    for (const [checkName, checkData] of Object.entries(checkResults.checks)) {
        const checkCard = createCheckCard(checkName, checkData);
        checksGrid.appendChild(checkCard);
    }
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
    
    if (!checkResults.details) {
        console.log('ℹ️ No account details found');
        detailsEl.style.display = 'none';
        return;
    }
    
    console.log('📋 Displaying account details:', checkResults.details);
    
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
}

function displayRecommendations() {
    const recommendationsContent = document.getElementById('recommendations-content');
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
    console.log('🚀 Results page loaded');
    loadResults();
});
