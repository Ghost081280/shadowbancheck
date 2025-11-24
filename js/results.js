// =============================================================================
// ShadowBanCheck.io - Results Page JavaScript
// =============================================================================

let checkResults = {};

document.addEventListener('DOMContentLoaded', () => {
    loadResults();
    setupShareButtons();
    setupDownload();
});

function loadResults() {
    const stored = localStorage.getItem('checkResults');
    if (!stored) {
        window.location.href = 'checker.html';
        return;
    }
    
    checkResults = JSON.parse(stored);
    displayResults();
}

function displayResults() {
    displayHeader();
    displayOverallStatus();
    displayDetailedChecks();
    displayRecommendations();
}

function displayHeader() {
    const el = document.getElementById('results-header');
    const date = new Date(checkResults.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    
    el.innerHTML = `
        <div class="platform-badge-large">${checkResults.platformIcon} ${checkResults.platformName}</div>
        <h1>Results for ${checkResults.username}</h1>
        <p class="results-meta">Checked on ${formattedDate}</p>
    `;
}

function displayOverallStatus() {
    const el = document.getElementById('overall-status');
    const prob = checkResults.probability;
    
    let icon, title, desc, statusClass;
    
    if (prob < 20) {
        icon = '✅'; title = 'Looking Good!'; statusClass = 'clean';
        desc = 'Your account appears to be in good standing. No significant issues detected.';
    } else if (prob < 40) {
        icon = '⚠️'; title = 'Minor Issues Detected'; statusClass = 'issues';
        desc = `We found some potential concerns with a ${prob}% probability of restrictions. Review the details below.`;
    } else {
        icon = '🚫'; title = 'Issues Found'; statusClass = 'restricted';
        desc = `Our analysis shows a ${prob}% probability of shadow ban or restrictions. Take action to improve visibility.`;
    }
    
    el.innerHTML = `
        <span class="status-icon">${icon}</span>
        <h2 class="status-title ${statusClass}">${title}</h2>
        <p class="status-description">${desc}</p>
        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg); border-radius: 0.5rem; display: inline-block;">
            <span style="font-size: 2rem; font-weight: 700; color: var(--primary);">${prob}%</span>
            <span style="color: var(--text-muted); display: block; font-size: 0.875rem;">Probability Score</span>
        </div>
    `;
}

function displayDetailedChecks() {
    const grid = document.getElementById('checks-grid');
    const checks = checkResults.checks;
    
    const checkDetails = {
        visibility: { name: 'Profile Visibility', passDesc: 'Your profile is visible in search results', warnDesc: 'Your profile may have reduced visibility' },
        engagement: { name: 'Engagement Reach', passDesc: 'Your posts are reaching your audience normally', warnDesc: 'Engagement may be limited or suppressed' },
        searchability: { name: 'Search Indexing', passDesc: 'Your content is indexed and searchable', warnDesc: 'Some content may not appear in search' },
        reach: { name: 'Overall Reach', passDesc: 'No restrictions detected on your reach', warnDesc: 'Your reach may be algorithmically reduced' }
    };
    
    grid.innerHTML = Object.entries(checks).map(([key, status]) => {
        const detail = checkDetails[key];
        const isPassed = status === 'pass';
        return `
            <div class="check-card ${isPassed ? 'passed' : 'warning'}">
                <div class="check-header">
                    <span class="check-name">${detail.name}</span>
                    <span class="check-status-icon">${isPassed ? '✅' : '⚠️'}</span>
                </div>
                <p class="check-description">${isPassed ? detail.passDesc : detail.warnDesc}</p>
            </div>
        `;
    }).join('');
}

function displayRecommendations() {
    const el = document.getElementById('recommendations-content');
    const prob = checkResults.probability;
    const checks = checkResults.checks;
    
    let recommendations = [];
    
    if (prob < 20) {
        recommendations.push({ type: 'success', title: '✅ Keep Up the Good Work', text: 'Continue posting quality content and engaging authentically with your audience.' });
        recommendations.push({ type: 'success', title: '📊 Monitor Regularly', text: 'Check your account periodically to catch any issues early.' });
    } else {
        if (checks.visibility === 'warning') {
            recommendations.push({ type: 'warning', title: '👤 Profile Optimization', text: 'Review your bio, profile picture, and display name. Remove any flagged content or links.' });
        }
        if (checks.engagement === 'warning') {
            recommendations.push({ type: 'warning', title: '💬 Engagement Strategy', text: 'Focus on authentic engagement. Avoid rapid liking, following, or commenting patterns.' });
        }
        if (checks.searchability === 'warning') {
            recommendations.push({ type: 'warning', title: '#️⃣ Hashtag Review', text: 'Check if you\'re using any banned or restricted hashtags. Use our Hashtag Checker tool.' });
        }
        if (checks.reach === 'warning') {
            recommendations.push({ type: 'danger', title: '🔄 Account Reset Steps', text: 'Take a brief break from posting, then gradually increase activity with high-quality content.' });
        }
        recommendations.push({ type: 'warning', title: '🤖 Get AI Help', text: 'Shadow AI Pro can provide personalized recovery strategies based on your specific situation.' });
    }
    
    el.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item ${rec.type}">
            <div class="recommendation-title">${rec.title}</div>
            <p class="recommendation-text">${rec.text}</p>
        </div>
    `).join('');
}

function setupShareButtons() {
    const text = `I just checked my ${checkResults.username} for shadow bans on ${checkResults.platformName}! Got a ${checkResults.probability}% probability score. Check yours free: https://shadowbancheck.io`;
    const url = 'https://shadowbancheck.io';
    
    document.getElementById('share-twitter-results')?.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    });
    document.getElementById('share-facebook-results')?.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    });
    document.getElementById('share-telegram-results')?.addEventListener('click', () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    });
    document.getElementById('share-linkedin-results')?.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    });
}

function setupDownload() {
    document.getElementById('download-report')?.addEventListener('click', () => {
        const report = generateReport();
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shadowban-report-${checkResults.username}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

function generateReport() {
    const date = new Date(checkResults.timestamp).toLocaleString();
    return `SHADOW BAN CHECK REPORT
========================
Generated by ShadowBanCheck.io

Platform: ${checkResults.platformName}
Username: ${checkResults.username}
Checked: ${date}

OVERALL RESULT
--------------
Probability Score: ${checkResults.probability}%
Status: ${checkResults.status === 'clean' ? 'Looking Good' : 'Issues Detected'}

DETAILED CHECKS
---------------
Profile Visibility: ${checkResults.checks.visibility === 'pass' ? 'PASS' : 'WARNING'}
Engagement Reach: ${checkResults.checks.engagement === 'pass' ? 'PASS' : 'WARNING'}
Search Indexing: ${checkResults.checks.searchability === 'pass' ? 'PASS' : 'WARNING'}
Overall Reach: ${checkResults.checks.reach === 'pass' ? 'PASS' : 'WARNING'}

RECOMMENDATIONS
---------------
${checkResults.probability < 20 ? '• Your account appears healthy. Continue posting quality content.' : '• Review your recent activity for potential issues.\n• Check hashtags using our Hashtag Checker.\n• Consider Shadow AI Pro for personalized recovery strategies.'}

--
Visit https://shadowbancheck.io for more tools
`;
}
