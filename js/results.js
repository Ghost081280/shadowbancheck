// Results Page JavaScript

// Load results from localStorage
let checkResults = null;

function loadResults() {
    const storedResults = localStorage.getItem('checkResults');
    
    if (!storedResults) {
        // No results found, redirect to checker
        window.location.href = 'checker.html';
        return;
    }
    
    try {
        checkResults = JSON.parse(storedResults);
        displayResults();
    } catch (error) {
        console.error('Error parsing results:', error);
        window.location.href = 'checker.html';
    }
}

function displayResults() {
    if (!checkResults) return;
    
    displayHeader();
    displayOverallStatus();
    displayDetailedChecks();
    displayAccountDetails();
    displayRecommendations();
}

function displayHeader() {
    const headerDiv = document.getElementById('results-header');
    const platformEmojis = {
        twitter: '🐦',
        reddit: '🤖',
        email: '📧',
        instagram: '📸',
        tiktok: '🎵',
        linkedin: '💼'
    };
    
    const platformNames = {
        twitter: 'Twitter / X',
        reddit: 'Reddit',
        email: 'Email',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        linkedin: 'LinkedIn'
    };
    
    const date = new Date(checkResults.timestamp);
    const timeStr = date.toLocaleString();
    
    headerDiv.innerHTML = `
        <div class="platform-badge-large">
            <span>${platformEmojis[checkResults.platform]}</span>
            <span>${platformNames[checkResults.platform]}</span>
        </div>
        <h1>Shadow Ban Check: ${checkResults.identifier}</h1>
        <p class="results-meta">Checked on ${timeStr}</p>
    `;
}

function displayOverallStatus() {
    const statusDiv = document.getElementById('overall-status');
    
    const statusConfig = {
        clean: {
            icon: '✅',
            title: 'All Clear!',
            description: 'No shadow ban detected. Your account appears to be in good standing.',
            class: 'clean'
        },
        restricted: {
            icon: '⚠️',
            title: 'Issues Detected',
            description: 'We found some restrictions on your account. Check the details below.',
            class: 'restricted'
        },
        issues: {
            icon: '⚠️',
            title: 'Some Issues Found',
            description: 'Your account has some issues that may affect visibility. Review recommendations below.',
            class: 'issues'
        },
        error: {
            icon: '❌',
            title: 'Check Failed',
            description: 'Unable to complete the check. Please try again.',
            class: 'restricted'
        }
    };
    
    const config = statusConfig[checkResults.status] || statusConfig.error;
    
    statusDiv.innerHTML = `
        <span class="status-icon">${config.icon}</span>
        <h2 class="status-title ${config.class}">${config.title}</h2>
        <p class="status-description">${config.description}</p>
    `;
}

function displayDetailedChecks() {
    const checksGrid = document.getElementById('checks-grid');
    
    if (!checkResults.checks) {
        checksGrid.innerHTML = '<p>No detailed checks available.</p>';
        return;
    }
    
    let checksHTML = '';
    
    for (const [checkName, checkData] of Object.entries(checkResults.checks)) {
        const statusClass = checkData.status === 'passed' ? 'passed' : 
                          checkData.status === 'failed' ? 'failed' : 'warning';
        const statusIcon = checkData.status === 'passed' ? '✅' : 
                         checkData.status === 'failed' ? '❌' : '⚠️';
        
        const formattedName = checkName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
        
        let detailHTML = '';
        if (checkData.found !== undefined) {
            detailHTML = `<p class="check-detail">Found on ${checkData.found} blacklist(s)</p>`;
        } else if (checkData.score !== undefined) {
            detailHTML = `
                <div class="score-display">
                    <div class="score-circle ${checkData.score >= 70 ? 'high' : checkData.score >= 50 ? 'medium' : 'low'}">
                        ${checkData.score}
                    </div>
                </div>
            `;
        }
        
        checksHTML += `
            <div class="check-card ${statusClass}">
                <div class="check-header">
                    <span class="check-name">${formattedName}</span>
                    <span class="check-status-icon">${statusIcon}</span>
                </div>
                <p class="check-description">${checkData.description}</p>
                ${detailHTML}
            </div>
        `;
    }
    
    checksGrid.innerHTML = checksHTML;
}

function displayAccountDetails() {
    const detailsDiv = document.getElementById('account-details');
    
    if (!checkResults.details) {
        detailsDiv.style.display = 'none';
        return;
    }
    
    let detailsHTML = '<h3>📊 Account Information</h3><div class="details-grid">';
    
    for (const [key, value] of Object.entries(checkResults.details)) {
        const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
        
        detailsHTML += `
            <div class="detail-item">
                <span class="detail-label">${formattedKey}</span>
                <span class="detail-value">${value}</span>
            </div>
        `;
    }
    
    detailsHTML += '</div>';
    detailsDiv.innerHTML = detailsHTML;
}

