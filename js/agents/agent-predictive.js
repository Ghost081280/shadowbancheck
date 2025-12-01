/* =============================================================================
   AGENT-PREDICTIVE.JS - Factor 5: Predictive Intelligence
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Weight: 20%
   
   Predictive analysis based on:
   - Trending topics likely to be suppressed
   - News/events correlation
   - Platform policy patterns
   - Seasonal/timing factors
   - Cross-platform intelligence
   ============================================================================= */

(function() {
'use strict';

class PredictiveAgent extends window.AgentBase {
    
    constructor() {
        super('predictive', 5, 20); // Factor 5, 20% weight
        
        // Known high-risk periods (events, elections, etc.)
        this.highRiskPeriods = [
            { name: 'US Elections', months: [10, 11], riskMultiplier: 1.5 },
            { name: 'Major Holidays', months: [12, 1], riskMultiplier: 1.2 },
            { name: 'Black Friday', months: [11], days: [20, 30], riskMultiplier: 1.3 }
        ];
        
        // Topics with known increased scrutiny
        this.sensitiveTopics = [
            { pattern: /election|vote|ballot|poll/i, risk: 'high', category: 'political' },
            { pattern: /covid|vaccine|pandemic|virus/i, risk: 'high', category: 'health' },
            { pattern: /crypto|bitcoin|nft|token|coin/i, risk: 'medium', category: 'financial' },
            { pattern: /war|invasion|conflict|military/i, risk: 'high', category: 'geopolitical' },
            { pattern: /protest|riot|demonstration/i, risk: 'medium', category: 'civil' },
            { pattern: /breaking|leaked|exposed|scandal/i, risk: 'medium', category: 'news' },
            { pattern: /giveaway|free|winner|claim/i, risk: 'medium', category: 'spam' }
        ];
        
        // Platform-specific patterns
        this.platformPatterns = {
            twitter: {
                sensitiveCategories: ['political', 'health', 'spam'],
                highRiskTimes: [/* hours of day with more moderation */],
                knownFilters: ['election misinformation', 'health misinformation', 'spam']
            },
            reddit: {
                sensitiveCategories: ['spam', 'promotional'],
                subredditRisks: {}, // Would be populated with subreddit-specific data
                knownFilters: ['brigading', 'spam', 'ban evasion']
            },
            instagram: {
                sensitiveCategories: ['adult', 'spam', 'promotional'],
                knownFilters: ['engagement bait', 'banned hashtags', 'adult content']
            },
            tiktok: {
                sensitiveCategories: ['political', 'adult', 'dangerous'],
                knownFilters: ['dangerous acts', 'political content', 'adult content']
            }
        };
    }
    
    async analyze(input) {
        const startTime = Date.now();
        const findings = [];
        const flags = [];
        const warnings = [];
        let rawScore = 0;
        
        try {
            const text = this.extractText(input);
            const platform = input.platform || 'twitter';
            
            // 1. Check temporal risk (time-based patterns)
            const temporalRisk = this.analyzeTemporalRisk();
            if (temporalRisk.risk > 0) {
                findings.push(this.createFinding(
                    'temporal_risk',
                    temporalRisk.message,
                    temporalRisk.risk,
                    { period: temporalRisk.period }
                ));
                rawScore += temporalRisk.risk * 0.3;
            }
            
            // 2. Check content against sensitive topics
            const topicRisk = this.analyzeTopicRisk(text, platform);
            if (topicRisk.risk > 0) {
                findings.push(this.createFinding(
                    'sensitive_topic',
                    `Content touches on sensitive topic: ${topicRisk.category}`,
                    topicRisk.risk,
                    { category: topicRisk.category, matches: topicRisk.matches }
                ));
                rawScore += topicRisk.risk * 0.4;
                flags.push(`sensitive_${topicRisk.category}`);
            }
            
            // 3. Platform-specific predictions
            const platformRisk = this.analyzePlatformRisk(text, platform);
            if (platformRisk.risk > 0) {
                findings.push(this.createFinding(
                    'platform_prediction',
                    platformRisk.message,
                    platformRisk.risk,
                    { platform, predictions: platformRisk.predictions }
                ));
                rawScore += platformRisk.risk * 0.3;
            }
            
            // 4. Pattern-based predictions
            const patternRisk = this.analyzePatternRisk(text, platform);
            if (patternRisk.findings.length > 0) {
                findings.push(...patternRisk.findings);
                rawScore += patternRisk.totalRisk * 0.2;
            }
            
            // 5. Cross-reference with known issues
            const knownIssues = this.checkKnownIssues(text, platform);
            if (knownIssues.length > 0) {
                for (const issue of knownIssues) {
                    findings.push(this.createFinding(
                        'known_issue',
                        issue.message,
                        issue.risk,
                        { type: issue.type }
                    ));
                    warnings.push(issue.message);
                }
                rawScore += knownIssues.reduce((sum, i) => sum + i.risk, 0) * 0.2;
            }
            
            // Add predictive summary
            if (rawScore > 0) {
                findings.push(this.createFinding(
                    'predictive_summary',
                    `Predictive analysis suggests ${this.getRiskLevel(rawScore)} likelihood of visibility issues`,
                    rawScore,
                    { 
                        factorsAnalyzed: ['temporal', 'topic', 'platform', 'pattern', 'known_issues'],
                        confidence: this.useDemo ? 'demo' : 'live'
                    }
                ));
            }
            
            // Calculate confidence based on data available
            const confidence = this.calculatePredictiveConfidence(input, platform);
            
            return this.createResult({
                rawScore: Math.min(100, rawScore),
                confidence,
                findings,
                flags,
                warnings,
                processingTime: Date.now() - startTime,
                message: this.useDemo ? 'Predictive analysis using demo patterns' : null
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
    
    extractText(input) {
        if (input.type === 'text') return input.text || '';
        if (input.postData && input.postData.text) return input.postData.text;
        if (input.postData && input.postData.tweetText) return input.postData.tweetText;
        if (input.postData && input.postData.postTitle) {
            return `${input.postData.postTitle} ${input.postData.postBody || ''}`;
        }
        return '';
    }
    
    // =========================================================================
    // ANALYSIS METHODS
    // =========================================================================
    
    analyzeTemporalRisk() {
        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const day = now.getDate();
        
        for (const period of this.highRiskPeriods) {
            const monthMatch = period.months && period.months.includes(month);
            const dayMatch = !period.days || (period.days[0] <= day && day <= period.days[1]);
            
            if (monthMatch && dayMatch) {
                return {
                    risk: 20 * (period.riskMultiplier - 1),
                    message: `Currently in ${period.name} period - increased platform scrutiny expected`,
                    period: period.name
                };
            }
        }
        
        return { risk: 0, message: null, period: null };
    }
    
    analyzeTopicRisk(text, platform) {
        if (!text) return { risk: 0, category: null, matches: [] };
        
        const matches = [];
        let highestRisk = 0;
        let riskCategory = null;
        
        for (const topic of this.sensitiveTopics) {
            if (topic.pattern.test(text)) {
                const match = text.match(topic.pattern);
                matches.push({
                    category: topic.category,
                    matched: match ? match[0] : null,
                    risk: topic.risk
                });
                
                const riskValue = topic.risk === 'high' ? 40 : topic.risk === 'medium' ? 20 : 10;
                if (riskValue > highestRisk) {
                    highestRisk = riskValue;
                    riskCategory = topic.category;
                }
            }
        }
        
        return {
            risk: highestRisk,
            category: riskCategory,
            matches
        };
    }
    
    analyzePlatformRisk(text, platform) {
        const patterns = this.platformPatterns[platform];
        if (!patterns) {
            return { risk: 0, message: null, predictions: [] };
        }
        
        const predictions = [];
        let risk = 0;
        
        // Check against known filters
        for (const filter of patterns.knownFilters) {
            const filterPattern = new RegExp(filter.split(' ').join('|'), 'i');
            if (filterPattern.test(text)) {
                predictions.push({
                    filter,
                    likelihood: 'possible'
                });
                risk += 15;
            }
        }
        
        if (predictions.length === 0) {
            return { risk: 0, message: null, predictions: [] };
        }
        
        return {
            risk: Math.min(50, risk),
            message: `Content may trigger ${platform} filters: ${predictions.map(p => p.filter).join(', ')}`,
            predictions
        };
    }
    
    analyzePatternRisk(text, platform) {
        const findings = [];
        let totalRisk = 0;
        
        // Check for spam patterns
        if (/(?:free|win|giveaway).*(?:click|link|dm)/i.test(text)) {
            findings.push(this.createFinding(
                'spam_pattern',
                'Content matches common spam patterns',
                30,
                { pattern: 'promotional spam' }
            ));
            totalRisk += 30;
        }
        
        // Check for engagement bait
        if (/(?:like|share|comment|follow).*(?:if you|to win|for a chance)/i.test(text)) {
            findings.push(this.createFinding(
                'engagement_bait',
                'Content appears to be engagement bait',
                25,
                { pattern: 'engagement bait' }
            ));
            totalRisk += 25;
        }
        
        // Check for urgency tactics
        if (/(?:act now|limited time|hurry|last chance|don't miss)/i.test(text)) {
            findings.push(this.createFinding(
                'urgency_tactics',
                'Content uses urgency tactics common in spam',
                15,
                { pattern: 'urgency' }
            ));
            totalRisk += 15;
        }
        
        // Check for excessive capitalization
        const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(1, text.length);
        if (capsRatio > 0.5 && text.length > 20) {
            findings.push(this.createFinding(
                'excessive_caps',
                'Excessive capitalization may trigger spam filters',
                10,
                { capsRatio: (capsRatio * 100).toFixed(1) + '%' }
            ));
            totalRisk += 10;
        }
        
        return { findings, totalRisk };
    }
    
    checkKnownIssues(text, platform) {
        const issues = [];
        
        // Platform-specific known issues
        if (platform === 'twitter') {
            // Check for known problematic URL patterns
            if (/bit\.ly|tinyurl|t\.co.*t\.co/i.test(text)) {
                issues.push({
                    type: 'shortened_urls',
                    message: 'Multiple URL shorteners may trigger spam detection',
                    risk: 20
                });
            }
        }
        
        if (platform === 'reddit') {
            // Check for self-promotion patterns
            if (/(?:my|our|check out).*(?:channel|website|store|product)/i.test(text)) {
                issues.push({
                    type: 'self_promotion',
                    message: 'Content may be flagged as self-promotion',
                    risk: 25
                });
            }
        }
        
        if (platform === 'instagram' || platform === 'tiktok') {
            // Check for link-in-bio patterns
            if (/link in bio|dm for|message for/i.test(text)) {
                issues.push({
                    type: 'redirect_pattern',
                    message: 'Common redirect patterns may reduce reach',
                    risk: 15
                });
            }
        }
        
        return issues;
    }
    
    getRiskLevel(score) {
        if (score >= 60) return 'high';
        if (score >= 30) return 'moderate';
        if (score > 0) return 'low';
        return 'minimal';
    }
    
    calculatePredictiveConfidence(input, platform) {
        // Base confidence
        let confidence = 50;
        
        // Higher confidence if we have text to analyze
        if (input.text || (input.postData && (input.postData.text || input.postData.tweetText))) {
            confidence += 20;
        }
        
        // Higher confidence for known platforms
        if (this.platformPatterns[platform]) {
            confidence += 10;
        }
        
        // Lower confidence in demo mode
        if (this.useDemo) {
            confidence -= 10;
        }
        
        return Math.min(90, Math.max(30, confidence));
    }
}

// Register agent
const predictiveAgent = new PredictiveAgent();
if (window.AgentRegistry) {
    window.AgentRegistry.register(predictiveAgent);
}

window.PredictiveAgent = PredictiveAgent;
console.log('✅ PredictiveAgent (Factor 5) loaded');

})();
