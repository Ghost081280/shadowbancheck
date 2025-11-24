/* =============================================================================
   RESULTS.JS - Results Page Functionality
   ============================================================================= */

/* =============================================================================
   LOAD AND DISPLAY RESULTS
   ============================================================================= */
function loadResults() {
    // Get results from sessionStorage
    const storedData = sessionStorage.getItem('shadowban_results');
    
    if (!storedData) {
        // No results - redirect to checker
        window.location.href = 'checker.html';
        return;
    }
    
    const data = JSON.parse(storedData);
    
    // Check if results are too old (1 hour)
    if (Date.now() - data.timestamp > 3600000) {
        sessionStorage.removeItem('shadowban_results');
        window.location.href = 'checker.html';
        return;
    }
    
    displayResults(data);
}

function displayResults(data) {
    const { url, platform, results } = data;
    
    // Platform icons
    const platformIcons = {
        'Instagram': '📸',
        'TikTok': '🎵',
        'Twitter/X': '🐦',
        'Facebook': '📘',
        'LinkedIn': '💼',
        'YouTube': '▶️',
        'Pinterest': '📌',
        'Reddit': '🤖',
        'Threads': '🧵',
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
            <p class="results-meta">Checked: ${new Date(data.timestamp).toLocaleString()}</p>
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
            'issues': {
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
    
    // Update checks grid
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
                </div>
            `;
        }).join('');
    }
    
    // Update recommendations
    const recommendationsContent = document.getElementById('recommendations-content');
    if (recommendationsContent && results.recommendations) {
        recommendationsContent.innerHTML = results.recommendations.map(rec => `
            <div class="recommendation-item ${rec.type}">
                <div class="recommendation-title">${rec.title}</div>
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
    const { platform, results } = data;
    
    let report = `SHADOW BAN CHECK REPORT
========================
Platform: ${platform}
Date: ${new Date(data.timestamp).toLocaleString()}
Overall Status: ${results.status.toUpperCase()}
Visibility Score: ${results.probability}%

DETAILED CHECKS
---------------
`;
    
    results.checks.forEach(check => {
        report += `\n${check.name}: ${check.status.toUpperCase()}\n`;
        report += `  ${check.description}\n`;
    });
    
    report += `\nRECOMMENDATIONS
---------------
`;
    
    results.recommendations.forEach(rec => {
        report += `\n${rec.title}\n`;
        report += `  ${rec.text}\n`;
    });
    
    report += `\n------------------------\nGenerated by ShadowBanCheck.io`;
    
    // Download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowban-report-${platform.toLowerCase()}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function initShareButtons() {
    const storedData = sessionStorage.getItem('shadowban_results');
    if (!storedData) return;
    
    const data = JSON.parse(storedData);
    const status = data.results.status;
    const score = data.results.probability;
    const platform = data.platform;
    
    const shareText = status === 'clean'
        ? `✅ Just checked my ${platform} for shadow bans - all clear with ${score}% visibility! Check yours at`
        : `🔍 Found some potential issues with my ${platform} account. Got a ${score}% visibility score. Check your account at`;
    
    const shareUrl = window.location.origin;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    document.getElementById('share-twitter-results')?.addEventListener('click', function() {
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank', 'width=600,height=400');
    });
    
    document.getElementById('share-facebook-results')?.addEventListener('click', function() {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank', 'width=600,height=400');
    });
    
    document.getElementById('share-telegram-results')?.addEventListener('click', function() {
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank', 'width=600,height=400');
    });
    
    document.getElementById('share-linkedin-results')?.addEventListener('click', function() {
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
