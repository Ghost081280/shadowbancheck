/* =============================================================================
   5-FACTOR-ENGINE.JS - Main Orchestrator
   ShadowBanCheck.io
   
   The central orchestrator for the 5-Factor Detection Engine.
   
   Responsibilities:
   1. Parse and validate input URLs
   2. Detect platform and get platform handler
   3. Collect data from platform (or demo data)
   4. Run all 5 agents via AgentRegistry
   5. Synthesize results into final output
   6. Generate recommendations
   
   5 Factors (100% total):
   - Factor 1: Platform API Analysis (20%)
   - Factor 2: Web/Search Analysis (20%)
   - Factor 3: Historical Data (15%)
   - Factor 4: Real-Time Detection (25%)
   - Factor 5: Predictive Intelligence (20%)
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// ENGINE CLASS
// =============================================================================

class FiveFactorEngine {
    
    constructor() {
        this.version = '2.1.0';
        this.demoMode = true;
        
        // Factor weights (must sum to 100)
        this.factorWeights = {
            1: 20, // Platform API
            2: 20, // Web Analysis
            3: 15, // Historical
            4: 25, // Detection (highest - has 3-Point Intelligence)
            5: 20  // Predictive
        };
        
        // Verdict thresholds
        this.verdictThresholds = {
            clear: { max: 15, minConfidence: 60 },
            likelyClear: { max: 30, minConfidence: 50 },
            uncertain: { max: 50 },
            likelyRestricted: { max: 70, minConfidence: 50 },
            restricted: { min: 70, minConfidence: 60 }
        };
    }
    
    // =========================================================================
    // PUBLIC TOOL 1: POWER CHECK (3-in-1)
    // =========================================================================
    
    async powerCheck(url) {
        const startTime = Date.now();
        
        try {
            // 1. Validate and detect platform
            const platform = this.detectPlatform(url);
            if (!platform) {
                return this.createErrorResult('Invalid or unsupported URL. Supported: Twitter/X, Reddit');
            }
            
            // 2. Get platform handler
            const platformHandler = this.getPlatformHandler(platform);
            
            // 3. Parse URL to get identifiers
            const urlInfo = platformHandler?.getUrlType?.(url) || { valid: true };
            if (!urlInfo.valid) {
                return this.createErrorResult(urlInfo.error || 'Invalid URL format');
            }
            
            const normalizedUrl = urlInfo.normalizedUrl || platformHandler?.getCanonicalUrl?.(url) || url;
            
            // 4. Collect platform data
            const platformData = await this.collectPlatformData(platformHandler, urlInfo, platform);
            
            // 5. Build input for agents
            const agentInput = {
                type: 'post',
                platform: platform,
                url: url,
                normalizedUrl: normalizedUrl,
                
                // Identifiers
                postId: urlInfo.tweetId || urlInfo.postId,
                username: urlInfo.username || platformData.account?.username,
                subreddit: urlInfo.subreddit,
                
                // Content for detection agent
                content: platformData.post?.content?.text || platformData.post?.content?.title || '',
                text: platformData.post?.content?.text || platformData.post?.content?.body || '',
                urls: platformData.post?.content?.urls || [],
                
                // Full platform data for other agents
                platformData: platformData
            };
            
            // 6. Run all agents
            const agentResults = await this.runAgents(agentInput);
            
            // 7. Synthesize results
            const synthesis = this.synthesizeResults(agentResults);
            
            // 8. Build final output
            return {
                checkType: 'powerCheck',
                platform: platform,
                inputUrl: url,
                normalizedUrl: normalizedUrl,
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                demo: this.demoMode,
                
                // Post analysis
                post: this.buildPostOutput(agentInput, platformData.post, synthesis, agentResults),
                
                // Account analysis
                account: this.buildAccountOutput(agentInput, platformData.account, synthesis),
                
                // Full agent results (includes Detection Agent's signals)
                agents: agentResults.map(r => this.formatAgentOutput(r)),
                
                // Compact factor summary
                factors: this.buildFactorSummary(agentResults),
                
                // Final synthesis
                synthesis: {
                    probability: synthesis.probability,
                    reachScore: 100 - synthesis.probability,
                    confidence: synthesis.confidenceInfo,
                    verdict: synthesis.verdict,
                    verdictDescription: this.getVerdictDescription(synthesis.verdict),
                    primaryIssues: synthesis.primaryIssues.slice(0, 5),
                    agentAgreement: this.calculateAgentAgreement(agentResults)
                },
                
                // Recommendations
                recommendations: this.generateRecommendations(synthesis, agentResults)
            };
            
        } catch (error) {
            console.error('[5FactorEngine] PowerCheck error:', error);
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
            
            const platformHandler = this.getPlatformHandler(platform);
            
            // Collect account data
            const accountData = await this.getAccountData(platformHandler, cleanUsername);
            
            // Build input for agents
            const agentInput = {
                type: 'account',
                platform: platform,
                username: cleanUsername,
                content: '', // No post content for account check
                platformData: { account: accountData }
            };
            
            // Run agents
            const agentResults = await this.runAgents(agentInput);
            const synthesis = this.synthesizeResults(agentResults);
            
            return {
                checkType: 'accountCheck',
                platform: platform,
                username: cleanUsername,
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                demo: this.demoMode,
                
                account: this.buildAccountOutput(agentInput, accountData, synthesis),
                agents: agentResults.map(r => this.formatAgentOutput(r)),
                
                synthesis: {
                    probability: synthesis.probability,
                    confidence: synthesis.confidenceInfo,
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
            // Normalize tags to array
            let tagArray = typeof tags === 'string' 
                ? tags.split(/[\s,\n]+/).filter(t => t.length > 0)
                : tags;
            
            if (tagArray.length === 0) {
                return this.createErrorResult('Please provide at least one tag');
            }
            
            // Use FlaggedHashtags database
            let results = { banned: [], restricted: [], monitored: [], safe: [] };
            let riskScore = 0;
            
            if (window.FlaggedHashtags) {
                const check = window.FlaggedHashtags.checkBulk(tagArray, platform);
                
                results.banned = (check.banned || []).map(t => ({
                    tag: t.tag,
                    type: t.type || 'hashtag',
                    status: 'banned',
                    category: t.category,
                    reason: t.notes || 'Banned on platform',
                    since: t.since
                }));
                
                results.restricted = (check.restricted || []).map(t => ({
                    tag: t.tag,
                    type: t.type || 'hashtag',
                    status: 'restricted',
                    reason: t.notes || 'May reduce reach'
                }));
                
                results.monitored = (check.monitored || []).map(t => ({
                    tag: t.tag,
                    type: t.type || 'hashtag',
                    status: 'monitored',
                    reason: t.notes || 'Being monitored'
                }));
                
                results.safe = (check.safe || []).map(t => ({
                    tag: typeof t === 'string' ? t : t.tag,
                    type: 'hashtag',
                    status: 'safe'
                }));
                
                riskScore = check.summary?.riskScore || 0;
            } else {
                // No database, assume all safe
                results.safe = tagArray.map(t => ({ tag: t, type: 'hashtag', status: 'safe' }));
            }
            
            const verdict = this.getTagVerdict(results);
            
            return {
                checkType: 'tagCheck',
                platform: platform,
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                demo: this.demoMode,
                
                input: { tags: tagArray, count: tagArray.length },
                results: results,
                
                summary: {
                    total: tagArray.length,
                    banned: results.banned.length,
                    restricted: results.restricted.length,
                    monitored: results.monitored.length,
                    safe: results.safe.length,
                    riskScore: riskScore
                },
                
                confidence: { level: 'high', score: 85, sources: 1 },
                verdict: verdict,
                
                recommendations: this.generateTagRecommendations(results)
            };
            
        } catch (error) {
            return this.createErrorResult(`Tag check failed: ${error.message}`);
        }
    }
    
    // =========================================================================
    // AGENT ORCHESTRATION
    // =========================================================================
    
    async runAgents(input) {
        // Check if AgentRegistry exists and has agents
        if (window.AgentRegistry && Object.keys(window.AgentRegistry.getAll()).length > 0) {
            return await window.AgentRegistry.runAll(input);
        }
        
        // Fallback: Try to run detection agent directly if available
        const results = [];
        
        if (window.detectionAgent) {
            try {
                const detectionResult = await window.detectionAgent.analyze(input);
                results.push(detectionResult);
            } catch (e) {
                console.error('[5FactorEngine] Detection agent error:', e);
            }
        }
        
        // Create placeholder results for missing agents
        for (let factor = 1; factor <= 5; factor++) {
            const hasResult = results.some(r => r.factor === factor);
            if (!hasResult) {
                results.push(this.createPlaceholderAgentResult(factor, input.platform));
            }
        }
        
        return results;
    }
    
    createPlaceholderAgentResult(factor, platform) {
        const config = window.FACTOR_CONFIG?.[factor] || {
            name: `Factor ${factor}`,
            weight: this.factorWeights[factor] || 20
        };
        
        return {
            agent: config.name,
            agentId: config.agentId || `factor${factor}`,
            factor: factor,
            weight: config.weight,
            status: 'pending',
            rawScore: 0,
            weightedScore: 0,
            confidence: 0,
            findings: [{ 
                type: 'info', 
                severity: 'low', 
                message: 'Agent not yet implemented', 
                impact: 0 
            }],
            message: 'Agent pending implementation'
        };
    }
    
    // =========================================================================
    // DATA COLLECTION
    // =========================================================================
    
    async collectPlatformData(platformHandler, urlInfo, platform) {
        const data = { post: null, account: null };
        
        // Get post data if we have a post ID
        if (urlInfo.tweetId || urlInfo.postId) {
            data.post = await this.getPostData(platformHandler, urlInfo.tweetId || urlInfo.postId);
        }
        
        // Get account data if we have a username
        if (urlInfo.username) {
            data.account = await this.getAccountData(platformHandler, urlInfo.username);
        }
        
        return data;
    }
    
    async getPostData(platformHandler, postId) {
        if (!postId) return null;
        
        if (platformHandler?.getTweetData) {
            return await platformHandler.getTweetData(postId);
        }
        if (platformHandler?.getPostData) {
            return await platformHandler.getPostData(postId);
        }
        
        // Demo data fallback
        return {
            id: postId,
            exists: true,
            demo: true,
            content: { text: '', urls: [] },
            metrics: {}
        };
    }
    
    async getAccountData(platformHandler, username) {
        if (!username) return null;
        
        if (platformHandler?.getAccountData) {
            return await platformHandler.getAccountData(username);
        }
        
        // Demo data fallback
        return {
            username: username,
            exists: true,
            demo: true
        };
    }
    
    // =========================================================================
    // RESULT SYNTHESIS
    // =========================================================================
    
    synthesizeResults(agentResults) {
        const findings = [];
        const primaryIssues = [];
        let weightedTotal = 0;
        let weightSum = 0;
        let confidenceSum = 0;
        let confidenceCount = 0;
        
        for (const result of agentResults) {
            if (!result) continue;
            
            // Collect findings
            if (result.findings) {
                for (const finding of result.findings) {
                    findings.push({ ...finding, source: result.agentId });
                    if (finding.type === 'danger' || finding.severity === 'high') {
                        if (finding.message) primaryIssues.push(finding.message);
                    }
                }
            }
            
            // Calculate weighted score
            const weight = result.weight || this.factorWeights[result.factor] || 20;
            const score = result.rawScore || 0;
            
            if (result.status !== 'pending' && result.status !== 'error') {
                weightedTotal += score * weight;
                weightSum += weight;
            }
            
            // Track confidence
            if (result.confidence !== undefined && result.confidence > 0) {
                confidenceSum += result.confidence;
                confidenceCount++;
            }
        }
        
        // Calculate final probability
        const probability = weightSum > 0 ? Math.round(weightedTotal / weightSum) : 0;
        
        // Calculate confidence
        const baseConfidence = confidenceCount > 0 ? Math.round(confidenceSum / confidenceCount) : 50;
        const activeAgents = agentResults.filter(r => r.status === 'complete').length;
        const agreementBonus = activeAgents >= 4 ? 15 : activeAgents >= 3 ? 10 : activeAgents >= 2 ? 5 : 0;
        const confidence = Math.min(100, baseConfidence + agreementBonus);
        
        // Determine verdict
        const verdict = this.determineVerdict(probability, confidence);
        
        return {
            probability,
            confidence,
            confidenceInfo: {
                level: confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : 'low',
                score: confidence,
                sources: activeAgents,
                description: `${activeAgents} agent${activeAgents !== 1 ? 's' : ''} corroborate`
            },
            verdict,
            findings,
            primaryIssues: [...new Set(primaryIssues)] // Deduplicate
        };
    }
    
    determineVerdict(probability, confidence) {
        const t = this.verdictThresholds;
        
        if (probability <= t.clear.max && confidence >= t.clear.minConfidence) {
            return 'CLEAR';
        }
        if (probability <= t.likelyClear.max && confidence >= t.likelyClear.minConfidence) {
            return 'LIKELY CLEAR';
        }
        if (probability <= t.uncertain.max) {
            return 'UNCERTAIN';
        }
        if (probability <= t.likelyRestricted.max && confidence >= t.likelyRestricted.minConfidence) {
            return 'LIKELY RESTRICTED';
        }
        if (probability >= t.restricted.min && confidence >= t.restricted.minConfidence) {
            return 'RESTRICTED';
        }
        
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
    
    // =========================================================================
    // OUTPUT BUILDERS
    // =========================================================================
    
    formatAgentOutput(result) {
        if (!result) return null;
        
        const output = {
            agent: result.agent || result.name,
            agentId: result.agentId || result.id,
            factor: result.factor,
            weight: result.weight,
            status: result.status || 'complete',
            rawScore: result.rawScore,
            weightedScore: result.weightedScore,
            confidence: result.confidence,
            findings: result.findings || []
        };
        
        // Include Detection Agent specific data (signals with 3-Point Intelligence)
        if (result.factor === 4 || result.agentId === 'detection') {
            if (result.modulesActive) output.modulesActive = result.modulesActive;
            if (result.signals) output.signals = result.signals;
            if (result.signalSummary) output.signalSummary = result.signalSummary;
        }
        
        // Include other agent-specific data
        if (result.checks) output.checks = result.checks;
        if (result.synthesis) output.synthesis = result.synthesis;
        if (result.riskFactors) output.riskFactors = result.riskFactors;
        if (result.predictions) output.predictions = result.predictions;
        
        return output;
    }
    
    buildFactorSummary(agentResults) {
        return agentResults.map(r => ({
            factor: r.factor,
            name: r.agent || window.FACTOR_CONFIG?.[r.factor]?.name || `Factor ${r.factor}`,
            weight: r.weight,
            rawScore: r.rawScore,
            weightedScore: r.weightedScore,
            confidence: r.confidence,
            status: r.status,
            findingsCount: r.findings?.length || 0
        })).sort((a, b) => (a.factor || 0) - (b.factor || 0));
    }
    
    buildPostOutput(input, postData, synthesis, agentResults) {
        if (!input.postId && !postData) return null;
        
        // Get Detection Agent's signal summary if available
        const detectionAgent = agentResults.find(r => r.factor === 4 || r.agentId === 'detection');
        
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
            
            // Include detection summary
            detection: detectionAgent?.signalSummary || null
        };
    }
    
    buildAccountOutput(input, accountData, synthesis) {
        if (!input.username && !accountData) return null;
        
        return {
            username: input.username || accountData?.username,
            displayName: accountData?.displayName || `@${input.username}`,
            exists: accountData?.exists ?? true,
            suspended: accountData?.suspended ?? false,
            protected: accountData?.protected ?? false,
            verifiedType: accountData?.verifiedType || 'none',
            accountLabels: accountData?.accountLabels || [],
            accountAge: accountData?.accountAge,
            
            metrics: {
                followers: accountData?.followerCount || accountData?.followers,
                following: accountData?.followingCount || accountData?.following,
                tweets: accountData?.tweetCount || accountData?.tweets,
                listed: accountData?.listedCount || accountData?.listed
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
        
        for (const result of agentResults) {
            if (!result) continue;
            
            const id = result.agentId || `factor${result.factor}`;
            const score = result.rawScore || 0;
            
            if (score >= 70) {
                agreement[id] = 'high_risk';
            } else if (score >= 50) {
                agreement[id] = 'medium_risk';
            } else if (score >= 25) {
                agreement[id] = 'low_risk';
            } else {
                agreement[id] = 'clear';
            }
        }
        
        return agreement;
    }
    
    // =========================================================================
    // RECOMMENDATIONS
    // =========================================================================
    
    generateRecommendations(synthesis, agentResults) {
        const recommendations = [];
        
        // Get Detection Agent for signal-specific recommendations
        const detectionAgent = agentResults.find(r => r.factor === 4 || r.agentId === 'detection');
        
        if (detectionAgent?.signals) {
            const signals = detectionAgent.signals;
            
            // Hashtag recommendations
            if (signals.hashtags?.flagged?.banned?.length > 0) {
                const tags = signals.hashtags.flagged.banned.map(h => h.tag).join(', ');
                recommendations.push({
                    priority: 'critical',
                    action: `Remove banned hashtag(s): ${tags}`,
                    impact: 'Could improve score by 25+ points',
                    effort: 'Easy - edit post'
                });
            }
            
            // Link shortener recommendations
            if (signals.links?.flagged?.shorteners?.length > 0) {
                recommendations.push({
                    priority: 'high',
                    action: 'Replace link shorteners with full URLs',
                    impact: 'Improves trust signals',
                    effort: 'Easy - edit links'
                });
            }
            
            // Throttled domain recommendations
            if (signals.links?.flagged?.throttled?.length > 0) {
                const domains = signals.links.flagged.throttled.map(t => t.domain).join(', ');
                recommendations.push({
                    priority: 'medium',
                    action: `Consider alternatives to throttled domains: ${domains}`,
                    impact: 'Avoids 2.5s+ delay penalty',
                    effort: 'Medium'
                });
            }
            
            // Content recommendations
            if (signals.content?.flagged?.banned?.length > 0) {
                recommendations.push({
                    priority: 'critical',
                    action: 'Remove or rephrase flagged content',
                    impact: 'Required for visibility',
                    effort: 'Medium - rewrite needed'
                });
            }
        }
        
        // General recommendations based on probability
        if (synthesis.probability > 60 && recommendations.length === 0) {
            recommendations.push({
                priority: 'high',
                action: 'Review content for potential trigger patterns',
                impact: 'May improve visibility',
                effort: 'Medium'
            });
        }
        
        // No issues found
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
            const tags = results.banned.map(t => t.tag).join(', ');
            recommendations.push({
                priority: 'critical',
                action: `Remove banned tags: ${tags}`
            });
        }
        
        if (results.restricted?.length > 0) {
            const tags = results.restricted.map(t => t.tag).join(', ');
            recommendations.push({
                priority: 'high',
                action: `Consider removing restricted tags: ${tags}`
            });
        }
        
        if (results.safe?.length > 0 && results.banned?.length === 0) {
            recommendations.push({
                priority: 'info',
                action: 'All checked tags appear safe to use'
            });
        }
        
        return recommendations;
    }
    
    getTagVerdict(results) {
        if (results.banned?.length > 0) {
            return `AVOID - ${results.banned.length} banned tag(s) found`;
        }
        if (results.restricted?.length > 0) {
            return `CAUTION - ${results.restricted.length} restricted tag(s) found`;
        }
        if (results.monitored?.length > 0) {
            return `WATCH - ${results.monitored.length} monitored tag(s)`;
        }
        return 'SAFE - All tags appear safe';
    }
    
    // =========================================================================
    // PLATFORM HELPERS
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
    
    getPlatformHandler(platformId) {
        // Try PlatformFactory first
        if (window.PlatformFactory?.get) {
            return window.PlatformFactory.get(platformId);
        }
        
        // Try direct class access
        if (platformId === 'twitter' && window.TwitterPlatform) {
            return new window.TwitterPlatform();
        }
        if (platformId === 'reddit' && window.RedditPlatform) {
            return new window.RedditPlatform();
        }
        
        return null;
    }
    
    // =========================================================================
    // UTILITIES
    // =========================================================================
    
    createErrorResult(message) {
        return {
            error: true,
            message: message,
            timestamp: new Date().toISOString(),
            synthesis: {
                probability: 0,
                confidence: { level: 'low', score: 0, sources: 0 },
                verdict: 'ERROR'
            }
        };
    }
    
    setDemoMode(enabled) {
        this.demoMode = !!enabled;
        
        // Propagate to agents
        if (window.AgentRegistry) {
            for (const agent of Object.values(window.AgentRegistry.getAll())) {
                if (agent.setDemoMode) agent.setDemoMode(this.demoMode);
            }
        }
    }
    
    getStatus() {
        const registryStatus = window.AgentRegistry?.getStatus() || { agentCount: 0 };
        
        return {
            version: this.version,
            demoMode: this.demoMode,
            factorWeights: this.factorWeights,
            agentsLoaded: registryStatus.agentCount,
            agentsCovered: registryStatus.factorsCovered || [],
            databasesLoaded: {
                hashtags: !!window.FlaggedHashtags,
                content: !!window.FlaggedContent,
                links: !!window.FlaggedLinks,
                mentions: !!window.FlaggedMentions,
                emojis: !!window.FlaggedEmojis
            }
        };
    }
}

// =============================================================================
// SINGLETON & EXPORTS
// =============================================================================

const engine = new FiveFactorEngine();

window.FiveFactorEngine = FiveFactorEngine;
window.shadowBanEngine = engine;

// Convenience functions
window.powerCheck = (url) => engine.powerCheck(url);
window.checkAccount = (username, platform) => engine.checkAccount(username, platform);
window.checkTags = (tags, platform) => engine.checkTags(tags, platform);

// =============================================================================
// INITIALIZATION
// =============================================================================

console.log('✅ 5-Factor Engine v2.1 loaded');
console.log('   Status:', engine.getStatus());

})();
