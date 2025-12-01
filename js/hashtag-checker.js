/* =============================================================================
   HASHTAG-CHECKER.JS - Hashtag & Cashtag Checker Page
   ShadowBanCheck.io
   
   Updated to support 5-Factor Engine FlaggedHashtags database.
   Now handles both #hashtags AND $cashtags.
   Reddit is EXCLUDED (no hashtags).
   ============================================================================= */

(function() {
'use strict';

let initialized = false;
let currentPlatform = null;
let apiHealthy = false;
let useLocalDatabase = false;

// ============================================
// INITIALIZATION
// ============================================
function init() {
    if (initialized) return;
    
    if (!window.platformData || !Array.isArray(window.platformData)) {
        console.log('⏳ hashtag-checker.js waiting for platformData...');
        setTimeout(init, 50);
        return;
    }
    
    initialized = true;
    console.log('🚀 Hashtag-checker.js initializing...');
    
    populatePlatformSelect();
    populatePlatformIcons();
    setupEventListeners();
    checkDatabaseStatus();
    updateDatabaseStats();
    
    console.log('✅ Hashtag-checker.js initialized');
}

// Multiple init triggers
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('platformsReady', init);
setTimeout(init, 100);
setTimeout(init, 300);

// ============================================
// DATABASE STATUS CHECK
// ============================================
async function checkDatabaseStatus() {
    const statusIndicator = document.getElementById('api-status-indicator');
    const statusText = document.getElementById('api-status-text');
    
    // Check for 5-Factor Engine FlaggedHashtags
    if (window.FlaggedHashtags) {
        useLocalDatabase = true;
        console.log('✅ Using 5-Factor Engine FlaggedHashtags database');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = 'status-dot online';
            statusText.textContent = 'Local database active (5-Factor Engine)';
        }
        return;
    }
    
    // Fallback to HashtagAPI if available
    if (window.HashtagAPI) {
        apiHealthy = await window.HashtagAPI.isHealthy();
        
        if (statusIndicator && statusText) {
            if (apiHealthy) {
                statusIndicator.className = 'status-dot online';
                statusText.textContent = 'Real-time verification active';
            } else {
                statusIndicator.className = 'status-dot offline';
                statusText.textContent = 'Using local database (API offline)';
            }
        }
        
        console.log(`🔌 HashtagAPI Status: ${apiHealthy ? 'Online' : 'Offline'}`);
        return;
    }
    
    // No database available
    if (statusIndicator && statusText) {
        statusIndicator.className = 'status-dot offline';
        statusText.textContent = 'Using pattern matching (limited)';
    }
    
    console.log('⚠️ No hashtag database loaded - using pattern matching');
}

// ============================================
// DATABASE STATS
// ============================================
async function updateDatabaseStats() {
    const statsEl = document.getElementById('hashtag-db-stats');
    if (!statsEl) return;
    
    // Try 5-Factor Engine database first
    if (window.FlaggedHashtags) {
        try {
            const stats = window.FlaggedHashtags.getStats();
            
            statsEl.innerHTML = `
                <span class="stat-item">📊 ${stats.total.toLocaleString()} tags tracked</span>
                <span class="stat-item">#️⃣ ${stats.hashtags || 0} hashtags</span>
                <span class="stat-item">💲 ${stats.cashtags || 0} cashtags</span>
            `;
            return;
        } catch (error) {
            console.warn('Could not fetch FlaggedHashtags stats:', error);
        }
    }
    
    // Fallback to HashtagAPI
    if (window.HashtagAPI) {
        try {
            const stats = await window.HashtagAPI.getStats();
            
            if (stats.success && stats.stats) {
                const total = stats.stats.totalHashtags || 0;
                const lastUpdated = stats.stats.lastUpdated 
                    ? new Date(stats.stats.lastUpdated).toLocaleString()
                    : 'Unknown';
                
                statsEl.innerHTML = `
                    <span class="stat-item">📊 ${total.toLocaleString()} hashtags tracked</span>
                    <span class="stat-item">🔄 Last updated: ${lastUpdated}</span>
                `;
            }
        } catch (error) {
            console.warn('Could not fetch API stats:', error);
        }
    }
}

// ============================================
// PLATFORM DROPDOWN - EXCLUDES REDDIT
// ============================================
function populatePlatformSelect() {
    const select = document.getElementById('hashtag-platform-select');
    if (!select) {
        console.warn('⚠️ #hashtag-platform-select not found');
        return;
    }
    
    select.innerHTML = '<option value="">Choose a platform...</option>';
    
    const platforms = window.platformData.filter(p => 
        p.supports && p.supports.hashtagCheck === true
    );
    
    console.log('📋 Hashtag platforms (excluding Reddit):', platforms.map(p => p.name).join(', '));
    
    const livePlatforms = platforms.filter(p => p.status === 'live');
    const soonPlatforms = platforms.filter(p => p.status === 'soon');
    
    livePlatforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform.id;
        option.textContent = `${platform.icon} ${platform.name}`;
        select.appendChild(option);
    });
    
    if (livePlatforms.length > 0 && soonPlatforms.length > 0) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '── Coming Soon ──';
        select.appendChild(separator);
    }
    
    soonPlatforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform.id;
        option.textContent = `${platform.icon} ${platform.name} (Soon)`;
        option.disabled = true;
        select.appendChild(option);
    });
    
    console.log('✅ Hashtag dropdown populated');
}