function displayRecommendations() {
    const recommendationsDiv = document.getElementById('recommendations-content');
    
    const recommendations = generateRecommendations();
    
    if (recommendations.length === 0) {
        recommendationsDiv.innerHTML = `
            <div class="recommendation-item success">
                <div class="recommendation-title">✅ Keep Up The Good Work!</div>
                <p class="recommendation-text">Your account is healthy. Continue following platform guidelines and engaging authentically.</p>
            </div>
        `;
        return;
    }
    
    let recsHTML = '';
    recommendations.forEach(rec => {
        recsHTML += `
            <div class="recommendation-item ${rec.type}">
                <div class="recommendation-title">${rec.icon} ${rec.title}</div>
                <p class="recommendation-text">${rec.text}</p>
            </div>
        `;
    });
    
    recommendationsDiv.innerHTML = recsHTML;
}

function generateRecommendations() {
    const recommendations = [];
    
    if (!checkResults.checks) return recommendations;
    
    // Platform-specific recommendations
    if (checkResults.platform === 'twitter') {
        for (const [checkName, checkData] of Object.entries(checkResults.checks)) {
            if (checkData.status === 'failed') {
                if (checkName === 'searchBan') {
                    recommendations.push({
                        type: 'danger',
                        icon: '🔍',
                        title: 'Search Ban Detected',
                        text: 'Reduce posting frequency for 48-72 hours. Avoid using banned hashtags. Review Twitter\'s spam policy and remove any content that may violate guidelines.'
                    });
                } else if (checkName === 'ghostBan') {
                    recommendations.push({
                        type: 'danger',
                        icon: '👻',
                        title: 'Ghost Ban Active',
                        text: 'Your replies are hidden. Stop using automation tools, reduce reply frequency, and avoid repetitive content. Recovery typically takes 48-72 hours.'
                    });
                } else if (checkName === 'replyDeboosting') {
                    recommendations.push({
                        type: 'warning',
                        icon: '💬',
                        title: 'Reply Suppression',
                        text: 'Engage more authentically. Avoid spammy behavior like copy-pasting replies. Focus on quality over quantity.'
                    });
                }
            }
        }
    } else if (checkResults.platform === 'reddit') {
        for (const [checkName, checkData] of Object.entries(checkResults.checks)) {
            if (checkData.status === 'failed') {
                if (checkName === 'sitewideBan') {
                    recommendations.push({
                        type: 'danger',
                        icon: '🚫',
                        title: 'Site-Wide Shadow Ban',
                        text: 'Contact Reddit admins at reddit.com/appeals. Review site-wide rules. This may be a false positive - verify with moderators.'
                    });
                }
            }
        }
    } else if (checkResults.platform === 'email') {
        for (const [checkName, checkData] of Object.entries(checkResults.checks)) {
            if (checkData.status === 'failed') {
                if (checkName === 'blacklists' && checkData.found > 0) {
                    recommendations.push({
                        type: 'danger',
                        icon: '📧',
                        title: 'Blacklist Detected',
                        text: `Your domain/IP is on ${checkData.found} blacklist(s). Request delisting from each service. Improve email practices: implement authentication, reduce spam complaints, and monitor sender reputation.`
                    });
                } else if (checkName === 'spfRecord') {
                    recommendations.push({
                        type: 'warning',
                        icon: '🔐',
                        title: 'SPF Record Missing',
                        text: 'Add an SPF record to your DNS settings to authorize sending servers. This improves deliverability and reduces spoofing.'
                    });
                } else if (checkName === 'dkimRecord') {
                    recommendations.push({
                        type: 'warning',
                        icon: '🔑',
                        title: 'DKIM Not Configured',
                        text: 'Configure DKIM signatures to verify email authenticity. Contact your email provider or hosting service for setup instructions.'
                    });
                } else if (checkName === 'dmarcRecord') {
                    recommendations.push({
                        type: 'warning',
                        icon: '🛡️',
                        title: 'DMARC Policy Needed',
                        text: 'Implement DMARC to protect your domain from spoofing and improve email security. Start with a monitoring policy (p=none).'
                    });
                }
            }
        }
    }
    
    // General recommendations if status is restricted
    if (checkResults.status === 'restricted' && recommendations.length === 0) {
        recommendations.push({
            type: 'warning',
            icon: '⚠️',
            title: 'Account Under Review',
            text: 'Your account shows signs of restriction. Follow platform guidelines strictly, reduce activity for 48 hours, and avoid automation tools.'
        });
    }
    
    return recommendations;
}

