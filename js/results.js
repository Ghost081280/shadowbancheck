/* =============================================================================
   RESULTS.JS - Results Page Functionality
   AI-Optimized "Short Answer + Deep Dive" Format
   ============================================================================= */

/* =============================================================================
   INITIALIZATION
   ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    loadResults();
    initActions();
    initShareButtons();
    console.log('✅ Results page initialized');
});

/* =============================================================================
   LOAD RESULTS
   ============================================================================= */
function loadResults() {
    // Try to get results from URL params or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const storedResults = sessionStorage.getItem('shadowban_results');
    
    let results = null;
    
    // Priority: sessionStorage (fresh results), then URL params (for demo/testing)
    if (storedResults) {
        try {
            results = JSON.parse(storedResults);
        } catch (e) {
            console.error('Failed to parse stored results:', e);
        }
    }
    
    // If no stored results, check for demo mode via URL
    if (!results && urlParams.has('demo')) {
        results = generateDemoResults(urlParams.get('demo'));
    }
    
    // If still no results, redirect to home
    if (!results) {
        console.log('No results found, redirecting to home');
        window.location.href = 'index.html';
        return;
    }
    
    // Store for Shadow AI access
    window.latestScanResults = results;
    window.lastSearchType = results.type || 'power';
    
    // Display results
    displayResults(results);
    
    // Update page metadata for SEO/AI
    updatePageMetadata(results);
    
    // Update permanent URL display
    updatePermanentUrl(results);
}

/* =============================================================================
   DISPLAY RESULTS - Short Answer + Deep Dive
   ============================================================================= */
