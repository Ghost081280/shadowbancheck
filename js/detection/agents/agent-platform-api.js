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
   ============================================================================= */

(function() {
'use strict';

class PlatformAPIAgent extends window.AgentBase {
    
    constructor() {
        super('platform-api', 1, 20); // Factor 1, 20% weight
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

window.PlatformAPIAgent = PlatformAPIAgent;
console.log('✅ PlatformAPIAgent (Factor 1) loaded');

})();
