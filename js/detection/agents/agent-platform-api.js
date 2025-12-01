/* =============================================================================
   AGENT-PLATFORM-API.JS - Factor 1: Platform API Analysis
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Weight: 20%
   
   Analyzes direct platform API signals:
   - Account existence and status
   - Suspension/restriction status
   - Verification type
   - Account age and metrics
   - Post visibility and engagement
   - Hashtag visibility (3-Point Intelligence)
   - Link blocking status (3-Point Intelligence)
   - Content visibility (3-Point Intelligence)
   
   Version: 2.0.0 - Added 3-Point Intelligence methods
   ============================================================================= */

(function() {
'use strict';

class PlatformAPIAgent extends window.AgentBase {
    
    constructor() {
        super('platform-api', 1, 20); // Factor 1, 20% weight
        
        // Cache for API results (avoid duplicate calls)
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 second cache
    }
    
    async analyze(input) {
        const startTime = Date.now();
        const findings = [];
        const flags = [];
        const warnings = [];
        let rawScore = 0;
        
        try {
            const platform = this.getPlatform(input.platform);
            if (!platform) {
                return this.createResult({
                    rawScore: 0,
                    confidence: 0,
                    message: `Platform not supported: ${input.platform}`
                });
            }
            
            if (input.type === 'account') {
                return await this.analyzeAccountAPI(input, platform, startTime);
            } else if (input.type === 'post') {
                return await this.analyzePostAPI(input, platform, startTime);
            } else if (input.type === 'text') {
                // Text analysis doesn't need API calls
                return this.createResult({
                    rawScore: 0,
                    confidence: 100,
                    findings: [],
                    processingTime: Date.now() - startTime,
                    message: 'No API analysis needed for text-only input'
                });
            }
            
            return this.createResult({
                rawScore: 0,
                confidence: 0,
                message: 'Unknown input type'
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
    // Called by DetectionAgent for real-time visibility checks
    // =========================================================================
    
    /**
     * Check if hashtags are visible in platform search (Point 2: Real-Time)
     * @param {array} hashtags - Array of hashtags to check
     * @param {string} platformId - Platform identifier
     * @returns {object} { available, visibility, blocked, visible, riskScore }
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
            visible: [],
            restricted: [],
            riskScore: 0
        };
        
        try {
            // Check each hashtag via platform API
            for (const tag of hashtags.slice(0, 10)) { // Limit to 10 to avoid rate limits
                const normalizedTag = tag.replace(/^#/, '').toLowerCase();
                
                // Try platform-specific hashtag check
                if (platform.checkHashtagStatus) {
                    const status = await platform.checkHashtagStatus(normalizedTag);
                    
                    if (status.blocked) {
                        results.blocked.push({ tag, status: 'blocked', reason: status.reason });
                        results.riskScore += 30;
                    } else if (status.restricted) {
                        results.restricted.push({ tag, status: 'restricted', reason: status.reason });
                        results.riskScore += 15;
                    } else if (status.visible) {
                        results.visible.push({ tag, status: 'visible' });
                    }
                } else {
                    // Fallback: Try searching for the hashtag
                    const searchResult = await this.searchHashtag(normalizedTag, platform);
                    
                    if (searchResult.noResults) {
                        results.blocked.push({ tag, status: 'no_results', reason: 'No search results' });
                        results.riskScore += 20;
                    } else if (searchResult.limited) {
                        results.restricted.push({ tag, status: 'limited', reason: 'Limited results' });
                        results.riskScore += 10;
                    } else {
                        results.visible.push({ tag, status: 'visible', resultCount: searchResult.count });
                    }
                }
            }
            
            // Determine overall visibility
            if (results.blocked.length > 0) {
                results.visibility = 'partially_blocked';
            } else if (results.restricted.length > 0) {
                results.visibility = 'restricted';
            } else if (results.visible.length > 0) {
                results.visibility = 'visible';
            }
            
            // Normalize risk score
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
     * Check if links are blocked/filtered by platform (Point 2: Real-Time)
     * @param {array} urls - Array of URLs to check
     * @param {string} platformId - Platform identifier
     * @returns {object} { available, blocked, visible, riskScore }
     */
    async checkLinkVisibility(urls, platformId) {
        if (!urls || urls.length === 0) {
            return { available: false, riskScore: 0 };
        }
        
        const cacheKey = `link_vis_${platformId}_${urls.length}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
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
            for (const url of urls.slice(0, 5)) { // Limit to avoid rate limits
                const domain = this.extractDomain(url);
                
                // Check if platform blocks this domain
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
                    // Fallback: Check known blocked domains per platform
                    const isBlocked = this.isKnownBlockedDomain(domain, platformId);
                    
                    if (isBlocked) {
                        results.blocked.push({ url, domain, reason: 'Known blocked domain' });
                        results.riskScore += 25;
                    } else {
                        results.visible.push({ url, domain });
                    }
                }
            }
            
            results.riskScore = Math.min(100, results.riskScore);
            
        } catch (error) {
            this.log(`Link visibility check error: ${error.message}`, 'warn');
            results.available = false;
            results.error = error.message;
        }
        
        this.setCache(cacheKey, results);
        return results;
    }
    
    /**
     * Check account status for mentioned users (Point 2: Real-Time)
     * @param {array} usernames - Array of @usernames to check
     * @param {string} platformId - Platform identifier
     * @returns {object} { available, suspended, shadowbanned, active, riskScore }
     */
    async checkAccountStatus(usernames, platformId) {
        if (!usernames || usernames.length === 0) {
            return { available: false, riskScore: 0 };
        }
        
        const cacheKey = `account_status_${platformId}_${usernames.slice(0, 5).join('_')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
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
                
                // Get account data via platform
                const accountData = await platform.getAccountData(normalizedUser);
                
                if (accountData.error || !accountData.exists) {
                    results.notFound.push({ username: normalizedUser, reason: 'Account not found' });
                    results.riskScore += 10; // Mentioning non-existent accounts is minor risk
                } else if (accountData.suspended) {
                    results.suspended.push({ username: normalizedUser, reason: 'Account suspended' });
                    results.riskScore += 25; // Mentioning suspended accounts = medium risk
                } else if (accountData.shadowBanned) {
                    results.shadowbanned.push({ username: normalizedUser });
                    results.riskScore += 20;
                } else if (accountData.restricted) {
                    results.restricted.push({ username: normalizedUser, reason: accountData.restrictionReason });
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
        
        this.setCache(cacheKey, results);
        return results;
    }
    
    /**
     * Check if content would be filtered (Point 2: Real-Time)
     * @param {string} content - Text content to check
     * @param {string} platformId - Platform identifier
     * @returns {object} { available, wouldBeFiltered, filterReasons, riskScore }
     */
    async checkContentVisibility(content, platformId) {
        if (!content) {
            return { available: false, riskScore: 0 };
        }
        
        const platform = this.getPlatform(platformId);
        if (!platform) {
            return { available: false, riskScore: 0, error: 'Platform not supported' };
        }
        
        const results = {
            available: true,
            wouldBeFiltered: false,
            filterReasons: [],
            sensitiveContent: false,
            ageRestricted: false,
            riskScore: 0
        };
        
        try {
            // Check via platform's content filter if available
            if (platform.checkContentFilter) {
                const filterResult = await platform.checkContentFilter(content);
                
                results.wouldBeFiltered = filterResult.filtered;
                results.filterReasons = filterResult.reasons || [];
                results.sensitiveContent = filterResult.sensitive;
                results.ageRestricted = filterResult.ageRestricted;
                
                if (filterResult.filtered) {
                    results.riskScore += 50;
                }
                if (filterResult.sensitive) {
                    results.riskScore += 20;
                }
                if (filterResult.ageRestricted) {
                    results.riskScore += 15;
                }
            } else {
                // Fallback: Basic content checks
                const lowerContent = content.toLowerCase();
                
                // Check for sensitive keywords
                const sensitiveTerms = ['nsfw', 'adult', '18+', 'xxx'];
                for (const term of sensitiveTerms) {
                    if (lowerContent.includes(term)) {
                        results.sensitiveContent = true;
                        results.riskScore += 15;
                        break;
                    }
                }
            }
            
            results.riskScore = Math.min(100, results.riskScore);
            
        } catch (error) {
            this.log(`Content visibility check error: ${error.message}`, 'warn');
            results.available = false;
            results.error = error.message;
        }
        
        return results;
    }
    
    // =========================================================================
    // HELPER METHODS
    // =========================================================================
    
    async searchHashtag(tag, platform) {
        // Simulated search - would hit real API in production
        // Returns: { noResults, limited, count }
        
        if (platform.searchHashtag) {
            return await platform.searchHashtag(tag);
        }
        
        // Demo fallback
        return {
            noResults: false,
            limited: false,
            count: Math.floor(Math.random() * 1000)
        };
    }
    
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (e) {
            const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\?]+)/i);
            return match ? match[1] : url;
        }
    }
    
    isKnownBlockedDomain(domain, platformId) {
        // Known domains that specific platforms block
        const blockedDomains = {
            twitter: ['facebook.com', 'instagram.com', 'threads.net'],
            instagram: ['tiktok.com', 'twitter.com', 'x.com'],
            tiktok: ['youtube.com', 'instagram.com'],
            facebook: ['tiktok.com']
        };
        
        const platformBlocks = blockedDomains[platformId] || [];
        return platformBlocks.some(blocked => domain.includes(blocked));
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
    
    // =========================================================================
    // ORIGINAL METHODS
    // =========================================================================
    
    async analyzeAccountAPI(input, platform, startTime) {
        const findings = [];
        const flags = [];
        let rawScore = 0;
        
        // Get account data from platform
        const accountData = await platform.getAccountData(input.username);
        
        if (accountData.error) {
            return this.createResult({
                rawScore: 0,
                confidence: 0,
                message: accountData.error,
                processingTime: Date.now() - startTime
            });
        }
        
        // Check account existence
        if (!accountData.exists) {
            findings.push(this.createFinding(
                'account_not_found',
                'Account does not exist',
                100,
                { username: input.username }
            ));
            rawScore = 100;
        } else {
            // Check suspension status
            if (accountData.suspended) {
                findings.push(this.createFinding(
                    'account_suspended',
                    'Account is suspended',
                    100,
                    { username: input.username }
                ));
                rawScore = 100;
                flags.push('suspended');
            }
            
            // Check protected/private status
            if (accountData.protected) {
                findings.push(this.createFinding(
                    'account_protected',
                    'Account is private/protected',
                    30,
                    { username: input.username }
                ));
                rawScore += 10;
                flags.push('protected');
            }
            
            // Check verification type
            if (accountData.verifiedType && accountData.verifiedType !== 'none') {
                findings.push(this.createFinding(
                    'verified_account',
                    `Account has ${accountData.verifiedType} verification`,
                    -10, // Negative = good
                    { verifiedType: accountData.verifiedType }
                ));
                rawScore = Math.max(0, rawScore - 5);
            }
            
            // Check account age
            if (accountData.accountAge !== undefined) {
                if (accountData.accountAge < 30) {
                    findings.push(this.createFinding(
                        'new_account',
                        'Account is less than 30 days old',
                        20,
                        { ageDays: accountData.accountAge }
                    ));
                    rawScore += 10;
                    flags.push('new_account');
                } else if (accountData.accountAge > 365) {
                    findings.push(this.createFinding(
                        'established_account',
                        'Account is over 1 year old',
                        -5,
                        { ageDays: accountData.accountAge }
                    ));
                }
            }
            
            // Check follower/following ratio (Twitter-specific)
            if (accountData.followerCount !== undefined && accountData.followingCount !== undefined) {
                const ratio = accountData.followingCount > 0 
                    ? accountData.followerCount / accountData.followingCount 
                    : 0;
                
                if (ratio < 0.1 && accountData.followingCount > 500) {
                    findings.push(this.createFinding(
                        'low_follower_ratio',
                        'Very low follower-to-following ratio',
                        15,
                        { ratio: ratio.toFixed(2), followers: accountData.followerCount, following: accountData.followingCount }
                    ));
                    rawScore += 10;
                    flags.push('suspicious_ratio');
                }
            }
            
            // Check shadowban indicators (if available from platform check)
            if (accountData.shadowBanned) {
                findings.push(this.createFinding(
                    'shadowban_detected',
                    'Shadowban indicators detected',
                    80,
                    { checks: accountData.checks }
                ));
                rawScore += 50;
                flags.push('shadowban_suspected');
            }
        }
        
        // Calculate confidence based on data availability
        const requiredFields = ['exists', 'suspended', 'protected', 'accountAge'];
        const confidence = this.calculateConfidence(accountData, requiredFields);
        
        return this.createResult({
            rawScore: Math.min(100, rawScore),
            confidence,
            findings,
            flags,
            processingTime: Date.now() - startTime,
            message: accountData.demo ? 'Demo data - connect to real API for live results' : null
        });
    }
    
    async analyzePostAPI(input, platform, startTime) {
        const findings = [];
        const flags = [];
        let rawScore = 0;
        
        // Get post data from platform
        const postData = input.postData || await platform.getPostData(input.postId);
        
        if (postData.error) {
            return this.createResult({
                rawScore: 0,
                confidence: 0,
                message: postData.error,
                processingTime: Date.now() - startTime
            });
        }
        
        // Check post existence
        if (!postData.exists) {
            findings.push(this.createFinding(
                'post_not_found',
                'Post does not exist or was deleted',
                100,
                { postId: input.postId }
            ));
            rawScore = 100;
            flags.push('post_deleted');
        } else {
            // Check if tombstoned (Twitter-specific)
            if (postData.tombstoned) {
                findings.push(this.createFinding(
                    'post_tombstoned',
                    'Post is tombstoned (hidden with notice)',
                    80,
                    { postId: input.postId }
                ));
                rawScore += 60;
                flags.push('tombstoned');
            }
            
            // Check age restriction
            if (postData.ageRestricted) {
                findings.push(this.createFinding(
                    'age_restricted',
                    'Post is age-restricted',
                    40,
                    {}
                ));
                rawScore += 20;
                flags.push('age_restricted');
            }
            
            // Check visibility (if we have it)
            if (postData.visibility && postData.visibility !== 'visible') {
                findings.push(this.createFinding(
                    'limited_visibility',
                    `Post has limited visibility: ${postData.visibility}`,
                    50,
                    { visibility: postData.visibility }
                ));
                rawScore += 30;
                flags.push('limited_visibility');
            }
            
            // Reddit-specific checks
            if (input.platform === 'reddit') {
                if (postData.removed) {
                    findings.push(this.createFinding(
                        'post_removed',
                        'Post was removed by moderators',
                        80,
                        {}
                    ));
                    rawScore += 60;
                    flags.push('removed');
                }
                
                if (postData.automodFiltered) {
                    findings.push(this.createFinding(
                        'automod_filtered',
                        'Post was caught by AutoModerator',
                        60,
                        {}
                    ));
                    rawScore += 40;
                    flags.push('automod');
                }
                
                if (postData.spamFiltered) {
                    findings.push(this.createFinding(
                        'spam_filtered',
                        'Post was caught by spam filter',
                        70,
                        {}
                    ));
                    rawScore += 50;
                    flags.push('spam_filtered');
                }
            }
            
            // Check engagement metrics for anomalies
            if (postData.viewCount !== undefined && postData.likeCount !== undefined) {
                const engagementRate = postData.viewCount > 0 
                    ? (postData.likeCount / postData.viewCount) * 100 
                    : 0;
                
                if (engagementRate < 0.1 && postData.viewCount > 1000) {
                    findings.push(this.createFinding(
                        'low_engagement',
                        'Very low engagement rate for view count',
                        20,
                        { engagementRate: engagementRate.toFixed(2) + '%', views: postData.viewCount }
                    ));
                    rawScore += 10;
                    flags.push('low_engagement');
                }
            }
        }
        
        // Calculate confidence
        const requiredFields = ['exists', 'visibility'];
        const confidence = this.calculateConfidence(postData, requiredFields);
        
        return this.createResult({
            rawScore: Math.min(100, rawScore),
            confidence,
            findings,
            flags,
            processingTime: Date.now() - startTime,
            message: postData.demo ? 'Demo data - connect to real API for live results' : null
        });
    }
    
    getPlatform(platformId) {
        if (window.PlatformFactory) {
            return window.PlatformFactory.get(platformId);
        }
        return null;
    }
}

// Register agent
const platformAPIAgent = new PlatformAPIAgent();
if (window.AgentRegistry) {
    window.AgentRegistry.register(platformAPIAgent);
}

window.PlatformAPIAgent = platformAPIAgent;
console.log('✅ PlatformAPIAgent (Factor 1) loaded - 3-Point Intelligence methods enabled');

})();