function displayResults(results) {
    const { platform, username, probability, verdict, verdictText, findings, factors, verification, ipData, contentScan } = results;
    
    // === SHORT ANSWER SECTION ===
    
    // Breadcrumb
    const breadcrumbPlatform = document.getElementById('breadcrumb-platform');
    if (breadcrumbPlatform) {
        breadcrumbPlatform.textContent = platform.name;
    }
    
    // Platform badge
    const platformIcon = document.getElementById('result-platform-icon');
    const platformName = document.getElementById('result-platform-name');
    if (platformIcon) platformIcon.textContent = platform.icon;
    if (platformName) platformName.textContent = platform.name;
    
    // Timestamp
    const timestampEl = document.getElementById('result-timestamp');
    if (timestampEl && results.timestamp) {
        const date = new Date(results.timestamp);
        timestampEl.textContent = `Analyzed: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
        timestampEl.setAttribute('datetime', date.toISOString());
    }
    
    // Query/Username
    const queryEl = document.getElementById('result-query');
    if (queryEl) queryEl.textContent = username;
    
    // Probability Ring
    const probabilityValue = document.getElementById('probability-value');
    const probabilityInline = document.getElementById('probability-inline');
    const probabilityCircle = document.getElementById('probability-circle');
    
    if (probabilityValue) probabilityValue.textContent = `${probability}%`;
    if (probabilityInline) probabilityInline.textContent = `${probability}%`;
    
    // Animate probability ring
    if (probabilityCircle) {
        const circumference = 2 * Math.PI * 45; // radius = 45
        const offset = circumference - (probability / 100) * circumference;
        
        setTimeout(() => {
            probabilityCircle.style.strokeDashoffset = offset;
            
            // Color based on probability
            if (probability >= 60) {
                probabilityCircle.classList.add('danger');
            } else if (probability >= 30) {
                probabilityCircle.classList.add('warning');
            }
        }, 100);
    }
    
    // Probability interpretation
    const interpretationEl = document.getElementById('probability-interpretation');
    if (interpretationEl) {
        if (probability < 20) {
            interpretationEl.textContent = 'All 5 signals indicate normal visibility. Your content appears to be reaching your audience without restrictions.';
        } else if (probability < 40) {
            interpretationEl.textContent = 'Most signals look healthy, with minor concerns detected. Content is likely visible but may have slight reach limitations.';
        } else if (probability < 60) {
            interpretationEl.textContent = 'Multiple signals indicate potential visibility issues. Some content may not be reaching your full audience.';
        } else {
            interpretationEl.textContent = 'Significant visibility concerns detected across multiple signals. Content is likely being suppressed or filtered.';
        }
    }
    
    // Verdict badge
    const verdictBadge = document.getElementById('verdict-badge');
    if (verdictBadge) {
        verdictBadge.textContent = verdictText;
        verdictBadge.className = `verdict-badge ${verdict}`;
    }
    
    // Key Findings
    displayFindings(findings);
    
    // Citation date
    const citationDate = document.getElementById('citation-date');
    if (citationDate && results.timestamp) {
        citationDate.textContent = new Date(results.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // === DEEP DIVE SECTION ===
    
    // Engine factors + content scan
    displayFactors(factors, contentScan);
    
    // Platform-specific checks
    displayPlatformChecks(platform, probability, verification);
    
    // Verification section (Twitter-specific)
    displayVerification(verification, platform);
    
    // IP Analysis
    displayIPAnalysis(ipData);
    
    // Recommendations
    displayRecommendations(results);
}

/* =============================================================================
   DISPLAY COMPONENTS
   ============================================================================= */
function displayFindings(findings) {
    const findingsList = document.getElementById('findings-list');
    if (!findingsList || !findings) return;
    
    findingsList.innerHTML = findings.map(f => {
        const icon = f.type === 'good' ? '✓' : f.type === 'warning' ? '⚠' : '✗';
        return `<li class="finding-${f.type}"><span>${icon}</span><span>${f.text}</span></li>`;
    }).join('');
}

function displayFactors(factors, contentScan) {
    if (!factors) return;
    
    const factorConfig = {
        api: { id: 'factor-api', icon: '🔌', name: 'Platform APIs' },
        web: { id: 'factor-web', icon: '🔍', name: 'Web Analysis' },
        historical: { id: 'factor-historical', icon: '📊', name: 'Historical Data' },
        hashtag: { id: 'factor-hashtag', icon: '#️⃣', name: 'Hashtag Database' },
        ip: { id: 'factor-ip', icon: '🌐', name: 'IP Analysis' }
    };
    
    let activeCount = 0;
    let totalSignals = 0;
    
    Object.entries(factors).forEach(([key, data]) => {
        const config = factorConfig[key];
        if (!config) return;
        
        const row = document.getElementById(config.id);
        if (!row) return;
        
        const indicator = row.querySelector('.factor-indicator');
        const finding = row.querySelector('.factor-finding');
        const status = row.querySelector('.factor-status');
        
        if (data.active) {
            activeCount++;
            indicator?.classList.add('active');
            indicator?.classList.remove('inactive');
        } else {
            indicator?.classList.add('inactive');
            indicator?.classList.remove('active');
        }
        
        if (finding) finding.textContent = data.finding || 'Analysis complete';
        
        if (status) {
            status.className = `factor-status ${data.status || 'good'}`;
            status.innerHTML = data.status === 'good' ? '<span>✓</span>' : 
                              data.status === 'warning' ? '<span>⚠</span>' : 
                              data.status === 'bad' ? '<span>✗</span>' : '<span>○</span>';
        }
        
        // Display signals if present
        if (data.signals && data.signals.length > 0) {
            totalSignals += data.signals.length;
            displaySignals(row, data.signals);
        }
    });
    
    // Display content scan if present
    if (contentScan && contentScan.active) {
        displayContentScan(contentScan);
    }
    
    // Update factors count
    const factorsUsed = document.getElementById('engine-factors-used');
    if (factorsUsed) {
        const signalText = totalSignals > 0 ? ` + ${totalSignals} signals` : '';
        factorsUsed.textContent = `${activeCount}/5 factors${signalText} analyzed`;
    }
}

function displaySignals(factorRow, signals) {
    // Check if signals container already exists
    let signalsContainer = factorRow.querySelector('.factor-signals');
    
    if (!signalsContainer) {
        signalsContainer = document.createElement('div');
        signalsContainer.className = 'factor-signals';
        factorRow.appendChild(signalsContainer);
    }
    
    signalsContainer.innerHTML = signals.map(signal => {
        const riskClass = signal.risk === 'high' ? 'bad' : 
                          signal.risk === 'medium' ? 'warning' : 
                          signal.risk === 'trusted' ? 'good' : 'neutral';
        const comingSoonBadge = signal.comingSoon ? '<span class="signal-badge coming-soon">Soon</span>' : '';
        
        return `
            <div class="signal-item ${riskClass} ${signal.comingSoon ? 'coming-soon' : ''}">
                <span class="signal-name">${signal.name}</span>
                <span class="signal-value">${signal.value}</span>
                <span class="signal-impact">${signal.impact}</span>
                ${comingSoonBadge}
            </div>
        `;
    }).join('');
}

function displayContentScan(contentScan) {
    // Find or create content scan section
    let contentSection = document.getElementById('content-scan-section');
    
    if (!contentSection) {
        // Create content scan section after factors
        const factorsSection = document.querySelector('.engine-results');
        if (!factorsSection) return;
        
        contentSection = document.createElement('div');
        contentSection.id = 'content-scan-section';
        contentSection.className = 'content-scan-section';
        factorsSection.parentNode.insertBefore(contentSection, factorsSection.nextSibling);
    }
    
    const statusClass = contentScan.status === 'bad' ? 'bad' : 
                        contentScan.status === 'warning' ? 'warning' : 'good';
    
    const statusIcon = contentScan.status === 'bad' ? '✗' : 
                       contentScan.status === 'warning' ? '⚠' : '✓';
    
    // Build flagged terms display
    let flaggedHTML = '';
    if (contentScan.flaggedTerms) {
        const { banned, restricted, platformSpecific } = contentScan.flaggedTerms;
        
        if (banned && banned.length > 0) {
            flaggedHTML += `
                <div class="flagged-group banned">
                    <span class="flagged-label">Banned:</span>
                    ${banned.map(t => `<span class="flagged-term">${t}</span>`).join('')}
                </div>
            `;
        }
        if (restricted && restricted.length > 0) {
            flaggedHTML += `
                <div class="flagged-group restricted">
                    <span class="flagged-label">Restricted:</span>
                    ${restricted.map(t => `<span class="flagged-term">${t}</span>`).join('')}
                </div>
            `;
        }
        if (platformSpecific && platformSpecific.length > 0) {
            flaggedHTML += `
                <div class="flagged-group platform">
                    <span class="flagged-label">Platform-specific:</span>
                    ${platformSpecific.map(t => `<span class="flagged-term">${t}</span>`).join('')}
                </div>
            `;
        }
    }
    
    contentSection.innerHTML = `
        <div class="content-scan-card ${statusClass}">
            <div class="content-scan-header">
                <div class="content-scan-icon">📄</div>
                <div class="content-scan-title">
                    <h4>Content Scan</h4>
                    <span class="content-scan-badge">${contentScan.wordCount} words analyzed</span>
                </div>
                <div class="content-scan-status ${statusClass}">
                    <span>${statusIcon}</span>
                </div>
            </div>
            <div class="content-scan-finding">${contentScan.finding}</div>
            ${flaggedHTML ? `<div class="content-scan-flagged">${flaggedHTML}</div>` : ''}
            ${contentScan.penalty > 0 ? `<div class="content-scan-penalty">Impact: +${contentScan.penalty}% probability</div>` : ''}
            ${contentScan.scannedContent ? `
                <div class="content-scan-preview">
                    <span class="preview-label">Scanned:</span>
                    <span class="preview-text">"${contentScan.scannedContent.substring(0, 100)}${contentScan.scannedContent.length > 100 ? '...' : ''}"</span>
                </div>
            ` : ''}
        </div>
    `;
}

function displayPlatformChecks(platform, probability, verification) {
    const checksGrid = document.getElementById('checks-grid');
    if (!checksGrid) return;
    
    let checks = [];
    
    if (platform.key === 'twitter') {
        checks = [
            {
                icon: '🔍',
                name: 'Search Visibility',
                status: probability < 40 ? 'pass' : 'warning',
                description: probability < 40 
                    ? 'Account appears in Twitter/X search results' 
                    : 'Reduced visibility in search results detected'
            },
            {
                icon: '💬',
                name: 'Reply Visibility (QFD)',
                status: probability < 50 ? 'pass' : 'warning',
                description: probability < 50 
                    ? 'Replies visible without quality filter restrictions' 
                    : 'Replies may be hidden behind "Show more replies"'
            },
            {
                icon: '👤',
                name: 'Profile Accessibility',
                status: 'pass',
                description: 'Profile is accessible to logged-out users'
            },
            {
                icon: '📊',
                name: 'Engagement Rate',
                status: probability < 30 ? 'pass' : 'warning',
                description: probability < 30 
                    ? 'Engagement aligns with historical baseline' 
                    : 'Engagement below historical baseline'
            },
            {
                icon: verification?.hasCheckmark ? '✓' : '❌',
                name: 'Verification Badge',
                status: verification?.hasCheckmark ? 'pass' : 'warning',
                description: verification?.hasCheckmark 
                    ? `${verification.type === 'blue' ? 'Blue' : verification.type === 'gold' ? 'Gold' : 'Grey'} verification badge detected` 
                    : 'No verification badge (may affect algorithmic visibility)'
            }
        ];
    } else if (platform.key === 'reddit') {
        checks = [
            {
                icon: '🌐',
                name: 'Site-wide Shadowban',
                status: probability < 50 ? 'pass' : 'warning',
                description: probability < 50 
                    ? 'Account is not site-wide shadowbanned' 
                    : 'Potential site-wide restrictions detected'
            },
            {
                icon: '📋',
                name: 'Subreddit Bans',
                status: 'pass',
                description: 'No subreddit-specific bans detected in recent activity'
            },
            {
                icon: '📝',
                name: 'Post Visibility',
                status: probability < 40 ? 'pass' : 'warning',
                description: probability < 40 
                    ? 'Recent posts visible in subreddit feeds' 
                    : 'Some posts may be filtered or removed'
            },
            {
                icon: '⬆️',
                name: 'Karma Status',
                status: 'pass',
                description: 'Karma accumulation appears to be functioning normally'
            }
        ];
    } else {
        // Generic checks
        checks = [
            {
                icon: '👤',
                name: 'Profile Visibility',
                status: probability < 40 ? 'pass' : 'warning',
                description: probability < 40 ? 'Profile accessible to public' : 'Profile may have limited visibility'
            },
            {
                icon: '🔍',
                name: 'Search Presence',
                status: probability < 50 ? 'pass' : 'warning',
                description: probability < 50 ? 'Account appears in search' : 'Search visibility may be reduced'
            }
        ];
    }
    
    checksGrid.innerHTML = checks.map(check => `
        <div class="check-card ${check.status}">
            <span class="check-icon">${check.icon}</span>
            <div class="check-content">
                <h4>${check.name}</h4>
                <p>${check.description}</p>
            </div>
        </div>
    `).join('');
}

function displayVerification(verification, platform) {
    const section = document.getElementById('verification-section');
    if (!section) return;
    
    // Only show for Twitter
    if (platform.key !== 'twitter') {
        section.classList.add('hidden');
        return;
    }
    
    section.classList.remove('hidden');
    
    const card = document.getElementById('verification-card');
    const iconEl = document.getElementById('verification-icon');
    const titleEl = document.getElementById('verification-title');
    const textEl = document.getElementById('verification-text');
    const impactEl = document.getElementById('verification-impact');
    
    if (verification?.hasCheckmark) {
        card?.classList.add('verified');
        
        const badgeType = verification.type === 'blue' ? 'Blue ✓' : 
                         verification.type === 'gold' ? 'Gold ✓ (Organization)' : 
                         'Grey ✓ (Government)';
        
        if (iconEl) iconEl.textContent = '✓';
        if (titleEl) titleEl.textContent = `${badgeType} Verified`;
        if (textEl) textEl.textContent = 'This account has a verification badge, which generally provides improved visibility in search results and recommendations on Twitter/X.';
        if (impactEl) impactEl.textContent = 'Positive factor for visibility';
    } else {
        card?.classList.remove('verified');
        if (iconEl) iconEl.textContent = '❌';
        if (titleEl) titleEl.textContent = 'No Verification Badge';
        if (textEl) textEl.textContent = 'This account does not have a verification badge (Blue ✓, Gold ✓ for organizations, or Grey ✓ for government). On Twitter/X, unverified accounts may receive lower visibility in search results and recommendations compared to verified accounts.';
        if (impactEl) impactEl.textContent = '+5% added to probability score';
    }
}

function displayIPAnalysis(ipData) {
    const section = document.getElementById('ip-analysis');
    if (!section || !ipData) return;
    
    const addressEl = document.getElementById('ip-address');
    const badgeEl = document.getElementById('ip-type-badge');
    const flagEl = document.getElementById('ip-flag');
    const explanationEl = document.getElementById('ip-explanation');
    
    if (addressEl) addressEl.textContent = ipData.ip || 'Unknown';
    
    if (badgeEl) {
        badgeEl.textContent = ipData.typeLabel || 'Unknown';
        badgeEl.className = `ip-type-badge ${ipData.type || 'unknown'}`;
    }
    
    if (flagEl && ipData.countryCode) {
        flagEl.textContent = countryCodeToFlag(ipData.countryCode);
    }
    
    if (explanationEl) {
        if (ipData.isVPN) {
            explanationEl.textContent = 'Your IP appears to be a VPN or proxy connection. Platforms may treat content posted from VPNs with lower trust, potentially affecting visibility. This added +10% to your probability score.';
        } else if (ipData.isDatacenter) {
            explanationEl.textContent = 'Your IP appears to be from a datacenter or hosting provider. Platforms often restrict content from server IPs to prevent automation abuse. This added +15% to your probability score.';
        } else {
            explanationEl.textContent = 'Your IP appears to be a residential connection. Platforms generally trust residential IPs more than VPNs or datacenter IPs, which positively affects content visibility.';
        }
    }
}

function displayRecommendations(results) {
    const list = document.getElementById('recommendations-list');
    if (!list) return;
    
    const { probability, platform, verification, ipData } = results;
    const recommendations = [];
    
    // Based on probability level
    if (probability < 20) {
        recommendations.push({
            type: 'success',
            icon: '✅',
            title: 'Looking Good!',
            text: 'Your account shows healthy signals across all 5 factors. Continue posting quality content and engaging authentically.'
        });
        recommendations.push({
            type: 'info',
            icon: '📊',
            title: 'Set Up Monitoring',
            text: 'Consider setting up regular monitoring to catch any changes early. Pro users get automatic alerts when probability increases.'
        });
    } else if (probability < 40) {
        recommendations.push({
            type: 'info',
            icon: '👀',
            title: 'Minor Concerns Detected',
            text: 'A few signals show minor concerns. This is often temporary and may resolve on its own. Monitor your engagement over the next few days.'
        });
    } else if (probability < 60) {
        recommendations.push({
            type: 'warning',
            icon: '⚠️',
            title: 'Visibility May Be Affected',
            text: 'Multiple signals indicate potential visibility issues. Review your recent content for anything that might trigger algorithmic filters.'
        });
    } else {
        recommendations.push({
            type: 'warning',
            icon: '🚨',
            title: 'Significant Concerns',
            text: 'Multiple signals indicate likely suppression. Consider reviewing platform guidelines and appealing if you believe this is in error.'
        });
    }
    
    // Verification-specific (Twitter)
    if (platform.key === 'twitter' && !verification?.hasCheckmark) {
        recommendations.push({
            type: 'info',
            icon: '✓',
            title: 'Consider Verification',
            text: 'Getting verified on Twitter/X can improve your visibility in search and recommendations. Blue verification is available through Twitter Blue subscription.'
        });
    }
    
    // IP-specific
    if (ipData?.isVPN) {
        recommendations.push({
            type: 'warning',
            icon: '🌐',
            title: 'VPN Detected',
            text: 'Consider disabling your VPN when posting content. Platforms may apply additional scrutiny to content posted from VPN connections.'
        });
    }
    
    // Always add Shadow AI suggestion
    recommendations.push({
        type: 'info',
        icon: '🤖',
        title: 'Ask Shadow AI',
        text: 'Get personalized advice based on your specific results. Shadow AI can analyze your probability factors and suggest targeted recovery steps.'
    });
    
    list.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item ${rec.type}">
            <span class="recommendation-icon">${rec.icon}</span>
            <div class="recommendation-content">
                <h4>${rec.title}</h4>
                <p>${rec.text}</p>
            </div>
        </div>
    `).join('');
}

