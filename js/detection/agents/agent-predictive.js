/* =============================================================================
   AGENT-PREDICTIVE.JS - Factor 5: Predictive Intelligence (20%)
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Version: 2.0.0
   Updated: December 2025
   
   Final synthesis and predictive analysis:
   - Synthesizes all other agent results
   - Trending topics likely to be suppressed
   - News/events correlation
   - Platform policy pattern analysis
   - Seasonal/timing factors
   - Cross-platform intelligence
   - Recovery predictions
   - Actionable recommendations
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// CONSTANTS
// =============================================================================

// High-risk periods (increased platform scrutiny)
const HIGH_RISK_PERIODS = [
    { name: 'US Elections', months: [10, 11], riskMultiplier: 1.5 },
    { name: 'Major Holidays', months: [12, 1], riskMultiplier: 1.2 },
    { name: 'Black Friday/Cyber Monday', months: [11], days: [20, 30], riskMultiplier: 1.3 },
    { name: 'Super Bowl', months: [2], days: [1, 15], riskMultiplier: 1.2 }
];

// Sensitive topics with increased scrutiny
const SENSITIVE_TOPICS = [
    { pattern: /election|vote|ballot|poll|voting/i, risk: 'high', category: 'political' },
    { pattern: /covid|vaccine|pandemic|virus|mask mandate/i, risk: 'high', category: 'health' },
    { pattern: /crypto|bitcoin|nft|token|coin|defi/i, risk: 'medium', category: 'financial' },
    { pattern: /war|invasion|conflict|military|troops/i, risk: 'high', category: 'geopolitical' },
    { pattern: /protest|riot|demonstration|march/i, risk: 'medium', category: 'civil' },
    { pattern: /breaking|leaked|exposed|scandal/i, risk: 'medium', category: 'news' },
    { pattern: /giveaway|free|winner|claim|prize/i, risk: 'medium', category: 'spam' },
    { pattern: /conspiracy|hoax|fake news/i, risk: 'high', category: 'misinformation' }
];

// Platform-specific patterns
const PLATFORM_PATTERNS = {
    twitter: {
        sensitiveCategories: ['political', 'health', 'spam', 'misinformation'],
        knownFilters: ['election misinformation', 'health misinformation', 'spam', 'coordinated behavior']
    },
    reddit: {
        sensitiveCategories: ['spam', 'promotional', 'brigading'],
        knownFilters: ['brigading', 'spam', 'ban evasion', 'vote manipulation']
    },
    instagram: {
        sensitiveCategories: ['adult', 'spam', 'promotional'],
        knownFilters: ['engagement bait', 'banned hashtags', 'adult content', 'automation']
    },
    tiktok: {
        sensitiveCategories: ['political', 'adult', 'dangerous'],
        knownFilters: ['dangerous acts', 'political content', 'adult content', 'copyrighted audio']
    },
    facebook: {
        sensitiveCategories: ['political', 'health', 'spam'],
        knownFilters: ['misinformation', 'clickbait', 'engagement bait', 'fake engagement']
    },
    youtube: {
        sensitiveCategories: ['misinformation', 'adult', 'harmful'],
        knownFilters: ['misleading content', 'community guidelines', 'spam', 'scams']
    },
    linkedin: {
        sensitiveCategories: ['spam', 'promotional'],
        knownFilters: ['engagement bait', 'spam', 'automation', 'irrelevant content']
    }
};

// =============================================================================
// PREDICTIVE AGENT CLASS
// =============================================================================

class PredictiveAgent extends window.AgentBase {
    
    constructor() {
        super('predictive', 5, 20); // id, factor 5, weight 20%
    }
    
    // =========================================================================
    // MAIN ANALYZE METHOD
    // =========================================================================
    
    async analyze(input) {
        const startTime = Date.now();
        const findings = [];
        const flags = [];
        const warnings = [];
        let rawScore = 0;
        
        try {
            const text = this.extractText(input);
            const platform = input.platform || 'twitter';
            
            // Get other agent results if available (for synthesis)
            const otherAgentResults = input.agentResults || [];
            
            // Build synthesis inputs
            const synthesis = this.buildSynthesisInputs(otherAgentResults);
            
            // === ANALYSIS 1: Temporal Risk ===
            const temporalRisk = this.analyzeTemporalRisk();
            if (temporalRisk.risk > 0) {
                findings.push(this.createFinding(
                    'warning',
                    temporalRisk.message,
                    temporalRisk.risk,
                    { period: temporalRisk.period }
                ));
                rawScore += temporalRisk.risk * 0.3;
                flags.push('temporal_risk');
            }
            
            // === ANALYSIS 2: Topic Risk ===
            const topicRisk = this.analyzeTopicRisk(text, platform);
            if (topicRisk.risk > 0) {
                findings.push(this.createFinding(
                    topicRisk.risk >= 30 ? 'warning' : 'info',
                    `Content touches on sensitive topic: ${topicRisk.category}`,
                    topicRisk.risk,
                    { category: topicRisk.category, matches: topicRisk.matches }
                ));
                rawScore += topicRisk.risk * 0.4;
                flags.push(`sensitive_${topicRisk.category}`);
            }
            
            // === ANALYSIS 3: Platform-Specific Predictions ===
            const platformRisk = this.analyzePlatformRisk(text, platform);
            if (platformRisk.risk > 0) {
                findings.push(this.createFinding(
                    'warning',
                    platformRisk.message,
                    platformRisk.risk,
                    { platform, predictions: platformRisk.predictions }
                ));
                rawScore += platformRisk.risk * 0.3;
            }
            
            // === ANALYSIS 4: Pattern-Based Predictions ===
            const patternRisk = this.analyzePatternRisk(text, platform);
            if (patternRisk.findings.length > 0) {
                findings.push(...patternRisk.findings);
                rawScore += patternRisk.totalRisk * 0.2;
            }
            
            // === ANALYSIS 5: Known Issues Check ===
            const knownIssues = this.checkKnownIssues(text, platform);
            if (knownIssues.length > 0) {
                for (const issue of knownIssues) {
                    findings.push(this.createFinding(
                        'warning',
                        issue.message,
                        issue.risk,
                        { type: issue.type }
                    ));
                    warnings.push(issue.message);
                }
                rawScore += knownIssues.reduce((sum, i) => sum + i.risk, 0) * 0.2;
            }
            
            // === SYNTHESIS: Combine All Factors ===
            const finalScore = this.calculateFinalScore(rawScore, synthesis);
            const probability = Math.min(100, Math.round(finalScore));
            
            // === BUILD RISK FACTORS ===
            const riskFactors = this.buildRiskFactors(findings, synthesis, platform);
            
            // === BUILD PREDICTIONS ===
            const predictions = this.buildPredictions(probability, riskFactors);
            
            // === BUILD RECOMMENDATIONS ===
            const recommendations = this.buildRecommendations(riskFactors, findings, platform);
            
            // === Add Summary Finding ===
            if (rawScore > 0) {
                findings.push(this.createFinding(
                    'info',
                    `Predictive analysis: ${this.getRiskLevel(probability)} likelihood of visibility issues`,
                    probability,
                    { factorsAnalyzed: ['temporal', 'topic', 'platform', 'pattern', 'known_issues'] }
                ));
            }
            
            // Calculate confidence
            const confidence = this.calculateConfidence(synthesis, platform);
            
            // Build checks object matching spec
            const checks = {
                synthesis: {
                    rawTotal: finalScore,
                    sourceAgreement: this.calculateSourceAgreement(synthesis),
                    confidenceLevel: confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : 'low',
                    confidenceScore: confidence,
                    shadowbanProbability: probability,
                    shadowbanStatus: this.getStatus(probability)
                },
                
                temporalRisk: temporalRisk,
                topicRisk: topicRisk,
                platformRisk: platformRisk,
                patternRisk: patternRisk
            };
            
            return this.createResult({
                status: 'complete',
                rawScore: probability,
                confidence: confidence,
                findings: findings,
                flags: flags,
                warnings: warnings,
                checks: checks,
                
                // Extended predictive data
                synthesis: checks.synthesis,
                riskFactors: riskFactors,
                predictions: predictions,
                recommendations: recommendations,
                
                processingTime: Date.now() - startTime,
                message: this.useDemo ? 'Predictive analysis using demo patterns' : null
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
                    message: `Predictive analysis error: ${error.message}`,
                    impact: 0
                }],
                processingTime: Date.now() - startTime,
                message: `Error: ${error.message}`
            });
        }
    }
    
    // =========================================================================
    // ANALYSIS METHODS
    // =========================================================================
    
    analyzeTemporalRisk() {
        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const day = now.getDate();
        
        for (const period of HIGH_RISK_PERIODS) {
            const monthMatch = period.months && period.months.includes(month);
            const dayMatch = !period.days || (period.days[0] <= day && day <= period.days[1]);
            
            if (monthMatch && dayMatch) {
                return {
                    risk: Math.round(20 * (period.riskMultiplier - 1) * 2),
                    message: `Currently in ${period.name} period - increased platform scrutiny expected`,
                    period: period.name,
                    multiplier: period.riskMultiplier
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
        
        for (const topic of SENSITIVE_TOPICS) {
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
        const patterns = PLATFORM_PATTERNS[platform];
        if (!patterns || !text) {
            return { risk: 0, message: null, predictions: [] };
        }
        
        const predictions = [];
        let risk = 0;
        
        for (const filter of patterns.knownFilters) {
            const filterPattern = new RegExp(filter.split(' ').join('|'), 'i');
            if (filterPattern.test(text)) {
                predictions.push({
                    filter,
                    likelihood: 'possible',
                    action: 'Review and modify content'
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
        
        if (!text) return { findings: [], totalRisk: 0 };
        
        // Spam patterns
        if (/(?:free|win|giveaway).*(?:click|link|dm)/i.test(text)) {
            findings.push(this.createFinding(
                'warning',
                'Content matches common spam patterns',
                30,
                { pattern: 'promotional spam' }
            ));
            totalRisk += 30;
        }
        
        // Engagement bait
        if (/(?:like|share|comment|follow).*(?:if you|to win|for a chance)/i.test(text)) {
            findings.push(this.createFinding(
                'warning',
                'Content appears to be engagement bait',
                25,
                { pattern: 'engagement bait' }
            ));
            totalRisk += 25;
        }
        
        // Urgency tactics
        if (/(?:act now|limited time|hurry|last chance|don't miss)/i.test(text)) {
            findings.push(this.createFinding(
                'info',
                'Content uses urgency tactics common in spam',
                15,
                { pattern: 'urgency' }
            ));
            totalRisk += 15;
        }
        
        // Excessive capitalization
        const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(1, text.length);
        if (capsRatio > 0.5 && text.length > 20) {
            findings.push(this.createFinding(
                'info',
                'Excessive capitalization may trigger spam filters',
                10,
                { capsRatio: (capsRatio * 100).toFixed(1) + '%' }
            ));
            totalRisk += 10;
        }
        
        // Repeated punctuation
        if (/[!?]{3,}/.test(text)) {
            findings.push(this.createFinding(
                'info',
                'Excessive punctuation may reduce reach',
                5,
                { pattern: 'punctuation' }
            ));
            totalRisk += 5;
        }
        
        return { findings, totalRisk };
    }
    
    checkKnownIssues(text, platform) {
        const issues = [];
        
        if (!text) return issues;
        
        // Platform-specific known issues
        if (platform === 'twitter') {
            if (/bit\.ly|tinyurl|t\.co.*t\.co/i.test(text)) {
                issues.push({
                    type: 'shortened_urls',
                    message: 'Multiple URL shorteners may trigger spam detection',
                    risk: 20
                });
            }
            
            if (/(follow|like|rt).*4.*(follow|like|rt)/i.test(text)) {
                issues.push({
                    type: 'follow_for_follow',
                    message: 'Follow-for-follow patterns are heavily penalized',
                    risk: 35
                });
            }
        }
        
        if (platform === 'reddit') {
            if (/(?:my|our|check out).*(?:channel|website|store|product)/i.test(text)) {
                issues.push({
                    type: 'self_promotion',
                    message: 'Content may be flagged as self-promotion',
                    risk: 25
                });
            }
        }
        
        if (platform === 'instagram' || platform === 'tiktok') {
            if (/link in bio|dm for|message for/i.test(text)) {
                issues.push({
                    type: 'redirect_pattern',
                    message: 'Common redirect patterns may reduce reach',
                    risk: 15
                });
            }
        }
        
        if (platform === 'linkedin') {
            if (/#[\w]+/g.test(text)) {
                const hashtagCount = (text.match(/#[\w]+/g) || []).length;
                if (hashtagCount > 3) {
                    issues.push({
                        type: 'excessive_hashtags',
                        message: `LinkedIn penalizes posts with >3 hashtags (found ${hashtagCount})`,
                        risk: 20
                    });
                }
            }
        }
        
        return issues;
    }
    
    // =========================================================================
    // SYNTHESIS METHODS
    // =========================================================================
    
    buildSynthesisInputs(agentResults) {
        const synthesis = {
            agents: {},
            totalWeightedScore: 0,
            totalWeight: 0
        };
        
        for (const result of agentResults) {
            const id = result.agentId || `factor${result.factorNumber}`;
            synthesis.agents[id] = {
                score: result.rawScore || 0,
                weight: result.weight || 20,
                contribution: result.weightedScore || 0,
                confidence: result.confidence || 0,
                status: result.status || 'unknown'
            };
            
            synthesis.totalWeightedScore += result.weightedScore || 0;
            synthesis.totalWeight += result.weight || 0;
        }
        
        return synthesis;
    }
    
    calculateFinalScore(predictiveScore, synthesis) {
        // If we have other agent results, use weighted average
        if (synthesis.totalWeight > 0) {
            // Predictive agent contributes its own weighted score
            const predictiveWeighted = (predictiveScore * this.weight) / 100;
            return synthesis.totalWeightedScore + predictiveWeighted;
        }
        
        // Otherwise just return the predictive score
        return predictiveScore;
    }
    
    calculateSourceAgreement(synthesis) {
        const scores = Object.values(synthesis.agents).map(a => a.score);
        if (scores.length < 2) {
            return {
                highConfidenceSources: 0,
                mediumConfidenceSources: 0,
                lowConfidenceSources: 0,
                agreementLevel: 'insufficient_data'
            };
        }
        
        let high = 0, medium = 0, low = 0;
        for (const agent of Object.values(synthesis.agents)) {
            if (agent.score > 50) high++;
            else if (agent.score > 25) medium++;
            else low++;
        }
        
        // Determine agreement level
        const total = high + medium + low;
        let agreementLevel = 'low';
        if (high >= total * 0.6 || low >= total * 0.6) {
            agreementLevel = 'high';
        } else if (high >= total * 0.4 || low >= total * 0.4) {
            agreementLevel = 'moderate';
        }
        
        return {
            highConfidenceSources: high,
            mediumConfidenceSources: medium,
            lowConfidenceSources: low,
            agreementLevel
        };
    }
    
    calculateConfidence(synthesis, platform) {
        let confidence = 50;
        
        // Boost for more agent data
        const agentCount = Object.keys(synthesis.agents).length;
        confidence += agentCount * 8;
        
        // Boost for known platform
        if (PLATFORM_PATTERNS[platform]) {
            confidence += 10;
        }
        
        // Reduce for demo mode
        if (this.useDemo) {
            confidence -= 10;
        }
        
        // Boost for high agreement
        const agreement = this.calculateSourceAgreement(synthesis);
        if (agreement.agreementLevel === 'high') {
            confidence += 15;
        } else if (agreement.agreementLevel === 'moderate') {
            confidence += 5;
        }
        
        return Math.min(95, Math.max(30, confidence));
    }
    
    // =========================================================================
    // OUTPUT BUILDERS
    // =========================================================================
    
    buildRiskFactors(findings, synthesis, platform) {
        const riskFactors = [];
        
        // Extract risk factors from findings
        for (const finding of findings) {
            if (finding.impact > 10) {
                riskFactors.push({
                    factor: finding.message,
                    weight: finding.impact >= 30 ? 'high' : finding.impact >= 20 ? 'medium' : 'low',
                    source: 'Predictive Agent',
                    impact: finding.impact,
                    fixable: true,
                    action: this.getSuggestedAction(finding)
                });
            }
        }
        
        // Add factors from other agents if available
        for (const [agentId, agentData] of Object.entries(synthesis.agents)) {
            if (agentData.score > 30) {
                riskFactors.push({
                    factor: `${agentId} score: ${agentData.score}%`,
                    weight: agentData.score >= 50 ? 'high' : 'medium',
                    source: agentId,
                    impact: agentData.score,
                    fixable: true
                });
            }
        }
        
        // Sort by impact
        riskFactors.sort((a, b) => b.impact - a.impact);
        
        return riskFactors.slice(0, 5); // Top 5 risk factors
    }
    
    buildPredictions(probability, riskFactors) {
        const hasHighRisk = riskFactors.some(r => r.weight === 'high');
        const hasFixableIssues = riskFactors.some(r => r.fixable);
        
        return {
            shortTerm: {
                timeframe: '24-72 hours',
                prediction: probability > 50 
                    ? 'Visibility likely to remain suppressed'
                    : 'Visibility should remain normal',
                confidence: hasHighRisk ? 75 : 60
            },
            mediumTerm: {
                timeframe: '1-2 weeks',
                prediction: hasFixableIssues 
                    ? 'Recovery possible after addressing flagged issues'
                    : probability > 50 
                        ? 'May require platform review'
                        : 'Continued normal visibility expected',
                confidence: 65
            },
            longTerm: {
                timeframe: '1+ months',
                prediction: probability > 70
                    ? 'Full recovery requires significant changes'
                    : 'Full recovery achievable with minor adjustments',
                confidence: 55
            }
        };
    }
    
    buildRecommendations(riskFactors, findings, platform) {
        const recommendations = [];
        
        // Generate recommendations from risk factors
        for (const risk of riskFactors) {
            if (risk.fixable && risk.impact >= 15) {
                recommendations.push({
                    priority: risk.weight === 'high' ? 'high' : 'medium',
                    action: risk.action || `Address: ${risk.factor}`,
                    impact: `Could improve score by ${Math.round(risk.impact * 0.5)}+ points`,
                    effort: risk.impact >= 30 ? 'medium' : 'low',
                    timeToEffect: risk.weight === 'high' ? '24-48 hours' : '1-2 weeks'
                });
            }
        }
        
        // Add platform-specific recommendations
        const platformRecs = this.getPlatformRecommendations(platform, findings);
        recommendations.push(...platformRecs);
        
        // Add general recommendation if no specific issues
        if (recommendations.length === 0) {
            recommendations.push({
                priority: 'low',
                action: 'Continue current posting patterns',
                impact: 'Maintain healthy account status',
                effort: 'none',
                timeToEffect: 'ongoing'
            });
        }
        
        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        
        return recommendations.slice(0, 5); // Top 5 recommendations
    }
    
    getSuggestedAction(finding) {
        const actions = {
            'engagement bait': 'Remove engagement bait language',
            'spam': 'Remove spam-like patterns',
            'urgency': 'Reduce urgency language',
            'capitalization': 'Reduce excessive caps',
            'self_promotion': 'Balance promotional with value content',
            'hashtags': 'Review and remove problematic hashtags',
            'sensitive': 'Consider rephrasing sensitive content'
        };
        
        for (const [key, action] of Object.entries(actions)) {
            if (finding.message.toLowerCase().includes(key)) {
                return action;
            }
        }
        
        return 'Review and modify flagged content';
    }
    
    getPlatformRecommendations(platform, findings) {
        const recs = [];
        
        if (platform === 'twitter') {
            if (findings.some(f => f.message.includes('throttled'))) {
                recs.push({
                    priority: 'medium',
                    action: 'Replace throttled domain links with direct URLs',
                    impact: 'Avoid 2.5s throttle delay',
                    effort: 'low',
                    timeToEffect: 'immediate'
                });
            }
        }
        
        if (platform === 'linkedin') {
            recs.push({
                priority: 'low',
                action: 'Limit hashtags to 3 per post',
                impact: 'Avoid LinkedIn spam detection',
                effort: 'low',
                timeToEffect: 'immediate'
            });
        }
        
        if (platform === 'reddit') {
            if (findings.some(f => f.message.includes('self-promotion'))) {
                recs.push({
                    priority: 'high',
                    action: 'Follow 10% self-promotion rule',
                    impact: 'Avoid spam filter',
                    effort: 'medium',
                    timeToEffect: '1-2 weeks'
                });
            }
        }
        
        return recs;
    }
    
    // =========================================================================
    // HELPERS
    // =========================================================================
    
    getRiskLevel(score) {
        if (score >= 70) return 'high';
        if (score >= 50) return 'moderate';
        if (score >= 30) return 'low';
        return 'minimal';
    }
    
    getStatus(probability) {
        if (probability >= 70) return 'likely_restricted';
        if (probability >= 50) return 'possibly_restricted';
        if (probability >= 30) return 'uncertain';
        return 'likely_clear';
    }
}

// =============================================================================
// REGISTER AGENT
// =============================================================================

const predictiveAgent = new PredictiveAgent();

if (window.AgentRegistry) {
    window.AgentRegistry.register(predictiveAgent);
}

window.PredictiveAgent = PredictiveAgent;
window.predictiveAgent = predictiveAgent;

console.log('✅ PredictiveAgent v2.0.0 loaded - Factor 5 (20%)');

})();
