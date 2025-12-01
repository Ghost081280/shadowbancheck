/* =============================================================================
   AGENT-WEB-ANALYSIS.JS - Factor 2: Web/Search Analysis
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Weight: 20%
   
   Analyzes web visibility and search presence:
   - Search engine visibility
   - Profile accessibility across browsers
   - Desktop vs mobile visibility
   - Old.reddit vs new.reddit visibility
   - Public indexing status
   ============================================================================= */

(function() {
'use strict';

class WebAnalysisAgent extends window.AgentBase {
    
    constructor() {
        super('web-analysis', 2, 20); // Factor 2, 20% weight
    }
    
    async analyze(input) {
        const startTime = Date.now();
        const findings = [];
        const flags = [];
        let rawScore = 0;
        
        try {
            // In demo mode, return simulated analysis
            if (this.useDemo) {
                return this.getDemoAnalysis(input, startTime);
            }
            
            // Real implementation would:
            // 1. Check search engine visibility (logged out)
            // 2. Check profile accessibility from different contexts
            // 3. Compare desktop vs mobile views
            // 4. Check various URL formats (old vs new Reddit, etc.)
            
            // For now, return placeholder
            return this.createResult({
                rawScore: 0,
                confidence: 0,
                findings: [],
                processingTime: Date.now() - startTime,
                message: 'Web analysis requires backend API connection'
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
    
    getDemoAnalysis(input, startTime) {
        const findings = [];
        const flags = [];
        let rawScore = 0;
        
        // Simulate web analysis findings based on platform
        if (input.platform === 'twitter') {
            // Simulate search visibility check
            const searchVisible = Math.random() > 0.3;
            if (!searchVisible) {
                findings.push(this.createFinding(
                    'search_ban',
                    'Content not appearing in search results (logged out)',
                    60,
                    { context: 'Checked via external search while logged out' }
                ));
                rawScore += 40;
                flags.push('search_ban');
            } else {
                findings.push(this.createFinding(
                    'search_visible',
                    'Content appearing in search results',
                    -5,
                    {}
                ));
            }
            
            // Simulate reply visibility
            const repliesVisible = Math.random() > 0.25;
            if (!repliesVisible) {
                findings.push(this.createFinding(
                    'reply_deboosting',
                    'Replies may be hidden under "Show more replies"',
                    40,
                    { context: 'Replies not shown by default' }
                ));
                rawScore += 25;
                flags.push('reply_deboosting');
            }
            
            // Simulate profile accessibility
            findings.push(this.createFinding(
                'profile_accessible',
                'Profile accessible without login',
                0,
                {}
            ));
            
        } else if (input.platform === 'reddit') {
            // Simulate old vs new reddit visibility
            const oldRedditVisible = Math.random() > 0.2;
            const newRedditVisible = Math.random() > 0.1;
            
            if (!oldRedditVisible && newRedditVisible) {
                findings.push(this.createFinding(
                    'old_reddit_hidden',
                    'Content hidden on old.reddit.com but visible on new reddit',
                    30,
                    { oldReddit: false, newReddit: true }
                ));
                rawScore += 15;
                flags.push('partial_visibility');
            } else if (!newRedditVisible) {
                findings.push(this.createFinding(
                    'reddit_hidden',
                    'Content not visible on reddit.com',
                    70,
                    { oldReddit: oldRedditVisible, newReddit: newRedditVisible }
                ));
                rawScore += 50;
                flags.push('hidden');
            }
            
            // Simulate subreddit-specific visibility
            if (input.subreddit) {
                findings.push(this.createFinding(
                    'subreddit_check',
                    `Content posted to r/${input.subreddit}`,
                    0,
                    { subreddit: input.subreddit }
                ));
            }
        }
        
        // Common checks
        // Simulate Google indexing (simplified)
        const googleIndexed = Math.random() > 0.15;
        if (!googleIndexed) {
            findings.push(this.createFinding(
                'not_indexed',
                'Page not found in Google search results',
                20,
                { note: 'May be too new or set to noindex' }
            ));
            rawScore += 10;
            flags.push('not_indexed');
        }
        
        // Simulate mobile vs desktop
        const mobileVisible = Math.random() > 0.1;
        if (!mobileVisible) {
            findings.push(this.createFinding(
                'mobile_hidden',
                'Content not visible on mobile version',
                40,
                {}
            ));
            rawScore += 20;
            flags.push('mobile_hidden');
        }
        
        return this.createResult({
            rawScore: Math.min(100, rawScore),
            confidence: 70, // Demo confidence
            findings,
            flags,
            processingTime: Date.now() - startTime,
            message: 'Demo analysis - connect to real API for live web checks'
        });
    }
    
    // Real implementation methods (placeholders)
    
    async checkSearchVisibility(url, platform) {
        // Would make actual web requests to check search visibility
        // Returns { visible: boolean, context: string }
        return { visible: true, context: 'demo' };
    }
    
    async checkProfileAccessibility(username, platform) {
        // Would check profile from logged-out perspective
        // Returns { accessible: boolean, restricted: boolean }
        return { accessible: true, restricted: false };
    }
    
    async checkMobileVisibility(url, platform) {
        // Would check mobile version of the page
        // Returns { visible: boolean }
        return { visible: true };
    }
    
    async checkRedditVisibility(url) {
        // Would check old.reddit vs new.reddit
        // Returns { oldReddit: boolean, newReddit: boolean }
        return { oldReddit: true, newReddit: true };
    }
    
    async checkGoogleIndex(url) {
        // Would check if URL is indexed in Google
        // Returns { indexed: boolean }
        return { indexed: true };
    }
}

// Register agent
const webAnalysisAgent = new WebAnalysisAgent();
if (window.AgentRegistry) {
    window.AgentRegistry.register(webAnalysisAgent);
}

window.WebAnalysisAgent = WebAnalysisAgent;
console.log('✅ WebAnalysisAgent (Factor 2) loaded');

})();