/* =============================================================================
   PAGE METADATA - SEO & AI Optimization
   ============================================================================= */
function updatePageMetadata(results) {
    const { platform, username, probability, verdictText, timestamp } = results;
    
    // Page title
    const titleEl = document.getElementById('page-title');
    if (titleEl) {
        titleEl.textContent = `${username} on ${platform.name}: ${probability}% Shadow Ban Probability - ShadowBanCheck.io`;
        document.title = titleEl.textContent;
    }
    
    // Meta description
    const descEl = document.getElementById('page-description');
    if (descEl) {
        const desc = `Shadow ban probability analysis for ${username} on ${platform.name}. Result: ${probability}% probability (${verdictText}). Analyzed by 5-Factor Detection Engine on ${new Date(timestamp).toLocaleDateString()}.`;
        descEl.setAttribute('content', desc);
    }
    
    // Open Graph
    const ogTitle = document.getElementById('og-title');
    const ogDesc = document.getElementById('og-description');
    if (ogTitle) ogTitle.setAttribute('content', `${username}: ${probability}% Shadow Ban Probability on ${platform.name}`);
    if (ogDesc) ogDesc.setAttribute('content', `5-Factor Detection Engine analysis: ${verdictText}. Analyzed platform APIs, web visibility, historical data, hashtags, and IP signals.`);
    
    // Twitter Card
    const twitterTitle = document.getElementById('twitter-title');
    const twitterDesc = document.getElementById('twitter-description');
    if (twitterTitle) twitterTitle.setAttribute('content', `${username}: ${probability}% Shadow Ban Probability`);
    if (twitterDesc) twitterDesc.setAttribute('content', `${platform.name} analysis by ShadowBanCheck.io's 5-Factor Detection Engine`);
    
    // Schema.org JSON-LD
    updateSchemaOrg(results);
    
    // Canonical URL
    updateCanonicalUrl(results);
}

