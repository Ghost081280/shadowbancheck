// =============================================================================
// ShadowBanCheck.io - Results Page JavaScript
// Handles displaying results, sharing, and downloading the report
// =============================================================================

let checkResults = {};

function initResultsPage() {
    loadResults();
    setupShareButtons();
    setupDownload();
}

function loadResults() {
    const stored = localStorage.getItem('checkResults');
    if (!stored) {
        // Redirect if no results are found (e.g., direct access)
        window.location.href = 'checker.html';
        return;
    }
    
    checkResults = JSON.parse(stored);
    displayResults();
    
    // Clean up local storage after display
    // localStorage.removeItem('checkResults'); // Keep for now in case of refresh
}

function displayResults() {
    displayHeader();
    displayOverallStatus();
    displayDetailedChecks();
    displayRecommendations();
    displayUpgradeCta();
}

// ===========================================================================
// DISPLAY FUNCTIONS
// ===========================================================================

function displayHeader() {
    const el = document.getElementById('results-header');
    if (!el) return;
    
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
    if (!el) return;
    
    const prob = checkResults.probability;
    
    let icon, title, desc, statusClass;
    
    if (prob < 20) {
        icon = '✅';
        title = 'Looking Good!';
        desc = 'Your account appears healthy and your content is likely fully visible.';
        statusClass = 'status-clean';
    } else if (prob < 60) {
        icon = '⚠️';
        title = 'Minor Issues Detected';
        desc = `With a ${prob}% risk score, some of your content may have reduced reach. You may be facing a soft ban.`;
        statusClass = 'status-warning';
    } else {
        icon = '🚨';
        title = 'Shadow Ban Detected!';
        desc = `With a ${prob}% risk score, your content is severely restricted. You need to act fast to recover your account.`;
        statusClass = 'status-danger';
    }
    
    el.innerHTML = `
        <div class="status-icon ${statusClass}">${icon}</div>
        <h2 class="status-title ${statusClass}">${title}</h2>
        <p class="status-description">${desc}</p>
        <div class="status-score-wrap">
            <div class="status-score-label">Shadow Ban Probability Score</div>
            <div class="status-score">${prob}%</div>
        </div>
    `;
}

function getCheckDisplay(check, status) {
    let icon, title, desc;
    let statusClass = status === 'pass' ? 'pass' : 'warning';
    
    if (check === 'visibility') {
        title = 'Profile Visibility';
        desc = status === 'pass' 
            ? 'Your profile is fully visible in search results and follower lists.' 
            : 'Potential issues found. Your profile may not appear in search or suggestion lists.';
    } else if (check === 'engagement') {
        title = 'Engagement Reach';
        desc = status === 'pass' 
            ? 'Your posts are reaching a normal percentage of your audience.' 
            : 'Your engagement rate is lower than expected. Your posts may be hidden from non-followers.';
    } else if (check === 'searchability') {
        title = 'Search Indexing';
        desc = status === 'pass' 
            ? 'Your content is being indexed correctly by the platform’s search engine.' 
            : 'Your latest content may not be appearing in hashtag or keyword search results.';
    } else if (check === 'reach') {
        title = 'Overall Reach';
        desc = status === 'pass' 
            ? 'Your content is performing well across all key metrics.' 
            : 'Significant drop in overall post reach, often a sign of a severe ban.';
    }

    icon = status === 'pass' ? '✅' : '⚠️';

    return `
        <div class="check-card status-${statusClass}">
            <div class="check-icon">${icon}</div>
            <div class="check-content">
                <h3 class="check-title">${title}</h3>
                <p class="check-status-message">${desc}</p>
            </div>
            <div class="check-tag status-tag-${statusClass}">${status === 'pass' ? 'PASS' : 'WARNING'}</div>
        </div>
    `;
}

function displayDetailedChecks() {
    const el = document.getElementById('detailed-checks');
    if (!el) return;
    
    let html = '<h2>Detailed Analysis</h2>';
    
    // Check if checks object exists before iterating
    if (checkResults.checks) {
        html += '<div class="check-grid">';
        for (const [key, status] of Object.entries(checkResults.checks)) {
            html += getCheckDisplay(key, status);
        }
        html += '</div>';
    } else {
        html += '<p class="text-muted">Detailed check data not available.</p>';
    }

    el.innerHTML = html;
}

