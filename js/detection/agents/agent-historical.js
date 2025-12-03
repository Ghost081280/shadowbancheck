/* =============================================================================
   AGENT-HISTORICAL.JS - Factor 3: Historical Data Analysis (15%)
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Version: 2.0.0
   Updated: December 2025
   
   Analyzes historical patterns and stored data:
   - Previous check results for this account/content
   - Trend analysis over time (improving/worsening/stable)
   - Engagement baseline comparison
   - Pattern recognition from past moderation actions
   - Signal history tracking
   - Recovery history
   - Past scores for specific items (3-Point Intelligence)
   
   Note: Full features require Pro subscription
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// HISTORICAL AGENT CLASS
// =============================================================================

class HistoricalAgent extends window.AgentBase {
    
    constructor() {
        super('historical', 3, 15); // id, factor 3, weight 15%
        
        // In-memory store for demo (would be database in production)
        this.historyStore = new Map();
        this.maxHistoryItems = 100;
        
        // Separate store for item-specific scores (hashtags, links, etc.)
        this.itemScoreStore = new Map();
        this.maxItemScores = 500;
        
        // Pro feature flag
        this.isPro = false;
    }
    
    // =========================================================================
    // MAIN ANALYZE METHOD
    // =========================================================================
    
    async analyze(input) {
        const startTime = Date.now();
        const findings = [];
        const flags = [];
        let rawScore = 0;
        
        try {
            const key = this.getHistoryKey(input);
            const history = this.getHistory(key);
            
            // Build checks object matching spec structure
            const checks = {
                hasHistory: history.length > 0,
                previousScans: history.length,
                firstScan: history.length > 0 ? history[0].timestamp : null,
                
                trend: null,
                engagementBaseline: null,
                anomalies: [],
                signalHistory: {},
                recoveryHistory: null
            };
            
            // === No History Case ===
            if (history.length === 0) {
                // Check if entity exists in public database (other users' searches)
                const publicHistory = this.getPublicHistory(key);
                
                if (publicHistory) {
                    checks.publicHistory = {
                        timesSearched: publicHistory.searchCount,
                        lastSearched: publicHistory.lastSearched,
                        averageScore: publicHistory.averageScore
                    };
                    
                    findings.push(this.createFinding(
                        'info',
                        `Entity found in public database (searched ${publicHistory.searchCount} times)`,
                        0,
                        { averageScore: publicHistory.averageScore }
                    ));
                    
                    // Use public history to influence score
                    if (publicHistory.averageScore > 50) {
                        rawScore += 10;
                        findings.push(this.createFinding(
                            'warning',
                            `Public history shows average score of ${publicHistory.averageScore}%`,
                            15,
                            {}
                        ));
                    }
                } else {
                    findings.push(this.createFinding(
                        'info',
                        'No previous checks found - first time analysis',
                        0,
                        { note: 'Historical tracking will begin after this scan' }
                    ));
                }
                
                return this.createResult({
                    status: history.length === 0 && !publicHistory ? 'limited' : 'complete',
                    rawScore: rawScore,
                    confidence: 30,
                    findings,
                    checks,
                    processingTime: Date.now() - startTime,
                    message: 'No personal history available'
                });
            }
            
            // === Full Historical Analysis (Pro) ===
            const analysis = this.analyzeHistory(history);
            
            // Update checks with analysis results
            checks.trend = {
                direction: analysis.trend,
                averageScore: analysis.averageScore,
                currentScore: history[history.length - 1]?.score || 0,
                delta: analysis.delta,
                thirtyDayTrend: analysis.thirtyDayChange
            };
            
            // === ANALYSIS: Trend Direction ===
            if (analysis.trend === 'worsening') {
                findings.push(this.createFinding(
                    'danger',
                    `Score worsened ${Math.abs(analysis.thirtyDayChange || 0)}% in 30 days`,
                    30,
                    { trend: analysis.trendData }
                ));
                rawScore += 20;
                flags.push('worsening');
            } else if (analysis.trend === 'improving') {
                findings.push(this.createFinding(
                    'good',
                    'Shadowban probability has been decreasing',
                    -10,
                    { trend: analysis.trendData }
                ));
            } else {
                findings.push(this.createFinding(
                    'info',
                    'Score has been stable',
                    0,
                    {}
                ));
            }
            
            // === ANALYSIS: Repeated Flags ===
            if (analysis.repeatedFlags.length > 0) {
                findings.push(this.createFinding(
                    'warning',
                    `Recurring issues detected: ${analysis.repeatedFlags.join(', ')}`,
                    25,
                    { flags: analysis.repeatedFlags }
                ));
                rawScore += 15;
                flags.push('recurring_issues');
            }
            
            // === ANALYSIS: Past High Severity ===
            if (analysis.hadHighSeverity) {
                findings.push(this.createFinding(
                    'warning',
                    `Previous checks found ${analysis.highSeverityCount} high-severity issue(s)`,
                    20,
                    { count: analysis.highSeverityCount }
                ));
                rawScore += 10;
                flags.push('past_issues');
            }
            
            // === ANALYSIS: Anomalies ===
            if (analysis.anomalies.length > 0) {
                checks.anomalies = analysis.anomalies;
                
                for (const anomaly of analysis.anomalies.slice(0, 3)) {
                    findings.push(this.createFinding(
                        anomaly.severity === 'high' ? 'danger' : 'warning',
                        `${anomaly.type}: ${anomaly.metric} changed ${anomaly.magnitude}`,
                        anomaly.severity === 'high' ? 25 : 15,
                        { date: anomaly.date, cause: anomaly.possibleCause }
                    ));
                    rawScore += anomaly.severity === 'high' ? 10 : 5;
                }
            }
            
            // === ANALYSIS: Engagement Baseline (Pro) ===
            if (this.isPro && analysis.engagementBaseline) {
                checks.engagementBaseline = analysis.engagementBaseline;
                
                if (analysis.engagementBaseline.significantDrop) {
                    findings.push(this.createFinding(
                        'warning',
                        `Engagement ${Math.abs(analysis.engagementBaseline.deviation)}% below baseline`,
                        15,
                        analysis.engagementBaseline
                    ));
                    rawScore += 10;
                    flags.push('engagement_drop');
                }
            }
            
            // === ANALYSIS: Signal History ===
            if (analysis.signalHistory) {
                checks.signalHistory = analysis.signalHistory;
                
                for (const [signalType, signalData] of Object.entries(analysis.signalHistory)) {
                    if (signalData.previousFlags > 0 && signalData.trend === 'recurring') {
                        findings.push(this.createFinding(
                            'info',
                            `Recurring ${signalType} issues (${signalData.previousFlags} previous flags)`,
                            10,
                            signalData
                        ));
                    }
                }
            }
            
            // === Context: Average Score ===
            findings.push(this.createFinding(
                'info',
                `Historical average: ${analysis.averageScore.toFixed(1)}% from ${history.length} checks`,
                0,
                { averageScore: analysis.averageScore, checkCount: history.length }
            ));
            
            // Use historical average to influence current score
            if (analysis.averageScore > 50) {
                rawScore += 15;
            } else if (analysis.averageScore > 30) {
                rawScore += 5;
            }
            
            // Higher confidence with more history
            const confidence = Math.min(90, 40 + (history.length * 5));
            
            return this.createResult({
                status: 'complete',
                rawScore: Math.min(100, rawScore),
                confidence: confidence,
                findings,
                flags,
                checks,
                processingTime: Date.now() - startTime,
                message: `Analysis based on ${history.length} previous checks`
            });
            
        } catch (error) {
            this.log(`Error: ${error.message}`, 'error');
            return this.createResult({
                status: 'error',
                rawScore: 0,
                confidence: 0,
                findings: [{
                    type: 'danger',
                    severity: 'high',
                    message: `Historical analysis error: ${error.message}`,
                    impact: 0
                }],
                processingTime: Date.now() - startTime,
                message: `Error: ${error.message}`
            });
        }
    }
    
    // =========================================================================
    // 3-POINT INTELLIGENCE METHODS
    // Called by Detection Agent for historical item scores
    // =========================================================================
    
    /**
     * Get past scores for specific items (Point 3: Historical)
     * @param {array} items - Items to look up (hashtags, links, etc.)
     * @param {string} type - Type of items
     * @param {string} platformId - Platform context
     * @returns {object} Historical score data
     */
    async getPastScores(items, type, platformId) {
        if (!items || items.length === 0) {
            return { available: false, scores: [], averageScore: 0 };
        }
        
        const results = {
            available: true,
            scores: [],
            trends: [],
            averageScore: 0,
            trendDirection: 'stable',
            itemsWithHistory: 0,
            itemsWithoutHistory: 0
        };
        
        try {
            let totalScore = 0;
            let scoreCount = 0;
            let recentScores = [];
            let olderScores = [];
            
            for (const item of items) {
                const itemKey = this.getItemKey(item, type, platformId);
                const itemHistory = this.getItemHistory(itemKey);
                
                if (itemHistory.length > 0) {
                    results.itemsWithHistory++;
                    
                    const latestScore = itemHistory[itemHistory.length - 1];
                    results.scores.push({
                        item,
                        currentScore: latestScore.score,
                        checkCount: itemHistory.length,
                        lastChecked: latestScore.timestamp,
                        trend: this.calculateItemTrend(itemHistory)
                    });
                    
                    totalScore += latestScore.score;
                    scoreCount++;
                    
                    if (itemHistory.length >= 2) {
                        recentScores.push(itemHistory[itemHistory.length - 1].score);
                        olderScores.push(itemHistory[0].score);
                    }
                    
                    results.trends.push({
                        item,
                        direction: this.calculateItemTrend(itemHistory),
                        history: itemHistory.slice(-5)
                    });
                } else {
                    results.itemsWithoutHistory++;
                    results.scores.push({
                        item,
                        currentScore: null,
                        checkCount: 0,
                        lastChecked: null,
                        trend: 'unknown'
                    });
                }
            }
            
            results.averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
            
            // Calculate overall trend
            if (recentScores.length >= 2 && olderScores.length >= 2) {
                const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
                const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
                
                if (recentAvg > olderAvg + 10) {
                    results.trendDirection = 'worsening';
                } else if (recentAvg < olderAvg - 10) {
                    results.trendDirection = 'improving';
                }
            }
            
            results.available = results.itemsWithHistory > 0;
            
        } catch (error) {
            this.log(`getPastScores error: ${error.message}`, 'warn');
            results.available = false;
            results.error = error.message;
        }
        
        return results;
    }
    
    /**
     * Store a score for a specific item
     */
    storeItemScore(item, type, platformId, score) {
        const itemKey = this.getItemKey(item, type, platformId);
        let history = this.itemScoreStore.get(itemKey) || [];
        
        history.push({
            score,
            timestamp: new Date().toISOString(),
            platform: platformId
        });
        
        if (history.length > 20) {
            history = history.slice(-20);
        }
        
        this.itemScoreStore.set(itemKey, history);
        
        if (this.itemScoreStore.size > this.maxItemScores) {
            this.cleanupItemStore();
        }
    }
    
    /**
     * Store multiple item scores
     */
    storeItemScores(items, platformId) {
        for (const { item, type, score } of items) {
            this.storeItemScore(item, type, platformId, score);
        }
    }
    
    // =========================================================================
    // HISTORY MANAGEMENT
    // =========================================================================
    
    getHistoryKey(input) {
        if (input.type === 'account') {
            return `account:${input.platform}:${input.username}`;
        } else if (input.type === 'post') {
            return `post:${input.platform}:${input.postId}`;
        } else if (input.type === 'text') {
            return `text:${input.platform}:${this.hashText(input.text)}`;
        }
        return `unknown:${Date.now()}`;
    }
    
    getItemKey(item, type, platformId) {
        let normalizedItem = String(item).toLowerCase().trim();
        
        if (type === 'hashtags') {
            normalizedItem = normalizedItem.replace(/^#/, '');
        } else if (type === 'mentions') {
            normalizedItem = normalizedItem.replace(/^@/, '');
        }
        
        return `item:${type}:${platformId}:${normalizedItem}`;
    }
    
    hashText(text) {
        let hash = 0;
        for (let i = 0; i < Math.min(text.length, 100); i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    
    getHistory(key) {
        return this.historyStore.get(key) || [];
    }
    
    getItemHistory(itemKey) {
        return this.itemScoreStore.get(itemKey) || [];
    }
    
    getPublicHistory(key) {
        // In production, would query shared database
        // Demo: Return simulated public history for some keys
        if (this.useDemo && Math.random() > 0.6) {
            return {
                searchCount: Math.floor(Math.random() * 50) + 1,
                lastSearched: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                averageScore: Math.floor(Math.random() * 60) + 10
            };
        }
        return null;
    }
    
    /**
     * Store a check result in history
     */
    storeResult(input, result) {
        const key = this.getHistoryKey(input);
        let history = this.historyStore.get(key) || [];
        
        history.push({
            timestamp: new Date().toISOString(),
            score: result.rawScore || result.probability || 0,
            confidence: result.confidence || 0,
            flags: result.flags || [],
            findings: result.findings || [],
            signalScores: result.signalSummary?.scores || {}
        });
        
        if (history.length > this.maxHistoryItems) {
            history = history.slice(-this.maxHistoryItems);
        }
        
        this.historyStore.set(key, history);
    }
    
    clearHistory(key) {
        if (key) {
            this.historyStore.delete(key);
        } else {
            this.historyStore.clear();
        }
    }
    
    // =========================================================================
    // ANALYSIS METHODS
    // =========================================================================
    
    analyzeHistory(history) {
        if (history.length === 0) {
            return {
                trend: 'unknown',
                trendData: null,
                averageScore: 0,
                delta: 0,
                thirtyDayChange: null,
                repeatedFlags: [],
                hadHighSeverity: false,
                highSeverityCount: 0,
                anomalies: [],
                engagementBaseline: null,
                signalHistory: {}
            };
        }
        
        // Calculate average score
        const scores = history.map(h => h.score);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        // Analyze trend
        let trend = 'stable';
        let trendData = null;
        let delta = 0;
        let thirtyDayChange = null;
        
        if (history.length >= 3) {
            const recentAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
            const olderAvg = scores.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, scores.length - 3);
            
            delta = recentAvg - olderAvg;
            
            if (delta > 10) {
                trend = 'worsening';
                trendData = { recent: recentAvg, older: olderAvg, change: delta };
            } else if (delta < -10) {
                trend = 'improving';
                trendData = { recent: recentAvg, older: olderAvg, change: delta };
            }
            
            // Calculate 30-day change if we have enough data
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const recentHistory = history.filter(h => new Date(h.timestamp) > thirtyDaysAgo);
            if (recentHistory.length >= 2) {
                const firstScore = recentHistory[0].score;
                const lastScore = recentHistory[recentHistory.length - 1].score;
                thirtyDayChange = Math.round(((lastScore - firstScore) / Math.max(1, firstScore)) * 100);
            }
        }
        
        // Find repeated flags
        const flagCounts = {};
        for (const item of history) {
            for (const flag of (item.flags || [])) {
                flagCounts[flag] = (flagCounts[flag] || 0) + 1;
            }
        }
        
        const repeatedFlags = Object.entries(flagCounts)
            .filter(([_, count]) => count >= 2)
            .map(([flag]) => flag);
        
        // Check for high severity
        let highSeverityCount = 0;
        for (const item of history) {
            if (item.score >= 60) {
                highSeverityCount++;
            }
        }
        
        // Detect anomalies (sudden changes)
        const anomalies = [];
        for (let i = 1; i < history.length; i++) {
            const change = history[i].score - history[i - 1].score;
            if (Math.abs(change) >= 25) {
                anomalies.push({
                    date: history[i].timestamp,
                    type: change > 0 ? 'sudden_increase' : 'sudden_drop',
                    metric: 'score',
                    severity: Math.abs(change) >= 40 ? 'high' : 'medium',
                    magnitude: `${change > 0 ? '+' : ''}${change}%`,
                    possibleCause: 'Score change detected'
                });
            }
        }
        
        // Build signal history
        const signalHistory = {};
        for (const item of history) {
            if (item.signalScores) {
                for (const [signal, score] of Object.entries(item.signalScores)) {
                    if (!signalHistory[signal]) {
                        signalHistory[signal] = {
                            previousFlags: 0,
                            scores: [],
                            trend: 'stable'
                        };
                    }
                    signalHistory[signal].scores.push(score);
                    if (score > 30) {
                        signalHistory[signal].previousFlags++;
                    }
                }
            }
        }
        
        // Determine signal trends
        for (const [signal, data] of Object.entries(signalHistory)) {
            if (data.scores.length >= 2) {
                const recent = data.scores.slice(-2).reduce((a, b) => a + b, 0) / 2;
                const older = data.scores.slice(0, -2).reduce((a, b) => a + b, 0) / Math.max(1, data.scores.length - 2);
                data.trend = recent > older + 10 ? 'worsening' : recent < older - 10 ? 'improving' : data.previousFlags >= 2 ? 'recurring' : 'stable';
            }
        }
        
        return {
            trend,
            trendData,
            averageScore,
            delta,
            thirtyDayChange,
            repeatedFlags,
            hadHighSeverity: highSeverityCount > 0,
            highSeverityCount,
            anomalies,
            engagementBaseline: null, // Would be populated with real engagement data
            signalHistory
        };
    }
    
    calculateItemTrend(history) {
        if (history.length < 2) return 'unknown';
        
        const scores = history.map(h => h.score);
        const recentAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);
        const olderAvg = scores.slice(0, -3).length > 0 
            ? scores.slice(0, -3).reduce((a, b) => a + b, 0) / scores.slice(0, -3).length
            : recentAvg;
        
        if (recentAvg > olderAvg + 10) return 'worsening';
        if (recentAvg < olderAvg - 10) return 'improving';
        return 'stable';
    }
    
    cleanupItemStore() {
        const entries = Array.from(this.itemScoreStore.entries());
        entries.sort((a, b) => {
            const aLatest = a[1][a[1].length - 1]?.timestamp || '';
            const bLatest = b[1][b[1].length - 1]?.timestamp || '';
            return aLatest.localeCompare(bLatest);
        });
        
        const removeCount = Math.floor(entries.length * 0.2);
        for (let i = 0; i < removeCount; i++) {
            this.itemScoreStore.delete(entries[i][0]);
        }
    }
    
    // =========================================================================
    // PUBLIC API
    // =========================================================================
    
    /**
     * Get statistics about stored history
     */
    getStats() {
        let totalItems = 0;
        for (const history of this.historyStore.values()) {
            totalItems += history.length;
        }
        
        return {
            uniqueKeys: this.historyStore.size,
            totalItems,
            maxPerKey: this.maxHistoryItems,
            itemScores: {
                uniqueItems: this.itemScoreStore.size,
                maxItems: this.maxItemScores
            },
            isPro: this.isPro
        };
    }
    
    /**
     * Export all stored data
     */
    exportData() {
        return {
            history: Object.fromEntries(this.historyStore),
            itemScores: Object.fromEntries(this.itemScoreStore),
            exportedAt: new Date().toISOString()
        };
    }
    
    /**
     * Import stored data
     */
    importData(data) {
        if (data.history) {
            this.historyStore = new Map(Object.entries(data.history));
        }
        if (data.itemScores) {
            this.itemScoreStore = new Map(Object.entries(data.itemScores));
        }
    }
    
    /**
     * Set Pro status
     */
    setProStatus(isPro) {
        this.isPro = !!isPro;
    }
}

// =============================================================================
// REGISTER AGENT
// =============================================================================

const historicalAgent = new HistoricalAgent();

if (window.AgentRegistry) {
    window.AgentRegistry.register(historicalAgent);
}

window.HistoricalAgent = HistoricalAgent;
window.historicalAgent = historicalAgent;

console.log('✅ HistoricalAgent v2.0.0 loaded - Factor 3 (15%)');

})();