function updateSchemaOrg(results) {
    const schemaEl = document.getElementById('schema-json');
    if (!schemaEl) return;
    
    const { platform, username, probability, verdictText, timestamp, findings, factors } = results;
    const dateStr = new Date(timestamp).toISOString();
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": `${username} Shadow Ban Probability Analysis on ${platform.name}`,
        "description": `Shadow ban probability: ${probability}% (${verdictText}). Analysis based on 5-Factor Detection Engine examining platform APIs, web visibility, historical data, hashtag database, and IP analysis.`,
        "author": {
            "@type": "Organization",
            "name": "ShadowBanCheck.io",
            "url": "https://shadowbancheck.io"
        },
        "publisher": {
            "@type": "Organization",
            "name": "ShadowBanCheck.io",
            "logo": {
                "@type": "ImageObject",
                "url": "https://shadowbancheck.io/logo.png"
            }
        },
        "datePublished": dateStr,
        "dateModified": dateStr,
        "mainEntity": {
            "@type": "Thing",
            "name": username,
            "description": `Social media account on ${platform.name}`
        },
        "about": {
            "@type": "Thing",
            "name": "Shadow Ban Analysis",
            "description": "Probability analysis of content visibility restrictions on social media"
        },
        "mentions": [
            {
                "@type": "Thing",
                "name": platform.name,
                "description": "Social media platform"
            }
        ],
        "keywords": `shadow ban, ${platform.name}, probability analysis, content visibility, social media`,
        "isAccessibleForFree": true,
        "creativeWorkStatus": "Published",
        "inLanguage": "en-US"
    };
    
    schemaEl.textContent = JSON.stringify(schema, null, 2);
}

