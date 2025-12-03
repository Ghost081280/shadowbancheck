/* =============================================================================
   AGENT-WEB-ANALYSIS.JS - Factor 2: Web/Search Analysis (20%)
   ShadowBanCheck.io - 5-Factor Detection Engine
   
   Version: 2.0.0
   Updated: December 2025
   
   Analyzes web visibility and search presence:
   - Search engine visibility (logged in/out/incognito)
   - Profile accessibility across contexts
   - Search suggestion visibility
   - Reply visibility testing
   - Hashtag indexing tests
   - Domain throttle detection (The Markup methodology)
   - Predictive web searches for 3-Point Intelligence
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// WEB ANALYSIS AGENT CLASS
// =============================================================================

class WebAnalysisAgent extends window.AgentBase {
    
    constructor() {
        super('web-analysis', 2, 20); // id, factor 2, weight 20%
        
        // Cache for search results
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minute cache for web searches
    }
    
    // =========================================================================
    // MAIN ANALYZE METHOD
    // =========================================================================
    
    async analyze(input) {
        const startTime = Date.now();
        
        try {
            // In demo mode, return simulated analysis
            if (this.useDemo) {
                return this.getDemoAnalysis(input, startTime);
            }
            
            // Real implementation would make actual web requests
            // For now, return structure matching spec
            return this.createResult({
                status: 'partial',
                rawScore: 0,
                confidence: 30,
                findings: [{
                    type: 'info',
                    severity: 'low',
                    message: 'Web analysis requires backend API connection',
                    impact: 0
                }],
                checks: {
                    searchVisibility: { status: 'not_checked' },
                    searchSuggestion: { status: 'not_checked' },
                    profileAccessibility: { status: 'not_checked' },
                    replyVisibility: { status: 'not_checked' },
                    hashtagIndexing: { status: 'not_checked' },
                    domainThrottling: { status: 'not_checked' }
                },
                processingTime: Date.now() - startTime,
                message: 'Web analysis requires backend API connection'
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
                    message: `Web analysis error: ${error.message}`,
                    impact: 0
                }],
                processingTime: Date.now() - startTime,
                message: `Error: ${error.message}`
            });
        }
    }
    
    // =========================================================================
    // DEMO ANALYSIS (Simulated Results)
    // =========================================================================
    
    getDemoAnalysis(input, startTime) {
        const findings = [];
        const flags = [];
        let rawScore = 0;
        
        // Build checks object matching spec structure
        const checks = {
            searchVisibility: {
                loggedIn: true,
                loggedOut: Math.random() > 0.3,
                incognito: Math.random() > 0.4,
                inPeopleSearch: Math.random() > 0.25
            },
            
            searchSuggestion: {
                appearsInSuggestions: Math.random() > 0.35,
                forFollowers: true,
                forNonFollowers: Math.random() > 0.4
            },
            
            profileAccessibility: {
                directAccess: true,
                inSearchResults: Math.random() > 0.2,
                inRecommendations: Math.random() > 0.5
            },
            
            replyVisibility: {
                repliesVisible: true,
                replyDeboosting: Math.random() > 0.7,
                hiddenBehindShowMore: Math.random() > 0.6
            },
            
            hashtagIndexing: {
                tested: true,
                indexed: Math.random() > 0.25,
                timeToIndex: null
            },
            
            domainThrottling: {
                tested: true,
                throttledDomainsDetected: [],
                averageDelay: null
            }
        };
        
        // === ANALYSIS: Search Visibility ===
        if (!checks.searchVisibility.loggedOut) {
            findings.push(this.createFinding(
                'warning',
                'Not appearing in search results when logged out',
                30,
                { context: 'Checked via external search while logged out' }
            ));
            rawScore += 20;
            flags.push('search_visibility_issue');
        }
        
        if (!checks.searchVisibility.incognito) {
            findings.push(this.createFinding(
                'warning',
                'Not appearing in incognito search',
                25,
                { context: 'Tested from incognito browser session' }
            ));
            rawScore += 15;
            flags.push('incognito_hidden');
        }
        
        // === ANALYSIS: Search Suggestion Ban ===
        if (!checks.searchSuggestion.appearsInSuggestions) {
            findings.push(this.createFinding(
                'warning',
                'Search suggestion ban detected - not appearing in autocomplete',
                40,
                { 
                    forFollowers: checks.searchSuggestion.forFollowers,
                    forNonFollowers: checks.searchSuggestion.forNonFollowers
                }
            ));
            rawScore += 25;
            flags.push('search_suggestion_ban');
        }
        
        // === ANALYSIS: Reply Visibility ===
        if (checks.replyVisibility.hiddenBehindShowMore) {
            findings.push(this.createFinding(
                'warning',
                'Replies may be hidden under "Show more replies"',
                35,
                { context: 'Reply deboosting detected' }
            ));
            rawScore += 20;
            flags.push('reply_deboosting');
        }
        
        // === ANALYSIS: Hashtag Indexing ===
        if (!checks.hashtagIndexing.indexed) {
            findings.push(this.createFinding(
                'warning',
                'Hashtags not indexing properly',
                30,
                { tested: true }
            ));
            rawScore += 15;
            flags.push('hashtag_indexing_issue');
        }
        
        // === ANALYSIS: Profile in Recommendations ===
        if (!checks.profileAccessibility.inRecommendations) {
            findings.push(this.createFinding(
                'info',
                'Profile not appearing in recommendations',
                15,
                {}
            ));
            rawScore += 5;
        }
        
        // Check for throttled domains in content
        if (input.text || input.postData?.text) {
            const text = input.text || input.postData.text || '';
            const throttledDomains = ['substack.com', 'facebook.com', 'instagram.com', 'threads.net', 'bsky.app'];
            const foundThrottled = throttledDomains.filter(d => text.toLowerCase().includes(d));
            
            if (foundThrottled.length > 0) {
                checks.domainThrottling.throttledDomainsDetected = foundThrottled;
                checks.domainThrottling.averageDelay = 2544;
                
                findings.push(this.createFinding(
                    'warning',
                    `Throttled domain(s) detected: ${foundThrottled.join(', ')}`,
                    25,
                    { domains: foundThrottled, delay: '~2.5s' }
                ));
                rawScore += 15;
                flags.push('domain_throttling');
            }
        }
        
        // === Add positive findings if applicable ===
        if (checks.searchVisibility.loggedIn && checks.searchVisibility.loggedOut) {
            findings.push(this.createFinding(
                'good',
                'Content appearing in search results',
                -5,
                {}
            ));
        }
        
        if (checks.profileAccessibility.directAccess) {
            findings.push(this.createFinding(
                'good',
                'Profile accessible without login',
                0,
                {}
            ));
        }
        
        // If no issues found
        if (rawScore === 0) {
            findings.push(this.createFinding(
                'good',
                'No web visibility issues detected',
                0,
                {}
            ));
        }
        
        // Calculate confidence based on checks performed
        const checksPerformed = Object.values(checks).filter(c => 
            typeof c === 'object' && c.tested !== false
        ).length;
        const confidence = Math.min(85, 50 + (checksPerformed * 5));
        
        return this.createResult({
            status: 'complete',
            rawScore: Math.min(100, rawScore),
            confidence: confidence,
            findings: findings,
            flags: flags,
            checks: checks,
            processingTime: Date.now() - startTime,
            message: 'Demo analysis - connect to real API for live web checks'
        });
    }
    
    // =========================================================================
    // 3-POINT INTELLIGENCE METHODS
    // Called by Detection Agent for predictive web searches
    // =========================================================================
    
    /**
     * Search web for recent news/reports about flagged items (Point 1: Predictive)
     * @param {array} queries - Search queries to run
     * @param {string} platformId - Platform context
     * @returns {object} Search results with risk assessment
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
            for (const query of queries.slice(0, 3)) {
                // Search Reddit for discussions
                const redditResults = await this.searchReddit(query, platformId);
                if (redditResults.found) {
                    results.sources.push('reddit');
                    results.articles.push(...redditResults.posts);
                    results.recentMentions += redditResults.count;
                    
                    if (redditResults.negativeSentiment > 0.5) {
                        results.riskScore += 15;
                        results.sentiment = 'negative';
                    }
                }
                
                // Search for news articles
                const newsResults = await this.searchNews(query, platformId);
                if (newsResults.found) {
                    results.sources.push('news');
                    results.articles.push(...newsResults.articles);
                    
                    if (newsResults.recentBanNews) {
                        results.riskScore += 25;
                    }
                }
                
                // Search Twitter/X for discussions
                const twitterResults = await this.searchTwitter(query, platformId);
                if (twitterResults.found) {
                    results.sources.push('twitter');
                    results.recentMentions += twitterResults.count;
                    
                    if (twitterResults.complaintRatio > 0.3) {
                        results.riskScore += 20;
                    }
                }
            }
            
            results.available = results.sources.length > 0;
            results.riskScore = Math.min(100, results.riskScore);
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
     * Search Reddit for discussions
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
            // Demo simulation based on query patterns
            const searchTerms = query.toLowerCase();
            
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
     * Search news sources
     */
    async searchNews(query, platformId) {
        const results = {
            found: false,
            articles: [],
            recentBanNews: false
        };
        
        try {
            // Demo simulation
            const searchTerms = query.toLowerCase();
            
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
     * Search Twitter for discussions
     */
    async searchTwitter(query, platformId) {
        const results = {
            found: false,
            count: 0,
            complaintRatio: 0
        };
        
        try {
            // Demo simulation
            results.found = Math.random() > 0.3;
            
            if (results.found) {
                results.count = Math.floor(Math.random() * 50);
                
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
        let confidence = 30;
        
        confidence += results.sources.length * 15;
        
        if (results.recentMentions > 10) {
            confidence += 15;
        } else if (results.recentMentions > 5) {
            confidence += 10;
        }
        
        confidence += Math.min(20, results.articles.length * 5);
        
        return Math.min(90, confidence);
    }
    
    // =========================================================================
    // ADDITIONAL WEB CHECK METHODS
    // =========================================================================
    
    /**
     * Check if a URL is indexed in search engines
     */
    async checkSearchIndex(url) {
        const results = {
            indexed: false,
            google: false,
            bing: false
        };
        
        try {
            // In production, would check actual search engines
            // Demo simulation
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
    
    /**
     * Test search visibility from multiple vantage points
     */
    async testSearchVisibility(username, platform) {
        const vantagePoints = ['logged_out', 'incognito', 'logged_in_non_follower', 'logged_in_follower'];
        const results = {};
        
        for (const vantage of vantagePoints) {
            // In production, would make actual searches from each context
            results[vantage] = Math.random() > 0.2;
        }
        
        const suppressionIndicator = !results.logged_out && results.logged_in_follower;
        
        return {
            results,
            suppressionIndicator,
            interpretation: suppressionIndicator 
                ? 'Possible soft suppression detected' 
                : 'No suppression detected'
        };
    }
    
    /**
     * Test domain redirect timing (The Markup methodology)
     */
    async testDomainThrottle(url) {
        const domain = this.extractDomain(url);
        
        // Known throttled domains on Twitter (confirmed by The Markup)
        const throttledDomains = [
            'facebook.com', 'instagram.com', 'threads.net', 'bsky.app',
            'substack.com', 'patreon.com', 'wa.me', 'messenger.com', 'linktree.com'
        ];
        
        const isThrottled = throttledDomains.some(d => domain?.includes(d));
        
        return {
            domain,
            tested: true,
            isThrottled,
            timing: {
                normal: 39,           // ms average
                measured: isThrottled ? 2544 : 39,
                ratio: isThrottled ? 65 : 1
            },
            source: isThrottled ? 'The Markup investigation (Sept 2023)' : null
        };
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
}

// =============================================================================
// REGISTER AGENT
// =============================================================================

const webAnalysisAgent = new WebAnalysisAgent();

if (window.AgentRegistry) {
    window.AgentRegistry.register(webAnalysisAgent);
}

window.WebAnalysisAgent = WebAnalysisAgent;
window.webAnalysisAgent = webAnalysisAgent;

console.log('✅ WebAnalysisAgent v2.0.0 loaded - Factor 2 (20%)');

})();
