/* =============================================================================
   AGENT-PLATFORM-API.JS - Platform API Agent (Factor 1)
   ShadowBanCheck.io
   
   Queries platform APIs for account and post data.
   Weight: 20% of final score
   
   Responsibilities:
   - Account existence and status checks
   - Public metrics collection
   - Content flags detection
   - Rate limit monitoring
   - Shadowban indicator checks (where available)
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// PLATFORM API AGENT
// =============================================================================

class PlatformApiAgent {
    
    constructor() {
        this.id = 'api';
        this.name = 'Platform API Analysis';
        this.factor = 1;
        this.weight = 20;
        this.version = '2.0.0';
        this.demoMode = true;
    }
    
    /**
     * Main analysis method
     * @param {object} input - Analysis input with platform, username, postId, etc.
     * @returns {Promise<object>} Analysis result
     */
    async analyze(input) {
        const platform = input.platform || 'twitter';
        const startTime = Date.now();
        
        const checks = {
            account: null,
            post: null,
            shadowban: null,
            rateLimit: null
        };
        
        const findings = [];
        let totalScore = 0;
        let checksCompleted = 0;
        
        // Get platform handler
        const handler = this.getPlatformHandler(platform);
        
        // =================================================================
        // ACCOUNT CHECKS
        // =================================================================
        
        if (input.username) {
            const accountData = await this.getAccountData(handler, input.username, platform);
            checks.account = accountData;
            checksCompleted++;
            
            if (accountData) {
                // Check if account exists
                if (!accountData.exists) {
                    findings.push({
                        type: 'danger',
                        severity: 'critical',
                        message: 'Account does not exist or is not accessible',
                        impact: 100
                    });
                    totalScore += 100;
                }
                // Check if suspended
                else if (accountData.suspended) {
                    findings.push({
                        type: 'danger',
                        severity: 'critical',
                        message: 'Account is suspended',
                        impact: 100
                    });
                    totalScore += 100;
                }
                // Check if protected/private
                else if (accountData.protected) {
                    findings.push({
                        type: 'info',
                        severity: 'low',
                        message: 'Account is protected/private - limited visibility',
                        impact: 10
                    });
                    totalScore += 10;
                }
                // Account exists and active
                else {
                    findings.push({
                        type: 'good',
                        severity: 'none',
                        message: 'Account exists and is active',
                        impact: 0
                    });
                }
                
                // Check verification status
                if (accountData.verifiedType === 'none' || !accountData.verifiedType) {
                    findings.push({
                        type: 'info',
                        severity: 'low',
                        message: 'Account is not verified',
                        impact: 5
                    });
                    totalScore += 5;
                } else {
                    findings.push({
                        type: 'good',
                        severity: 'none',
                        message: `Account is verified (${accountData.verifiedType})`,
                        impact: -5
                    });
                    totalScore = Math.max(0, totalScore - 5);
                }
                
                // Check account age (Twitter/Reddit specific)
                if (accountData.accountAge !== undefined) {
                    if (accountData.accountAge < 7) {
                        findings.push({
                            type: 'warning',
                            severity: 'medium',
                            message: `Account is very new (${accountData.accountAge} days old)`,
                            impact: 20
                        });
                        totalScore += 20;
                    } else if (accountData.accountAge < 30) {
                        findings.push({
                            type: 'info',
                            severity: 'low',
                            message: `Account is relatively new (${accountData.accountAge} days old)`,
                            impact: 10
                        });
                        totalScore += 10;
                    }
                }
                
                // Check engagement metrics
                if (accountData.followers !== undefined && accountData.following !== undefined) {
                    const ratio = accountData.following > 0 ? accountData.followers / accountData.following : 0;
                    
                    if (ratio < 0.1 && accountData.following > 100) {
                        findings.push({
                            type: 'warning',
                            severity: 'medium',
                            message: `Low follower ratio (${ratio.toFixed(2)}) - may indicate spam behavior`,
                            impact: 15
                        });
                        totalScore += 15;
                    }
                }
                
                // Reddit-specific: Check karma
                if (platform === 'reddit' && accountData.totalKarma !== undefined) {
                    if (accountData.totalKarma < 10) {
                        findings.push({
                            type: 'warning',
                            severity: 'high',
                            message: `Very low karma (${accountData.totalKarma}) - likely to trigger AutoMod`,
                            impact: 25
                        });
                        totalScore += 25;
                    } else if (accountData.totalKarma < 100) {
                        findings.push({
                            type: 'info',
                            severity: 'low',
                            message: `Low karma (${accountData.totalKarma}) - may be filtered in some subreddits`,
                            impact: 10
                        });
                        totalScore += 10;
                    }
                }
            }
        }
        
        // =================================================================
        // POST CHECKS
        // =================================================================
        
        if (input.postId) {
            const postData = await this.getPostData(handler, input.postId, platform);
            checks.post = postData;
            checksCompleted++;
            
            if (postData) {
                // Check if post exists
                if (!postData.exists) {
                    findings.push({
                        type: 'danger',
                        severity: 'high',
                        message: 'Post does not exist or was deleted',
                        impact: 50
                    });
                    totalScore += 50;
                }
                // Check if tombstoned (Twitter)
                else if (postData.tombstoned) {
                    findings.push({
                        type: 'danger',
                        severity: 'high',
                        message: 'Post has been removed/tombstoned',
                        impact: 40
                    });
                    totalScore += 40;
                }
                // Check if removed (Reddit)
                else if (postData.removed) {
                    findings.push({
                        type: 'danger',
                        severity: 'high',
                        message: `Post was removed by ${postData.removedBy || 'moderator'}`,
                        impact: 40
                    });
                    totalScore += 40;
                }
                // Check content flags
                else if (postData.contentFlags?.possiblySensitive) {
                    findings.push({
                        type: 'warning',
                        severity: 'medium',
                        message: 'Post is marked as possibly sensitive',
                        impact: 15
                    });
                    totalScore += 15;
                }
                // Check age restriction
                else if (postData.ageRestricted) {
                    findings.push({
                        type: 'warning',
                        severity: 'medium',
                        message: 'Post is age-restricted',
                        impact: 20
                    });
                    totalScore += 20;
                }
                // Post looks good
                else {
                    findings.push({
                        type: 'good',
                        severity: 'none',
                        message: 'Post exists and is accessible',
                        impact: 0
                    });
                }
                
                // Check NSFW (Reddit)
                if (postData.nsfw) {
                    findings.push({
                        type: 'info',
                        severity: 'low',
                        message: 'Post is marked NSFW',
                        impact: 10
                    });
                    totalScore += 10;
                }
                
                // Check quarantine (Reddit)
                if (postData.quarantined) {
                    findings.push({
                        type: 'warning',
                        severity: 'high',
                        message: 'Post is in a quarantined subreddit',
                        impact: 30
                    });
                    totalScore += 30;
                }
            }
        }
        
        // =================================================================
        // SHADOWBAN CHECKS (Platform-specific)
        // =================================================================
        
        if (input.username && handler?.checkShadowban) {
            const shadowbanData = await handler.checkShadowban(input.username);
            checks.shadowban = shadowbanData;
            checksCompleted++;
            
            if (shadowbanData?.checks) {
                // Twitter shadowban types
                if (shadowbanData.checks.searchBan?.status) {
                    findings.push({
                        type: 'danger',
                        severity: 'high',
                        message: 'Search ban detected - account not appearing in search results',
                        impact: 35
                    });
                    totalScore += 35;
                }
                
                if (shadowbanData.checks.searchSuggestionBan?.status) {
                    findings.push({
                        type: 'warning',
                        severity: 'medium',
                        message: 'Search suggestion ban - account not appearing in suggestions',
                        impact: 20
                    });
                    totalScore += 20;
                }
                
                if (shadowbanData.checks.ghostBan?.status) {
                    findings.push({
                        type: 'danger',
                        severity: 'high',
                        message: 'Ghost ban detected - replies not visible to others',
                        impact: 40
                    });
                    totalScore += 40;
                }
                
                if (shadowbanData.checks.replyDeboosting?.status) {
                    findings.push({
                        type: 'warning',
                        severity: 'medium',
                        message: 'Reply deboosting - replies hidden under "Show more"',
                        impact: 25
                    });
                    totalScore += 25;
                }
                
                // Reddit shadowban
                if (shadowbanData.checks.accountShadowban?.status) {
                    findings.push({
                        type: 'danger',
                        severity: 'critical',
                        message: 'Account shadowban detected - profile not visible to others',
                        impact: 50
                    });
                    totalScore += 50;
                }
            }
        }
        
        // =================================================================
        // RATE LIMIT STATUS
        // =================================================================
        
        if (checks.account?.rateLimitStatus) {
            checks.rateLimit = checks.account.rateLimitStatus;
            
            const remaining = checks.rateLimit.remaining;
            const limit = checks.rateLimit.limit;
            
            if (remaining < limit * 0.1) {
                findings.push({
                    type: 'info',
                    severity: 'low',
                    message: `API rate limit nearly exhausted (${remaining}/${limit} remaining)`,
                    impact: 0
                });
            }
        }
        
        // =================================================================
        // CALCULATE FINAL SCORE
        // =================================================================
        
        const rawScore = Math.min(100, Math.max(0, totalScore));
        const confidence = this.calculateConfidence(checksCompleted, findings);
        
        return {
            agent: this.name,
            agentId: this.id,
            factor: this.factor,
            weight: this.weight,
            status: checksCompleted > 0 ? 'complete' : 'error',
            
            platform: platform,
            processingTime: Date.now() - startTime,
            
            checks: checks,
            findings: findings,
            
            rawScore: rawScore,
            weightedScore: Math.round((rawScore * this.weight) / 100 * 100) / 100,
            confidence: confidence,
            
            summary: {
                accountStatus: this.getAccountStatus(checks.account),
                postStatus: this.getPostStatus(checks.post),
                shadowbanStatus: this.getShadowbanStatus(checks.shadowban),
                checksCompleted: checksCompleted
            },
            
            timestamp: new Date().toISOString()
        };
    }
    
    // =========================================================================
    // DATA COLLECTION
    // =========================================================================
    
    getPlatformHandler(platform) {
        if (platform === 'twitter' && window.twitterPlatform) {
            return window.twitterPlatform;
        }
        if (platform === 'reddit' && window.redditPlatform) {
            return window.redditPlatform;
        }
        return null;
    }
    
    async getAccountData(handler, username, platform) {
        if (handler?.getAccountData) {
            return await handler.getAccountData(username);
        }
        
        // Fallback demo data
        return {
            username: username,
            exists: true,
            suspended: false,
            protected: false,
            verifiedType: 'none',
            demo: true
        };
    }
    
    async getPostData(handler, postId, platform) {
        if (handler?.getTweetData) {
            return await handler.getTweetData(postId);
        }
        if (handler?.getPostData) {
            return await handler.getPostData(postId);
        }
        
        // Fallback demo data
        return {
            id: postId,
            exists: true,
            demo: true
        };
    }
    
    // =========================================================================
    // HELPERS
    // =========================================================================
    
    calculateConfidence(checksCompleted, findings) {
        let base = 50;
        
        // More checks = higher confidence
        base += checksCompleted * 15;
        
        // More findings = higher confidence (we found things to report)
        base += Math.min(findings.length * 5, 20);
        
        return Math.min(95, base);
    }
    
    getAccountStatus(account) {
        if (!account) return 'unknown';
        if (!account.exists) return 'not_found';
        if (account.suspended) return 'suspended';
        if (account.protected) return 'protected';
        return 'active';
    }
    
    getPostStatus(post) {
        if (!post) return 'unknown';
        if (!post.exists) return 'not_found';
        if (post.tombstoned) return 'removed';
        if (post.removed) return 'removed';
        return 'active';
    }
    
    getShadowbanStatus(shadowban) {
        if (!shadowban?.checks) return 'unknown';
        
        const checks = shadowban.checks;
        if (checks.searchBan?.status || checks.ghostBan?.status || checks.accountShadowban?.status) {
            return 'detected';
        }
        if (checks.searchSuggestionBan?.status || checks.replyDeboosting?.status) {
            return 'partial';
        }
        return 'clear';
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

const apiAgent = new PlatformApiAgent();

// Register with AgentRegistry
if (window.registerAgent) {
    window.registerAgent(apiAgent);
} else if (window.AgentRegistry) {
    window.AgentRegistry.register(apiAgent);
} else {
    window.AgentQueue = window.AgentQueue || [];
    window.AgentQueue.push(apiAgent);
}

window.apiAgent = apiAgent;
window.PlatformApiAgent = PlatformApiAgent;

console.log('✅ Platform API Agent loaded (Factor 1, Weight 20%)');

})();
