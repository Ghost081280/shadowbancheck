/* =============================================================================
   5-FACTOR-ENGINE.JS - Main Orchestrator
   ShadowBanCheck.io
   
   UPDATED: Properly passes through Detection Agent's 3-Point Intelligence
   
   5 Factors:
   - Factor 1: Platform API Analysis (20%)
   - Factor 2: Web/Search Analysis (20%)
   - Factor 3: Historical Data (15%)
   - Factor 4: Real-Time Detection (25%) - 3-Point Intelligence
   - Factor 5: Predictive Intelligence (20%)
   ============================================================================= */

(function() {
'use strict';

class FiveFactorEngine {
    
    constructor() {
        this.version = '2.0.0';
        this.useDemo = true;
        
        // Factor weights (must sum to 100)
        this.factorWeights = {
            1: 20, // Platform API
            2: 20, // Web Analysis
            3: 15, // Historical
            4: 25, // Detection (highest - has 3-Point Intelligence)
            5: 20  // Predictive
        };
    }
    
    // =========================================================================
    // PUBLIC TOOL 1: 3-in-1 POWER CHECK
    // =========================================================================
    
    async powerCheck(url) {
        const startTime = Date.now();
        
        try {
            // Detect platform
            const platform = this.detectPlatform(url);
            if (!platform) {
                return this.createErrorResult('Invalid or unsupported URL');
            }
            
            // Get platform instance
            const platformInstance = this.getPlatformInstance(platform);
            const normalizedUrl = platformInstance?.getCanonicalUrl?.(url) || url;
            
            // Parse URL for identifiers
            const urlInfo = platformInstance?.getUrlType?.(url) || { valid: true };
            if (!urlInfo.valid) {
                return this.createErrorResult(urlInfo.error || 'Invalid URL format');
            }
            
            // Build input
            const input = {
                type: 'post',
                platform: platform,
                url: url,
                normalizedUrl: normalizedUrl,
                postId: urlInfo.tweetId || urlInfo.postId,
                username: urlInfo.username,
                subreddit: urlInfo.subreddit
            };
            
            // Run all 5 factors
            const agentResults = await this.runAllFactors(input);
            
            // Get post/account data
            const postData = input.postId ? await this.getPostData(platformInstance, input.postId) : null;
            const accountData = input.username ? await this.getAccountData(platformInstance, input.username) : null;
            
            // Synthesize results
            const synthesis = this.synthesizeResults(agentResults);
            
            // Build final output with FULL agent data (including Detection Agent's signals)
            return {
                checkType: 'powerCheck',
                platform: platform,
                inputUrl: url,
                normalizedUrl: normalizedUrl,
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                demo: this.useDemo,
                
                // Post analysis
                post: postData ? this.buildPostOutput(input, postData, synthesis, agentResults) : null,
                
                // Account analysis
                account: accountData ? this.buildAccountOutput(input, accountData, synthesis) : null,
                
                // FULL agent outputs (includes Detection Agent's signals!)
                agents: agentResults.map(r => this.formatAgentOutput(r)),
                
                // Factor summary (compact view)
                factors: agentResults.map(r => ({
                    factor: r.factorNumber || r.factor,
                    name: r.factorName || this.getFactorName(r.factorNumber || r.factor),
                    weight: r.weight,
                    rawScore: r.rawScore,
                    weightedScore: r.weightedScore,
                    confidence: r.confidence,
                    findingsCount: r.findings?.length || 0
                })),
                
                // Final synthesis
                synthesis: {
                    probability: synthesis.probability,
                    reachScore: 100 - synthesis.probability,
                    confidence: {
                        level: synthesis.confidence >= 70 ? 'high' : synthesis.confidence >= 40 ? 'medium' : 'low',
                        score: synthesis.confidence,
                        sources: agentResults.filter(r => r.status === 'complete').length,
                        description: `${agentResults.filter(r => r.status === 'complete').length} agents corroborate`
                    },
                    verdict: synthesis.verdict,
                    verdictDescription: this.getVerdictDescription(synthesis.verdict),
                    primaryIssues: synthesis.primaryIssues,
                    agentAgreement: this.calculateAgentAgreement(agentResults)
                },
                
                // Recommendations
                recommendations: this.generateRecommendations(synthesis, agentResults)
            };
            
        } catch (error) {
            console.error('PowerCheck error:', error);
            return this.createErrorResult(`Analysis failed: ${error.message}`);
        }
    }
    
    // =========================================================================
    // PUBLIC TOOL 2: ACCOUNT CHECK
    // =========================================================================
    
    async checkAccount(username, platform = 'twitter') {
        const startTime = Date.now();
        
        try {
            const cleanUsername = username.replace(/^@/, '').trim();
            if (!cleanUsername) {
                return this.createErrorResult('Please provide a username');
            }
            
            const platformInstance = this.getPlatformInstance(platform);
            
            const input = {
                type: 'account',
                platform: platform,
                username: cleanUsername
            };
            
            const agentResults = await this.runAllFactors(input);
            const accountData = await this.getAccountData(platformInstance, cleanUsername);
            const synthesis = this.synthesizeResults(agentResults);
            
            return {
                checkType: 'accountCheck',
                platform: platform,
                username: cleanUsername,
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                demo: this.useDemo,
                
                account: {
                    username: cleanUsername,
                    displayName: accountData?.displayName || `@${cleanUsername}`,
                    exists: accountData?.exists ?? true,
                    suspended: accountData?.suspended ?? false,
                    protected: accountData?.protected ?? false,
                    verifiedType: accountData?.verifiedType || 'none',
                    accountAge: accountData?.accountAge,
                    metrics: {
                        followers: accountData?.followerCount,
                        following: accountData?.followingCount,
                        posts: accountData?.tweetCount || accountData?.postCount
                    },
                    shadowbanChecks: {
                        searchBan: accountData?.searchBan || false,
                        searchSuggestionBan: accountData?.searchSuggestionBan || false,
                        ghostBan: accountData?.ghostBan || false,
                        replyDeboosting: accountData?.replyDeboosting || false,
                        suggestBan: accountData?.suggestBan || false
                    },
                    probability: synthesis.probability,
                    verdict: synthesis.verdict
                },
                
                agents: agentResults.map(r => this.formatAgentOutput(r)),
                
                synthesis: {
                    probability: synthesis.probability,
                    confidence: { level: synthesis.confidence >= 70 ? 'high' : 'medium', score: synthesis.confidence },
                    verdict: synthesis.verdict
                },
                
                recommendations: this.generateRecommendations(synthesis, agentResults)
            };
            
        } catch (error) {
            return this.createErrorResult(`Account check failed: ${error.message}`);
        }
    }
    
    // =========================================================================
    // PUBLIC TOOL 3: TAG CHECK
    // =========================================================================
    
    async checkTags(tags, platform = 'twitter') {
        const startTime = Date.now();
        
        try {
            let tagArray = typeof tags === 'string' 
                ? tags.split(/[\s,\n]+/).filter(t => t.length > 0)
                : tags;
            
            if (tagArray.length === 0) {
                return this.createErrorResult('Please provide at least one tag');
            }
            
            // Use FlaggedHashtags if available
            let results = { banned: [], restricted: [], monitored: [], safe: tagArray };
            let riskScore = 0;
            
            if (window.FlaggedHashtags) {
                const check = window.FlaggedHashtags.checkBulk(tagArray, platform);
                results = check;
                riskScore = check.summary?.riskScore || 0;
            }
            
            return {
                checkType: 'tagCheck',
                platform: platform,
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                demo: this.useDemo,
                
                input: { tags: tagArray, count: tagArray.length },
                
                results: {
                    banned: results.banned?.map(t => ({
                        tag: t.tag,
                        type: t.type || 'hashtag',
                        category: t.category,
                        reason: t.notes || 'Banned on platform'
                    })) || [],
                    restricted: results.restricted?.map(t => ({
                        tag: t.tag,
                        type: t.type || 'hashtag',
                        reason: t.notes || 'May reduce reach'
                    })) || [],
                    monitored: results.monitored?.map(t => ({
                        tag: t.tag,
                        type: t.type || 'hashtag',
                        reason: t.notes || 'Being monitored'
                    })) || [],
                    safe: results.safe?.map(t => ({
                        tag: typeof t === 'string' ? t : t.tag,
                        type: 'hashtag'
                    })) || []
                },
                
                summary: {
                    total: tagArray.length,
                    banned: results.banned?.length || 0,
                    restricted: results.restricted?.length || 0,
                    monitored: results.monitored?.length || 0,
                    safe: results.safe?.length || 0,
                    riskScore: riskScore
                },
                
                confidence: { level: 'high', score: 85 },
                verdict: this.getTagVerdict(results),
                recommendations: this.generateTagRecommendations(results)
            };
            
        } catch (error) {
            return this.createErrorResult(`Tag check failed: ${error.message}`);
        }
    }
    
    // =========================================================================
    // FACTOR ORCHESTRATION
    // =========================================================================
    
    async runAllFactors(input) {
        const results = [];
        
        if (window.AgentRegistry) {
            const agentResults = await window.AgentRegistry.runAll(input);
            results.push(...agentResults);
        } else {
            // Create placeholder results
            for (let factor = 1; factor <= 5; factor++) {
                results.push({
                    factorNumber: factor,
                    factor: factor,
                    factorName: this.getFactorName(factor),
                    weight: this.factorWeights[factor],
                    rawScore: 0,
                    weightedScore: 0,
                    confidence: 0,
                    findings: [],
                    status: 'na',
                    message: 'Agent not loaded'
                });
            }
        }
        
        return results;
    }
    
    synthesizeResults(agentResults) {
        const findings = [];
        const primaryIssues = [];
        let weightedTotal = 0;
        let weightSum = 0;
        let confidenceSum = 0;
        let confidenceCount = 0;
        
        for (const result of agentResults) {
            // Collect findings
            if (result.findings) {
                for (const finding of result.findings) {
                    findings.push(finding);
                    if (finding.type === 'danger' || (finding.severity === 'high' && finding.message)) {
                        primaryIssues.push(finding.message);
                    }
                }
            }
            
            // Calculate weighted score
            const weight = result.weight || this.factorWeights[result.factorNumber] || 20;
            const score = result.rawScore || 0;
            weightedTotal += score * weight;
            weightSum += weight;
            
            // Track confidence
            if (result.confidence !== undefined && result.confidence > 0) {
                confidenceSum += result.confidence;
                confidenceCount++;
            }
        }
        
        const probability = weightSum > 0 ? Math.round(weightedTotal / weightSum) : 0;
        const confidence = confidenceCount > 0 ? Math.round(confidenceSum / confidenceCount) : 50;
        const verdict = this.determineVerdict(probability, confidence);
        
        return {
            probability,
            confidence,
            verdict,
            findings,
            primaryIssues: primaryIssues.slice(0, 5) // Top 5 issues
        };
    }
    
    // =========================================================================
    // OUTPUT FORMATTERS
    // =========================================================================
    
    formatAgentOutput(result) {
        // Return full agent output, including Detection Agent's signals
        const output = {
            agent: result.agent || result.factorName,
            agentId: result.agentId || result.id,
            factor: result.factorNumber || result.factor,
            weight: result.weight,
            status: result.status || 'complete',
            rawScore: result.rawScore,
            weightedScore: result.weightedScore,
            confidence: result.confidence,
            findings: result.findings || []
        };
        
        // Include Detection Agent specific data
        if (result.factorNumber === 4 || result.factor === 4 || result.agentId === 'detection') {
            output.modulesActive = result.modulesActive;
            output.signals = result.signals;           // 3-Point Intelligence per signal
            output.signalSummary = result.signalSummary;
        }
        
        // Include other agent-specific data
        if (result.checks) output.checks = result.checks;
        if (result.synthesis) output.synthesis = result.synthesis;
        if (result.riskFactors) output.riskFactors = result.riskFactors;
        if (result.predictions) output.predictions = result.predictions;
        
        return output;
    }
    
    buildPostOutput(input, postData, synthesis, agentResults) {
        // Get Detection Agent's signal summary
        const detectionAgent = agentResults.find(r => r.factorNumber === 4 || r.agentId === 'detection');
        
        return {
            id: input.postId,
            exists: postData?.exists ?? true,
            tombstoned: postData?.tombstoned ?? false,
            ageRestricted: postData?.ageRestricted ?? false,
            
            visibility: {
                directLink: true,
                onProfile: !postData?.tombstoned,
                inSearch: synthesis.probability < 50,
                inHashtagFeeds: synthesis.probability < 60,
                inCashtagFeeds: synthesis.probability < 60,
                inRecommendations: synthesis.probability < 40,
                inReplies: true
            },
            
            metrics: postData?.metrics || {},
            content: postData?.content || {},
            
            reachScore: 100 - synthesis.probability,
            probability: synthesis.probability,
            verdict: synthesis.verdict,
            
            // Include detection summary if available
            detection: detectionAgent?.signalSummary || null
        };
    }
    
    buildAccountOutput(input, accountData, synthesis) {
        return {
            username: input.username,
            displayName: accountData?.displayName || `@${input.username}`,
            exists: accountData?.exists ?? true,
            suspended: accountData?.suspended ?? false,
            protected: accountData?.protected ?? false,
            verifiedType: accountData?.verifiedType || 'none',
            accountLabels: accountData?.accountLabels || [],
            accountAge: accountData?.accountAge,
            
            metrics: {
                followers: accountData?.followerCount,
                following: accountData?.followingCount,
                tweets: accountData?.tweetCount,
                listed: accountData?.listedCount
            },
            
            visibility: {
                searchable: !accountData?.searchBan,
                inSuggestions: !accountData?.searchSuggestionBan,
                repliesVisible: !accountData?.replyDeboosting,
                suggestable: !accountData?.suggestBan
            },
            
            shadowbanChecks: {
                searchBan: accountData?.searchBan || false,
                searchSuggestionBan: accountData?.searchSuggestionBan || false,
                ghostBan: accountData?.ghostBan || false,
                replyDeboosting: accountData?.replyDeboosting || false,
                suggestBan: accountData?.suggestBan || false
            },
            
            reachScore: 100 - synthesis.probability,
            probability: synthesis.probability,
            verdict: synthesis.verdict
        };
    }
    
    calculateAgentAgreement(agentResults) {
        const agreement = {};
        const riskThresholds = { low: 25, medium: 50, high: 75 };
        
        for (const result of agentResults) {
            const id = result.agentId || `factor${result.factorNumber}`;
            const score = result.rawScore || 0;
            
            if (score >= riskThresholds.high) {
                agreement[id] = 'high_risk';
            } else if (score >= riskThresholds.medium) {
                agreement[id] = 'medium_risk';
            } else if (score >= riskThresholds.low) {
                agreement[id] = 'low_risk';
            } else {
                agreement[id] = 'clear';
            }
        }
        
        return agreement;
    }
    
    // =========================================================================
    // HELPERS
    // =========================================================================
    
    detectPlatform(url) {
        if (!url) return null;
        const lower = url.toLowerCase();
        
        if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
        if (lower.includes('reddit.com') || lower.includes('redd.it')) return 'reddit';
        if (lower.includes('instagram.com')) return 'instagram';
        if (lower.includes('tiktok.com')) return 'tiktok';
        if (lower.includes('facebook.com')) return 'facebook';
        if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
        if (lower.includes('linkedin.com')) return 'linkedin';
        
        return null;
    }
    
    getPlatformInstance(platformId) {
        if (window.PlatformFactory) {
            return window.PlatformFactory.get(platformId);
        }
        return null;
    }
    
    async getPostData(platform, postId) {
        if (platform?.getPostData) return await platform.getPostData(postId);
        if (platform?.getTweetData) return await platform.getTweetData(postId);
        return { exists: true, demo: true };
    }
    
    async getAccountData(platform, username) {
        if (platform?.getAccountData) return await platform.getAccountData(username);
        return { exists: true, demo: true };
    }
    
    getFactorName(factorNumber) {
        const names = {
            1: 'Platform API Analysis',
            2: 'Web/Search Analysis',
            3: 'Historical Data',
            4: 'Real-Time Detection',
            5: 'Predictive Intelligence'
        };
        return names[factorNumber] || `Factor ${factorNumber}`;
    }
    
    determineVerdict(probability, confidence) {
        if (probability <= 15 && confidence >= 60) return 'CLEAR';
        if (probability <= 30 && confidence >= 50) return 'LIKELY CLEAR';
        if (probability <= 50) return 'UNCERTAIN';
        if (probability <= 70 && confidence >= 50) return 'LIKELY RESTRICTED';
        if (probability > 70 && confidence >= 60) return 'RESTRICTED';
        return 'UNCERTAIN';
    }
    
    getVerdictDescription(verdict) {
        const descriptions = {
            'CLEAR': 'No issues detected - content appears healthy',
            'LIKELY CLEAR': 'Minor indicators but likely showing normally',
            'UNCERTAIN': 'Mixed signals - some issues may be present',
            'LIKELY RESTRICTED': 'Multiple suppression indicators detected',
            'RESTRICTED': 'Strong evidence of visibility restrictions'
        };
        return descriptions[verdict] || 'Analysis complete';
    }
    
    getTagVerdict(results) {
        if (results.banned?.length > 0) return `AVOID - ${results.banned.length} banned tag(s)`;
        if (results.restricted?.length > 0) return `CAUTION - ${results.restricted.length} restricted tag(s)`;
        if (results.monitored?.length > 0) return `WATCH - ${results.monitored.length} monitored tag(s)`;
        return 'SAFE - All tags appear safe';
    }
    
    generateRecommendations(synthesis, agentResults) {
        const recommendations = [];
        
        // Get Detection Agent for signal-specific recommendations
        const detectionAgent = agentResults.find(r => r.factorNumber === 4 || r.agentId === 'detection');
        
        if (detectionAgent?.signals) {
            const signals = detectionAgent.signals;
            
            // Hashtag recommendations
            if (signals.hashtags?.flagged?.banned?.length > 0) {
                recommendations.push({
                    priority: 'critical',
                    action: `Remove banned hashtag(s): ${signals.hashtags.flagged.banned.map(h => h.tag).join(', ')}`,
                    impact: 'Could improve score by 25+ points',
                    effort: 'Easy - edit post'
                });
            }
            
            // Link recommendations
            if (signals.links?.flagged?.shorteners?.length > 0) {
                recommendations.push({
                    priority: 'high',
                    action: 'Replace link shorteners with full URLs',
                    impact: 'Improves trust signals',
                    effort: 'Easy - edit links'
                });
            }
            
            if (signals.links?.flagged?.throttled?.length > 0) {
                recommendations.push({
                    priority: 'medium',
                    action: `Consider alternatives to throttled domains: ${signals.links.flagged.throttled.map(t => t.domain).join(', ')}`,
                    impact: 'Avoids 2.5s throttle delay',
                    effort: 'Medium'
                });
            }
        }
        
        // General recommendations based on probability
        if (synthesis.probability > 50 && recommendations.length === 0) {
            recommendations.push({
                priority: 'medium',
                action: 'Review content for potential triggers',
                impact: 'May improve visibility',
                effort: 'Medium'
            });
        }
        
        if (recommendations.length === 0) {
            recommendations.push({
                priority: 'info',
                action: 'Content looks good! No major issues detected.',
                impact: 'N/A',
                effort: 'None'
            });
        }
        
        return recommendations;
    }
    
    generateTagRecommendations(results) {
        const recommendations = [];
        
        if (results.banned?.length > 0) {
            recommendations.push({
                priority: 'critical',
                action: `Remove banned tags: ${results.banned.map(t => t.tag).join(', ')}`
            });
        }
        
        if (results.restricted?.length > 0) {
            recommendations.push({
                priority: 'high',
                action: `Consider removing restricted tags: ${results.restricted.map(t => t.tag).join(', ')}`
            });
        }
        
        if (results.safe?.length > 0 && results.banned?.length === 0) {
            recommendations.push({
                priority: 'info',
                action: 'All checked tags are safe to use'
            });
        }
        
        return recommendations;
    }
    
    createErrorResult(message) {
        return {
            error: true,
            message: message,
            timestamp: new Date().toISOString()
        };
    }
    
    // =========================================================================
    // CONFIGURATION
    // =========================================================================
    
    setDemoMode(useDemo) {
        this.useDemo = !!useDemo;
        
        if (window.AgentRegistry) {
            for (const agent of Object.values(window.AgentRegistry.getAll())) {
                if (agent.setDemoMode) agent.setDemoMode(this.useDemo);
            }
        }
    }
    
    getStatus() {
        return {
            version: this.version,
            useDemo: this.useDemo,
            factorWeights: this.factorWeights,
            agentsLoaded: window.AgentRegistry ? Object.keys(window.AgentRegistry.getAll()).length : 0
        };
    }
}

// ============================================================================
// SINGLETON & EXPORTS
// ============================================================================
const engine = new FiveFactorEngine();

window.FiveFactorEngine = FiveFactorEngine;
window.shadowBanEngine = engine;

// Convenience functions
window.powerCheck = (url) => engine.powerCheck(url);
window.checkAccount = (username, platform) => engine.checkAccount(username, platform);
window.checkTags = (tags, platform) => engine.checkTags(tags, platform);

console.log('✅ 5-Factor Engine v2.0 loaded - 3-Point Intelligence support');

})();
