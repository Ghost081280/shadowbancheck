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
   ============================================================================= */

(function() {
'use strict';

class HistoricalAgent extends window.AgentBase {
    
    constructor() {
        super('historical', 3, 15); // Factor 3, 15% weight
        
        // In-memory store for demo (would be database in production)
        this.historyStore = new Map();
        this.maxHistoryItems = 100;
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
    // HISTORY MANAGEMENT
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
            maxPerKey: this.maxHistoryItems
        };
    }
}

// Register agent
const historicalAgent = new HistoricalAgent();
if (window.AgentRegistry) {
    window.AgentRegistry.register(historicalAgent);
}

window.HistoricalAgent = HistoricalAgent;
console.log('✅ HistoricalAgent (Factor 3) loaded');

})();