// Share results
document.getElementById('share-results')?.addEventListener('click', () => {
    const shareText = `I just checked my ${checkResults.platform} account for shadow bans! Status: ${checkResults.status}. Check yours at ShadowBanCheck.io`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Shadow Ban Check Results',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Results copied to clipboard!');
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
    report += `Platform: ${checkResults.platform}\n`;
    report += `Account: ${checkResults.identifier}\n`;
    report += `Status: ${checkResults.status}\n`;
    report += `Checked: ${new Date(checkResults.timestamp).toLocaleString()}\n\n`;
    
    report += `DETAILED CHECKS:\n`;
    report += `----------------\n`;
    for (const [checkName, checkData] of Object.entries(checkResults.checks || {})) {
        report += `${checkName}: ${checkData.status.toUpperCase()}\n`;
        report += `  ${checkData.description}\n\n`;
    }
    
    if (checkResults.details) {
        report += `ACCOUNT DETAILS:\n`;
        report += `----------------\n`;
        for (const [key, value] of Object.entries(checkResults.details)) {
            report += `${key}: ${value}\n`;
        }
    }
    
    report += `\n--\nGenerated by ShadowBanCheck.io`;
    return report;
}

// Claude Co-Pilot
const copilotBtn = document.getElementById('claude-copilot-btn');
const copilotChat = document.getElementById('claude-copilot');
const copilotClose = document.getElementById('copilot-close');
const copilotInput = document.getElementById('copilot-input-field');
const copilotSend = document.getElementById('copilot-send');
const copilotMessages = document.getElementById('copilot-messages');

copilotBtn?.addEventListener('click', () => {
    copilotChat.classList.remove('hidden');
    copilotBtn.style.display = 'none';
    copilotInput.focus();
});

copilotClose?.addEventListener('click', () => {
    copilotChat.classList.add('hidden');
    copilotBtn.style.display = 'flex';
});

async function sendMessage() {
    const message = copilotInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    copilotInput.value = '';
    
    const typingId = addTypingIndicator();
    
    try {
        const response = await getCopilotResponse(message);
        removeTypingIndicator(typingId);
        addMessage(response, 'assistant');
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessage('Sorry, I encountered an error.', 'assistant');
    }
    
    copilotMessages.scrollTop = copilotMessages.scrollHeight;
}

copilotSend?.addEventListener('click', sendMessage);
copilotInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `copilot-message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(content);
    
    messageDiv.appendChild(contentDiv);
    copilotMessages.appendChild(messageDiv);
    copilotMessages.scrollTop = copilotMessages.scrollHeight;
}

function formatMessage(text) {
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return text;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'copilot-message assistant';
    typingDiv.id = 'typing-' + Date.now();
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = '...';
    
    typingDiv.appendChild(contentDiv);
    copilotMessages.appendChild(typingDiv);
    
    return typingDiv.id;
}

function removeTypingIndicator(id) {
    document.getElementById(id)?.remove();
}

async function getCopilotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Context-aware responses based on current results
    if (lowerMessage.includes('what') && lowerMessage.includes('mean')) {
        if (checkResults.status === 'restricted') {
            return `Your **${checkResults.platform}** account shows signs of restriction. This means your content visibility is limited. Check the specific failed checks above - each indicates a different type of restriction.\n\nWant help with a specific check?`;
        } else {
            return `Your account is **${checkResults.status}**. ${checkResults.status === 'clean' ? 'No restrictions detected!' : 'Some minor issues found but nothing critical.'}\n\nWhat specifically would you like to know more about?`;
        }
    }
    
    if (lowerMessage.includes('fix') || lowerMessage.includes('recover')) {
        return `**Recovery Steps:**\n\n1. **Stop current activity** for 48-72 hours\n2. **Review platform guidelines** and remove violating content\n3. **Disable automation tools** if you're using any\n4. **Gradually resume** with authentic engagement\n5. **Monitor** your status with our checker\n\nMost shadow bans lift within 48-72 hours. Need platform-specific advice?`;
    }
    
    if (lowerMessage.includes('why') || lowerMessage.includes('cause')) {
        return `**Common Causes:**\n\n- **Automation**: Using bots or third-party tools\n- **Spam behavior**: Repetitive content, excessive posting\n- **Policy violations**: Content against guidelines\n- **Mass actions**: Bulk following/unfollowing\n- **Reports**: User reports about your content\n\nWhich do you think might apply to you?`;
    }
    
    if (lowerMessage.includes('how long')) {
        return `**Shadow Ban Duration:**\n\nMost shadow bans last **48-72 hours** for first-time issues. However:\n\n- Light restrictions: 24-48 hours\n- Moderate bans: 3-7 days\n- Severe/repeat: 2+ weeks\n\nThe key is to stop the triggering behavior immediately and wait patiently.`;
    }
    
    return `I can help you understand:\n- What your results mean\n- Why you might be restricted\n- How to fix specific issues\n- Recovery timeline and steps\n\nWhat would you like to know?`;
}

// Initialize
document.addEventListener('DOMContentLoaded', loadResults);
