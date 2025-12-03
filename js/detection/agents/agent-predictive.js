/* =============================================================================
   AGENT-PREDICTIVE.JS - Predictive Intelligence Agent (Factor 5)
   ShadowBanCheck.io
   
   Final synthesis and prediction generation.
   Weight: 20% of final score
   
   Responsibilities:
   - Synthesize results from all other agents
   - Generate final probability assessment
   - Create actionable recommendations
   - Predict recovery timeline
   - Assess future risk
   
   This agent runs LAST and has access to all other agent results.
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// RECOVERY TIMELINES
// =============================================================================

const RECOVERY_TIMELINES = {
    twitter: {
        searchBan: { min: 24, max: 72, unit: 'hours' },
        searchSuggestionBan: { min: 12, max: 48, unit: 'hours' },
        ghostBan: { min: 48, max: 168, unit: 'hours' }, // 2-7 days
        replyDeboosting: { min: 24, max: 72, unit: 'hours' },
        hashtagBan: { min: 24, max: 48, unit: 'hours', action: 'remove_banned_tags' },
        linkThrottling: { min: 0, max: 0, unit: 'immediate', action: 'use_different_links' }
    },
    reddit: {
        automodFilter: { min: 0, max: 24, unit: 'hours', action: 'contact_mods' },
        shadowban: { min: 168, max: 720, unit: 'hours', action: 'appeal' }, // 7-30 days
        lowKarma: { min: 168, max: 336, unit: 'hours', action: 'engage_positively' } // 7-14 days to build karma
    },
    instagram: {
        hashtagBan: { min: 24, max: 336, unit: 'hours' }, // 1-14 days
        actionBlock: { min: 24, max: 48, unit: 'hours' }
    }
};

// =============================================================================
// ISSUE PRIORITY WEIGHTS
// =============================================================================

const ISSUE_WEIGHTS = {
    // Critical - immediate action required
    suspended: 100,
    shadowbanned: 90,
    searchBan: 80,
    ghostBan: 80,
    removed: 75,
    
    // High - significant impact
    banned_hashtag: 60,
    searchSuggestionBan: 55,
    replyDeboosting: 50,
    throttled_link: 45,
    automod_filtered: 45,
    
    // Medium - moderate impact
    link_shortener: 30,
    spam_content: 35,
    low_karma: 30,
    new_account: 25,
    
    // Low - minor impact
    not_verified: 10,
    risky_emoji: 8,
    style_issue: 5
};

// =============================================================================
// PREDICTIVE AGENT
// =============================================================================

class PredictiveAgent {
    
    constructor() {
        this.id = 'predictive';
        this.name = 'Predictive Intelligence';
        this.factor = 5;
        this.weight = 20;
        this.version = '2.0.0';
        this.demoMode = true;
    }
    
    /**
     * Main analysis method
     * @param {object} input - Analysis input (includes otherAgentResults)
     * @returns {Promise<object>} Analysis result
     */
    async analyze(input) {
        const platform = input.platform || 'twitter';
        const startTime = Date.now();
        
        // Get other agent results
        const otherResults = input.otherAgentResults || this.gatherOtherResults();
        
        const checks = {
            synthesis: null,
            riskFactors: null,
            predictions: null,
            recommendations: null
        };
        
        const findings = [];
        let totalScore = 0;
        
        // =================================================================
        // SYNTHESIZE ALL AGENT RESULTS
        // =================================================================
        
        const synthesis = this.synthesizeAgentResults(otherResults);
        checks.synthesis = synthesis;
        
        // =================================================================
        // RISK FACTOR ANALYSIS
        // =================================================================
        
        const riskFactors = this.analyzeRiskFactors(otherResults, input, platform);
        checks.riskFactors = riskFactors;
        
        // Calculate base score from risk factors
        for (const risk of riskFactors.factors) {
            totalScore += risk.contribution;
            
            if (risk.severity === 'critical' || risk.severity === 'high') {
                findings.push({
                    type: 'danger',
                    severity: risk.severity,
                    message: risk.description,
                    impact: risk.contribution
                });
            } else if (risk.severity === 'medium') {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: risk.description,
                    impact: risk.contribution
                });
            }
        }
        
        // =================================================================
        // GENERATE PREDICTIONS
        // =================================================================
        
        const predictions = this.generatePredictions(synthesis, riskFactors, platform);
        checks.predictions = predictions;
        
        // Add prediction findings
        if (predictions.recoveryPossible) {
            findings.push({
                type: 'info',
                severity: 'low',
                message: `Estimated recovery: ${predictions.recoveryTimeline}`,
                impact: 0
            });
        }
        
        if (predictions.futureRisk === 'high') {
            findings.push({
                type: 'warning',
                severity: 'medium',
                message: 'High risk of future restrictions if behavior continues',
                impact: 10
            });
            totalScore += 10;
        }
        
        // =================================================================
        // GENERATE RECOMMENDATIONS
        // =================================================================
        
        const recommendations = this.generateRecommendations(synthesis, riskFactors, platform);
        checks.recommendations = recommendations;
        
        // Add positive findings for good behavior
        if (riskFactors.factors.length === 0) {
            findings.push({
                type: 'good',
                severity: 'none',
                message: 'No significant risk factors detected',
                impact: 0
            });
        }
        
        // =================================================================
        // CALCULATE FINAL SCORE
        // =================================================================
        
        // Predictive score is influenced by:
        // 1. Synthesized score from other agents (70%)
        // 2. Risk factor analysis (20%)
        // 3. Trend prediction (10%)
        
        const synthesizedScore = synthesis.weightedAverage;
        const riskScore = Math.min(100, riskFactors.totalRisk);
        const trendAdjustment = predictions.trendAdjustment || 0;
        
        const rawScore = Math.min(100, Math.round(
            synthesizedScore * 0.7 +
            riskScore * 0.2 +
            trendAdjustment * 0.1
        ));
        
        const confidence = this.calculateConfidence(synthesis, riskFactors);
        
        // Determine final verdict
        const verdict = this.determineVerdict(rawScore, confidence, synthesis);
        
        return {
            agent: this.name,
            agentId: this.id,
            factor: this.factor,
            weight: this.weight,
            status: 'complete',
            
            platform: platform,
            processingTime: Date.now() - startTime,
            
            checks: checks,
            findings: findings,
            
            rawScore: rawScore,
            weightedScore: Math.round((rawScore * this.weight) / 100 * 100) / 100,
            confidence: confidence,
            
            synthesis: {
                agentScores: synthesis.agentScores,
                weightedAverage: synthesis.weightedAverage,
                agreement: synthesis.agreement,
                issueCount: synthesis.issueCount
            },
            
            riskFactors: riskFactors.factors.map(f => ({
                factor: f.factor,
                severity: f.severity,
                contribution: f.contribution
            })),
            
            predictions: {
                verdict: verdict,
                verdictDescription: this.getVerdictDescription(verdict),
                probability: rawScore,
                reachScore: 100 - rawScore,
                recoveryTimeline: predictions.recoveryTimeline,
                futureRisk: predictions.futureRisk,
                confidence: confidence
            },
            
            recommendations: recommendations,
            
            timestamp: new Date().toISOString()
        };
    }
    
    // =========================================================================
    // SYNTHESIS
    // =========================================================================
    
    gatherOtherResults() {
        const results = [];
        
        if (window.AgentRegistry) {
            const all = window.AgentRegistry.getAll();
            for (const agent of Object.values(all)) {
                if (agent.id !== this.id && agent._lastResult) {
                    results.push(agent._lastResult);
                }
            }
        }
        
        return results;
    }
    
    synthesizeAgentResults(results) {
        const synthesis = {
            agentScores: {},
            weightedAverage: 0,
            agreement: 'unknown',
            issueCount: 0,
            allFindings: []
        };
        
        if (!results || results.length === 0) {
            return synthesis;
        }
        
        let totalWeight = 0;
        let weightedSum = 0;
        const scores = [];
        
        for (const result of results) {
            if (!result) continue;
            
            const id = result.agentId || result.id;
            const score = result.rawScore || 0;
            const weight = result.weight || 20;
            
            synthesis.agentScores[id] = {
                score: score,
                weight: weight,
                status: result.status
            };
            
            if (result.status === 'complete' || result.status === 'limited') {
                weightedSum += score * weight;
                totalWeight += weight;
                scores.push(score);
            }
            
            // Collect findings
            if (result.findings) {
                for (const finding of result.findings) {
                    synthesis.allFindings.push({
                        ...finding,
                        source: id
                    });
                    if (finding.type === 'danger' || finding.type === 'warning') {
                        synthesis.issueCount++;
                    }
                }
            }
        }
        
        // Calculate weighted average
        synthesis.weightedAverage = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
        
        // Calculate agreement level
        if (scores.length >= 2) {
            const max = Math.max(...scores);
            const min = Math.min(...scores);
            const range = max - min;
            
            if (range <= 15) {
                synthesis.agreement = 'high';
            } else if (range <= 30) {
                synthesis.agreement = 'medium';
            } else {
                synthesis.agreement = 'low';
            }
        }
        
        return synthesis;
    }
    
    // =========================================================================
    // RISK ANALYSIS
    // =========================================================================
    
    analyzeRiskFactors(otherResults, input, platform) {
        const factors = [];
        let totalRisk = 0;
        
        // Analyze each agent's findings for risk factors
        for (const result of otherResults || []) {
            if (!result?.findings) continue;
            
            for (const finding of result.findings) {
                if (finding.type !== 'danger' && finding.type !== 'warning') continue;
                
                const weight = ISSUE_WEIGHTS[this.categorizeIssue(finding.message)] || 
                              (finding.severity === 'critical' ? 40 : 
                               finding.severity === 'high' ? 25 : 
                               finding.severity === 'medium' ? 15 : 8);
                
                factors.push({
                    factor: finding.message,
                    severity: finding.severity,
                    source: result.agentId,
                    contribution: Math.min(weight, finding.impact || weight)
                });
                
                totalRisk += Math.min(weight, finding.impact || weight);
            }
        }
        
        // Check content-specific risks using databases
        if (input.text || input.content) {
            const contentRisks = this.analyzeContentRisk(input.text || input.content, platform);
            for (const risk of contentRisks) {
                factors.push(risk);
                totalRisk += risk.contribution;
            }
        }
        
        // Deduplicate and sort by contribution
        const uniqueFactors = [];
        const seen = new Set();
        
        for (const f of factors.sort((a, b) => b.contribution - a.contribution)) {
            const key = f.factor.substring(0, 50);
            if (!seen.has(key)) {
                seen.add(key);
                uniqueFactors.push(f);
            }
        }
        
        return {
            factors: uniqueFactors.slice(0, 10), // Top 10 factors
            totalRisk: Math.min(100, totalRisk),
            severity: totalRisk >= 60 ? 'high' : totalRisk >= 30 ? 'medium' : 'low'
        };
    }
    
    categorizeIssue(message) {
        const lower = message.toLowerCase();
        
        if (lower.includes('suspend')) return 'suspended';
        if (lower.includes('shadowban')) return 'shadowbanned';
        if (lower.includes('search ban') || lower.includes('not appearing in search')) return 'searchBan';
        if (lower.includes('ghost') || lower.includes('replies not visible')) return 'ghostBan';
        if (lower.includes('removed') || lower.includes('deleted')) return 'removed';
        if (lower.includes('banned hashtag') || lower.includes('banned tag')) return 'banned_hashtag';
        if (lower.includes('suggestion ban')) return 'searchSuggestionBan';
        if (lower.includes('deboost') || lower.includes('deboosting')) return 'replyDeboosting';
        if (lower.includes('throttle') || lower.includes('throttled')) return 'throttled_link';
        if (lower.includes('shortener')) return 'link_shortener';
        if (lower.includes('automod') || lower.includes('auto-remove')) return 'automod_filtered';
        if (lower.includes('karma')) return 'low_karma';
        if (lower.includes('new') && lower.includes('account')) return 'new_account';
        if (lower.includes('verified')) return 'not_verified';
        if (lower.includes('emoji')) return 'risky_emoji';
        if (lower.includes('caps') || lower.includes('style')) return 'style_issue';
        
        return 'unknown';
    }
    
    analyzeContentRisk(text, platform) {
        const risks = [];
        
        // Use FlaggedContent for spam patterns
        if (window.FlaggedContent) {
            const scan = window.FlaggedContent.scan(text, platform);
            if (scan.score >= 30) {
                risks.push({
                    factor: 'High-risk content patterns detected',
                    description: `Content analysis score: ${scan.score}`,
                    severity: scan.score >= 50 ? 'high' : 'medium',
                    source: 'predictive',
                    contribution: Math.round(scan.score * 0.3)
                });
            }
        }
        
        return risks;
    }
    
    // =========================================================================
    // PREDICTIONS
    // =========================================================================
    
    generatePredictions(synthesis, riskFactors, platform) {
        const predictions = {
            recoveryPossible: true,
            recoveryTimeline: null,
            futureRisk: 'low',
            trendAdjustment: 0
        };
        
        // Determine recovery timeline based on issues
        const timelines = RECOVERY_TIMELINES[platform] || RECOVERY_TIMELINES.twitter;
        let maxRecovery = 0;
        
        for (const factor of riskFactors.factors) {
            const category = this.categorizeIssue(factor.factor);
            const timeline = timelines[category];
            
            if (timeline) {
                maxRecovery = Math.max(maxRecovery, timeline.max);
            }
        }
        
        if (maxRecovery > 0) {
            if (maxRecovery <= 24) {
                predictions.recoveryTimeline = '24 hours or less';
            } else if (maxRecovery <= 72) {
                predictions.recoveryTimeline = '24-72 hours';
            } else if (maxRecovery <= 168) {
                predictions.recoveryTimeline = '1-7 days';
            } else if (maxRecovery <= 336) {
                predictions.recoveryTimeline = '1-2 weeks';
            } else {
                predictions.recoveryTimeline = '2-4 weeks';
            }
        } else {
            predictions.recoveryTimeline = 'No recovery needed - account appears healthy';
        }
        
        // Assess future risk
        if (synthesis.issueCount >= 5 || riskFactors.totalRisk >= 60) {
            predictions.futureRisk = 'high';
            predictions.trendAdjustment = 15;
        } else if (synthesis.issueCount >= 2 || riskFactors.totalRisk >= 30) {
            predictions.futureRisk = 'medium';
            predictions.trendAdjustment = 8;
        } else {
            predictions.futureRisk = 'low';
            predictions.trendAdjustment = 0;
        }
        
        // Check for unrecoverable situations
        if (riskFactors.factors.some(f => 
            f.factor.toLowerCase().includes('suspend') || 
            f.severity === 'critical'
        )) {
            predictions.recoveryPossible = false;
            predictions.recoveryTimeline = 'Account action required - contact platform support';
        }
        
        return predictions;
    }
    
    // =========================================================================
    // RECOMMENDATIONS
    // =========================================================================
    
    generateRecommendations(synthesis, riskFactors, platform) {
        const recommendations = [];
        const addedActions = new Set();
        
        // Generate recommendations based on risk factors
        for (const factor of riskFactors.factors) {
            const category = this.categorizeIssue(factor.factor);
            const rec = this.getRecommendation(category, platform);
            
            if (rec && !addedActions.has(rec.action)) {
                recommendations.push(rec);
                addedActions.add(rec.action);
            }
        }
        
        // Add general recommendations based on score
        if (synthesis.weightedAverage >= 50 && !addedActions.has('reduce_activity')) {
            recommendations.push({
                priority: 'high',
                action: 'Reduce posting activity temporarily',
                reason: 'High restriction score detected',
                effort: 'Easy',
                impact: 'May help algorithm reset'
            });
        }
        
        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        recommendations.sort((a, b) => 
            (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        );
        
        // Add positive note if healthy
        if (recommendations.length === 0) {
            recommendations.push({
                priority: 'info',
                action: 'Keep up the good work!',
                reason: 'No significant issues detected',
                effort: 'None',
                impact: 'Continue current practices'
            });
        }
        
        return recommendations.slice(0, 5); // Top 5 recommendations
    }
    
    getRecommendation(category, platform) {
        const recommendations = {
            banned_hashtag: {
                priority: 'critical',
                action: 'Remove banned hashtags from recent posts',
                reason: 'Banned hashtags prevent content from appearing in feeds',
                effort: 'Easy - edit posts',
                impact: 'Immediate improvement expected'
            },
            link_shortener: {
                priority: 'high',
                action: 'Replace link shorteners with full URLs',
                reason: 'Link shorteners are flagged as potential spam',
                effort: 'Easy - edit links',
                impact: 'Improves trust signals'
            },
            throttled_link: {
                priority: 'medium',
                action: 'Use alternative link destinations or link-in-bio',
                reason: 'Certain domains face artificial delays',
                effort: 'Medium',
                impact: 'Avoids engagement penalty'
            },
            searchBan: {
                priority: 'high',
                action: 'Reduce activity and wait 24-72 hours',
                reason: 'Algorithm may need time to reset',
                effort: 'Easy - patience',
                impact: 'Recovery typically occurs within days'
            },
            ghostBan: {
                priority: 'critical',
                action: 'Stop engaging in reply threads temporarily',
                reason: 'Continued engagement may extend restriction',
                effort: 'Easy - wait',
                impact: 'Essential for recovery'
            },
            spam_content: {
                priority: 'high',
                action: 'Review and remove promotional language',
                reason: 'Spam patterns trigger automatic filtering',
                effort: 'Medium - rewrite content',
                impact: 'Required for normal distribution'
            },
            low_karma: {
                priority: 'medium',
                action: 'Build karma through quality comments',
                reason: 'Low karma triggers AutoMod in many subreddits',
                effort: 'Medium - requires time',
                impact: 'Unlocks more subreddits'
            },
            new_account: {
                priority: 'low',
                action: 'Wait for account to age and build reputation',
                reason: 'New accounts face automatic restrictions',
                effort: 'Easy - patience',
                impact: 'Natural improvement over time'
            },
            automod_filtered: {
                priority: 'high',
                action: 'Contact subreddit moderators for approval',
                reason: 'Post may be awaiting manual review',
                effort: 'Easy - send modmail',
                impact: 'May restore visibility immediately'
            }
        };
        
        return recommendations[category];
    }
    
    // =========================================================================
    // VERDICT
    // =========================================================================
    
    determineVerdict(score, confidence, synthesis) {
        // Factor in confidence for borderline cases
        const adjustedScore = confidence >= 70 ? score : 
                             confidence >= 50 ? score * 0.9 : 
                             score * 0.8;
        
        if (adjustedScore <= 15) return 'CLEAR';
        if (adjustedScore <= 30) return 'LIKELY CLEAR';
        if (adjustedScore <= 50) return 'UNCERTAIN';
        if (adjustedScore <= 70) return 'LIKELY RESTRICTED';
        return 'RESTRICTED';
    }
    
    getVerdictDescription(verdict) {
        const descriptions = {
            'CLEAR': 'No issues detected - content appears healthy and fully visible',
            'LIKELY CLEAR': 'Minor indicators present but content likely showing normally',
            'UNCERTAIN': 'Mixed signals detected - some visibility issues may be present',
            'LIKELY RESTRICTED': 'Multiple restriction indicators found - reduced visibility expected',
            'RESTRICTED': 'Strong evidence of visibility restrictions - immediate action recommended'
        };
        return descriptions[verdict] || 'Analysis complete';
    }
    
    // =========================================================================
    // HELPERS
    // =========================================================================
    
    calculateConfidence(synthesis, riskFactors) {
        let base = 50;
        
        // More data = higher confidence
        const agentCount = Object.keys(synthesis.agentScores).length;
        base += agentCount * 10;
        
        // Agreement increases confidence
        if (synthesis.agreement === 'high') base += 15;
        else if (synthesis.agreement === 'medium') base += 8;
        
        // Clear risk factors increase confidence
        if (riskFactors.factors.length > 0) base += 5;
        
        return Math.min(95, base);
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

const predictiveAgent = new PredictiveAgent();

if (window.registerAgent) {
    window.registerAgent(predictiveAgent);
} else if (window.AgentRegistry) {
    window.AgentRegistry.register(predictiveAgent);
} else {
    window.AgentQueue = window.AgentQueue || [];
    window.AgentQueue.push(predictiveAgent);
}

window.predictiveAgent = predictiveAgent;
window.PredictiveAgent = PredictiveAgent;

console.log('✅ Predictive Agent loaded (Factor 5, Weight 20%)');

})();