function updateCanonicalUrl(results) {
    const canonicalEl = document.getElementById('canonical-url');
    const ogUrl = document.getElementById('og-url');
    
    // Build canonical URL (placeholder structure until backend)
    const platform = results.platform.key;
    const identifier = results.username.replace('@', '').replace('u/', '');
    const url = `https://shadowbancheck.io/results/${platform}/${encodeURIComponent(identifier)}`;
    
    if (canonicalEl) canonicalEl.setAttribute('href', url);
    if (ogUrl) ogUrl.setAttribute('content', url);
}

function updatePermanentUrl(results) {
    const urlInput = document.getElementById('permanent-url');
    if (!urlInput) return;
    
    const platform = results.platform.key;
    const identifier = results.username.replace('@', '').replace('u/', '');
    const url = `https://shadowbancheck.io/results/${platform}/${encodeURIComponent(identifier)}`;
    
    urlInput.value = url;
}

/* =============================================================================
   ACTIONS
   ============================================================================= */
function initActions() {
    // Download PDF
    document.getElementById('download-report-btn')?.addEventListener('click', downloadReport);
    
    // Ask AI
    document.getElementById('ask-ai-btn')?.addEventListener('click', () => {
        // Open Shadow AI chatbot
        if (typeof window.openShadowAI === 'function') {
            window.openShadowAI();
        } else {
            // Fallback: scroll to AI section or show message
            window.location.href = 'index.html#shadow-ai-pro';
        }
    });
}