function displayRecommendations() {
    const el = document.getElementById('recommendations-section');
    if (!el) return;
    
    const prob = checkResults.probability;
    let listItems = [];

    if (prob < 20) {
        listItems = [
            'Continue posting high-quality, original content.',
            'Monitor your analytics weekly for any sudden dips in reach.',
            'Use our Hashtag Checker tool before every post.'
        ];
    } else if (prob < 60) {
        listItems = [
            'Take a 48-hour break from posting to cool down the algorithm.',
            'Review and delete any recent posts flagged for warning status.',
            'Limit your use of high-risk hashtags and check them first.',
            'Get Shadow AI Pro to diagnose the exact content that triggered the ban.'
        ];
    } else {
        listItems = [
            'Immediately stop posting for 5-7 days.',
            'Log out and log back in (sometimes this helps reset minor flags).',
            'Delete ALL recent content that could violate community guidelines.',
            '**Get Shadow AI Pro** for a personalized recovery strategy and direct platform appeal templates.'
        ];
    }
    
    let html = '<ul>';
    listItems.forEach(item => {
        // Replace **text** with <strong>text</strong> for formatting
        html += `<li>${item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
    });
    html += '</ul>';
    
    document.getElementById('recommendation-list').innerHTML = html;
}

function displayUpgradeCta() {
    const el = document.getElementById('upgrade-cta-section');
    if (!el) return;
    
    // Only show the CTA if issues were detected
    if (checkResults.probability >= 20) {
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

// ===========================================================================
// SHARE & DOWNLOAD LOGIC
// ===========================================================================

function setupShareButtons() {
    const twitterBtn = document.getElementById('share-twitter');
    const facebookBtn = document.getElementById('share-facebook');
    const resultsURL = window.location.href; // In a real app, this would be a permalink
    const shareText = `Just checked my ${checkResults.platformName} account for a shadow ban on ShadowBanCheck.io! My risk score is ${checkResults.probability}%. See your results: `;

    if (twitterBtn) {
        twitterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resultsURL)}`;
            window.open(twitterUrl, '_blank', 'width=600,height=400');
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Facebook uses a different share endpoint
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resultsURL)}&quote=${encodeURIComponent(shareText)}`;
            window.open(facebookUrl, '_blank', 'width=600,height=400');
        });
    }
}

function setupDownload() {
    const downloadBtn = document.getElementById('download-report-btn');
    if (!downloadBtn) return;
    
    downloadBtn.addEventListener('click', () => {
        const report = generateReport();
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Sanitized filename
        const safeUsername = checkResults.username.replace(/[^a-z0-9]/gi, '_'); 
        a.download = `shadowban-report-${safeUsername}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

function generateReport() {
    const date = new Date(checkResults.timestamp).toLocaleString();
    const statusText = checkResults.status === 'clean' ? 'LOOKING GOOD' : 'ISSUES DETECTED';
    
    let report = `
SHADOW BAN CHECK REPORT
========================
Generated by ShadowBanCheck.io
Platform: ${checkResults.platformName}
Username: ${checkResults.username}
Checked: ${date}

OVERALL RESULT
--------------
Probability Score: ${checkResults.probability}%
Status: ${statusText}

DETAILED CHECKS
---------------
Profile Visibility: ${checkResults.checks.visibility.toUpperCase()}
Engagement Reach: ${checkResults.checks.engagement.toUpperCase()}
Search Indexing: ${checkResults.checks.searchability.toUpperCase()}
Overall Reach: ${checkResults.checks.reach.toUpperCase()}

RECOMMENDATIONS
---------------
`;

    // Duplicate logic from displayRecommendations for the report
    const prob = checkResults.probability;
    let recommendations;

    if (prob < 20) {
        recommendations = [
            'Continue posting high-quality, original content.',
            'Monitor your analytics weekly for any sudden dips in reach.',
            'Use our Hashtag Checker tool before every post.'
        ];
    } else if (prob < 60) {
        recommendations = [
            'Take a 48-hour break from posting to cool down the algorithm.',
            'Review and delete any recent posts flagged for warning status.',
            'Limit your use of high-risk hashtags and check them first.',
            'Consider Shadow AI Pro to diagnose the exact content that triggered the ban.'
        ];
    } else {
        recommendations = [
            'Immediately stop posting for 5-7 days.',
            'Log out and log back in (sometimes this helps reset minor flags).',
            'Delete ALL recent content that could violate community guidelines.',
            'Get Shadow AI Pro for a personalized recovery strategy and direct platform appeal templates.'
        ];
    }
    
    report += recommendations.map(r => `• ${r}`).join('\n');
    report += '\n\n--\nVisit https://shadowbancheck.io for more tools';
    
    return report.trim();
}

// Hook up to main.js for initialization
document.addEventListener('DOMContentLoaded', initResultsPage);
