/* =============================================================================
   RESULTS.JS - Results Page
   ShadowBanCheck.io
   
   Updated to support both legacy format and new 5-Factor Engine format.
   Auto-detects format and renders appropriately.
   ============================================================================= */

(function() {
'use strict';

let initialized = false;
let resultData = null;
let is5FactorFormat = false;

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
    detectFormat();
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
    
    // Fallback: Get from URL params and generate demo data
    const params = new URLSearchParams(window.location.search);
    const platformId = params.get('platform') || 'twitter';
    const checkType = params.get('type') || 'account';
    const username = params.get('username') || '@demo_user';
    const engine = params.get('engine'); // '5factor' if using new engine
    
    // Try to get demo data
    if (window.DemoData) {
        const format = engine === '5factor' ? '5factor' : 'auto';
        resultData = window.DemoData.getResult(platformId, checkType, { format });
        if (resultData) {
            resultData.username = username;
            console.log('📊 Loaded demo result:', resultData);
            return;
        }
    }
    
    // Generate fallback demo data
    const platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
    
    resultData = {
        platform: platformId,
        platformName: platform ? platform.name : 'Twitter/X',
        platformIcon: platform ? platform.icon : '𝕏',
        checkType: checkType,
        username: username,
        probability: Math.floor(Math.random() * 40) + 15,
        timestamp: new Date().toISOString(),
        factorsUsed: checkType === 'power' ? 5 : (checkType === 'hashtag' ? 3 : 5),
        factors: generateLegacyFactors(platformId, checkType),
        findings: generateLegacyFindings(platformId),
        recommendations: generateLegacyRecommendations(),
    };
    
    console.log('📊 Generated fallback result:', resultData);
}

function detectFormat() {
    // Detect if this is 5-Factor Engine format
    is5FactorFormat = !!(
        resultData && 
        resultData.factors && 
        resultData.factors[0] && 
        typeof resultData.factors[0].rawScore !== 'undefined'
    );
    
    console.log(`📋 Result format: ${is5FactorFormat ? '5-Factor Engine' : 'Legacy'}`);
}

// ============================================
// LEGACY FORMAT GENERATORS (Fallback)
// ============================================
function generateLegacyFactors(platformId, checkType) {
    const isReddit = platformId === 'reddit';
    const isHashtag = checkType === 'hashtag';
    
    return [
        { name: 'Platform APIs', icon: '🔌', status: isHashtag ? 'na' : 'complete', score: 10, finding: isHashtag ? 'Not needed for hashtag checks' : 'Account exists and is active' },
        { name: 'Web Analysis', icon: '🔍', status: 'complete', score: 15, finding: 'Search visibility tests passed' },
        { name: 'Historical Data', icon: '📊', status: 'complete', score: 0, finding: 'No historical data (Free tier)' },
        { name: 'Hashtag Database', icon: '#️⃣', status: isReddit ? 'na' : 'complete', score: 5, finding: isReddit ? 'N/A for Reddit' : 'No banned hashtags detected' },
        { name: 'Content & Links', icon: '📝', status: isHashtag ? 'na' : 'complete', score: 5, finding: isHashtag ? 'Not needed for hashtag checks' : 'Bio and content scanned, no flagged patterns' },
    ];
}

function generateLegacyFindings(platformId) {
    const findings = [
        { type: 'good', text: 'Account appears in search results' },
        { type: 'good', text: 'Profile accessible to public' },
        { type: 'good', text: 'No flagged content in bio or pinned post' },
    ];
    if (Math.random() > 0.5) findings.push({ type: 'warning', text: 'No verification badge detected' });
    if (Math.random() > 0.7) findings.push({ type: 'warning', text: 'Low engagement rate detected' });
    return findings;
}

function generateLegacyRecommendations() {
    return [
        'Continue posting high-quality content regularly',
        'Engage authentically with your audience',
        'Avoid using known restricted hashtags',
        'Keep your bio free of flagged words and suspicious links',
        'Consider getting verified to improve visibility',
    ];
}

// ============================================
// RENDER RESULTS - Main Entry Point
// ============================================
function renderResults() {
    if (!resultData) {
        console.error('No result data to render');
        return;
    }
    
    const platform = window.getPlatformById ? window.getPlatformById(resultData.platform) : null;
    const isReddit = resultData.platform === 'reddit';
    
    // Update page meta
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
        if (resultData.checkType === 'hashtag' || resultData.checkType === 'tagCheck') {
            const tags = resultData.hashtags || resultData.input?.tags || [];
            resultQuery.textContent = tags.slice(0, 5).join(' ');
        } else {
            resultQuery.textContent = resultData.username || resultData.account?.username || '@user';
        }
    }
    
    // Render based on format
    if (is5FactorFormat) {
        render5FactorResults();
    } else {
        renderLegacyResults();
    }
    
    // Platform-specific sections
    if (isReddit) {
        showRedditSections();
    } else {
        hideRedditSections();
    }
    
    // Show verification section for Twitter
    if (resultData.platform === 'twitter') {
        const verificationSection = document.getElementById('verification-section');
        if (verificationSection) verificationSection.classList.remove('hidden');
    }
    
    // Update permanent URL
    const permanentUrl = document.getElementById('permanent-url');
    if (permanentUrl) {
        const query = resultData.username || resultData.account?.username || 'analysis';
        const url = `https://shadowbancheck.io/results/${resultData.platform}/${encodeURIComponent(query)}`;
        permanentUrl.value = url;
    }
}