function initShareButtons() {
    const results = window.latestScanResults;
    if (!results) return;
    
    const shareUrl = window.location.href;
    const shareText = `My ${results.platform.name} account has a ${results.probability}% shadow ban probability. Check yours free at`;
    
    // Inline share buttons
    document.getElementById('share-twitter-btn')?.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    document.getElementById('share-facebook-btn')?.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    document.getElementById('share-linkedin-btn')?.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    document.getElementById('copy-link-btn')?.addEventListener('click', function() {
        const urlInput = document.getElementById('permanent-url');
        if (urlInput) {
            navigator.clipboard.writeText(urlInput.value).then(() => {
                this.textContent = '✓';
                setTimeout(() => this.textContent = '🔗', 2000);
            });
        }
    });
    
    // Modal share buttons
    document.getElementById('share-modal-twitter')?.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    document.getElementById('share-modal-facebook')?.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    document.getElementById('share-modal-linkedin')?.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    document.getElementById('share-modal-copy')?.addEventListener('click', function() {
        const urlInput = document.getElementById('permanent-url');
        if (urlInput) {
            navigator.clipboard.writeText(urlInput.value).then(() => {
                this.innerHTML = '<span>✓</span><span>Copied!</span>';
                setTimeout(() => this.innerHTML = '<span>📋</span><span>Copy Permanent URL</span>', 2000);
            });
        }
    });
}