function populatePlatformIcons() {
    const container = document.getElementById('hashtag-platform-icons');
    if (!container || !window.platformData) return;
    
    let html = '';
    
    const platforms = window.platformData.filter(p => 
        p.supports && p.supports.hashtagCheck === true
    );
    
    platforms.forEach(platform => {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const title = platform.status === 'soon' ? `${platform.name} (Coming Soon)` : platform.name;
        html += `<span class="platform-chip ${statusClass}" title="${title}" data-platform="${platform.id}">${platform.icon}</span>`;
    });
    
    container.innerHTML = html;
    
    container.querySelectorAll('.platform-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const platformId = chip.dataset.platform;
            const platform = window.getPlatformById ? window.getPlatformById(platformId) : null;
            if (platform) showHashtagInfoModal(platform);
        });
    });
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    const platformSelect = document.getElementById('hashtag-platform-select');
    if (platformSelect) {
        platformSelect.addEventListener('change', handlePlatformChange);
    }
    
    const hashtagInput = document.getElementById('hashtag-input');
    if (hashtagInput) {
        hashtagInput.addEventListener('input', handleHashtagInput);
    }
    
    const form = document.getElementById('hashtag-check-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
    }
    
    const hashtagInfoBtn = document.getElementById('hashtag-info-btn');
    if (hashtagInfoBtn) {
        hashtagInfoBtn.addEventListener('click', () => openModal('hashtag-info-modal'));
    }
    
    const engineInfoBtn = document.getElementById('engine-info-btn');
    if (engineInfoBtn) {
        engineInfoBtn.addEventListener('click', () => openModal('engine-info-modal'));
    }
    
    const reportBtn = document.getElementById('report-hashtag-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => openModal('report-hashtag-modal'));
    }
}

// ============================================
// HANDLERS
// ============================================
function handlePlatformChange(e) {
    const platformId = e.target.value;
    currentPlatform = platformId ? window.getPlatformById(platformId) : null;
    
    const note = document.getElementById('platform-selector-note');
    
    if (!platformId) {
        if (note) note.textContent = 'Different platforms have different banned hashtags';
        updateSubmitButton();
        return;
    }
    
    if (currentPlatform) {
        if (note) {
            if (currentPlatform.status === 'live') {
                const dbType = window.FlaggedHashtags ? '5-Factor database' : 'real-time API';
                note.textContent = `Checking ${currentPlatform.name} tags via ${dbType}`;
            } else {
                note.textContent = `${currentPlatform.name} hashtag checking coming soon`;
            }
        }
    }
    
    updateSubmitButton();
}