// ============================================
// 5-FACTOR ENGINE RENDERING
// ============================================
function render5FactorResults() {
    console.log('🔥 Rendering 5-Factor Engine results');
    
    // Get probability from appropriate location
    const probability = resultData.overallProbability || resultData.probability || 28;
    const confidence = resultData.overallConfidence || 70;
    const verdict = resultData.combinedVerdict || resultData.verdict || 'UNCERTAIN';
    
    // Render probability
    render5FactorProbability(probability, confidence, verdict);
    
    // Render findings
    render5FactorFindings();
    
    // Render factor breakdown
    render5FactorBreakdown();
    
    // Render detection summary (for power checks)
    if (resultData.post?.detection) {
        render5FactorDetection();
    }
    
    // Render shadowban checks (for account data)
    if (resultData.account?.shadowbanChecks) {
        render5FactorShadowbanChecks();
    }
    
    // Render hashtag/tag results
    if (resultData.checkType === 'tagCheck' && resultData.results) {
        render5FactorTagResults();
    } else if (resultData.post?.detection?.hashtags) {
        renderHashtagAnalysis();
    }
    
    // Render recommendations
    render5FactorRecommendations();
    
    // Render content analysis
    renderContentAnalysis();
}

function render5FactorProbability(probability, confidence, verdict) {
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
        
        if (probability < 30) {
            probabilityCircle.style.stroke = 'var(--success)';
        } else if (probability < 60) {
            probabilityCircle.style.stroke = 'var(--warning)';
        } else {
            probabilityCircle.style.stroke = 'var(--danger)';
        }
    }
    
    // Update confidence indicator (add if element exists)
    const confidenceEl = document.getElementById('confidence-value');
    if (confidenceEl) {
        confidenceEl.textContent = `${confidence}% confidence`;
    }
    
    // Update interpretation based on verdict
    const interpretation = document.getElementById('probability-interpretation');
    if (interpretation) {
        const interpretations = {
            'CLEAR': 'All signals indicate normal visibility. Your content should be reaching your audience.',
            'LIKELY CLEAR': 'Most signals indicate normal visibility, with minor concerns detected.',
            'UNCERTAIN': 'Mixed signals detected. Some factors suggest possible restrictions.',
            'LIKELY RESTRICTED': 'Several signals suggest your content may have reduced visibility.',
            'RESTRICTED': 'Multiple strong signals indicate your content is likely being restricted.',
            'HIGH RISK': 'High-risk elements detected that will likely reduce your reach.'
        };
        interpretation.textContent = interpretations[verdict] || interpretations['UNCERTAIN'];
    }
    
    // Update verdict badge
    const verdictBadge = document.getElementById('verdict-badge');
    if (verdictBadge) {
        const verdictConfig = {
            'CLEAR': { text: 'Clear', class: 'good' },
            'LIKELY CLEAR': { text: 'Likely Clear', class: 'good' },
            'UNCERTAIN': { text: 'Uncertain', class: 'warning' },
            'LIKELY RESTRICTED': { text: 'Likely Restricted', class: 'warning' },
            'RESTRICTED': { text: 'Restricted', class: 'danger' },
            'HIGH RISK': { text: 'High Risk', class: 'danger' }
        };
        const config = verdictConfig[verdict] || verdictConfig['UNCERTAIN'];
        verdictBadge.textContent = config.text;
        verdictBadge.className = `verdict-badge ${config.class}`;
    }
}

