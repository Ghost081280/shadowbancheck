/* =============================================================================
   REDDIT.JS - Reddit Platform Handler
   ShadowBanCheck.io
   
   Comprehensive Reddit data collection and analysis.
   
   From Master Engine Spec:
   - Platform modules: 14 total (hashtags:0, cashtags:0, links:4, content:4, mentions:3, emojis:3)
   - NO hashtag or cashtag support (Reddit doesn't use them)
   - Shadowban types: account shadowban, subreddit ban, post removal
   - AutoMod triggers: account age, karma, link shorteners, self-promotion ratio
   
   API Endpoints Supported:
   - GET /user/{username}/about
   - GET /r/{subreddit}/about
   - GET /api/info?id=t3_xxx
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// REDDIT URL PATTERNS
// =============================================================================

const REDDIT_URL_PATTERNS = {
    // Post URLs
    post: [
        /(?:reddit\.com|redd\.it)\/r\/(\w+)\/comments\/(\w+)(?:\/([^\/\?]+))?/i,
        /redd\.it\/(\w+)/i  // Short URL (post ID only)
    ],
    
    // User URLs
    user: [
        /reddit\.com\/u(?:ser)?\/(\w+)/i
    ],
    
    // Subreddit URLs
    subreddit: [
        /reddit\.com\/r\/(\w+)\/?$/i,
        /reddit\.com\/r\/(\w+)\/(?:new|hot|top|rising)/i
    ],
    
    // Comment URLs
    comment: [
        /reddit\.com\/r\/(\w+)\/comments\/(\w+)\/[^\/]+\/(\w+)/i
    ]
};

// =============================================================================
// CONTENT EXTRACTION PATTERNS (Reddit-specific)
// =============================================================================

const EXTRACTION_PATTERNS = {
    // Reddit uses u/ for mentions, not @
    mentions: /(?:^|\s)u\/(\w+)/gi,
    urls: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi,
    emojis: /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu,
    // Reddit markdown links
    markdownLinks: /\[([^\]]+)\]\(([^)]+)\)/g,
    // Subreddit references
    subredditRefs: /(?:^|\s)r\/(\w+)/gi
};

// =============================================================================
// AUTOMOD TRIGGERS (from master spec)
// =============================================================================

const AUTOMOD_TRIGGERS = {
    accountAge: {
        threshold: 7, // days
        action: 'auto-remove or flag'
    },
    karma: {
        threshold: 10, // varies by subreddit, 10-100
        action: 'auto-remove'
    },
    linkShorteners: {
        flagged: ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly'],
        action: 'auto-remove'
    },
    selfPromotion: {
        maxRatio: 0.10, // Max 10% self-promotional content
        consequence: 'spam flag'
    },
    repeatedDomain: {
        trigger: 'Same domain posted multiple times',
        action: 'spam flag'
    }
};

// =============================================================================
// REDDIT PLATFORM CLASS
// =============================================================================

class RedditPlatform {
    
    constructor() {
        this.id = 'reddit';
        this.name = 'Reddit';
        this.version = '2.0.0';
        this.demoMode = true;
        
        // Module configuration from master spec
        // Reddit has NO hashtags or cashtags
        this.modules = {
            hashtags: 0,
            cashtags: 0,
            links: 4,
            content: 4,
            mentions: 3,
            emojis: 3
        };
        this.totalModules = 14;
        
        // AutoMod configuration
        this.automodTriggers = AUTOMOD_TRIGGERS;
    }
    
    // =========================================================================
    // URL PARSING
    // =========================================================================
    
    /**
     * Detect URL type and extract identifiers
     * @param {string} url - Reddit URL
     * @returns {object} URL info
     */
    getUrlType(url) {
        if (!url) {
            return { valid: false, error: 'No URL provided' };
        }
        
        const cleanUrl = url.trim();
        
        // Check for post URL
        for (const pattern of REDDIT_URL_PATTERNS.post) {
            const match = cleanUrl.match(pattern);
            if (match) {
                // Full post URL: subreddit + post ID
                if (match[2]) {
                    return {
                        valid: true,
                        type: 'post',
                        subreddit: match[1],
                        postId: match[2],
                        slug: match[3] || null,
                        normalizedUrl: `https://reddit.com/r/${match[1]}/comments/${match[2]}`
                    };
                }
                // Short URL: just post ID
                if (match[1] && !match[2]) {
                    return {
                        valid: true,
                        type: 'post',
                        postId: match[1],
                        normalizedUrl: `https://redd.it/${match[1]}`
                    };
                }
            }
        }
        
        // Check for comment URL
        for (const pattern of REDDIT_URL_PATTERNS.comment) {
            const match = cleanUrl.match(pattern);
            if (match) {
                return {
                    valid: true,
                    type: 'comment',
                    subreddit: match[1],
                    postId: match[2],
                    commentId: match[3],
                    normalizedUrl: cleanUrl
                };
            }
        }
        
        // Check for user URL
        for (const pattern of REDDIT_URL_PATTERNS.user) {
            const match = cleanUrl.match(pattern);
            if (match && match[1]) {
                return {
                    valid: true,
                    type: 'user',
                    username: match[1],
                    normalizedUrl: `https://reddit.com/u/${match[1]}`
                };
            }
        }
        
        // Check for subreddit URL
        for (const pattern of REDDIT_URL_PATTERNS.subreddit) {
            const match = cleanUrl.match(pattern);
            if (match && match[1]) {
                return {
                    valid: true,
                    type: 'subreddit',
                    subreddit: match[1],
                    normalizedUrl: `https://reddit.com/r/${match[1]}`
                };
            }
        }
        
        return { valid: false, error: 'URL format not recognized as Reddit URL' };
    }
    
    /**
     * Get canonical URL
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
     * @param {string} text - Post/comment text
     * @returns {object} Extracted elements
     */
    extractContent(text) {
        if (!text) {
            return {
                hashtags: [],  // Always empty for Reddit
                cashtags: [],  // Always empty for Reddit
                mentions: [],
                urls: [],
                emojis: [],
                subredditRefs: [],
                text: '',
                length: 0
            };
        }
        
        return {
            hashtags: [],  // Reddit doesn't use hashtags
            cashtags: [],  // Reddit doesn't use cashtags
            mentions: this.extractMentions(text),
            urls: this.extractUrls(text),
            emojis: this.extractEmojis(text),
            subredditRefs: this.extractSubredditRefs(text),
            markdownLinks: this.extractMarkdownLinks(text),
            text: text,
            length: text.length,
            wordCount: text.split(/\s+/).filter(w => w.length > 0).length
        };
    }
    
    extractMentions(text) {
        const matches = [];
        let match;
        const pattern = new RegExp(EXTRACTION_PATTERNS.mentions.source, 'gi');
        while ((match = pattern.exec(text)) !== null) {
            matches.push(match[1].toLowerCase());
        }
        return [...new Set(matches)]; // Deduplicate
    }
    
    extractUrls(text) {
        return text.match(EXTRACTION_PATTERNS.urls) || [];
    }
    
    extractEmojis(text) {
        return text.match(EXTRACTION_PATTERNS.emojis) || [];
    }
    
    extractSubredditRefs(text) {
        const matches = [];
        let match;
        const pattern = new RegExp(EXTRACTION_PATTERNS.subredditRefs.source, 'gi');
        while ((match = pattern.exec(text)) !== null) {
            matches.push(match[1].toLowerCase());
        }
        return [...new Set(matches)];
    }
    
    extractMarkdownLinks(text) {
        const links = [];
        let match;
        const pattern = new RegExp(EXTRACTION_PATTERNS.markdownLinks.source, 'g');
        while ((match = pattern.exec(text)) !== null) {
            links.push({ text: match[1], url: match[2] });
        }
        return links;
    }
    
    // =========================================================================
    // POST DATA
    // =========================================================================
    
    /**
     * Get post data
     * @param {string} postId - Reddit post ID
     * @returns {Promise<object>} Post data
     */
    async getPostData(postId) {
        if (!postId) {
            return { exists: false, error: 'No post ID provided' };
        }
        
        if (this.demoMode) {
            return this.getDemoPostData(postId);
        }
        
        // TODO: Real API call
        return this.getDemoPostData(postId);
    }
    
    /**
     * Demo post data generator
     */
    getDemoPostData(postId) {
        const scenario = this.detectDemoScenario(postId);
        
        return {
            id: postId,
            fullname: `t3_${postId}`,
            exists: true,
            demo: true,
            platform: 'reddit',
            
            // Post info
            subreddit: scenario.subreddit || 'technology',
            title: scenario.title || 'Demo Post Title',
            
            // Content
            content: {
                title: scenario.title || 'Demo Post Title',
                body: scenario.body || 'This is a demo post body for testing purposes.',
                urls: scenario.urls || [],
                mentions: scenario.mentions || [],
                emojis: scenario.emojis || [],
                subredditRefs: scenario.subredditRefs || [],
                isText: scenario.isText !== false,
                isLink: scenario.isLink || false,
                externalUrl: scenario.externalUrl || null
            },
            
            // Removal status (Reddit-specific)
            removed: scenario.removed || false,
            removedBy: scenario.removedBy || null, // 'automod', 'moderator', 'admin', 'spam', 'anti_evil_ops'
            removedReason: scenario.removedReason || null,
            spam: scenario.spam || false,
            
            // Visibility
            visibility: {
                inSubreddit: !scenario.removed,
                inRAll: !scenario.removed && !scenario.quarantined,
                inSearch: !scenario.removed,
                onProfile: !scenario.removed
            },
            
            // Metrics
            metrics: {
                score: scenario.score || 45,
                upvoteRatio: scenario.upvoteRatio || 0.89,
                comments: scenario.comments || 12,
                crosspostCount: scenario.crossposts || 0,
                awards: scenario.awards || 0
            },
            
            // Flags
            nsfw: scenario.nsfw || false,
            spoiler: scenario.spoiler || false,
            locked: scenario.locked || false,
            archived: scenario.archived || false,
            quarantined: scenario.quarantined || false,
            
            // Timestamps
            createdAt: scenario.createdAt || new Date(Date.now() - 7200000).toISOString()
        };
    }
    
    // =========================================================================
    // ACCOUNT DATA
    // =========================================================================
    
    /**
     * Get account data
     * @param {string} username - Reddit username
     * @returns {Promise<object>} Account data
     */
    async getAccountData(username) {
        if (!username) {
            return { exists: false, error: 'No username provided' };
        }
        
        const cleanUsername = username.replace(/^u\//, '').toLowerCase();
        
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
        
        const createdDate = scenario.createdAt || '2021-06-15T00:00:00Z';
        const accountAgeDays = this.calculateAccountAge(createdDate);
        
        return {
            username: username,
            exists: true,
            demo: true,
            platform: 'reddit',
            
            // Account status
            suspended: scenario.suspended || false,
            shadowbanned: scenario.shadowbanned || false,
            
            // Karma breakdown
            linkKarma: scenario.linkKarma || 1250,
            commentKarma: scenario.commentKarma || 8900,
            totalKarma: (scenario.linkKarma || 1250) + (scenario.commentKarma || 8900),
            awardeeKarma: scenario.awardeeKarma || 150,
            awarderKarma: scenario.awarderKarma || 50,
            
            // Account age
            createdAt: createdDate,
            accountAge: accountAgeDays,
            
            // Account features
            isPremium: scenario.isPremium || false,
            hasVerifiedEmail: scenario.hasVerifiedEmail !== false,
            isMod: scenario.isMod || false,
            
            // Self-promotion analysis
            selfPromotionRatio: scenario.selfPromotionRatio || 0.05,
            domainDistribution: scenario.domainDistribution || {},
            
            // Subreddit bans (would need to check each subreddit)
            knownBans: scenario.knownBans || [],
            
            // AutoMod risk assessment
            automodRisk: {
                accountAge: accountAgeDays < 7 ? 'high' : accountAgeDays < 30 ? 'medium' : 'low',
                karma: (scenario.totalKarma || 10150) < 10 ? 'high' : 
                       (scenario.totalKarma || 10150) < 100 ? 'medium' : 'low',
                selfPromotion: (scenario.selfPromotionRatio || 0.05) > 0.10 ? 'high' : 'low'
            }
        };
    }
    
    calculateAccountAge(createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        return Math.floor((now - created) / (1000 * 60 * 60 * 24));
    }
    
    // =========================================================================
    // SUBREDDIT DATA
    // =========================================================================
    
    /**
     * Get subreddit data
     * @param {string} subreddit - Subreddit name
     * @returns {Promise<object>} Subreddit data
     */
    async getSubredditData(subreddit) {
        if (!subreddit) {
            return { exists: false, error: 'No subreddit provided' };
        }
        
        const cleanName = subreddit.replace(/^r\//, '').toLowerCase();
        
        if (this.demoMode) {
            return this.getDemoSubredditData(cleanName);
        }
        
        return this.getDemoSubredditData(cleanName);
    }
    
    getDemoSubredditData(subreddit) {
        return {
            name: subreddit,
            exists: true,
            demo: true,
            
            // Status
            quarantined: subreddit.includes('quarantine'),
            nsfw: subreddit.includes('nsfw') || subreddit.includes('adult'),
            private: subreddit.includes('private'),
            
            // Metrics
            subscribers: 125000,
            activeUsers: 450,
            
            // Rules
            hasAutoMod: true,
            minKarma: 10,
            minAccountAge: 7,
            allowsSelfPromotion: false,
            
            // Description
            description: `Demo subreddit: r/${subreddit}`
        };
    }
    
    // =========================================================================
    // SHADOWBAN CHECK
    // =========================================================================
    
    /**
     * Check if account is shadowbanned
     * @param {string} username - Reddit username
     * @returns {Promise<object>} Shadowban status
     */
    async checkShadowban(username) {
        const cleanUsername = username.replace(/^u\//, '');
        
        if (this.demoMode) {
            return this.getDemoShadowbanResults(cleanUsername);
        }
        
        // Real check would:
        // 1. Try to access user page - 404 = shadowbanned
        // 2. Check if posts appear in subreddit/new
        // 3. Check if profile is visible logged out
        
        return this.getDemoShadowbanResults(cleanUsername);
    }
    
    getDemoShadowbanResults(username) {
        const scenario = this.detectDemoAccountScenario(username);
        
        return {
            username: username,
            timestamp: new Date().toISOString(),
            demo: true,
            
            checks: {
                accountShadowban: {
                    status: scenario.shadowbanned || false,
                    description: 'Account not visible to other users',
                    severity: scenario.shadowbanned ? 'critical' : 'none',
                    test: 'Profile accessible from logged-out browser'
                },
                postVisibility: {
                    status: scenario.postsHidden || false,
                    description: 'Posts not appearing in subreddit feeds',
                    severity: scenario.postsHidden ? 'high' : 'none'
                },
                commentVisibility: {
                    status: scenario.commentsHidden || false,
                    description: 'Comments not visible to others',
                    severity: scenario.commentsHidden ? 'high' : 'none'
                }
            },
            
            automodStatus: {
                likelyFiltered: scenario.likelyFiltered || false,
                reasons: scenario.filterReasons || []
            },
            
            summary: {
                shadowbanned: scenario.shadowbanned || false,
                filtered: scenario.likelyFiltered || false,
                overallStatus: scenario.shadowbanned ? 'shadowbanned' :
                              scenario.likelyFiltered ? 'filtered' : 'clear'
            }
        };
    }
    
    // =========================================================================
    // AUTOMOD ANALYSIS
    // =========================================================================
    
    /**
     * Analyze content for AutoMod triggers
     * @param {object} content - Content to analyze
     * @param {object} account - Account data
     * @returns {object} AutoMod risk assessment
     */
    analyzeAutoModRisk(content, account) {
        const risks = [];
        let riskScore = 0;
        
        // Check account age
        if (account && account.accountAge < AUTOMOD_TRIGGERS.accountAge.threshold) {
            risks.push({
                trigger: 'account_age',
                message: `Account is ${account.accountAge} days old (threshold: ${AUTOMOD_TRIGGERS.accountAge.threshold})`,
                severity: 'high',
                impact: 30
            });
            riskScore += 30;
        }
        
        // Check karma
        if (account && account.totalKarma < AUTOMOD_TRIGGERS.karma.threshold) {
            risks.push({
                trigger: 'low_karma',
                message: `Total karma is ${account.totalKarma} (many subreddits require ${AUTOMOD_TRIGGERS.karma.threshold}+)`,
                severity: 'medium',
                impact: 20
            });
            riskScore += 20;
        }
        
        // Check for link shorteners
        if (content && content.urls) {
            for (const url of content.urls) {
                const lower = url.toLowerCase();
                for (const shortener of AUTOMOD_TRIGGERS.linkShorteners.flagged) {
                    if (lower.includes(shortener)) {
                        risks.push({
                            trigger: 'link_shortener',
                            message: `Link shortener detected: ${shortener}`,
                            severity: 'high',
                            impact: 25,
                            url: url
                        });
                        riskScore += 25;
                        break;
                    }
                }
            }
        }
        
        // Check self-promotion ratio
        if (account && account.selfPromotionRatio > AUTOMOD_TRIGGERS.selfPromotion.maxRatio) {
            risks.push({
                trigger: 'self_promotion',
                message: `Self-promotion ratio is ${(account.selfPromotionRatio * 100).toFixed(1)}% (max: 10%)`,
                severity: 'high',
                impact: 35
            });
            riskScore += 35;
        }
        
        return {
            riskScore: Math.min(100, riskScore),
            risks: risks,
            likelyFiltered: riskScore >= 30,
            severity: riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low'
        };
    }
    
    // =========================================================================
    // DEMO SCENARIO DETECTION
    // =========================================================================
    
    detectDemoScenario(postId) {
        const id = String(postId).toLowerCase();
        
        if (id.includes('removed') || id.endsWith('111')) {
            return {
                removed: true,
                removedBy: 'moderator',
                removedReason: 'Rule violation',
                title: 'This post was removed',
                score: 0
            };
        }
        
        if (id.includes('spam') || id.endsWith('222')) {
            return {
                removed: true,
                removedBy: 'spam',
                spam: true,
                title: 'Spam post detected',
                body: 'BUY NOW! Check out bit.ly/spam-link for deals!',
                urls: ['https://bit.ly/spam-link'],
                score: 0
            };
        }
        
        if (id.includes('automod') || id.endsWith('333')) {
            return {
                removed: true,
                removedBy: 'automod',
                removedReason: 'Account too new',
                title: 'Post filtered by AutoMod'
            };
        }
        
        if (id.includes('quarantine') || id.endsWith('444')) {
            return {
                quarantined: true,
                title: 'Post in quarantined subreddit',
                subreddit: 'quarantined_sub'
            };
        }
        
        // Default - healthy post
        return {
            title: 'Demo Reddit Post',
            body: 'This is a test post for r/technology',
            subreddit: 'technology',
            score: 125,
            comments: 23
        };
    }
    
    detectDemoAccountScenario(username) {
        const lower = username.toLowerCase();
        
        if (lower.includes('shadowban') || lower.includes('banned')) {
            return {
                shadowbanned: true,
                linkKarma: 0,
                commentKarma: 0
            };
        }
        
        if (lower.includes('new') || lower.includes('fresh')) {
            return {
                accountAge: 3,
                linkKarma: 5,
                commentKarma: 10,
                likelyFiltered: true,
                filterReasons: ['Account too new', 'Low karma']
            };
        }
        
        if (lower.includes('spam') || lower.includes('promo')) {
            return {
                selfPromotionRatio: 0.45,
                likelyFiltered: true,
                filterReasons: ['High self-promotion ratio']
            };
        }
        
        if (lower.includes('trusted') || lower.includes('veteran')) {
            return {
                accountAge: 1200,
                linkKarma: 25000,
                commentKarma: 85000,
                isPremium: true,
                isMod: true
            };
        }
        
        // Default
        return {};
    }
    
    // =========================================================================
    // PLATFORM INFO
    // =========================================================================
    
    getConfig() {
        return {
            id: this.id,
            name: this.name,
            version: this.version,
            modules: this.modules,
            totalModules: this.totalModules,
            demoMode: this.demoMode,
            
            signalSupport: {
                hashtags: false,  // Reddit doesn't use hashtags
                cashtags: false,  // Reddit doesn't use cashtags
                links: true,
                content: true,
                mentions: true,
                emojis: true
            },
            
            automodTriggers: Object.keys(AUTOMOD_TRIGGERS),
            
            removalTypes: [
                'automod',
                'moderator', 
                'admin',
                'spam',
                'anti_evil_ops'
            ]
        };
    }
    
    setDemoMode(enabled) {
        this.demoMode = !!enabled;
    }
}

// =============================================================================
// FACTORY REGISTRATION
// =============================================================================

const redditPlatform = new RedditPlatform();

if (window.PlatformFactory) {
    window.PlatformFactory.register('reddit', redditPlatform);
}

window.RedditPlatform = RedditPlatform;
window.redditPlatform = redditPlatform;

// =============================================================================
// INITIALIZATION
// =============================================================================

console.log('✅ Reddit Platform loaded');
console.log('   Modules:', redditPlatform.totalModules, '- NO hashtags/cashtags,',
            'Links:', redditPlatform.modules.links,
            'Content:', redditPlatform.modules.content,
            'Mentions:', redditPlatform.modules.mentions,
            'Emojis:', redditPlatform.modules.emojis);

})();
