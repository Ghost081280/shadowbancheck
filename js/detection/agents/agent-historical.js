/* =============================================================================
   AGENT-HISTORICAL.JS - Historical Data Agent (Factor 3)
   ShadowBanCheck.io
   
   Tracks patterns and trends over time.
   Weight: 15% of final score
   
   Responsibilities:
   - Previous scan history for this entity
   - Trend analysis (improving/declining)
   - Pattern recognition across scans
   - Community database correlation
   
   Data Sources:
   - Our database (previous scans)
   - Past scores for this entity
   - Trend data (getting better/worse)
   - Community knowledge base
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// SIMULATED HISTORY STORAGE (In production, this would be a real database)
// =============================================================================

const HistoryStore = {
    _data: {},
    
    getHistory: function(entityId, platform) {
        const key = `${platform}:${entityId}`;
        return this._data[key] || null;
    },
    
    addScan: function(entityId, platform, scanResult) {
        const key = `${platform}:${entityId}`;
        if (!this._data[key]) {
            this._data[key] = {
                entityId: entityId,
                platform: platform,
                scans: [],
                firstSeen: new Date().toISOString()
            };
        }
        
        this._data[key].scans.push({
            timestamp: new Date().toISOString(),
            score: scanResult.score,
            issues: scanResult.issues || [],
            verdict: scanResult.verdict
        });
        
        // Keep only last 10 scans
        if (this._data[key].scans.length > 10) {
            this._data[key].scans = this._data[key].scans.slice(-10);
        }
        
        return this._data[key];
    },
    
    clear: function() {
        this._data = {};
    }
};

// =============================================================================
// KNOWN PROBLEMATIC ENTITIES (Community database simulation)
// =============================================================================

const COMMUNITY_DATABASE = {
    twitter: {
        knownSpammers: ['spambot', 'followbot', 'gainbot'],
        knownThrottled: ['substack_user', 'newsletter_promo'],
        reportedIssues: {
            'followback': { reports: 150, severity: 'high', pattern: 'engagement_spam' },
            'f4f': { reports: 200, severity: 'high', pattern: 'engagement_spam' }
        }
    },
    reddit: {
        knownSpammers: ['spam_account', 'promo_bot'],
        frequentAutomod: ['new_account_spam', 'link_spammer'],
        reportedIssues: {
            'self_promotion': { reports: 300, severity: 'medium', pattern: 'promotional' }
        }
    }
};

// =============================================================================
// HISTORICAL AGENT
// =============================================================================

class HistoricalAgent {
    
    constructor() {
        this.id = 'historical';
        this.name = 'Historical Data';
        this.factor = 3;
        this.weight = 15;
        this.version = '2.0.0';
        this.demoMode = true;
    }
    
    /**
     * Main analysis method
     * @param {object} input - Analysis input
     * @returns {Promise<object>} Analysis result
     */
    async analyze(input) {
        const platform = input.platform || 'twitter';
        const startTime = Date.now();
        
        const entityId = input.username || input.postId || 'unknown';
        
        const checks = {
            previousScans: null,
            trend: null,
            communityReports: null,
            patternMatch: null
        };
        
        const findings = [];
        let totalScore = 0;
        let dataPoints = 0;
        
        // =================================================================
        // PREVIOUS SCAN HISTORY
        // =================================================================
        
        const history = this.getEntityHistory(entityId, platform, input);
        checks.previousScans = history;
        
        if (history && history.scans && history.scans.length > 0) {
            dataPoints++;
            
            const avgScore = history.scans.reduce((sum, s) => sum + s.score, 0) / history.scans.length;
            const lastScore = history.scans[history.scans.length - 1].score;
            
            if (avgScore >= 50) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: `Historical average score is ${Math.round(avgScore)} (${history.scans.length} previous scans)`,
                    impact: 15
                });
                totalScore += 15;
            } else if (avgScore >= 30) {
                findings.push({
                    type: 'info',
                    severity: 'low',
                    message: `Historical average score is ${Math.round(avgScore)}`,
                    impact: 8
                });
                totalScore += 8;
            }
            
            // Check for repeated issues
            const allIssues = history.scans.flatMap(s => s.issues || []);
            const issueCounts = {};
            for (const issue of allIssues) {
                issueCounts[issue] = (issueCounts[issue] || 0) + 1;
            }
            
            const repeatedIssues = Object.entries(issueCounts)
                .filter(([_, count]) => count >= 2)
                .map(([issue, count]) => ({ issue, count }));
            
            if (repeatedIssues.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: `Recurring issues detected: ${repeatedIssues.map(r => r.issue).join(', ')}`,
                    impact: 20
                });
                totalScore += 20;
            }
        } else {
            findings.push({
                type: 'info',
                severity: 'none',
                message: 'No previous scan history for this entity',
                impact: 0
            });
        }
        
        // =================================================================
        // TREND ANALYSIS
        // =================================================================
        
        const trend = this.analyzeTrend(history);
        checks.trend = trend;
        
        if (trend.direction) {
            dataPoints++;
            
            if (trend.direction === 'worsening') {
                findings.push({
                    type: 'danger',
                    severity: 'high',
                    message: `Score trend is worsening (${trend.change > 0 ? '+' : ''}${trend.change} points over ${trend.period})`,
                    impact: 25
                });
                totalScore += 25;
            } else if (trend.direction === 'improving') {
                findings.push({
                    type: 'good',
                    severity: 'none',
                    message: `Score trend is improving (${trend.change} points over ${trend.period})`,
                    impact: -10
                });
                totalScore = Math.max(0, totalScore - 10);
            } else if (trend.direction === 'stable') {
                findings.push({
                    type: 'info',
                    severity: 'none',
                    message: 'Score has been stable',
                    impact: 0
                });
            }
        }
        
        // =================================================================
        // COMMUNITY DATABASE CHECK
        // =================================================================
        
        const communityData = this.checkCommunityDatabase(entityId, platform, input);
        checks.communityReports = communityData;
        
        if (communityData.found) {
            dataPoints++;
            
            if (communityData.knownSpammer) {
                findings.push({
                    type: 'danger',
                    severity: 'critical',
                    message: 'Entity matches known spammer pattern in community database',
                    impact: 40
                });
                totalScore += 40;
            }
            
            if (communityData.reports && communityData.reports.length > 0) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: `Community reports: ${communityData.reports.map(r => r.pattern).join(', ')}`,
                    impact: 15
                });
                totalScore += 15;
            }
        }
        
        // =================================================================
        // PATTERN MATCHING (Content-based historical patterns)
        // =================================================================
        
        if (input.text || input.content) {
            const patternMatch = this.matchHistoricalPatterns(input.text || input.content, platform);
            checks.patternMatch = patternMatch;
            
            if (patternMatch.matches.length > 0) {
                dataPoints++;
                
                for (const match of patternMatch.matches) {
                    findings.push({
                        type: match.severity === 'high' ? 'warning' : 'info',
                        severity: match.severity,
                        message: `Content matches historical ${match.pattern} pattern`,
                        impact: match.severity === 'high' ? 15 : 8
                    });
                    totalScore += match.severity === 'high' ? 15 : 8;
                }
            }
        }
        
        // =================================================================
        // CALCULATE FINAL SCORE
        // =================================================================
        
        const rawScore = Math.min(100, Math.max(0, totalScore));
        const confidence = this.calculateConfidence(dataPoints, history);
        
        return {
            agent: this.name,
            agentId: this.id,
            factor: this.factor,
            weight: this.weight,
            status: dataPoints > 0 ? 'complete' : 'limited',
            
            platform: platform,
            processingTime: Date.now() - startTime,
            
            checks: checks,
            findings: findings,
            
            rawScore: rawScore,
            weightedScore: Math.round((rawScore * this.weight) / 100 * 100) / 100,
            confidence: confidence,
            
            summary: {
                hasHistory: history && history.scans && history.scans.length > 0,
                scanCount: history?.scans?.length || 0,
                trend: trend.direction || 'unknown',
                communityFlags: communityData.found,
                dataPoints: dataPoints
            },
            
            timestamp: new Date().toISOString()
        };
    }
    
    // =========================================================================
    // HISTORY OPERATIONS
    // =========================================================================
    
    getEntityHistory(entityId, platform, input) {
        // Check real store first
        let history = HistoryStore.getHistory(entityId, platform);
        
        if (history) {
            return history;
        }
        
        // In demo mode, simulate history based on patterns
        if (this.demoMode) {
            return this.simulateHistory(entityId, platform, input);
        }
        
        return null;
    }
    
    simulateHistory(entityId, platform, input) {
        const lower = entityId.toLowerCase();
        
        // Simulate different history scenarios
        if (lower.includes('repeat') || lower.includes('chronic')) {
            return {
                entityId: entityId,
                platform: platform,
                scans: [
                    { timestamp: '2025-11-01', score: 45, issues: ['banned_hashtag'], verdict: 'LIKELY RESTRICTED' },
                    { timestamp: '2025-11-15', score: 52, issues: ['banned_hashtag', 'link_shortener'], verdict: 'LIKELY RESTRICTED' },
                    { timestamp: '2025-12-01', score: 48, issues: ['banned_hashtag'], verdict: 'LIKELY RESTRICTED' }
                ],
                firstSeen: '2025-11-01T00:00:00Z'
            };
        }
        
        if (lower.includes('improving') || lower.includes('better')) {
            return {
                entityId: entityId,
                platform: platform,
                scans: [
                    { timestamp: '2025-11-01', score: 65, issues: ['multiple_issues'], verdict: 'RESTRICTED' },
                    { timestamp: '2025-11-15', score: 45, issues: ['some_issues'], verdict: 'LIKELY RESTRICTED' },
                    { timestamp: '2025-12-01', score: 25, issues: [], verdict: 'LIKELY CLEAR' }
                ],
                firstSeen: '2025-11-01T00:00:00Z'
            };
        }
        
        if (lower.includes('worsening') || lower.includes('decline')) {
            return {
                entityId: entityId,
                platform: platform,
                scans: [
                    { timestamp: '2025-11-01', score: 15, issues: [], verdict: 'CLEAR' },
                    { timestamp: '2025-11-15', score: 35, issues: ['new_issue'], verdict: 'UNCERTAIN' },
                    { timestamp: '2025-12-01', score: 55, issues: ['multiple_issues'], verdict: 'LIKELY RESTRICTED' }
                ],
                firstSeen: '2025-11-01T00:00:00Z'
            };
        }
        
        // No history
        return null;
    }
    
    // =========================================================================
    // TREND ANALYSIS
    // =========================================================================
    
    analyzeTrend(history) {
        if (!history || !history.scans || history.scans.length < 2) {
            return {
                direction: null,
                change: 0,
                period: null
            };
        }
        
        const scans = history.scans;
        const firstScore = scans[0].score;
        const lastScore = scans[scans.length - 1].score;
        const change = lastScore - firstScore;
        
        // Calculate period
        const firstDate = new Date(scans[0].timestamp);
        const lastDate = new Date(scans[scans.length - 1].timestamp);
        const daysDiff = Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24));
        const period = daysDiff > 30 ? `${Math.round(daysDiff / 30)} months` : `${daysDiff} days`;
        
        let direction;
        if (change > 10) {
            direction = 'worsening';
        } else if (change < -10) {
            direction = 'improving';
        } else {
            direction = 'stable';
        }
        
        return {
            direction: direction,
            change: change,
            period: period,
            dataPoints: scans.length
        };
    }
    
    // =========================================================================
    // COMMUNITY DATABASE
    // =========================================================================
    
    checkCommunityDatabase(entityId, platform, input) {
        const db = COMMUNITY_DATABASE[platform];
        if (!db) {
            return { found: false };
        }
        
        const lower = entityId.toLowerCase();
        const result = {
            found: false,
            knownSpammer: false,
            reports: []
        };
        
        // Check known spammers
        if (db.knownSpammers?.some(s => lower.includes(s))) {
            result.found = true;
            result.knownSpammer = true;
        }
        
        // Check content for reported patterns
        const content = (input.text || input.content || '').toLowerCase();
        if (db.reportedIssues) {
            for (const [pattern, data] of Object.entries(db.reportedIssues)) {
                if (content.includes(pattern) || lower.includes(pattern)) {
                    result.found = true;
                    result.reports.push({
                        pattern: data.pattern,
                        severity: data.severity,
                        reportCount: data.reports
                    });
                }
            }
        }
        
        return result;
    }
    
    // =========================================================================
    // PATTERN MATCHING
    // =========================================================================
    
    matchHistoricalPatterns(text, platform) {
        const patterns = {
            engagement_spam: {
                regex: /follow.*back|f4f|l4l|like.*for.*like/i,
                severity: 'high'
            },
            promotional: {
                regex: /buy.*now|click.*here|limited.*time/i,
                severity: 'medium'
            },
            crypto_spam: {
                regex: /free.*crypto|airdrop|guaranteed.*profit/i,
                severity: 'high'
            },
            excessive_hashtags: {
                test: (t) => (t.match(/#\w+/g) || []).length > 10,
                severity: 'medium'
            }
        };
        
        const matches = [];
        
        for (const [name, pattern] of Object.entries(patterns)) {
            let matched = false;
            
            if (pattern.regex && pattern.regex.test(text)) {
                matched = true;
            } else if (pattern.test && pattern.test(text)) {
                matched = true;
            }
            
            if (matched) {
                matches.push({
                    pattern: name,
                    severity: pattern.severity
                });
            }
        }
        
        return { matches };
    }
    
    // =========================================================================
    // HELPERS
    // =========================================================================
    
    calculateConfidence(dataPoints, history) {
        let base = 30; // Lower base - historical data is supplementary
        
        if (history && history.scans) {
            base += history.scans.length * 8;
        }
        
        base += dataPoints * 10;
        
        return Math.min(85, base);
    }
    
    // Store a new scan result
    recordScan(entityId, platform, scanResult) {
        return HistoryStore.addScan(entityId, platform, scanResult);
    }
    
    setDemoMode(enabled) {
        this.demoMode = !!enabled;
    }
    
    getStatus() {
        return {
            id: this.id,
            name: this.name,
            factor: this.factor,
            weight: this.weight,
            version: this.version,
            demoMode: this.demoMode
        };
    }
}

// =============================================================================
// REGISTRATION
// =============================================================================

const historicalAgent = new HistoricalAgent();

if (window.registerAgent) {
    window.registerAgent(historicalAgent);
} else if (window.AgentRegistry) {
    window.AgentRegistry.register(historicalAgent);
} else {
    window.AgentQueue = window.AgentQueue || [];
    window.AgentQueue.push(historicalAgent);
}

window.historicalAgent = historicalAgent;
window.HistoricalAgent = HistoricalAgent;
window.HistoryStore = HistoryStore;

console.log('✅ Historical Agent loaded (Factor 3, Weight 15%)');

})();
