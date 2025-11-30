/* =============================================================================
   RESULTS.JS - Results Page
   ShadowBanCheck.io
   ============================================================================= */

(function() {
'use strict';

let initialized = false;
let resultData = null;

// ============================================
// INITIALIZATION
// ============================================
function init() {
    if (initialized) return;
    
    if (!window.platformData || !Array.isArray(window.platformData)) {
        console.log('⏳ results.js waiting for platformData...');
        setTimeout(init, 50);
        return;
    }
    
    initialized = true;
    console.log('🚀 Results.js initializing...');
    
    loadResultData();
    renderResults();
    setupEventListeners();
    
    console.log('✅ Results.js initialized');
}

// Multiple init triggers
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('platformsReady', init);
setTimeout(init, 100);
setTimeout(init, 300);

// ============================================
// LOAD RESULT DATA
// ============================================
function loadResultData() {
    // Try to get from session storage first
    const stored = sessionStorage.getItem('lastAnalysisResult');
    if (stored) {
        try {
            resultData = JSON.parse(stored);
            console.log('📊 Loaded result from session:', resultData);
            return;
        } catch (e) {
            console.warn('Failed to parse stored result:', e);
        }
    }
    
    // Fallback: Get from URL params
    const params = new URLSearchParams(window.location.search);
    const platformId = params.get('platform') || 'twitter';
    const checkType = params.get('type') || 'account';
    const username = params.get('username') || '@demo_user';
    
    // Generate demo data
    const platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
    
    resultData = {
        platform: platformId,
        platformName: platform ? platform.name : 'Twitter/X',
        platformIcon: platform ? platform.icon : '𝕏',
        checkType: checkType,
        username: username,
        probability: Math.floor(Math.random() * 40) + 15, // 15-55%
        timestamp: new Date().toISOString(),
        factorsUsed: checkType === 'power' ? 5 : (checkType === 'hashtag' ? 3 : 5),
        factors: generateDemoFactors(platformId, checkType),
        findings: generateDemoFindings(platformId),
        recommendations: generateDemoRecommendations(),
    };
    
    console.log('📊 Generated demo result:', resultData);
}

function generateDemoFactors(platformId, checkType) {
    const isReddit = platformId === 'reddit';
    const isHashtag = checkType === 'hashtag';
    
    // Updated factors - Content & Links replaces IP
    return [
        { 
            name: 'Platform APIs', 
            status: isHashtag ? 'na' : 'complete', 
            finding: isHashtag ? 'Not needed for hashtag checks' : 'Account exists and is active',
            icon: '🔌'
        },
        { 
            name: 'Web Analysis', 
            status: 'complete', 
            finding: 'Search visibility tests passed',
            icon: '🔍'
        },
        { 
            name: 'Historical Data', 
            status: 'complete', 
            finding: 'No historical data (Free tier)',
            icon: '📊'
        },
        { 
            name: 'Hashtag Database', 
            status: isReddit ? 'na' : 'complete', 
            finding: isReddit ? 'N/A for Reddit' : 'No banned hashtags detected',
            icon: '#️⃣'
        },
        { 
            name: 'Content & Links', 
            status: isHashtag ? 'na' : 'complete', 
            finding: isHashtag ? 'Not needed for hashtag checks' : 'Bio and content scanned, no flagged patterns',
            icon: '📝'
        },
    ];
}

function generateDemoFindings(platformId) {
    const findings = [
        { type: 'good', text: 'Account appears in search results' },
        { type: 'good', text: 'Profile accessible to public' },
        { type: 'good', text: 'No flagged content in bio or pinned post' },
    ];
    
    // Add some warnings randomly
    if (Math.random() > 0.5) {
        findings.push({ type: 'warning', text: 'No verification badge detected' });
    }
    if (Math.random() > 0.7) {
        findings.push({ type: 'warning', text: 'Low engagement rate detected' });
    }
    
    return findings;
}

function generateDemoRecommendations() {
    return [
        'Continue posting high-quality content regularly',
        'Engage authentically with your audience',
        'Avoid using known restricted hashtags',
        'Keep your bio free of flagged words and suspicious links',
        'Consider getting verified to improve visibility',
    ];
}

// ============================================
// RENDER RESULTS
// ============================================
function renderResults() {
    if (!resultData) {
        console.error('No result data to render');
        return;
    }
    
    const platform = window.getPlatformById ? window.getPlatformById(resultData.platform) : null;
    const isReddit = resultData.platform === 'reddit';
    
    // Update page title and meta
    updatePageMeta();
    
    // Update breadcrumb
    const breadcrumbPlatform = document.getElementById('breadcrumb-platform');
    if (breadcrumbPlatform) {
        breadcrumbPlatform.textContent = resultData.platformName || 'Platform';
    }
    
    // Update platform badge
    const platformIcon = document.getElementById('result-platform-icon');
    const platformName = document.getElementById('result-platform-name');
    if (platformIcon) platformIcon.textContent = resultData.platformIcon || (platform ? platform.icon : '🔍');
    if (platformName) platformName.textContent = resultData.platformName || 'Platform';
    
    // Update timestamp
    const timestamp = document.getElementById('result-timestamp');
    if (timestamp && resultData.timestamp) {
        const date = new Date(resultData.timestamp);
        timestamp.textContent = `Analyzed: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
        timestamp.setAttribute('datetime', resultData.timestamp);
    }
    
    // Update query (username/hashtags)
    const resultQuery = document.getElementById('result-query');
    if (resultQuery) {
        if (resultData.checkType === 'hashtag' && resultData.hashtags) {
            resultQuery.textContent = resultData.hashtags.slice(0, 5).join(' ');
        } else {
            resultQuery.textContent = resultData.username || '@user';
        }
    }
    
    // Update probability display
    renderProbability();
    
    // Update findings
    renderFindings();
    
    // Update factor breakdown
    renderFactors();
    
    // Update platform-specific sections
    if (isReddit) {
        showRedditSections();
    } else {
        hideRedditSections();
    }
    
    // Show/hide hashtag section based on platform and render results
    const hashtagFactor = document.getElementById('factor-hashtag');
    const methodHashtag = document.getElementById('method-hashtag');
    const hashtagAnalysis = document.getElementById('hashtag-analysis');
    
    if (isReddit) {
        if (hashtagFactor) hashtagFactor.classList.add('factor-na');
        if (methodHashtag) methodHashtag.style.opacity = '0.5';
        if (hashtagAnalysis) hashtagAnalysis.classList.add('hidden');
    } else {
        // Render hashtag analysis for non-Reddit platforms
        renderHashtagAnalysis();
    }
    
    // Show verification section for Twitter
    if (resultData.platform === 'twitter') {
        const verificationSection = document.getElementById('verification-section');
        if (verificationSection) verificationSection.classList.remove('hidden');
    }
    
    // Update recommendations
    renderRecommendations();
    
    // Update permanent URL
    const permanentUrl = document.getElementById('permanent-url');
    if (permanentUrl) {
        const url = `https://shadowbancheck.io/results/${resultData.platform}/${encodeURIComponent(resultData.username || 'analysis')}`;
        permanentUrl.value = url;
    }
    
    // Render content analysis section
    renderContentAnalysis();
}

function renderProbability() {
    const probability = resultData.probability || 28;
    
    // Update probability value
    const probabilityValue = document.getElementById('probability-value');
    const probabilityInline = document.getElementById('probability-inline');
    if (probabilityValue) probabilityValue.textContent = `${probability}%`;
    if (probabilityInline) probabilityInline.textContent = `${probability}%`;
    
    // Update probability ring
    const probabilityCircle = document.getElementById('probability-circle');
    if (probabilityCircle) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (probability / 100) * circumference;
        probabilityCircle.style.strokeDasharray = circumference;
        probabilityCircle.style.strokeDashoffset = offset;
        
        // Color based on probability
        if (probability < 30) {
            probabilityCircle.style.stroke = 'var(--success)';
        } else if (probability < 60) {
            probabilityCircle.style.stroke = 'var(--warning)';
        } else {
            probabilityCircle.style.stroke = 'var(--danger)';
        }
    }
    
    // Update interpretation
    const interpretation = document.getElementById('probability-interpretation');
    if (interpretation) {
        if (probability < 30) {
            interpretation.textContent = 'Most signals indicate normal visibility, with minor concerns detected.';
        } else if (probability < 60) {
            interpretation.textContent = 'Several signals suggest possible visibility restrictions.';
        } else {
            interpretation.textContent = 'Multiple signals indicate likely visibility restrictions.';
        }
    }
    
    // Update verdict badge
    const verdictBadge = document.getElementById('verdict-badge');
    if (verdictBadge) {
        if (probability < 30) {
            verdictBadge.textContent = 'Likely Visible';
            verdictBadge.className = 'verdict-badge good';
        } else if (probability < 60) {
            verdictBadge.textContent = 'Possible Restrictions';
            verdictBadge.className = 'verdict-badge warning';
        } else {
            verdictBadge.textContent = 'Likely Restricted';
            verdictBadge.className = 'verdict-badge danger';
        }
    }
}

function renderFindings() {
    const findingsList = document.getElementById('findings-list');
    if (!findingsList) return;
    
    const findings = resultData.findings || [
        { type: 'good', text: 'Account appears in search results' },
        { type: 'good', text: 'Profile accessible to public' },
    ];
    
    let html = '';
    findings.forEach(finding => {
        const icon = finding.type === 'good' ? '✓' : (finding.type === 'warning' ? '⚠' : '✗');
        html += `<li class="finding-${finding.type}"><span>${icon}</span> <span>${finding.text}</span></li>`;
    });
    
    findingsList.innerHTML = html;
}

function renderFactors() {
    const factors = resultData.factors || generateDemoFactors(resultData.platform, resultData.checkType);
    
    // Map factor data to DOM elements - Updated for Content & Links
    const factorMap = [
        { id: 'factor-api', findingId: 'factor-api-finding' },
        { id: 'factor-web', findingId: 'factor-web-finding' },
        { id: 'factor-historical', findingId: 'factor-historical-finding' },
        { id: 'factor-hashtag', findingId: 'factor-hashtag-finding' },
        { id: 'factor-content', findingId: 'factor-content-finding' }, // Content & Links
    ];
    
    factors.forEach((factor, i) => {
        if (factorMap[i]) {
            const row = document.getElementById(factorMap[i].id);
            const finding = document.getElementById(factorMap[i].findingId);
            
            if (row) {
                const status = row.querySelector('.factor-status');
                if (status) {
                    if (factor.status === 'complete') {
                        status.innerHTML = '<span>✓</span>';
                        status.className = 'factor-status good';
                    } else if (factor.status === 'na') {
                        status.innerHTML = '<span>○</span>';
                        status.className = 'factor-status neutral';
                        row.classList.add('factor-na');
                    } else {
                        status.innerHTML = '<span>⚠</span>';
                        status.className = 'factor-status warning';
                    }
                }
            }
            
            if (finding) {
                finding.textContent = factor.finding || 'Analysis complete';
            }
        }
    });
    
    // Update factors used count
    const factorsUsed = document.getElementById('engine-factors-used');
    if (factorsUsed) {
        factorsUsed.textContent = `${resultData.factorsUsed || 5}/5 factors analyzed`;
    }
}

function renderContentAnalysis() {
    const contentCard = document.getElementById('content-card');
    const contentSummary = document.getElementById('content-summary');
    const contentExplanation = document.getElementById('content-explanation');
    const flaggedItems = document.getElementById('flagged-items');
    const flaggedList = document.getElementById('flagged-list');
    
    if (!contentCard) return;
    
    // Demo content analysis result
    const hasFlags = Math.random() > 0.7; // 30% chance of having flags
    
    if (hasFlags) {
        if (contentSummary) contentSummary.textContent = '1 potential flag detected';
        if (contentExplanation) contentExplanation.textContent = 'We found content that may affect your visibility. Review the flagged items below.';
        
        if (flaggedItems && flaggedList) {
            flaggedItems.classList.remove('hidden');
            flaggedList.innerHTML = `
                <li><strong>Bio link:</strong> Contains link shortener (bit.ly) - some platforms reduce reach for shortened links</li>
            `;
        }
    } else {
        if (contentSummary) contentSummary.textContent = 'No flagged content detected';
        if (contentExplanation) contentExplanation.textContent = 'We scanned bio text, pinned posts, and profile links for flagged words, suspicious domains, and patterns that platforms commonly filter. No problematic content was detected.';
        if (flaggedItems) flaggedItems.classList.add('hidden');
    }
}

function renderHashtagAnalysis() {
    const hashtagSection = document.getElementById('hashtag-analysis');
    const hashtagResults = document.getElementById('hashtag-results');
    const factorHashtagFinding = document.getElementById('factor-hashtag-finding');
    
    if (!hashtagSection || !hashtagResults) return;
    
    // Check if this was a hashtag check or if hashtags were included
    const hashtags = resultData.hashtags || [];
    const hashtagResultsData = resultData.hashtagResults || [];
    
    if (hashtags.length === 0 && hashtagResultsData.length === 0) {
        hashtagSection.classList.add('hidden');
        return;
    }
    
    // Show the section
    hashtagSection.classList.remove('hidden');
    
    // Count banned/restricted
    let bannedCount = resultData.bannedCount || 0;
    let restrictedCount = resultData.restrictedCount || 0;
    let safeCount = resultData.safeCount || 0;
    
    // Update factor finding
    if (factorHashtagFinding) {
        if (bannedCount > 0) {
            factorHashtagFinding.textContent = `${bannedCount} banned hashtag${bannedCount > 1 ? 's' : ''} detected`;
            const factorRow = document.getElementById('factor-hashtag');
            if (factorRow) {
                const status = factorRow.querySelector('.factor-status');
                if (status) {
                    status.className = 'factor-status warning';
                    status.innerHTML = '<span>⚠</span>';
                }
            }
        } else if (restrictedCount > 0) {
            factorHashtagFinding.textContent = `${restrictedCount} restricted hashtag${restrictedCount > 1 ? 's' : ''} detected`;
        } else {
            factorHashtagFinding.textContent = `${safeCount || hashtags.length} hashtag${safeCount !== 1 ? 's' : ''} verified safe`;
        }
    }
    
    // Render hashtag cards
    let html = '<div class="hashtag-cards">';
    
    if (hashtagResultsData.length > 0) {
        // Use detailed results from API
        hashtagResultsData.forEach(h => {
            const statusClass = h.status === 'banned' ? 'danger' : (h.status === 'restricted' ? 'warning' : 'success');
            const statusLabel = h.status === 'banned' ? 'Banned' : (h.status === 'restricted' ? 'Restricted' : 'Safe');
            const confidence = h.confidence || 85;
            const lastVerified = h.lastVerified ? formatTimeAgo(new Date(h.lastVerified)) : 'Just now';
            const source = h.source === 'api' ? 'Real-Time API' : (h.source === 'cache' ? 'Cached' : 'Local DB');
            
            html += `
                <div class="hashtag-card ${statusClass}">
                    <div class="hashtag-card-header">
                        <span class="hashtag-tag">${h.hashtag}</span>
                        <span class="hashtag-status ${statusClass}">${statusLabel}</span>
                    </div>
                    <div class="hashtag-card-meta">
                        <span class="hashtag-confidence">Confidence: ${confidence}%</span>
                        <span class="hashtag-verified">Verified: ${lastVerified}</span>
                    </div>
                    <div class="hashtag-card-source">
                        <small>Source: ${source}</small>
                    </div>
                </div>
            `;
        });
    } else {
        // Fallback: Just show hashtag names
        hashtags.forEach(tag => {
            html += `
                <div class="hashtag-card success">
                    <div class="hashtag-card-header">
                        <span class="hashtag-tag">${tag}</span>
                        <span class="hashtag-status success">Verified</span>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    
    // Add summary
    if (bannedCount > 0 || restrictedCount > 0) {
        html += `
            <div class="hashtag-summary warning">
                <p><strong>⚠️ Impact on probability:</strong> ${bannedCount > 0 ? `${bannedCount} banned` : ''} ${restrictedCount > 0 ? `${restrictedCount} restricted` : ''} hashtag${(bannedCount + restrictedCount) > 1 ? 's' : ''} detected. This increases your shadow ban probability.</p>
            </div>
        `;
    } else {
        html += `
            <div class="hashtag-summary success">
                <p><strong>✓ All clear:</strong> No flagged or restricted hashtags were detected in your content.</p>
            </div>
        `;
    }
    
    hashtagResults.innerHTML = html;
}

function formatTimeAgo(date) {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function renderRecommendations() {
    const recommendationsList = document.getElementById('recommendations-list');
    if (!recommendationsList) return;
    
    const recommendations = resultData.recommendations || [
        'Continue posting high-quality content',
        'Engage authentically with your audience',
    ];
    
    let html = '';
    recommendations.forEach((rec, i) => {
        html += `
            <div class="recommendation-card">
                <span class="recommendation-number">${i + 1}</span>
                <p>${rec}</p>
            </div>
        `;
    });
    
    recommendationsList.innerHTML = html;
}

function showRedditSections() {
    const subredditSection = document.getElementById('subreddit-bans-section');
    const karmaSection = document.getElementById('karma-analysis-section');
    
    if (subredditSection) subredditSection.classList.remove('hidden');
    if (karmaSection) karmaSection.classList.remove('hidden');
    
    // Populate with demo data
    const karmaStat = document.getElementById('total-karma');
    if (karmaStat) karmaStat.textContent = '1,234';
    
    const postKarma = document.getElementById('post-karma');
    if (postKarma) postKarma.textContent = '456';
    
    const commentKarma = document.getElementById('comment-karma');
    if (commentKarma) commentKarma.textContent = '778';
    
    const accountAge = document.getElementById('account-age');
    if (accountAge) accountAge.textContent = '2 years';
    
    const karmaLevel = document.getElementById('karma-level-badge');
    if (karmaLevel) {
        karmaLevel.textContent = 'Medium';
        karmaLevel.className = 'karma-level-badge medium';
    }
}

function hideRedditSections() {
    const subredditSection = document.getElementById('subreddit-bans-section');
    const karmaSection = document.getElementById('karma-analysis-section');
    
    if (subredditSection) subredditSection.classList.add('hidden');
    if (karmaSection) karmaSection.classList.add('hidden');
}

function updatePageMeta() {
    const title = document.getElementById('page-title');
    const description = document.getElementById('page-description');
    
    const platformName = resultData.platformName || 'Platform';
    const query = resultData.username || 'Analysis';
    const probability = resultData.probability || 28;
    
    if (title) {
        document.title = `${query} - ${probability}% Shadow Ban Probability | ShadowBanCheck.io`;
    }
    
    // Update OG tags
    const ogTitle = document.getElementById('og-title');
    if (ogTitle) ogTitle.content = `${query} - ${probability}% Shadow Ban Probability on ${platformName}`;
    
    const twitterTitle = document.getElementById('twitter-title');
    if (twitterTitle) twitterTitle.content = `${query} - ${probability}% Shadow Ban Probability`;
    
    // Update citation date
    const citationDate = document.getElementById('citation-date');
    if (citationDate && resultData.timestamp) {
        citationDate.textContent = new Date(resultData.timestamp).toLocaleDateString();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Share buttons
    const shareTwitterBtn = document.getElementById('share-twitter-btn');
    const shareFacebookBtn = document.getElementById('share-facebook-btn');
    const shareLinkedInBtn = document.getElementById('share-linkedin-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(`My shadow ban probability: ${resultData.probability}% - Check yours at ShadowBanCheck.io`);
    
    if (shareTwitterBtn) {
        shareTwitterBtn.addEventListener('click', () => {
            window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`, '_blank');
        });
    }
    
    if (shareFacebookBtn) {
        shareFacebookBtn.addEventListener('click', () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
        });
    }
    
    if (shareLinkedInBtn) {
        shareLinkedInBtn.addEventListener('click', () => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
        });
    }
    
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const permanentUrl = document.getElementById('permanent-url');
            if (permanentUrl) {
                navigator.clipboard.writeText(permanentUrl.value).then(() => {
                    showToast('Link copied!', 'success');
                }).catch(() => {
                    permanentUrl.select();
                    document.execCommand('copy');
                    showToast('Link copied!', 'success');
                });
            }
        });
    }
    
    // Download report button
    const downloadBtn = document.getElementById('download-report-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            showToast('PDF reports coming soon!', 'info');
        });
    }
    
    // Ask AI button
    const askAiBtn = document.getElementById('ask-ai-btn');
    if (askAiBtn) {
        askAiBtn.addEventListener('click', () => {
            if (typeof window.openShadowAI === 'function') {
                window.openShadowAI();
            } else {
                showToast('Shadow AI coming soon!', 'info');
            }
        });
    }
}

// ============================================
// HELPERS
// ============================================
function showToast(message, type) {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log('Toast:', message, type);
    }
}

})();
