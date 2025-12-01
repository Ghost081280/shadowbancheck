/* =============================================================================
   5-FACTOR-ENGINE.JS - Main Orchestrator
   ShadowBanCheck.io
   
   The core engine that orchestrates all 5 factors:
   - Factor 1: Platform API Analysis (20%)
   - Factor 2: Web/Search Analysis (20%)
   - Factor 3: Historical Data (15%)
   - Factor 4: Real-Time Detection (25%)
   - Factor 5: Predictive Intelligence (20%)
   
   Three public tools:
   1. 3-in-1 Power Check - Post URL input → Full sweep (Post + Account)
   2. Account Checker - @username input → Account status only
   3. Hashtag Checker - #tags or $cashtags input → Tag safety check
   ============================================================================= */

(function() {
'use strict';

// ============================================================================
// FIVE FACTOR ENGINE
// ============================================================================
class FiveFactorEngine {
    
    constructor() {
        this.version = '1.0.0';
        this.useDemo = true;
        
        // Factor weights (must sum to 100)
        this.factorWeights = {
            1: 20, // Platform API
            2: 20, // Web Analysis
            3: 15, // Historical
            4: 25, // Detection
            5: 20  // Predictive
        };
        
        // Confidence thresholds for final verdict
        this.verdictThresholds = {
            clear: { maxScore: 15, minConfidence: 60 },
            likely_clear: { maxScore: 30, minConfidence: 50 },
            uncertain: { maxScore: 50, minConfidence: 40 },
            likely_restricted: { maxScore: 70, minConfidence: 50 },
            restricted: { minScore: 70, minConfidence: 60 }
        };
    }
    
    // =========================================================================
    // PUBLIC TOOL 1: 3-in-1 POWER CHECK
    // =========================================================================
    
    /**
     * Full analysis of a post URL (Post + Account)
     * @param {string} url - Post URL (twitter.com or x.com or reddit.com)
     * @returns {Promise<object>} Complete analysis result
     */
    async powerCheck(url) {
        const startTime = Date.now();
        
        try {
            // Detect platform and validate URL
            const platform = this.detectPlatform(url);
            if (!platform) {
                return this.createErrorResult('Invalid or unsupported URL. Please provide a Twitter/X or Reddit post URL.');
            }
            
            // Get platform instance
            const platformInstance = this.getPlatformInstance(platform);
            if (!platformInstance) {
                return this.createErrorResult(`Platform ${platform} not supported`);
            }
            
            // Normalize URL
            const normalizedUrl = platformInstance.getCanonicalUrl 
                ? platformInstance.getCanonicalUrl(url)
                : url;
            
            // Extract identifiers
            const urlType = platformInstance.getUrlType(url);
            if (!urlType.valid) {
                return this.createErrorResult(urlType.error || 'Invalid URL format');
            }
            
            // Build input object
            const input = {
                type: urlType.type === 'tweet' || urlType.type === 'post' ? 'post' : urlType.type,
                platform: platform,
                url: url,
                normalizedUrl: normalizedUrl,
                postId: urlType.tweetId || urlType.postId,
                username: urlType.username,
                subreddit: urlType.subreddit
            };
            
            // Run all 5 factors
            const factorResults = await this.runAllFactors(input);
            
            // Get post and account data for display
            let postData = null;
            let accountData = null;
            
            if (input.postId) {
                postData = await this.getPostData(platformInstance, input.postId);
            }
            if (input.username) {
                accountData = await this.getAccountData(platformInstance, input.username);
            }
            
            // Synthesize final result
            const synthesis = this.synthesizeResults(factorResults);
            
            // Build final output
            return {
                checkType: '3-in-1 Power Check',
                platform: platform,
                inputUrl: url,
                normalizedUrl: normalizedUrl,
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                demo: this.useDemo,
                
                // Post analysis
                post: postData ? {
                    id: input.postId,
                    exists: postData.exists,
                    showingUp: !postData.tombstoned && !postData.removed,
                    reachScore: 100 - synthesis.probability,
                    probability: synthesis.probability,
                    visibility: {
                        directLink: postData.exists,
                        onProfile: !postData.tombstoned,
                        inSearch: synthesis.findings.some(f => f.type === 'search_visible'),
                        inHashtagFeeds: true, // Would check from detection results
                        inCashtagFeeds: true,
                        inRecommendations: synthesis.probability < 50
                    },
                    detection: this.extractDetectionSummary(factorResults),
                    verdict: this.getPostVerdict(synthesis.probability)
                } : null,
                
                // Account analysis
                account: accountData ? {
                    username: input.username,
                    exists: accountData.exists,
                    showingUp: !accountData.suspended && !accountData.shadowBanned,
                    verifiedType: accountData.verifiedType || 'none',
                    accountLabels: accountData.accountLabels || [],
                    accountAge: accountData.accountAge,
                    reachScore: 100 - synthesis.probability,
                    probability: synthesis.probability,
                    visibility: {
                        searchable: !accountData.searchBan,
                        suggestable: !accountData.suggestBan,
                        repliesVisible: !accountData.replyDeboosting
                    },
                    verdict: this.getAccountVerdict(synthesis.probability, accountData)
                } : null,
                
                // Factor breakdown
                factors: factorResults.map(r => ({
                    factor: r.factorNumber,
                    name: r.factorName,
                    weight: r.weight,
                    rawScore: r.rawScore,
                    weightedScore: r.weightedScore,
                    confidence: r.confidence,
                    findingsCount: r.findings ? r.findings.length : 0
                })),
                
                // Overall results
                overallProbability: synthesis.probability,
                overallConfidence: synthesis.confidence,
                combinedVerdict: synthesis.verdict,
                recommendations: this.generateRecommendations(synthesis, factorResults),
                
                // Detailed findings (for debugging/advanced users)
                _findings: synthesis.findings,
                _flags: synthesis.flags
            };
            
        } catch (error) {
            console.error('PowerCheck error:', error);
            return this.createErrorResult(`Analysis failed: ${error.message}`);
        }
    }
    
    // =========================================================================
    // PUBLIC TOOL 2: ACCOUNT CHECKER
    // =========================================================================
    
    /**
     * Account-only analysis
     * @param {string} username - Username (with or without @)
     * @param {string} platform - Platform ID (default: 'twitter')
     * @returns {Promise<object>} Account analysis result
     */
    async checkAccount(username, platform = 'twitter') {
        const startTime = Date.now();
        
        try {
            // Clean username
            const cleanUsername = username.replace(/^@/, '').trim();
            
            if (!cleanUsername) {
                return this.createErrorResult('Please provide a username');
            }
            
            // Get platform instance
            const platformInstance = this.getPlatformInstance(platform);
            if (!platformInstance) {
                return this.createErrorResult(`Platform ${platform} not supported`);
            }
            
            // Validate username
            const validation = platformInstance.validateUsername(cleanUsername);
            if (!validation.valid) {
                return this.createErrorResult(validation.error);
            }
            
            // Build input
            const input = {
                type: 'account',
                platform: platform,
                username: validation.username
            };
            
            // Run all factors
            const factorResults = await this.runAllFactors(input);
            
            // Get account data
            const accountData = await this.getAccountData(platformInstance, validation.username);
            
            // Synthesize
            const synthesis = this.synthesizeResults(factorResults);
            
            return {
                checkType: 'Account Check',
                platform: platform,
                username: validation.username,
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                demo: this.useDemo,
                
                account: {
                    username: validation.username,
                    displayName: accountData.displayName || `@${validation.username}`,
                    exists: accountData.exists,
                    suspended: accountData.suspended,
                    protected: accountData.protected,
                    verifiedType: accountData.verifiedType || 'none',
                    accountAge: accountData.accountAge,
                    metrics: {
                        followers: accountData.followerCount,
                        following: accountData.followingCount,
                        posts: accountData.tweetCount || accountData.postCount,
                        karma: accountData.totalKarma // Reddit
                    },
                    shadowbanChecks: {
                        searchBan: accountData.searchBan || false,
                        ghostBan: accountData.ghostBan || false,
                        replyDeboosting: accountData.replyDeboosting || false,
                        suggestBan: accountData.suggestBan || false
                    },
                    probability: synthesis.probability,
                    verdict: this.getAccountVerdict(synthesis.probability, accountData)
                },
                
                factors: factorResults.map(r => ({
                    factor: r.factorNumber,
                    name: r.factorName,
                    rawScore: r.rawScore,
                    confidence: r.confidence
                })),
                
                overallProbability: synthesis.probability,
                overallConfidence: synthesis.confidence,
                verdict: synthesis.verdict,
                recommendations: this.generateRecommendations(synthesis, factorResults)
            };
            
        } catch (error) {
            console.error('Account check error:', error);
            return this.createErrorResult(`Account check failed: ${error.message}`);
        }
    }
    
    // =========================================================================
    // PUBLIC TOOL 3: HASHTAG/CASHTAG CHECKER
    // =========================================================================
    
    /**
     * Check hashtags and/or cashtags
     * @param {string|array} tags - Tags to check (can include # and $)
     * @param {string} platform - Platform ID (default: 'twitter')
     * @returns {Promise<object>} Tag analysis result
     */
    async checkTags(tags, platform = 'twitter') {
        const startTime = Date.now();
        
        try {
            // Normalize input to array
            let tagArray = [];
            if (typeof tags === 'string') {
                // Split by spaces, commas, or newlines
                tagArray = tags.split(/[\s,\n]+/).filter(t => t.length > 0);
            } else if (Array.isArray(tags)) {
                tagArray = tags;
            }
            
            if (tagArray.length === 0) {
                return this.createErrorResult('Please provide at least one hashtag or cashtag');
            }
            
            // Check if FlaggedHashtags is available
            if (!window.FlaggedHashtags) {
                return this.createErrorResult('Hashtag database not loaded');
            }
            
            // Check all tags
            const results = window.FlaggedHashtags.checkBulk(tagArray, platform);
            
            // Build response
            return {
                checkType: 'Hashtag/Cashtag Check',
                platform: platform,
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                demo: this.useDemo,
                
                input: {
                    tags: tagArray,
                    count: tagArray.length
                },
                
                results: {
                    banned: results.banned.map(t => ({
                        tag: t.tag,
                        type: t.type,
                        category: t.category,
                        reason: t.notes || 'Banned on platform'
                    })),
                    restricted: results.restricted.map(t => ({
                        tag: t.tag,
                        type: t.type,
                        category: t.category,
                        reason: t.notes || 'May reduce reach'
                    })),
                    monitored: results.monitored.map(t => ({
                        tag: t.tag,
                        type: t.type,
                        category: t.category,
                        reason: t.notes || 'Being monitored'
                    })),
                    safe: results.safe.map(t => ({
                        tag: t.tag,
                        type: t.type || 'unknown'
                    }))
                },
                
                summary: {
                    total: tagArray.length,
                    banned: results.banned.length,
                    restricted: results.restricted.length,
                    monitored: results.monitored.length,
                    safe: results.safe.length,
                    riskScore: results.summary.riskScore
                },
                
                verdict: this.getTagVerdict(results.summary),
                recommendations: this.generateTagRecommendations(results)
            };
            
        } catch (error) {
            console.error('Tag check error:', error);
            return this.createErrorResult(`Tag check failed: ${error.message}`);
        }
    }
    
    // =========================================================================
    // FACTOR ORCHESTRATION
    // =========================================================================
    
    async runAllFactors(input) {
        const results = [];
        
        // Get all registered agents
        if (window.AgentRegistry) {
            const agentResults = await window.AgentRegistry.runAll(input);
            results.push(...agentResults);
        } else {
            // Fallback: create empty results for each factor
            for (let factor = 1; factor <= 5; factor++) {
                results.push({
                    factorNumber: factor,
                    factorName: this.getFactorName(factor),
                    weight: this.factorWeights[factor],
                    rawScore: 0,
                    weightedScore: 0,
                    confidence: 0,
                    findings: [],
                    message: 'Agent not loaded'
                });
            }
        }
        
        return results;
    }
    
    synthesizeResults(factorResults) {
        const findings = [];
        const flags = [];
        let weightedTotal = 0;
        let weightSum = 0;
        let confidenceSum = 0;
        let confidenceCount = 0;
        
        for (const result of factorResults) {
            // Collect findings
            if (result.findings) {
                findings.push(...result.findings);
            }
            if (result.flags) {
                flags.push(...result.flags);
            }
            
            // Calculate weighted score
            const weight = result.weight || this.factorWeights[result.factorNumber] || 20;
            weightedTotal += (result.rawScore || 0) * weight;
            weightSum += weight;
            
            // Track confidence
            if (result.confidence !== undefined) {
                confidenceSum += result.confidence;
                confidenceCount++;
            }
        }
        
        // Calculate final probability
        const probability = weightSum > 0 
            ? Math.round(weightedTotal / weightSum)
            : 0;
        
        // Calculate average confidence
        const confidence = confidenceCount > 0
            ? Math.round(confidenceSum / confidenceCount)
            : 50;
        
        // Determine verdict
        const verdict = this.determineVerdict(probability, confidence);
        
        return {
            probability,
            confidence,
            verdict,
            findings,
            flags
        };
    }
    
    // =========================================================================
    // HELPER METHODS
    // =========================================================================
    
    detectPlatform(url) {
        if (!url) return null;
        const lower = url.toLowerCase();
        
        if (lower.includes('twitter.com') || lower.includes('x.com')) {
            return 'twitter';
        }
        if (lower.includes('reddit.com') || lower.includes('redd.it')) {
            return 'reddit';
        }
        if (lower.includes('instagram.com')) {
            return 'instagram';
        }
        if (lower.includes('tiktok.com')) {
            return 'tiktok';
        }
        
        return null;
    }
    
    getPlatformInstance(platformId) {
        if (window.PlatformFactory) {
            return window.PlatformFactory.get(platformId);
        }
        return null;
    }
    
    async getPostData(platform, postId) {
        if (platform.getPostData) {
            return await platform.getPostData(postId);
        }
        if (platform.getTweetData) {
            return await platform.getTweetData(postId);
        }
        return { exists: true, demo: true };
    }
    
    async getAccountData(platform, username) {
        if (platform.getAccountData) {
            return await platform.getAccountData(username);
        }
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
    
    extractDetectionSummary(factorResults) {
        const factor4 = factorResults.find(r => r.factorNumber === 4);
        if (!factor4 || !factor4.findings) {
            return {
                hashtags: { found: 0, flagged: 0 },
                cashtags: { found: 0, flagged: 0 },
                links: { found: 0, flagged: 0 },
                content: { found: 0, flagged: 0 },
                mentions: { found: 0, flagged: 0 },
                emojis: { found: 0, flagged: 0 }
            };
        }
        
        const summary = {};
        for (const finding of factor4.findings) {
            if (finding.details && finding.details.type) {
                summary[finding.details.type] = {
                    found: finding.details.found || 0,
                    flagged: finding.details.flagged ? finding.details.flagged.length : 0
                };
            }
        }
        
        return summary;
    }
    
    determineVerdict(probability, confidence) {
        if (probability <= 15 && confidence >= 60) return 'CLEAR';
        if (probability <= 30 && confidence >= 50) return 'LIKELY CLEAR';
        if (probability <= 50) return 'UNCERTAIN';
        if (probability <= 70 && confidence >= 50) return 'LIKELY RESTRICTED';
        if (probability > 70 && confidence >= 60) return 'RESTRICTED';
        return 'UNCERTAIN';
    }
    
    getPostVerdict(probability) {
        if (probability <= 20) return 'Post appears to be showing normally';
        if (probability <= 40) return 'Post may have slightly reduced visibility';
        if (probability <= 60) return 'Post likely has reduced reach';
        if (probability <= 80) return 'Post is probably being suppressed';
        return 'Post appears to be heavily restricted';
    }
    
    getAccountVerdict(probability, accountData) {
        if (accountData.suspended) return 'Account is suspended';
        if (accountData.shadowBanned) return 'Account appears to be shadowbanned';
        if (probability <= 20) return 'Account appears healthy';
        if (probability <= 40) return 'Account may have minor visibility issues';
        if (probability <= 60) return 'Account likely has reduced reach';
        return 'Account appears to have significant restrictions';
    }
    
    getTagVerdict(summary) {
        if (summary.banned > 0) {
            return `AVOID - ${summary.banned} banned tag(s) found`;
        }
        if (summary.restricted > 0) {
            return `CAUTION - ${summary.restricted} restricted tag(s) found`;
        }
        if (summary.monitored > 0) {
            return `WATCH - ${summary.monitored} monitored tag(s) found`;
        }
        return 'SAFE - All tags appear safe to use';
    }
    
    generateRecommendations(synthesis, factorResults) {
        const recommendations = [];
        
        if (synthesis.probability > 50) {
            recommendations.push('Consider reviewing flagged content before posting');
        }
        
        // Check for specific flags
        if (synthesis.flags.includes('search_ban')) {
            recommendations.push('Content may not appear in search - consider rewording');
        }
        if (synthesis.flags.includes('high_risk_hashtags')) {
            recommendations.push('Remove or replace flagged hashtags');
        }
        if (synthesis.flags.includes('high_risk_links')) {
            recommendations.push('Some links may be blocked - use alternative URLs');
        }
        if (synthesis.flags.includes('spam_pattern')) {
            recommendations.push('Content matches spam patterns - rephrase to sound more natural');
        }
        
        if (recommendations.length === 0 && synthesis.probability <= 20) {
            recommendations.push('Content looks good! No major issues detected.');
        }
        
        return recommendations;
    }
    
    generateTagRecommendations(results) {
        const recommendations = [];
        
        if (results.banned.length > 0) {
            recommendations.push(`Remove these banned tags: ${results.banned.map(t => t.tag).join(', ')}`);
        }
        if (results.restricted.length > 0) {
            recommendations.push(`Consider removing restricted tags for better reach: ${results.restricted.map(t => t.tag).join(', ')}`);
        }
        if (results.monitored.length > 0) {
            recommendations.push(`These tags are being watched: ${results.monitored.map(t => t.tag).join(', ')}`);
        }
        
        if (recommendations.length === 0) {
            recommendations.push('All tags look safe to use!');
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
        
        // Propagate to all agents
        if (window.AgentRegistry) {
            for (const agent of Object.values(window.AgentRegistry.getAll())) {
                agent.setDemoMode(this.useDemo);
            }
        }
    }
    
    getStatus() {
        return {
            version: this.version,
            useDemo: this.useDemo,
            factorWeights: this.factorWeights,
            agentsLoaded: window.AgentRegistry ? Object.keys(window.AgentRegistry.getAll()).length : 0,
            allFactorsCovered: window.AgentRegistry ? window.AgentRegistry.hasAllFactors() : false
        };
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
const engine = new FiveFactorEngine();

// ============================================================================
// EXPORTS
// ============================================================================
window.FiveFactorEngine = FiveFactorEngine;
window.shadowBanEngine = engine;

// Convenience functions
window.powerCheck = (url) => engine.powerCheck(url);
window.checkAccount = (username, platform) => engine.checkAccount(username, platform);
window.checkTags = (tags, platform) => engine.checkTags(tags, platform);

// ============================================================================
// INITIALIZATION
// ============================================================================
console.log('✅ 5-Factor Engine loaded');
console.log('   Status:', engine.getStatus());

})();
