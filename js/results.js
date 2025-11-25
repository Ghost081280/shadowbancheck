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
    if (!storedData) return;
    
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