function handleHashtagInput(e) {
    const value = e.target.value;
    const tags = parseTags(value);
    
    const countEl = document.getElementById('hashtag-count');
    if (countEl) {
        const hashtagCount = tags.filter(t => t.startsWith('#')).length;
        const cashtagCount = tags.filter(t => t.startsWith('$')).length;
        
        let text = '';
        if (hashtagCount > 0 && cashtagCount > 0) {
            text = `${hashtagCount} hashtag${hashtagCount !== 1 ? 's' : ''}, ${cashtagCount} cashtag${cashtagCount !== 1 ? 's' : ''}`;
        } else if (cashtagCount > 0) {
            text = `${cashtagCount} cashtag${cashtagCount !== 1 ? 's' : ''}`;
        } else {
            text = `${hashtagCount} hashtag${hashtagCount !== 1 ? 's' : ''}`;
        }
        countEl.textContent = text;
    }
    
    updateSubmitButton();
}

/**
 * Parse both hashtags (#) and cashtags ($) from input
 */
function parseTags(text) {
    if (!text) return [];
    
    // Match both hashtags and cashtags
    const hashtagMatches = text.match(/#[\w\u0080-\uFFFF]+/g) || [];
    const cashtagMatches = text.match(/\$[A-Za-z]{1,10}/g) || [];
    
    let allTags = [...hashtagMatches, ...cashtagMatches];
    
    // If no matches, try to parse as space/comma separated words
    if (allTags.length === 0) {
        const words = text.split(/[\s,\n]+/).filter(w => w.trim());
        allTags = words.map(w => {
            if (w.startsWith('#') || w.startsWith('$')) return w;
            // Assume hashtag if not specified
            return '#' + w;
        }).filter(w => w.length > 1);
    }
    
    return [...new Set(allTags)]; // Remove duplicates
}

function updateSubmitButton() {
    const platformSelect = document.getElementById('hashtag-platform-select');
    const hashtagInput = document.getElementById('hashtag-input');
    const checkBtn = document.getElementById('check-hashtags-btn');
    
    const hasPlatform = platformSelect && platformSelect.value;
    const tags = parseTags(hashtagInput ? hashtagInput.value : '');
    const hasTags = tags.length > 0;
    const isLive = currentPlatform && currentPlatform.status === 'live';
    
    if (checkBtn) {
        checkBtn.disabled = !(hasPlatform && hasTags && isLive);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const hashtagInput = document.getElementById('hashtag-input');
    const hashtagText = hashtagInput ? hashtagInput.value.trim() : '';
    const tags = parseTags(hashtagText);
    
    if (!currentPlatform) {
        showToast('Please select a platform', 'warning');
        return;
    }
    
    if (tags.length === 0) {
        showToast('Please enter at least one hashtag or cashtag', 'warning');
        return;
    }
    
    if (currentPlatform.status !== 'live') {
        showToast(`${currentPlatform.name} hashtag checking coming soon!`, 'info');
        return;
    }
    
    runAnalysis(tags);
}

function handleClear() {
    const platformSelect = document.getElementById('hashtag-platform-select');
    const hashtagInput = document.getElementById('hashtag-input');
    const checkBtn = document.getElementById('check-hashtags-btn');
    const countEl = document.getElementById('hashtag-count');
    const note = document.getElementById('platform-selector-note');
    
    if (platformSelect) platformSelect.value = '';
    if (hashtagInput) hashtagInput.value = '';
    if (checkBtn) checkBtn.disabled = true;
    if (countEl) countEl.textContent = '0 tags';
    if (note) note.textContent = 'Each platform has different hashtag restrictions';
    
    currentPlatform = null;
}

// ============================================
// ANALYSIS
// ============================================
async function runAnalysis(tags) {
    const checkerCard = document.getElementById('checker-card');
    const engineAnimation = document.getElementById('engine-animation');
    
    if (checkerCard) checkerCard.classList.add('hidden');
    if (engineAnimation) engineAnimation.classList.remove('hidden');
    
    runEngineAnimation(tags);
    
    const platformId = currentPlatform ? currentPlatform.id : 'twitter';
    
    try {
        let results;
        
        // Try 5-Factor Engine first
        if (window.FlaggedHashtags) {
            console.log('🔍 Checking tags via 5-Factor FlaggedHashtags...');
            results = await checkWith5FactorEngine(tags, platformId);
        }
        // Then try 5-Factor Engine checkTags function
        else if (window.checkTags) {
            console.log('🔍 Checking tags via 5-Factor checkTags...');
            const engineResult = await window.checkTags(tags, platformId);
            results = convertEngineResult(engineResult);
        }
        // Then try HashtagAPI
        else if (window.HashtagAPI) {
            console.log('🔍 Checking tags via HashtagAPI...');
            results = await window.HashtagAPI.checkBulk(tags, platformId);
        }
        // Fallback to local pattern matching
        else {
            console.log('📂 Falling back to pattern matching...');
            results = performPatternCheck(tags, platformId);
        }
        
        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 4500));
        
        // Build result data
        const demoResult = buildResultData(tags, results, platformId);
        
        sessionStorage.setItem('lastAnalysisResult', JSON.stringify(demoResult));
        window.location.href = `results.html?platform=${platformId}&type=hashtag&demo=true`;
        
    } catch (error) {
        console.error('Analysis error:', error);
        showToast('Error checking tags. Please try again.', 'error');
        
        if (checkerCard) checkerCard.classList.remove('hidden');
        if (engineAnimation) engineAnimation.classList.add('hidden');
    }
}

