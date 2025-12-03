/* =============================================================================
   AGENT-PLATFORM-API.JS - Factor 1: Platform API Analysis (20%)
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Version: 2.0.0
   Updated: December 2025
   
   Analyzes direct platform API signals:
   - Account existence and status
   - Suspension/restriction status
   - Verification type
   - Account age and metrics
   - Post visibility and engagement
   - Content flags (possibly_sensitive, withheld)
   - Rate limit status
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// API AGENT CLASS
// =============================================================================

class PlatformAPIAgent extends window.AgentBase {
    
    constructor() {
        super('platform-api', 1, 20); // id, factor 1, weight 20%
        
        // Cache for API results
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 second cache
    }
    
    // =========================================================================
    // MAIN ANALYZE METHOD
    // =========================================================================
    
    async analyze(input) {
        const startTime = Date.now();
        
        try {
            const platform = this.getPlatform(input.platform);
            
            if (!platform) {
                return this.createResult({
                    status: 'error',
                    rawScore: 0,
                    confidence: 0,
                    findings: [{
                        type: 'warning',
                        severity: 'medium',
                        message: `Platform not supported: ${input.platform}`,
                        impact: 0
                    }],
                    checks: {},
                    processingTime: Date.now() - startTime,
                    message: `Platform not supported: ${input.platform}`
                });
            }
            
            // Route to appropriate analysis method
            if (input.type === 'account') {
                return await this.analyzeAccount(input, platform, startTime);
            } else if (input.type === 'post') {
                return await this.analyzePost(input, platform, startTime);
            } else if (input.type === 'text') {
                // Text-only analysis doesn't need API calls
                return this.createResult({
                    status: 'complete',
                    rawScore: 0,
                    confidence: 100,
                    findings: [{
                        type: 'info',
                        severity: 'none',
                        message: 'No API analysis needed for text-only input',
                        impact: 0
                    }],
                    checks: { textOnly: true },
                    processingTime: Date.now() - startTime
                });
            }
            
            return this.createResult({
                status: 'error',
                rawScore: 0,
                confidence: 0,
                message: 'Unknown input type'
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
                    message: `API error: ${error.message}`,
                    impact: 0
                }],
                processingTime: Date.now() - startTime,
                message: `Error: ${error.message}`
            });
        }
    }
    
    // =========================================================================
    // ACCOUNT ANALYSIS
    // =========================================================================
    
    async analyzeAccount(input, platform, startTime) {
        const findings = [];
        const flags = [];
        let rawScore = 0;
        
        // Get account data from platform
        const accountData = await platform.getAccountData(input.username);
        
        if (accountData.error) {
            return this.createResult({
                status: 'error',
                rawScore: 0,
                confidence: 0,
                findings: [{
                    type: 'danger',
                    severity: 'high',
                    message: accountData.error,
                    impact: 0
                }],
                checks: { error: accountData.error },
                processingTime: Date.now() - startTime,
                message: accountData.error
            });
        }
        
        // Build checks object (matches spec structure)
        const checks = {
            accountExists: accountData.exists ?? true,
            accountSuspended: accountData.suspended ?? false,
            accountProtected: accountData.protected ?? false,
            accountVerified: accountData.verifiedType || 'none',
            accountAge: accountData.accountAge,
            
            publicMetrics: {
                followers: accountData.followerCount,
                following: accountData.followingCount,
                tweetCount: accountData.tweetCount || accountData.postCount,
                listedCount: accountData.listedCount
            },
            
            ownedMetrics: {
                available: accountData.ownedMetricsAvailable || false,
                impressions: accountData.impressions || null,
                profileClicks: accountData.profileClicks || null,
                urlClicks: accountData.urlClicks || null
            },
            
            contentFlags: {
                possiblySensitive: accountData.possiblySensitive || false,
                withheld: accountData.withheld || null
            },
            
            shadowbanChecks: {
                searchBan: accountData.searchBan || false,
                searchSuggestionBan: accountData.searchSuggestionBan || false,
                ghostBan: accountData.ghostBan || false,
                replyDeboosting: accountData.replyDeboosting || false
            },
            
            rateLimitStatus: accountData.rateLimitStatus || null
        };
        
        // === ANALYSIS: Account Existence ===
        if (!accountData.exists) {
            findings.push(this.createFinding(
                'danger',
                'Account does not exist',
                100,
                { username: input.username }
            ));
            rawScore = 100;
            flags.push('account_not_found');
            
        } else {
            // === ANALYSIS: Suspension Status ===
            if (accountData.suspended) {
                findings.push(this.createFinding(
                    'danger',
                    'Account is suspended',
                    100,
                    { username: input.username }
                ));
                rawScore = 100;
                flags.push('suspended');
            }
            
            // === ANALYSIS: Protected/Private Status ===
            if (accountData.protected) {
                findings.push(this.createFinding(
                    'info',
                    'Account is private/protected',
                    30,
                    { username: input.username }
                ));
                rawScore += 10;
                flags.push('protected');
            }
            
            // === ANALYSIS: Verification Status ===
            if (accountData.verifiedType && accountData.verifiedType !== 'none') {
                findings.push(this.createFinding(
                    'good',
                    `Account has ${accountData.verifiedType} verification`,
                    -10,
                    { verifiedType: accountData.verifiedType }
                ));
                rawScore = Math.max(0, rawScore - 5);
            }
            
            // === ANALYSIS: Account Age ===
            if (accountData.accountAge !== undefined) {
                if (accountData.accountAge < 30) {
                    findings.push(this.createFinding(
                        'warning',
                        'Account is less than 30 days old',
                        20,
                        { ageDays: accountData.accountAge }
                    ));
                    rawScore += 10;
                    flags.push('new_account');
                } else if (accountData.accountAge > 365) {
                    findings.push(this.createFinding(
                        'good',
                        'Account is over 1 year old',
                        -5,
                        { ageDays: accountData.accountAge }
                    ));
                }
            }
            
            // === ANALYSIS: Follower/Following Ratio ===
            if (accountData.followerCount !== undefined && accountData.followingCount !== undefined) {
                const ratio = accountData.followingCount > 0 
                    ? accountData.followerCount / accountData.followingCount 
                    : 0;
                
                if (ratio < 0.1 && accountData.followingCount > 500) {
                    findings.push(this.createFinding(
                        'warning',
                        'Very low follower-to-following ratio',
                        15,
                        { 
                            ratio: ratio.toFixed(2), 
                            followers: accountData.followerCount, 
                            following: accountData.followingCount 
                        }
                    ));
                    rawScore += 10;
                    flags.push('suspicious_ratio');
                }
            }
            
            // === ANALYSIS: Shadowban Indicators ===
            if (accountData.searchBan) {
                findings.push(this.createFinding(
                    'danger',
                    'Search ban detected - account not appearing in search',
                    60,
                    { type: 'search_ban' }
                ));
                rawScore += 40;
                flags.push('search_ban');
            }
            
            if (accountData.searchSuggestionBan) {
                findings.push(this.createFinding(
                    'warning',
                    'Search suggestion ban - not appearing in autocomplete',
                    40,
                    { type: 'search_suggestion_ban' }
                ));
                rawScore += 25;
                flags.push('search_suggestion_ban');
            }
            
            if (accountData.ghostBan) {
                findings.push(this.createFinding(
                    'danger',
                    'Ghost ban detected - content invisible to others',
                    80,
                    { type: 'ghost_ban' }
                ));
                rawScore += 50;
                flags.push('ghost_ban');
            }
            
            if (accountData.replyDeboosting) {
                findings.push(this.createFinding(
                    'warning',
                    'Reply deboosting - replies hidden under "Show more"',
                    40,
                    { type: 'reply_deboosting' }
                ));
                rawScore += 25;
                flags.push('reply_deboosting');
            }
            
            // === Add positive finding if no issues ===
            if (findings.length === 0) {
                findings.push(this.createFinding(
                    'good',
                    'Account exists and appears healthy',
                    0,
                    {}
                ));
            }
        }
        
        // Calculate confidence based on data availability
        const requiredFields = ['exists', 'suspended', 'protected', 'accountAge', 'followerCount'];
        const confidence = this.calculateDataConfidence(accountData, requiredFields);
        
        return this.createResult({
            status: 'complete',
            rawScore: Math.min(100, rawScore),
            confidence: confidence,
            findings: findings,
            flags: flags,
            checks: checks,
            processingTime: Date.now() - startTime,
            message: accountData.demo ? 'Demo data - connect to real API for live results' : null
        });
    }
    
    // =========================================================================
    // POST ANALYSIS
    // =========================================================================
    
    async analyzePost(input, platform, startTime) {
        const findings = [];
        const flags = [];
        let rawScore = 0;
        
        // Get post data from platform (or use provided)
        const postData = input.postData || await platform.getPostData(input.postId);
        
        if (postData.error) {
            return this.createResult({
                status: 'error',
                rawScore: 0,
                confidence: 0,
                findings: [{
                    type: 'danger',
                    severity: 'high',
                    message: postData.error,
                    impact: 0
                }],
                checks: { error: postData.error },
                processingTime: Date.now() - startTime,
                message: postData.error
            });
        }
        
        // Build checks object
        const checks = {
            postExists: postData.exists ?? true,
            postTombstoned: postData.tombstoned ?? false,
            postAgeRestricted: postData.ageRestricted ?? false,
            postVisibility: postData.visibility || 'visible',
            
            metrics: {
                views: postData.viewCount,
                likes: postData.likeCount,
                retweets: postData.retweetCount,
                replies: postData.replyCount,
                quotes: postData.quoteCount
            },
            
            contentFlags: {
                possiblySensitive: postData.possiblySensitive || false,
                withheld: postData.withheld || null
            },
            
            // Reddit-specific
            removed: postData.removed,
            automodFiltered: postData.automodFiltered,
            spamFiltered: postData.spamFiltered,
            removedByCategory: postData.removedByCategory
        };
        
        // === ANALYSIS: Post Existence ===
        if (!postData.exists) {
            findings.push(this.createFinding(
                'danger',
                'Post does not exist or was deleted',
                100,
                { postId: input.postId }
            ));
            rawScore = 100;
            flags.push('post_deleted');
            
        } else {
            // === ANALYSIS: Tombstoned (Twitter) ===
            if (postData.tombstoned) {
                findings.push(this.createFinding(
                    'danger',
                    'Post is tombstoned (hidden with notice)',
                    80,
                    { postId: input.postId }
                ));
                rawScore += 60;
                flags.push('tombstoned');
            }
            
            // === ANALYSIS: Age Restriction ===
            if (postData.ageRestricted) {
                findings.push(this.createFinding(
                    'warning',
                    'Post is age-restricted',
                    40,
                    {}
                ));
                rawScore += 20;
                flags.push('age_restricted');
            }
            
            // === ANALYSIS: Visibility ===
            if (postData.visibility && postData.visibility !== 'visible') {
                findings.push(this.createFinding(
                    'warning',
                    `Post has limited visibility: ${postData.visibility}`,
                    50,
                    { visibility: postData.visibility }
                ));
                rawScore += 30;
                flags.push('limited_visibility');
            }
            
            // === ANALYSIS: Possibly Sensitive ===
            if (postData.possiblySensitive) {
                findings.push(this.createFinding(
                    'warning',
                    'Post marked as possibly sensitive',
                    30,
                    {}
                ));
                rawScore += 15;
                flags.push('possibly_sensitive');
            }
            
            // === ANALYSIS: Reddit-Specific ===
            if (input.platform === 'reddit') {
                if (postData.removed) {
                    findings.push(this.createFinding(
                        'danger',
                        'Post was removed by moderators',
                        80,
                        { category: postData.removedByCategory }
                    ));
                    rawScore += 60;
                    flags.push('removed');
                }
                
                if (postData.automodFiltered) {
                    findings.push(this.createFinding(
                        'warning',
                        'Post was caught by AutoModerator',
                        60,
                        {}
                    ));
                    rawScore += 40;
                    flags.push('automod');
                }
                
                if (postData.spamFiltered) {
                    findings.push(this.createFinding(
                        'danger',
                        'Post was caught by spam filter',
                        70,
                        {}
                    ));
                    rawScore += 50;
                    flags.push('spam_filtered');
                }
            }
            
            // === ANALYSIS: Engagement Anomaly ===
            if (postData.viewCount !== undefined && postData.likeCount !== undefined) {
                const engagementRate = postData.viewCount > 0 
                    ? (postData.likeCount / postData.viewCount) * 100 
                    : 0;
                
                if (engagementRate < 0.1 && postData.viewCount > 1000) {
                    findings.push(this.createFinding(
                        'warning',
                        'Very low engagement rate for view count',
                        20,
                        { engagementRate: engagementRate.toFixed(2) + '%', views: postData.viewCount }
                    ));
                    rawScore += 10;
                    flags.push('low_engagement');
                }
            }
            
            // === Add positive finding if no issues ===
            if (findings.length === 0) {
                findings.push(this.createFinding(
                    'good',
                    'Post exists and appears visible',
                    0,
                    {}
                ));
            }
        }
        
        // Calculate confidence
        const requiredFields = ['exists', 'visibility', 'possiblySensitive'];
        const confidence = this.calculateDataConfidence(postData, requiredFields);
        
        return this.createResult({
            status: 'complete',
            rawScore: Math.min(100, rawScore),
            confidence: confidence,
            findings: findings,
            flags: flags,
            checks: checks,
            processingTime: Date.now() - startTime,
            message: postData.demo ? 'Demo data - connect to real API for live results' : null
        });
    }
    
    // =========================================================================
    // 3-POINT INTELLIGENCE METHODS
    // Called by Detection Agent for real-time visibility checks
    // =========================================================================
    
    /**
     * Check if hashtags are visible in platform search
     * @param {array} hashtags - Hashtags to check
     * @param {string} platformId - Platform identifier
     * @returns {object} Visibility results
     */
    async checkHashtagVisibility(hashtags, platformId) {
        if (!hashtags || hashtags.length === 0) {
            return { available: false, riskScore: 0 };
        }
        
        const cacheKey = `hashtag_vis_${platformId}_${hashtags.slice(0, 5).join('_')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        const platform = this.getPlatform(platformId);
        if (!platform) {
            return { available: false, riskScore: 0, error: 'Platform not supported' };
        }
        
        const results = {
            available: true,
            visibility: 'unknown',
            blocked: [],
            restricted: [],
            visible: [],
            riskScore: 0
        };
        
        try {
            for (const tag of hashtags.slice(0, 10)) {
                const normalizedTag = tag.replace(/^#/, '').toLowerCase();
                
                if (platform.checkHashtagStatus) {
                    const status = await platform.checkHashtagStatus(normalizedTag);
                    
                    if (status.blocked) {
                        results.blocked.push({ tag, status: 'blocked', reason: status.reason });
                        results.riskScore += 30;
                    } else if (status.restricted) {
                        results.restricted.push({ tag, status: 'restricted', reason: status.reason });
                        results.riskScore += 15;
                    } else {
                        results.visible.push({ tag, status: 'visible' });
                    }
                } else {
                    results.visible.push({ tag, status: 'visible' });
                }
            }
            
            // Determine overall visibility
            if (results.blocked.length > 0) {
                results.visibility = 'partially_blocked';
            } else if (results.restricted.length > 0) {
                results.visibility = 'restricted';
            } else {
                results.visibility = 'visible';
            }
            
            results.riskScore = Math.min(100, results.riskScore);
            
        } catch (error) {
            this.log(`Hashtag visibility check error: ${error.message}`, 'warn');
            results.available = false;
            results.error = error.message;
        }
        
        this.setCache(cacheKey, results);
        return results;
    }
    
    /**
     * Check if links are blocked/filtered by platform
     * @param {array} urls - URLs to check
     * @param {string} platformId - Platform identifier
     * @returns {object} Link visibility results
     */
    async checkLinkVisibility(urls, platformId) {
        if (!urls || urls.length === 0) {
            return { available: false, riskScore: 0 };
        }
        
        const platform = this.getPlatform(platformId);
        if (!platform) {
            return { available: false, riskScore: 0, error: 'Platform not supported' };
        }
        
        const results = {
            available: true,
            blocked: [],
            warned: [],
            visible: [],
            riskScore: 0
        };
        
        try {
            for (const url of urls.slice(0, 5)) {
                const domain = this.extractDomain(url);
                
                if (platform.checkLinkStatus) {
                    const status = await platform.checkLinkStatus(url);
                    
                    if (status.blocked) {
                        results.blocked.push({ url, domain, reason: status.reason });
                        results.riskScore += 35;
                    } else if (status.warned) {
                        results.warned.push({ url, domain, reason: status.reason });
                        results.riskScore += 15;
                    } else {
                        results.visible.push({ url, domain });
                    }
                } else {
                    results.visible.push({ url, domain });
                }
            }
            
            results.riskScore = Math.min(100, results.riskScore);
            
        } catch (error) {
            this.log(`Link visibility check error: ${error.message}`, 'warn');
            results.available = false;
            results.error = error.message;
        }
        
        return results;
    }
    
    /**
     * Check account status for mentioned users
     * @param {array} usernames - Usernames to check
     * @param {string} platformId - Platform identifier
     * @returns {object} Account status results
     */
    async checkAccountStatus(usernames, platformId) {
        if (!usernames || usernames.length === 0) {
            return { available: false, riskScore: 0 };
        }
        
        const platform = this.getPlatform(platformId);
        if (!platform) {
            return { available: false, riskScore: 0, error: 'Platform not supported' };
        }
        
        const results = {
            available: true,
            suspended: [],
            shadowbanned: [],
            restricted: [],
            active: [],
            notFound: [],
            riskScore: 0
        };
        
        try {
            for (const username of usernames.slice(0, 5)) {
                const normalizedUser = username.replace(/^@/, '').toLowerCase();
                const accountData = await platform.getAccountData(normalizedUser);
                
                if (accountData.error || !accountData.exists) {
                    results.notFound.push({ username: normalizedUser });
                    results.riskScore += 10;
                } else if (accountData.suspended) {
                    results.suspended.push({ username: normalizedUser });
                    results.riskScore += 25;
                } else if (accountData.shadowBanned) {
                    results.shadowbanned.push({ username: normalizedUser });
                    results.riskScore += 20;
                } else if (accountData.restricted) {
                    results.restricted.push({ username: normalizedUser });
                    results.riskScore += 15;
                } else {
                    results.active.push({ username: normalizedUser });
                }
            }
            
            results.riskScore = Math.min(100, results.riskScore);
            
        } catch (error) {
            this.log(`Account status check error: ${error.message}`, 'warn');
            results.available = false;
            results.error = error.message;
        }
        
        return results;
    }
    
    // =========================================================================
    // HELPER METHODS
    // =========================================================================
    
    getPlatform(platformId) {
        if (window.PlatformFactory) {
            return window.PlatformFactory.get(platformId);
        }
        return null;
    }
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }
    
    setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }
    
    clearCache() {
        this.cache.clear();
    }
}

// =============================================================================
// REGISTER AGENT
// =============================================================================

const platformAPIAgent = new PlatformAPIAgent();

if (window.AgentRegistry) {
    window.AgentRegistry.register(platformAPIAgent);
}

window.PlatformAPIAgent = PlatformAPIAgent;
window.platformAPIAgent = platformAPIAgent;

console.log('✅ PlatformAPIAgent v2.0.0 loaded - Factor 1 (20%)');

})();
