/* =============================================================================
   TWITTER.JS - Twitter/X Platform Handler
   ShadowBanCheck.io
   
   Comprehensive Twitter/X data collection and analysis.
   
   From Master Engine Spec:
   - Platform modules: 21 total (hashtags:4, cashtags:3, links:4, content:4, mentions:3, emojis:3)
   - Supports all 6 signal types
   - Shadowban checks: searchBan, searchSuggestionBan, ghostBan, replyDeboosting, suggestBan
   
   API Endpoints Supported:
   - GET /2/users/by/username/:username
   - GET /2/users/:id
   - GET /2/tweets/:id
   - GET /2/tweets/search/recent
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// TWITTER URL PATTERNS
// =============================================================================

const TWITTER_URL_PATTERNS = {
    // Tweet URLs
    tweet: [
        /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/i,
        /(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/i,
        /(?:twitter\.com|x\.com)\/i\/web\/status\/(\d+)/i
    ],
    
    // Profile URLs
    profile: [
        /(?:twitter\.com|x\.com)\/(?:#!\/)?@?(\w+)\/?$/i,
        /(?:twitter\.com|x\.com)\/intent\/user\?screen_name=(\w+)/i
    ],
    
    // Search URLs
    search: [
        /(?:twitter\.com|x\.com)\/search\?q=([^&]+)/i,
        /(?:twitter\.com|x\.com)\/hashtag\/(\w+)/i
    ]
};

// =============================================================================
// CONTENT EXTRACTION PATTERNS
// =============================================================================

const EXTRACTION_PATTERNS = {
    hashtags: /#(\w+)/g,
    cashtags: /\$([A-Z]{1,5})\b/g,
    mentions: /@(\w+)/g,
    urls: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi,
    emojis: /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu
};

// =============================================================================
// TWITTER PLATFORM CLASS
// =============================================================================

class TwitterPlatform {
    
    constructor() {
        this.id = 'twitter';
        this.name = 'Twitter/X';
        this.version = '2.0.0';
        this.demoMode = true;
        
        // Module configuration from master spec
        this.modules = {
            hashtags: 4,
            cashtags: 3,
            links: 4,
            content: 4,
            mentions: 3,
            emojis: 3
        };
        this.totalModules = 21;
        
        // API configuration
        this.apiVersion = 'v2';
        this.rateLimits = {
            userLookup: 900,
            tweetLookup: 900,
            searchRecent: 450,
            window: 15 * 60 * 1000 // 15 minutes in ms
        };
    }
    
    // =========================================================================
    // URL PARSING
    // =========================================================================
    
    /**
     * Detect URL type and extract identifiers
     * @param {string} url - Twitter URL
     * @returns {object} URL info with type, username, tweetId
     */
    getUrlType(url) {
        if (!url) {
            return { valid: false, error: 'No URL provided' };
        }
        
        const cleanUrl = url.trim();
        
        // Check for tweet URL
        for (const pattern of TWITTER_URL_PATTERNS.tweet) {
            const match = cleanUrl.match(pattern);
            if (match) {
                // Pattern with username and tweet ID
                if (match[2]) {
                    return {
                        valid: true,
                        type: 'tweet',
                        username: match[1],
                        tweetId: match[2],
                        normalizedUrl: `https://twitter.com/${match[1]}/status/${match[2]}`
                    };
                }
                // Pattern with just tweet ID (web status)
                if (match[1] && /^\d+$/.test(match[1])) {
                    return {
                        valid: true,
                        type: 'tweet',
                        tweetId: match[1],
                        normalizedUrl: `https://twitter.com/i/status/${match[1]}`
                    };
                }
            }
        }
        
        // Check for profile URL
        for (const pattern of TWITTER_URL_PATTERNS.profile) {
            const match = cleanUrl.match(pattern);
            if (match && match[1]) {
                const username = match[1].replace(/^@/, '');
                // Skip reserved words
                if (!['home', 'explore', 'notifications', 'messages', 'settings', 'i', 'search'].includes(username.toLowerCase())) {
                    return {
                        valid: true,
                        type: 'profile',
                        username: username,
                        normalizedUrl: `https://twitter.com/${username}`
                    };
                }
            }
        }
        
        // Check for search/hashtag URL
        for (const pattern of TWITTER_URL_PATTERNS.search) {
            const match = cleanUrl.match(pattern);
            if (match && match[1]) {
                return {
                    valid: true,
                    type: 'search',
                    query: decodeURIComponent(match[1]),
                    normalizedUrl: cleanUrl
                };
            }
        }
        
        return { valid: false, error: 'URL format not recognized as Twitter/X URL' };
    }
    
    /**
     * Get canonical URL
     * @param {string} url - Input URL
     * @returns {string} Canonical Twitter URL
     */
    getCanonicalUrl(url) {
        const info = this.getUrlType(url);
        return info.normalizedUrl || url;
    }
    
    // =========================================================================
    // CONTENT EXTRACTION
    // =========================================================================
    
    /**
     * Extract all content elements from text
     * @param {string} text - Tweet text
     * @returns {object} Extracted elements
     */
    extractContent(text) {
        if (!text) {
            return {
                hashtags: [],
                cashtags: [],
                mentions: [],
                urls: [],
                emojis: [],
                text: '',
                length: 0
            };
        }
        
        return {
            hashtags: this.extractHashtags(text),
            cashtags: this.extractCashtags(text),
            mentions: this.extractMentions(text),
            urls: this.extractUrls(text),
            emojis: this.extractEmojis(text),
            text: text,
            length: text.length,
            capsRatio: this.calculateCapsRatio(text),
            wordCount: text.split(/\s+/).filter(w => w.length > 0).length
        };
    }
    
    extractHashtags(text) {
        const matches = text.match(EXTRACTION_PATTERNS.hashtags) || [];
        return matches.map(h => h.substring(1).toLowerCase());
    }
    
    extractCashtags(text) {
        const matches = text.match(EXTRACTION_PATTERNS.cashtags) || [];
        return matches.map(c => c.substring(1).toUpperCase());
    }
    
    extractMentions(text) {
        const matches = text.match(EXTRACTION_PATTERNS.mentions) || [];
        return matches.map(m => m.substring(1).toLowerCase());
    }
    
    extractUrls(text) {
        return text.match(EXTRACTION_PATTERNS.urls) || [];
    }
    
    extractEmojis(text) {
        return text.match(EXTRACTION_PATTERNS.emojis) || [];
    }
    
    calculateCapsRatio(text) {
        const letters = text.replace(/[^a-zA-Z]/g, '');
        if (letters.length === 0) return 0;
        const caps = (text.match(/[A-Z]/g) || []).length;
        return Math.round((caps / letters.length) * 100) / 100;
    }
    
    // =========================================================================
    // TWEET DATA
    // =========================================================================
    
    /**
     * Get tweet data
     * @param {string} tweetId - Tweet ID
     * @returns {Promise<object>} Tweet data
     */
    async getTweetData(tweetId) {
        if (!tweetId) {
            return { exists: false, error: 'No tweet ID provided' };
        }
        
        // In demo mode, return simulated data
        if (this.demoMode) {
            return this.getDemoTweetData(tweetId);
        }
        
        // TODO: Real API call
        // return await this.fetchTweetFromApi(tweetId);
        
        return this.getDemoTweetData(tweetId);
    }
    
    /**
     * Demo tweet data generator
     */
    getDemoTweetData(tweetId) {
        // Simulate different scenarios based on tweet ID patterns
        const scenario = this.detectDemoScenario(tweetId);
        
        const baseData = {
            id: tweetId,
            exists: true,
            demo: true,
            platform: 'twitter',
            
            // Visibility flags
            tombstoned: false,
            ageRestricted: false,
            
            // Content (will be overridden with actual content if analyzing real text)
            content: {
                text: scenario.text || 'Demo tweet content for testing purposes. #tech #innovation',
                hashtags: scenario.hashtags || ['tech', 'innovation'],
                cashtags: scenario.cashtags || [],
                mentions: scenario.mentions || [],
                urls: scenario.urls || [],
                emojis: scenario.emojis || [],
                length: scenario.text?.length || 65
            },
            
            // Public metrics
            metrics: {
                likes: scenario.likes || 45,
                retweets: scenario.retweets || 12,
                replies: scenario.replies || 8,
                quotes: scenario.quotes || 3,
                impressions: null, // Owner-only
                profileClicks: null,
                urlClicks: null
            },
            
            // Content flags
            contentFlags: {
                possiblySensitive: scenario.sensitive || false,
                withheld: null
            },
            
            // Metadata
            createdAt: scenario.createdAt || new Date(Date.now() - 3600000).toISOString(),
            authorId: scenario.authorId || '12345678',
            conversationId: scenario.conversationId || tweetId,
            replySettings: scenario.replySettings || 'everyone',
            
            // Visibility assessment
            visibility: {
                directLink: true,
                onProfile: !scenario.tombstoned,
                inSearch: !scenario.searchHidden,
                inHashtagFeeds: !scenario.hashtagHidden,
                inCashtagFeeds: true,
                inRecommendations: !scenario.deranked,
                inReplies: true
            }
        };
        
        return baseData;
    }
    
    // =========================================================================
    // ACCOUNT DATA
    // =========================================================================
    
    /**
     * Get account data
     * @param {string} username - Twitter username
     * @returns {Promise<object>} Account data
     */
    async getAccountData(username) {
        if (!username) {
            return { exists: false, error: 'No username provided' };
        }
        
        const cleanUsername = username.replace(/^@/, '').toLowerCase();
        
        if (this.demoMode) {
            return this.getDemoAccountData(cleanUsername);
        }
        
        // TODO: Real API call
        return this.getDemoAccountData(cleanUsername);
    }
    
    /**
     * Demo account data generator
     */
    getDemoAccountData(username) {
        const scenario = this.detectDemoAccountScenario(username);
        
        return {
            username: username,
            displayName: scenario.displayName || `@${username}`,
            exists: true,
            demo: true,
            platform: 'twitter',
            
            // Account status
            suspended: scenario.suspended || false,
            protected: scenario.protected || false,
            verifiedType: scenario.verifiedType || 'none', // 'blue', 'business', 'government', 'none'
            
            // Account age
            createdAt: scenario.createdAt || '2020-01-15T00:00:00Z',
            accountAge: scenario.accountAge || this.calculateAccountAge('2020-01-15'),
            
            // Labels
            accountLabels: scenario.labels || [],
            
            // Public metrics
            followers: scenario.followers || 1250,
            following: scenario.following || 890,
            tweets: scenario.tweets || 3420,
            listed: scenario.listed || 15,
            
            // Engagement ratios
            engagementRatio: scenario.engagementRatio || 0.035,
            followerRatio: scenario.followers && scenario.following 
                ? (scenario.followers / scenario.following).toFixed(2) 
                : '1.40',
            
            // Owner-only metrics (null unless OAuth)
            ownedMetrics: {
                available: false,
                impressions: null,
                profileClicks: null,
                urlClicks: null
            },
            
            // Shadowban checks (these would come from external tests)
            searchBan: scenario.searchBan || false,
            searchSuggestionBan: scenario.searchSuggestionBan || false,
            ghostBan: scenario.ghostBan || false,
            replyDeboosting: scenario.replyDeboosting || false,
            suggestBan: scenario.suggestBan || false,
            
            // Rate limit status (simulated)
            rateLimitStatus: {
                remaining: 145,
                reset: Math.floor(Date.now() / 1000) + 900,
                limit: 150
            }
        };
    }
    
    calculateAccountAge(createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        return Math.floor((now - created) / (1000 * 60 * 60 * 24));
    }
    
    // =========================================================================
    // SHADOWBAN CHECKS
    // =========================================================================
    
    /**
     * Run shadowban tests for an account
     * @param {string} username - Twitter username
     * @returns {Promise<object>} Shadowban check results
     */
    async checkShadowban(username) {
        const cleanUsername = username.replace(/^@/, '');
        
        if (this.demoMode) {
            return this.getDemoShadowbanResults(cleanUsername);
        }
        
        // TODO: Implement real shadowban checks
        // These would involve:
        // 1. Search API queries to check visibility
        // 2. Incognito/logged-out comparison tests
        // 3. Reply visibility tests
        
        return this.getDemoShadowbanResults(cleanUsername);
    }
    
    getDemoShadowbanResults(username) {
        const scenario = this.detectDemoAccountScenario(username);
        
        return {
            username: username,
            timestamp: new Date().toISOString(),
            demo: true,
            
            checks: {
                searchBan: {
                    status: scenario.searchBan || false,
                    description: 'Account not appearing in search results',
                    severity: scenario.searchBan ? 'high' : 'none'
                },
                searchSuggestionBan: {
                    status: scenario.searchSuggestionBan || false,
                    description: 'Account not appearing in search suggestions',
                    severity: scenario.searchSuggestionBan ? 'medium' : 'none'
                },
                ghostBan: {
                    status: scenario.ghostBan || false,
                    description: 'Replies not visible to others',
                    severity: scenario.ghostBan ? 'high' : 'none'
                },
                replyDeboosting: {
                    status: scenario.replyDeboosting || false,
                    description: 'Replies hidden under "Show more replies"',
                    severity: scenario.replyDeboosting ? 'medium' : 'none'
                },
                suggestBan: {
                    status: scenario.suggestBan || false,
                    description: 'Account not suggested to others',
                    severity: scenario.suggestBan ? 'low' : 'none'
                }
            },
            
            summary: {
                anyBanDetected: scenario.searchBan || scenario.searchSuggestionBan || 
                               scenario.ghostBan || scenario.replyDeboosting || scenario.suggestBan,
                banCount: [scenario.searchBan, scenario.searchSuggestionBan, 
                          scenario.ghostBan, scenario.replyDeboosting, scenario.suggestBan]
                          .filter(Boolean).length,
                overallSeverity: scenario.searchBan || scenario.ghostBan ? 'high' :
                                scenario.searchSuggestionBan || scenario.replyDeboosting ? 'medium' :
                                scenario.suggestBan ? 'low' : 'none'
            }
        };
    }
    
    // =========================================================================
    // DEMO SCENARIO DETECTION
    // =========================================================================
    
    /**
     * Detect demo scenario based on tweet ID patterns
     */
    detectDemoScenario(tweetId) {
        const id = String(tweetId);
        
        // Scenario patterns (last digits)
        if (id.endsWith('111')) {
            // Banned hashtag scenario
            return {
                text: 'Follow me! #followback #f4f #teamfollowback for instant follows!',
                hashtags: ['followback', 'f4f', 'teamfollowback'],
                searchHidden: true,
                likes: 2,
                retweets: 0
            };
        }
        
        if (id.endsWith('222')) {
            // Link throttling scenario
            return {
                text: 'Check out my new article! https://bit.ly/mypost https://substack.com/article',
                urls: ['https://bit.ly/mypost', 'https://substack.com/article'],
                hashtags: ['tech'],
                deranked: true,
                likes: 15,
                retweets: 2
            };
        }
        
        if (id.endsWith('333')) {
            // Spam content scenario
            return {
                text: 'BUY NOW!!! FREE MONEY 💰💰💰 CLICK HERE guaranteed profits!!!',
                emojis: ['💰', '💰', '💰'],
                sensitive: true,
                searchHidden: true,
                hashtagHidden: true,
                likes: 0,
                retweets: 0
            };
        }
        
        if (id.endsWith('444')) {
            // Crypto spam scenario
            return {
                text: 'Get $BTC $ETH $DOGE now! 🚀🔥 Don\'t miss out! #crypto #nft #giveaway',
                cashtags: ['BTC', 'ETH', 'DOGE'],
                hashtags: ['crypto', 'nft', 'giveaway'],
                emojis: ['🚀', '🔥'],
                deranked: true,
                likes: 5,
                retweets: 1
            };
        }
        
        if (id.endsWith('000')) {
            // Clean/healthy scenario
            return {
                text: 'Just shared my thoughts on the latest tech trends. What do you think?',
                hashtags: ['tech'],
                mentions: [],
                likes: 89,
                retweets: 23,
                replies: 15
            };
        }
        
        // Default scenario
        return {
            text: 'Demo tweet for testing. #test',
            hashtags: ['test']
        };
    }
    
    /**
     * Detect demo scenario based on username patterns
     */
    detectDemoAccountScenario(username) {
        const lower = username.toLowerCase();
        
        if (lower.includes('banned') || lower.includes('suspended')) {
            return {
                suspended: true,
                followers: 0,
                following: 0
            };
        }
        
        if (lower.includes('shadowban') || lower.includes('shadow')) {
            return {
                searchBan: true,
                searchSuggestionBan: true,
                followers: 500,
                displayName: 'Shadowbanned User'
            };
        }
        
        if (lower.includes('ghost')) {
            return {
                ghostBan: true,
                replyDeboosting: true,
                followers: 200
            };
        }
        
        if (lower.includes('spam') || lower.includes('bot')) {
            return {
                searchSuggestionBan: true,
                suggestBan: true,
                followers: 50,
                following: 5000,
                engagementRatio: 0.001
            };
        }
        
        if (lower.includes('verified') || lower.includes('official')) {
            return {
                verifiedType: 'blue',
                followers: 50000,
                following: 500,
                displayName: 'Verified User ✓'
            };
        }
        
        if (lower.includes('clean') || lower.includes('healthy')) {
            return {
                followers: 2500,
                following: 800,
                engagementRatio: 0.045,
                displayName: 'Healthy Account'
            };
        }
        
        // Default
        return {};
    }
    
    // =========================================================================
    // PLATFORM INFO
    // =========================================================================
    
    /**
     * Get platform configuration
     */
    getConfig() {
        return {
            id: this.id,
            name: this.name,
            version: this.version,
            modules: this.modules,
            totalModules: this.totalModules,
            apiVersion: this.apiVersion,
            rateLimits: this.rateLimits,
            demoMode: this.demoMode,
            
            signalSupport: {
                hashtags: true,
                cashtags: true,
                links: true,
                content: true,
                mentions: true,
                emojis: true
            },
            
            shadowbanTypes: [
                'searchBan',
                'searchSuggestionBan', 
                'ghostBan',
                'replyDeboosting',
                'suggestBan'
            ]
        };
    }
    
    /**
     * Set demo mode
     */
    setDemoMode(enabled) {
        this.demoMode = !!enabled;
    }
}

// =============================================================================
// FACTORY REGISTRATION
// =============================================================================

// Create singleton instance
const twitterPlatform = new TwitterPlatform();

// Register with PlatformFactory if available
if (window.PlatformFactory) {
    window.PlatformFactory.register('twitter', twitterPlatform);
    window.PlatformFactory.register('x', twitterPlatform); // Alias
}

// Export
window.TwitterPlatform = TwitterPlatform;
window.twitterPlatform = twitterPlatform;

// =============================================================================
// INITIALIZATION
// =============================================================================

console.log('✅ Twitter Platform loaded');
console.log('   Modules:', twitterPlatform.totalModules, '- Hashtags:', twitterPlatform.modules.hashtags,
            'Cashtags:', twitterPlatform.modules.cashtags, 'Links:', twitterPlatform.modules.links,
            'Content:', twitterPlatform.modules.content, 'Mentions:', twitterPlatform.modules.mentions,
            'Emojis:', twitterPlatform.modules.emojis);

})();