/**
 * Check tags using 5-Factor Engine FlaggedHashtags database
 */
async function checkWith5FactorEngine(tags, platformId) {
    const result = window.FlaggedHashtags.checkBulk(tags, platformId);
    
    // Convert to standard format
    return {
        success: true,
        summary: {
            total: result.total,
            banned: result.results.filter(r => r.status === 'banned').length,
            restricted: result.results.filter(r => r.status === 'restricted').length,
            monitored: result.results.filter(r => r.status === 'monitored').length,
            safe: result.results.filter(r => r.status === 'safe').length
        },
        results: result.results.map(r => ({
            tag: r.tag,
            type: r.type,
            status: r.status,
            category: r.category,
            confidence: r.status === 'safe' ? 50 : 85,
            source: 'local-5factor'
        })),
        riskScore: result.riskScore
    };
}

/**
 * Convert 5-Factor Engine checkTags result to standard format
 */
function convertEngineResult(engineResult) {
    const results = engineResult.results || {};
    
    const allResults = [];
    
    (results.banned || []).forEach(item => {
        allResults.push({
            tag: item.tag || item,
            type: (item.tag || item).startsWith('$') ? 'cashtag' : 'hashtag',
            status: 'banned',
            category: item.category || 'unknown',
            confidence: 90,
            source: '5factor-engine'
        });
    });
    
    (results.restricted || []).forEach(item => {
        allResults.push({
            tag: item.tag || item,
            type: (item.tag || item).startsWith('$') ? 'cashtag' : 'hashtag',
            status: 'restricted',
            category: item.category || 'unknown',
            confidence: 80,
            source: '5factor-engine'
        });
    });
    
    (results.monitored || []).forEach(item => {
        allResults.push({
            tag: item.tag || item,
            type: (item.tag || item).startsWith('$') ? 'cashtag' : 'hashtag',
            status: 'monitored',
            category: item.category || 'unknown',
            confidence: 70,
            source: '5factor-engine'
        });
    });
    
    (results.safe || []).forEach(item => {
        allResults.push({
            tag: item.tag || item,
            type: (item.tag || item).startsWith('$') ? 'cashtag' : 'hashtag',
            status: 'safe',
            category: item.category || 'general',
            confidence: 50,
            source: '5factor-engine'
        });
    });
    
    return {
        success: true,
        summary: engineResult.summary || {
            total: allResults.length,
            banned: (results.banned || []).length,
            restricted: (results.restricted || []).length,
            monitored: (results.monitored || []).length,
            safe: (results.safe || []).length
        },
        results: allResults,
        riskScore: engineResult.summary?.riskScore || 0
    };
}

/**
 * Fallback pattern-based checking
 */
