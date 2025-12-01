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
   - Predictive web searches for flagged content (3-Point Intelligence)
   
   Version: 2.0.0 - Added 3-Point Intelligence methods
   ============================================================================= */

(function() {
'use strict';

class WebAnalysisAgent extends window.AgentBase {
    
    constructor() {
        super('web-analysis', 2, 20); // Factor 2, 20% weight
        
        // Cache for search results
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minute cache for web searches
        
        // Search endpoints (would be real in production)
        this.searchSources = {
            reddit: 'https://www.reddit.com/search.json',
            google: 'https://www.google.com/search',
            twitter: 'https://api.twitter.com/2/tweets/search/recent'
        };
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
    
    // =========================================================================
    // 3-POINT INTELLIGENCE METHODS
    // Called by DetectionAgent for predictive web searches
    // =========================================================================
    
    /**
     * Search web for recent news/reports about flagged items (Point 1: Predictive)
     * This helps predict if items are currently being flagged/banned
     * @param {array} queries - Search queries to run
     * @param {string} platformId - Platform context
     * @returns {object} { available, riskScore, sources, articles }
     */
    async searchForFlaggedContent(queries, platformId) {
        if (!queries || queries.length === 0) {
            return { available: false, riskScore: 0 };
        }
        
        const cacheKey = `search_${platformId}_${queries.slice(0, 3).join('_').substring(0, 50)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        const results = {
            available: true,
            riskScore: 0,
            sources: [],
            articles: [],
            searchQueries: queries,
            recentMentions: 0,
            sentiment: 'neutral'
        };
        
        try {
            // Search multiple sources for each query
            for (const query of queries.slice(0, 3)) { // Limit queries
                
                // 1. Search Reddit for discussions
                const redditResults = await this.searchReddit(query, platformId);
                if (redditResults.found) {
                    results.sources.push('reddit');
                    results.articles.push(...redditResults.posts);
                    results.recentMentions += redditResults.count;
                    
                    // Analyze sentiment of discussions
                    if (redditResults.negativeSentiment > 0.5) {
                        results.riskScore += 15;
                        results.sentiment = 'negative';
                    }
                }
                
                // 2. Search for news articles (simulated)
                const newsResults = await this.searchNews(query, platformId);
                if (newsResults.found) {
                    results.sources.push('news');
                    results.articles.push(...newsResults.articles);
                    
                    // Recent news about bans = higher risk
                    if (newsResults.recentBanNews) {
                        results.riskScore += 25;
                    }
                }
                
                // 3. Check Twitter/X for recent discussions
                const twitterResults = await this.searchTwitter(query, platformId);
                if (twitterResults.found) {
                    results.sources.push('twitter');
                    results.recentMentions += twitterResults.count;
                    
                    // Many recent complaints = higher risk
                    if (twitterResults.complaintRatio > 0.3) {
                        results.riskScore += 20;
                    }
                }
            }
            
            // Determine if we found actionable intelligence
            results.available = results.sources.length > 0;
            
            // Normalize risk score
            results.riskScore = Math.min(100, results.riskScore);
            
            // Add confidence based on data quality
            results.confidence = this.calculateSearchConfidence(results);
            
        } catch (error) {
            this.log(`Search error: ${error.message}`, 'warn');
            results.available = false;
            results.error = error.message;
        }
        
        this.setCache(cacheKey, results);
        return results;
    }
    
    /**
     * Search Reddit for discussions about the query
     */
    async searchReddit(query, platformId) {
        const results = {
            found: false,
            posts: [],
            count: 0,
            negativeSentiment: 0
        };
        
        try {
            // In production, this would hit Reddit's API
            // For now, simulate based on common patterns
            
            const searchTerms = query.toLowerCase();
            
            // Simulate finding Reddit posts
            if (searchTerms.includes('banned') || searchTerms.includes('shadowban')) {
                results.found = true;
                results.count = Math.floor(Math.random() * 20) + 1;
                results.negativeSentiment = 0.6 + (Math.random() * 0.3);
                
                results.posts.push({
                    source: 'reddit',
                    title: `Discussion about ${query}`,
                    subreddit: platformId === 'twitter' ? 'Twitter' : platformId,
                    date: new Date().toISOString(),
                    sentiment: 'negative'
                });
            } else {
                // General search
                results.found = Math.random() > 0.5;
                if (results.found) {
                    results.count = Math.floor(Math.random() * 10);
                    results.negativeSentiment = Math.random() * 0.4;
                }
            }
            
        } catch (error) {
            this.log(`Reddit search error: ${error.message}`, 'warn');
        }
        
        return results;
    }
    
    /**
     * Search news sources for articles about the query
     */
    async searchNews(query, platformId) {
        const results = {
            found: false,
            articles: [],
            recentBanNews: false
        };
        
        try {
            // In production, would hit news APIs (NewsAPI, Google News, etc.)
            // Simulate based on query content
            
            const searchTerms = query.toLowerCase();
            
            // Check for ban-related news patterns
            if (searchTerms.includes('banned') || 
                searchTerms.includes('removed') || 
                searchTerms.includes('restricted')) {
                
                results.found = Math.random() > 0.4;
                
                if (results.found) {
                    results.recentBanNews = Math.random() > 0.5;
                    results.articles.push({
                        source: 'news',
                        title: `${platformId} updates content policies`,
                        date: new Date().toISOString(),
                        relevance: 'high'
                    });
                }
            }
            
        } catch (error) {
            this.log(`News search error: ${error.message}`, 'warn');
        }
        
        return results;
    }
    
    /**
     * Search Twitter for recent discussions
     */
    async searchTwitter(query, platformId) {
        const results = {
            found: false,
            count: 0,
            complaintRatio: 0
        };
        
        try {
            // In production, would hit Twitter API
            // Simulate based on query
            
            results.found = Math.random() > 0.3;
            
            if (results.found) {
                results.count = Math.floor(Math.random() * 50);
                
                // Calculate complaint ratio (tweets complaining vs neutral)
                const searchTerms = query.toLowerCase();
                if (searchTerms.includes('banned') || searchTerms.includes('shadow')) {
                    results.complaintRatio = 0.4 + (Math.random() * 0.4);
                } else {
                    results.complaintRatio = Math.random() * 0.3;
                }
            }
            
        } catch (error) {
            this.log(`Twitter search error: ${error.message}`, 'warn');
        }
        
        return results;
    }
    
    /**
     * Calculate confidence in search results
     */
    calculateSearchConfidence(results) {
        let confidence = 30; // Base confidence
        
        // More sources = higher confidence
        confidence += results.sources.length * 15;
        
        // More mentions = higher confidence
        if (results.recentMentions > 10) {
            confidence += 15;
        } else if (results.recentMentions > 5) {
            confidence += 10;
        }
        
        // Articles add confidence
        confidence += Math.min(20, results.articles.length * 5);
        
        return Math.min(90, confidence);
    }
    
    // =========================================================================
    // ADDITIONAL 3-POINT METHODS
    // =========================================================================
    
    /**
     * Check if a specific URL is indexed in search engines
     */
    async checkSearchIndex(url) {
        const results = {
            indexed: false,
            google: false,
            bing: false
        };
        
        try {
            // In production, would check actual search engines
            // Simulate for now
            results.google = Math.random() > 0.15;
            results.bing = Math.random() > 0.2;
            results.indexed = results.google || results.bing;
            
        } catch (error) {
            this.log(`Index check error: ${error.message}`, 'warn');
        }
        
        return results;
    }
    
    /**
     * Check visibility from different geographic regions
     */
    async checkRegionalVisibility(url, regions = ['US', 'EU', 'UK']) {
        const results = {
            checked: true,
            regions: {}
        };
        
        for (const region of regions) {
            // In production, would check from actual regional servers
            results.regions[region] = {
                visible: Math.random() > 0.1,
                latency: Math.floor(Math.random() * 500) + 100
            };
        }
        
        return results;
    }
    
    // =========================================================================
    // CACHE METHODS
    // =========================================================================
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }
    
    setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
        
        // Clean old cache entries
        if (this.cache.size > 100) {
            const now = Date.now();
            for (const [k, v] of this.cache.entries()) {
                if (now - v.timestamp > this.cacheTimeout) {
                    this.cache.delete(k);
                }
            }
        }
    }
    
    clearCache() {
        this.cache.clear();
    }
    
    // =========================================================================
    // ORIGINAL DEMO METHOD
    // =========================================================================
    
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

window.WebAnalysisAgent = webAnalysisAgent;
console.log('✅ WebAnalysisAgent (Factor 2) loaded - 3-Point Intelligence methods enabled');

})();