function render5FactorFindings() {
    const findingsList = document.getElementById('findings-list');
    if (!findingsList) return;
    
    // Use _findings array if available, otherwise build from factor findings
    let findings = resultData._findings || [];
    
    if (findings.length === 0 && resultData.factors) {
        // Build findings from factor data
        resultData.factors.forEach(factor => {
            if (factor.findings) {
                factor.findings.forEach(f => {
                    findings.push({
                        type: f.type || (f.severity === 'high' ? 'danger' : (f.severity === 'medium' ? 'warning' : 'good')),
                        text: f.message || f.text
                    });
                });
            }
        });
    }
    
    // Fallback to legacy findings
    if (findings.length === 0) {
        findings = resultData.findings || [];
    }
    
    let html = '';
    findings.forEach(finding => {
        const type = finding.type || 'info';
        const icon = type === 'good' ? '✓' : (type === 'warning' ? '⚠' : (type === 'danger' ? '✗' : 'ℹ'));
        const text = finding.text || finding.message || '';
        html += `<li class="finding-${type}"><span>${icon}</span> <span>${text}</span></li>`;
    });
    
    findingsList.innerHTML = html || '<li class="finding-info"><span>ℹ</span> <span>Analysis complete</span></li>';
}

function render5FactorBreakdown() {
    const factors = resultData.factors || [];
    
    // Factor element IDs mapping
    const factorMap = [
        { id: 'factor-api', findingId: 'factor-api-finding', factor: 1 },
        { id: 'factor-web', findingId: 'factor-web-finding', factor: 2 },
        { id: 'factor-historical', findingId: 'factor-historical-finding', factor: 3 },
        { id: 'factor-hashtag', findingId: 'factor-hashtag-finding', factor: 4 },
        { id: 'factor-content', findingId: 'factor-content-finding', factor: 5 },
    ];
    
    factors.forEach((factor, i) => {
        const mapping = factorMap[i] || factorMap.find(m => m.factor === factor.factor);
        if (!mapping) return;
        
        const row = document.getElementById(mapping.id);
        const findingEl = document.getElementById(mapping.findingId);
        
        if (row) {
            const status = row.querySelector('.factor-status');
            if (status) {
                // Determine status based on score and confidence
                const isNA = factor.weight === 0 || factor.rawScore === undefined;
                const hasIssues = factor.rawScore > 30;
                
                if (isNA) {
                    status.innerHTML = '<span>○</span>';
                    status.className = 'factor-status neutral';
                    row.classList.add('factor-na');
                } else if (hasIssues) {
                    status.innerHTML = '<span>⚠</span>';
                    status.className = 'factor-status warning';
                } else {
                    status.innerHTML = '<span>✓</span>';
                    status.className = 'factor-status good';
                }
            }
            
            // Add score badge if element supports it
            const scoreBadge = row.querySelector('.factor-score');
            if (scoreBadge && factor.rawScore !== undefined) {
                scoreBadge.textContent = `${factor.rawScore}`;
                scoreBadge.className = `factor-score ${factor.rawScore > 30 ? 'high' : (factor.rawScore > 10 ? 'medium' : 'low')}`;
            }
        }
        
        if (findingEl) {
            // Build finding text from factor findings or use summary
            let findingText = '';
            if (factor.findings && factor.findings.length > 0) {
                // Get most important finding
                const importantFinding = factor.findings.find(f => f.severity === 'high' || f.type === 'danger') 
                    || factor.findings[0];
                findingText = importantFinding.message || importantFinding.text || '';
            }
            findingEl.textContent = findingText || `Score: ${factor.rawScore || 0} (${factor.confidence || 0}% confidence)`;
        }
    });
    
    // Update factors used count
    const factorsUsed = document.getElementById('engine-factors-used');
    if (factorsUsed) {
        const activeFactors = factors.filter(f => f.weight > 0).length;
        factorsUsed.textContent = `${activeFactors}/5 factors analyzed`;
    }
}