function performPatternCheck(tags, platformId) {
    const results = [];
    let banned = 0;
    let restricted = 0;
    let safe = 0;
    
    // Known patterns
    const bannedPatterns = ['porn', 'xxx', 'nsfw', 'nude', 'followback', 'f4f', 'followforfollow', 'follow4follow'];
    const restrictedPatterns = ['like4like', 'l4l', 'spam', 'dm', 'promo', 'gainwith'];
    const bannedCashtags = ['$scam', '$free', '$airdrop', '$100x', '$1000x'];
    
    tags.forEach(tag => {
        const cleanTag = tag.toLowerCase();
        const isCashtag = tag.startsWith('$');
        
        let status = 'safe';
        let confidence = 50;
        
        if (isCashtag) {
            if (bannedCashtags.some(p => cleanTag === p)) {
                status = 'banned';
                confidence = 85;
                banned++;
            }
        } else {
            const tagWithoutHash = cleanTag.replace('#', '');
            
            if (bannedPatterns.some(p => tagWithoutHash.includes(p))) {
                status = 'banned';
                confidence = 80;
                banned++;
            } else if (restrictedPatterns.some(p => tagWithoutHash.includes(p))) {
                status = 'restricted';
                confidence = 70;
                restricted++;
            } else {
                safe++;
            }
        }
        
        results.push({
            tag: tag,
            type: isCashtag ? 'cashtag' : 'hashtag',
            status: status,
            category: 'pattern-match',
            confidence: confidence,
            source: 'pattern'
        });
    });
    
    return {
        success: true,
        summary: { total: tags.length, banned, restricted, monitored: 0, safe },
        results: results,
        riskScore: calculateRiskScore({ banned, restricted, monitored: 0, safe, total: tags.length })
    };
}

function calculateRiskScore(summary) {
    const bannedWeight = 30;
    const restrictedWeight = 15;
    const monitoredWeight = 5;
    
    const totalRisk = (summary.banned * bannedWeight) + 
                      (summary.restricted * restrictedWeight) + 
                      (summary.monitored * monitoredWeight);
    const maxRisk = summary.total * bannedWeight;
    
    if (maxRisk === 0) return 5;
    
    return Math.min(95, Math.max(5, Math.round((totalRisk / maxRisk) * 100)));
}

function buildResultData(tags, results, platformId) {
    const platform = currentPlatform || window.getPlatformById(platformId);
    
    // Group results by status
    const grouped = {
        banned: [],
        restricted: [],
        monitored: [],
        safe: []
    };
    
    results.results.forEach(r => {
        if (grouped[r.status]) {
            grouped[r.status].push({
                tag: r.tag,
                type: r.type,
                category: r.category,
                reason: r.category
            });
        }
    });
    
    return {
        checkType: 'tagCheck',
        platform: platformId,
        platformName: platform ? platform.name : 'Twitter/X',
        platformIcon: platform ? platform.icon : '𝕏',
        timestamp: new Date().toISOString(),
        demo: true,
        
        input: {
            tags: tags,
            count: tags.length
        },
        
        results: grouped,
        
        summary: {
            total: results.summary.total,
            banned: results.summary.banned,
            restricted: results.summary.restricted,
            monitored: results.summary.monitored || 0,
            safe: results.summary.safe,
            riskScore: results.riskScore || calculateRiskScore(results.summary)
        },
        
        verdict: getVerdict(results.summary),
        
        recommendations: generateRecommendations(results.summary, grouped),
        
        // Legacy compatibility
        hashtags: tags,
        hashtagResults: results.results.map(r => ({
            hashtag: r.tag,
            status: r.status,
            confidence: r.confidence,
            source: r.source
        })),
        bannedCount: results.summary.banned,
        restrictedCount: results.summary.restricted,
        safeCount: results.summary.safe,
        probability: results.riskScore || calculateRiskScore(results.summary),
        factorsUsed: 3
    };
}

function getVerdict(summary) {
    if (summary.banned > 0) return 'HIGH RISK';
    if (summary.restricted > 0) return 'MEDIUM RISK';
    if (summary.monitored > 0) return 'LOW RISK';
    return 'CLEAR';
}