function downloadReport() {
    const results = window.latestScanResults;
    if (!results) return;
    
    const { platform, username, probability, verdictText, timestamp, findings, factors, verification, ipData } = results;
    const date = new Date(timestamp);
    
    let report = `SHADOW BAN PROBABILITY REPORT
==============================
Generated by ShadowBanCheck.io 5-Factor Detection Engine

SUMMARY
-------
Platform: ${platform.name}
Account: ${username}
Date: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}

PROBABILITY SCORE: ${probability}%
STATUS: ${verdictText}

KEY FINDINGS
------------
`;
    
    findings.forEach(f => {
        const icon = f.type === 'good' ? '[✓]' : f.type === 'warning' ? '[⚠]' : '[✗]';
        report += `${icon} ${f.text}\n`;
    });
    
    report += `
5-FACTOR DETECTION ENGINE ANALYSIS
----------------------------------
`;
    
    const factorNames = {
        api: 'Platform APIs',
        web: 'Web Analysis',
        historical: 'Historical Data',
        hashtag: 'Hashtag Database',
        ip: 'IP Analysis'
    };
    
    Object.entries(factors).forEach(([key, data]) => {
        const status = data.status === 'good' ? '[✓]' : data.status === 'warning' ? '[⚠]' : '[○]';
        report += `${status} ${factorNames[key]}: ${data.finding}\n`;
    });
    
    if (verification && platform.key === 'twitter') {
        report += `
VERIFICATION STATUS
-------------------
`;
        if (verification.hasCheckmark) {
            report += `[✓] ${verification.type === 'blue' ? 'Blue' : verification.type === 'gold' ? 'Gold' : 'Grey'} verification badge detected\n`;
        } else {
            report += `[⚠] No verification badge (adds +5% to probability)\n`;
        }
    }
    
    if (ipData) {
        report += `
IP ANALYSIS
-----------
IP: ${ipData.ip}
Type: ${ipData.typeLabel}
Location: ${ipData.country || 'Unknown'}
`;
    }
    
    report += `
METHODOLOGY
-----------
This probability score is calculated by analyzing 5 independent signals:
1. Platform APIs - Direct queries to official APIs
2. Web Analysis - Automated browser tests from U.S. servers
3. Historical Data - Comparison against engagement baselines
4. Hashtag Database - Cross-reference against banned/restricted tags
5. IP Analysis - VPN/proxy/datacenter detection

No tool can definitively determine shadow ban status—platforms don't
disclose their algorithms. This probability score represents the
likelihood of restrictions based on observable signals.

---
Report generated by ShadowBanCheck.io
https://shadowbancheck.io
`;
    
    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowban-report-${platform.key}-${username.replace('@', '').replace('u/', '')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

/* =============================================================================
   DEMO DATA GENERATOR
   ============================================================================= */
function generateDemoResults(demoType) {
    const demos = {
        'twitter': {
            type: 'power',
            platform: { name: 'Twitter/X', icon: '𝕏', key: 'twitter', id: 'twitter' },
            url: 'https://twitter.com/example/status/123456789',
            username: '@exampleuser',
            postId: '123456789',
            timestamp: Date.now(),
            probability: 28,
            verdict: 'likely-visible',
            verdictText: 'Likely Visible',
            findings: [
                { type: 'good', text: 'Account appears in search results' },
                { type: 'good', text: 'Profile accessible to public' },
                { type: 'warning', text: 'No verification badge detected (may affect visibility)' }
            ],
            factors: {
                api: { active: true, status: 'good', finding: 'Account active and accessible via Twitter API v2' },
                web: { active: true, status: 'good', finding: 'Search visibility confirmed from U.S. servers' },
                historical: { active: true, status: 'good', finding: 'Engagement within normal baseline' },
                hashtag: { active: true, status: 'good', finding: 'No banned or restricted hashtags detected' },
                ip: { active: true, status: 'good', finding: 'Residential IP verified' }
            },
            verification: { type: 'none', hasCheckmark: false, impact: '+5% added to probability' },
            ipData: { ip: '192.168.1.42', type: 'residential', typeLabel: 'Residential', countryCode: 'US', country: 'United States' }
        },
        'warning': {
            type: 'power',
            platform: { name: 'Twitter/X', icon: '𝕏', key: 'twitter', id: 'twitter' },
            url: 'https://twitter.com/example/status/123456789',
            username: '@testaccount',
            postId: '123456789',
            timestamp: Date.now(),
            probability: 52,
            verdict: 'possibly-limited',
            verdictText: 'Possibly Limited',
            findings: [
                { type: 'good', text: 'Account exists and is accessible' },
                { type: 'warning', text: 'Search visibility below normal' },
                { type: 'warning', text: 'VPN detected - may affect platform trust' }
            ],
            factors: {
                api: { active: true, status: 'good', finding: 'Account status confirmed via API' },
                web: { active: true, status: 'warning', finding: 'Reduced search visibility detected from U.S. servers' },
                historical: { active: true, status: 'warning', finding: 'Engagement 30% below baseline' },
                hashtag: { active: true, status: 'good', finding: 'No problematic hashtags detected' },
                ip: { active: true, status: 'warning', finding: 'VPN detected (+10% probability)' }
            },
            verification: { type: 'none', hasCheckmark: false, impact: '+5% added to probability' },
            ipData: { ip: '10.0.0.1', type: 'vpn', typeLabel: 'VPN/Proxy', countryCode: 'US', country: 'United States', isVPN: true }
        },
        'reddit': {
            type: 'power',
            platform: { name: 'Reddit', icon: '🤖', key: 'reddit', id: 'reddit' },
            url: 'https://reddit.com/user/example',
            username: 'u/exampleuser',
            postId: 'abc123',
            timestamp: Date.now(),
            probability: 15,
            verdict: 'likely-visible',
            verdictText: 'Likely Visible',
            findings: [
                { type: 'good', text: 'Account is not shadowbanned site-wide' },
                { type: 'good', text: 'Posts visible in subreddit feeds' },
                { type: 'good', text: 'Karma accumulation normal' }
            ],
            factors: {
                api: { active: true, status: 'good', finding: 'Account verified via Reddit API' },
                web: { active: true, status: 'good', finding: 'Profile accessible from multiple browsers' },
                historical: { active: true, status: 'good', finding: 'Karma patterns normal' },
                hashtag: { active: false, status: 'inactive', finding: 'N/A for Reddit' },
                ip: { active: true, status: 'good', finding: 'Residential IP verified' }
            },
            verification: null,
            ipData: { ip: '192.168.1.100', type: 'residential', typeLabel: 'Residential', countryCode: 'US', country: 'United States' }
        }
    };
    
    return demos[demoType] || demos['twitter'];
}

/* =============================================================================
   UTILITIES
   ============================================================================= */
function countryCodeToFlag(countryCode) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
