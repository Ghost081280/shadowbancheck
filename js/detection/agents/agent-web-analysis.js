/* =============================================================================
   AGENT-WEB-ANALYSIS.JS - Web Analysis Agent (Factor 2)
   ShadowBanCheck.io
   
   Browser-based visibility tests from multiple vantage points.
   Weight: 20% of final score
   
   Responsibilities:
   - Search visibility tests (logged in/out, incognito)
   - Profile accessibility checks
   - Content visibility across different contexts
   - Geographic variation detection
   
   Test Methodologies (from Master Spec):
   - Compare search results across vantage points
   - Check hashtag/cashtag feed visibility
   - Test reply visibility
   - Verify profile in suggestions
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// VANTAGE POINTS
// =============================================================================

const VANTAGE_POINTS = [
    { id: 'logged_out', name: 'Logged Out', weight: 1.0 },
    { id: 'incognito', name: 'Incognito', weight: 1.0 },
    { id: 'logged_in_non_follower', name: 'Logged In (Non-Follower)', weight: 0.8 },
    { id: 'logged_in_follower', name: 'Logged In (Follower)', weight: 0.6 },
    { id: 'different_region', name: 'Different Region', weight: 0.7 }
];

// =============================================================================
// WEB ANALYSIS AGENT
// =============================================================================

class WebAnalysisAgent {
    
    constructor() {
        this.id = 'web';
        this.name = 'Web/Search Analysis';
        this.factor = 2;
        this.weight = 20;
        this.version = '2.0.0';
        this.demoMode = true;
    }
    
    /**
     * Main analysis method
     * @param {object} input - Analysis input
     * @returns {Promise<object>} Analysis result
     */
    async analyze(input) {
        const platform = input.platform || 'twitter';
        const startTime = Date.now();
        
        const checks = {
            searchVisibility: null,
            profileVisibility: null,
            contentVisibility: null,
            hashtagVisibility: null,
            replyVisibility: null
        };
        
        const findings = [];
        let totalScore = 0;
        let testsCompleted = 0;
        
        // =================================================================
        // SEARCH VISIBILITY TEST
        // =================================================================
        
        if (input.username) {
            const searchResult = await this.testSearchVisibility(input.username, platform);
            checks.searchVisibility = searchResult;
            testsCompleted++;
            
            if (searchResult.suppressed) {
                findings.push({
                    type: 'danger',
                    severity: 'high',
                    message: `Search visibility issue: ${searchResult.details}`,
                    impact: 35
                });
                totalScore += 35;
            } else if (searchResult.partial) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: `Partial search visibility: ${searchResult.details}`,
                    impact: 20
                });
                totalScore += 20;
            } else {
                findings.push({
                    type: 'good',
                    severity: 'none',
                    message: 'Account appears in search from all vantage points',
                    impact: 0
                });
            }
        }
        
        // =================================================================
        // PROFILE VISIBILITY TEST
        // =================================================================
        
        if (input.username) {
            const profileResult = await this.testProfileVisibility(input.username, platform);
            checks.profileVisibility = profileResult;
            testsCompleted++;
            
            if (!profileResult.accessible) {
                findings.push({
                    type: 'danger',
                    severity: 'high',
                    message: 'Profile not accessible from logged-out view',
                    impact: 40
                });
                totalScore += 40;
            } else if (profileResult.restricted) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: 'Profile has restricted visibility',
                    impact: 15
                });
                totalScore += 15;
            }
        }
        
        // =================================================================
        // CONTENT/POST VISIBILITY TEST
        // =================================================================
        
        if (input.postId || input.normalizedUrl) {
            const contentResult = await this.testContentVisibility(input, platform);
            checks.contentVisibility = contentResult;
            testsCompleted++;
            
            if (!contentResult.directLink) {
                findings.push({
                    type: 'danger',
                    severity: 'critical',
                    message: 'Content not accessible via direct link',
                    impact: 50
                });
                totalScore += 50;
            } else if (!contentResult.inSearch) {
                findings.push({
                    type: 'warning',
                    severity: 'high',
                    message: 'Content not appearing in search results',
                    impact: 30
                });
                totalScore += 30;
            } else if (!contentResult.inRecommendations) {
                findings.push({
                    type: 'info',
                    severity: 'low',
                    message: 'Content may have reduced reach in recommendations',
                    impact: 10
                });
                totalScore += 10;
            }
            
            // Check feed visibility
            if (!contentResult.onProfile) {
                findings.push({
                    type: 'danger',
                    severity: 'high',
                    message: 'Content not visible on profile/timeline',
                    impact: 35
                });
                totalScore += 35;
            }
        }
        
        // =================================================================
        // HASHTAG VISIBILITY TEST (Twitter/Instagram/TikTok)
        // =================================================================
        
        if (input.postId && ['twitter', 'instagram', 'tiktok'].includes(platform)) {
            const hashtagResult = await this.testHashtagVisibility(input, platform);
            checks.hashtagVisibility = hashtagResult;
            testsCompleted++;
            
            if (hashtagResult.tested && !hashtagResult.visible) {
                findings.push({
                    type: 'warning',
                    severity: 'high',
                    message: 'Content not appearing in hashtag feeds',
                    impact: 25
                });
                totalScore += 25;
            } else if (hashtagResult.tested && hashtagResult.visible) {
                findings.push({
                    type: 'good',
                    severity: 'none',
                    message: 'Content appears in hashtag feeds',
                    impact: 0
                });
            }
        }
        
        // =================================================================
        // REPLY VISIBILITY TEST (Twitter)
        // =================================================================
        
        if (input.username && platform === 'twitter') {
            const replyResult = await this.testReplyVisibility(input.username, platform);
            checks.replyVisibility = replyResult;
            testsCompleted++;
            
            if (replyResult.hidden) {
                findings.push({
                    type: 'danger',
                    severity: 'high',
                    message: 'Replies are being hidden from conversations',
                    impact: 35
                });
                totalScore += 35;
            } else if (replyResult.deboosted) {
                findings.push({
                    type: 'warning',
                    severity: 'medium',
                    message: 'Replies may be hidden under "Show more replies"',
                    impact: 20
                });
                totalScore += 20;
            }
        }
        
        // =================================================================
        // REDDIT-SPECIFIC: SUBREDDIT VISIBILITY
        // =================================================================
        
        if (platform === 'reddit' && input.postId) {
            const subredditResult = await this.testSubredditVisibility(input, platform);
            
            if (subredditResult.removedFromNew) {
                findings.push({
                    type: 'danger',
                    severity: 'high',
                    message: 'Post not appearing in subreddit /new',
                    impact: 35
                });
                totalScore += 35;
            }
            
            if (subredditResult.notInRAll) {
                findings.push({
                    type: 'info',
                    severity: 'low',
                    message: 'Post not eligible for r/all',
                    impact: 5
                });
                totalScore += 5;
            }
        }
        
        // =================================================================
        // CALCULATE FINAL SCORE
        // =================================================================
        
        const rawScore = Math.min(100, Math.max(0, totalScore));
        const confidence = this.calculateConfidence(testsCompleted, checks);
        
        return {
            agent: this.name,
            agentId: this.id,
            factor: this.factor,
            weight: this.weight,
            status: testsCompleted > 0 ? 'complete' : 'limited',
            
            platform: platform,
            processingTime: Date.now() - startTime,
            
            checks: checks,
            findings: findings,
            
            rawScore: rawScore,
            weightedScore: Math.round((rawScore * this.weight) / 100 * 100) / 100,
            confidence: confidence,
            
            summary: {
                testsCompleted: testsCompleted,
                vantagePoints: VANTAGE_POINTS.length,
                overallVisibility: this.getOverallVisibility(checks),
                suppressionDetected: rawScore >= 30
            },
            
            timestamp: new Date().toISOString()
        };
    }
    
    // =========================================================================
    // VISIBILITY TESTS
    // =========================================================================
    
    async testSearchVisibility(username, platform) {
        // In demo mode, simulate based on username patterns
        if (this.demoMode) {
            return this.simulateSearchVisibility(username, platform);
        }
        
        // TODO: Real implementation would:
        // 1. Search for username from logged-out browser
        // 2. Compare results from multiple vantage points
        // 3. Check if account appears in search suggestions
        
        return this.simulateSearchVisibility(username, platform);
    }
    
    simulateSearchVisibility(username, platform) {
        const lower = username.toLowerCase();
        
        // Detect demo scenarios
        if (lower.includes('shadowban') || lower.includes('hidden')) {
            return {
                suppressed: true,
                partial: false,
                vantageResults: {
                    logged_out: false,
                    incognito: false,
                    logged_in_non_follower: false,
                    logged_in_follower: true
                },
                details: 'Not appearing in search from logged-out or incognito views'
            };
        }
        
        if (lower.includes('partial') || lower.includes('limited')) {
            return {
                suppressed: false,
                partial: true,
                vantageResults: {
                    logged_out: false,
                    incognito: true,
                    logged_in_non_follower: true,
                    logged_in_follower: true
                },
                details: 'Not appearing in logged-out search but visible in incognito'
            };
        }
        
        // Default: visible everywhere
        return {
            suppressed: false,
            partial: false,
            vantageResults: {
                logged_out: true,
                incognito: true,
                logged_in_non_follower: true,
                logged_in_follower: true
            },
            details: 'Visible from all vantage points'
        };
    }
    
    async testProfileVisibility(username, platform) {
        if (this.demoMode) {
            return this.simulateProfileVisibility(username, platform);
        }
        
        return this.simulateProfileVisibility(username, platform);
    }
    
    simulateProfileVisibility(username, platform) {
        const lower = username.toLowerCase();
        
        if (lower.includes('suspended') || lower.includes('banned')) {
            return {
                accessible: false,
                restricted: false,
                details: 'Profile returns 404 or suspended notice'
            };
        }
        
        if (lower.includes('protected') || lower.includes('private')) {
            return {
                accessible: true,
                restricted: true,
                details: 'Profile is protected/private'
            };
        }
        
        return {
            accessible: true,
            restricted: false,
            details: 'Profile is publicly accessible'
        };
    }
    
    async testContentVisibility(input, platform) {
        if (this.demoMode) {
            return this.simulateContentVisibility(input, platform);
        }
        
        return this.simulateContentVisibility(input, platform);
    }
    
    simulateContentVisibility(input, platform) {
        const postId = String(input.postId || '').toLowerCase();
        
        // Check for demo scenarios based on post ID patterns
        if (postId.endsWith('111') || postId.includes('removed')) {
            return {
                directLink: false,
                onProfile: false,
                inSearch: false,
                inHashtagFeeds: false,
                inRecommendations: false,
                details: 'Content has been removed'
            };
        }
        
        if (postId.endsWith('222') || postId.includes('hidden')) {
            return {
                directLink: true,
                onProfile: true,
                inSearch: false,
                inHashtagFeeds: false,
                inRecommendations: false,
                details: 'Content accessible but not in search/feeds'
            };
        }
        
        if (postId.endsWith('333') || postId.includes('limited')) {
            return {
                directLink: true,
                onProfile: true,
                inSearch: true,
                inHashtagFeeds: false,
                inRecommendations: false,
                details: 'Content has limited distribution'
            };
        }
        
        // Default: fully visible
        return {
            directLink: true,
            onProfile: true,
            inSearch: true,
            inHashtagFeeds: true,
            inRecommendations: true,
            details: 'Content is fully visible'
        };
    }
    
    async testHashtagVisibility(input, platform) {
        if (this.demoMode) {
            // Extract hashtags from input
            const text = input.text || input.content || '';
            const hashtags = text.match(/#\w+/g) || [];
            
            if (hashtags.length === 0) {
                return { tested: false, visible: false, details: 'No hashtags to test' };
            }
            
            // Check if any hashtags are banned
            if (window.FlaggedHashtags) {
                const tags = hashtags.map(h => h.substring(1));
                const result = window.FlaggedHashtags.checkBulk(tags, platform);
                
                if (result.banned.length > 0) {
                    return {
                        tested: true,
                        visible: false,
                        bannedTags: result.banned.map(b => b.tag),
                        details: `Banned hashtag(s) prevent visibility: ${result.banned.map(b => '#' + b.tag).join(', ')}`
                    };
                }
            }
            
            return {
                tested: true,
                visible: true,
                details: 'Content should appear in hashtag feeds'
            };
        }
        
        return { tested: false, visible: false };
    }
    
    async testReplyVisibility(username, platform) {
        if (this.demoMode) {
            return this.simulateReplyVisibility(username, platform);
        }
        
        return this.simulateReplyVisibility(username, platform);
    }
    
    simulateReplyVisibility(username, platform) {
        const lower = username.toLowerCase();
        
        if (lower.includes('ghost')) {
            return {
                hidden: true,
                deboosted: false,
                details: 'Replies not visible to other users (ghost ban)'
            };
        }
        
        if (lower.includes('deboost') || lower.includes('limited')) {
            return {
                hidden: false,
                deboosted: true,
                details: 'Replies may be hidden under "Show more replies"'
            };
        }
        
        return {
            hidden: false,
            deboosted: false,
            details: 'Replies appear normally'
        };
    }
    
    async testSubredditVisibility(input, platform) {
        // Reddit-specific visibility test
        const postId = String(input.postId || '').toLowerCase();
        
        if (postId.includes('removed') || postId.endsWith('111')) {
            return {
                removedFromNew: true,
                notInRAll: true,
                details: 'Post removed from subreddit'
            };
        }
        
        if (postId.includes('filtered') || postId.endsWith('333')) {
            return {
                removedFromNew: true,
                notInRAll: true,
                details: 'Post filtered by AutoMod'
            };
        }
        
        return {
            removedFromNew: false,
            notInRAll: false,
            details: 'Post visible in subreddit'
        };
    }
    
    // =========================================================================
    // HELPERS
    // =========================================================================
    
    calculateConfidence(testsCompleted, checks) {
        let base = 40;
        
        // More tests = higher confidence
        base += testsCompleted * 12;
        
        // Bonus for consistent results across vantage points
        if (checks.searchVisibility?.vantageResults) {
            const results = Object.values(checks.searchVisibility.vantageResults);
            const allSame = results.every(r => r === results[0]);
            if (allSame) base += 10;
        }
        
        return Math.min(90, base);
    }
    
    getOverallVisibility(checks) {
        let issues = 0;
        
        if (checks.searchVisibility?.suppressed) issues += 2;
        if (checks.searchVisibility?.partial) issues += 1;
        if (checks.profileVisibility?.restricted) issues += 1;
        if (!checks.profileVisibility?.accessible) issues += 2;
        if (!checks.contentVisibility?.inSearch) issues += 1;
        if (!checks.contentVisibility?.directLink) issues += 2;
        if (checks.replyVisibility?.hidden) issues += 2;
        if (checks.replyVisibility?.deboosted) issues += 1;
        
        if (issues >= 4) return 'severely_restricted';
        if (issues >= 2) return 'partially_restricted';
        if (issues >= 1) return 'minor_issues';
        return 'fully_visible';
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
            demoMode: this.demoMode,
            vantagePoints: VANTAGE_POINTS.map(v => v.id)
        };
    }
}

// =============================================================================
// REGISTRATION
// =============================================================================

const webAgent = new WebAnalysisAgent();

if (window.registerAgent) {
    window.registerAgent(webAgent);
} else if (window.AgentRegistry) {
    window.AgentRegistry.register(webAgent);
} else {
    window.AgentQueue = window.AgentQueue || [];
    window.AgentQueue.push(webAgent);
}

window.webAgent = webAgent;
window.WebAnalysisAgent = WebAnalysisAgent;

console.log('✅ Web Analysis Agent loaded (Factor 2, Weight 20%)');

})();