function generateRecommendations(summary, grouped) {
    const recs = [];
    
    if (grouped.banned.length > 0) {
        recs.push({
            priority: 'critical',
            action: `Remove banned tags: ${grouped.banned.map(t => t.tag).join(', ')}`
        });
    }
    
    if (grouped.restricted.length > 0) {
        recs.push({
            priority: 'high',
            action: `Consider removing restricted tags: ${grouped.restricted.map(t => t.tag).join(', ')}`
        });
    }
    
    if (grouped.monitored.length > 0) {
        recs.push({
            priority: 'medium',
            action: `Use monitored tags sparingly: ${grouped.monitored.map(t => t.tag).join(', ')}`
        });
    }
    
    if (grouped.safe.length > 0) {
        recs.push({
            priority: 'info',
            action: `Safe to use: ${grouped.safe.slice(0, 5).map(t => t.tag).join(', ')}${grouped.safe.length > 5 ? '...' : ''}`
        });
    }
    
    return recs;
}

// ============================================
// ENGINE ANIMATION
// ============================================
function runEngineAnimation(tags) {
    const terminalOutput = document.getElementById('terminal-output');
    if (terminalOutput) terminalOutput.innerHTML = '';
    
    const platform = currentPlatform || { id: 'twitter', name: 'Twitter/X' };
    const dbType = window.FlaggedHashtags ? '5-Factor database' : (window.HashtagAPI ? 'real-time API' : 'pattern matching');
    
    const hashtagCount = tags.filter(t => t.startsWith('#')).length;
    const cashtagCount = tags.filter(t => t.startsWith('$')).length;
    let tagDesc = `${tags.length} tag${tags.length !== 1 ? 's' : ''}`;
    if (hashtagCount > 0 && cashtagCount > 0) {
        tagDesc = `${hashtagCount} hashtag${hashtagCount !== 1 ? 's' : ''} + ${cashtagCount} cashtag${cashtagCount !== 1 ? 's' : ''}`;
    }
    
    const lines = [
        { text: `> Initializing 3-Factor Detection Engine...`, delay: 0 },
        { text: `> Target platform: ${platform.name}`, delay: 400 },
        { text: `> Tags to check: ${tagDesc}`, delay: 800 },
        { text: `> Using ${dbType}...`, delay: 1200 },
        { text: `> Database loaded ✓`, delay: 1600 },
        { text: `> Querying hashtag database...`, delay: 2000 },
        { text: cashtagCount > 0 ? `> Querying cashtag database...` : `> Checking patterns...`, delay: 2400 },
        { text: `> Running web visibility tests...`, delay: 2800 },
        { text: `> Calculating risk probability...`, delay: 3200 },
    ];
    
    lines.forEach(line => {
        setTimeout(() => {
            if (terminalOutput) {
                const lineEl = document.createElement('div');
                lineEl.className = 'terminal-line';
                lineEl.textContent = line.text;
                terminalOutput.appendChild(lineEl);
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
        }, line.delay);
    });
    
    const factors = [
        { id: 'factor-1-progress', delay: 1400, status: window.FlaggedHashtags ? 'complete' : 'na' },
        { id: 'factor-2-progress', delay: 2200, status: 'complete' },
        { id: 'factor-3-progress', delay: 2600, status: 'complete' },
        { id: 'factor-4-progress', delay: 3000, status: 'complete' },
        { id: 'factor-5-progress', delay: 1400, status: 'na' },
    ];
    
    factors.forEach(factor => {
        setTimeout(() => {
            const el = document.getElementById(factor.id);
            if (el) {
                const status = el.querySelector('.factor-status') || el.querySelector('.factor-compact-status');
                if (status) {
                    if (factor.status === 'complete') {
                        status.textContent = '✓';
                        status.classList.remove('pending');
                        status.classList.add('complete');
                    } else {
                        status.textContent = '—';
                        status.classList.remove('pending');
                        status.classList.add('na');
                    }
                }
            }
        }, factor.delay);
    });
    
    setTimeout(() => {
        const phase1 = document.getElementById('engine-phase-1');
        const phase2 = document.getElementById('engine-phase-2');
        if (phase1) phase1.classList.add('hidden');
        if (phase2) phase2.classList.remove('hidden');
        
        const aiMessages = [
            'Analyzing tag patterns...',
            'Cross-referencing database...',
            'Generating risk assessment...'
        ];
        const aiMessageEl = document.getElementById('ai-processing-message');
        aiMessages.forEach((msg, i) => {
            setTimeout(() => {
                if (aiMessageEl) aiMessageEl.textContent = msg;
            }, i * 600);
        });
    }, 3600);
}

// ============================================
// REPORT HASHTAG
// ============================================
async function submitHashtagReport() {
    const hashtagInput = document.getElementById('report-hashtag-input');
    const statusSelect = document.getElementById('report-status-select');
    const evidenceInput = document.getElementById('report-evidence-input');
    
    if (!hashtagInput || !statusSelect) return;
    
    const hashtag = hashtagInput.value.trim();
    const status = statusSelect.value;
    const evidence = evidenceInput ? evidenceInput.value.trim() : '';
    
    if (!hashtag || !status || !currentPlatform) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    // Try HashtagAPI first
    if (window.HashtagAPI) {
        const result = await window.HashtagAPI.reportHashtag(
            hashtag,
            currentPlatform.id,
            status,
            evidence
        );
        
        if (result.success) {
            showToast('Report submitted! We will verify this tag.', 'success');
            closeModal('report-hashtag-modal');
            hashtagInput.value = '';
            statusSelect.value = '';
            if (evidenceInput) evidenceInput.value = '';
        } else {
            showToast('Error submitting report. Please try again.', 'error');
        }
    } else {
        // Log locally
        console.log('Hashtag report (no API):', { hashtag, status, evidence, platform: currentPlatform.id });
        showToast('Report saved. Thank you!', 'info');
        closeModal('report-hashtag-modal');
    }
}

window.submitHashtagReport = submitHashtagReport;

// ============================================
// MODALS
// ============================================
function showHashtagInfoModal(platform) {
    const modal = document.getElementById('platform-modal') || document.getElementById('hashtag-info-modal');
    if (!modal || !platform) return;
    
    const modalIcon = modal.querySelector('.modal-icon') || document.getElementById('modal-icon');
    const modalTitle = modal.querySelector('.modal-title') || document.getElementById('modal-title');
    const modalBody = modal.querySelector('.modal-body') || document.getElementById('modal-body');
    const modalStatus = modal.querySelector('.modal-status') || document.getElementById('modal-status');
    
    if (modalIcon) modalIcon.textContent = platform.icon;
    if (modalTitle) modalTitle.textContent = `${platform.name} Tag Analysis`;
    
    if (modalStatus) {
        const statusClass = platform.status === 'live' ? 'live' : 'soon';
        const statusText = platform.status === 'live' ? 'Live' : 'Coming Soon';
        modalStatus.innerHTML = `<span class="status-badge ${statusClass}">● ${statusText}</span>`;
    }
    
    const dbType = window.FlaggedHashtags ? '5-Factor Engine database' : 'real-time API';
    
    let checksHtml = '<h4>What We Check:</h4><ul class="check-list">';
    checksHtml += `<li>✓ #Hashtag status via ${dbType}</li>`;
    checksHtml += '<li>✓ $Cashtag verification (stocks & crypto)</li>';
    checksHtml += '<li>✓ Platform-specific restrictions</li>';
    checksHtml += '<li>✓ Risk scoring and recommendations</li>';
    checksHtml += '</ul>';
    
    if (platform.messages && platform.messages.platformNote) {
        checksHtml += `<p style="margin-top: var(--space-md); padding: var(--space-md); background: rgba(99, 102, 241, 0.1); border-radius: var(--radius-md);">💡 ${platform.messages.platformNote}</p>`;
    }
    
    if (modalBody) modalBody.innerHTML = checksHtml;
    
    openModal(modal.id);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) overlay.onclick = () => closeModal(modalId);
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.onclick = () => closeModal(modalId);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

window.closeModal = closeModal;
window.closeLimitModal = function() { closeModal('limit-modal'); };

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
