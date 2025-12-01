/* =============================================================================
   AGENT-HISTORICAL.JS - Factor 3: Historical Data Analysis
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Weight: 15%
   
   Analyzes historical patterns and stored data:
   - Previous check results for this account/content
   - Trend analysis over time
   - Pattern recognition from past moderation actions
   - User report history
   - Stored scores and predictions
   - Past scores for specific items (3-Point Intelligence)
   
   Version: 2.0.0 - Added 3-Point Intelligence methods
   ============================================================================= */

(function() {
'use strict';

class HistoricalAgent extends window.AgentBase {
    
    constructor() {
        super('historical', 3, 15); // Factor 3, 15% weight
        
        // In-memory store for demo (would be database in production)
        this.historyStore = new Map();
        this.maxHistoryItems = 100;
        
        // Separate store for item-specific scores (hashtags, links, etc.)
        this.itemScoreStore = new Map();
        this.maxItemScores = 500;
    }
    
    async analyze(input) {
        const startTime = Date.now();
        const findings = [];
        const flags = [];
        let rawScore = 0;
        
        try {
            const key = this.getHistoryKey(input);
            const history = this.getHistory(key);
            
            if (history.length === 0) {
                // No historical data
                findings.push(this.createFinding(
                    'no_history',
                    'No previous checks found for this item',
                    0,
                    { note: 'First time analysis' }
                ));
                
                return this.createResult({
                    rawScore: 0,
                    confidence: 30, // Low confidence without history
                    findings,
                    processingTime: Date.now() - startTime,
                    message: 'No historical data available'
                });
            }
            
            // Analyze historical data
            const analysis = this.analyzeHistory(history);
            
            // Check for worsening trend
            if (analysis.trend === 'worsening') {
                findings.push(this.createFinding(
                    'worsening_trend',
                    'Shadowban probability has been increasing over time',
                    30,
                    { trend: analysis.trendData }
                ));
                rawScore += 20;
                flags.push('worsening');
            } else if (analysis.trend === 'improving') {
                findings.push(this.createFinding(
                    'improving_trend',
                    'Shadowban probability has been decreasing',
                    -10,
                    { trend: analysis.trendData }
                ));
            }
            
            // Check for repeated flags
            if (analysis.repeatedFlags.length > 0) {
                findings.push(this.createFinding(
                    'repeated_flags',
                    `Recurring issues detected: ${analysis.repeatedFlags.join(', ')}`,
                    25,
                    { flags: analysis.repeatedFlags }
                ));
                rawScore += 15;
                flags.push('recurring_issues');
            }
            
            // Check for past high-severity findings
            if (analysis.hadHighSeverity) {
                findings.push(this.createFinding(
                    'past_severity',
                    'Previous checks found high-severity issues',
                    20,
                    { count: analysis.highSeverityCount }
                ));
                rawScore += 10;
                flags.push('past_issues');
            }
            
            // Add average score context
            findings.push(this.createFinding(
                'historical_average',
                `Average probability from ${history.length} previous checks: ${analysis.averageScore.toFixed(1)}%`,
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
                rawScore: Math.min(100, rawScore),
                confidence,
                findings,
                flags,
                processingTime: Date.now() - startTime,
                message: `Analysis based on ${history.length} previous checks`
            });
            
        } catch (error) {
            this.log(`Error: ${error.message}`, 'error');
            return this.createResult({
                rawScore: 0,
                confidence: 0,
                message: `Error: ${error.message}`
            });
        }
    }
    
    // =========================================================================
    // 3-POINT INTELLIGENCE METHODS
    // Called by DetectionAgent for historical item scores
    // =========================================================================
    
    /**
     * Get past scores for specific items (Point 3: Historical)
     * Used by DetectionAgent for 3-Point Intelligence
     * @param {array} items - Items to look up (hashtags, links, mentions, etc.)
     * @param {string} type - Type of items ('hashtags', 'links', 'content', 'mentions', 'emojis')
     * @param {string} platformId - Platform context
     * @returns {object} { available, scores, trends, averageScore, trendDirection }
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
                    
                    // Get most recent score
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
                    
                    // Track for overall trend
                    if (itemHistory.length >= 2) {
                        recentScores.push(itemHistory[itemHistory.length - 1].score);
                        olderScores.push(itemHistory[0].score);
                    }
                    
                    // Add trend info
                    results.trends.push({
                        item,
                        direction: this.calculateItemTrend(itemHistory),
                        history: itemHistory.slice(-5) // Last 5 scores
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
            
            // Calculate average score
            results.averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
            
            // Calculate overall trend direction
            if (recentScores.length >= 2 && olderScores.length >= 2) {
                const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
                const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
                
                if (recentAvg > olderAvg + 10) {
                    results.trendDirection = 'worsening';
                } else if (recentAvg < olderAvg - 10) {
                    results.trendDirection = 'improving';
                }
            }
            
            // Determine if we have useful historical data
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
     * Called after detection to build historical data
     * @param {string} item - The item (hashtag, link, etc.)
     * @param {string} type - Type of item
     * @param {string} platformId - Platform
     * @param {number} score - Score to store
     */
    storeItemScore(item, type, platformId, score) {
        const itemKey = this.getItemKey(item, type, platformId);
        let history = this.itemScoreStore.get(itemKey) || [];
        
        history.push({
            score,
            timestamp: new Date().toISOString(),
            platform: platformId
        });
        
        // Keep only recent history
        if (history.length > 20) {
            history = history.slice(-20);
        }
        
        this.itemScoreStore.set(itemKey, history);
        
        // Cleanup if store is too large
        if (this.itemScoreStore.size > this.maxItemScores) {
            this.cleanupItemStore();
        }
    }
    
    /**
     * Store multiple item scores at once
     * @param {array} items - Array of {item, type, score} objects
     * @param {string} platformId - Platform
     */
    storeItemScores(items, platformId) {
        for (const { item, type, score } of items) {
            this.storeItemScore(item, type, platformId, score);
        }
    }
    
    /**
     * Get trend for a specific item
     */
    getItemTrend(item, type, platformId) {
        const itemKey = this.getItemKey(item, type, platformId);
        const history = this.getItemHistory(itemKey);
        
        if (history.length < 2) {
            return { trend: 'unknown', dataPoints: history.length };
        }
        
        return {
            trend: this.calculateItemTrend(history),
            dataPoints: history.length,
            firstScore: history[0].score,
            lastScore: history[history.length - 1].score,
            firstDate: history[0].timestamp,
            lastDate: history[history.length - 1].timestamp
        };
    }
    
    // =========================================================================
    // HELPER METHODS FOR 3-POINT INTELLIGENCE
    // =========================================================================
    
    getItemKey(item, type, platformId) {
        // Normalize the item
        let normalizedItem = String(item).toLowerCase().trim();
        
        // Remove prefixes
        if (type === 'hashtags') {
            normalizedItem = normalizedItem.replace(/^#/, '');
        } else if (type === 'mentions') {
            normalizedItem = normalizedItem.replace(/^@/, '');
        }
        
        return `item:${type}:${platformId}:${normalizedItem}`;
    }
    
    getItemHistory(itemKey) {
        return this.itemScoreStore.get(itemKey) || [];
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
        // Remove oldest entries
        const entries = Array.from(this.itemScoreStore.entries());
        entries.sort((a, b) => {
            const aLatest = a[1][a[1].length - 1]?.timestamp || '';
            const bLatest = b[1][b[1].length - 1]?.timestamp || '';
            return aLatest.localeCompare(bLatest);
        });
        
        // Remove oldest 20%
        const removeCount = Math.floor(entries.length * 0.2);
        for (let i = 0; i < removeCount; i++) {
            this.itemScoreStore.delete(entries[i][0]);
        }
    }
    
    // =========================================================================
    // ORIGINAL HISTORY MANAGEMENT
    // =========================================================================
    
    getHistoryKey(input) {
        if (input.type === 'account') {
            return `account:${input.platform}:${input.username}`;
        } else if (input.type === 'post') {
            return `post:${input.platform}:${input.postId}`;
        } else if (input.type === 'text') {
            // Hash the text for text-based keys
            return `text:${input.platform}:${this.hashText(input.text)}`;
        }
        return `unknown:${Date.now()}`;
    }
    
    hashText(text) {
        // Simple hash for demo purposes
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    
    getHistory(key) {
        return this.historyStore.get(key) || [];
    }
    
    addToHistory(key, result) {
        let history = this.historyStore.get(key) || [];
        
        history.push({
            timestamp: new Date().toISOString(),
            score: result.rawScore || result.probability || 0,
            confidence: result.confidence || 0,
            flags: result.flags || [],
            findings: result.findings || []
        });
        
        // Keep only recent history
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
                repeatedFlags: [],
                hadHighSeverity: false,
                highSeverityCount: 0
            };
        }
        
        // Calculate average score
        const scores = history.map(h => h.score);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        // Analyze trend (compare recent vs older)
        let trend = 'stable';
        let trendData = null;
        
        if (history.length >= 3) {
            const recentAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
            const olderAvg = scores.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, scores.length - 3);
            
            if (recentAvg > olderAvg + 10) {
                trend = 'worsening';
                trendData = { recent: recentAvg, older: olderAvg, change: recentAvg - olderAvg };
            } else if (recentAvg < olderAvg - 10) {
                trend = 'improving';
                trendData = { recent: recentAvg, older: olderAvg, change: recentAvg - olderAvg };
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
        
        return {
            trend,
            trendData,
            averageScore,
            repeatedFlags,
            hadHighSeverity: highSeverityCount > 0,
            highSeverityCount
        };
    }
    
    // =========================================================================
    // PUBLIC API
    // =========================================================================
    
    /**
     * Store a check result in history
     * @param {object} input - Original input
     * @param {object} result - Check result to store
     */
    storeResult(input, result) {
        const key = this.getHistoryKey(input);
        this.addToHistory(key, result);
    }
    
    /**
     * Get statistics about stored history
     * @returns {object} History statistics
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
            }
        };
    }
    
    /**
     * Export all stored data (for debugging/backup)
     */
    exportData() {
        return {
            history: Object.fromEntries(this.historyStore),
            itemScores: Object.fromEntries(this.itemScoreStore),
            exportedAt: new Date().toISOString()
        };
    }
    
    /**
     * Import stored data (for restore)
     */
    importData(data) {
        if (data.history) {
            this.historyStore = new Map(Object.entries(data.history));
        }
        if (data.itemScores) {
            this.itemScoreStore = new Map(Object.entries(data.itemScores));
        }
    }
}

// Register agent
const historicalAgent = new HistoricalAgent();
if (window.AgentRegistry) {
    window.AgentRegistry.register(historicalAgent);
}

window.HistoricalAgent = historicalAgent;
console.log('✅ HistoricalAgent (Factor 3) loaded - 3-Point Intelligence methods enabled');

})();