function render5FactorDetection() {
    const detection = resultData.post?.detection;
    if (!detection) return;
    
    // Create or update detection summary section
    let detectionSection = document.getElementById('detection-summary');
    if (!detectionSection) {
        // Create section if it doesn't exist
        const contentCard = document.getElementById('content-card');
        if (contentCard) {
            detectionSection = document.createElement('div');
            detectionSection.id = 'detection-summary';
            detectionSection.className = 'detection-summary';
            contentCard.appendChild(detectionSection);
        }
    }
    
    if (!detectionSection) return;
    
    let html = '<h4>Detection Breakdown</h4><div class="detection-grid">';
    
    const detectionTypes = [
        { key: 'hashtags', label: 'Hashtags', icon: '#️⃣' },
        { key: 'cashtags', label: 'Cashtags', icon: '💲' },
        { key: 'links', label: 'Links', icon: '🔗' },
        { key: 'content', label: 'Content', icon: '📝' },
        { key: 'mentions', label: 'Mentions', icon: '@' },
        { key: 'emojis', label: 'Emojis', icon: '😀' }
    ];
    
    detectionTypes.forEach(type => {
        const data = detection[type.key];
        if (!data) return;
        
        const checked = data.checked || 0;
        const flagged = data.flagged || 0;
        const statusClass = flagged > 0 ? 'warning' : 'good';
        
        html += `
            <div class="detection-item ${statusClass}">
                <span class="detection-icon">${type.icon}</span>
                <span class="detection-label">${type.label}</span>
                <span class="detection-count">${flagged}/${typeof checked === 'boolean' ? '✓' : checked}</span>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Show flagged items
    const allIssues = [];
    if (detection.hashtags?.banned?.length) {
        detection.hashtags.banned.forEach(h => allIssues.push({ type: 'danger', text: `Banned hashtag: ${h}` }));
    }
    if (detection.hashtags?.restricted?.length) {
        detection.hashtags.restricted.forEach(h => allIssues.push({ type: 'warning', text: `Restricted hashtag: ${h}` }));
    }
    if (detection.links?.issues?.length) {
        detection.links.issues.forEach(i => allIssues.push({ type: 'warning', text: i }));
    }
    if (detection.content?.issues?.length) {
        detection.content.issues.forEach(i => allIssues.push({ type: 'warning', text: i }));
    }
    
    if (allIssues.length > 0) {
        html += '<div class="detection-issues"><h5>Issues Found:</h5><ul>';
        allIssues.forEach(issue => {
            const icon = issue.type === 'danger' ? '✗' : '⚠';
            html += `<li class="issue-${issue.type}"><span>${icon}</span> ${issue.text}</li>`;
        });
        html += '</ul></div>';
    }
    
    detectionSection.innerHTML = html;
}

function render5FactorShadowbanChecks() {
    const checks = resultData.account?.shadowbanChecks;
    if (!checks) return;
    
    // Find or create shadowban checks section
    let checksSection = document.getElementById('shadowban-checks');
    if (!checksSection) return;
    
    const checkTypes = [
        { key: 'searchBan', label: 'Search Ban', desc: 'Account hidden from search' },
        { key: 'ghostBan', label: 'Ghost Ban', desc: 'Replies hidden from others' },
        { key: 'replyDeboosting', label: 'Reply Deboosting', desc: 'Replies deprioritized' },
        { key: 'suggestBan', label: 'Suggest Ban', desc: 'Hidden from suggestions' }
    ];
    
    let html = '';
    checkTypes.forEach(type => {
        const detected = checks[type.key];
        const statusClass = detected ? 'danger' : 'good';
        const statusIcon = detected ? '✗' : '✓';
        
        html += `
            <div class="shadowban-check ${statusClass}">
                <span class="check-icon">${statusIcon}</span>
                <div class="check-info">
                    <span class="check-label">${type.label}</span>
                    <span class="check-desc">${type.desc}</span>
                </div>
                <span class="check-status">${detected ? 'Detected' : 'Clear'}</span>
            </div>
        `;
    });
    
    checksSection.innerHTML = html;
}

function render5FactorTagResults() {
    const results = resultData.results;
    if (!results) return;
    
    const hashtagSection = document.getElementById('hashtag-analysis');
    const hashtagResults = document.getElementById('hashtag-results');
    
    if (!hashtagSection || !hashtagResults) return;
    
    hashtagSection.classList.remove('hidden');
    
    let html = '<div class="hashtag-cards">';
    
    // Render banned tags
    if (results.banned?.length) {
        results.banned.forEach(tag => {
            html += createTagCard(tag.tag || tag, 'banned', tag.reason || tag.category);
        });
    }
    
    // Render restricted tags
    if (results.restricted?.length) {
        results.restricted.forEach(tag => {
            html += createTagCard(tag.tag || tag, 'restricted', tag.reason || tag.category);
        });
    }
    
    // Render monitored tags
    if (results.monitored?.length) {
        results.monitored.forEach(tag => {
            html += createTagCard(tag.tag || tag, 'monitored', tag.reason || tag.category);
        });
    }
    
    // Render safe tags
    if (results.safe?.length) {
        results.safe.forEach(tag => {
            html += createTagCard(tag.tag || tag, 'safe');
        });
    }
    
    html += '</div>';
    
    // Summary
    const summary = resultData.summary || {};
    if (summary.banned > 0 || summary.restricted > 0) {
        html += `
            <div class="hashtag-summary warning">
                <p><strong>⚠️ Risk Score: ${summary.riskScore || 0}%</strong> - 
                ${summary.banned || 0} banned, ${summary.restricted || 0} restricted, 
                ${summary.monitored || 0} monitored out of ${summary.total || 0} tags checked.</p>
            </div>
        `;
    } else {
        html += `
            <div class="hashtag-summary success">
                <p><strong>✓ All Clear</strong> - All ${summary.total || results.safe?.length || 0} tags are safe to use.</p>
            </div>
        `;
    }
    
    hashtagResults.innerHTML = html;
}

function createTagCard(tag, status, reason) {
    const statusConfig = {
        'banned': { class: 'danger', label: 'Banned', icon: '✗' },
        'restricted': { class: 'warning', label: 'Restricted', icon: '⚠' },
        'monitored': { class: 'info', label: 'Monitored', icon: 'ℹ' },
        'safe': { class: 'success', label: 'Safe', icon: '✓' }
    };
    
    const config = statusConfig[status] || statusConfig['safe'];
    
    return `
        <div class="hashtag-card ${config.class}">
            <div class="hashtag-card-header">
                <span class="hashtag-tag">${tag}</span>
                <span class="hashtag-status ${config.class}">${config.icon} ${config.label}</span>
            </div>
            ${reason ? `<div class="hashtag-card-reason">${reason}</div>` : ''}
        </div>
    `;
}

function render5FactorRecommendations() {
    const recommendationsList = document.getElementById('recommendations-list');
    if (!recommendationsList) return;
    
    let recommendations = resultData.recommendations || [];
    
    // Handle priority-based recommendations
    if (recommendations.length > 0 && recommendations[0].priority) {
        // Sort by priority
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3, 'info': 4 };
        recommendations.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
        
        let html = '';
        recommendations.forEach((rec, i) => {
            const priorityClass = rec.priority || 'info';
            const priorityIcon = {
                'critical': '🚨',
                'high': '⚠️',
                'medium': '💡',
                'low': '📝',
                'info': 'ℹ️'
            }[priorityClass] || '📝';
            
            html += `
                <div class="recommendation-card priority-${priorityClass}">
                    <span class="recommendation-icon">${priorityIcon}</span>
                    <div class="recommendation-content">
                        <span class="recommendation-priority">${priorityClass.toUpperCase()}</span>
                        <p>${rec.action || rec.text || rec}</p>
                    </div>
                </div>
            `;
        });
        
        recommendationsList.innerHTML = html;
    } else {
        // Legacy format
        renderLegacyRecommendations(recommendations);
    }
}

// ============================================
// LEGACY RENDERING
// ============================================
function renderLegacyResults() {
    console.log('📋 Rendering legacy format results');
    
    renderLegacyProbability();
    renderLegacyFindings();
    renderLegacyFactors();
    renderHashtagAnalysis();
    renderLegacyRecommendationsSection();
    renderContentAnalysis();
}

function renderLegacyProbability() {
    const probability = resultData.probability || 28;
    
    const probabilityValue = document.getElementById('probability-value');
    const probabilityInline = document.getElementById('probability-inline');
    if (probabilityValue) probabilityValue.textContent = `${probability}%`;
    if (probabilityInline) probabilityInline.textContent = `${probability}%`;
    
    const probabilityCircle = document.getElementById('probability-circle');
    if (probabilityCircle) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (probability / 100) * circumference;
        probabilityCircle.style.strokeDasharray = circumference;
        probabilityCircle.style.strokeDashoffset = offset;
        
        if (probability < 30) {
            probabilityCircle.style.stroke = 'var(--success)';
        } else if (probability < 60) {
            probabilityCircle.style.stroke = 'var(--warning)';
        } else {
            probabilityCircle.style.stroke = 'var(--danger)';
        }
    }
    
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

function renderLegacyFindings() {
    const findingsList = document.getElementById('findings-list');
    if (!findingsList) return;
    
    const findings = resultData.findings || [];
    
    let html = '';
    findings.forEach(finding => {
        const icon = finding.type === 'good' ? '✓' : (finding.type === 'warning' ? '⚠' : (finding.type === 'danger' ? '✗' : 'ℹ'));
        html += `<li class="finding-${finding.type}"><span>${icon}</span> <span>${finding.text}</span></li>`;
    });
    
    findingsList.innerHTML = html || '<li class="finding-info"><span>ℹ</span> <span>Analysis complete</span></li>';
}

function renderLegacyFactors() {
    const factors = resultData.factors || [];
    
    const factorMap = [
        { id: 'factor-api', findingId: 'factor-api-finding' },
        { id: 'factor-web', findingId: 'factor-web-finding' },
        { id: 'factor-historical', findingId: 'factor-historical-finding' },
        { id: 'factor-hashtag', findingId: 'factor-hashtag-finding' },
        { id: 'factor-content', findingId: 'factor-content-finding' },
    ];
    
    factors.forEach((factor, i) => {
        if (!factorMap[i]) return;
        
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
    });
    
    const factorsUsed = document.getElementById('engine-factors-used');
    if (factorsUsed) {
        factorsUsed.textContent = `${resultData.factorsUsed || 5}/5 factors analyzed`;
    }
}

function renderLegacyRecommendationsSection() {
    const recommendations = resultData.recommendations || [];
    renderLegacyRecommendations(recommendations);
}

function renderLegacyRecommendations(recommendations) {
    const recommendationsList = document.getElementById('recommendations-list');
    if (!recommendationsList) return;
    
    let html = '';
    recommendations.forEach((rec, i) => {
        const text = typeof rec === 'string' ? rec : (rec.text || rec.action || '');
        html += `
            <div class="recommendation-card">
                <span class="recommendation-number">${i + 1}</span>
                <p>${text}</p>
            </div>
        `;
    });
    
    recommendationsList.innerHTML = html;
}

// ============================================
// SHARED RENDERING FUNCTIONS
// ============================================
function renderContentAnalysis() {
    const contentCard = document.getElementById('content-card');
    const contentSummary = document.getElementById('content-summary');
    const contentExplanation = document.getElementById('content-explanation');
    const flaggedItems = document.getElementById('flagged-items');
    const flaggedList = document.getElementById('flagged-list');
    
    if (!contentCard) return;
    
    // Check for content analysis data
    const contentAnalysis = resultData.contentAnalysis || resultData.post?.detection?.content;
    const hasFlags = contentAnalysis && (
        contentAnalysis.bioFlags?.length > 0 ||
        contentAnalysis.postFlags?.length > 0 ||
        contentAnalysis.linkFlags?.length > 0 ||
        contentAnalysis.issues?.length > 0
    );
    
    if (hasFlags) {
        const allFlags = [
            ...(contentAnalysis.bioFlags || []),
            ...(contentAnalysis.postFlags || []),
            ...(contentAnalysis.linkFlags || []),
            ...(contentAnalysis.issues || [])
        ];
        
        if (contentSummary) contentSummary.textContent = `${allFlags.length} potential flag${allFlags.length > 1 ? 's' : ''} detected`;
        if (contentExplanation) contentExplanation.textContent = 'We found content that may affect your visibility. Review the flagged items below.';
        
        if (flaggedItems && flaggedList) {
            flaggedItems.classList.remove('hidden');
            flaggedList.innerHTML = allFlags.map(flag => `<li>${flag}</li>`).join('');
        }
    } else {
        if (contentSummary) contentSummary.textContent = 'No flagged content detected';
        if (contentExplanation) contentExplanation.textContent = 'We scanned bio text, posts, and links for flagged words, suspicious domains, and patterns that platforms commonly filter. No problematic content was detected.';
        if (flaggedItems) flaggedItems.classList.add('hidden');
    }
}

function renderHashtagAnalysis() {
    const hashtagSection = document.getElementById('hashtag-analysis');
    const hashtagResults = document.getElementById('hashtag-results');
    const factorHashtagFinding = document.getElementById('factor-hashtag-finding');
    const isReddit = resultData.platform === 'reddit';
    
    if (isReddit) {
        if (hashtagSection) hashtagSection.classList.add('hidden');
        return;
    }
    
    if (!hashtagSection || !hashtagResults) return;
    
    const hashtags = resultData.hashtags || [];
    const hashtagResultsData = resultData.hashtagResults || [];
    
    if (hashtags.length === 0 && hashtagResultsData.length === 0) {
        hashtagSection.classList.add('hidden');
        return;
    }
    
    hashtagSection.classList.remove('hidden');
    
    let bannedCount = resultData.bannedCount || 0;
    let restrictedCount = resultData.restrictedCount || 0;
    let safeCount = resultData.safeCount || hashtags.length;
    
    if (factorHashtagFinding) {
        if (bannedCount > 0) {
            factorHashtagFinding.textContent = `${bannedCount} banned hashtag${bannedCount > 1 ? 's' : ''} detected`;
        } else if (restrictedCount > 0) {
            factorHashtagFinding.textContent = `${restrictedCount} restricted hashtag${restrictedCount > 1 ? 's' : ''} detected`;
        } else {
            factorHashtagFinding.textContent = `${safeCount} hashtag${safeCount !== 1 ? 's' : ''} verified safe`;
        }
    }
    
    let html = '<div class="hashtag-cards">';
    
    if (hashtagResultsData.length > 0) {
        hashtagResultsData.forEach(h => {
            const statusClass = h.status === 'banned' ? 'danger' : (h.status === 'restricted' ? 'warning' : 'success');
            const statusLabel = h.status === 'banned' ? 'Banned' : (h.status === 'restricted' ? 'Restricted' : 'Safe');
            
            html += `
                <div class="hashtag-card ${statusClass}">
                    <div class="hashtag-card-header">
                        <span class="hashtag-tag">${h.hashtag}</span>
                        <span class="hashtag-status ${statusClass}">${statusLabel}</span>
                    </div>
                </div>
            `;
        });
    } else {
        hashtags.forEach(tag => {
            html += `
                <div class="hashtag-card success">
                    <div class="hashtag-card-header">
                        <span class="hashtag-tag">${tag}</span>
                        <span class="hashtag-status success">Safe</span>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    
    if (bannedCount > 0 || restrictedCount > 0) {
        html += `
            <div class="hashtag-summary warning">
                <p><strong>⚠️ Impact:</strong> ${bannedCount > 0 ? `${bannedCount} banned` : ''} ${restrictedCount > 0 ? `${restrictedCount} restricted` : ''} hashtag${(bannedCount + restrictedCount) > 1 ? 's' : ''} detected.</p>
            </div>
        `;
    } else {
        html += `
            <div class="hashtag-summary success">
                <p><strong>✓ All clear:</strong> No flagged hashtags detected.</p>
            </div>
        `;
    }
    
    hashtagResults.innerHTML = html;
}

function showRedditSections() {
    const subredditSection = document.getElementById('subreddit-bans-section');
    const karmaSection = document.getElementById('karma-analysis-section');
    
    if (subredditSection) subredditSection.classList.remove('hidden');
    if (karmaSection) karmaSection.classList.remove('hidden');
    
    // Use data from result if available
    const karma = resultData.karma || resultData.account?.metrics || {};
    const subredditBans = resultData.subredditBans || resultData.account?.subredditBans || [];
    
    const karmaStat = document.getElementById('total-karma');
    if (karmaStat) karmaStat.textContent = (karma.total || karma.karma || 1234).toLocaleString();
    
    const postKarma = document.getElementById('post-karma');
    if (postKarma) postKarma.textContent = (karma.post || karma.postKarma || 456).toLocaleString();
    
    const commentKarma = document.getElementById('comment-karma');
    if (commentKarma) commentKarma.textContent = (karma.comment || karma.commentKarma || 778).toLocaleString();
    
    const accountAge = document.getElementById('account-age');
    if (accountAge) accountAge.textContent = karma.age || '2 years';
    
    const karmaLevel = document.getElementById('karma-level-badge');
    if (karmaLevel) {
        const total = karma.total || karma.karma || 1234;
        if (total > 10000) {
            karmaLevel.textContent = 'High';
            karmaLevel.className = 'karma-level-badge high';
        } else if (total > 1000) {
            karmaLevel.textContent = 'Medium';
            karmaLevel.className = 'karma-level-badge medium';
        } else {
            karmaLevel.textContent = 'Low';
            karmaLevel.className = 'karma-level-badge low';
        }
    }
    
    // Render subreddit bans if any
    if (subredditBans.length > 0) {
        const bansList = document.getElementById('subreddit-bans-list');
        if (bansList) {
            bansList.innerHTML = subredditBans.map(ban => `
                <div class="subreddit-ban-item">
                    <span class="subreddit-name">${ban.subreddit}</span>
                    <span class="ban-reason">${ban.reason}</span>
                    <span class="ban-date">${ban.date}</span>
                </div>
            `).join('');
        }
    }
}

function hideRedditSections() {
    const subredditSection = document.getElementById('subreddit-bans-section');
    const karmaSection = document.getElementById('karma-analysis-section');
    
    if (subredditSection) subredditSection.classList.add('hidden');
    if (karmaSection) karmaSection.classList.add('hidden');
}

function updatePageMeta() {
    const platformName = resultData.platformName || 'Platform';
    const query = resultData.username || resultData.account?.username || 'Analysis';
    const probability = resultData.overallProbability || resultData.probability || 28;
    
    document.title = `${query} - ${probability}% Shadow Ban Probability | ShadowBanCheck.io`;
    
    const ogTitle = document.getElementById('og-title');
    if (ogTitle) ogTitle.content = `${query} - ${probability}% Shadow Ban Probability on ${platformName}`;
    
    const twitterTitle = document.getElementById('twitter-title');
    if (twitterTitle) twitterTitle.content = `${query} - ${probability}% Shadow Ban Probability`;
    
    const citationDate = document.getElementById('citation-date');
    if (citationDate && resultData.timestamp) {
        citationDate.textContent = new Date(resultData.timestamp).toLocaleDateString();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    const shareTwitterBtn = document.getElementById('share-twitter-btn');
    const shareFacebookBtn = document.getElementById('share-facebook-btn');
    const shareLinkedInBtn = document.getElementById('share-linkedin-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    
    const probability = resultData.overallProbability || resultData.probability || 28;
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(`My shadow ban probability: ${probability}% - Check yours at ShadowBanCheck.io`);
    
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
    
    const downloadBtn = document.getElementById('download-report-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            showToast('PDF reports coming soon!', 'info');
        });
    }
    
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
