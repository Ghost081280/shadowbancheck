/* =============================================================================
   RESULTS.JS - Results Page Functionality
   ShadowBanCheck.io
   
   Handles:
   - Loading and displaying analysis results
   - Platform-adaptive section rendering
   - Reddit-specific: subreddit bans, karma analysis (no hashtags)
   - Twitter-specific: engagement test results
   - Sharing and download functionality
   ============================================================================= */

(function() {
'use strict';

// ============================================
// STATE
// ============================================
let resultData = null;
let platform = null;
let initialized = false;

// ============================================
// INITIALIZATION
// ============================================
function init() {
    document.addEventListener('sharedComponentsLoaded', tryInit);
    document.addEventListener('DOMContentLoaded', tryInit);
    document.addEventListener('platformsReady', tryInit);
    
    // Fallback with delays
    setTimeout(tryInit, 100);
    setTimeout(tryInit, 300);
    setTimeout(tryInit, 500);
}

function tryInit() {
    if (initialized) return;
    if (!window.platformData) {
        console.log('⏳ Results: Waiting for platformData...');
        return;
    }
    onComponentsLoaded();
}

function onComponentsLoaded() {
    if (initialized) return;
    initialized = true;
    
    console.log('🚀 Results.js initializing...');
    
    // Load result data
    loadResultData();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Results.js initialized');
}

// ============================================
// LOAD RESULT DATA
// ============================================
function loadResultData() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const platformId = urlParams.get('platform') || 'twitter';
    const isDemo = urlParams.get('demo') === 'true';
    const checkType = urlParams.get('type') || 'account';
    
    // Get platform info
    platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
    
    console.log('📊 Loading results for:', platformId, 'type:', checkType, 'demo:', isDemo);
    
    // Try to get data from session storage
    const storedResult = sessionStorage.getItem('lastAnalysisResult');
    
    if (storedResult) {
        try {
            resultData = JSON.parse(storedResult);
            console.log('✅ Loaded result from session storage');
        } catch (e) {
            console.error('Failed to parse stored result:', e);
        }
    }
    
    // Fallback to demo data if needed
    if (!resultData && isDemo && window.DemoData) {
        const demoCheckType = checkType === 'hashtag' ? 'hashtagCheck' : 
                              checkType === 'power' ? 'powerCheck' : 'accountCheck';
        resultData = window.DemoData.getResult(platformId, demoCheckType);
        console.log('✅ Using demo data for:', demoCheckType);
    }
    
    if (resultData) {
        renderResults();
    } else {
        showNoResults();
    }
}

// ============================================
// RENDER RESULTS
// ============================================
function renderResults() {
    // Update page title and meta
    updatePageMeta();
    
    // Update platform badge
    updatePlatformBadge();
    
    // Update probability display
    updateProbabilityDisplay();
    
    // Update key findings
    updateKeyFindings();
    
    // Update factors breakdown
    updateFactorsBreakdown();
    
    // Platform-specific sections
    renderPlatformSpecificSections();
    
    // Update recommendations
    updateRecommendations();
    
    // Update share URLs
    updateShareUrls();
}

// ============================================
// PAGE META
// ============================================
function updatePageMeta() {
    const username = resultData.username || 'Unknown';
    const probability = resultData.probability || 0;
    const platformName = platform ? platform.name : 'Unknown';
    
    // Title
    document.title = `${username} - ${probability}% Shadow Ban Probability | ShadowBanCheck.io`;
    
    // Meta description
    const metaDesc = document.getElementById('page-description');
    if (metaDesc) {
        metaDesc.content = `Shadow ban probability analysis for ${username} on ${platformName}: ${probability}% probability based on 5-Factor Detection Engine.`;
    }
    
    // Breadcrumb
    const breadcrumbPlatform = document.getElementById('breadcrumb-platform');
    if (breadcrumbPlatform) {
        breadcrumbPlatform.textContent = platformName;
    }
    
    // Timestamp
    const timestamp = document.getElementById('result-timestamp');
    if (timestamp && resultData.timestamp) {
        const date = new Date(resultData.timestamp);
        timestamp.textContent = `Analyzed: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        timestamp.setAttribute('datetime', resultData.timestamp);
    }
    
    // Citation date
    const citationDate = document.getElementById('citation-date');
    if (citationDate && resultData.timestamp) {
        citationDate.textContent = new Date(resultData.timestamp).toLocaleDateString();
    }
    
    // Query (username or post)
    const resultQuery = document.getElementById('result-query');
    if (resultQuery) {
        if (resultData.checkType === 'hashtag') {
            resultQuery.textContent = `${resultData.hashtags ? resultData.hashtags.length : 0} hashtags checked`;
        } else {
            resultQuery.textContent = resultData.username ? `@${resultData.username}` : resultData.postUrl || 'Analysis';
        }
    }
}

// ============================================
// PLATFORM BADGE
// ============================================
function updatePlatformBadge() {
    const platformIcon = document.getElementById('result-platform-icon');
    const platformName = document.getElementById('result-platform-name');
    
    if (platform) {
        if (platformIcon) platformIcon.textContent = platform.icon;
        if (platformName) platformName.textContent = platform.name;
    } else if (resultData) {
        if (platformIcon) platformIcon.textContent = resultData.platformIcon || '📱';
        if (platformName) platformName.textContent = resultData.platformName || 'Unknown';
    }
}

// ============================================
// PROBABILITY DISPLAY
// ============================================
function updateProbabilityDisplay() {
    const probability = resultData.probability || 0;
    
    // Probability value
    const probValue = document.getElementById('probability-value');
    if (probValue) probValue.textContent = `${probability}%`;
    
    // Inline probability
    const probInline = document.getElementById('probability-inline');
    if (probInline) probInline.textContent = `${probability}%`;
    
    // Probability ring
    const probCircle = document.getElementById('probability-circle');
    if (probCircle) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (probability / 100) * circumference;
        probCircle.style.strokeDasharray = circumference;
        probCircle.style.strokeDashoffset = offset;
        
        // Color based on probability
        if (probability <= 30) {
            probCircle.style.stroke = 'var(--success, #22c55e)';
        } else if (probability <= 60) {
            probCircle.style.stroke = 'var(--warning, #f59e0b)';
        } else {
            probCircle.style.stroke = 'var(--danger, #ef4444)';
        }
    }
    
    // Verdict
    const verdictBadge = document.getElementById('verdict-badge');
    if (verdictBadge) {
        const verdict = resultData.verdict || getVerdictText(probability);
        verdictBadge.textContent = verdict;
        verdictBadge.className = `verdict-badge ${resultData.verdictClass || getVerdictClass(probability)}`;
    }
    
    // Interpretation
    const interpretation = document.getElementById('probability-interpretation');
    if (interpretation) {
        interpretation.textContent = getInterpretation(probability);
    }
}

function getVerdictText(probability) {
    if (probability <= 20) return 'Likely Visible';
    if (probability <= 40) return 'Mostly Visible';
    if (probability <= 60) return 'Likely Limited';
    if (probability <= 80) return 'Probably Restricted';
    return 'High Restriction Risk';
}

function getVerdictClass(probability) {
    if (probability <= 40) return 'good';
    if (probability <= 60) return 'warning';
    return 'danger';
}

function getInterpretation(probability) {
    if (probability <= 20) {
        return 'All signals indicate normal visibility. Your content appears to be reaching your audience.';
    }
    if (probability <= 40) {
        return 'Most signals indicate normal visibility, with minor concerns detected.';
    }
    if (probability <= 60) {
        return 'Several signals suggest your visibility may be limited. Review the recommendations below.';
    }
    if (probability <= 80) {
        return 'Multiple signals indicate restrictions. Your content is likely not reaching its full potential audience.';
    }
    return 'Strong indicators of shadow ban detected. Immediate action recommended.';
}

// ============================================
// KEY FINDINGS
// ============================================
function updateKeyFindings() {
    const findingsList = document.getElementById('findings-list');
    if (!findingsList) return;
    
    if (!resultData.keyFindings || resultData.keyFindings.length === 0) {
        // Generate default findings based on probability
        const probability = resultData.probability || 0;
        const defaultFindings = [];
        
        if (probability <= 30) {
            defaultFindings.push({ status: 'good', text: 'Account appears to have normal visibility' });
            defaultFindings.push({ status: 'good', text: 'No major restrictions detected' });
        } else if (probability <= 60) {
            defaultFindings.push({ status: 'warning', text: 'Some visibility concerns detected' });
            defaultFindings.push({ status: 'neutral', text: 'Review recommendations below' });
        } else {
            defaultFindings.push({ status: 'warning', text: 'Multiple restriction signals detected' });
            defaultFindings.push({ status: 'warning', text: 'Visibility may be significantly limited' });
        }
        
        resultData.keyFindings = defaultFindings;
    }
    
    let html = '';
    resultData.keyFindings.forEach(finding => {
        const statusClass = finding.status === 'good' ? 'finding-good' : 
                           finding.status === 'warning' ? 'finding-warning' : 'finding-neutral';
        const icon = finding.status === 'good' ? '✓' : 
                    finding.status === 'warning' ? '⚠' : '○';
        
        html += `<li class="${statusClass}"><span>${icon}</span> <span>${finding.text}</span></li>`;
    });
    
    findingsList.innerHTML = html;
}

// ============================================
// FACTORS BREAKDOWN
// ============================================
function updateFactorsBreakdown() {
    const isReddit = platform && platform.id === 'reddit';
    const checkType = resultData.checkType || 'account';
    
    // Update factors used count
    const factorsUsed = document.getElementById('engine-factors-used');
    if (factorsUsed) {
        const count = resultData.factorsUsed || (isReddit ? 4 : 5);
        factorsUsed.textContent = `${count}/5 factors analyzed`;
    }
    
    if (!resultData.factors) {
        // Generate placeholder factors if not available
        generatePlaceholderFactors(isReddit, checkType);
        return;
    }
    
    const factors = resultData.factors;
    
    // API Factor
    updateFactor('factor-api', factors.api);
    
    // Web Factor
    updateFactor('factor-web', factors.web);
    
    // Historical Factor
    updateFactor('factor-historical', factors.historical);
    
    // Hashtag Factor - Hide for Reddit
    const hashtagFactor = document.getElementById('factor-hashtag');
    if (hashtagFactor) {
        if (isReddit || !factors.hashtag) {
            hashtagFactor.classList.add('factor-na');
            const finding = hashtagFactor.querySelector('.factor-finding');
            if (finding) finding.textContent = 'Not applicable for Reddit (no hashtags)';
            const status = hashtagFactor.querySelector('.factor-status');
            if (status) {
                status.innerHTML = '<span>—</span>';
                status.className = 'factor-status na';
            }
        } else {
            updateFactor('factor-hashtag', factors.hashtag);
        }
    }
    
    // IP Factor
    updateFactor('factor-ip', factors.ip);
}

function generatePlaceholderFactors(isReddit, checkType) {
    const probability = resultData.probability || 0;
    const status = probability <= 40 ? 'good' : probability <= 60 ? 'neutral' : 'warning';
    
    // API
    const apiEl = document.getElementById('factor-api');
    if (apiEl) {
        const finding = apiEl.querySelector('.factor-finding');
        if (finding) finding.textContent = 'API check completed';
        const statusEl = apiEl.querySelector('.factor-status');
        if (statusEl) {
            statusEl.innerHTML = '<span>✓</span>';
            statusEl.className = `factor-status ${status}`;
        }
    }
    
    // Web
    const webEl = document.getElementById('factor-web');
    if (webEl) {
        const finding = webEl.querySelector('.factor-finding');
        if (finding) finding.textContent = 'Web visibility analysis completed';
        const statusEl = webEl.querySelector('.factor-status');
        if (statusEl) {
            statusEl.innerHTML = '<span>✓</span>';
            statusEl.className = `factor-status ${status}`;
        }
    }
    
    // Historical
    const histEl = document.getElementById('factor-historical');
    if (histEl) {
        const finding = histEl.querySelector('.factor-finding');
        if (finding) finding.textContent = 'No historical data (Free tier)';
        const statusEl = histEl.querySelector('.factor-status');
        if (statusEl) {
            statusEl.innerHTML = '<span>○</span>';
            statusEl.className = 'factor-status neutral';
        }
    }
    
    // Hashtag
    const hashtagEl = document.getElementById('factor-hashtag');
    if (hashtagEl) {
        if (isReddit) {
            hashtagEl.classList.add('factor-na');
            const finding = hashtagEl.querySelector('.factor-finding');
            if (finding) finding.textContent = 'Not applicable for Reddit';
            const statusEl = hashtagEl.querySelector('.factor-status');
            if (statusEl) {
                statusEl.innerHTML = '<span>—</span>';
                statusEl.className = 'factor-status na';
            }
        } else {
            const finding = hashtagEl.querySelector('.factor-finding');
            if (finding) finding.textContent = 'Hashtag analysis completed';
            const statusEl = hashtagEl.querySelector('.factor-status');
            if (statusEl) {
                statusEl.innerHTML = '<span>✓</span>';
                statusEl.className = `factor-status ${status}`;
            }
        }
    }
    
    // IP
    const ipEl = document.getElementById('factor-ip');
    if (ipEl) {
        const finding = ipEl.querySelector('.factor-finding');
        if (finding) finding.textContent = 'Connection analysis completed';
        const statusEl = ipEl.querySelector('.factor-status');
        if (statusEl) {
            statusEl.innerHTML = '<span>✓</span>';
            statusEl.className = 'factor-status good';
        }
    }
}

function updateFactor(factorId, data) {
    const factorEl = document.getElementById(factorId);
    if (!factorEl || !data) return;
    
    const finding = factorEl.querySelector('.factor-finding');
    if (finding) finding.textContent = data.finding || 'Analysis completed';
    
    const status = factorEl.querySelector('.factor-status');
    if (status) {
        const statusClass = data.status === 'good' ? 'good' : 
                           data.status === 'warning' ? 'warning' : 
                           data.status === 'neutral' ? 'neutral' : 'danger';
        const icon = data.status === 'good' ? '✓' : 
                    data.status === 'warning' ? '⚠' : '○';
        status.innerHTML = `<span>${icon}</span>`;
        status.className = `factor-status ${statusClass}`;
    }
}

// ============================================
// PLATFORM-SPECIFIC SECTIONS
// ============================================
function renderPlatformSpecificSections() {
    const isReddit = platform && platform.id === 'reddit';
    const isTwitter = platform && platform.id === 'twitter';
    
    // Reddit-specific sections
    if (isReddit) {
        renderSubredditBans();
        renderKarmaAnalysis();
        hideHashtagSection();
        hideMethodHashtag();
    } else {
        hideRedditSections();
    }
    
    // Twitter-specific sections
    if (isTwitter) {
        renderEngagementTestResults();
        renderVerificationSection();
    }
    
    // Content scan (if available)
    if (resultData.contentScan) {
        renderContentScan();
    }
    
    // Hashtag analysis (if available and not Reddit)
    if (!isReddit && resultData.checkType === 'hashtag' && resultData.hashtagResults) {
        renderHashtagResults();
    } else if (!isReddit && resultData.factors && resultData.factors.hashtag && resultData.factors.hashtag.flaggedHashtags) {
        renderHashtagAnalysis();
    }
    
    // IP Analysis
    renderIpAnalysis();
    
    // Platform checks
    renderPlatformChecks();
}

// ============================================
// HASHTAG RESULTS (for hashtag check type)
// ============================================
function renderHashtagResults() {
    const section = document.getElementById('hashtag-analysis');
    const results = document.getElementById('hashtag-results');
    
    if (!section || !results) return;
    
    if (resultData.hashtagResults && resultData.hashtagResults.length > 0) {
        section.classList.remove('hidden');
        
        let html = '<div class="hashtag-items">';
        resultData.hashtagResults.forEach(h => {
            const statusClass = h.status === 'banned' ? 'danger' : 
                               h.status === 'restricted' ? 'warning' : 
                               h.status === 'warning' ? 'caution' : 'safe';
            html += `
                <div class="hashtag-item ${statusClass}">
                    <span class="hashtag">#${h.hashtag}</span>
                    <span class="status-badge ${statusClass}">${h.status}</span>
                    <span class="reason">${h.reason}</span>
                </div>
            `;
        });
        html += '</div>';
        
        results.innerHTML = html;
    } else {
        section.classList.add('hidden');
    }
}

// ============================================
// REDDIT-SPECIFIC SECTIONS
// ============================================
function renderSubredditBans() {
    const section = document.getElementById('subreddit-bans-section');
    const list = document.getElementById('subreddit-bans-list');
    
    if (!section || !list) return;
    
    if (resultData.subredditBans && resultData.subredditBans.found > 0) {
        section.classList.remove('hidden');
        
        let html = '';
        resultData.subredditBans.bans.forEach(ban => {
            html += `
                <div class="subreddit-ban-item">
                    <span class="subreddit-name">${ban.subreddit}</span>
                    <span class="ban-type">${ban.type.replace('_', ' ')}</span>
                    <span class="ban-reason">${ban.reason}</span>
                    ${ban.canAppeal ? '<span class="ban-appeal">Can appeal</span>' : ''}
                </div>
            `;
        });
        list.innerHTML = html;
    } else {
        section.classList.add('hidden');
    }
}

function renderKarmaAnalysis() {
    const section = document.getElementById('karma-analysis-section');
    
    if (!section) return;
    
    if (resultData.karmaAnalysis) {
        section.classList.remove('hidden');
        
        const karma = resultData.karmaAnalysis;
        
        const postKarma = document.getElementById('post-karma');
        const commentKarma = document.getElementById('comment-karma');
        const totalKarma = document.getElementById('total-karma');
        const accountAge = document.getElementById('account-age');
        
        if (postKarma) postKarma.textContent = karma.postKarma.toLocaleString();
        if (commentKarma) commentKarma.textContent = karma.commentKarma.toLocaleString();
        if (totalKarma) totalKarma.textContent = karma.totalKarma.toLocaleString();
        if (accountAge) accountAge.textContent = karma.accountAge;
        
        const levelBadge = document.getElementById('karma-level-badge');
        if (levelBadge) {
            levelBadge.textContent = karma.karmaLevel.charAt(0).toUpperCase() + karma.karmaLevel.slice(1);
            levelBadge.className = `karma-level-badge ${karma.karmaLevel}`;
        }
        
        // Restrictions
        const restrictions = document.getElementById('karma-restrictions');
        if (restrictions && karma.restrictions) {
            let html = '<ul>';
            karma.restrictions.forEach(r => {
                html += `<li>${r}</li>`;
            });
            html += '</ul>';
            restrictions.innerHTML = html;
        }
    } else {
        section.classList.add('hidden');
    }
}

function hideHashtagSection() {
    const section = document.getElementById('hashtag-analysis');
    if (section) section.classList.add('hidden');
}

function hideMethodHashtag() {
    const method = document.getElementById('method-hashtag');
    if (method) {
        method.style.opacity = '0.5';
        const p = method.querySelector('p');
        if (p) p.textContent = 'Not applicable for Reddit - Reddit does not use hashtags for discovery.';
    }
}

function hideRedditSections() {
    const subredditSection = document.getElementById('subreddit-bans-section');
    const karmaSection = document.getElementById('karma-analysis-section');
    
    if (subredditSection) subredditSection.classList.add('hidden');
    if (karmaSection) karmaSection.classList.add('hidden');
}

// ============================================
// TWITTER-SPECIFIC SECTIONS
// ============================================
function renderEngagementTestResults() {
    const section = document.getElementById('engagement-test-results');
    
    if (!section) return;
    
    if (resultData.engagementTest && resultData.engagementTest.completed) {
        section.classList.remove('hidden');
        
        const test = resultData.engagementTest;
        
        // Update each result
        ['follow', 'like', 'retweet', 'reply'].forEach(step => {
            const result = test.results ? test.results[step] : null;
            const statusEl = document.getElementById(`${step}-result-status`);
            const resultEl = document.getElementById(`engagement-result-${step}`);
            
            if (statusEl && result) {
                if (!result.completed) {
                    statusEl.textContent = 'Not completed';
                } else if (result.visible) {
                    statusEl.textContent = 'Visible';
                } else {
                    statusEl.textContent = result.note || 'Hidden';
                }
            }
            
            if (resultEl && result) {
                const badge = resultEl.querySelector('.engagement-result-badge');
                if (badge) {
                    if (!result.completed) {
                        badge.className = 'engagement-result-badge neutral';
                        badge.textContent = '○';
                    } else if (result.visible) {
                        badge.className = 'engagement-result-badge good';
                        badge.textContent = '✓';
                    } else {
                        badge.className = 'engagement-result-badge warning';
                        badge.textContent = '⚠';
                    }
                }
            }
        });
        
        // Overall finding
        const finding = document.getElementById('engagement-test-finding');
        if (finding && test.finding) {
            finding.textContent = test.finding;
        }
    } else {
        section.classList.add('hidden');
    }
}

function renderVerificationSection() {
    const section = document.getElementById('verification-section');
    
    if (!section) return;
    
    // Show for Twitter
    section.classList.remove('hidden');
    
    // Check verification status in platform checks
    if (resultData.platformChecks && resultData.platformChecks.verification) {
        const verification = resultData.platformChecks.verification;
        const icon = document.getElementById('verification-icon');
        const title = document.getElementById('verification-title');
        const text = document.getElementById('verification-text');
        const impact = document.getElementById('verification-impact');
        
        if (verification.value === 'none') {
            if (icon) icon.textContent = '❌';
            if (title) title.textContent = 'No Verification Badge';
            if (text) text.textContent = 'This account does not have a verification badge. On Twitter/X, unverified accounts may receive lower visibility in search results and recommendations.';
            if (impact) impact.textContent = '+5% added to probability score';
        } else {
            if (icon) icon.textContent = '✓';
            if (title) title.textContent = `Verified (${verification.value})`;
            if (text) text.textContent = 'This account has a verification badge, which typically improves visibility in search and recommendations.';
            if (impact) impact.textContent = 'No impact on probability score';
        }
    }
}

// ============================================
// CONTENT SCAN
// ============================================
function renderContentScan() {
    const section = document.getElementById('content-scan-section');
    const results = document.getElementById('content-scan-results');
    
    if (!section || !results || !resultData.contentScan) return;
    
    if (resultData.contentScan.flaggedTermsFound > 0) {
        section.classList.remove('hidden');
        
        let html = '<div class="content-scan-items">';
        resultData.contentScan.terms.forEach(term => {
            const riskClass = term.risk === 'high' ? 'danger' : term.risk === 'medium' ? 'warning' : 'neutral';
            html += `
                <div class="content-scan-item ${riskClass}">
                    <span class="term">"${term.term}"</span>
                    <span class="risk-badge ${riskClass}">${term.risk} risk</span>
                    <span class="context">${term.context}</span>
                </div>
            `;
        });
        html += '</div>';
        
        results.innerHTML = html;
    } else {
        section.classList.add('hidden');
    }
}

// ============================================
// HASHTAG ANALYSIS
// ============================================
function renderHashtagAnalysis() {
    const section = document.getElementById('hashtag-analysis');
    const results = document.getElementById('hashtag-results');
    
    if (!section || !results) return;
    
    const flagged = resultData.factors.hashtag.flaggedHashtags;
    
    if (flagged && flagged.length > 0) {
        section.classList.remove('hidden');
        
        let html = '<div class="hashtag-items">';
        flagged.forEach(h => {
            const riskClass = h.risk === 'banned' ? 'danger' : h.risk === 'restricted' ? 'warning' : 'neutral';
            html += `
                <div class="hashtag-item ${riskClass}">
                    <span class="hashtag">#${h.tag}</span>
                    <span class="risk-badge ${riskClass}">${h.risk}</span>
                    <span class="reason">${h.reason}</span>
                </div>
            `;
        });
        html += '</div>';
        
        results.innerHTML = html;
    } else {
        section.classList.add('hidden');
    }
}

// ============================================
// IP ANALYSIS
// ============================================
function renderIpAnalysis() {
    if (!resultData.factors || !resultData.factors.ip) return;
    
    const ip = resultData.factors.ip;
    
    const ipTypeBadge = document.getElementById('ip-type-badge');
    const ipExplanation = document.getElementById('ip-explanation');
    
    if (ip.signals) {
        const ipSignal = ip.signals.find(s => s.name === 'IP type');
        
        if (ipTypeBadge && ipSignal) {
            ipTypeBadge.textContent = ipSignal.value;
            ipTypeBadge.className = `ip-type-badge ${ipSignal.status}`;
        }
    }
    
    if (ipExplanation) {
        ipExplanation.textContent = ip.finding || 'Connection analysis completed';
    }
}

// ============================================
// PLATFORM CHECKS
// ============================================
function renderPlatformChecks() {
    const grid = document.getElementById('checks-grid');
    if (!grid) return;
    
    if (!resultData.platformChecks) {
        grid.innerHTML = '<p class="no-data">Platform-specific checks not available</p>';
        return;
    }
    
    let html = '';
    
    for (const [key, check] of Object.entries(resultData.platformChecks)) {
        const statusClass = check.status === 'good' ? 'good' : 
                           check.status === 'warning' ? 'warning' : 'neutral';
        const icon = check.status === 'good' ? '✓' : 
                    check.status === 'warning' ? '⚠' : '○';
        
        let displayValue = check.value;
        if (typeof check.value === 'boolean') {
            displayValue = check.value ? 'Yes' : 'No';
        }
        
        html += `
            <div class="check-item ${statusClass}">
                <span class="check-icon">${icon}</span>
                <div class="check-content">
                    <span class="check-label">${check.label}</span>
                    <span class="check-value">${displayValue}</span>
                </div>
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

// ============================================
// RECOMMENDATIONS
// ============================================
function updateRecommendations() {
    const list = document.getElementById('recommendations-list');
    if (!list) return;
    
    if (!resultData.recommendations || resultData.recommendations.length === 0) {
        // Generate default recommendations
        const probability = resultData.probability || 0;
        
        if (probability <= 30) {
            resultData.recommendations = [{
                priority: 'low',
                title: 'Keep Up the Good Work',
                description: 'Your account shows healthy visibility signals. Continue following platform guidelines to maintain your reach.'
            }];
        } else if (probability <= 60) {
            resultData.recommendations = [{
                priority: 'medium',
                title: 'Review Recent Activity',
                description: 'Some visibility concerns detected. Review your recent posts and engagement patterns for anything that might trigger platform filters.'
            }];
        } else {
            resultData.recommendations = [{
                priority: 'high',
                title: 'Take Action',
                description: 'Multiple restriction signals detected. Consider reducing posting frequency, reviewing content for violations, and engaging more organically.'
            }];
        }
    }
    
    let html = '';
    
    resultData.recommendations.forEach((rec, index) => {
        const priorityClass = rec.priority === 'high' ? 'high' : 
                             rec.priority === 'medium' ? 'medium' : 'low';
        
        html += `
            <div class="recommendation-item ${priorityClass}">
                <span class="rec-number">${index + 1}</span>
                <div class="rec-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                </div>
                <span class="rec-priority ${priorityClass}">${rec.priority}</span>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

// ============================================
// SHARE URLs
// ============================================
function updateShareUrls() {
    const permanentUrl = document.getElementById('permanent-url');
    const currentUrl = window.location.href;
    
    if (permanentUrl) {
        permanentUrl.value = currentUrl;
    }
}

// ============================================
// NO RESULTS
// ============================================
function showNoResults() {
    const shortAnswer = document.getElementById('short-answer');
    if (shortAnswer) {
        shortAnswer.innerHTML = `
            <div class="container">
                <div class="no-results" style="text-align:center;padding:60px 20px;">
                    <span class="no-results-icon" style="font-size:4rem;display:block;margin-bottom:20px;">🔍</span>
                    <h2>No Results Found</h2>
                    <p style="margin:20px 0;color:var(--text-muted);">We couldn't find any analysis data. Please run a new check.</p>
                    <a href="index.html" class="btn btn-primary" style="display:inline-block;padding:12px 24px;">Run New Analysis</a>
                </div>
            </div>
        `;
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Share buttons
    const shareTwitterBtn = document.getElementById('share-twitter-btn');
    const shareFacebookBtn = document.getElementById('share-facebook-btn');
    const shareLinkedinBtn = document.getElementById('share-linkedin-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    
    if (shareTwitterBtn) {
        shareTwitterBtn.addEventListener('click', () => shareOnPlatform('twitter'));
    }
    if (shareFacebookBtn) {
        shareFacebookBtn.addEventListener('click', () => shareOnPlatform('facebook'));
    }
    if (shareLinkedinBtn) {
        shareLinkedinBtn.addEventListener('click', () => shareOnPlatform('linkedin'));
    }
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyLink);
    }
    
    // Download report
    const downloadBtn = document.getElementById('download-report-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadReport);
    }
    
    // Ask AI
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

function shareOnPlatform(platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`My shadow ban probability: ${resultData ? resultData.probability : '?'}% - Check yours at ShadowBanCheck.io`);
    
    let shareUrl = '';
    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy link', 'error');
    });
}

function downloadReport() {
    // For now, just show coming soon
    showToast('PDF reports coming soon!', 'info');
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'info') {
    if (window.showToast && typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// INIT
// ============================================
init();

})();
