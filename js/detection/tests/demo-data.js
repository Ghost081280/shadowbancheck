/* =============================================================================
   DEMO-DATA.JS - Demo Scenarios for 5-Factor Engine Testing
   ShadowBanCheck.io
   
   Location: js/detection/tests/demo-data.js
   
   Contains:
   - Demo users (various shadowban states)
   - Demo posts (various issues)
   - Demo API responses
   - Platform-specific test scenarios
   
   Usage:
   - Engine calls DemoData.getUser(username, platform)
   - Returns simulated API response based on username patterns
   
   When ready for production:
   - Replace DemoData calls with real API calls
   - Keep this file for regression testing
   
   Last Updated: 2025-12-03
   ============================================================================= */

(function() {
'use strict';

// =============================================================================
// DEMO USERS - Various shadowban states
// =============================================================================

const DEMO_USERS = {
    twitter: {
        // CLEAN ACCOUNTS
        'healthy_user': {
            exists: true,
            suspended: false,
            protected: false,
            verifiedType: 'blue',
            accountAge: 1245,
            followers: 12500,
            following: 890,
            tweets: 3420,
            listed: 45,
            engagementRate: 3.2,
            shadowbanStatus: {
                searchBan: false,
                searchSuggestionBan: false,
                ghostBan: false,
                replyDeboosting: false
            },
            visibility: {
                inSearch: true,
                inSuggestions: true,
                repliesVisible: true,
                onProfile: true
            }
        },
        
        'verified_creator': {
            exists: true,
            suspended: false,
            protected: false,
            verifiedType: 'blue',
            accountAge: 2100,
            followers: 85000,
            following: 1200,
            tweets: 15000,
            listed: 320,
            engagementRate: 2.8,
            shadowbanStatus: {
                searchBan: false,
                searchSuggestionBan: false,
                ghostBan: false,
                replyDeboosting: false
            },
            visibility: {
                inSearch: true,
                inSuggestions: true,
                repliesVisible: true,
                onProfile: true
            }
        },
        
        // SHADOWBANNED ACCOUNTS
        'shadowbanned_user': {
            exists: true,
            suspended: false,
            protected: false,
            verifiedType: 'none',
            accountAge: 456,
            followers: 2300,
            following: 1800,
            tweets: 890,
            listed: 5,
            engagementRate: 0.3,
            shadowbanStatus: {
                searchBan: true,
                searchSuggestionBan: true,
                ghostBan: false,
                replyDeboosting: true
            },
            visibility: {
                inSearch: false,
                inSuggestions: false,
                repliesVisible: true,
                onProfile: true
            },
            reason: 'Multiple spam reports + banned hashtag usage'
        },
        
        'ghost_banned': {
            exists: true,
            suspended: false,
            protected: false,
            verifiedType: 'none',
            accountAge: 234,
            followers: 890,
            following: 2100,
            tweets: 2340,
            listed: 2,
            engagementRate: 0.1,
            shadowbanStatus: {
                searchBan: false,
                searchSuggestionBan: false,
                ghostBan: true,
                replyDeboosting: true
            },
            visibility: {
                inSearch: true,
                inSuggestions: false,
                repliesVisible: false,
                onProfile: true
            },
            reason: 'Aggressive reply behavior detected'
        },
        
        'search_suggestion_ban': {
            exists: true,
            suspended: false,
            protected: false,
            verifiedType: 'none',
            accountAge: 567,
            followers: 4500,
            following: 890,
            tweets: 1200,
            listed: 12,
            engagementRate: 1.2,
            shadowbanStatus: {
                searchBan: false,
                searchSuggestionBan: true,
                ghostBan: false,
                replyDeboosting: false
            },
            visibility: {
                inSearch: true,
                inSuggestions: false,
                repliesVisible: true,
                onProfile: true
            },
            reason: 'Not appearing in search suggestions'
        },
        
        // SPAM/BOT ACCOUNTS
        'spambot123': {
            exists: true,
            suspended: false,
            protected: false,
            verifiedType: 'none',
            accountAge: 14,
            followers: 50,
            following: 4500,
            tweets: 890,
            listed: 0,
            engagementRate: 0.01,
            shadowbanStatus: {
                searchBan: true,
                searchSuggestionBan: true,
                ghostBan: true,
                replyDeboosting: true
            },
            visibility: {
                inSearch: false,
                inSuggestions: false,
                repliesVisible: false,
                onProfile: true
            },
            flags: ['bot_pattern', 'mass_following', 'spam_behavior']
        },
        
        'followback_king': {
            exists: true,
            suspended: false,
            protected: false,
            verifiedType: 'none',
            accountAge: 89,
            followers: 12000,
            following: 11800,
            tweets: 3400,
            listed: 3,
            engagementRate: 0.05,
            shadowbanStatus: {
                searchBan: true,
                searchSuggestionBan: true,
                ghostBan: false,
                replyDeboosting: true
            },
            visibility: {
                inSearch: false,
                inSuggestions: false,
                repliesVisible: true,
                onProfile: true
            },
            flags: ['follow_churn', 'engagement_spam']
        },
        
        // SUSPENDED ACCOUNTS
        'suspended_account': {
            exists: true,
            suspended: true,
            protected: false,
            verifiedType: 'none',
            accountAge: null,
            followers: null,
            following: null,
            tweets: null,
            listed: null,
            reason: 'Violating Twitter Rules'
        },
        
        // PROTECTED/PRIVATE ACCOUNTS
        'private_user': {
            exists: true,
            suspended: false,
            protected: true,
            verifiedType: 'none',
            accountAge: 890,
            followers: 234,
            following: 456,
            tweets: 1200,
            listed: 0
        },
        
        // NON-EXISTENT
        'doesnt_exist_12345': {
            exists: false
        }
    },
    
    reddit: {
        // HEALTHY ACCOUNTS
        'healthy_redditor': {
            exists: true,
            suspended: false,
            shadowbanned: false,
            accountAge: 1825,
            linkKarma: 45000,
            commentKarma: 123000,
            totalKarma: 168000,
            isPremium: true,
            hasVerifiedEmail: true,
            isMod: true,
            modOf: ['r/programming', 'r/webdev'],
            trophies: ['verified_email', 'four_year_club']
        },
        
        // NEW ACCOUNTS (AutoMod triggers)
        'newuser_promo': {
            exists: true,
            suspended: false,
            shadowbanned: false,
            accountAge: 3,
            linkKarma: 1,
            commentKarma: 14,
            totalKarma: 15,
            isPremium: false,
            hasVerifiedEmail: false,
            isMod: false,
            autoModRisk: {
                level: 'high',
                triggers: ['new_account', 'low_karma', 'no_verified_email']
            }
        },
        
        'karma_farmer': {
            exists: true,
            suspended: false,
            shadowbanned: false,
            accountAge: 30,
            linkKarma: 50,
            commentKarma: 80,
            totalKarma: 130,
            isPremium: false,
            hasVerifiedEmail: true,
            isMod: false,
            flags: ['repost_pattern', 'karma_farming']
        },
        
        // SHADOWBANNED
        'shadowbanned_reddit': {
            exists: true,
            suspended: false,
            shadowbanned: true,
            accountAge: 234,
            reason: 'Spam behavior detected',
            visibility: {
                profileVisible: false,
                postsVisible: false,
                commentsVisible: false
            }
        },
        
        // SUSPENDED
        'suspended_redditor': {
            exists: true,
            suspended: true,
            reason: 'Multiple community guideline violations'
        }
    },
    
    instagram: {
        'healthy_influencer': {
            exists: true,
            isPrivate: false,
            isVerified: true,
            followers: 125000,
            following: 890,
            posts: 1456,
            engagementRate: 4.2,
            shadowbanStatus: {
                hashtagBan: false,
                exploreBan: false,
                actionBlock: false
            }
        },
        
        'shadowbanned_ig': {
            exists: true,
            isPrivate: false,
            isVerified: false,
            followers: 8900,
            following: 1200,
            posts: 456,
            engagementRate: 0.8,
            shadowbanStatus: {
                hashtagBan: true,
                exploreBan: true,
                actionBlock: false
            },
            reason: 'Used multiple banned hashtags'
        }
    }
};

// =============================================================================
// DEMO POSTS - Various content issues
// =============================================================================

const DEMO_POSTS = {
    twitter: {
        // Clean posts (ID ends in 000)
        '1234567890000': {
            exists: true,
            tombstoned: false,
            ageRestricted: false,
            author: 'healthy_user',
            text: 'Just had an amazing day at the beach! The sunset was incredible. #nature #photography',
            metrics: {
                likes: 234,
                retweets: 45,
                replies: 12,
                quotes: 3,
                impressions: 15000
            },
            contentFlags: {
                possiblySensitive: false,
                withheld: null
            },
            visibility: {
                inSearch: true,
                inHashtags: true,
                onProfile: true
            }
        },
        
        // Spam content (ID ends in 111)
        '1234567890111': {
            exists: true,
            tombstoned: false,
            ageRestricted: false,
            author: 'spambot123',
            text: 'Follow me! #followback #f4f #teamfollowback! BUY NOW! 💰🚀🔥',
            metrics: {
                likes: 2,
                retweets: 0,
                replies: 0,
                quotes: 0,
                impressions: 50
            },
            contentFlags: {
                possiblySensitive: false,
                withheld: null
            },
            visibility: {
                inSearch: false,
                inHashtags: false,
                onProfile: true
            },
            issues: ['banned_hashtags', 'spam_content', 'risky_emojis']
        },
        
        // Throttled links (ID ends in 222)
        '1234567890222': {
            exists: true,
            tombstoned: false,
            ageRestricted: false,
            author: 'healthy_user',
            text: 'Check out my new article! https://substack.com/myarticle #writing',
            metrics: {
                likes: 45,
                retweets: 12,
                replies: 5,
                quotes: 2,
                impressions: 3000
            },
            contentFlags: {
                possiblySensitive: false,
                withheld: null
            },
            visibility: {
                inSearch: true,
                inHashtags: true,
                onProfile: true
            },
            linkThrottling: {
                detected: true,
                domain: 'substack.com',
                delay: 2544
            }
        },
        
        // Content flagged as sensitive (ID ends in 333)
        '1234567890333': {
            exists: true,
            tombstoned: false,
            ageRestricted: false,
            author: 'healthy_user',
            text: 'Important thread about adult content policies...',
            metrics: {
                likes: 123,
                retweets: 34,
                replies: 56,
                quotes: 8,
                impressions: 8000
            },
            contentFlags: {
                possiblySensitive: true,
                withheld: null
            },
            visibility: {
                inSearch: true,
                inHashtags: false,
                onProfile: true
            }
        },
        
        // Crypto spam (ID ends in 444)
        '1234567890444': {
            exists: true,
            tombstoned: false,
            ageRestricted: false,
            author: 'crypto_spammer',
            text: '$BTC to the moon! 🚀🚀🚀 Double your money! FREE BITCOIN GIVEAWAY! #crypto #airdrop',
            metrics: {
                likes: 5,
                retweets: 2,
                replies: 0,
                quotes: 0,
                impressions: 100
            },
            contentFlags: {
                possiblySensitive: false,
                withheld: null
            },
            visibility: {
                inSearch: false,
                inHashtags: false,
                onProfile: true
            },
            issues: ['crypto_spam', 'scam_patterns', 'risky_emojis']
        },
        
        // Removed/tombstoned post (ID ends in 555)
        '1234567890555': {
            exists: true,
            tombstoned: true,
            reason: 'This Tweet violated the Twitter Rules',
            visibility: {
                inSearch: false,
                inHashtags: false,
                onProfile: false
            }
        },
        
        // Non-existent post (ID ends in 999)
        '1234567890999': {
            exists: false
        }
    },
    
    reddit: {
        // Clean post
        'abc000': {
            exists: true,
            removed: false,
            spam: false,
            author: 'healthy_redditor',
            subreddit: 'programming',
            title: 'Best practices for error handling in JavaScript',
            score: 456,
            upvoteRatio: 0.94,
            comments: 78,
            visibility: {
                inSubreddit: true,
                inRAll: true,
                inSearch: true,
                onProfile: true
            }
        },
        
        // AutoMod filtered (ID ends in 333)
        'abc333': {
            exists: true,
            removed: true,
            removedBy: 'automod',
            removedReason: 'Account too new / Low karma',
            spam: false,
            author: 'newuser_promo',
            subreddit: 'webdev',
            title: 'Check out my new project!',
            score: 1,
            upvoteRatio: 1.0,
            comments: 0,
            visibility: {
                inSubreddit: false,
                inRAll: false,
                inSearch: false,
                onProfile: true
            },
            autoModTriggers: ['new_account', 'low_karma', 'self_promotion']
        },
        
        // Spam removed
        'abc444': {
            exists: true,
            removed: true,
            removedBy: 'spam',
            spam: true,
            author: 'spam_account',
            subreddit: 'technology',
            title: 'FREE BITCOIN GIVEAWAY!!!',
            score: 0,
            upvoteRatio: 0,
            comments: 0,
            visibility: {
                inSubreddit: false,
                inRAll: false,
                inSearch: false,
                onProfile: false
            }
        },
        
        // Mod removed
        'abc555': {
            exists: true,
            removed: true,
            removedBy: 'moderator',
            removedReason: 'Rule 3 violation',
            spam: false,
            author: 'healthy_redditor',
            subreddit: 'news',
            title: 'Political discussion post',
            score: 234,
            upvoteRatio: 0.67,
            comments: 456,
            visibility: {
                inSubreddit: false,
                inRAll: false,
                inSearch: false,
                onProfile: true
            }
        }
    }
};

// =============================================================================
// DEMO API RESPONSES
// =============================================================================

const DEMO_API_RESPONSES = {
    twitter: {
        // Simulated Twitter API v2 response
        userLookup: (username) => {
            const user = DEMO_USERS.twitter[username];
            if (!user) {
                return { errors: [{ detail: 'User not found' }] };
            }
            if (!user.exists) {
                return { errors: [{ detail: 'User not found' }] };
            }
            if (user.suspended) {
                return { 
                    data: { id: '123', username },
                    errors: [{ detail: 'User has been suspended' }]
                };
            }
            return {
                data: {
                    id: '123456789',
                    username: username,
                    name: username.replace('_', ' '),
                    protected: user.protected || false,
                    verified_type: user.verifiedType || 'none',
                    created_at: new Date(Date.now() - (user.accountAge || 365) * 24 * 60 * 60 * 1000).toISOString(),
                    public_metrics: {
                        followers_count: user.followers || 0,
                        following_count: user.following || 0,
                        tweet_count: user.tweets || 0,
                        listed_count: user.listed || 0
                    }
                }
            };
        },
        
        tweetLookup: (tweetId) => {
            const post = DEMO_POSTS.twitter[tweetId];
            if (!post || !post.exists) {
                return { errors: [{ detail: 'Tweet not found' }] };
            }
            if (post.tombstoned) {
                return {
                    data: { id: tweetId },
                    errors: [{ detail: post.reason || 'Tweet unavailable' }]
                };
            }
            return {
                data: {
                    id: tweetId,
                    text: post.text,
                    author_id: '123456789',
                    created_at: new Date().toISOString(),
                    public_metrics: post.metrics,
                    possibly_sensitive: post.contentFlags?.possiblySensitive || false,
                    entities: {
                        hashtags: (post.text.match(/#\w+/g) || []).map(h => ({ tag: h.slice(1) })),
                        cashtags: (post.text.match(/\$[A-Z]+/g) || []).map(c => ({ tag: c.slice(1) })),
                        urls: (post.text.match(/https?:\/\/[^\s]+/g) || []).map(u => ({ expanded_url: u })),
                        mentions: (post.text.match(/@\w+/g) || []).map(m => ({ username: m.slice(1) }))
                    }
                }
            };
        }
    },
    
    reddit: {
        userAbout: (username) => {
            const user = DEMO_USERS.reddit[username];
            if (!user || !user.exists) {
                return { error: 404, message: 'User not found' };
            }
            if (user.suspended) {
                return { error: 403, message: 'User suspended' };
            }
            if (user.shadowbanned) {
                return { error: 404, message: 'User not found' }; // Shadowban = 404
            }
            return {
                kind: 't2',
                data: {
                    name: username,
                    created_utc: Date.now() / 1000 - (user.accountAge || 365) * 24 * 60 * 60,
                    link_karma: user.linkKarma || 0,
                    comment_karma: user.commentKarma || 0,
                    total_karma: user.totalKarma || 0,
                    is_gold: user.isPremium || false,
                    has_verified_email: user.hasVerifiedEmail || false,
                    is_mod: user.isMod || false
                }
            };
        },
        
        postLookup: (postId) => {
            const post = DEMO_POSTS.reddit[postId];
            if (!post || !post.exists) {
                return { error: 404, message: 'Post not found' };
            }
            return {
                kind: 'Listing',
                data: {
                    children: [{
                        kind: 't3',
                        data: {
                            id: postId,
                            title: post.title,
                            author: post.author,
                            subreddit: post.subreddit,
                            score: post.score,
                            upvote_ratio: post.upvoteRatio,
                            num_comments: post.comments,
                            removed_by_category: post.removedBy || null,
                            spam: post.spam || false
                        }
                    }]
                }
            };
        }
    }
};

// =============================================================================
// DEMO TEST SCENARIOS
// =============================================================================

const DEMO_SCENARIOS = {
    // Pre-built test scenarios for UI presets
    heavySpam: {
        name: 'Heavy Spam Account',
        platform: 'twitter',
        username: 'spambot123',
        postId: '1234567890111',
        content: 'Follow me! #followback #f4f #teamfollowback! BUY NOW! 💰🚀🔥 Limited time! @botuser12345',
        urls: ['https://bit.ly/spam', 'https://facebook.com/page'],
        expected: {
            verdict: 'LIKELY RESTRICTED',
            minScore: 50,
            issues: ['banned_hashtags', 'link_shortener', 'throttled_domain', 'spam_content', 'risky_emojis']
        }
    },
    
    shadowbanned: {
        name: 'Shadowbanned User',
        platform: 'twitter',
        username: 'shadowbanned_user',
        postId: '1234567890222',
        content: 'Check out my article! https://substack.com/mypost #tech',
        urls: ['https://substack.com/mypost'],
        expected: {
            verdict: 'LIKELY RESTRICTED',
            minScore: 40,
            issues: ['search_ban', 'suggestion_ban', 'throttled_domain']
        }
    },
    
    ghostBanned: {
        name: 'Ghost Banned (Replies Hidden)',
        platform: 'twitter',
        username: 'ghost_banned',
        postId: '1234567890000',
        content: 'Great thread! Here are my thoughts on this topic...',
        urls: [],
        expected: {
            verdict: 'LIKELY RESTRICTED',
            minScore: 35,
            issues: ['ghost_ban', 'reply_deboosting']
        }
    },
    
    redditNewUser: {
        name: 'Reddit New Account',
        platform: 'reddit',
        username: 'newuser_promo',
        postId: 'abc333',
        content: 'Just made this project, check it out at https://bit.ly/myproject! u/spambot123',
        urls: ['https://bit.ly/myproject'],
        expected: {
            verdict: 'UNCERTAIN',
            minScore: 25,
            issues: ['new_account', 'low_karma', 'link_shortener', 'automod_filtered']
        }
    },
    
    cleanAccount: {
        name: 'Clean Healthy Account',
        platform: 'twitter',
        username: 'healthy_user',
        postId: '1234567890000',
        content: 'Just shared my thoughts on tech trends. What do you think? #tech',
        urls: [],
        expected: {
            verdict: 'CLEAR',
            maxScore: 15,
            issues: []
        }
    },
    
    cryptoSpam: {
        name: 'Crypto Spam',
        platform: 'twitter',
        username: 'crypto_spammer',
        postId: '1234567890444',
        content: '$BTC $ETH to the moon! 🚀🚀🚀 FREE CRYPTO GIVEAWAY! Double your money! #crypto #airdrop #bitcoin',
        urls: ['https://bit.ly/freecrypto'],
        expected: {
            verdict: 'RESTRICTED',
            minScore: 60,
            issues: ['crypto_spam', 'scam_patterns', 'banned_hashtags', 'risky_emojis', 'link_shortener']
        }
    },
    
    instagramBanned: {
        name: 'Instagram Hashtag Shadowban',
        platform: 'instagram',
        username: 'shadowbanned_ig',
        postId: 'ig123',
        content: 'Check out my new post! #beautyblogger #followme #likeforlike #adulting #alone',
        urls: [],
        expected: {
            verdict: 'LIKELY RESTRICTED',
            minScore: 45,
            issues: ['banned_hashtags_instagram']
        }
    },
    
    linkedinSpam: {
        name: 'LinkedIn Hashtag Abuse',
        platform: 'linkedin',
        username: 'linkedin_spammer',
        postId: 'li123',
        content: 'Excited to announce! #hiring #jobs #career #opportunity #growth #leadership #innovation #success #motivation #business',
        urls: [],
        expected: {
            verdict: 'UNCERTAIN',
            minScore: 30,
            issues: ['excessive_hashtags_linkedin']
        }
    }
};

// =============================================================================
// DEMO DATA API
// =============================================================================

const DemoData = {
    
    /**
     * Get demo user data
     * @param {string} username 
     * @param {string} platform 
     * @returns {object} User data or null
     */
    getUser: function(username, platform = 'twitter') {
        const platformUsers = DEMO_USERS[platform];
        if (!platformUsers) return null;
        
        // Exact match first
        if (platformUsers[username]) {
            return { ...platformUsers[username], username, platform };
        }
        
        // Pattern matching for demo scenarios
        const lower = username.toLowerCase();
        
        if (lower.includes('shadowban') || lower.includes('hidden')) {
            return { ...platformUsers['shadowbanned_user'] || {}, username, platform, demo: true };
        }
        if (lower.includes('ghost')) {
            return { ...platformUsers['ghost_banned'] || {}, username, platform, demo: true };
        }
        if (lower.includes('spam') || lower.includes('bot')) {
            return { ...platformUsers['spambot123'] || {}, username, platform, demo: true };
        }
        if (lower.includes('suspend')) {
            return { ...platformUsers['suspended_account'] || {}, username, platform, demo: true };
        }
        if (lower.includes('private') || lower.includes('protected')) {
            return { ...platformUsers['private_user'] || {}, username, platform, demo: true };
        }
        if (lower.includes('healthy') || lower.includes('clean') || lower.includes('good')) {
            return { ...platformUsers['healthy_user'] || {}, username, platform, demo: true };
        }
        if (lower.includes('new') || lower.includes('promo')) {
            return { ...platformUsers['newuser_promo'] || {}, username, platform, demo: true };
        }
        
        // Default: healthy user
        return { 
            ...platformUsers['healthy_user'] || { exists: true }, 
            username, 
            platform, 
            demo: true 
        };
    },
    
    /**
     * Get demo post data
     * @param {string} postId 
     * @param {string} platform 
     * @returns {object} Post data or null
     */
    getPost: function(postId, platform = 'twitter') {
        const platformPosts = DEMO_POSTS[platform];
        if (!platformPosts) return null;
        
        // Exact match first
        if (platformPosts[postId]) {
            return { ...platformPosts[postId], id: postId, platform };
        }
        
        // Pattern matching based on ID suffix
        const idStr = String(postId);
        
        if (idStr.endsWith('000')) {
            return { ...platformPosts['1234567890000'] || {}, id: postId, platform, demo: true };
        }
        if (idStr.endsWith('111')) {
            return { ...platformPosts['1234567890111'] || {}, id: postId, platform, demo: true };
        }
        if (idStr.endsWith('222')) {
            return { ...platformPosts['1234567890222'] || {}, id: postId, platform, demo: true };
        }
        if (idStr.endsWith('333')) {
            return { ...platformPosts['1234567890333'] || platformPosts['abc333'] || {}, id: postId, platform, demo: true };
        }
        if (idStr.endsWith('444')) {
            return { ...platformPosts['1234567890444'] || {}, id: postId, platform, demo: true };
        }
        if (idStr.endsWith('555')) {
            return { ...platformPosts['1234567890555'] || {}, id: postId, platform, demo: true };
        }
        
        // Default: clean post
        return { 
            exists: true, 
            tombstoned: false, 
            id: postId, 
            platform, 
            demo: true 
        };
    },
    
    /**
     * Get API response simulation
     * @param {string} endpoint 
     * @param {string} platform 
     * @param {string} id 
     * @returns {object} Simulated API response
     */
    getApiResponse: function(endpoint, platform, id) {
        const platformApi = DEMO_API_RESPONSES[platform];
        if (!platformApi || !platformApi[endpoint]) {
            return { error: 'Endpoint not found' };
        }
        return platformApi[endpoint](id);
    },
    
    /**
     * Get pre-built test scenario
     * @param {string} scenarioName 
     * @returns {object} Scenario data
     */
    getScenario: function(scenarioName) {
        return DEMO_SCENARIOS[scenarioName] || null;
    },
    
    /**
     * Get all available scenarios
     * @returns {object} All scenarios
     */
    getAllScenarios: function() {
        return { ...DEMO_SCENARIOS };
    },
    
    /**
     * Get all demo users for a platform
     * @param {string} platform 
     * @returns {object} All users
     */
    getAllUsers: function(platform = 'twitter') {
        return { ...DEMO_USERS[platform] };
    },
    
    /**
     * Get all demo posts for a platform
     * @param {string} platform 
     * @returns {object} All posts
     */
    getAllPosts: function(platform = 'twitter') {
        return { ...DEMO_POSTS[platform] };
    },
    
    /**
     * Check if running in demo mode
     * @returns {boolean}
     */
    isDemoMode: function() {
        return true; // Always true for this file
    }
};

// =============================================================================
// EXPORTS
// =============================================================================

// Browser
if (typeof window !== 'undefined') {
    window.DemoData = DemoData;
    window.DEMO_USERS = DEMO_USERS;
    window.DEMO_POSTS = DEMO_POSTS;
    window.DEMO_SCENARIOS = DEMO_SCENARIOS;
}

// Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DemoData, DEMO_USERS, DEMO_POSTS, DEMO_SCENARIOS };
}

console.log('✅ DemoData loaded');
console.log('   Scenarios:', Object.keys(DEMO_SCENARIOS).length);
console.log('   Twitter Users:', Object.keys(DEMO_USERS.twitter).length);
console.log('   Reddit Users:', Object.keys(DEMO_USERS.reddit).length);

})();
