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
        factorsUsed: checkType === 'power' ? 5 : (checkType === 'hashtag' ? 3 : 4),
        factors: generateDemoFactors(platformId, checkType),
        findings: generateDemoFindings(platformId),
        recommendations: generateDemoRecommendations(),
    };
    
    console.log('📊 Generated demo result:', resultData);
}

function generateDemoFactors(platformId, checkType) {
    const isReddit = platformId === 'reddit';
    const isHashtag = checkType === 'hashtag';
    
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
            name: 'IP Analysis', 
            status: isHashtag ? 'na' : 'complete', 
            finding: isHashtag ? 'Not needed for hashtag checks' : 'Residential IP detected',
            icon: '🌐'
        },
    ];
}

function generateDemoFindings(platformId) {
    const findings = [
        { type: 'good', text: 'Account appears in search results' },
        { type: 'good', text: 'Profile accessible to public' },
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
    
    // Show/hide hashtag section based on platform
    const hashtagFactor = document.getElementById('factor-hashtag');
    const methodHashtag = document.getElementById('method-hashtag');
    const hashtagAnalysis = document.getElementById('hashtag-analysis');
    
    if (isReddit) {
        if (hashtagFactor) hashtagFactor.classList.add('factor-na');
        if (methodHashtag) methodHashtag.style.opacity = '0.5';
        if (hashtagAnalysis) hashtagAnalysis.classList.add('hidden');
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
    
    // Map factor data to DOM elements
    const factorMap = [
        { id: 'factor-api', findingId: 'factor-api-finding' },
        { id: 'factor-web', findingId: 'factor-web-finding' },
        { id: 'factor-historical', findingId: 'factor-historical-finding' },
        { id: 'factor-hashtag', findingId: 'factor-hashtag-finding' },
        { id: 'factor-ip', findingId: 'factor-ip-finding' },
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
